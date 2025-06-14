-- Update disasters table to include new fields
ALTER TABLE disasters
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS magnitude DECIMAL,
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- Create new indexes for faster queries
CREATE INDEX IF NOT EXISTS disasters_title_idx ON disasters(title);
CREATE INDEX IF NOT EXISTS disasters_magnitude_idx ON disasters(magnitude);
CREATE INDEX IF NOT EXISTS disasters_coordinates_idx ON disasters(latitude, longitude);

-- Update existing records to set default values for new columns
UPDATE disasters
SET title = 'Unknown',
    description = 'No description available',
    url = 'https://www.gdacs.org',
    magnitude = 0,
    latitude = 0,
    longitude = 0
WHERE title IS NULL; 