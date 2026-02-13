import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTeacherValidation } from '../../hooks/useTeacherValidation'
import { checkPasswordStrength } from '../../services/auth-common.js'
import FormInput from '../ui/FormInput'
import PasswordInput from '../ui/PasswordInput'
import Message from '../ui/Message'

export default function SignupForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp, loading, error, clearError } = useAuth()
  const { validateTeacherAccessCode, validating, validationError, clearValidationError, remainingAttempts } = useTeacherValidation()
  
  const [formData, setFormData] = useState({
    fullName: '',
    school: '',
    email: '',
    password: '',
    confirmPassword: '',
    teacherAccessCode: '',
    terms: false
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('error')
  const [passwordStrength, setPasswordStrength] = useState(null)

  // Check for URL messages
  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage === 'session_expired') {
      setMessage('Your session has expired. Please sign in again.')
      setMessageType('error')
    }
  }, [searchParams])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }

    // Check password strength
    if (name === 'password') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.fullName.trim()) {
      errors.fullName = true
    }
    
    if (!formData.school.trim()) {
      errors.school = true
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = true
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.password = true
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = true
    }
    
    if (!formData.teacherAccessCode.trim()) {
      errors.teacherAccessCode = true
    }
    
    if (!formData.terms) {
      setMessage('Please accept the Terms of Service and Privacy Policy')
      setMessageType('error')
      return false
    }
    
    setFieldErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      if (errors.password && formData.password.length < 6) {
        setMessage('Password must be at least 6 characters long')
      } else if (errors.confirmPassword) {
        setMessage('Passwords do not match')
      } else if (errors.teacherAccessCode) {
        setMessage('Secret access code is required')
      } else {
        setMessage('Please fill in all required fields correctly')
      }
      setMessageType('error')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    clearError()
    clearValidationError()
    setMessage(null)
    
    // First validate teacher access code
    const validation = await validateTeacherAccessCode(formData.teacherAccessCode)
    
    if (!validation.success) {
      if (validation.error === 'Unauthorized Access') {
        alert('Unauthorized Access')
      } else {
        setMessage(validation.error)
        setMessageType('error')
      }
      return
    }
    
    // Proceed with signup
    const result = await signUp(formData.email, formData.password, {
      fullName: formData.fullName,
      school: formData.school,
    })
    
    if (result.success) {
      setMessage(
        'Account created successfully! Please check your email to verify your account before signing in.',
        'success'
      )
      
      // Clear form
      setFormData({
        fullName: '',
        school: '',
        email: '',
        password: '',
        confirmPassword: '',
        teacherAccessCode: '',
        terms: false
      })
      setPasswordStrength(null)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?message=account_created')
      }, 3000)
    } else {
      setMessage(result.error)
      setMessageType('error')
    }
  }

  const clearMessage = () => {
    setMessage(null)
  }

  return (
    <div className="auth-container">
      <main className="auth-card">
        <header className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
            <span>StudentHub</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of teachers managing their students efficiently</p>
        </header>
        
        <form id="signup-form" onSubmit={handleSubmit} noValidate>
          {(message || error || validationError) && (
            <div id="message-container">
              <Message 
                message={message || error || validationError} 
                type={messageType || 'error'} 
                onAutoHide={messageType === 'success' ? clearMessage : null}
              />
            </div>
          )}
          
          <FormInput
            label="Full Name"
            type="text"
            id="full-name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            autoComplete="name"
            error={fieldErrors.fullName}
          />
          
          <FormInput
            label="School Name"
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            placeholder="Enter your school name"
            required
            autoComplete="organization"
            error={fieldErrors.school}
          />
          
          <FormInput
            label="Email Address"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
          
          <PasswordInput
            label="Password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
            minLength="6"
            showStrengthIndicator
            strengthFeedback={passwordStrength}
            error={fieldErrors.password}
          />
          
          <PasswordInput
            label="Confirm Password"
            id="confirm-password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />
          
          <FormInput
            label="Secret Access Code"
            type="text"
            id="teacher-access-code"
            name="teacherAccessCode"
            value={formData.teacherAccessCode}
            onChange={handleInputChange}
            placeholder="Enter your secret access code"
            required
            autoComplete="off"
            error={fieldErrors.teacherAccessCode}
          />
          
          {remainingAttempts < 5 && (
            <div style={{ 
              fontSize: 'var(--font-size-xs)', 
              color: 'var(--color-warning)', 
              marginTop: 'var(--space-2)',
              textAlign: 'center'
            }}>
              {remainingAttempts} attempts remaining
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">
              <input 
                type="checkbox" 
                id="terms" 
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
                style={{ marginRight: 'var(--space-2)' }}
              />
              I agree to the <a href="/terms.html" target="_blank">Terms of Service</a> and <a href="/privacy.html" target="_blank">Privacy Policy</a>
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading || validating}>
            <span>{loading || validating ? '' : 'Create Account'}</span>
            {(loading || validating) && <div className="loading-spinner" />}
          </button>
        </form>
        
        <footer className="auth-footer">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </footer>
      </main>
    </div>
  )
}
