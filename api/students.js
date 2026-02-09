// Vercel Serverless Function for Students API
// Handles GET and POST requests for student management using Supabase

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to validate student data
function validateStudentData(data) {
  const required = ['name', 'email', 'class', 'student_id'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email format');
  }
  
  return true;
}

// Main handler function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return handleGetStudents(req, res);
      
      case 'POST':
        return handleCreateStudent(req, res);
      
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/students - Retrieve all students or filter by query
async function handleGetStudents(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      class: studentClass, 
      search, 
      status 
    } = req.query;
    
    // Build query
    let query = supabase
      .from('students')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (studentClass) {
      query = query.eq('class', studentClass);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`);
    }
    
    // Apply pagination and ordering
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Execute query
    const { data: students, error, count } = await query;
    
    if (error) {
      console.error('Supabase GET Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve students',
        error: error.message
      });
    }
    
    return res.status(200).json({
      success: true,
      data: students || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('GET Students Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message
    });
  }
}

// POST /api/students - Create a new student
async function handleCreateStudent(req, res) {
  try {
    const studentData = req.body;
    
    // Validate input data
    validateStudentData(studentData);
    
    // Check if student ID already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('student_id')
      .eq('student_id', studentData.student_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Supabase Check Error:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing student',
        error: checkError.message
      });
    }
    
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student ID already exists'
      });
    }
    
    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('students')
      .select('email')
      .eq('email', studentData.email)
      .single();
    
    if (emailError && emailError.code !== 'PGRST116') {
      console.error('Supabase Email Check Error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing email',
        error: emailError.message
      });
    }
    
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Prepare student document
    const newStudent = {
      name: studentData.name,
      email: studentData.email,
      class: studentData.class,
      student_id: studentData.student_id,
      phone: studentData.phone || null,
      address: studentData.address || null,
      status: studentData.status || 'active',
      average_score: studentData.average_score || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('students')
      .insert([newStudent])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase INSERT Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create student',
        error: error.message
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: data
    });
  } catch (error) {
    console.error('POST Students Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message
    });
  }
}
