-- Quick check to see if projects table is ready
-- Run this to verify everything is set up correctly

-- Check if projects table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects')
    THEN '✅ Projects table exists'
    ELSE '❌ Projects table NOT found'
  END as table_status;

-- Check columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'projects';

-- Check policies
SELECT 
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'projects';

-- Count existing projects
SELECT 
  COUNT(*) as total_projects,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM projects;
