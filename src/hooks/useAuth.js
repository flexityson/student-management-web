import { useState, useEffect, useCallback } from 'react'
import { auth, utils } from '../js/supabaseClient.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { success, session, error } = await auth.getCurrentUser()
        if (success && session) {
          setUser(session.user)
        } else if (error) {
          setError(error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.client.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await auth.signIn(email, password)
      if (result.success) {
        return { success: true }
      } else {
        const errorMessage = utils.handleAuthError(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email, password, metadata) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await auth.signUp(email, password, metadata)
      if (result.success) {
        return { success: true }
      } else {
        const errorMessage = utils.handleAuthError(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!user
  }
}
