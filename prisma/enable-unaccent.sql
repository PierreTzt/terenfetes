-- Enable PostgreSQL unaccent extension for accent-insensitive search
-- Run this SQL on your PostgreSQL database to enable better search functionality

-- Create the extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Test that it works
SELECT unaccent('Théâtre') AS test; -- Should return 'Theatre'

-- You can now use unaccent() in your queries for accent-insensitive search
-- Example: WHERE unaccent(LOWER(title)) LIKE unaccent(LOWER('%theatre%'))

-- For Supabase users:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Run the command: CREATE EXTENSION IF NOT EXISTS unaccent;
-- 4. Done! The application will automatically detect and use it.
