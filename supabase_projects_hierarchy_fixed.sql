-- =====================================================
-- COMPLETE 3-LEVEL HIERARCHY SYSTEM FOR PROJECTS
-- Project → Task → Subtask
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS project_tree_view CASCADE;
DROP VIEW IF EXISTS project_tasks_view CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_project_tree(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_project_tasks(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_task_subtasks(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_parent_status() CASCADE;

-- Create or modify projects table with hierarchy support
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic fields
  title TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy fields
  item_type TEXT NOT NULL CHECK (item_type IN ('project', 'task', 'subtask')),
  parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 2),
  project_order INTEGER DEFAULT 0,
  
  -- Status and priority
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'need-help', 'failed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Dependencies
  dependencies UUID[] DEFAULT '{}',
  
  -- Timestamps
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_hierarchy CHECK (
    (item_type = 'project' AND level = 0 AND parent_id IS NULL) OR
    (item_type = 'task' AND level = 1 AND parent_id IS NOT NULL) OR
    (item_type = 'subtask' AND level = 2 AND parent_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_item_type ON projects(item_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_level ON projects(level);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create RLS policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get complete project tree
CREATE OR REPLACE FUNCTION get_project_tree(project_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'project', row_to_json(p.*),
    'tasks', (
      SELECT json_agg(
        json_build_object(
          'task', row_to_json(t.*),
          'subtasks', (
            SELECT json_agg(row_to_json(s.*))
            FROM projects s
            WHERE s.parent_id = t.id AND s.item_type = 'subtask'
          )
        )
      )
      FROM projects t
      WHERE t.parent_id = p.id AND t.item_type = 'task'
    )
  ) INTO result
  FROM projects p
  WHERE p.id = project_id AND p.item_type = 'project';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get all tasks for a project
CREATE OR REPLACE FUNCTION get_project_tasks(project_id UUID)
RETURNS TABLE (
  task_id UUID,
  task_title TEXT,
  task_status TEXT,
  task_priority TEXT,
  subtask_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    COUNT(s.id) as subtask_count
  FROM projects t
  LEFT JOIN projects s ON s.parent_id = t.id AND s.item_type = 'subtask'
  WHERE t.parent_id = project_id AND t.item_type = 'task'
  GROUP BY t.id, t.title, t.status, t.priority;
END;
$$ LANGUAGE plpgsql;

-- Function to get all subtasks for a task
CREATE OR REPLACE FUNCTION get_task_subtasks(task_id UUID)
RETURNS TABLE (
  subtask_id UUID,
  subtask_title TEXT,
  subtask_status TEXT,
  subtask_priority TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    title,
    status,
    priority
  FROM projects
  WHERE parent_id = task_id AND item_type = 'subtask';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTO-UPDATE PARENT STATUS TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_parent_status()
RETURNS TRIGGER AS $$
DECLARE
  parent_record RECORD;
  all_completed BOOLEAN;
  any_in_progress BOOLEAN;
  new_status TEXT;
BEGIN
  -- Only process if this is a task or subtask
  IF NEW.item_type IN ('task', 'subtask') AND NEW.parent_id IS NOT NULL THEN
    
    -- Get parent record
    SELECT * INTO parent_record FROM projects WHERE id = NEW.parent_id;
    
    -- Check if all children are completed
    SELECT 
      BOOL_AND(status = 'completed'),
      BOOL_OR(status = 'in-progress')
    INTO all_completed, any_in_progress
    FROM projects
    WHERE parent_id = NEW.parent_id;
    
    -- Determine new status
    IF all_completed THEN
      new_status := 'completed';
    ELSIF any_in_progress THEN
      new_status := 'in-progress';
    ELSE
      new_status := parent_record.status; -- Keep current status
    END IF;
    
    -- Update parent status if changed
    IF parent_record.status != new_status THEN
      UPDATE projects
      SET 
        status = new_status,
        updated_at = NOW(),
        completed_at = CASE WHEN new_status = 'completed' THEN NOW() ELSE NULL END
      WHERE id = NEW.parent_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_parent_status ON projects;

-- Create trigger
CREATE TRIGGER trigger_update_parent_status
  AFTER INSERT OR UPDATE OF status
  ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_status();

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View for project tree (projects with task counts)
CREATE OR REPLACE VIEW project_tree_view AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.description,
  p.status,
  p.priority,
  p.due_date,
  p.created_at,
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT s.id) as subtask_count,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_subtasks
FROM projects p
LEFT JOIN projects t ON t.parent_id = p.id AND t.item_type = 'task'
LEFT JOIN projects s ON s.parent_id = t.id AND s.item_type = 'subtask'
WHERE p.item_type = 'project'
GROUP BY p.id, p.user_id, p.title, p.description, p.status, p.priority, p.due_date, p.created_at;

-- View for tasks with subtask counts
CREATE OR REPLACE VIEW project_tasks_view AS
SELECT 
  t.id,
  t.user_id,
  t.parent_id as project_id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.due_date,
  t.created_at,
  COUNT(s.id) as subtask_count,
  COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_subtasks
FROM projects t
LEFT JOIN projects s ON s.parent_id = t.id AND s.item_type = 'subtask'
WHERE t.item_type = 'task'
GROUP BY t.id, t.user_id, t.parent_id, t.title, t.description, t.status, t.priority, t.due_date, t.created_at;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON project_tree_view TO authenticated;
GRANT SELECT ON project_tasks_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_tree(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_tasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_subtasks(UUID) TO authenticated;
