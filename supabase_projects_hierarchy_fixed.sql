-- Fixed: 3-Level Hierarchy Migration
-- Drops existing views first, then recreates everything

-- Step 1: Drop existing views and triggers
DROP VIEW IF EXISTS project_hierarchy CASCADE;
DROP TRIGGER IF EXISTS trigger_update_parent_status ON projects;
DROP TRIGGER IF EXISTS trigger_update_parent_project_status ON projects;
DROP FUNCTION IF EXISTS update_parent_status() CASCADE;
DROP FUNCTION IF EXISTS update_parent_project_status() CASCADE;
DROP FUNCTION IF EXISTS get_project_tree(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_subprojects(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_project_tasks(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_task_subtasks(UUID) CASCADE;

-- Step 2: Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add item_type (NEW - for project/task/subtask distinction)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'item_type'
  ) THEN
    ALTER TABLE projects ADD COLUMN item_type TEXT DEFAULT 'project' CHECK (item_type IN ('project', 'task', 'subtask'));
    -- Update existing records to be 'project' type
    UPDATE projects SET item_type = 'project' WHERE item_type IS NULL;
  END IF;

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

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_item_type ON projects(item_type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Step 4: Create hierarchical view (fresh)
CREATE VIEW project_hierarchy AS
WITH RECURSIVE project_tree AS (
  -- Root level: Projects only (no parent)
  SELECT 
    id,
    parent_id,
    user_id,
    title,
    description,
    status,
    priority,
    item_type,
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
  
  -- Recursive: Tasks and Subtasks
  SELECT 
    p.id,
    p.parent_id,
    p.user_id,
    p.title,
    p.description,
    p.status,
    p.priority,
    p.item_type,
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

-- Step 5: Create helper functions

-- Function to get full project tree
CREATE FUNCTION get_project_tree(project_id UUID)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  item_type TEXT,
  level INTEGER,
  due_date DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE tree AS (
    SELECT 
      p.id,
      p.parent_id,
      p.title,
      p.description,
      p.status,
      p.priority,
      p.item_type,
      0 as level,
      p.due_date
    FROM projects p
    WHERE p.id = project_id
    
    UNION ALL
    
    SELECT 
      p.id,
      p.parent_id,
      p.title,
      p.description,
      p.status,
      p.priority,
      p.item_type,
      t.level + 1,
      p.due_date
    FROM projects p
    INNER JOIN tree t ON p.parent_id = t.id
  )
  SELECT * FROM tree
  ORDER BY level, project_order;
END;
$$ LANGUAGE plpgsql;

-- Function to update parent status
CREATE FUNCTION update_parent_status()
RETURNS TRIGGER AS $$
DECLARE
  parent_item_id UUID;
  all_completed BOOLEAN;
  any_in_progress BOOLEAN;
  has_children BOOLEAN;
BEGIN
  parent_item_id := COALESCE(NEW.parent_id, OLD.parent_id);
  
  IF parent_item_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM projects WHERE parent_id = parent_item_id)
    INTO has_children;
    
    IF has_children THEN
      SELECT 
        bool_and(status = 'completed'),
        bool_or(status = 'in-progress')
      INTO all_completed, any_in_progress
      FROM projects
      WHERE parent_id = parent_item_id;
      
      IF all_completed THEN
        UPDATE projects 
        SET status = 'completed', 
            updated_at = NOW(),
            completed_at = NOW()
        WHERE id = parent_item_id;
      ELSIF any_in_progress THEN
        UPDATE projects 
        SET status = 'in-progress', 
            updated_at = NOW()
        WHERE id = parent_item_id AND status = 'pending';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_parent_status
AFTER INSERT OR UPDATE OF status ON projects
FOR EACH ROW
EXECUTE FUNCTION update_parent_status();

-- Function to get all tasks under a project
CREATE FUNCTION get_project_tasks(project_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT,
  subtask_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.status,
    p.priority,
    COUNT(sub.id) as subtask_count
  FROM projects p
  LEFT JOIN projects sub ON sub.parent_id = p.id AND sub.item_type = 'subtask'
  WHERE p.parent_id = project_id AND p.item_type = 'task'
  GROUP BY p.id, p.title, p.description, p.status, p.priority
  ORDER BY p.project_order;
END;
$$ LANGUAGE plpgsql;

-- Function to get all subtasks under a task
CREATE FUNCTION get_task_subtasks(task_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  priority TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.status,
    p.priority
  FROM projects p
  WHERE p.parent_id = task_id AND p.item_type = 'subtask'
  ORDER BY p.project_order;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Add helpful comments
COMMENT ON COLUMN projects.item_type IS 'Type: project (level 0), task (level 1), or subtask (level 2)';
COMMENT ON COLUMN projects.parent_id IS 'Parent ID - NULL for projects, project_id for tasks, task_id for subtasks';
COMMENT ON COLUMN projects.level IS 'Hierarchy level: 0=project, 1=task, 2=subtask';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ 3-Level Hierarchy Ready!';
  RAISE NOTICE 'Structure: Project → Tasks → Subtasks';
  RAISE NOTICE 'All items can have their own status!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Add UI for creating tasks and subtasks';
END $$;
