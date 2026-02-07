import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Filter, ArrowUpDown, Zap, Search, Maximize2, Settings, Minimize2,
  ChevronDown, Circle, Dumbbell, Brain, Moon, PenLine, 
  BookOpen, Plus, MoreHorizontal, FileText, Activity, Heart,
  Check, Trash2, Edit2, X
} from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { format, startOfWeek, addDays, isSameDay, parseISO, isWeekend } from 'date-fns';
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
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // New State for Functionality
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'name'>('default');
  const [hideWeekends, setHideWeekends] = useState(false);
  
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
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startDate, i)), [startDate]);

  const fetchHabits = useCallback(async () => {
    if (!user) return;

    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const { data: completionsData } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);

    setHabits(habitsData || []);
    setCompletions(completionsData || []);
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

    // Optimistic UI Update
    if (completed) {
      setCompletions(prev => prev.filter(c => !(c.habit_id === habitId && c.completed_date === dateStr)));
      await supabase.from('habit_completions').delete().eq('habit_id', habitId).eq('completed_date', dateStr);
    } else {
      const newCompletion = {
        habit_id: habitId,
        user_id: user!.id,
        completed_date: dateStr,
        created_at: new Date().toISOString()
      } as HabitCompletion;
      setCompletions(prev => [...prev, newCompletion]);
      await supabase.from('habit_completions').insert([{ habit_id: habitId, user_id: user!.id, completed_date: dateStr }]);
    }
  };

  // Quick Action: Complete all for today
  const completeAllForToday = async () => {
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    if (!user) return;

    const newCompletions: HabitCompletion[] = [];
    
    // Find habits not yet completed today
    const habitsToComplete = habits.filter(h => !isCompleted(h.id, today));

    if (habitsToComplete.length === 0) return; // All done

    const insertPayload = habitsToComplete.map(h => {
        const item = {
            habit_id: h.id,
            user_id: user.id,
            completed_date: dateStr,
            created_at: new Date().toISOString()
        } as HabitCompletion;
        newCompletions.push(item);
        return {
            habit_id: h.id,
            user_id: user.id,
            completed_date: dateStr
        };
    });

    setCompletions(prev => [...prev, ...newCompletions]);
    await supabase.from('habit_completions').insert(insertPayload);
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
      await supabase.from('habits').update({ ...formData }).eq('id', editingHabit.id);
    } else {
      await supabase.from('habits').insert([{ ...formData, user_id: user!.id }]);
    }
    fetchHabits();
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', frequency: 'daily', target_days: 7, color: '#3b82f6' });
    setEditingHabit(null);
    setShowForm(false);
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete habit?')) return;
    await supabase.from('habits').delete().eq('id', id);
    fetchHabits();
  };

  const getHabitIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('workout')) return <Dumbbell className="w-3.5 h-3.5" />;
    if (n.includes('meditate')) return <Brain className="w-3.5 h-3.5" />;
    if (n.includes('sleep')) return <Moon className="w-3.5 h-3.5" />;
    if (n.includes('journal')) return <PenLine className="w-3.5 h-3.5" />;
    if (n.includes('study')) return <BookOpen className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  // --- Computed Views ---
  
  const visibleDates = weekDates.filter(d => !hideWeekends || !isWeekend(d));

  const visibleHabits = habits
    .filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      return 0; // Default (created_at)
    });

  return (
    <div className={`w-full bg-[#111111] dark:bg-[#111111] p-4 rounded-xl border border-[#222] transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50 h-screen overflow-auto' : ''}`}>
      <div className="bg-[#191919] rounded-lg border border-[#2a2a2a] shadow-2xl overflow-hidden h-full flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-[#2a2a2a] shrink-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <h1 className="text-2xl font-semibold text-white">Weekly Habit Tracker</h1>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#232323] rounded-md border border-[#2a2a2a]">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span className="text-sm text-gray-300">Daily Habits</span>
                <span className="text-xs text-gray-500 ml-2 border-l border-gray-600 pl-2">
                    {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d')}
                </span>
              </div>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
               
              <AnimatePresence>
                {showSearch && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }} 
                    animate={{ width: 200, opacity: 1 }} 
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center bg-[#232323] rounded-md border border-[#2a2a2a] px-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search habits..."
                            className="bg-transparent border-none text-sm text-white focus:ring-0 w-full py-1.5 placeholder-gray-500"
                            autoFocus
                        />
                        <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-gray-400 hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filter / Sort / Actions */}
              <button 
                onClick={() => setHideWeekends(!hideWeekends)} 
                className={`p-2 rounded transition-colors ${hideWeekends ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[#232323] text-gray-400'}`} 
                title={hideWeekends ? "Show Weekends" : "Hide Weekends"}
              >
                <Filter className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setSortOrder(prev => prev === 'default' ? 'name' : 'default')}
                className={`p-2 rounded transition-colors ${sortOrder === 'name' ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[#232323] text-gray-400'}`}
                title="Sort by Name"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>

              <button 
                onClick={completeAllForToday} 
                className="p-2 hover:bg-[#232323] rounded transition-colors text-gray-400 hover:text-yellow-400" 
                title="Complete All for Today"
              >
                <Zap className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setShowSearch(true)} 
                className={`p-2 rounded transition-colors ${showSearch ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[#232323] text-gray-400'}`}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setIsMaximized(!isMaximized)} 
                className={`p-2 rounded transition-colors ${isMaximized ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-[#232323] text-gray-400'}`}
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button className="p-2 hover:bg-[#232323] rounded transition-colors" title="Settings">
                <Settings className="w-4 h-4 text-gray-400" />
              </button>

              <div className="ml-2">
                <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <span>New</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
            {showForm && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => resetForm()}
                >
                    <motion.div 
                        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        className="bg-[#191919] border border-[#333] rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-white mb-4">{editingHabit ? 'Edit Habit' : 'New Habit'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Habit Name (e.g. Morning Run)"
                                    className="w-full px-4 py-2 bg-[#232323] border border-[#333] rounded-lg text-white focus:ring-2 focus:ring-blue-600 outline-none"
                                    required
                                />
                            </div>
                             <div className="flex gap-2 pt-4">
                                 <button type="button" onClick={resetForm} className="flex-1 py-2 text-gray-400 hover:bg-[#232323] rounded-lg border border-[#333]">Cancel</button>
                                 <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                             </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400 border-r border-[#2a2a2a] w-48 bg-[#1a1a1a] min-w-[200px] sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3.5 h-3.5" />
                    <span>Day</span>
                  </div>
                </th>
                {visibleHabits.map(habit => (
                    <th key={habit.id} className="text-left px-6 py-3 text-sm font-medium text-gray-400 border-r border-[#2a2a2a] min-w-[140px] group relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getHabitIcon(habit.name)}
                                <span className="truncate max-w-[100px]" title={habit.name}>{habit.name}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 absolute right-2 bg-[#1a1a1a] p-1 rounded-md shadow-sm border border-[#333] z-20">
                                <button onClick={() => { setEditingHabit(habit); setFormData({...habit}); setShowForm(true); }} className="hover:text-blue-400 p-1"><Edit2 className="w-3 h-3"/></button>
                                <button onClick={() => deleteHabit(habit.id)} className="hover:text-red-400 p-1"><Trash2 className="w-3 h-3"/></button>
                            </div>
                        </div>
                    </th>
                ))}
                {visibleHabits.length === 0 && <th className="px-6 py-3 text-sm text-gray-600 italic border-r border-[#2a2a2a]">{searchQuery ? 'No matches' : 'No habits yet'}</th>}
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-400 border-r border-[#2a2a2a] w-16">
                  <Plus className="w-4 h-4 mx-auto cursor-pointer hover:text-white" onClick={() => setShowForm(true)} />
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-400 w-16">
                  <MoreHorizontal className="w-4 h-4 mx-auto" />
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {visibleDates.map((date) => {
                 const isToday = isSameDay(date, new Date());
                 const dayName = format(date, 'EEEE');
                 return (
                  <tr key={date.toISOString()} className={`border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors group ${isToday ? 'bg-blue-900/10' : ''}`}>
                    <td className={`px-6 py-4 border-r border-[#2a2a2a] border-l-4 ${isToday ? 'border-l-blue-500' : 'border-l-transparent'} bg-[#191919] group-hover:bg-[#1f1f1f] sticky left-0 z-10`}>
                      <div className="flex items-center gap-3">
                        <FileText className={`w-4 h-4 ${isToday ? 'text-blue-500' : 'text-gray-500'}`} />
                        <span className={`font-medium ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>{dayName}</span>
                      </div>
                    </td>
                    {visibleHabits.map(habit => (
                        <td key={`${habit.id}-${date}`} className="px-6 py-4 border-r border-[#2a2a2a]">
                            <div className="flex justify-start">
                             <Checkbox 
                                 checked={isCompleted(habit.id, date)}
                                 onCheckedChange={() => toggleCompletion(habit.id, date)}
                                 className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                             />
                            </div>
                        </td>
                    ))}
                    {visibleHabits.length === 0 && <td className="border-r border-[#2a2a2a]"></td>}
                    <td className="px-4 py-4 border-r border-[#2a2a2a]"></td>
                    <td className="px-4 py-4"></td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Footer */}
            <tfoot>
              <tr className="bg-[#1a1a1a]">
                <td className="px-6 py-3 border-r border-[#2a2a2a] bg-[#1a1a1a] sticky left-0 z-10">
                  <span className="text-xs text-gray-500 font-medium">CHECKED {calculateTotalChecked()}</span>
                </td>
                {visibleHabits.map(habit => (
                    <td key={`total-${habit.id}`} className="px-6 py-3 border-r border-[#2a2a2a] text-left">
                        <span className="text-xs text-gray-500">{calculateColumnTotal(habit.id)}</span>
                    </td>
                ))}
                 {visibleHabits.length === 0 && <td className="border-r border-[#2a2a2a]"></td>}
                <td className="px-4 py-3 border-r border-[#2a2a2a]"></td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
