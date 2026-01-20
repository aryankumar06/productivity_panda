import { differenceInDays, isPast, isToday, parseISO } from "date-fns";

export interface Task {
    id: string;
    title: string;
    due_date: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'completed';
}

export const PRIORITY_MAP = {
    high: 3,
    medium: 2,
    low: 1,
};

/**
 * Calculates a Smart Score (0-100) for sorting tasks.
 * Score = (UrgencyScore) + (PriorityScore * 10)
 */
export function calculateSmartScore(task: Task): number {
    if (task.status === 'completed') return 0;
    if (!task.due_date) return PRIORITY_MAP[task.priority] * 5; // Base score for no due date

    const date = parseISO(task.due_date);
    let urgencyScore = 0;

    if (isPast(date) || isToday(date)) {
        urgencyScore = 50; // Max urgency
    } else {
        // Score decreases as due date gets further
        const days = differenceInDays(date, new Date());
        urgencyScore = Math.max(0, 40 - days * 2);
    }

    const priorityScore = PRIORITY_MAP[task.priority] * 10;

    return urgencyScore + priorityScore;
}

export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4';

export const QUADRANT_LABELS = {
    q1: 'Urgent & Important (Do)',
    q2: 'Not Urgent & Important (Schedule)',
    q3: 'Urgent & Not Important (Delegate)',
    q4: 'Not Urgent & Not Important (Delete)',
};

/**
 * Maps a task to an Eisenhower Quadrant.
 * Q1: High Priority AND Due <= 3 Days
 * Q2: High Priority AND Due > 3 Days (or No Due Date)
 * Q3: Low/Med Priority AND Due <= 3 Days
 * Q4: Low/Med Priority AND Due > 3 Days (or No Due Date)
 */
export function getEisenhowerQuadrant(task: Task): Quadrant {
    const isHighPriority = task.priority === 'high';

    let isUrgent = false;
    if (task.due_date) {
        const date = parseISO(task.due_date);
        const days = differenceInDays(date, new Date());
        isUrgent = days <= 3; // Urgent if due within 3 days
    }

    if (isUrgent && isHighPriority) return 'q1';
    if (!isUrgent && isHighPriority) return 'q2';
    if (isUrgent && !isHighPriority) return 'q3';
    return 'q4';
}
