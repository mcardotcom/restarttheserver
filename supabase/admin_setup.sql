-- First, let's see what users we have
SELECT id, email, created_at 
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- After you have the UUID from the query above, uncomment and run this:
-- INSERT INTO user_profiles (id, role)
-- VALUES ('PASTE_UUID_HERE', 'admin')
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin'; 

-- Create admin profile for the user
INSERT INTO user_profiles (id, role)
VALUES ('d01b473a-49e5-4329-9981-5afe6dcabf1a', 'admin')
ON CONFLICT (id) DO UPDATE
SET role = 'admin'; 