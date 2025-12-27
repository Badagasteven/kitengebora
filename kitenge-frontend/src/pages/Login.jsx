import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, productsAPI } from '../services/api'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'

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
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const { login, isAdmin, checkAuth } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (products.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [products.length])

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getPublicProducts()
      // Filter products with images and take up to 8 for carousel
      const productsWithImages = (response.data || [])
        .filter(p => p.image && p.image.trim() !== '')
        .slice(0, 8)
      setProducts(productsWithImages)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }


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
        // Check admin status from response - try multiple possible field names
        const isAdminUser = result.data.isAdmin === true || result.data.admin === true || false
        if (isAdminUser) {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } else {
      setError(result.error)
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
        // Update auth state immediately by checking auth
        await checkAuth()
        // Check admin status from response or updated auth state
        const isAdminUser = response.data.isAdmin === true || response.data.admin === true || isAdmin
        if (isAdminUser) {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Product Carousel - Shown only on mobile */}
      {products.length > 0 && (
        <div className="lg:hidden relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 z-0 scale-105'
              }`}
            >
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{
                  imageRendering: 'crisp-edges',
                  objectFit: 'cover'
                }}
                loading="eager"
                onError={(e) => {
                  e.target.src = '/placeholder.png'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
            </div>
          ))}
          <div className="relative z-10 flex items-center justify-center h-full px-6 text-white text-center">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-8 sm:px-8 sm:py-10 border border-white/20 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                Hello Again 👋
              </h2>
              <p className="text-sm sm:text-base text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-relaxed">
                Your favourite kitenge pieces are waiting for you.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Sign in to view your wishlist and keep shopping.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                      if (error) setError('')
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
                    className={`input-field pl-10 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError('')
                    }}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Sign In'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Enter the 6-digit code sent to your email
                </p>
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
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-accent hover:text-accent-darker font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Desktop Product Carousel - Shown only on large screens */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700">
        {/* Product Image Carousel */}
        {products.length > 0 ? (
          <>
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-0 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
              >
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{
                    imageRendering: 'crisp-edges',
                    objectFit: 'cover'
                  }}
                  loading="eager"
                  onError={(e) => {
                    e.target.src = '/placeholder.png'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>
            ))}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700"></div>
        )}
        
        {/* Overlay with text */}
        <div className="relative z-10 flex items-center justify-center p-12 text-white">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl px-10 py-12 border border-white/30 shadow-2xl max-w-lg text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Hello Again 👋
            </h2>
            <p className="text-xl lg:text-2xl text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-relaxed">
              Your favourite kitenge pieces are waiting for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

