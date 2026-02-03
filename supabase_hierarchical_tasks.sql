-- Add parent_id column to tasks table for hierarchical structure
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- Add index for faster parent-child queries
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);

-- Add order column for custom task ordering within a parent
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS task_order INTEGER DEFAULT 0;

-- Create a view for easier hierarchical queries
CREATE OR REPLACE VIEW task_hierarchy AS
WITH RECURSIVE task_tree AS (
  -- Base case: root tasks (no parent)
  SELECT 
    id,
    parent_id,
    user_id,
    title,
    description,
    status,
    priority,
    due_date,
    task_order,
    0 as level,
    ARRAY[id] as path
  FROM tasks
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child tasks
  SELECT 
    t.id,
    t.parent_id,
    t.user_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.task_order,
    tt.level + 1,
    tt.path || t.id
  FROM tasks t
  INNER JOIN task_tree tt ON t.parent_id = tt.id
)
SELECT * FROM task_tree
ORDER BY path, task_order;

-- Function to get all subtasks of a task
CREATE OR REPLACE FUNCTION get_subtasks(task_id UUID)
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
  WITH RECURSIVE subtask_tree AS (
    SELECT 
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      0 as level
    FROM tasks t
    WHERE t.parent_id = task_id
    
    UNION ALL
    
    SELECT 
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      st.level + 1
    FROM tasks t
    INNER JOIN subtask_tree st ON t.parent_id = st.id
  )
  SELECT * FROM subtask_tree
  ORDER BY level, title;
END;
$$ LANGUAGE plpgsql;

-- Function to update parent task status based on children
CREATE OR REPLACE FUNCTION update_parent_task_status()
RETURNS TRIGGER AS $$
DECLARE
  parent_task_id UUID;
  all_completed BOOLEAN;
  any_in_progress BOOLEAN;
BEGIN
  -- Get the parent task ID
  parent_task_id := COALESCE(NEW.parent_id, OLD.parent_id);
  
  IF parent_task_id IS NOT NULL THEN
    -- Check if all child tasks are completed
    SELECT 
      bool_and(status = 'completed'),
      bool_or(status = 'in_progress')
    INTO all_completed, any_in_progress
    FROM tasks
    WHERE parent_id = parent_task_id;
    
    -- Update parent status
    IF all_completed THEN
      UPDATE tasks 
      SET status = 'completed', updated_at = NOW()
      WHERE id = parent_task_id;
    ELSIF any_in_progress THEN
      UPDATE tasks 
      SET status = 'in_progress', updated_at = NOW()
      WHERE id = parent_task_id AND status = 'todo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update parent task status
DROP TRIGGER IF EXISTS trigger_update_parent_status ON tasks;
CREATE TRIGGER trigger_update_parent_status
AFTER INSERT OR UPDATE OF status ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_parent_task_status();

-- Add comments for documentation
COMMENT ON COLUMN tasks.parent_id IS 'Reference to parent task for hierarchical structure';
COMMENT ON COLUMN tasks.task_order IS 'Custom ordering within parent task group';
COMMENT ON VIEW task_hierarchy IS 'Hierarchical view of all tasks with level and path information';
COMMENT ON FUNCTION get_subtasks IS 'Recursively get all subtasks of a given task';
