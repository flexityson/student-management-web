/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for use throughout the application
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables - these will be injected by Vercel at build time
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || window.ENV?.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || window.ENV?.SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your configuration.');
  throw new Error('Supabase configuration is missing. Please contact support.');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flow: 'pkce', // Recommended for web apps
  },
  global: {
    headers: {
      'X-Client-Info': 'studenthub-web/1.0.0',
    },
  },
});

// Auth helper functions
export const auth = {
  /**
   * Sign up a new teacher
   * @param {string} email - Teacher's email
   * @param {string} password - Teacher's password
   * @param {Object} metadata - Additional teacher metadata
   * @returns {Promise<Object>} - User session and data
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'teacher',
            full_name: metadata.fullName || '',
            school: metadata.school || '',
            ...metadata,
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign in a teacher
   * @param {string} email - Teacher's email
   * @param {string} password - Teacher's password
   * @returns {Promise<Object>} - User session and data
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<Object>} - Result of sign out operation
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get the current user session
   * @returns {Promise<Object>} - Current user session
   */
  async getCurrentUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function for auth changes
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Reset password
   * @param {string} email - Email to send reset link to
   * @returns {Promise<Object>} - Result of password reset request
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Database helper functions
export const db = {
  /**
   * Get students for the current teacher
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Students data
   */
  async getStudents(options = {}) {
    try {
      let query = supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.grade) {
        query = query.eq('grade', options.grade);
      }
      if (options.search) {
        query = query.ilike('student_name', `%${options.search}%`);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get students error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} - Created student data
   */
  async createStudent(studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create student error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a student
   * @param {string} studentId - Student ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} - Updated student data
   */
  async updateStudent(studentId, updates) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update student error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a student
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} - Result of deletion
   */
  async deleteStudent(studentId) {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete student error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update student attendance
   * @param {string} studentId - Student ID
   * @param {boolean} present - Attendance status
   * @param {string} date - Date of attendance (YYYY-MM-DD)
   * @returns {Promise<Object>} - Updated attendance data
   */
  async updateAttendance(studentId, present, date = new Date().toISOString().split('T')[0]) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({ 
          attendance: present,
          last_attendance_date: date,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update attendance error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Utility functions
export const utils = {
  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Authentication status
   */
  async isAuthenticated() {
    const { success, session } = await auth.getCurrentUser();
    return success && !!session;
  },

  /**
   * Get current teacher ID
   * @returns {Promise<string|null>} - Teacher ID or null
   */
  async getCurrentTeacherId() {
    const { success, session } = await auth.getCurrentUser();
    return success && session ? session.user.id : null;
  },

  /**
   * Handle authentication errors
   * @param {Error} error - Error object
   * @returns {string} - User-friendly error message
   */
  handleAuthError(error) {
    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password. Please try again.',
      'User already registered': 'An account with this email already exists.',
      'Email not confirmed': 'Please confirm your email address before signing in.',
      'Invalid email': 'Please enter a valid email address.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Too many requests': 'Too many attempts. Please try again later.',
    };

    return errorMessages[error.message] || error.message || 'An unexpected error occurred.';
  },

  /**
   * Redirect to login if not authenticated
   * @param {string} redirectUrl - URL to redirect to after login
   */
  async requireAuth(redirectUrl = window.location.pathname) {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      sessionStorage.setItem('redirectUrl', redirectUrl);
      window.location.href = '/login.html';
    }
  },

  /**
   * Get stored redirect URL and clear it
   * @returns {string|null} - Redirect URL or null
   */
  getRedirectUrl() {
    const url = sessionStorage.getItem('redirectUrl');
    sessionStorage.removeItem('redirectUrl');
    return url || '/dashboard.html';
  },
};

// Export default supabase client for direct usage
export default supabase;
