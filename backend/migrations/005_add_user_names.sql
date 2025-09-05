-- Add first_name and last_name fields to users table
ALTER TABLE users ADD COLUMN first_name VARCHAR(100) DEFAULT '';
ALTER TABLE users ADD COLUMN last_name VARCHAR(100) DEFAULT '';

-- Update existing users to have empty strings for the new fields
UPDATE users SET first_name = '', last_name = '' WHERE first_name IS NULL OR last_name IS NULL;
