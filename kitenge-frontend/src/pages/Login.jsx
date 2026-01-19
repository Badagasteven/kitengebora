import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { login, isAdmin, checkAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      if (result.data.requiresTwoFactor) {
        setRequires2FA(true)
      } else {
        const isAdminUser = result.data.isAdmin === true || result.data.admin === true || false
        navigate(isAdminUser ? '/admin' : '/')
      }
    } else {
      let errorMessage = result.error || 'Login failed'
      if (
        errorMessage.toLowerCase().includes('invalid credentials') ||
        errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('credentials')
      ) {
        errorMessage = 'Invalid credentials'
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        errorMessage = 'User not found'
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorMessage = 'Network error'
      }
      setError(errorMessage)
    }
  }

  const handle2FAVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.verifyTwoFactor(email, twoFactorCode)
      if (response.data.token) {
        localStorage.setItem('kb_jwt_token', response.data.token)
        await checkAuth()
        const isAdminUser = response.data.isAdmin === true || response.data.admin === true || isAdmin
        navigate(isAdminUser ? '/admin' : '/')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] flex items-center justify-center px-4 pt-4 pb-14 sm:px-6 sm:pt-6 sm:pb-16 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black mb-3 text-gray-900 dark:text-white">
              Hello Again
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
              Your favourite kitenge pieces are waiting for you.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 sm:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 text-sm sm:text-base">
                        Unable to Login
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                        {error.toLowerCase().includes('invalid credentials') || error.toLowerCase().includes('invalid')
                          ? 'The email or password you entered is incorrect. Please try again.'
                          : error.toLowerCase().includes('user not found')
                            ? 'No account found with this email address.'
                            : error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')
                              ? 'Unable to connect to the server. Please check your internet connection.'
                              : error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Dismiss error"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                    }}
                    onBlur={() => {
                      setTouched({ ...touched, email: true })
                      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        setFieldErrors({ ...fieldErrors, email: 'Please enter a valid email address' })
                      } else {
                        const newErrors = { ...fieldErrors }
                        delete newErrors.email
                        setFieldErrors(newErrors)
                      }
                    }}
                    className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="you@example.com"
                    style={{ fontSize: '16px' }}
                    autoComplete="email"
                    required
                  />
                </div>
                {touched.email && fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    className="input-field pl-10 pr-12 min-h-[48px] text-base"
                    placeholder="Enter password"
                    style={{ fontSize: '16px' }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full min-h-[48px] text-base touch-manipulation">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FAVerify} className="space-y-4">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  A verification code has been sent to <strong>{email}</strong>. Please enter the code below.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter the 6-digit code sent to your email</p>
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false)
                  setTwoFactorCode('')
                  setError('')
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent w-full"
              >
                Back to login
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-darker font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
