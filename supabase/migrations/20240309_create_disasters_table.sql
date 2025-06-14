-- Create disasters table
CREATE TABLE IF NOT EXISTS disasters (
    id BIGSERIAL PRIMARY KEY,
    tweet_id TEXT UNIQUE NOT NULL,
    text TEXT NOT NULL,
    location TEXT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    tweet_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS disasters_type_idx ON disasters(type);
CREATE INDEX IF NOT EXISTS disasters_severity_idx ON disasters(severity);
CREATE INDEX IF NOT EXISTS disasters_status_idx ON disasters(status);
CREATE INDEX IF NOT EXISTS disasters_created_at_idx ON disasters(created_at);
CREATE INDEX IF NOT EXISTS disasters_location_idx ON disasters(location);

-- Add RLS policies
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON disasters
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON disasters
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON disasters
    FOR UPDATE
    USING (auth.role() = 'authenticated'); 