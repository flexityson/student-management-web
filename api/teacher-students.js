// Vercel Serverless Function for Teacher-Student Management
// Handles CRUD operations for students with teacher-specific access control

const { supabase, handleDatabaseError } = require('../utils/supabaseClient');

// Helper function to validate student data
function validateStudentData(data) {
  const required = ['student_name', 'grade'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate grade format
  const gradeRegex = /^[Kk9][0-9]*(st|nd|rd|th)? Grade$/i;
  if (!gradeRegex.test(data.grade) && !/^[0-9]+[A-Z]?$/.test(data.grade)) {
    throw new Error('Invalid grade format. Use formats like "5th Grade", "K", or "5A"');
  }
  
  return true;
}

// Helper function to verify teacher authentication
async function verifyTeacher(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid authentication token');
    }
    
    return { userId: user.id, user };
  } catch (error) {
    throw new Error('Authentication failed: ' + error.message);
  }
}

// Main handler function
module.exports = async (req, res) => {
  // Set CORS headers (handled by vercel.json, but keeping for local development)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Verify teacher authentication for all methods except OPTIONS
    const { userId } = await verifyTeacher(req.headers.authorization);
    const teacherId = userId;
    
    switch (req.method) {
      case 'GET':
        return handleGetStudents(req, res, teacherId);
      
      case 'POST':
        return handleCreateStudent(req, res, teacherId);
      
      case 'PUT':
        return handleUpdateStudent(req, res, teacherId);
      
      case 'DELETE':
        return handleDeleteStudent(req, res, teacherId);
      
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    const errorResponse = handleDatabaseError(error, 'Teacher-Students API');
    
    if (error.message.includes('Authentication') || error.message.includes('authorization')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(errorResponse.code === 'PGRST116' ? 404 : 500).json(errorResponse);
  }
};

// GET /api/teacher-students - Retrieve teacher's students
async function handleGetStudents(req, res, teacherId) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      grade, 
      search, 
      attendance,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .eq('teacher_id', teacherId);
    
    // Apply filters
    if (grade) {
      query = query.eq('grade', grade);
    }
    
    if (attendance !== undefined) {
      query = query.eq('attendance', attendance === 'true');
    }
    
    if (search) {
      query = query.or(`student_name.ilike.%${search}%,parent_email.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    
    query = query.range(from, to);
    
    // Execute query
    const { data: students, error, count } = await query;
    
    if (error) {
      const errorResponse = handleDatabaseError(error, 'GET Teacher Students');
      return res.status(errorResponse.code === 'PGRST116' ? 404 : 500).json(errorResponse);
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
    const errorResponse = handleDatabaseError(error, 'GET Teacher Students');
    return res.status(500).json(errorResponse);
  }
}

// POST /api/teacher-students - Create a new student
async function handleCreateStudent(req, res, teacherId) {
  try {
    const studentData = req.body;
    
    // Validate input data
    validateStudentData(studentData);
    
    // Prepare student document
    const newStudent = {
      student_name: studentData.student_name,
      grade: studentData.grade,
      teacher_id: teacherId,
      attendance: studentData.attendance || false,
      parent_email: studentData.parent_email || null,
      parent_phone: studentData.parent_phone || null,
      notes: studentData.notes || null,
      enrollment_date: studentData.enrollment_date || new Date().toISOString().split('T')[0]
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('students')
      .insert([newStudent])
      .select()
      .single();
    
    if (error) {
      const errorResponse = handleDatabaseError(error, 'Create Teacher Student');
      return res.status(500).json(errorResponse);
    }
    
    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: data
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error, 'POST Teacher Students');
    return res.status(500).json(errorResponse);
  }
}

// PUT /api/teacher-students - Update a student
async function handleUpdateStudent(req, res, teacherId) {
  try {
    const { id, ...updates } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }
    
    // Validate update data
    if (updates.student_name || updates.grade) {
      validateStudentData(updates);
    }
    
    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Update student (RLS ensures teacher can only update their own students)
    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .eq('teacher_id', teacherId) // Double-check teacher ownership
      .select()
      .single();
    
    if (error) {
      const errorResponse = handleDatabaseError(error, 'Update Teacher Student');
      return res.status(500).json(errorResponse);
    }
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or access denied'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: data
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error, 'PUT Teacher Students');
    return res.status(500).json(errorResponse);
  }
}

// DELETE /api/teacher-students - Delete a student
async function handleDeleteStudent(req, res, teacherId) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }
    
    // Delete student (RLS ensures teacher can only delete their own students)
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('teacher_id', teacherId); // Double-check teacher ownership
    
    if (error) {
      const errorResponse = handleDatabaseError(error, 'Delete Teacher Student');
      return res.status(500).json(errorResponse);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error, 'DELETE Teacher Students');
    return res.status(500).json(errorResponse);
  }
}
