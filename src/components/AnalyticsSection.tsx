import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';
import { CheckCircle2, TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from './ui/line-chart';
import { Card as ChartCard, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AnalyticsData {
    taskStats: { name: string; value: number; color: string }[];
    completionRate: number;
    weeklyProgress: { name: string; completed: number }[];
    habitStreaks: { date: string; completed: number; total: number }[];
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

        // 3. Habit Completion Trends (for Line Chart)
        // Get last 7 days of habit completions
        const last7DaysHabits = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const habitCompletionTrend = last7DaysHabits.map(date => {
            // Count how many habits were completed on this date
            const completedCount = habits.reduce((count, habit) => {
                if (!habit.habit_completions || !Array.isArray(habit.habit_completions)) {
                    return count;
                }
                const completedOnDate = habit.habit_completions.some((c: any) => 
                    c.completed_date === date
                );
                return count + (completedOnDate ? 1 : 0);
            }, 0);
            
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                completed: completedCount,
                total: habits.length || 0
            };
        });

        console.log('Habit Completion Trend Data:', habitCompletionTrend);
        console.log('Total Habits:', habits.length);

        setData({
            taskStats,
            completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
            weeklyProgress,
            habitStreaks: habitCompletionTrend,
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

                {/* Habit Completion Trend - Glowing Line Chart */}
                <ChartCard className="lg:col-span-2 border-gray-200 dark:border-neutral-700">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            Habit Completion Trend
                            {(() => {
                                const chartData = data.habitStreaks;
                                if (chartData.length < 2) return null;
                                
                                const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
                                const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
                                
                                const firstAvg = firstHalf.reduce((sum, item) => sum + item.completed, 0) / firstHalf.length;
                                const secondAvg = secondHalf.reduce((sum, item) => sum + item.completed, 0) / secondHalf.length;
                                
                                const trend = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;
                                const trendValue = Math.abs(Math.round(trend * 10) / 10);
                                const isPositive = trend >= 0;
                                
                                return (
                                    <Badge
                                        variant="outline"
                                        className={`${
                                            isPositive 
                                                ? 'text-green-500 bg-green-500/10 border-none' 
                                                : 'text-red-500 bg-red-500/10 border-none'
                                        } ml-2`}
                                    >
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                                        <span>{trendValue}%</span>
                                    </Badge>
                                );
                            })()}
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                            Your weekly habit completion progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.habitStreaks.every(d => d.total === 0) ? (
                            <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <div className="text-center">
                                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No habits tracked yet</p>
                                    <p className="text-xs mt-1">Start tracking habits to see your progress here</p>
                                </div>
                            </div>
                        ) : (
                        <ChartContainer config={{
                            completed: {
                                label: "Completed",
                                color: "hsl(var(--chart-1))",
                            },
                            total: {
                                label: "Total Habits",
                                color: "hsl(var(--chart-2))",
                            },
                        }}>
                            <LineChart
                                accessibilityLayer
                                data={data.habitStreaks}
                                margin={{
                                    left: 12,
                                    right: 12,
                                    top: 12,
                                    bottom: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} className="stroke-gray-200 dark:stroke-neutral-700" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    className="text-gray-600 dark:text-gray-400"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    className="text-gray-600 dark:text-gray-400"
                                    domain={[0, 'auto']}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Line
                                    dataKey="completed"
                                    type="monotone"
                                    stroke="var(--chart-1)"
                                    strokeWidth={3}
                                    dot={{ fill: "var(--chart-1)", r: 4 }}
                                    activeDot={{ r: 6 }}
                                    filter="url(#habit-line-glow)"
                                />
                                <Line
                                    dataKey="total"
                                    type="monotone"
                                    stroke="var(--chart-2)"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={{ fill: "var(--chart-2)", r: 4 }}
                                    activeDot={{ r: 6 }}
                                    filter="url(#habit-line-glow)"
                                />
                                <defs>
                                    <filter
                                        id="habit-line-glow"
                                        x="-20%"
                                        y="-20%"
                                        width="140%"
                                        height="140%"
                                    >
                                        <feGaussianBlur stdDeviation="10" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                            </LineChart>
                        </ChartContainer>
                        )}
                    </CardContent>
                </ChartCard>
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
