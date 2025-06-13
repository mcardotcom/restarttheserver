-- First, disable RLS temporarily to ensure we can clean up
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON user_profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON user_profiles;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create new, simple SELECT policy
CREATE POLICY "Allow individual read access"
    ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Create new, simple UPDATE policy
CREATE POLICY "Allow individual update access"
    ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Create INSERT policy for new users
CREATE POLICY "Allow users to insert their own profile"
    ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id); 