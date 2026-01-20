export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserType = 'student' | 'creator' | 'professional';
export type WorkspaceRole = 'manager' | 'employee';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'alert' | 'invite' | 'mention' | 'update' | 'info';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          user_type: UserType
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          user_type?: UserType
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          user_type?: UserType
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: WorkspaceRole
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: WorkspaceRole
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: WorkspaceRole
          joined_at?: string
        }
      }
      workspace_invites: {
        Row: {
          id: string
          workspace_id: string
          inviter_id: string
          invitee_email: string | null
          invitee_id: string | null
          status: InviteStatus
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          inviter_id: string
          invitee_email?: string | null
          invitee_id?: string | null
          status?: InviteStatus
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          inviter_id?: string
          invitee_email?: string | null
          invitee_id?: string | null
          status?: InviteStatus
          created_at?: string
        }
      }
      workspace_tasks: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          assignee_id: string | null
          created_by: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assignee_id?: string | null
          created_by: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          assignee_id?: string | null
          created_by?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
      // Existing tables
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          status: 'todo' | 'in_progress' | 'completed'
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'completed'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'completed'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          frequency: 'daily' | 'weekly'
          target_days: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          frequency?: 'daily' | 'weekly'
          target_days?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          frequency?: 'daily' | 'weekly'
          target_days?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_date?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          event_date: string
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          event_date: string
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          event_date?: string
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    },
    Views: {
      [_ in never]: never
    },
    Functions: {
      get_workspace_role: {
        Args: { ws_id: string; uid: string }
        Returns: WorkspaceRole | null
      }
      is_workspace_manager: {
        Args: { ws_id: string; uid: string }
        Returns: boolean
      }
    },
    Enums: {
      [_ in never]: never
    }
  }
}
