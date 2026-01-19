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
      } else if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection')
      ) {
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
    <div className="relative min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-accent-400/25 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-gradient-to-tr from-accent-500/20 to-transparent blur-3xl"
      />

      <div className="relative flex min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] items-start justify-center px-4 py-10 sm:items-center sm:py-14">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-900/65 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                <img
                  src="/kitenge-logo.png"
                  alt="Kitenge Bora"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    if (e.target.src.includes('kitenge-logo.png')) {
                      e.target.src = '/kitenge-logo.png.png'
                    } else {
                      e.target.src = '/igitenge1.jpeg'
                    }
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black tracking-wide text-gray-900 dark:text-white">
                  KITENGE <span className="text-accent-600">BORA</span>
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sign in to continue</div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-black leading-tight text-gray-900 dark:text-white sm:text-4xl">
                Hello Again
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 sm:text-base">
                Your favourite kitenge pieces are waiting for you.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">Unable to sign in</p>
                    <p className="mt-1 text-red-700/90 dark:text-red-200/90">
                      {error.toLowerCase().includes('invalid credentials') || error.toLowerCase().includes('invalid')
                        ? 'The email or password you entered is incorrect.'
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
                    className="flex-shrink-0 rounded-lg p-2 text-red-700/70 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-red-200/70 dark:hover:bg-red-900/30 dark:hover:text-red-200"
                    aria-label="Dismiss error"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {!requires2FA ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                          const nextErrors = { ...fieldErrors }
                          delete nextErrors.email
                          setFieldErrors(nextErrors)
                        }
                      }}
                      className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="you@example.com"
                      inputMode="email"
                      autoComplete="email"
                      style={{ fontSize: '16px' }}
                      required
                    />
                  </div>
                  {touched.email && fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-sm font-semibold text-accent hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      className="input-field pl-10 pr-12 min-h-[48px] text-base"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{ fontSize: '16px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full min-h-[52px] text-base touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handle2FAVerify} className="space-y-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
                  A verification code has been sent to <strong>{email}</strong>. Enter it below.
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl tracking-[0.25em]"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Enter the 6-digit code.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false)
                    setTwoFactorCode('')
                    setError('')
                  }}
                  className="w-full rounded-xl py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-accent dark:text-gray-400"
                >
                  Back to sign in
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-accent hover:text-accent-darker">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
