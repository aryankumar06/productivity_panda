import { useEffect, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Task, getEisenhowerQuadrant, Quadrant, QUADRANT_LABELS } from '../lib/smart-logic';
import { CheckCircle2, Circle, MoreVertical, Plus } from 'lucide-react';

const COLORS = {
  q1: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50',
  q2: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50',
  q3: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50',
  q4: 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800',
};

export default function EisenhowerMatrix() {
  const { user } = useAuth();
  const [addingToQuadrant, setAddingToQuadrant] = useState<Quadrant | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user!.id).neq('status', 'completed');
    if (data) setTasks(data);
  };

  const handleAddTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !addingToQuadrant || !user) return;

      const today = new Date().toISOString();
      const nextWeek = new Date(); 
      nextWeek.setDate(nextWeek.getDate() + 7);

      const newTask: Partial<Task> = {
          user_id: user.id,
          title: newTaskTitle,
          status: 'todo',
          created_at: new Date().toISOString(),
      };

      // Set defaults based on Quadrant
      if (addingToQuadrant === 'q1') {
          newTask.priority = 'high';
          newTask.due_date = today;
      } else if (addingToQuadrant === 'q2') {
          newTask.priority = 'high';
          newTask.due_date = nextWeek.toISOString();
      } else if (addingToQuadrant === 'q3') {
          newTask.priority = 'low'; // or medium
          newTask.due_date = today;
      } else if (addingToQuadrant === 'q4') {
          newTask.priority = 'low';
          newTask.due_date = null;
      }

      // Optimistic update (with temp ID)
      const tempTask = { ...newTask, id: Date.now().toString() } as Task;
      setTasks(prev => [...prev, tempTask]);

      // Reset form
      setNewTaskTitle('');
      setAddingToQuadrant(null);

      // Save to DB
      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (!error && data) {
          // Replace temp task with real one
          setTasks(prev => prev.map(t => t.id === tempTask.id ? data[0] : t));
      }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
        setActiveId(null);
        return;
    }

    const taskId = active.id as string;
    const targetQuadrant = over.id as Quadrant; // The Quadrant Container ID

    // Optimistic Update
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine new properties based on Quadrant
    const updates: Partial<Task> = {};
    const today = new Date().toISOString();
    const nextWeek = new Date(); 
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Q1: Urgent (Today) & Important (High)
    if (targetQuadrant === 'q1') {
        updates.priority = 'high';
        updates.due_date = today;
    }
    // Q2: Not Urgent (>3 days) & Important (High)
    else if (targetQuadrant === 'q2') {
        updates.priority = 'high';
        updates.due_date = nextWeek.toISOString();
    }
    // Q3: Urgent (Today) & Not Important (Low)
    else if (targetQuadrant === 'q3') {
        updates.priority = 'low';
        updates.due_date = today;
    }
    // Q4: Not Urgent & Not Important (Low)
    else if (targetQuadrant === 'q4') {
        updates.priority = 'low';
        updates.due_date = null; // No deadline
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    setActiveId(null);

    // Persist
    await supabase.from('tasks').update(updates).eq('id', taskId);
  };

  // Helper to render a quadrant
  const renderQuadrant = (id: Quadrant, title: string) => {
    const quadrantTasks = tasks.filter(t => getEisenhowerQuadrant(t) === id);

    return (
      <div 
        key={id}
        id={id} // This is the drop target
        className={`flex flex-col h-full rounded-2xl border-2 p-4 ${COLORS[id]} transition-colors group/container`}
      >
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex justify-between items-center">
            {title}
            <div className="flex items-center gap-2">
                <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded text-sm">{quadrantTasks.length}</span>
                <button 
                    onClick={() => { setAddingToQuadrant(id); setTimeout(() => document.getElementById(`input-${id}`)?.focus(), 50); }}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </h3>
        <div className="flex-1 space-y-3">
             {/* Inline Add Form */}
             {addingToQuadrant === id && (
                 <form onSubmit={handleAddTask} className="mb-3 animate-in fade-in zoom-in-95 duration-200">
                     <input 
                        id={`input-${id}`}
                        type="text" 
                        placeholder="Add task..." 
                        className="w-full px-3 py-2 rounded-xl border border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:bg-neutral-800 dark:text-white"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onBlur={() => !newTaskTitle && setAddingToQuadrant(null)}
                         autoFocus
                     />
                 </form>
             )}

             {quadrantTasks.map(task => (
                 <DraggableTask key={task.id} task={task} />
             ))}
             {quadrantTasks.length === 0 && !addingToQuadrant && (
                 <div className="h-20 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl flex items-center justify-center text-sm text-gray-400">
                    Drop task or click +
                 </div>
             )}
        </div>
      </div>
    );
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)] min-h-[600px]">
         {renderQuadrant('q1', "Do (Urgent & Important)")}
         {renderQuadrant('q2', "Schedule (Important, Not Urgent)")}
         {renderQuadrant('q3', "Delegate (Urgent, Not Important)")}
         {renderQuadrant('q4', "Delete (Neither)")}
      </div>
      <DragOverlay>
        {activeId ? (
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-blue-500 shadow-xl opacity-90 rotate-3 cursor-grabbing">
                 {(() => {
                    const t = tasks.find(x => x.id === activeId);
                    return t ? t.title : 'Task';
                 })()}
            </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

import { useDraggable } from '@dnd-kit/core';

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...listeners} 
        {...attributes}
        className="bg-white dark:bg-neutral-800 p-3 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm cursor-grab hover:border-blue-400 transition-colors group"
    >
        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{task.title}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
             {task.due_date && <span>Due {new Date(task.due_date).toLocaleDateString()}</span>}
        </div>
    </div>
  );
}
