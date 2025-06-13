-- Add draft column to headlines table
ALTER TABLE headlines
ADD COLUMN draft BOOLEAN DEFAULT true;

-- Add index for better query performance
CREATE INDEX idx_headlines_draft ON headlines(draft); 