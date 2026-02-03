import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, CheckSquare, Clock, AlertCircle, Circle, Trash2, Edit2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '../lib/database.types';
import TaskPlan from './ui/task-plan';

type Task = Database['public']['Tables']['tasks']['Row'];

// AgentTask type for plan view
interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'need-help' | 'failed';
  priority: 'low' | 'medium' | 'high';
  level: number;
  dependencies: string[];
  subtasks: any[];
  due_date?: string | null;
}

interface TaskSectionProps {
  selectedDate: string;
}

// Helper to convert database task status to AgentTask status
const mapDbStatusToAgentStatus = (status: Task['status']): AgentTask['status'] => {
  switch (status) {
    case 'completed': return 'completed';
    case 'in_progress': return 'in-progress';
    case 'todo': return 'pending';
    default: return 'pending';
  }
};

// Helper to convert AgentTask status back to database status
const mapAgentStatusToDbStatus = (status: AgentTask['status']): Task['status'] => {
  switch (status) {
    case 'completed': return 'completed';
    case 'in-progress': return 'in_progress';
    case 'pending':
    case 'need-help':
    case 'failed':
    default: return 'todo';
  }
};

// Helper to convert database priority to AgentTask priority
const mapDbPriorityToAgentPriority = (priority: Task['priority']): AgentTask['priority'] => {
  return priority as AgentTask['priority'];
};

