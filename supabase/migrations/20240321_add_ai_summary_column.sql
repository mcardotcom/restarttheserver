-- Add ai_summary column to headlines table
ALTER TABLE headlines
ADD COLUMN ai_summary BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_headlines_ai_summary ON headlines(ai_summary); 