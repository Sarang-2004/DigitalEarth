-- Add new location-related columns
ALTER TABLE wildfires
ADD COLUMN city text,
ADD COLUMN state text,
ADD COLUMN country text,
ADD COLUMN full_address text;

-- Create indexes for the new columns
CREATE INDEX wildfires_city_idx ON wildfires (city);
CREATE INDEX wildfires_state_idx ON wildfires (state);
CREATE INDEX wildfires_country_idx ON wildfires (country);

-- Update existing records to populate the new columns
UPDATE wildfires
SET 
    city = CASE 
        WHEN location LIKE '%,%' THEN split_part(location, ',', 1)
        ELSE NULL
    END,
    state = CASE 
        WHEN location LIKE '%,%' THEN split_part(location, ',', 2)
        ELSE NULL
    END,
    country = CASE 
        WHEN location LIKE '%,%' THEN split_part(location, ',', 3)
        ELSE NULL
    END,
    full_address = location; 