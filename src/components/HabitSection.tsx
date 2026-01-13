import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Target, Flame, Check, Trash2, Edit2 } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

interface HabitSectionProps {
  selectedDate: string;
}

interface HabitWithStats extends Habit {
  completions: HabitCompletion[];
  currentStreak: number;
  isCompletedToday: boolean;
}

export default function HabitSection({ selectedDate }: HabitSectionProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly',
    target_days: 7,
    color: '#3b82f6'
  });

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user, selectedDate]);

  const fetchHabits = async () => {
    setLoading(true);

    const { data: habitsDataRaw, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    const habitsData = habitsDataRaw as Habit[] | null;

    if (habitsError || !habitsData) {
      setLoading(false);
      return;
    }

    const { data: completionsDataRaw } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user!.id)
      .order('completed_date', { ascending: false });
    const completionsData = completionsDataRaw as HabitCompletion[] | null;

    const habitsWithStats = habitsData.map(habit => {
      const habitCompletions = (completionsData || []).filter(c => c.habit_id === habit.id);
      const currentStreak = calculateStreak(habitCompletions, selectedDate);
      const isCompletedToday = habitCompletions.some(c => c.completed_date === selectedDate);

      return {
        ...habit,
        completions: habitCompletions,
        currentStreak,
        isCompletedToday
      };
    });

    setHabits(habitsWithStats);
    setLoading(false);
  };

  const calculateStreak = (completions: HabitCompletion[], currentDate: string): number => {
    if (completions.length === 0) return 0;

    const sortedDates = completions
      .map(c => c.completed_date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const checkDate = new Date(currentDate + 'T00:00:00');

    for (const dateStr of sortedDates) {
      const completionDate = new Date(dateStr + 'T00:00:00');
      const daysDiff = Math.floor((checkDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (daysDiff === 1) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingHabit) {
      const { error } = await supabase
        .from('habits')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        } as Database['public']['Tables']['habits']['Update'])
        .eq('id', editingHabit.id);

      if (!error) {
        await fetchHabits();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('habits')
        .insert([{
          ...formData,
          user_id: user!.id
        } as Database['public']['Tables']['habits']['Insert']]);

      if (!error) {
        await fetchHabits();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      target_days: 7,
      color: '#3b82f6'
    });
    setEditingHabit(null);
    setShowForm(false);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      target_days: habit.target_days,
      color: habit.color
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchHabits();
    }
  };

  const toggleCompletion = async (habit: HabitWithStats) => {
    if (habit.isCompletedToday) {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habit.id)
        .eq('completed_date', selectedDate);

      if (!error) {
        await fetchHabits();
      }
    } else {
      const { error } = await supabase
        .from('habit_completions')
        .insert([{
          habit_id: habit.id,
          user_id: user!.id,
          completed_date: selectedDate
        } as Database['public']['Tables']['habit_completions']['Insert']]);

      if (!error) {
        await fetchHabits();
      }
    }
  };

  const getWeekProgress = (habit: HabitWithStats) => {
    const weekStart = new Date(selectedDate + 'T00:00:00');
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    return weekDates.map(date => ({
      date,
      completed: habit.completions.some(c => c.completed_date === date)
    }));
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Habits
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-neutral-900/30 rounded-lg space-y-4">
          <input
            type="text"
            placeholder="Habit name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {editingHabit ? 'Update Habit' : 'Create Habit'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading habits...</div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => (
            <div
              key={habit.id}
              className="p-4 border rounded-lg hover:border-blue-300 transition-all"
              style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h4>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{habit.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-800 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-800 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${habit.currentStreak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-neutral-600'}`} />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {habit.currentStreak} day streak
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleCompletion(habit)}
                  className={`p-2 rounded-lg transition-all ${
                    habit.isCompletedToday
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-neutral-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-1">
                {getWeekProgress(habit).map(({ date, completed }) => (
                  <div
                    key={date}
                    className={`flex-1 h-2 rounded ${
                      completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-neutral-700'
                    }`}
                    title={date}
                  />
                ))}
              </div>
            </div>
          ))}

          {habits.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No habits yet. Create your first habit to start tracking!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
