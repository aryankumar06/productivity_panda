# 🎯 3-Level Hierarchy System - Complete Guide

## Structure Overview

```
📦 Project (Level 0)
├── 📋 Task 1 (Level 1)
│   ├── ✓ Subtask 1.1 (Level 2)
│   ├── ⟳ Subtask 1.2 (Level 2)
│   └── ○ Subtask 1.3 (Level 2)
├── 📋 Task 2 (Level 1)
│   ├── ✓ Subtask 2.1 (Level 2)
│   └── ○ Subtask 2.2 (Level 2)
└── 📋 Task 3 (Level 1)
```

**Each level has its own status!**

---

## 🗄️ Database Structure

### Single Table: `projects`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `user_id` | UUID | Owner |
| `title` | TEXT | Name |
| `description` | TEXT | Details |
| `status` | TEXT | pending/in-progress/completed/need-help/failed |
| `priority` | TEXT | low/medium/high |
| `item_type` | TEXT | **project/task/subtask** |
| `parent_id` | UUID | Parent item ID (NULL for projects) |
| `level` | INTEGER | 0=project, 1=task, 2=subtask |
| `project_order` | INTEGER | Sort order |
| `dependencies` | TEXT[] | Dependent item IDs |
| `due_date` | DATE | Deadline |

---

## 🎯 How It Works

### Level 0: Projects
```sql
item_type = 'project'
level = 0
parent_id = NULL
```
- Top-level containers
- Created via "Add Project" button
- Can contain multiple tasks

### Level 1: Tasks
```sql
item_type = 'task'
level = 1
parent_id = <project_id>
```
- Belong to a project
- Can contain multiple subtasks
- Have their own status

### Level 2: Subtasks
```sql
item_type = 'subtask'
level = 2
parent_id = <task_id>
```
- Belong to a task
- Smallest unit of work
- Have their own status

---

## 🚀 Setup Instructions

### Step 1: Run Migration
```bash
# In Supabase SQL Editor:
Run: supabase_projects_hierarchy.sql
```

This will:
- ✅ Add `item_type` column
- ✅ Add `level` column  
- ✅ Add `parent_id` for hierarchy
- ✅ Create helper functions
- ✅ Set up auto-update triggers

### Step 2: Refresh Browser
```bash
# Your dev server should auto-reload
# If not, refresh manually
```

---

## 💡 Features

### Auto-Status Updates
When all subtasks are completed → Task becomes completed
When all tasks are completed → Project becomes completed

### Helper Functions

#### 1. Get Full Project Tree
```sql
SELECT * FROM get_project_tree('project-uuid');
```
Returns: Project + all tasks + all subtasks

#### 2. Get Project Tasks
```sql
SELECT * FROM get_project_tasks('project-uuid');
```
Returns: All tasks under a project (with subtask count)

#### 3. Get Task Subtasks
```sql
SELECT * FROM get_task_subtasks('task-uuid');
```
Returns: All subtasks under a task

---

## 🎨 UI Flow (Coming Next)

### Projects Tab:

1. **View Projects**
   - List of all projects
   - Click to expand → see tasks
   - Click task → see subtasks

2. **Add Project**
   - Click "Add Project" button
   - Fill form
   - Creates level-0 item

3. **Add Task** (under project)
   - Click "+" next to project
   - Creates level-1 item
   - `parent_id` = project ID

4. **Add Subtask** (under task)
   - Click "+" next to task
   - Creates level-2 item
   - `parent_id` = task ID

5. **Update Status**
   - Click status icon
   - Cycles through states
   - Auto-updates parent if all children complete

---

## 📊 Example Data

```sql
-- Project
INSERT INTO projects (title, item_type, level, parent_id) 
VALUES ('Build Mobile App', 'project', 0, NULL);

-- Task under project
INSERT INTO projects (title, item_type, level, parent_id) 
VALUES ('Design UI', 'task', 1, '<project_id>');

-- Subtask under task
INSERT INTO projects (title, item_type, level, parent_id) 
VALUES ('Create wireframes', 'subtask', 2, '<task_id>');
```

---

## ✅ Status Flow

### Subtask Status Change:
```
Subtask: pending → in-progress → completed
         ↓
Task: Checks all subtasks
      If all completed → Task = completed
         ↓
Project: Checks all tasks
         If all completed → Project = completed
```

---

## 🔧 Next Steps

### Phase 1: Database ✅
- [x] Create 3-level structure
- [x] Add helper functions
- [x] Set up triggers

### Phase 2: UI (Next)
- [ ] Add "Add Task" button under projects
- [ ] Add "Add Subtask" button under tasks
- [ ] Expand/collapse functionality
- [ ] Visual hierarchy (indentation, lines)
- [ ] Inline editing

### Phase 3: Advanced
- [ ] Drag-and-drop reordering
- [ ] Dependencies visualization
- [ ] Progress bars
- [ ] GitHub integration

---

## 📝 Summary

**Database**: ✅ Ready!
- Single `projects` table
- 3 levels via `item_type` and `parent_id`
- Auto-status updates via triggers

**UI**: 🚧 Next step
- Need to add Task/Subtask creation
- Need expand/collapse for hierarchy
- Need visual indicators

---

**Run `supabase_projects_hierarchy.sql` to enable 3-level hierarchy!** 🚀
