import { useState, useEffect } from 'react';
import { 
    Users, 
    Plus, 
    MoreVertical, 
    FolderPlus, 
    Layout, 
    UserPlus,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Workspace {
    id: string;
    name: string;
    members: WorkspaceMember[];
    tasks: WorkspaceTask[];
    ownerId: string;
}

interface WorkspaceMember {
    id: string;
    email?: string;
    role: 'admin' | 'member';
}

interface WorkspaceTask {
    id: string;
    title: string;
    columnId: 'todo' | 'in_progress' | 'review' | 'done';
    assigneeId?: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
}

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-neutral-800' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'review', title: 'Review', color: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
];

export default function WorkspaceView() {
    const { user } = useAuth();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    // Load workspaces from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('workspaces');
        if (stored) {
            setWorkspaces(JSON.parse(stored));
        } else if (user) {
            // Initial Seed for new users
            const initialWorkspace: Workspace = {
                id: 'ws-1',
                name: 'My First Project',
                ownerId: user.id,
                members: [{ id: user.id, role: 'admin' }],
                tasks: [
                    { id: 't-1', title: 'Setup Project', columnId: 'todo', priority: 'high' },
                    { id: 't-2', title: 'Invite Team', columnId: 'in_progress', priority: 'medium' }
                ]
            };
            setWorkspaces([initialWorkspace]);
            localStorage.setItem('workspaces', JSON.stringify([initialWorkspace]));
            setActiveWorkspaceId('ws-1');
        }
    }, [user]);

    const saveWorkspaces = (updated: Workspace[]) => {
        setWorkspaces(updated);
        localStorage.setItem('workspaces', JSON.stringify(updated));
    };

    const handleCreateWorkspace = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName || !user) return;

        const newWorkspace: Workspace = {
            id: Date.now().toString(),
            name: newWorkspaceName,
            ownerId: user.id,
            members: [{ id: user.id, role: 'admin' }],
            tasks: []
        };

        const updated = [...workspaces, newWorkspace];
        saveWorkspaces(updated);
        setNewWorkspaceName('');
        setShowCreateModal(false);
        setActiveWorkspaceId(newWorkspace.id);
    };

    const handleInviteMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkspaceId || !inviteEmail) return;

        // In a real app, check if user exists via Supabase
        // Here we simulate adding them immediately
        const updatedWorkspaces = workspaces.map(w => {
            if (w.id === activeWorkspaceId) {
                return {
                    ...w,
                    members: [...w.members, { id: inviteEmail, email: inviteEmail, role: 'member' as const }]
                };
            }
            return w;
        });

        saveWorkspaces(updatedWorkspaces);
        
        // Also simulate an "Invite Sent" notification (local storage logic for Inbox)
        const storedNotifs = localStorage.getItem('notifications');
        const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        const newNotif = {
            id: Date.now().toString(),
            type: 'alert', // Just to show up
            title: 'Invite Sent',
            message: `You invited ${inviteEmail} to ${workspaces.find(w => w.id === activeWorkspaceId)?.name}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        localStorage.setItem('notifications', JSON.stringify([newNotif, ...notifs]));

        setInviteEmail('');
        setShowInviteModal(false);
        alert(`Member ${inviteEmail} added to workspace!`);
    };

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
    
    // Task Management
    const addTask = (columnId: WorkspaceTask['columnId'], title: string) => {
        if (!activeWorkspace) return;

        const newTask: WorkspaceTask = {
            id: Date.now().toString(),
            title,
            columnId,
            priority: 'medium',
            assigneeId: user?.id
        };

        const updatedWorkspaces = workspaces.map(w => {
            if (w.id === activeWorkspace.id) {
                return { ...w, tasks: [...w.tasks, newTask] };
            }
            return w;
        });
        saveWorkspaces(updatedWorkspaces);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
            {/* Sidebar: List of Workspaces */}
            <Card className="w-full md:w-64 flex-shrink-0 h-full flex flex-col border-none shadow-none bg-transparent">
                <div className="flex items-center justify-between mb-4 px-1">
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

                <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-2">
                    {workspaces.map(w => (
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
                                    <div className={`text-xs mt-0.5 flex items-center gap-1 ${activeWorkspaceId === w.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                        <Users className="w-3 h-3" />
                                        {w.members.length} members
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                    </div>
                </ScrollArea>
                
                {workspaces.length === 0 && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl mt-4">
                            <p className="text-sm">No workspaces yet.</p>
                            <Button variant="link" onClick={() => setShowCreateModal(true)} className="text-blue-500">Create one</Button>
                        </div>
                )}
            </Card>

            {/* Main Area: Logic/Kanban */}
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col shadow-sm">
                {activeWorkspace ? (
                    <>
                        {/* Workspace Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-gray-500" />
                                    {activeWorkspace.name}
                                </h2>
                                <p className="text-xs text-gray-500">Project Board</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {activeWorkspace.members.slice(0, 3).map((m, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs font-bold text-blue-800 uppercase" title={m.email || m.id}>
                                            {(m.email || m.id).slice(0, 2)}
                                        </div>
                                    ))}
                                    {activeWorkspace.members.length > 3 && (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                                            +{activeWorkspace.members.length - 3}
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    size="sm"
                                    onClick={() => setShowInviteModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Invite
                                </Button>
                                <Button size="icon" variant="ghost">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Kanban Board */}
                        <ScrollArea className="flex-1 bg-gray-50/30 dark:bg-neutral-900/30">
                            <div className="flex gap-4 p-4 h-full min-w-[1000px]">
                                {COLUMNS.map(column => (
                                    <div key={column.id} className="flex flex-col w-[280px] shrink-0 h-full rounded-xl bg-gray-100/50 dark:bg-neutral-800/50 p-3">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${column.id === 'done' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                {column.title}
                                            </h3>
                                            <span className="text-xs text-gray-400 font-mono bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                                {activeWorkspace.tasks.filter(t => t.columnId === column.id).length}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 min-h-[100px]">
                                            {activeWorkspace.tasks
                                                .filter(t => t.columnId === column.id)
                                                .map(task => (
                                                    <div key={task.id} className="bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 group hover:border-blue-400 transition-colors cursor-grab active:cursor-grabbing">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{task.title}</h4>
                                                        <div className="flex items-center justify-between">
                                                            <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                                task.priority === 'high' ? 'bg-red-50 text-red-600' : 
                                                                task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 
                                                                'bg-green-50 text-green-600'
                                                            }`}>
                                                                {task.priority}
                                                            </div>
                                                            {task.assigneeId && (
                                                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                                    {task.assigneeId.slice(0, 1)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        <button 
                                            onClick={() => {
                                                const title = prompt("Task title:");
                                                if (title) addTask(column.id as WorkspaceTask['columnId'], title);
                                            }}
                                            className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-dashed border-gray-300 dark:border-neutral-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Task
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Create Workspace</h3>
                        <form onSubmit={handleCreateWorkspace}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Workspace Name (e.g., Marketing Team)"
                                className="w-full px-4 py-2 mb-4 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                value={newWorkspaceName}
                                onChange={e => setNewWorkspaceName(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={!newWorkspaceName}>Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 p-6">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Invite Member</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter the User ID or Email of the person you want to invite.</p>
                        <form onSubmit={handleInviteMember}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="User Email or ID"
                                className="w-full px-4 py-2 mb-4 border rounded-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={!inviteEmail}>Send Invite</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
