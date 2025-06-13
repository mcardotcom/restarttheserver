-- Restore necessary columns to headlines table
ALTER TABLE headlines
ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_summary BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_headlines_draft ON headlines(draft);
CREATE INDEX IF NOT EXISTS idx_headlines_published ON headlines(published);
CREATE INDEX IF NOT EXISTS idx_headlines_ai_summary ON headlines(ai_summary);

-- Restore RLS policies
DROP POLICY IF EXISTS "Allow public read access to headlines" ON headlines;
DROP POLICY IF EXISTS "Allow authenticated users to manage headlines" ON headlines;

CREATE POLICY "Public headlines are viewable by everyone"
    ON headlines FOR SELECT
    USING (true);

CREATE POLICY "Editors can view all headlines"
    ON headlines FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can insert headlines"
    ON headlines FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can update headlines"
    ON headlines FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors can delete headlines"
    ON headlines FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    ); 