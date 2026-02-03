import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  CircleDashed,
  XCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// Database types
interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  item_type: 'project' | 'task' | 'subtask';
  parent_id: string | null;
  level: number;
  dependencies: string[];
  due_date: string | null;
  created_at: string;
}

export default function Plan() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('project_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const statuses = ["pending", "in-progress", "completed", "need-help", "failed"];
    const currentIndex = statuses.indexOf(currentStatus);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];

    const { error } = await supabase
      .from('projects')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (!error) {
      fetchProjects();
    }
  };

  const addTask = async (projectId: string) => {
    if (!newItemTitle.trim() || !user) return;

    const { error } = await supabase
      .from('projects')
      .insert([{
        title: newItemTitle,
        user_id: user.id,
        parent_id: projectId,
        item_type: 'task',
        level: 1,
        status: 'pending',
        priority: 'medium',
      }]);

    if (!error) {
      setNewItemTitle('');
      setAddingTaskTo(null);
      fetchProjects();
      setExpandedItems(prev => new Set(prev).add(projectId));
    }
  };

  const addSubtask = async (taskId: string) => {
    if (!newItemTitle.trim() || !user) return;

    const { error } = await supabase
      .from('projects')
      .insert([{
        title: newItemTitle,
        user_id: user.id,
        parent_id: taskId,
        item_type: 'subtask',
        level: 2,
        status: 'pending',
        priority: 'medium',
      }]);

    if (!error) {
      setNewItemTitle('');
      setAddingSubtaskTo(null);
      fetchProjects();
      setExpandedItems(prev => new Set(prev).add(taskId));
    }
  };

  // Build hierarchy
  const buildHierarchy = () => {
    const projectsOnly = projects.filter(p => p.item_type === 'project' && !p.parent_id);
    
    return projectsOnly.map(project => ({
      ...project,
      tasks: projects
        .filter(t => t.parent_id === project.id && t.item_type === 'task')
        .map(task => ({
          ...task,
          subtasks: projects.filter(s => s.parent_id === task.id && s.item_type === 'subtask')
        }))
    }));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchProjects();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <CircleDashed className="h-5 w-5 text-blue-500" />;
      case 'need-help':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'need-help': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'failed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'pending': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'high': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      'medium': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      'low': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading projects...</div>
      </div>
    );
  }

  const hierarchy = buildHierarchy();

  if (hierarchy.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No projects yet. Create your first project to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <LayoutGroup>
        <div className="space-y-4">
          {hierarchy.map((project) => {
            const isExpanded = expandedItems.has(project.id);
            const hasChildren = project.tasks.length > 0;

            return (
              <motion.div
                key={project.id}
                layout
                className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 bg-gray-50 dark:bg-neutral-900/50"
              >
                {/* PROJECT LEVEL */}
                <div className="flex items-center gap-3">
                  {/* Expand/Collapse */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  )}

                  {/* Status Icon - Animated */}
                  <motion.button
                    onClick={() => toggleStatus(project.id, project.status)}
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={project.status}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ 
                          opacity: 1, 
                          scale: project.status === 'completed' ? [0.5, 1.2, 1] : 1,
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{
                          duration: project.status === 'completed' ? 0.4 : 0.15,
                          ease: project.status === 'completed' ? 'easeOut' : 'easeInOut',
                        }}
                      >
                        {getStatusIcon(project.status)}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(project.priority)}`}>
                      {project.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteItem(project.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Add Task Button */}
                  <button
                    onClick={() => setAddingTaskTo(project.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Task
                  </button>
                </div>

                {/* Add Task Form */}
                <AnimatePresence>
                  {addingTaskTo === project.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 ml-8"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addTask(project.id);
                            if (e.key === 'Escape') setAddingTaskTo(null);
                          }}
                          placeholder="Task title..."
                          className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => addTask(project.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingTaskTo(null)}
                          className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* TASKS */}
                <AnimatePresence>
                  {isExpanded && project.tasks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 ml-8 space-y-2"
                    >
                      {project.tasks.map((task) => {
                        const isTaskExpanded = expandedItems.has(task.id);
                        const hasSubtasks = task.subtasks.length > 0;

                        return (
                          <div key={task.id} className="border-l-2 border-gray-300 dark:border-neutral-600 pl-4">
                            <div className="flex items-center gap-3 py-2">
                              {/* Expand/Collapse */}
                              {hasSubtasks && (
                                <button
                                  onClick={() => toggleExpand(task.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {isTaskExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              )}

                              {/* Status Icon - Animated */}
                              <motion.button
                                onClick={() => toggleStatus(task.id, task.status)}
                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                              >
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={task.status}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ 
                                      opacity: 1, 
                                      scale: task.status === 'completed' ? [0.5, 1.2, 1] : 1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{
                                      duration: task.status === 'completed' ? 0.4 : 0.15,
                                      ease: task.status === 'completed' ? 'easeOut' : 'easeInOut',
                                    }}
                                  >
                                    {getStatusIcon(task.status)}
                                  </motion.div>
                                </AnimatePresence>
                              </motion.button>

                              {/* Title */}
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-900 dark:text-gray-100">{task.title}</span>
                              </div>

                              {/* Badges */}
                              <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(task.status)}`}>
                                {task.status}
                              </span>

                              {/* Delete Button */}
                              <button
                                onClick={() => deleteItem(task.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Add Subtask Button */}
                              <button
                                onClick={() => setAddingSubtaskTo(task.id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md"
                              >
                                <Plus className="w-3 h-3" />
                                Subtask
                              </button>
                            </div>

                            {/* Add Subtask Form */}
                            <AnimatePresence>
                              {addingSubtaskTo === task.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 ml-6"
                                >
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={newItemTitle}
                                      onChange={(e) => setNewItemTitle(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') addSubtask(task.id);
                                        if (e.key === 'Escape') setAddingSubtaskTo(null);
                                      }}
                                      placeholder="Subtask title..."
                                      className="flex-1 px-3 py-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md text-sm"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => addSubtask(task.id)}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => setAddingSubtaskTo(null)}
                                      className="px-3 py-1 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* SUBTASKS */}
                            <AnimatePresence>
                              {isTaskExpanded && task.subtasks.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 ml-6 space-y-1"
                                >
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="flex items-center gap-3 py-1">
                                      <motion.button
                                        onClick={() => toggleStatus(subtask.id, subtask.status)}
                                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                      >
                                        <AnimatePresence mode="wait">
                                          <motion.div
                                            key={subtask.status}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ 
                                              opacity: 1, 
                                              scale: subtask.status === 'completed' ? [0.5, 1.2, 1] : 1,
                                            }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{
                                              duration: subtask.status === 'completed' ? 0.4 : 0.15,
                                              ease: subtask.status === 'completed' ? 'easeOut' : 'easeInOut',
                                            }}
                                          >
                                            {subtask.status === 'completed' ? (
                                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <Circle className="h-4 w-4 text-gray-400" />
                                            )}
                                          </motion.div>
                                        </AnimatePresence>
                                      </motion.button>
                                      <span className={`flex-1 text-sm ${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {subtask.title}
                                      </span>
                                      <button
                                        onClick={() => deleteItem(subtask.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        title="Delete subtask"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
