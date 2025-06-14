-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT '未指定' CHECK (priority IN ('高', '未指定')),
    next_books TEXT[] DEFAULT '{}',
    level INTEGER DEFAULT 0,
    notes TEXT,
    links TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- Note: Since we're using basic auth, we'll allow all operations
-- In a production environment, you might want more specific policies
CREATE POLICY "Allow all operations" ON books
    FOR ALL USING (true);