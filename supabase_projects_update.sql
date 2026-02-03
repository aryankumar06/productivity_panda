-- Check if projects table exists and add missing columns if needed
-- Run this instead of the full migration

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add parent_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN parent_id UUID REFERENCES projects(id) ON DELETE CASCADE;
  END IF;

  -- Add project_order if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'project_order'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_order INTEGER DEFAULT 0;
  END IF;

  -- Add level if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'level'
  ) THEN
    ALTER TABLE projects ADD COLUMN level INTEGER DEFAULT 0;
  END IF;

  -- Add dependencies if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'dependencies'
  ) THEN
    ALTER TABLE projects ADD COLUMN dependencies TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Create or replace the view (this will update if it exists)
CREATE OR REPLACE VIEW project_hierarchy AS
WITH RECURSIVE project_tree AS (
  SELECT 
    id,
    parent_id,
    user_id,
    title,
    description,
    status,
    priority,
    due_date,
    project_order,
    0 as level,
    ARRAY[id] as path,
    created_at,
    updated_at,
    completed_at
  FROM projects
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    p.id,
    p.parent_id,
    p.user_id,
    p.title,
    p.description,
    p.status,
    p.priority,
    p.due_date,
    p.project_order,
    pt.level + 1,
    pt.path || p.id,
    p.created_at,
    p.updated_at,
    p.completed_at
  FROM projects p
  INNER JOIN project_tree pt ON p.parent_id = pt.id
)
SELECT * FROM project_tree
ORDER BY path, project_order;

-- Create or replace functions
CREATE OR REPLACE FUNCTION update_parent_project_status()
RETURNS TRIGGER AS $$
DECLARE
  parent_project_id UUID;
  all_completed BOOLEAN;
  any_in_progress BOOLEAN;
BEGIN
  parent_project_id := COALESCE(NEW.parent_id, OLD.parent_id);
  
  IF parent_project_id IS NOT NULL THEN
    SELECT 
      bool_and(status = 'completed'),
      bool_or(status = 'in-progress')
    INTO all_completed, any_in_progress
    FROM projects
    WHERE parent_id = parent_project_id;
    
    IF all_completed THEN
      UPDATE projects 
      SET status = 'completed', 
          updated_at = NOW(),
          completed_at = NOW()
      WHERE id = parent_project_id;
    ELSIF any_in_progress THEN
      UPDATE projects 
      SET status = 'in-progress', 
          updated_at = NOW()
      WHERE id = parent_project_id AND status = 'pending';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_update_parent_project_status ON projects;
CREATE TRIGGER trigger_update_parent_project_status
AFTER INSERT OR UPDATE OF status ON projects
FOR EACH ROW
EXECUTE FUNCTION update_parent_project_status();

-- Create or replace get_subprojects function
CREATE OR REPLACE FUNCTION get_subprojects(project_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subproject_tree AS (
    SELECT 
      p.id,
      p.title,
      p.description,
      p.status,
      p.priority,
      0 as level
    FROM projects p
    WHERE p.parent_id = project_id
    
    UNION ALL
    
    SELECT 
      p.id,
      p.title,
      p.description,
      p.status,
      p.priority,
      st.level + 1
    FROM projects p
    INNER JOIN subproject_tree st ON p.parent_id = st.id
  )
  SELECT * FROM subproject_tree
  ORDER BY level, title;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Projects table updated successfully! You can now use the Projects tab.';
END $$;
