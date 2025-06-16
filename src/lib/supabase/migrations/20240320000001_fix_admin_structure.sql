-- First, clean up duplicate admin entries in user_profiles
DELETE FROM user_profiles 
WHERE id IN (
    SELECT id 
    FROM user_profiles 
    WHERE role = 'admin'
    GROUP BY id 
    HAVING COUNT(*) > 1
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users are viewable by authenticated users only" ON admin_users;
DROP POLICY IF EXISTS "Admin users are insertable by service role only" ON admin_users;
DROP POLICY IF EXISTS "Admin users are updatable by service role only" ON admin_users;

-- Drop and recreate admin_users table to ensure correct structure
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up RLS policies for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users are viewable by authenticated users only"
    ON admin_users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin users are insertable by service role only"
    ON admin_users FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Admin users are updatable by service role only"
    ON admin_users FOR UPDATE
    TO service_role
    USING (true);

-- Migrate existing admin users to admin_users table
INSERT INTO admin_users (id, email, created_at, updated_at)
SELECT 
    up.id,
    au.email,
    au.created_at,
    au.updated_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- Update user_profiles to set role to editor (since it's now in admin_users)
UPDATE user_profiles
SET role = 'editor'
WHERE role = 'admin'; 