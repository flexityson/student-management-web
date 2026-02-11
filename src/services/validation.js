/**
 * Secure Teacher Validation Service
 * Handles teacher access code validation without exposing sensitive data
 */

import { ErrorHandler } from './api.js'

class TeacherValidationService {
  static async validateAccessCode(accessCode) {
    // Input validation
    if (!accessCode || typeof accessCode !== 'string') {
      return { 
        success: false, 
        error: 'Access code is required',
        shouldRetry: true 
      }
    }

    // Sanitize input
    const sanitizedCode = accessCode.trim()
    
    if (sanitizedCode.length === 0) {
      return { 
        success: false, 
        error: 'Access code cannot be empty',
        shouldRetry: true 
      }
    }

    if (sanitizedCode.length < 4) {
      return { 
        success: false, 
        error: 'Access code is too short',
        shouldRetry: true 
      }
    }

    if (sanitizedCode.length > 50) {
      return { 
        success: false, 
        error: 'Access code is too long',
        shouldRetry: true 
      }
    }

    try {
      // Server-side validation (never expose the expected code)
      const response = await fetch('/api/validate-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: sanitizedCode })
      })

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 429) {
          return { 
            success: false, 
            error: 'Too many attempts. Please try again later.',
            shouldRetry: false,
            retryAfter: 60 // seconds
          }
        }
        
        if (response.status === 500) {
          return { 
            success: false, 
            error: 'Server error. Please try again later.',
            shouldRetry: true 
          }
        }

        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle server response
      if (!data.success) {
        // Generic failure (don't expose specific reason for security)
        return { 
          success: false, 
          error: 'Invalid access code',
          shouldRetry: true 
        }
      }

      // Success case
      return { 
        success: true, 
        message: 'Access validated successfully'
      }

    } catch (error) {
      return ErrorHandler.handle(error, 'teacher validation')
    }
  }

  static async validateWithRateLimit(accessCode) {
    // Simple client-side rate limiting
    const maxAttempts = 5
    const attemptWindow = 15 * 60 * 1000 // 15 minutes in milliseconds
    
    const attempts = JSON.parse(localStorage.getItem('validation_attempts') || '[]')
    const now = Date.now()
    
    // Clean old attempts
    const validAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < attemptWindow
    )
    
    if (validAttempts.length >= maxAttempts) {
      const oldestAttempt = validAttempts[0]
      const timeToWait = Math.ceil((attemptWindow - (now - oldestAttempt.timestamp)) / 1000)
      
      return {
        success: false,
        error: `Too many attempts. Please wait ${timeToWait} seconds before trying again.`,
        shouldRetry: false,
        retryAfter: timeToWait
      }
    }

    // Record this attempt
    validAttempts.push({ timestamp: now })
    localStorage.setItem('validation_attempts', JSON.stringify(validAttempts))

    // Perform validation
    const result = await this.validateAccessCode(accessCode)
    
    // Clear attempts on success
    if (result.success) {
      localStorage.removeItem('validation_attempts')
    }
    
    return result
  }

  static clearAttempts() {
    localStorage.removeItem('validation_attempts')
  }

  static getRemainingAttempts() {
    const maxAttempts = 5
    const attemptWindow = 15 * 60 * 1000
    const attempts = JSON.parse(localStorage.getItem('validation_attempts') || '[]')
    const now = Date.now()
    
    const validAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < attemptWindow
    )
    
    return Math.max(0, maxAttempts - validAttempts.length)
  }
}

export default TeacherValidationService
