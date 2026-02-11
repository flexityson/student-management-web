import React, { useEffect } from 'react'

export default function Message({ message, type = 'error', onAutoHide }) {
  useEffect(() => {
    if (type === 'success' && onAutoHide) {
      const timer = setTimeout(() => {
        onAutoHide()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [type, onAutoHide])

  if (!message) return null

  const messageClass = type === 'success' ? 'success-message' : 'error-message'
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'

  return (
    <div className={messageClass}>
      <i className={`fas ${icon}`} aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
