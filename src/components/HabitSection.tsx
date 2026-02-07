import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Target, Activity, Check, Trash2, Edit2, RotateCcw, Calendar, FileText, Moon, Zap } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '../lib/database.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

interface HabitSectionProps {
  selectedDate: string;
}

export default function HabitSection({ selectedDate }: HabitSectionProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Calculate week dates based on selectedDate
  const dateObj = selectedDate ? parseISO(selectedDate) : new Date();
  const startDate = startOfWeek(dateObj, { weekStartsOn: 1 }); // Monday start
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      setLoading(false);
      return;
    }

    const { data: completionsData, error: completionsError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);
      
    if (completionsError) {
       console.error('Error fetching completions:', completionsError);
    }

    setHabits(habitsData || []);
    setCompletions(completionsData || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits, selectedDate]);

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return completions.some(c => c.habit_id === habitId && c.completed_date === dateStr);
  };

  const toggleCompletion = async (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completed = isCompleted(habitId, date);

    if (completed) {
      setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.completed_date === dateStr)));
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', dateStr);
    } else {
      const newCompletion = {
        habit_id: habitId,
        user_id: user!.id,
        completed_date: dateStr,
        created_at: new Date().toISOString()
      } as HabitCompletion;

      setCompletions(prev => [...prev, newCompletion]);
      await supabase
        .from('habit_completions')
        .insert([{
          habit_id: habitId,
          user_id: user!.id,
          completed_date: dateStr
        }]);
    }
  };

  const handleReset = async () => {
     if (!window.confirm('Are you sure you want to clear all completions for this week?')) return;
     
     const datesToDelete = weekDates.map(d => format(d, 'yyyy-MM-dd'));
     
     setCompletions(prev => prev.filter(c => !datesToDelete.includes(c.completed_date)));

     await supabase
        .from('habit_completions')
        .delete()
        .in('completed_date', datesToDelete)
        .eq('user_id', user!.id);
  };

  const calculateColumnTotal = (habitId: string) => {
    const weekDateStrings = weekDates.map(d => format(d, 'yyyy-MM-dd'));
    return completions.filter(c => c.habit_id === habitId && weekDateStrings.includes(c.completed_date)).length;
  };
  
  const calculateTotalChecked = () => {
     const weekDateStrings = weekDates.map(d => format(d, 'yyyy-MM-dd'));
     return completions.filter(c => weekDateStrings.includes(c.completed_date)).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHabit) {
      const { error } = await supabase
        .from('habits')
        .update({ ...formData })
        .eq('id', editingHabit.id);
      if (!error) fetchHabits();
    } else {
      const { error } = await supabase
        .from('habits')
        .insert([{ ...formData, user_id: user!.id }]);
        
      if (!error) fetchHabits();
    }
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({ name: '', description: '', frequency: 'daily', target_days: 7, color: '#3b82f6' });
    setEditingHabit(null);
    setShowForm(false);
  };

  const deleteHabit = async (id: string) => {
      if(!confirm('Delete habit?')) return;
      await supabase.from('habits').delete().eq('id', id);
      fetchHabits();
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Weekly Habit Tracker</h2>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Target className="w-3 h-3" /> Daily Habits
                    </span>
                    <span className="text-xs text-gray-500 underline decoration-dotted">
                        {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
                    </span>
                 </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                title="Reset Week"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
            <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
                <Plus className="w-4 h-4" />
                <span>New</span>
            </button>
        </div>
      </div>

      {/* Habit Form Modal */}
      <AnimatePresence>
        {showForm && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => resetForm()}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-neutral-700"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-800/50">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {editingHabit ? 'Edit Habit' : 'New Habit'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                             <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Read 30 mins"
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                             <div className="flex gap-2 flex-wrap">
                                 {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'].map(c => (
                                     <button
                                         key={c}
                                         type="button"
                                         onClick={() => setFormData({...formData, color: c})}
                                         className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                                         style={{ backgroundColor: c }}
                                     />
                                 ))}
                             </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">Save Habit</button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-700">
        <div className="min-w-[800px] h-full flex flex-col">
            {/* Table Header */}
            <div className={`grid border-b border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-[#1a1a1a]`} 
                 style={{ gridTemplateColumns: `200px repeat(${Math.max(1, habits.length)}, minmax(120px, 1fr))` }}>
                <div className="p-4 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Day</span>
                </div>
                {habits.length === 0 ? (
                    <div className="p-4 text-sm text-gray-400 italic">No habits added</div>
                ) : (
                    habits.map(habit => (
                        <div key={habit.id} className="p-4 flex items-center justify-between group border-l border-gray-200 dark:border-neutral-800/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                 {habit.name.toLowerCase().includes('sleep') ? <Moon className="w-4 h-4" style={{ color: habit.color }} /> :
                                  habit.name.toLowerCase().includes('workout') || habit.name.toLowerCase().includes('run') ? <Activity className="w-4 h-4" style={{ color: habit.color }} /> :
                                  <Zap className="w-4 h-4" style={{ color: habit.color }} />
                                 }
                                 <span className="font-medium text-gray-900 dark:text-gray-100 truncate" title={habit.name}>{habit.name}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onClick={() => { setEditingHabit(habit); setFormData({...habit}); setShowForm(true); }} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-400">
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                 <button 
                                    onClick={() => deleteHabit(habit.id)} 
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Table Body - Days */}
            <div className="flex-1 divide-y divide-gray-100 dark:divide-neutral-800/50">
                {weekDates.map((date) => {
                    const isToday = isSameDay(date, new Date());
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                        <div key={dateStr} 
                             className={`grid bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                             style={{ gridTemplateColumns: `200px repeat(${Math.max(1, habits.length)}, minmax(120px, 1fr))` }}
                        >
                            <div className="p-4 flex items-center gap-3">
                                <FileText className={`w-4 h-4 ${isToday ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {format(date, 'eeee')}
                                </span>
                                {isToday && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 rounded">Today</span>}
                            </div>
                            {habits.map(habit => {
                                const checked = isCompleted(habit.id, date);
                                return (
                                    <div key={`${habit.id}-${dateStr}`} className="border-l border-gray-100 dark:border-neutral-800/50 flex items-center justify-center p-2">
                                        <button
                                            onClick={() => toggleCompletion(habit.id, date)}
                                            className={`w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 ${
                                                checked 
                                                ? 'bg-blue-500 border-blue-500 text-white scale-110' 
                                                : 'border-gray-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-400 bg-transparent'
                                            }`}
                                        >
                                            {checked && <Check className="w-4 h-4 stroke-[3]" />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Footer / Totals */}
            <div className={`grid border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#1a1a1a]`}
                  style={{ gridTemplateColumns: `200px repeat(${Math.max(1, habits.length)}, minmax(120px, 1fr))` }}>
                 <div className="p-4 flex items-center gap-2">
                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">+ New Page</span>
                 </div>
                 {habits.map(habit => (
                     <div key={habit.id} className="p-4 text-center border-l border-gray-200 dark:border-neutral-800/50">
                         <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            {calculateColumnTotal(habit.id)}
                         </span>
                     </div>
                 ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-neutral-800 flex justify-end items-center gap-8 text-sm text-gray-500 dark:text-gray-400 pr-8 bg-white dark:bg-[#1a1a1a]">
                <span>TOTAL CHECKED <span className="text-gray-900 dark:text-gray-100 font-bold ml-1">{calculateTotalChecked()}</span></span>
            </div>
        </div>
      </div>
    </div>
  );
}
