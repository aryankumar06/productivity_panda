import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Task } from '../lib/database.types';

interface ProjectProgressProps {
    tasks: Task[];
}

export function ProjectProgress({ tasks }: ProjectProgressProps) {
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const review = tasks.filter(t => t.status === 'review').length;
        const todo = tasks.filter(t => t.status === 'todo').length;
        
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        const data = [
            { name: 'Done', value: completed, color: '#22c55e' }, // green-500
            { name: 'Review', value: review, color: '#a855f7' }, // purple-500
            { name: 'In Progress', value: inProgress, color: '#3b82f6' }, // blue-500
            { name: 'To Do', value: todo, color: '#9ca3af' }, // gray-400
        ].filter(d => d.value > 0);

        return { total, completed, progress, data };
    }, [tasks]);

    if (stats.total === 0) return null;

    return (
        <div className="flex items-center gap-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-3 shadow-sm h-[68px]">
            {/* Linear Progress */}
            <div className="flex flex-col justify-center gap-1.5 w-32 md:w-48">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="text-gray-900 dark:text-gray-200">{stats.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${stats.progress}%` }}
                    />
                </div>
                <div className="text-[10px] text-gray-400 text-right">
                    {stats.completed}/{stats.total} tasks
                </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200 dark:bg-neutral-800 hidden sm:block" />

            {/* Tiny Donut Chart */}
            <div className="flex items-center gap-3 hidden sm:flex">
                <div className="w-10 h-10 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.data}
                                cx="50%"
                                cy="50%"
                                innerRadius={12}
                                outerRadius={18}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {stats.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1f2937', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontSize: '12px',
                                    padding: '4px 8px'
                                }}
                                itemStyle={{ color: '#f3f4f6', padding: 0 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Micro Legend */}
                <div className="flex flex-col gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                    {stats.data.slice(0, 2).map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                            <span>{d.name}</span>
                        </div>
                    ))}
                    {stats.data.length > 2 && <span>+{stats.data.length - 2} more</span>}
                </div>
            </div>
        </div>
    );
}
