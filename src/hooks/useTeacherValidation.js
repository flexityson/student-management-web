import { useState } from 'react'

export function useTeacherValidation() {
  const [validating, setValidating] = useState(false)
  const [validationError, setValidationError] = useState(null)

  const validateTeacherAccessCode = async (accessCode) => {
    setValidating(true)
    setValidationError(null)

    try {
      const response = await fetch('/api/validate-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode }),
      })

      const data = await response.json()

      if (!data.success) {
        if (data.message === 'Fail') {
          throw new Error('Unauthorized Access')
        } else {
          throw new Error(data.message || 'Access code validation failed')
        }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error.message || 'Failed to validate access code'
      setValidationError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setValidating(false)
    }
  }

  const clearValidationError = () => {
    setValidationError(null)
  }

  return {
    validateTeacherAccessCode,
    validating,
    validationError,
    clearValidationError
  }
}
