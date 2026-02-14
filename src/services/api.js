/**
 * Centralized API Service Layer
 * Handles all Supabase database operations with professional error handling
 */

import { supabase } from './supabaseClient.js'

// Professional error messages
const ERROR_MESSAGES = {
  NETWORK: 'Network connection error. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
}

// Toast notification system
class ToastManager {
  static show(message, type = 'error', duration = 5000) {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-notification')
    if (existingToast) {
      existingToast.remove()
    }

    // Create toast element
    const toast = document.createElement('div')
    toast.className = `toast-notification toast-${type}`
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">
          ${type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕'}
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
      </div>
    `

    // Add to DOM
    document.body.appendChild(toast)

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 100)

    // Auto remove
    setTimeout(() => {
      toast.classList.add('toast-hide')
      setTimeout(() => toast.remove(), 300)
    }, duration)
  }

  static success(message, duration) {
    this.show(message, 'success', duration)
  }

  static error(message, duration) {
    this.show(message, 'error', duration)
  }

  static warning(message, duration) {
    this.show(message, 'warning', duration)
  }

  static info(message, duration) {
    this.show(message, 'info', duration)
  }
}

// Error handler utility
class ErrorHandler {
  static handle(error, context = '') {
    let message = ERROR_MESSAGES.UNKNOWN
    let type = 'error'

    // Handle specific error types
    if (error.message) {
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        message = ERROR_MESSAGES.NETWORK
      } else if (error.message.includes('timeout')) {
        message = ERROR_MESSAGES.TIMEOUT
      } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        message = ERROR_MESSAGES.UNAUTHORIZED
      } else if (error.message.includes('Forbidden') || error.message.includes('403')) {
        message = ERROR_MESSAGES.FORBIDDEN
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        message = ERROR_MESSAGES.NOT_FOUND
      } else if (error.message.includes('Invalid') || error.message.includes('validation')) {
        message = ERROR_MESSAGES.VALIDATION
        type = 'warning'
      } else if (error.message.includes('500') || error.message.includes('server')) {
        message = ERROR_MESSAGES.SERVER_ERROR
      } else {
        message = error.message
      }
    }

    // Show user-friendly toast
    ToastManager.show(message, type)
    
    return {
      success: false,
      message,
      type: type.toLowerCase()
    }
  }

  static async withContext(operation, context, fn) {
    try {
      const result = await fn()
      return { success: true, data: result }
    } catch (error) {
      return this.handle(error, `${operation} - ${context}`)
    }
  }
}

// Student Service
export const StudentService = {
  async getStudents(teacherId, options = {}) {
    return ErrorHandler.withContext(
      'GET',
      'fetch students',
      async () => {
        let query = supabase
          .from('students')
          .select('*', { count: 'exact' })
          .eq('teacher_id', teacherId)

        // Apply filters
        if (options.grade) {
          query = query.eq('grade', options.grade)
        }
        
        if (options.attendance !== undefined) {
          query = query.eq('attendance', options.attendance === 'true')
        }
        
        if (options.search) {
          query = query.or(`student_name.ilike.%${options.search}%,parent_email.ilike.%${options.search}%`)
        }
        
        // Apply sorting
        query = query.order(options.sortBy || 'created_at', { 
          ascending: options.sortOrder === 'asc' 
        })
        
        // Apply pagination
        if (options.page && options.limit) {
          const from = (parseInt(options.page) - 1) * parseInt(options.limit)
          const to = from + parseInt(options.limit) - 1
          query = query.range(from, to)
        }

        const { data, error, count } = await query
        
        if (error) throw error
        
        return {
          students: data || [],
          pagination: {
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 10,
            total: count || 0,
            pages: Math.ceil((count || 0) / (parseInt(options.limit) || 10))
          }
        }
      }
    )
  },

  async createStudent(teacherId, studentData) {
    return ErrorHandler.withContext(
      'POST',
      'create student',
      async () => {
        // Validate required fields
        const required = ['student_name', 'grade']
        const missing = required.filter(field => !studentData[field])
        
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`)
        }

        // Validate grade format
        const gradeRegex = /^[Kk9][0-9]*(st|nd|rd|th)? Grade$/i
        if (!gradeRegex.test(studentData.grade) && !/^[0-9]+[A-Z]?$/.test(studentData.grade)) {
          throw new Error('Invalid grade format. Use formats like "5th Grade", "K", or "5A"')
        }

        const newStudent = {
          student_name: studentData.student_name,
          grade: studentData.grade,
          teacher_id: teacherId,
          attendance: studentData.attendance || false,
          parent_email: studentData.parent_email || null,
          parent_phone: studentData.parent_phone || null,
          notes: studentData.notes || null,
          enrollment_date: studentData.enrollment_date || new Date().toISOString().split('T')[0]
        }

        const { data, error } = await supabase
          .from('students')
          .insert([newStudent])
          .select()
          .single()

        if (error) throw error
        
