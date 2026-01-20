/**
 * Hook to get the current user's role in a workspace
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WorkspaceRole } from '../lib/database.types';

interface UseWorkspaceRoleResult {
    role: WorkspaceRole | null;
    isManager: boolean;
    isEmployee: boolean;
    isMember: boolean;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useWorkspaceRole(workspaceId: string | null): UseWorkspaceRoleResult {
    const { user } = useAuth();
    const [role, setRole] = useState<WorkspaceRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRole = async () => {
        if (!workspaceId || !user) {
            setRole(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('workspace_members')
                .select('role')
                .eq('workspace_id', workspaceId)
                .eq('user_id', user.id)
                .single();

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    // No rows returned - user is not a member
                    setRole(null);
                } else {
                    setError(fetchError.message);
                }
            } else {
                setRole(data?.role as WorkspaceRole || null);
            }
        } catch (err) {
            setError('Failed to fetch workspace role');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRole();
    }, [workspaceId, user?.id]);

    return {
        role,
        isManager: role === 'manager',
        isEmployee: role === 'employee',
        isMember: role !== null,
        loading,
        error,
        refetch: fetchRole,
    };
}
