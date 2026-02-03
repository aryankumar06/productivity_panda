import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Plan from './ui/agent-plan';

export default function DittoDashboard() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddProject = async () => {
    if (!newProjectTitle.trim() || !user) return;

    const { error } = await supabase
      .from('projects')
      .insert([{
        title: newProjectTitle,
        description: newProjectDescription,
        priority: newProjectPriority,
        status: 'pending',
        user_id: user.id,
        item_type: 'project',
        level: 0,
        parent_id: null,
      }]);

    if (!error) {
      setNewProjectTitle('');
      setNewProjectDescription('');
      setNewProjectPriority('medium');
      setShowAddForm(false);
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Add Project Button - No duplicate heading */}
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {/* Add Project Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddProject();
                      }
                    }}
                    placeholder="Enter project title..."
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Enter project description..."
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewProjectPriority(priority)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          newProjectPriority === priority
                            ? priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-neutral-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddProject}
                    disabled={!newProjectTitle.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List */}
      <Plan key={refreshKey} />
    </div>
  );
}
