/**
 * WorkspaceView - Enterprise-grade Workspace and Task Management
 * Features:
 * - Role-based access control (Manager/Employee)
 * - Full task lifecycle management
 * - Member invitation and management
 * - Real-time updates via Supabase
 */

import { useState, useEffect, useRef } from 'react';
import { 
    Plus, 
    FolderPlus, 
    Layout, 
    UserPlus,
    Briefcase,
    Trash2,
    ChevronRight,
    Send,
    X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePermissions } from '../hooks/usePermissions';
import { 
    TASK_STATUSES, 
    TASK_PRIORITIES, 
    getStatusConfig,
    canTransitionState,
    getAllowedNextStates,
    DEFAULT_STATE_TRANSITIONS
} from '../lib/permissions';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';
import { TaskStatus, WorkspaceRole } from '../lib/database.types';

// =============================================================================
// TYPES
// =============================================================================

interface Workspace {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
}

interface WorkspaceMember {
    id: string;
    workspace_id: string;
    user_id: string;
    role: WorkspaceRole;
    joined_at: string;
    // Joined from user_profiles
    email?: string;
    display_name?: string;
}

interface WorkspaceTask {
    id: string;
    workspace_id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: string;
    assignee_id: string | null;
    created_by: string;
    due_date: string | null;
    created_at: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function WorkspaceView() {
    const { user } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    
    // Form states
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskAssignee, setNewTaskAssignee] = useState<string | null>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
    
    // Kanban scroll
    const kanbanRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    // Members scroll
    const membersRef = useRef<HTMLDivElement>(null);
    const [membersScrollPosition, setMembersScrollPosition] = useState(0);
    
    // Permissions
    const { 
        role, 
        isManager, 
        isEmployee, 
        isMember,
        canManageMembers,
        canInviteUsers,
        canCreateTasks,
        canAssignTasks,
    } = usePermissions(activeWorkspaceId);

    // =========================================================================
    // DATA FETCHING
    // =========================================================================

    useEffect(() => {
        if (user) {
            fetchWorkspaces();
        }
    }, [user]);

