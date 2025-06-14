-- Make tweet_id optional
ALTER TABLE disasters
ALTER COLUMN tweet_id DROP NOT NULL;

-- Add source_id column for unique identification
ALTER TABLE disasters
ADD COLUMN IF NOT EXISTS source_id TEXT;

-- Create a unique constraint on source_id and source
ALTER TABLE disasters
ADD CONSTRAINT disasters_source_unique UNIQUE (source_id, source);

-- Update existing records
UPDATE disasters
SET source_id = tweet_id
WHERE source_id IS NULL AND tweet_id IS NOT NULL;

-- Create index for source_id
CREATE INDEX IF NOT EXISTS disasters_source_id_idx ON disasters(source_id); 