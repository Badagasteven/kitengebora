import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'

const Register = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors }

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required'
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters'
        } else {
          delete errors.name
        }
        break
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required'
        } else if (!/^\+?[\d\s-]{8,}$/.test(value.trim())) {
          errors.phone = 'Please enter a valid phone number'
        } else {
          delete errors.phone
        }
        break
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address'
        } else {
          delete errors.email
        }
        break
      case 'password':
        if (!value) {
          errors.password = 'Password is required'
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters'
        } else if (!/(?=.*[a-z])/.test(value)) {
          errors.password = 'Password should contain at least one lowercase letter'
        } else {
          delete errors.password
        }
        if (touched.confirmPassword && confirmPassword) {
          if (value !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
          } else {
            delete errors.confirmPassword
          }
        }
        break
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password'
        } else if (value !== password) {
          errors.confirmPassword = 'Passwords do not match'
        } else {
          delete errors.confirmPassword
        }
        break
    }

    setFieldErrors(errors)
  }

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true })
  }

  const handleChange = (fieldName, value, setter) => {
    setter(value)
    if (touched[fieldName]) {
      validateField(fieldName, value)
    }
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const allTouched = {
      name: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
    }
    setTouched(allTouched)

    validateField('name', name)
    validateField('phone', phone)
    validateField('email', email)
    validateField('password', password)
    validateField('confirmPassword', confirmPassword)

    const hasErrors =
      Object.keys(fieldErrors).length > 0 ||
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password ||
      password.length < 6 ||
      password !== confirmPassword

    if (hasErrors) {
      setError('Please fix the errors in the form')
      return
    }

    setLoading(true)
    const result = await register(name, phone, email, password)
    setLoading(false)

    if (result.success) {
      navigate(result.data.isAdmin ? '/admin' : '/')
    } else {
      setError(result.error)
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
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Create your account</div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-black leading-tight text-gray-900 dark:text-white sm:text-4xl">
                Join Kitenge Bora
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 sm:text-base">
                Save your wishlist, track orders, and checkout faster.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">Unable to create account</p>
                    <p className="mt-1 text-red-700/90 dark:text-red-200/90">{error}</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleChange('name', e.target.value, setName)}
                    onBlur={() => handleBlur('name')}
                    className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Your full name"
                    autoComplete="name"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                {touched.name && fieldErrors.name && <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handleChange('phone', e.target.value, setPhone)}
                    onBlur={() => handleBlur('phone')}
                    className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="e.g., +250 788 123 456"
                    inputMode="tel"
                    autoComplete="tel"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                {touched.phone && fieldErrors.phone && <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleChange('email', e.target.value, setEmail)}
                    onBlur={() => handleBlur('email')}
                    className={`input-field pl-10 min-h-[48px] text-base ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
                {touched.email && fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value, setPassword)}
                    onBlur={() => handleBlur('password')}
                    className={`input-field pl-10 pr-12 min-h-[48px] text-base ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
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
                {touched.password && fieldErrors.password && <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>}
                {touched.password && password && !fieldErrors.password && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ Password looks good</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value, setConfirmPassword)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`input-field pl-10 pr-12 min-h-[48px] text-base ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    style={{ fontSize: '16px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                )}
                {touched.confirmPassword &&
                  confirmPassword &&
                  !fieldErrors.confirmPassword &&
                  password === confirmPassword && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ Passwords match</p>
                  )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full min-h-[52px] text-base touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent hover:text-accent-darker">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
