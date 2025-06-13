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

-- Create RLS policies
ALTER TABLE headlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Headlines policies
CREATE POLICY "Public headlines are viewable by everyone"
    ON headlines FOR SELECT
    USING (is_published = true);

CREATE POLICY "Editors can view all headlines"
    ON headlines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can insert headlines"
    ON headlines FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can update headlines"
    ON headlines FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'editor')
        )
    );

-- User profiles policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admins can update any profile"
    ON user_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

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