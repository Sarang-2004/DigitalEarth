-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON disasters;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON disasters;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON disasters;

-- Create new RLS policies
CREATE POLICY "Enable read access for all users" ON disasters
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for service role" ON disasters
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role" ON disasters
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY; 