import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';
import { CheckCircle2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface AnalyticsData {
    taskStats: { name: string; value: number; color: string }[];
    completionRate: number;
    weeklyProgress: { name: string; completed: number }[];
    habitStreaks: { name: string; streak: number }[];
    totalTasks: number;
    completedTasks: number;
}

export default function AnalyticsSection() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData>({
        taskStats: [],
        completionRate: 0,
        weeklyProgress: [],
        habitStreaks: [],
        totalTasks: 0,
        completedTasks: 0
    });

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Tasks
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user!.id);

        // Fetch Habits
        const { data: habits } = await supabase
            .from('habits')
            .select('*, habit_completions(*)')
            .eq('user_id', user!.id);

        if (tasks && habits) {
            processData(tasks, habits);
        }
        setLoading(false);
    };

    const processData = (tasks: any[], habits: any[]) => {
        // 1. Task Stats (Pie Chart)
        const todo = tasks.filter(t => t.status === 'todo').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        
        const taskStats = [
            { name: 'To Do', value: todo, color: '#94a3b8' }, // gray-400
            { name: 'In Progress', value: inProgress, color: '#3b82f6' }, // blue-500
            { name: 'Completed', value: completed, color: '#22c55e' }, // green-500
        ].filter(d => d.value > 0);

        // 2. Weekly Progress (Bar Chart) - Last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const weeklyProgress = last7Days.map(date => {
            // Count tasks completed on this date
            const count = tasks.filter(t => 
                t.status === 'completed' && 
                t.completed_at && 
                t.completed_at.startsWith(date)
            ).length;
            
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                completed: count
            };
        });

        // 3. Habit Streaks
        // Calculate basic streak for top 5 habits
        const habitStreaks = habits.map(h => {
             // Simplified streak calc (same logic as HabitSection would be ideal, but keeping it simple for overview)
             // We'll trust the HabitSection logic for exactness, here we approximate or re-use logic if exported.
             // For now, let's just count total completions as a proxy for "adherence" or use length of completions
             // If we want "Current Streak", we'd need the full algo. Let's strictly count total completions for now to show "Activity".
             return {
                 name: h.name,
                 streak: h.habit_completions.length // visualizing Total Completions for now
             };
        }).sort((a, b) => b.streak - a.streak).slice(0, 5);

        setData({
            taskStats,
            completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
            weeklyProgress,
            habitStreaks,
            totalTasks: tasks.length,
            completedTasks: completed
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card title="Completion Rate" value={`${data.completionRate}%`} icon={TrendingUp} color="text-green-500" />
                <Card title="Total Tasks" value={data.totalTasks} icon={CheckCircle2} color="text-blue-500" />
                <Card title="Completed" value={data.completedTasks} icon={Calendar} color="text-indigo-500" />
                <Card title="Active Habits" value={data.habitStreaks.length} icon={AlertCircle} color="text-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Distribution */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Task Status Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.taskStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.taskStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                    itemStyle={{ color: '#f3f4f6' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Weekly Task Completion</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeklyProgress}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Habit Adherence (Top 5) */}
                 <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Top Habits (Total Completions)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.habitStreaks} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                <XAxis type="number" stroke="#888888" fontSize={12} hide />
                                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="streak" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-opacity-10 dark:bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>
    );
}
