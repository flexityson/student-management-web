import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import FormInput from '../ui/FormInput'
import PasswordInput from '../ui/PasswordInput'
import Message from '../ui/Message'

export default function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, loading, error, clearError, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('error')

  // Check for URL messages and remembered email
  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage === 'account_created') {
      setMessage('Account created successfully! Please sign in.')
      setMessageType('success')
    } else if (urlMessage === 'session_expired') {
      setMessage('Your session has expired. Please sign in again.')
      setMessageType('error')
    } else if (urlMessage === 'password_reset') {
      setMessage('Password reset successfully! Please sign in with your new password.')
      setMessageType('success')
    }

    // Auto-fill remembered email
    const rememberedEmail = localStorage.getItem('rememberEmail')
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        remember: true
      }))
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

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
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = true
    }
    
    if (!formData.password) {
      errors.password = true
    }
    
    setFieldErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      setMessage('Please fill in all required fields correctly')
      setMessageType('error')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    clearError()
    setMessage(null)
    
    const result = await signIn(formData.email, formData.password)
    
    if (result.success) {
      setMessage('Signing in...', 'success')
      
      // Store remember me preference
      if (formData.remember) {
        localStorage.setItem('rememberEmail', formData.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your students efficiently</p>
        </header>
        
        <form id="login-form" onSubmit={handleSubmit} noValidate>
          {(message || error) && (
            <div id="message-container">
              <Message 
                message={message || error} 
                type={messageType || 'error'} 
                onAutoHide={messageType === 'success' ? clearMessage : null}
              />
            </div>
          )}
          
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
            autoFocus
            error={fieldErrors.email}
          />
          
          <PasswordInput
            label="Password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            error={fieldErrors.password}
          />
          
          <div className="form-options">
            <div className="remember-me">
              <input 
                type="checkbox" 
                id="remember" 
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="forgot-password">
              <a href="/forgot-password.html">Forgot password?</a>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <span>{loading ? '' : 'Sign In'}</span>
            {loading && <div className="loading-spinner" />}
          </button>
        </form>
        
        <footer className="auth-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </footer>
      </main>
    </div>
  )
}
