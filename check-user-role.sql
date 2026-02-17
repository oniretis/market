-- Check if your user exists and has admin role
-- Replace 'your-user-id-here' with the actual Kinde user ID

SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  is_active,
  created_at
FROM users 
WHERE email = 'your-email@example.com'  -- Replace with your email
   OR id = 'your-user-id-here';        -- Replace with your Kinde user ID

-- If user exists but role is 'USER', update it:
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
