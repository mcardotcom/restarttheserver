-- Add moderation fields to headlines table
ALTER TABLE headlines
ADD COLUMN IF NOT EXISTS moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Create index for faster moderation status queries
CREATE INDEX IF NOT EXISTS idx_headlines_moderation_status ON headlines(moderation_status); 