    useEffect(() => {
        if (activeWorkspaceId) {
            fetchMembers();
            fetchTasks();

            // Real-time subscriptions
            const membersSubscription = supabase
                .channel('room_members')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'workspace_members',
                    filter: `workspace_id=eq.${activeWorkspaceId}`
                }, () => {
                    fetchMembers();
                })
                .subscribe();

            const tasksSubscription = supabase
                .channel('room_tasks')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'workspace_tasks',
                    filter: `workspace_id=eq.${activeWorkspaceId}`
                }, () => {
                    fetchTasks();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(membersSubscription);
                supabase.removeChannel(tasksSubscription);
            };
        }
    }, [activeWorkspaceId]);

    const fetchWorkspaces = async () => {
        if (!user) return;
        setLoading(true);
        
        // Fetch workspaces where user is a member
        const { data: memberData } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id);
        
        if (memberData && memberData.length > 0) {
            const workspaceIds = memberData.map(m => m.workspace_id);
            const { data: workspacesData } = await supabase
                .from('workspaces')
                .select('*')
                .in('id', workspaceIds)
                .order('created_at', { ascending: false });
            
            setWorkspaces(workspacesData || []);
            
            // Auto-select first workspace if none selected
            if (!activeWorkspaceId && workspacesData && workspacesData.length > 0) {
                setActiveWorkspaceId(workspacesData[0].id);
            }
        } else {
            setWorkspaces([]);
        }
        
        setLoading(false);
    };

    const fetchMembers = async () => {
        if (!activeWorkspaceId) return;
        
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
                *,
                user_profiles:user_id (email, display_name)
            `)
            .eq('workspace_id', activeWorkspaceId);
        
        if (error) {
            console.error('Error fetching members:', error);
            return;
        }

        if (data) {
            const formattedMembers = data.map((m: any) => ({
                ...m,
                email: m.user_profiles?.email,
                display_name: m.user_profiles?.display_name,
            }));
            setMembers(formattedMembers);
        }
    };

    const fetchTasks = async () => {
        if (!activeWorkspaceId) return;
        
        const { data } = await supabase
            .from('workspace_tasks')
            .select('*')
            .eq('workspace_id', activeWorkspaceId)
            .order('created_at', { ascending: false });
        
        setTasks(data || []);
    };

    // =========================================================================
    // ACTIONS
    // =========================================================================

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName || !user) return;

        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                name: newWorkspaceName,
                description: newWorkspaceDescription || null,
                owner_id: user.id,
            })
            .select()
            .single();

        if (error) {
            alert('Failed to create workspace: ' + error.message);
            return;
        }

        // Trigger created - owner is auto-added as manager via DB trigger
        setNewWorkspaceName('');
        setNewWorkspaceDescription('');
        setShowCreateModal(false);
        await fetchWorkspaces();
        
        if (data) {
            setActiveWorkspaceId(data.id);
        }
    };

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspaceId || !inviteEmail || !user) return;

        const input = inviteEmail.trim();
        
        // Determine if input is email or user code
        const isEmail = input.includes('@');
        
        // Find user by email OR user_code
        let profileData;
        if (isEmail) {
            const { data } = await supabase
                .from('user_profiles')
                .select('id, email, user_code')
                .eq('email', input.toLowerCase())
                .single();
            profileData = data;
        } else {
            // Treat as user code
            const { data } = await supabase
                .from('user_profiles')
                .select('id, email, user_code')
                .eq('user_code', input)
                .single();
            profileData = data;
        }

        if (!profileData) {
            alert(`User not found. ${isEmail ? 'Make sure they have an account with this email.' : 'Check the user code and try again.'}`);
            return;
        }

        // Check if already a member
        const existingMember = members.find(m => m.user_id === profileData.id);
        if (existingMember) {
            alert('This user is already a member of this workspace.');
            return;
        }

        // Create invite
        const { error: inviteError } = await supabase
            .from('workspace_invites')
            .insert({
                workspace_id: activeWorkspaceId,
                inviter_id: user.id,
                invitee_id: profileData.id,
                invitee_email: profileData.email,
            });

        if (inviteError) {
            alert('Failed to send invite: ' + inviteError.message);
            return;
        }

        setInviteEmail('');
        setShowInviteModal(false);
        // Do not fetch members yet as they haven't accepted
        alert(`Invite sent to ${profileData.email || 'User'}! They need to accept it from their Inbox.`);
    };

    const handleRemoveMember = async (memberId: string, memberUserId: string) => {
        if (!canManageMembers) return;
        
        // Cannot remove yourself or the owner
        const workspace = workspaces.find(w => w.id === activeWorkspaceId);
        if (memberUserId === workspace?.owner_id) {
            alert('Cannot remove the workspace owner.');
            return;
        }

        const { error } = await supabase
            .from('workspace_members')
            .delete()
            .eq('id', memberId);

        if (error) {
            alert('Failed to remove member: ' + error.message);
            return;
        }

        await fetchMembers();
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspaceId || !newTaskTitle || !user || !canCreateTasks) return;

        const { error } = await supabase
            .from('workspace_tasks')
            .insert({
                workspace_id: activeWorkspaceId,
                title: newTaskTitle,
                status: newTaskStatus,
                priority: newTaskPriority,
                assignee_id: newTaskAssignee,
                created_by: user.id,
            });

        if (error) {
            alert('Failed to create task: ' + error.message);
            return;
        }

        setNewTaskTitle('');
        setNewTaskPriority('medium');
        setNewTaskAssignee(null);
        setNewTaskStatus('todo');
        setShowTaskModal(false);
        await fetchTasks();
    };

    const handleUpdateTaskStatus = async (taskId: string, currentStatus: TaskStatus, newStatus: TaskStatus) => {
        // Check if transition is allowed
        if (!role || !canTransitionState(role, currentStatus, newStatus, DEFAULT_STATE_TRANSITIONS)) {
            alert('You are not allowed to make this state transition.');
            return;
        }

        const { error } = await supabase
            .from('workspace_tasks')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', taskId);

        if (error) {
            alert('Failed to update task: ' + error.message);
            return;
        }

        await fetchTasks();
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!isManager) return;

        const { error } = await supabase
            .from('workspace_tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            alert('Failed to delete task: ' + error.message);
            return;
        }

        await fetchTasks();
    };

    // =========================================================================
    // RENDER HELPERS
    // =========================================================================

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
    
    // Filter tasks for employees - they only see assigned tasks
    const visibleTasks = isEmployee && !isManager
        ? tasks.filter(t => t.assignee_id === user?.id)
        : tasks;

    const getTasksByStatus = (status: TaskStatus) => visibleTasks.filter(t => t.status === status);

    const getMemberName = (userId: string | null) => {
        if (!userId) return 'Unassigned';
        const member = members.find(m => m.user_id === userId);
        return member?.display_name || member?.email || userId.slice(0, 8);
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
            {/* Sidebar: Workspace List - Hidden on mobile when workspace is selected */}
            <div className={`w-full md:w-64 flex-shrink-0 space-y-4 ${activeWorkspaceId ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold dark:text-white">Workspaces</h2>
                    <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowCreateModal(true)}
                        title="Create Workspace"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="space-y-2 pr-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : workspaces.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
                                <FolderPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No workspaces yet</p>
                                <Button variant="link" onClick={() => setShowCreateModal(true)} className="text-blue-500">
                                    Create one
                                </Button>
                            </div>
                        ) : (
                            workspaces.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => setActiveWorkspaceId(w.id)}
                                    className={`w-full p-3 rounded-xl border text-left transition-all group ${
                                        activeWorkspaceId === w.id 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                            : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-blue-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${activeWorkspaceId === w.id ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{w.name}</div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${activeWorkspaceId === w.id ? 'text-white' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`} />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Area - Show on mobile when workspace is selected */}
            <div className={`flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col shadow-sm ${activeWorkspaceId ? 'block' : 'hidden md:block'}`}>
                {activeWorkspace && isMember ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-2">
                                {/* Back button for mobile */}
                                <button
                                    onClick={() => setActiveWorkspaceId(null)}
                                    className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                    title="Back to workspaces"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Layout className="w-5 h-5 text-gray-500" />
                                        {activeWorkspace.name}
                                    </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        isManager 
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                            : 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-gray-300'
                                    }`}>
                                        {isManager ? '👑 Manager' : '👤 Employee'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {members.length} member{members.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {canInviteUsers && (
                                    <Button 
                                        size="sm"
                                        onClick={() => setShowInviteModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Invite
                                    </Button>
                                )}
                                {canCreateTasks && (
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowTaskModal(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Task
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Members Bar with Custom Slider */}
                        <div className="border-b border-gray-100 dark:border-neutral-800">
                            <div 
                                ref={membersRef}
                                className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                onScroll={(e) => {
                                    const target = e.currentTarget;
                                    requestAnimationFrame(() => {
                                        const scrollPercentage = (target.scrollLeft / (target.scrollWidth - target.clientWidth)) * 100 || 0;
                                        setMembersScrollPosition(scrollPercentage);
                                    });
                                }}
                            >
                                <span className="text-xs text-gray-500 mr-2 flex-shrink-0">Team:</span>
                                {members.map(m => (
                                    <div 
                                        key={m.id}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-xs flex-shrink-0"
                                        title={m.email}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${m.role === 'manager' ? 'bg-purple-500' : 'bg-gray-400'}`} />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {m.display_name || m.email?.split('@')[0] || 'User'}
                                        </span>
                                        {canManageMembers && m.user_id !== user?.id && (
                                            <button 
                                                onClick={() => handleRemoveMember(m.id, m.user_id)}
                                                className="ml-1 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Member Slider (visible if overflow) */}
                            {members.length > 3 && (
                                <div className="px-10 pb-2">
                                    <Slider
                                        value={[membersScrollPosition]}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) => {
                                            if (membersRef.current) {
                                                const scrollWidth = membersRef.current.scrollWidth - membersRef.current.clientWidth;
                                                membersRef.current.scrollLeft = (value[0] / 100) * scrollWidth;
                                                setMembersScrollPosition(value[0]);
                                            }
                                        }}
                                        className="w-full h-1"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Kanban Board with Custom Slider */}
                        <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-neutral-900/30 overflow-hidden">
                            {/* Kanban Columns */}
                            <div 
                                ref={kanbanRef}
                                className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                onScroll={(e) => {
                                    const target = e.currentTarget;
                                    requestAnimationFrame(() => {
                                        const scrollPercentage = (target.scrollLeft / (target.scrollWidth - target.clientWidth)) * 100 || 0;
                                        setScrollPosition(scrollPercentage);
                                    });
                                }}
                            >
                                <div className="flex gap-4 p-4 h-full" style={{ minWidth: 'max-content' }}>
                                    {TASK_STATUSES.map(status => (
                                        <div key={status.id} className="flex flex-col w-[260px] shrink-0 h-full rounded-xl bg-gray-100/50 dark:bg-neutral-800/50 p-3">
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        status.id === 'done' ? 'bg-green-500' : 
                                                        status.id === 'review' ? 'bg-purple-500' :
                                                        status.id === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                                                    }`} />
                                                    {status.label}
                                                </h3>
                                                <span className="text-xs text-gray-400 font-mono bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                                    {getTasksByStatus(status.id).length}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[100px]">
                                                {getTasksByStatus(status.id).map(task => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        role={role}
                                                        isManager={isManager}
                                                        getMemberName={getMemberName}
                                                        onUpdateStatus={handleUpdateTaskStatus}
                                                        onDelete={handleDeleteTask}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Custom Slider */}
                            <div className="px-4 py-3 border-t border-gray-200/50 dark:border-neutral-800/50">
                                <Slider
                                    value={[scrollPosition]}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => {
                                        if (kanbanRef.current) {
                                            const scrollWidth = kanbanRef.current.scrollWidth - kanbanRef.current.clientWidth;
                                            kanbanRef.current.scrollLeft = (value[0] / 100) * scrollWidth;
                                            setScrollPosition(value[0]);
                                        }
                                    }}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FolderPlus className="w-16 h-16 mb-4 text-gray-200 dark:text-neutral-800" />
                        <p>Select or create a workspace to get started</p>
                    </div>
                )}
            </div>

            {/* Create Workspace Modal */}
            {showCreateModal && (
                <Modal onClose={() => setShowCreateModal(false)} title="Create Workspace">
                    <form onSubmit={handleCreateWorkspace} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g., Marketing Team"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                value={newWorkspaceName}
                                onChange={e => setNewWorkspaceName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description (optional)</label>
                            <textarea
                                placeholder="What is this workspace for?"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700 resize-none"
                                rows={2}
                                value={newWorkspaceDescription}
                                onChange={e => setNewWorkspaceDescription(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-500 bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg">
                            ✨ You will automatically become the Manager of this workspace.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={!newWorkspaceName}>Create</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <Modal onClose={() => setShowInviteModal(false)} title="Invite Member">
                    <form onSubmit={handleInviteMember} className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Enter the email or <strong>6-digit user code</strong> of the person you want to add.
                        </p>
                        <input
                            autoFocus
                            type="text"
                            placeholder="email@example.com or 123456"
                            className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg">
                            💡 Users can find their code in Settings. They will be added as an Employee.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={!inviteEmail} className="gap-2">
                                <Send className="w-4 h-4" />
                                Add Member
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Create Task Modal */}
            {showTaskModal && (
                <Modal onClose={() => setShowTaskModal(false)} title="Create Task">
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="What needs to be done?"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Priority</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                    value={newTaskPriority}
                                    onChange={e => setNewTaskPriority(e.target.value)}
                                >
                                    {TASK_PRIORITIES.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                    value={newTaskStatus}
                                    onChange={e => setNewTaskStatus(e.target.value as TaskStatus)}
                                >
                                    {TASK_STATUSES.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {canAssignTasks && (
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Assign to</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                    value={newTaskAssignee || ''}
                                    onChange={e => setNewTaskAssignee(e.target.value || null)}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.user_id}>
                                            {m.display_name || m.email || 'User'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" type="button" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={!newTaskTitle}>Create Task</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ModalProps {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ onClose, title, children }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                    <h3 className="text-lg font-bold dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

interface TaskCardProps {
    task: WorkspaceTask;
    role: WorkspaceRole | null;
    isManager: boolean;
    getMemberName: (userId: string | null) => string;
    onUpdateStatus: (taskId: string, currentStatus: TaskStatus, newStatus: TaskStatus) => void;
    onDelete: (taskId: string) => void;
}

function TaskCard({ task, role, isManager, getMemberName, onUpdateStatus, onDelete }: TaskCardProps) {
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    
    const allowedNextStates = role ? getAllowedNextStates(role, task.status, DEFAULT_STATE_TRANSITIONS) : [];
    
    const priorityColors: Record<string, string> = {
        low: 'bg-gray-100 text-gray-600',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 group hover:border-blue-400 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">{task.title}</h4>
                {isManager && (
                    <button 
                        onClick={() => onDelete(task.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            <div className="flex items-center justify-between gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}>
                    {task.priority}
                </span>
                <span className="text-gray-500 dark:text-gray-400 truncate text-right" title={getMemberName(task.assignee_id)}>
                    {getMemberName(task.assignee_id)}
                </span>
            </div>

            {allowedNextStates.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            Move to...
                            <ChevronRight className={`w-3 h-3 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showStatusMenu && (
                            <div className="absolute left-0 top-6 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                {allowedNextStates.map(status => {
                                    const config = getStatusConfig(status);
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                onUpdateStatus(task.id, task.status, status);
                                                setShowStatusMenu(false);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                                        >
                                            <span className={`w-2 h-2 rounded-full ${
                                                status === 'done' ? 'bg-green-500' : 
                                                status === 'review' ? 'bg-purple-500' :
                                                status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                                            }`} />
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
