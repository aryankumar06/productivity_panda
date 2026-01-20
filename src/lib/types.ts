export type NotificationType = 'alert' | 'invite' | 'mention' | 'update' | 'info';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string;
    read: boolean;
    link?: string; // e.g., 'task:123', 'workspace:456'
    actionLabel?: string;
    onAction?: () => void;
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
}