        ToastManager.success('Student created successfully!')
        return data
      }
    )
  },

  async updateStudent(teacherId, studentId, updates) {
    return ErrorHandler.withContext(
      'PUT',
      'update student',
      async () => {
        if (!studentId) {
          throw new Error('Student ID is required')
        }

        // Validate update data
        if (updates.student_name || updates.grade) {
          const required = ['student_name', 'grade']
          const missing = required.filter(field => !updates[field])
          
          if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`)
          }

          // Validate grade format if provided
          if (updates.grade) {
            const gradeRegex = /^[Kk][0-9]*(st|nd|rd|th)? Grade$/i
            if (!gradeRegex.test(updates.grade) && !/^[0-9]+[A-Z]?$/.test(updates.grade)) {
              throw new Error('Invalid grade format. Use formats like "5th Grade", "K", or "5A"')
            }
          }
        }

        const updateData = {
          ...updates,
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', studentId)
          .eq('teacher_id', teacherId) // Double-check teacher ownership
          .select()
          .single()

        if (error) throw error
        
        if (!data) {
          throw new Error('Student not found or access denied')
        }

        ToastManager.success('Student updated successfully!')
        return data
      }
    )
  },

  async deleteStudent(teacherId, studentId) {
    return ErrorHandler.withContext(
      'DELETE',
      'delete student',
      async () => {
        if (!studentId) {
          throw new Error('Student ID is required')
        }

        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId)
          .eq('teacher_id', teacherId) // Double-check teacher ownership

        if (error) throw error

        ToastManager.success('Student deleted successfully!')
        return { success: true }
      }
    )
  },

  async updateAttendance(teacherId, studentId, present) {
    return ErrorHandler.withContext(
      'PUT',
      'update attendance',
      async () => {
        const { data, error } = await supabase
          .from('students')
          .update({ 
            attendance: present,
            last_attendance_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('id', studentId)
          .eq('teacher_id', teacherId)
          .select()
          .single()

        if (error) throw error
        
        if (!data) {
          throw new Error('Student not found or access denied')
        }

        const status = present ? 'marked present' : 'marked absent'
        ToastManager.success(`Attendance ${status}!`)
        return data
      }
    )
  }
}

// Homework Service
export const HomeworkService = {
  async getHomework(teacherId, options = {}) {
    return ErrorHandler.withContext(
      'GET',
      'fetch homework',
      async () => {
        let query = supabase
          .from('homework')
          .select('*', { count: 'exact' })
          .eq('teacher_id', teacherId)

        // Apply filters
        if (options.class) {
          query = query.eq('class', options.class)
        }
        
        if (options.subject) {
          query = query.eq('subject', options.subject)
        }
        
        if (options.status) {
          query = query.eq('status', options.status)
        }

        // Apply sorting
        query = query.order('due_date', { ascending: true })

        // Apply pagination
        if (options.page && options.limit) {
          const from = (parseInt(options.page) - 1) * parseInt(options.limit)
          const to = from + parseInt(options.limit) - 1
          query = query.range(from, to)
        }

        const { data, error, count } = await query
        
        if (error) throw error
        
        return {
          homework: data || [],
          pagination: {
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 10,
            total: count || 0,
            pages: Math.ceil((count || 0) / (parseInt(options.limit) || 10))
          }
        }
      }
    )
  },

  async createHomework(teacherId, homeworkData) {
    return ErrorHandler.withContext(
      'POST',
      'create homework',
      async () => {
        // Validate required fields
        const required = ['title', 'description', 'class', 'subject', 'due_date']
        const missing = required.filter(field => !homeworkData[field])
        
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`)
        }

        // Validate due date is in the future
        const dueDate = new Date(homeworkData.due_date)
        const now = new Date()
        if (dueDate <= now) {
          throw new Error('Due date must be in the future')
        }

        const newHomework = {
          title: homeworkData.title,
          description: homeworkData.description,
          class: homeworkData.class,
          subject: homeworkData.subject,
          due_date: homeworkData.due_date,
          teacher_id: teacherId,
          status: 'pending'
        }

        const { data, error } = await supabase
          .from('homework')
          .insert([newHomework])
          .select()
          .single()

        if (error) throw error
        
        ToastManager.success('Homework assignment created successfully!')
        return data
      }
    )
  }
}

// Analytics Service
export const AnalyticsService = {
  async getDashboardStats(teacherId) {
    return ErrorHandler.withContext(
      'GET',
      'fetch dashboard stats',
      async () => {
        // Get student count
        const { data: students, error: studentError } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('teacher_id', teacherId)

        if (studentError) throw studentError

        // Get homework count
        const { data: homework, error: homeworkError } = await supabase
          .from('homework')
          .select('id', { count: 'exact' })
          .eq('teacher_id', teacherId)

        if (homeworkError) throw homeworkError

        // Get attendance stats
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('students')
          .select('attendance')
          .eq('teacher_id', teacherId)

        if (attendanceError) throw attendanceError

        const presentCount = attendanceData?.filter(s => s.attendance).length || 0
        const totalCount = attendanceData?.length || 0
        const attendanceRate = totalCount > 0 ? (presentCount / totalCount * 100).toFixed(1) : 0

        return {
          totalStudents: students?.length || 0,
          totalHomework: homework?.length || 0,
          attendanceRate: parseFloat(attendanceRate),
          presentCount,
          absentCount: totalCount - presentCount
        }
      }
    )
  }
}

export { ToastManager, ErrorHandler }
