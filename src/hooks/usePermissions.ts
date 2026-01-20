/**
 * Hook to check permissions for the current user in a workspace
 */

import { useMemo, useCallback } from 'react';
import { useWorkspaceRole } from './useWorkspaceRole';
import {
    Permission,
    hasPermission as checkPermission,
    canTransitionState,
    getAllowedNextStates,
    DEFAULT_STATE_TRANSITIONS,
} from '../lib/permissions';
import { TaskStatus } from '../lib/database.types';

interface UsePermissionsResult {
    // Role info
    role: 'manager' | 'employee' | null;
    isManager: boolean;
    isEmployee: boolean;
    isMember: boolean;
    loading: boolean;

    // Permission checks
    can: (permission: Permission) => boolean;
    canTransition: (from: TaskStatus, to: TaskStatus) => boolean;
    allowedNextStates: (currentState: TaskStatus) => TaskStatus[];

    // Common permission shortcuts
    canManageMembers: boolean;
    canInviteUsers: boolean;
    canCreateTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
    canModifyDeadlines: boolean;
    canAddComments: boolean;
}

export function usePermissions(workspaceId: string | null): UsePermissionsResult {
    const { role, isManager, isEmployee, isMember, loading } = useWorkspaceRole(workspaceId);

    const can = useCallback((permission: Permission): boolean => {
        if (!role) return false;
        return checkPermission(role, permission);
    }, [role]);

    const canTransition = useCallback((from: TaskStatus, to: TaskStatus): boolean => {
        if (!role) return false;
        return canTransitionState(role, from, to, DEFAULT_STATE_TRANSITIONS);
    }, [role]);

    const allowedNextStates = useCallback((currentState: TaskStatus): TaskStatus[] => {
        if (!role) return [];
        return getAllowedNextStates(role, currentState, DEFAULT_STATE_TRANSITIONS);
    }, [role]);

    // Memoized permission shortcuts
    const permissions = useMemo(() => ({
        canManageMembers: role ? checkPermission(role, 'workspace:manage_members') : false,
        canInviteUsers: role ? checkPermission(role, 'workspace:invite_users') : false,
        canCreateTasks: role ? checkPermission(role, 'task:create') : false,
        canDeleteTasks: role ? checkPermission(role, 'task:delete') : false,
        canAssignTasks: role ? checkPermission(role, 'task:assign') : false,
        canModifyDeadlines: role ? checkPermission(role, 'task:modify_deadline') : false,
        canAddComments: role ? checkPermission(role, 'task:add_comment') : false,
    }), [role]);

    return {
        role,
        isManager,
        isEmployee,
        isMember,
        loading,
        can,
        canTransition,
        allowedNextStates,
        ...permissions,
    };
}
