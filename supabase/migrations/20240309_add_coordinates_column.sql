-- Add coordinates column to wildfires table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wildfires' 
        AND column_name = 'coordinates'
    ) THEN
        ALTER TABLE wildfires
        ADD COLUMN coordinates JSONB;
    END IF;
END $$;

-- Update existing records to include coordinates
UPDATE wildfires
SET coordinates = jsonb_build_object(
    'lat', latitude,
    'lng', longitude
)
WHERE coordinates IS NULL;

-- Create an index on the coordinates column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE indexname = 'wildfires_coordinates_idx'
    ) THEN
        CREATE INDEX wildfires_coordinates_idx ON wildfires USING GIN (coordinates);
    END IF;
END $$; 