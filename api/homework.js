// Vercel Serverless Function for Homework API
// Handles GET and POST requests for homework management using Supabase

const { supabase, handleDatabaseError, validateTeacherAccess } = require('../utils/supabaseClient');

// Helper function to validate homework data
function validateHomeworkData(data) {
  const required = ['title', 'description', 'class', 'subject', 'due_date'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate due date is in the future
  const dueDate = new Date(data.due_date);
  const now = new Date();
  if (dueDate <= now) {
    throw new Error('Due date must be in the future');
  }
  
  return true;
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
  
  // Validate teacher access for non-OPTIONS requests
  if (req.method !== 'OPTIONS') {
    const auth = validateTeacherAccess(req);
    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        message: auth.error
      });
    }
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return handleGetHomework(req, res);
      
      case 'POST':
        return handleCreateHomework(req, res);
      
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    const errorResponse = handleDatabaseError(error, 'Homework API');
    return res.status(errorResponse.code === 'PGRST116' ? 404 : 500).json(errorResponse);
  }
};

// GET /api/homework - Retrieve all homework or filter by query
async function handleGetHomework(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      class: homeworkClass, 
      subject, 
      status,
      priority 
    } = req.query;
    
    // Build query
    let query = supabase
      .from('homework')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (homeworkClass) {
      query = query.eq('class', homeworkClass);
    }
    
    if (subject) {
      query = query.eq('subject', subject);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    // Apply pagination and ordering
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    
    query = query
      .order('due_date', { ascending: true })
      .range(from, to);
    
    // Execute query
    const { data: homework, error, count } = await query;
    
    if (error) {
      const errorResponse = handleDatabaseError(error, 'GET Homework');
      return res.status(errorResponse.code === 'PGRST116' ? 404 : 500).json(errorResponse);
    }
    
    return res.status(200).json({
      success: true,
      data: homework || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('GET Homework Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve homework',
      error: error.message
    });
  }
}

// POST /api/homework - Create new homework
async function handleCreateHomework(req, res) {
  try {
    const homeworkData = req.body;
    
    // Validate input data
    validateHomeworkData(homeworkData);
    
    // Prepare homework document
    const newHomework = {
      title: homeworkData.title,
      description: homeworkData.description,
      class: homeworkData.class,
      subject: homeworkData.subject,
      due_date: homeworkData.due_date,
      priority: homeworkData.priority || 'medium',
      status: homeworkData.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('homework')
      .insert([newHomework])
      .select()
      .single();
    
    if (error) {
      const errorResponse = handleDatabaseError(error, 'Create Homework');
      return res.status(500).json(errorResponse);
    }
    
    return res.status(201).json({
      success: true,
      message: 'Homework created successfully',
      data: data
    });
  } catch (error) {
    const errorResponse = handleDatabaseError(error, 'POST Homework');
    return res.status(500).json(errorResponse);
  }
}
