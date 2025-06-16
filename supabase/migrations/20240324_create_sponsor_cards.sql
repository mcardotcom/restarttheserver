-- Create admin_users table first
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sponsor_cards table
CREATE TABLE IF NOT EXISTS sponsor_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    partner TEXT DEFAULT 'Ad' NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to all users" ON sponsor_cards;
DROP POLICY IF EXISTS "Allow admin users to manage sponsor cards" ON sponsor_cards;

-- Create RLS policies
ALTER TABLE sponsor_cards ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users (public)
CREATE POLICY "Allow read access to all users" ON sponsor_cards
    FOR SELECT
    USING (true);

-- Allow insert/update/delete only to admin users
CREATE POLICY "Allow admin users to manage sponsor cards" ON sponsor_cards
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_sponsor_cards_updated_at ON sponsor_cards;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sponsor_cards_updated_at
    BEFORE UPDATE ON sponsor_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 