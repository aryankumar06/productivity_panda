import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, UserPlus, MessageSquare, Check, Clock, CheckCircle2, X } from 'lucide-react';
import { Notification, NotificationType } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export default function InboxView() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'alert' | 'mention' | 'invite' | 'update'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = () => {
      // 1. Load from LocalStorage (Simulated Workspaces invites)
      const stored = localStorage.getItem('notifications');
      let localNotifs: Notification[] = stored ? JSON.parse(stored) : [];

      // 2. Mock Data for demo if empty
      if (localNotifs.length === 0) {
          localNotifs = [
            {
                id: '1',
                type: 'invite',
                title: 'Workspace Invitation',
                message: 'Sarah invited you to join the "Q4 Marketing" workspace.',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                read: false,
                actionLabel: 'Accept'
            },
            {
                id: '4',
                type: 'update',
                title: 'Project Update',
                message: 'The "Mobile App Launch" project status was changed to "In Progress".',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                read: true
            }
          ];
      }
      return localNotifs;
  };

  useEffect(() => {
    // Initial fetch
    setNotifications(fetchNotifications());

    // Poll for changes (since we are using localStorage for cross-component comms)
    const interval = setInterval(() => {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Simple check if length changed or first ID changed to avoid unnecessary re-renders
            setNotifications(prev => {
                if (prev.length !== parsed.length || (parsed.length > 0 && prev[0]?.id !== parsed[0].id)) {
                     return parsed;
                }
                return prev;
            });
        }
    }, 2000);

    // Also check tasks for deadlines
    checkDeadlines();

    return () => clearInterval(interval);
  }, [user]);

  const checkDeadlines = async () => {
    if (!user) return;
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id).neq('status', 'completed');
    
    if (tasks) {
        const now = new Date();
        const upcoming = tasks.filter(t => {
            if (!t.due_date) return false;
            const due = new Date(t.due_date);
            const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
            return diffHours > 0 && diffHours < 48; // Due in less than 48h
        });

        if (upcoming.length > 0) {
            const newAlerts: Notification[] = upcoming.map(t => ({
                id: `alert-${t.id}`,
                type: 'alert',
                title: 'Deadline Approaching',
                message: `Task "${t.title}" is due soon (${new Date(t.due_date!).toLocaleDateString()})`,
                timestamp: new Date().toISOString(),
                read: false,
                link: `task:${t.id}`
            }));
            
            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const uniqueAlerts = newAlerts.filter(a => !existingIds.has(a.id));
                if (uniqueAlerts.length > 0) {
                     const updated = [...uniqueAlerts, ...prev];
                     // Persist alerts to localStorage too so they persist across reloads
                     localStorage.setItem('notifications', JSON.stringify(updated));
                     return updated;
                }
                return prev;
            });
        }
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      localStorage.setItem('notifications', JSON.stringify(updated));
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'invite': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'mention': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'update': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
               Inbox 
               {notifications.some(n => !n.read) && (
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               )}
           </h2>
           <p className="text-gray-500 dark:text-gray-400">Updates, requests, and alerts.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-1 rounded-lg border border-gray-200 dark:border-neutral-800">
             <FilterBtn active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
             <FilterBtn active={filter === 'alert'} label="Alerts" onClick={() => setFilter('alert')} />
             <FilterBtn active={filter === 'mention'} label="Mentions" onClick={() => setFilter('mention')} />
             <FilterBtn active={filter === 'invite'} label="Requests" onClick={() => setFilter('invite')} />
             <FilterBtn active={filter === 'update'} label="Updates" onClick={() => setFilter('update')} />
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium dark:text-white">All caught up!</h3>
                    <p className="text-gray-500">No new notifications in this category.</p>
                </div>
            ) : (
                filteredNotifications.map((notification) => (
                    <div 
                        key={notification.id}
                        className={`group relative p-4 rounded-xl border transition-all hover:bg-gray-50 dark:hover:bg-neutral-800/50 ${
                            notification.read 
                                ? 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800' 
                                : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-full bg-white dark:bg-neutral-900 shadow-sm border border-gray-100 dark:border-neutral-800`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-medium ${notification.read ? 'text-gray-900 dark:text-gray-200' : 'text-gray-900 dark:text-white font-semibold'}`}>
                                        {notification.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button onClick={() => deleteNotification(notification.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {notification.message}
                                </p>
                                
                                <div className="flex items-center gap-2">
                                    {notification.actionLabel && (
                                        <Button 
                                            size="sm"
                                            onClick={() => {
                                                alert(`Action: ${notification.actionLabel}`);
                                                markAsRead(notification.id);
                                            }}
                                            className="h-8 text-xs"
                                        >
                                            {notification.actionLabel}
                                        </Button>
                                    )}
                                    {notification.link && (
                                        <Button variant="outline" size="sm" className="h-8 text-xs">
                                            View Details
                                        </Button>
                                    )}
                                    {!notification.read && (
                                        <button 
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs text-gray-400 hover:text-blue-500 underline ml-2"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </ScrollArea>
    </div>
  );
}

function FilterBtn({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                active 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
        >
            {label}
        </button>
    );
}
