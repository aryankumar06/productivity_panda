-- Create projects table (separate from tasks)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'need-help', 'failed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_order INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  dependencies TEXT[] DEFAULT '{}',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Create a view for hierarchical projects
CREATE OR REPLACE VIEW project_hierarchy AS
WITH RECURSIVE project_tree AS (
  -- Base case: root projects (no parent)
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
  
  -- Recursive case: child projects
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

-- Function to update parent project status based on children
CREATE OR REPLACE FUNCTION update_parent_project_status()
RETURNS TRIGGER AS $$
DECLARE
  parent_project_id UUID;
  all_completed BOOLEAN;
  any_in_progress BOOLEAN;
BEGIN
  -- Get the parent project ID
  parent_project_id := COALESCE(NEW.parent_id, OLD.parent_id);
  
  IF parent_project_id IS NOT NULL THEN
    -- Check if all child projects are completed
    SELECT 
      bool_and(status = 'completed'),
      bool_or(status = 'in-progress')
    INTO all_completed, any_in_progress
    FROM projects
    WHERE parent_id = parent_project_id;
    
    -- Update parent status
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

-- Create trigger to auto-update parent project status
DROP TRIGGER IF EXISTS trigger_update_parent_project_status ON projects;
CREATE TRIGGER trigger_update_parent_project_status
AFTER INSERT OR UPDATE OF status ON projects
FOR EACH ROW
EXECUTE FUNCTION update_parent_project_status();

-- Function to get all subprojects of a project
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

-- Add comments for documentation
COMMENT ON TABLE projects IS 'Hierarchical project management system (separate from tasks)';
COMMENT ON COLUMN projects.parent_id IS 'Reference to parent project for hierarchical structure';
COMMENT ON COLUMN projects.project_order IS 'Custom ordering within parent project group';
COMMENT ON COLUMN projects.level IS 'Depth level in the hierarchy (0 = root)';
COMMENT ON COLUMN projects.dependencies IS 'Array of project IDs this project depends on';
COMMENT ON VIEW project_hierarchy IS 'Hierarchical view of all projects with level and path information';
COMMENT ON FUNCTION get_subprojects IS 'Recursively get all subprojects of a given project';