export default function TaskSection({ selectedDate }: TaskSectionProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'completed',
    due_date: selectedDate
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'plan'>('plan');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }

    const handleOpenModal = () => setShowForm(true);
    window.addEventListener('open-task-modal', handleOpenModal);
    return () => window.removeEventListener('open-task-modal', handleOpenModal);
  }, [user, selectedDate]);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    const { data: dataRaw, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const data = dataRaw as Task[] | null;

    if (error) {
      setErrorMsg(error.message);
    } else {
      setTasks(data || []);
      setErrorMsg('');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTask) {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
          completed_at: formData.status === 'completed' ? new Date().toISOString() : null
        } as Database['public']['Tables']['tasks']['Update'])
        .eq('id', editingTask.id);

      if (error) {
        setErrorMsg(error.message);
      } else {
        await fetchTasks();
        resetForm();
        setErrorMsg('');
      }
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...formData,
          user_id: user!.id
        } as Database['public']['Tables']['tasks']['Insert']]);

      if (error) {
        setErrorMsg(error.message);
      } else {
        await fetchTasks();
        resetForm();
        setErrorMsg('');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: selectedDate
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || selectedDate
    });
    setShowForm(true);
  };

  const handleAgentTaskEdit = (agentTask: AgentTask) => {
    const originalTask = tasks.find(t => t.id === agentTask.id);
    if (originalTask) {
      handleEdit(originalTask);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      await fetchTasks();
      setErrorMsg('');
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      } as Database['public']['Tables']['tasks']['Update'])
      .eq('id', task.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      await fetchTasks();
      setErrorMsg('');
    }
  };

  const handleAgentTaskUpdate = async (taskId: string, updates: Partial<AgentTask>) => {
    if (updates.status) {
      const dbStatus = mapAgentStatusToDbStatus(updates.status);
      const { error } = await supabase
        .from('tasks')
        .update({
          status: dbStatus,
          completed_at: dbStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        } as Database['public']['Tables']['tasks']['Update'])
        .eq('id', taskId);

      if (error) {
        setErrorMsg(error.message);
      } else {
        await fetchTasks();
        setErrorMsg('');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-neutral-800/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Circle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Convert database tasks to AgentTask format for the plan view
  const convertToAgentTasks = (dbTasks: Task[]): AgentTask[] => {
    // Group tasks by date
    const groupedByDate: { [date: string]: Task[] } = {};
    
    dbTasks.forEach(task => {
      const date = task.due_date || 'no-date';
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(task);
    });

    // Convert each task to AgentTask format
    // Tasks on the same day can be linked as parent/subtask or shown independently
    return dbTasks.map((task): AgentTask => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: mapDbStatusToAgentStatus(task.status),
      priority: mapDbPriorityToAgentPriority(task.priority),
      level: 0,
      dependencies: [],
      subtasks: [], // Could be populated if you have subtasks in your database
      due_date: task.due_date,
    }));
  };

  const todayTasks = tasks.filter(t => t.due_date === selectedDate);
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < selectedDate && t.status !== 'completed');
  const upcomingTasks = tasks.filter(t => t.due_date && t.due_date > selectedDate);
  const noDateTasks = tasks.filter(t => !t.due_date);

  // Prepare tasks for plan view (combine all relevant tasks)
  const planViewTasks = convertToAgentTasks([
    ...overdueTasks,
    ...todayTasks,
    ...upcomingTasks.slice(0, 5), // Show next 5 upcoming
    ...noDateTasks.slice(0, 5), // Show 5 without date
  ]);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tasks</h2>
          
          {/* View Mode Toggle - Simplified and explicit */}
          <div className="flex items-center ml-2 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 border border-gray-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('plan')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === 'plan' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Plan
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Close Form' : 'Add Task'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.form 
            onSubmit={handleSubmit} 
            className="mb-6 p-4 bg-gray-50 dark:bg-neutral-900/30 rounded-lg space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'todo' | 'in_progress' | 'completed' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading tasks...</div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'plan' ? (
            <motion.div
              key="plan-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TaskPlan
                tasks={planViewTasks}
                onTaskUpdate={handleAgentTaskUpdate}
                onTaskDelete={handleDelete}
                onTaskEdit={handleAgentTaskEdit}
                showActions={true}
                emptyMessage="No tasks yet. Create your first task to get started!"
                className="border-0 shadow-none bg-transparent dark:bg-transparent"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list-view"
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {overdueTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-600 mb-3">Overdue</h3>
                  <div className="space-y-2">
                    {overdueTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleStatus}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getPriorityColor={getPriorityColor}
                        getPriorityIcon={getPriorityIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {todayTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Today</h3>
                  <div className="space-y-2">
                    {todayTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleStatus}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getPriorityColor={getPriorityColor}
                        getPriorityIcon={getPriorityIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {upcomingTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming</h3>
                  <div className="space-y-2">
                    {upcomingTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleStatus}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getPriorityColor={getPriorityColor}
                        getPriorityIcon={getPriorityIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {noDateTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">No Due Date</h3>
                  <div className="space-y-2">
                    {noDateTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleStatus}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getPriorityColor={getPriorityColor}
                        getPriorityIcon={getPriorityIcon}
                      />
                    ))}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks yet. Create your first task to get started!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}


interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  getPriorityColor,
  getPriorityIcon
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityIcon: (priority: string) => React.ReactNode;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
     const stored = localStorage.getItem(`comments-${task.id}`);
     if (stored) {
         const parsed = JSON.parse(stored);
         setComments(parsed);
         setCommentCount(parsed.length);
     }
  }, [task.id]);

  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      const comment: Comment = {
          id: Date.now().toString(),
          userId: 'current-user',
          userName: 'You',
          content: newComment,
          timestamp: new Date().toISOString()
      };

      const updated = [...comments, comment];
      setComments(updated);
      setCommentCount(updated.length);
      setNewComment('');
      localStorage.setItem(`comments-${task.id}`, JSON.stringify(updated));
  };

  return (
    <motion.div 
      className={`p-4 border rounded-xl transition-all ${task.status === 'completed' ? 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:border-blue-300'}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className="mt-1 flex-shrink-0"
        >
          {task.status === 'completed' ? (
            <motion.div 
              className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <CheckSquare className="w-4 h-4 text-white" />
            </motion.div>
          ) : (
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-neutral-700 rounded hover:border-blue-600 transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
              {task.priority}
            </span>
            {task.due_date && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.due_date + 'T00:00:00').toLocaleDateString()}
              </span>
            )}
            <button 
                onClick={() => setShowComments(!showComments)}
                className="text-xs text-gray-500 hover:text-blue-500 flex items-center gap-1 transition-colors"
                title="View Comments"
            >
                <MessageSquare className="w-3 h-3" />
                {commentCount > 0 ? `${commentCount} comments` : 'Comment'}
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div 
                className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-neutral-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-3 mb-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{comment.userName}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{comment.content}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button type="submit" disabled={!newComment.trim()} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg disabled:opacity-50">
                    Post
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
