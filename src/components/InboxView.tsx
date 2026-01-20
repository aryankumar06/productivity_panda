/**
 * InboxView - Notification Center with Supabase Integration
 * Features:
 * - Real-time notifications from Supabase
 * - Workspace invitations with accept/reject
 * - Task assignments and updates
 * - Deadline alerts
 */

import { useState, useEffect, useCallback } from 'react';
import { 
    Bell, 
    AlertTriangle, 
    UserPlus, 
    MessageSquare, 
    Check, 
    Clock, 
    CheckCircle2, 
    X,
    Inbox,
    ArrowRight,
    Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { NotificationType } from '../lib/database.types';

interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    created_at: string;
}

type FilterType = 'all' | 'alert' | 'mention' | 'invite' | 'update';

export default function InboxView() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<FilterType>('all');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // ==========================================================================
    // DATA FETCHING
    // ==========================================================================

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            console.error('Failed to fetch notifications:', error);
        } else {
            setNotifications(data || []);
        }
        
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        
        // Set up real-time subscription
        if (user) {
            const channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setNotifications(prev => [payload.new as Notification, ...prev]);
                    }
                )
                .subscribe();
            
            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, fetchNotifications]);

    // Also check for deadline alerts from tasks
    useEffect(() => {
        const checkDeadlines = async () => {
            if (!user) return;
            
            const { data: tasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .neq('status', 'completed');
            
            if (tasks) {
                const now = new Date();
                const upcoming = tasks.filter(t => {
                    if (!t.due_date) return false;
                    const due = new Date(t.due_date);
                    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
                    return diffHours > 0 && diffHours < 48;
                });

                // Create local deadline alerts (these persist in notifications table via trigger ideally)
                // For now, we'll show them in the UI
                for (const task of upcoming) {
                    const alertId = `deadline-${task.id}`;
                    const exists = notifications.some(n => n.id === alertId);
                    
                    if (!exists) {
                        const deadlineNotif: Notification = {
                            id: alertId,
                            user_id: user.id,
                            type: 'alert',
                            title: 'Deadline Approaching',
                            message: `Task "${task.title}" is due soon (${new Date(task.due_date!).toLocaleDateString()})`,
                            link: `task:${task.id}`,
                            read: false,
                            created_at: new Date().toISOString(),
                        };
                        setNotifications(prev => [deadlineNotif, ...prev.filter(n => n.id !== alertId)]);
                    }
                }
            }
        };

        checkDeadlines();
    }, [user, notifications.length]);

    // ==========================================================================
    // ACTIONS
    // ==========================================================================

    const markAsRead = async (id: string) => {
        // Update local state immediately
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
        
        // Persist to database (ignore error for local-only alerts)
        if (!id.startsWith('deadline-')) {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);
        }
    };

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        if (!id.startsWith('deadline-')) {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', id);
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        if (user) {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id);
        }
    };

    const handleInviteAction = async (notificationId: string, action: 'accept' | 'reject') => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification?.link) return;
        
        // Parse workspace ID from link
        const workspaceId = notification.link.replace('workspace:', '');
        
        if (action === 'accept') {
            // Add user to workspace
            const { error } = await supabase
                .from('workspace_members')
                .insert({
                    workspace_id: workspaceId,
                    user_id: user?.id,
                    role: 'employee',
                });
            
            if (error) {
                // If user is already a member (duplicate key), just proceed to update invite status
                if (error.code === '23505') {
                    console.log('User already a member, marking invite as accepted');
                } else {
                    alert('Failed to join workspace: ' + error.message);
                    return;
                }
            }
            
            // Update invite status
            await supabase
                .from('workspace_invites')
                .update({ status: 'accepted' })
                .eq('workspace_id', workspaceId)
                .eq('invitee_id', user?.id);
        } else {
            // Reject invite
            await supabase
                .from('workspace_invites')
                .update({ status: 'rejected' })
                .eq('workspace_id', workspaceId)
                .eq('invitee_id', user?.id);
        }
        
        // Mark notification as read
        await markAsRead(notificationId);
        await fetchNotifications();
    };

    // ==========================================================================
    // RENDER HELPERS
    // ==========================================================================

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'invite': return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'mention': return <MessageSquare className="w-5 h-5 text-purple-500" />;
            case 'update': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'info': return <Bell className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeLabel = (type: NotificationType) => {
        switch (type) {
            case 'alert': return 'Alert';
            case 'invite': return 'Invitation';
            case 'mention': return 'Mention';
            case 'update': return 'Update';
            case 'info': return 'Info';
            default: return 'Notification';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        return n.type === filter;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        Inbox 
                        {unreadCount > 0 && (
                            <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Updates, requests, and alerts.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                            <Check className="w-4 h-4" />
                            Mark all read
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-gray-200 dark:border-neutral-800">
                <FilterBtn active={filter === 'all'} label="All" count={notifications.length} onClick={() => setFilter('all')} />
                <FilterBtn active={filter === 'alert'} label="Alerts" count={notifications.filter(n => n.type === 'alert').length} onClick={() => setFilter('alert')} />
                <FilterBtn active={filter === 'invite'} label="Invites" count={notifications.filter(n => n.type === 'invite').length} onClick={() => setFilter('invite')} />
                <FilterBtn active={filter === 'mention'} label="Mentions" count={notifications.filter(n => n.type === 'mention').length} onClick={() => setFilter('mention')} />
                <FilterBtn active={filter === 'update'} label="Updates" count={notifications.filter(n => n.type === 'update').length} onClick={() => setFilter('update')} />
            </div>

            {/* Notification List */}
            <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-3 pr-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Inbox className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium dark:text-white">All caught up!</h3>
                            <p className="text-gray-500">No notifications in this category.</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`group relative p-4 rounded-xl border transition-all hover:shadow-md ${
                                    notification.read 
                                        ? 'bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800' 
                                        : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2.5 rounded-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${
                                                notification.type === 'alert' ? 'bg-amber-100 text-amber-700' :
                                                notification.type === 'invite' ? 'bg-blue-100 text-blue-700' :
                                                notification.type === 'mention' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {getTypeLabel(notification.type)}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(notification.created_at)}
                                            </span>
                                        </div>
                                        
                                        <h4 className={`font-medium mb-1 ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {notification.message}
                                        </p>
                                        
                                        <div className="flex items-center gap-2">
                                            {notification.type === 'invite' && !notification.read && (
                                                <>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleInviteAction(notification.id, 'accept')}
                                                        className="h-8 text-xs gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Accept
                                                    </Button>
                                                    <Button 
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleInviteAction(notification.id, 'reject')}
                                                        className="h-8 text-xs gap-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                            
                                            {notification.link && notification.type !== 'invite' && (
                                                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                                                    View Details
                                                    <ArrowRight className="w-3 h-3" />
                                                </Button>
                                            )}
                                            
                                            {!notification.read && (
                                                <button 
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs text-gray-400 hover:text-blue-500 ml-auto"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface FilterBtnProps {
    active: boolean;
    label: string;
    count: number;
    onClick: () => void;
}

function FilterBtn({ active, label, count, onClick }: FilterBtnProps) {
    return (
        <button 
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                active 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
        >
            {label}
            {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' : 'bg-gray-200 dark:bg-neutral-700'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}
