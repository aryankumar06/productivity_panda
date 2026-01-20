/**
 * Role-Based Access Control (RBAC) System
 * Centralized permission definitions and validation
 */

import { WorkspaceRole, TaskStatus } from './database.types';

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

export const PERMISSIONS = {
    // Workspace Management
    WORKSPACE_MANAGE_MEMBERS: 'workspace:manage_members',
    WORKSPACE_INVITE_USERS: 'workspace:invite_users',
    WORKSPACE_MANAGE_SETTINGS: 'workspace:manage_settings',
    WORKSPACE_DELETE: 'workspace:delete',

    // Task Management
    TASK_CREATE: 'task:create',
    TASK_DELETE: 'task:delete',
    TASK_ASSIGN: 'task:assign',
    TASK_MODIFY_DEADLINE: 'task:modify_deadline',
    TASK_MANAGE_STATES: 'task:manage_states',
    TASK_CHANGE_ANY_STATE: 'task:change_any_state',

    // Employee Permissions
    TASK_VIEW_ASSIGNED: 'task:view_assigned',
    TASK_UPDATE_PROGRESS: 'task:update_progress',
    TASK_ADD_COMMENT: 'task:add_comment',
    TASK_CHANGE_ALLOWED_STATE: 'task:change_allowed_state',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// =============================================================================
// ROLE-PERMISSION MAPPINGS
// =============================================================================

export const MANAGER_PERMISSIONS: Permission[] = [
    PERMISSIONS.WORKSPACE_MANAGE_MEMBERS,
    PERMISSIONS.WORKSPACE_INVITE_USERS,
    PERMISSIONS.WORKSPACE_MANAGE_SETTINGS,
    PERMISSIONS.WORKSPACE_DELETE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_MODIFY_DEADLINE,
    PERMISSIONS.TASK_MANAGE_STATES,
    PERMISSIONS.TASK_CHANGE_ANY_STATE,
    // Managers also have employee permissions
    PERMISSIONS.TASK_VIEW_ASSIGNED,
    PERMISSIONS.TASK_UPDATE_PROGRESS,
    PERMISSIONS.TASK_ADD_COMMENT,
    PERMISSIONS.TASK_CHANGE_ALLOWED_STATE,
];

export const EMPLOYEE_PERMISSIONS: Permission[] = [
    PERMISSIONS.TASK_VIEW_ASSIGNED,
    PERMISSIONS.TASK_UPDATE_PROGRESS,
    PERMISSIONS.TASK_ADD_COMMENT,
    PERMISSIONS.TASK_CHANGE_ALLOWED_STATE,
];

// =============================================================================
// STATE TRANSITION RULES
// =============================================================================

export interface StateTransition {
    from: TaskStatus;
    to: TaskStatus;
    allowedRoles: WorkspaceRole[];
}

/**
 * Default task state transitions
 * Managers can transition between any states
 * Employees can only make specific transitions
 */
export const DEFAULT_STATE_TRANSITIONS: StateTransition[] = [
    // Employee allowed transitions
    { from: 'todo', to: 'in_progress', allowedRoles: ['manager', 'employee'] },
    { from: 'in_progress', to: 'review', allowedRoles: ['manager', 'employee'] },
    { from: 'in_progress', to: 'todo', allowedRoles: ['manager', 'employee'] },

    // Manager only transitions
    { from: 'review', to: 'done', allowedRoles: ['manager'] },
    { from: 'review', to: 'in_progress', allowedRoles: ['manager'] },
    { from: 'done', to: 'todo', allowedRoles: ['manager'] },
    { from: 'done', to: 'in_progress', allowedRoles: ['manager'] },
    { from: 'todo', to: 'done', allowedRoles: ['manager'] }, // Skip states
];

// =============================================================================
// PERMISSION CHECKING FUNCTIONS
// =============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
    if (role === 'manager') {
        return MANAGER_PERMISSIONS.includes(permission);
    }
    return EMPLOYEE_PERMISSIONS.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: WorkspaceRole): Permission[] {
    return role === 'manager' ? MANAGER_PERMISSIONS : EMPLOYEE_PERMISSIONS;
}

/**
 * Check if a role can transition a task between states
 */
export function canTransitionState(
    role: WorkspaceRole,
    fromState: TaskStatus,
    toState: TaskStatus,
    transitions: StateTransition[] = DEFAULT_STATE_TRANSITIONS
): boolean {
    // Same state - no transition needed
    if (fromState === toState) return true;

    // Find the transition rule
    const transition = transitions.find(
        t => t.from === fromState && t.to === toState
    );

    if (!transition) return false;

    return transition.allowedRoles.includes(role);
}

/**
 * Get allowed next states for a task given current state and role
 */
export function getAllowedNextStates(
    role: WorkspaceRole,
    currentState: TaskStatus,
    transitions: StateTransition[] = DEFAULT_STATE_TRANSITIONS
): TaskStatus[] {
    return transitions
        .filter(t => t.from === currentState && t.allowedRoles.includes(role))
        .map(t => t.to);
}

// =============================================================================
// TASK STATUS CONFIGURATION
// =============================================================================

export const TASK_STATUSES: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-200' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { id: 'review', label: 'Review', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    { id: 'done', label: 'Done', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
];

export const TASK_PRIORITIES: { id: string; label: string; color: string }[] = [
    { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

/**
 * Get status configuration by ID
 */
export function getStatusConfig(status: TaskStatus) {
    return TASK_STATUSES.find(s => s.id === status) || TASK_STATUSES[0];
}

/**
 * Get priority configuration by ID
 */
export function getPriorityConfig(priority: string) {
    return TASK_PRIORITIES.find(p => p.id === priority) || TASK_PRIORITIES[1];
}
