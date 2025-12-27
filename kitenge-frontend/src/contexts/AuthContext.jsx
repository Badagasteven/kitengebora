import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('kb_jwt_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authAPI.checkAuth()
      const data = response.data

      if (data.isAuthenticated) {
        setUser(data.user)
        setIsAdmin(data.isAdmin || false)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('kb_jwt_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('kb_jwt_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const data = response.data

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        return { success: true, data: { requiresTwoFactor: true, message: data.message } }
      }

      if (data.token) {
        localStorage.setItem('kb_jwt_token', data.token)
        // Immediately update state with admin status from response
        const adminStatus = data.isAdmin === true || data.admin === true || false
        setUser(data.user)
        setIsAdmin(adminStatus)
        setIsAuthenticated(true)
        return { success: true, data: { ...data, isAdmin: adminStatus } }
      }
      throw new Error('No token received')
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      }
    }
  }

  const register = async (name, phone, email, password) => {
    try {
      const response = await authAPI.register({ name, phone, email, password })
      const data = response.data

      if (data.token) {
        localStorage.setItem('kb_jwt_token', data.token)
        setUser(data.user)
        setIsAdmin(data.isAdmin || false)
        setIsAuthenticated(true)
        return { success: true, data }
      }
      throw new Error('No token received')
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('kb_jwt_token')
    setUser(null)
    setIsAdmin(false)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    setUser,
    isAdmin,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

