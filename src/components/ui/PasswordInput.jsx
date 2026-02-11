import React, { useState } from 'react'

export default function PasswordInput({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  autoComplete,
  showStrengthIndicator = false,
  strengthFeedback,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="password-input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`form-control ${error ? 'form-error' : ''} ${className}`}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={togglePasswordVisibility}
          aria-label="Toggle password visibility"
        >
          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
        </button>
      </div>
      {showStrengthIndicator && strengthFeedback && (
        <div className={`password-strength ${strengthFeedback.className}`}>
          {strengthFeedback.feedback}
        </div>
      )}
    </div>
  )
}
