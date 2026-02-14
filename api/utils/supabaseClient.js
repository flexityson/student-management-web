/**
 * Shared Supabase Client for Vercel Serverless Functions
 * Provides consistent database connection management across all API endpoints
 */

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to handle database errors consistently
function handleDatabaseError(error, context = 'Database operation') {
  console.error(`${context} error:`, error);
  
  // Map common Supabase errors to user-friendly messages
  const errorMap = {
    'PGRST116': 'Resource not found',
    'PGRST301': 'Duplicate entry',
    'PGRST302': 'Foreign key violation',
    'PGRST304': 'Check constraint violation',
    'JWT expired': 'Authentication token has expired',
    'Invalid JWT': 'Invalid authentication token'
  };
  
  const message = errorMap[error.code] || error.message || 'Database operation failed';
  
  return {
    success: false,
    message,
    code: error.code,
    details: process.env.NODE_ENV === 'development' ? error : undefined
  };
}

// Helper function to validate teacher access
function validateTeacherAccess(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }
  
  const token = authHeader.substring(7);
  
  // For now, we'll use a simple teacher access code validation
  // In production, you should validate JWT tokens here
  const teacherAccessCode = process.env.TEACHER_ACCESS_CODE;
  
  if (!teacherAccessCode) {
    return { valid: false, error: 'Server configuration error' };
  }
  
  if (token !== teacherAccessCode) {
    return { valid: false, error: 'Invalid teacher access code' };
  }
  
  return { valid: true };
}

module.exports = {
  supabase,
  handleDatabaseError,
  validateTeacherAccess
};
