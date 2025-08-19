import { useState, useEffect, useCallback } from 'react'

interface User {
  id: number
  username: string
  email: string
}

interface AuthTokens {
  access_token: string
  refresh_token: string
}

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    loading: true,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const tokens = localStorage.getItem('auth_tokens')
    const user = localStorage.getItem('auth_user')
    
    if (tokens && user) {
      try {
        setAuthState({
          tokens: JSON.parse(tokens),
          user: JSON.parse(user),
          isAuthenticated: true,
          loading: false,
        })
      } catch (error) {
        console.error('Error parsing stored auth data:', error)
        localStorage.removeItem('auth_tokens')
        localStorage.removeItem('auth_user')
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          loading: false,
        })
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      
      // Store tokens and user data
      localStorage.setItem('auth_tokens', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      }))
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      setAuthState({
        user: data.user,
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
        isAuthenticated: true,
        loading: false,
      })

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }, [])

  const register = useCallback(async (username: string, password: string, email?: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      
      // Store tokens and user data
      localStorage.setItem('auth_tokens', JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      }))
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      setAuthState({
        user: data.user,
        tokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
        isAuthenticated: true,
        loading: false,
      })

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_tokens')
    localStorage.removeItem('auth_user')
    setAuthState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      loading: false,
    })
  }, [])

  const refreshToken = useCallback(async () => {
    if (!authState.tokens?.refresh_token) {
      return false
    }

    try {
      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: authState.tokens.refresh_token,
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      const newTokens = {
        access_token: data.access,
        refresh_token: data.refresh || authState.tokens.refresh_token, // Use new refresh token if provided
      }

      localStorage.setItem('auth_tokens', JSON.stringify(newTokens))

      setAuthState(prev => ({
        ...prev,
        tokens: newTokens,
      }))

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }, [authState.tokens?.refresh_token, logout])

  const getAuthHeaders = useCallback(async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    console.log('Current auth state:', authState)
    console.log('Access token:', authState.tokens?.access_token)
    
    if (authState.tokens?.access_token) {
      headers['Authorization'] = `Bearer ${authState.tokens.access_token}`
    } else {
      console.warn('No access token available')
    }

    return headers
  }, [authState.tokens?.access_token])

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = await getAuthHeaders()
    
    console.log('Making authenticated request to:', url)
    console.log('Headers:', headers)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    console.log('Response status:', response.status)

    // If we get a 401, try to refresh the token
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...')
      const refreshed = await refreshToken()
      if (refreshed) {
        console.log('Token refreshed successfully, retrying request...')
        // Retry the request with the new token
        const newHeaders = await getAuthHeaders()
        return fetch(url, {
          ...options,
          headers: {
            ...newHeaders,
            ...options.headers,
          },
        })
      } else {
        console.log('Token refresh failed')
      }
    }

    return response
  }, [getAuthHeaders, refreshToken])

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    getAuthHeaders,
    makeAuthenticatedRequest,
  }
}
