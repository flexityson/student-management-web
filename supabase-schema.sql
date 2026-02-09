-- Supabase Database Schema for StudentHub Management System
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    class VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    average_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Homework Table
CREATE TABLE IF NOT EXISTS homework (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    class VARCHAR(10) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Tests Table
CREATE TABLE IF NOT EXISTS tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(50) NOT NULL,
    class VARCHAR(10) NOT NULL,
    test_date DATE NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 100,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Scores Table
CREATE TABLE IF NOT EXISTS scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    homework_id UUID REFERENCES homework(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
    grade VARCHAR(2) GENERATED ALWAYS AS (
        CASE 
            WHEN (score / max_score) * 100 >= 90 THEN 'A'
            WHEN (score / max_score) * 100 >= 80 THEN 'B'
            WHEN (score / max_score) * 100 >= 70 THEN 'C'
            WHEN (score / max_score) * 100 >= 60 THEN 'D'
            ELSE 'F'
        END
    ) STORED,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('login', 'homework_submitted', 'test_taken', 'profile_updated')),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

CREATE INDEX IF NOT EXISTS idx_homework_class ON homework(class);
CREATE INDEX IF NOT EXISTS idx_homework_subject ON homework(subject);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework(due_date);
CREATE INDEX IF NOT EXISTS idx_homework_status ON homework(status);
CREATE INDEX IF NOT EXISTS idx_homework_priority ON homework(priority);

CREATE INDEX IF NOT EXISTS idx_tests_class ON tests(class);
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_test_date ON tests(test_date);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);

CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_test_id ON scores(test_id);
CREATE INDEX IF NOT EXISTS idx_scores_homework_id ON scores(homework_id);

CREATE INDEX IF NOT EXISTS idx_activities_student_id ON activities(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON homework
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON students
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON homework
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON tests
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON scores
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON activities
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert Sample Data (Optional - for testing)
INSERT INTO students (student_id, name, email, class, phone, address, average_score) VALUES
('STU001', 'Alice Johnson', 'alice.johnson@example.com', 'A', '+1234567890', '123 Main St, City, State', 85.5),
('STU002', 'Bob Smith', 'bob.smith@example.com', 'B', '+1234567891', '456 Oak Ave, City, State', 92.0),
('STU003', 'Charlie Brown', 'charlie.brown@example.com', 'A', '+1234567892', '789 Pine Rd, City, State', 78.3),
('STU004', 'Diana Prince', 'diana.prince@example.com', 'C', '+1234567893', '321 Elm St, City, State', 95.7),
('STU005', 'Edward Norton', 'edward.norton@example.com', 'B', '+1234567894', '654 Maple Dr, City, State', 81.2)
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO homework (title, description, class, subject, due_date, priority, status) VALUES
('Math Assignment 1', 'Complete exercises 1-20 from Chapter 3', 'A', 'math', CURRENT_DATE + INTERVAL '7 days', 'high', 'pending'),
('Science Lab Report', 'Write a lab report on the chemistry experiment', 'B', 'science', CURRENT_DATE + INTERVAL '5 days', 'medium', 'pending'),
('English Essay', 'Write a 500-word essay on your favorite book', 'C', 'english', CURRENT_DATE + INTERVAL '10 days', 'low', 'pending'),
('History Project', 'Create a presentation on World War II', 'A', 'history', CURRENT_DATE + INTERVAL '14 days', 'high', 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO tests (title, description, subject, class, test_date, max_score, status) VALUES
('Midterm Exam', 'Comprehensive midterm examination', 'math', 'A', CURRENT_DATE + INTERVAL '21 days', 100, 'upcoming'),
('Science Quiz', 'Chapter 5 quiz', 'science', 'B', CURRENT_DATE + INTERVAL '3 days', 50, 'upcoming'),
('English Test', 'Grammar and vocabulary test', 'english', 'C', CURRENT_DATE + INTERVAL '10 days', 75, 'upcoming'),
('History Final', 'Final history examination', 'history', 'A', CURRENT_DATE + INTERVAL '30 days', 100, 'upcoming')
ON CONFLICT DO NOTHING;

-- Create a view for student statistics
CREATE OR REPLACE VIEW student_stats AS
SELECT 
    s.id,
    s.student_id,
    s.name,
    s.class,
    s.average_score,
    COUNT(DISTINCT sc.test_id) as tests_taken,
    COUNT(DISTINCT sc.homework_id) as homework_completed,
    AVG(sc.percentage) as actual_average,
    MAX(sc.submitted_at) as last_activity
FROM students s
LEFT JOIN scores sc ON s.id = sc.student_id
GROUP BY s.id, s.student_id, s.name, s.class, s.average_score;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create API Keys (Note: These are generated in Supabase dashboard)
-- The following are placeholders - get actual keys from your Supabase project settings
-- anon key: (Get from Supabase Dashboard > Settings > API)
-- service_role key: (Get from Supabase Dashboard > Settings > API)
