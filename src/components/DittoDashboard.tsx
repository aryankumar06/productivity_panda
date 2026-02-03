import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Plan from './ui/agent-plan';

export default function DittoDashboard() {
  const { user } = useAuth();
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProject = async () => {
    if (!newProjectTitle.trim() || !user) return;

    setIsAdding(true);
    const { error } = await supabase
      .from('projects')
      .insert([{
        title: newProjectTitle,
        user_id: user.id,
        item_type: 'project',
        level: 0,
        parent_id: null,
        status: 'pending',
        priority: 'medium',
      }]);

    if (!error) {
      setNewProjectTitle('');
      // Trigger refresh by forcing re-render of Plan component
      window.location.reload();
    }
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Project Section */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={newProjectTitle}
          onChange={(e) => setNewProjectTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddProject();
          }}
          placeholder="New project title..."
          className="flex-1 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddProject}
          disabled={isAdding || !newProjectTitle.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isAdding ? 'Adding...' : 'Add Project'}
        </button>
      </div>

      {/* Projects Plan View */}
      <Plan />
    </div>
  );
}
