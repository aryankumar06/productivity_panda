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
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { Database } from '../../lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];

// Type definitions for tasks
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
  due_date?: string | null;
}

interface TaskPlanProps {
  tasks: AgentTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<AgentTask>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: AgentTask) => void;
  showActions?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function TaskPlan({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  showActions = false,
  emptyMessage = "No tasks yet.",
  className = ""
}: TaskPlanProps) {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});

  const prefersReducedMotion = 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !onTaskUpdate) return;

    const statuses = ["pending", "in-progress", "completed", "need-help", "failed"];
    const currentIndex = statuses.indexOf(task.status);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];

    onTaskUpdate(taskId, { status: newStatus });
  };

  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    // Subtask toggle logic if needed
  };

  const taskVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : -5 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 500, 
        damping: 30,
      }
    },
  };

  const subtaskListVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      }
    },
  };

  const subtaskVariants = {
    hidden: { 
      opacity: 0, 
      x: prefersReducedMotion ? 0 : -10 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 500, 
        damping: 25,
      }
    },
  };

  if (tasks.length === 0) {
    return (
      <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <LayoutGroup>
        <div className="overflow-hidden">
          <ul className="space-y-1 overflow-hidden">
            {tasks.map((task, index) => {
              const isExpanded = expandedTasks.includes(task.id);
              const isCompleted = task.status === "completed";

              return (
                <motion.li
                  key={task.id}
                  className={`${index !== 0 ? "mt-1 pt-2" : ""}`}
                  initial="hidden"
                  animate="visible"
                  variants={taskVariants}
                >
                  <motion.div 
                    className="group flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    {task.subtasks.length > 0 && (
                      <button
                        onClick={() => toggleTaskExpansion(task.id)}
                        className="mr-1 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <motion.div
                      className="mr-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskStatus(task.id);
                      }}
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
                          {task.status === "completed" ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                          ) : task.status === "in-progress" ? (
                            <CircleDashed className="h-4.5 w-4.5 text-blue-500" />
                          ) : task.status === "need-help" ? (
                            <AlertCircle className="h-4.5 w-4.5 text-yellow-500" />
                          ) : task.status === "failed" ? (
                            <XCircle className="h-4.5 w-4.5 text-red-500" />
                          ) : (
                            <Circle className="text-gray-400 dark:text-gray-500 h-4.5 w-4.5" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      <div className="mr-2 flex-1 min-w-0">
                        <span
                          className={`font-medium truncate block ${
                            isCompleted 
                              ? "text-gray-500 dark:text-gray-400 line-through" 
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && !isExpanded && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                            {task.description}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2 text-xs">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            task.priority === 'high'
                              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                              : task.priority === 'medium'
                                ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                          }`}
                        >
                          {task.priority}
                        </span>

                        <motion.span
                          className={`rounded px-1.5 py-0.5 ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : task.status === "in-progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : task.status === "need-help"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : task.status === "failed"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                          key={task.status}
                        >
                          {task.status}
                        </motion.span>
                      </div>
                    </motion.div>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {isExpanded && task.subtasks.length > 0 && (
                      <motion.div 
                        className="relative overflow-hidden"
                        variants={subtaskListVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout
                      >
                        <div className="absolute top-0 bottom-0 left-[28px] border-l-2 border-dashed border-gray-200 dark:border-neutral-600" />
                        <ul className="mt-1 mr-2 mb-1.5 ml-6 space-y-0.5">
                          {task.subtasks.map((subtask) => {
                            const subtaskKey = `${task.id}-${subtask.id}`;

                            return (
                              <motion.li
                                key={subtask.id}
                                className="flex flex-col py-0.5 pl-6"
                                variants={subtaskVariants}
                                initial="hidden"
                                animate="visible"
                                layout
                              >
                                <motion.div 
                                  className="flex flex-1 items-center rounded-md p-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                                  layout
                                >
                                  <motion.div
                                    className="mr-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubtaskStatus(task.id, subtask.id);
                                    }}
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
                                        {subtask.status === "completed" ? (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                          <Circle className="text-gray-400 dark:text-gray-500 h-3.5 w-3.5" />
                                        )}
                                      </motion.div>
                                    </AnimatePresence>
                                  </motion.div>

                                  <span
                                    className={`text-sm ${
                                      subtask.status === "completed" 
                                        ? "text-gray-500 dark:text-gray-400 line-through" 
                                        : "text-gray-700 dark:text-gray-200"
                                    }`}
                                  >
                                    {subtask.title}
                                  </span>
                                </motion.div>
                              </motion.li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </LayoutGroup>
    </div>
  );
}
