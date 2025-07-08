-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user creation (if using Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing workspaces table to ensure proper foreign key
ALTER TABLE workspaces 
DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey;

ALTER TABLE workspaces 
ADD CONSTRAINT workspaces_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at);

-- Insert some sample users for development
INSERT INTO users (id, email, name, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'test@example.com', 'Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
