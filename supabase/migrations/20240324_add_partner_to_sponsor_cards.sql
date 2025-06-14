-- Add partner column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sponsor_cards' 
        AND column_name = 'partner'
    ) THEN
        ALTER TABLE sponsor_cards ADD COLUMN partner TEXT DEFAULT 'Ad' NOT NULL;
    END IF;
END $$;

-- Update existing records to have 'Ad' as partner
UPDATE sponsor_cards SET partner = 'Ad' WHERE partner IS NULL; 