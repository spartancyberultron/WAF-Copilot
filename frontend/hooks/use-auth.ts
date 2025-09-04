import { useState, useEffect, useCallback } from 'react'

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  date_joined?: string
  last_login?: string
  is_staff?: boolean
  is_superuser?: boolean
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

interface UserStatistics {
  total_cves: number
  resolved_cves: number
  unresolved_cves: number
}

interface UserProfile {
  success: boolean
  user: User
  statistics: UserStatistics
  error?: string
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
    // Prevent login if already authenticated
    if (authState.isAuthenticated) {
      return { success: true, message: 'Already logged in' }
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        let errorMessage = 'Login failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          if (response.status === 401) {
            errorMessage = 'Invalid username or password'
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.'
          } else {
            errorMessage = `Login failed (${response.status})`
          }
        }
        return { success: false, error: errorMessage }
      }

      const data = await response.json()
      
      // Validate response data
      if (!data.access_token || !data.refresh_token || !data.user) {
        return { success: false, error: 'Invalid response from server' }
      }
      
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
  }, [authState.isAuthenticated])

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
        let errorMessage = 'Registration failed'
        try {
          const errorData = await response.json()
          
          // Handle Django validation errors
          if (errorData.errors) {
            // New format from improved backend
            if (errorData.errors.username && Array.isArray(errorData.errors.username)) {
              const usernameError = errorData.errors.username[0]
              if (usernameError.includes('already exists')) {
                errorMessage = 'This username is already taken. Please choose a different one.'
              } else {
                errorMessage = usernameError
              }
            } else if (errorData.errors.email && Array.isArray(errorData.errors.email)) {
              const emailError = errorData.errors.email[0]
              if (emailError.includes('already exists')) {
                errorMessage = 'This email is already registered. Please use a different email or try logging in.'
              } else {
                errorMessage = emailError
              }
            } else if (errorData.errors.password && Array.isArray(errorData.errors.password)) {
              const passwordError = errorData.errors.password[0]
              if (passwordError.includes('too common')) {
                errorMessage = 'This password is too common. Please choose a stronger password.'
              } else if (passwordError.includes('too short')) {
                errorMessage = 'Password is too short. Please choose a longer password.'
              } else {
                errorMessage = passwordError
              }
            } else {
              // Get the first error from any field
              const firstField = Object.keys(errorData.errors)[0]
              if (firstField && Array.isArray(errorData.errors[firstField])) {
                errorMessage = errorData.errors[firstField][0]
              }
            }
          } else if (errorData.username && Array.isArray(errorData.username)) {
            // Legacy format
            const usernameError = errorData.username[0]
            if (usernameError && usernameError.includes('already exists')) {
              errorMessage = 'This username is already taken. Please choose a different one.'
            } else {
              errorMessage = usernameError || 'Username already exists'
            }
          } else if (errorData.email && Array.isArray(errorData.email)) {
            const emailError = errorData.email[0]
            if (emailError && emailError.includes('already exists')) {
              errorMessage = 'This email is already registered. Please use a different email or try logging in.'
            } else {
              errorMessage = emailError || 'Email already exists'
            }
          } else if (errorData.password && Array.isArray(errorData.password)) {
            const passwordError = errorData.password[0]
            if (passwordError && passwordError.includes('too common')) {
              errorMessage = 'This password is too common. Please choose a stronger password.'
            } else if (passwordError && passwordError.includes('too short')) {
              errorMessage = 'Password is too short. Please choose a longer password.'
            } else {
              errorMessage = passwordError || 'Password validation failed'
            }
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else {
            // Handle non-array validation errors
            if (typeof errorData === 'object') {
              const firstError = Object.values(errorData)[0]
              if (Array.isArray(firstError) && firstError.length > 0) {
                errorMessage = firstError[0]
              } else if (typeof firstError === 'string') {
                errorMessage = firstError
              }
            }
          }
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          if (response.status === 400) {
            errorMessage = 'Invalid registration data. Please check your input.'
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.'
          } else {
            errorMessage = `Registration failed (${response.status})`
          }
        }
        return { success: false, error: errorMessage }
      }

      const data = await response.json()
      
      // Validate response data
      if (!data.access_token || !data.refresh_token || !data.user) {
        return { success: false, error: 'Invalid response from server' }
      }
      
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

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest('http://localhost:8000/api/user/profile/')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const profileData: UserProfile = await response.json()
      
      if (profileData.success) {
        // Update the user state with the fetched profile data
        setAuthState(prev => ({
          ...prev,
          user: profileData.user,
        }))
        
        // Update localStorage with the new user data
        localStorage.setItem('auth_user', JSON.stringify(profileData.user))
        
        return { success: true, profile: profileData }
      } else {
        throw new Error(profileData.error || 'Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch profile' }
    }
  }, [makeAuthenticatedRequest])

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
    getAuthHeaders,
    makeAuthenticatedRequest,
    fetchUserProfile,
  }
}
