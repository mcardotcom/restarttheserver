-- Add published column to headlines table
ALTER TABLE headlines
ADD COLUMN published BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_headlines_published ON headlines(published); 