-- Drop existing tables and policies
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS headlines CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create headlines table
CREATE TABLE headlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    summary TEXT,
    flame_score INTEGER CHECK (flame_score BETWEEN 1 AND 5),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_breaking BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    category TEXT,
    metadata JSONB
);

-- Create indexes for better query performance
CREATE INDEX idx_headlines_published_at ON headlines(published_at);
CREATE INDEX idx_headlines_is_published ON headlines(is_published);
CREATE INDEX idx_headlines_flame_score ON headlines(flame_score);
CREATE INDEX idx_headlines_category ON headlines(category);

-- Create user profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position TEXT NOT NULL,
    ad_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create error logs table
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_type TEXT NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Disable RLS on headlines since it's meant to be public
ALTER TABLE headlines DISABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public headlines are viewable by everyone" ON headlines;
DROP POLICY IF EXISTS "Editors can view all headlines" ON headlines;
DROP POLICY IF EXISTS "Editors can insert headlines" ON headlines;
DROP POLICY IF EXISTS "Editors can update headlines" ON headlines;
DROP POLICY IF EXISTS "Allow authenticated users to delete headlines" ON headlines;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

-- Create simplified user_profiles policies
CREATE POLICY "Allow public read access to profiles"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Allow individual update access"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Ads policies
CREATE POLICY "Public ads are viewable by everyone"
    ON ads FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage ads"
    ON ads FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Error logs policies
CREATE POLICY "Admins can view error logs"
    ON error_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_headlines_updated_at
    BEFORE UPDATE ON headlines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON ads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 