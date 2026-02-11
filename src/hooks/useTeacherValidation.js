import { useState } from 'react'
import TeacherValidationService from '../services/validation'

export function useTeacherValidation() {
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [remainingAttempts, setRemainingAttempts] = useState(5)

  const validateTeacherAccessCode = async (accessCode) => {
    setValidating(true)
    setValidationError(null)

    try {
      const result = await TeacherValidationService.validateWithRateLimit(accessCode)
      
      if (!result.success) {
        setValidationError(result.error)
        setRemainingAttempts(TeacherValidationService.getRemainingAttempts())
      } else {
        setValidationError(null)
        setRemainingAttempts(5)
      }

      return result
    } finally {
      setValidating(false)
    }
  }

  const clearValidationError = () => {
    setValidationError(null)
  }

  const clearAttempts = () => {
    TeacherValidationService.clearAttempts()
    setRemainingAttempts(5)
  }

  // Update remaining attempts on mount
  useState(() => {
    setRemainingAttempts(TeacherValidationService.getRemainingAttempts())
  })

  return {
    validateTeacherAccessCode,
    validating,
    validationError,
    clearValidationError,
    clearAttempts,
    remainingAttempts
  }
}
