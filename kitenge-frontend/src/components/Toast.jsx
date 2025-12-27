import { X, CheckCircle, AlertCircle, Info, XCircle, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 5000, image, productName }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            onClose()
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  const bgColors = {
    success: 'bg-white dark:bg-gray-800 border-green-300 dark:border-green-700',
    error: 'bg-white dark:bg-gray-800 border-red-300 dark:border-red-700',
    warning: 'bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700',
    info: 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700',
  }

  const textColors = {
    success: 'text-gray-900 dark:text-gray-100',
    error: 'text-gray-900 dark:text-gray-100',
    warning: 'text-gray-900 dark:text-gray-100',
    info: 'text-gray-900 dark:text-gray-100',
  }

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  const isCartNotification = type === 'success' && image

  return (
    <div
      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 shadow-2xl min-w-[320px] max-w-md animate-slide-in-right backdrop-blur-sm ${bgColors[type]}`}
      role="alert"
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${progressColors[type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Product Image (for cart notifications) */}
      {isCartNotification && (
        <div className="flex-shrink-0 relative">
          <img
            src={image}
            alt={productName || 'Product'}
            className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
            onError={(e) => {
              e.target.src = '/placeholder.png'
            }}
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      {/* Icon (if no image) */}
      {!isCartNotification && (
        <div className={`flex-shrink-0 ${iconColors[type]}`}>
          {icons[type]}
        </div>
      )}

      {/* Message */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${textColors[type]} mb-0.5`}>
          {isCartNotification && (
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Added to Cart
              </span>
            </div>
          )}
          <div className="text-base">{message}</div>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  )
}

export default Toast

