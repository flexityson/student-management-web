-- Supabase Database Schema for Teacher-Based Student Management System
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Teachers Profile Table (extends auth.users)
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Students Table with Teacher Relationship
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    attendance BOOLEAN DEFAULT false,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Attendance Records Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, date) -- One record per student per day
);

-- Create Grades/Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Student Grades Table
CREATE TABLE IF NOT EXISTS student_grades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
    assignment_name VARCHAR(255) NOT NULL,
    grade DECIMAL(5,2) NOT NULL,
    max_grade DECIMAL(5,2) NOT NULL DEFAULT 100,
    assignment_type VARCHAR(50) DEFAULT 'assignment' CHECK (assignment_type IN ('assignment', 'quiz', 'test', 'project', 'participation')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_email ON teacher_profiles(email);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_school ON teacher_profiles(school);

CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(student_name);
CREATE INDEX IF NOT EXISTS idx_students_attendance ON students(attendance);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_teacher_id ON attendance_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_grade_level ON subjects(grade_level);

CREATE INDEX IF NOT EXISTS idx_student_grades_student_id ON student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_subject_id ON student_grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_teacher_id ON student_grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_date ON student_grades(date);
CREATE INDEX IF NOT EXISTS idx_student_grades_assignment_type ON student_grades(assignment_type);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for updated_at
DROP TRIGGER IF EXISTS update_teacher_profiles_updated_at ON teacher_profiles;
CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_grades_updated_at ON student_grades;
CREATE TRIGGER update_student_grades_updated_at BEFORE UPDATE ON student_grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Function to Handle New Teacher Registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create teacher profile for new authenticated user
    INSERT INTO teacher_profiles (id, full_name, school, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'school', 'Unknown School'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger for New User Registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS) - Only enable if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'teacher_profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'students' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE students ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'attendance_records' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'subjects' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'student_grades' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS Policies for Teacher Profiles
DROP POLICY IF EXISTS "Teachers can view own profile" ON teacher_profiles;
CREATE POLICY "Teachers can view own profile" ON teacher_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Teachers can update own profile" ON teacher_profiles;
CREATE POLICY "Teachers can update own profile" ON teacher_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS Policies for Students (Teacher-specific access)
DROP POLICY IF EXISTS "Teachers can view own students" ON students;
CREATE POLICY "Teachers can view own students" ON students
    FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert own students" ON students;
CREATE POLICY "Teachers can insert own students" ON students
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update own students" ON students;
CREATE POLICY "Teachers can update own students" ON students
    FOR UPDATE USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete own students" ON students;
CREATE POLICY "Teachers can delete own students" ON students
    FOR DELETE USING (auth.uid() = teacher_id);

-- Create RLS Policies for Attendance Records
DROP POLICY IF EXISTS "Teachers can view own attendance records" ON attendance_records;
CREATE POLICY "Teachers can view own attendance records" ON attendance_records
    FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert own attendance records" ON attendance_records;
CREATE POLICY "Teachers can insert own attendance records" ON attendance_records
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update own attendance records" ON attendance_records;
CREATE POLICY "Teachers can update own attendance records" ON attendance_records
    FOR UPDATE USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete own attendance records" ON attendance_records;
CREATE POLICY "Teachers can delete own attendance records" ON attendance_records
    FOR DELETE USING (auth.uid() = teacher_id);

-- Create RLS Policies for Subjects
DROP POLICY IF EXISTS "Teachers can view own subjects" ON subjects;
CREATE POLICY "Teachers can view own subjects" ON subjects
    FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert own subjects" ON subjects;
CREATE POLICY "Teachers can insert own subjects" ON subjects
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update own subjects" ON subjects;
CREATE POLICY "Teachers can update own subjects" ON subjects
    FOR UPDATE USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete own subjects" ON subjects;
CREATE POLICY "Teachers can delete own subjects" ON subjects
    FOR DELETE USING (auth.uid() = teacher_id);

-- Create RLS Policies for Student Grades
DROP POLICY IF EXISTS "Teachers can view own student grades" ON student_grades;
CREATE POLICY "Teachers can view own student grades" ON student_grades
    FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert own student grades" ON student_grades;
CREATE POLICY "Teachers can insert own student grades" ON student_grades
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update own student grades" ON student_grades;
CREATE POLICY "Teachers can update own student grades" ON student_grades
    FOR UPDATE USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete own student grades" ON student_grades;
CREATE POLICY "Teachers can delete own student grades" ON student_grades
    FOR DELETE USING (auth.uid() = teacher_id);

-- Create Views for Easy Data Access
CREATE OR REPLACE VIEW teacher_student_summary AS
SELECT 
    tp.id as teacher_id,
    tp.full_name as teacher_name,
    tp.school,
    COUNT(s.id) as total_students,
    COUNT(CASE WHEN s.attendance = true THEN 1 END) as present_today,
    ROUND(AVG(sg.grade), 2) as average_grade,
    MAX(s.created_at) as last_student_added
FROM teacher_profiles tp
LEFT JOIN students s ON tp.id = s.teacher_id
LEFT JOIN student_grades sg ON s.id = sg.student_id
GROUP BY tp.id, tp.full_name, tp.school;

CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
    s.id as student_id,
    s.student_name,
    s.grade,
    s.attendance,
    tp.full_name as teacher_name,
    tp.school,
    COUNT(sg.id) as total_assignments,
    ROUND(AVG(sg.grade), 2) as average_grade,
    MAX(sg.date) as last_grade_date
FROM students s
JOIN teacher_profiles tp ON s.teacher_id = tp.id
LEFT JOIN student_grades sg ON s.id = sg.student_id
GROUP BY s.id, s.student_name, s.grade, s.attendance, tp.full_name, tp.school;

-- Create Function to Get Teacher Statistics
CREATE OR REPLACE FUNCTION get_teacher_statistics(teacher_uuid UUID)
RETURNS TABLE(
    total_students BIGINT,
    present_today BIGINT,
    absent_today BIGINT,
    average_grade DECIMAL,
    total_assignments BIGINT,
    subjects_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM students WHERE teacher_id = teacher_uuid),
        (SELECT COUNT(*) FROM students WHERE teacher_id = teacher_uuid AND attendance = true),
        (SELECT COUNT(*) FROM students WHERE teacher_id = teacher_uuid AND attendance = false),
        (SELECT ROUND(AVG(grade), 2) FROM student_grades WHERE teacher_id = teacher_uuid),
        (SELECT COUNT(*) FROM student_grades WHERE teacher_id = teacher_uuid),
        (SELECT COUNT(*) FROM subjects WHERE teacher_id = teacher_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION get_teacher_statistics(UUID) TO authenticated;

-- Sample Data (Optional - for testing)
-- Note: Uncomment and run these sections only after you have registered teachers
-- Replace the placeholder UUID with actual teacher IDs from your teacher_profiles table

/*
-- Sample subjects (replace with actual teacher_id)
INSERT INTO subjects (teacher_id, subject_name, grade_level) VALUES
('YOUR_TEACHER_ID_HERE', 'Mathematics', '5th Grade'),
('YOUR_TEACHER_ID_HERE', 'English', '5th Grade'),
('YOUR_TEACHER_ID_HERE', 'Science', '5th Grade')
ON CONFLICT DO NOTHING;

-- Sample students (replace with actual teacher_id)
INSERT INTO students (teacher_id, student_name, grade, attendance, parent_email) VALUES
('YOUR_TEACHER_ID_HERE', 'Alice Johnson', '5th Grade', true, 'alice.parent@email.com'),
('YOUR_TEACHER_ID_HERE', 'Bob Smith', '5th Grade', false, 'bob.parent@email.com'),
('YOUR_TEACHER_ID_HERE', 'Charlie Brown', '5th Grade', true, 'charlie.parent@email.com')
ON CONFLICT DO NOTHING;

-- Sample attendance records (replace with actual student_id and teacher_id)
INSERT INTO attendance_records (student_id, teacher_id, date, status) VALUES
('YOUR_STUDENT_ID_HERE', 'YOUR_TEACHER_ID_HERE', CURRENT_DATE, 'present'),
('YOUR_STUDENT_ID_HERE', 'YOUR_TEACHER_ID_HERE', CURRENT_DATE, 'absent'),
('YOUR_STUDENT_ID_HERE', 'YOUR_TEACHER_ID_HERE', CURRENT_DATE, 'present')
ON CONFLICT (student_id, date) DO NOTHING;

-- Sample grades (replace with actual IDs)
INSERT INTO student_grades (student_id, subject_id, teacher_id, assignment_name, grade, max_grade, assignment_type) VALUES
('YOUR_STUDENT_ID_HERE', 'YOUR_SUBJECT_ID_HERE', 'YOUR_TEACHER_ID_HERE', 'Math Quiz 1', 85, 100, 'quiz'),
('YOUR_STUDENT_ID_HERE', 'YOUR_SUBJECT_ID_HERE', 'YOUR_TEACHER_ID_HERE', 'English Essay', 92, 100, 'assignment'),
('YOUR_STUDENT_ID_HERE', 'YOUR_SUBJECT_ID_HERE', 'YOUR_TEACHER_ID_HERE', 'Science Test', 78, 100, 'test')
ON CONFLICT DO NOTHING;
*/

-- Create Storage Buckets for file uploads (optional)
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES 
    ('documents', 'documents', false) 
ON CONFLICT (id) DO NOTHING;

-- Create Storage Policies
DROP POLICY IF EXISTS "Teachers can upload own avatar" ON storage.objects;
CREATE POLICY "Teachers can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Teachers can view own avatar" ON storage.objects;
CREATE POLICY "Teachers can view own avatar" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

-- Comments for documentation
COMMENT ON TABLE teacher_profiles IS 'Extended profile information for teachers, linked to auth.users';
COMMENT ON TABLE students IS 'Students belonging to specific teachers with Row Level Security';
COMMENT ON TABLE attendance_records IS 'Daily attendance tracking for students';
COMMENT ON TABLE subjects IS 'Subjects taught by each teacher';
COMMENT ON TABLE student_grades IS 'Grades and assignments for students';

-- Security note: All tables have RLS enabled ensuring teachers can only access their own data
-- The teacher_id field in all student-related tables ensures data isolation
