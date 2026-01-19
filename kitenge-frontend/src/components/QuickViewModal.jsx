import { X, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { wishlistAPI } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'
import LazyImage from './LazyImage'
import SocialShare from './SocialShare'
import { useState, useEffect, useRef } from 'react'
import { useKeyboardNavigation, useFocusTrap } from '../hooks/useKeyboardNavigation'

// Safe auth hook that doesn't throw
const useSafeAuth = () => {
  try {
    return useAuth()
  } catch (error) {
    // If auth context is not available, return default values
    return {
      isAuthenticated: !!localStorage.getItem('kb_jwt_token'),
      user: null,
      isAdmin: false,
    }
  }
}

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useSafeAuth()
  const toast = useToast()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef(null)

  useFocusTrap(modalRef, isOpen)
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: isOpen,
  })

  useEffect(() => {
    if (product && isOpen) {
      checkWishlistStatus()
    }
  }, [product, isOpen, isAuthenticated])

  const checkWishlistStatus = async () => {
    if (!product) return
    
    if (!isAuthenticated) {
      const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
      setIsWishlisted(localWishlist.includes(product.id))
    } else {
      try {
        const wishlistRes = await wishlistAPI.getWishlist()
        const wishlistIds = wishlistRes.data || []
        setIsWishlisted(wishlistIds.includes(product.id))
      } catch (error) {
        const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
        setIsWishlisted(localWishlist.includes(product.id))
      }
    }
  }

  const handleWishlist = async () => {
    if (!product) return
    
    if (!isAuthenticated) {
      const localWishlist = JSON.parse(localStorage.getItem('kb_wishlist') || '[]')
      if (isWishlisted) {
        const updated = localWishlist.filter((id) => id !== product.id)
        localStorage.setItem('kb_wishlist', JSON.stringify(updated))
        toast.success(`${product.name} removed from wishlist`)
      } else {
        localStorage.setItem('kb_wishlist', JSON.stringify([...localWishlist, product.id]))
        toast.success(`${product.name} added to wishlist`)
      }
      setIsWishlisted(!isWishlisted)
      window.dispatchEvent(new Event('wishlist:changed'))
      return
    }

    setIsLoading(true)
    try {
      await wishlistAPI.toggleWishlist(product.id, isWishlisted ? 'remove' : 'add')
      setIsWishlisted(!isWishlisted)
      toast.success(
        isWishlisted 
          ? `${product.name} removed from wishlist`
          : `${product.name} added to wishlist`
      )
      window.dispatchEvent(new Event('wishlist:changed'))
    } catch (error) {
      console.error('Wishlist toggle failed:', error)
      toast.error(
        error.response?.data?.error || 
        `Failed to ${isWishlisted ? 'remove from' : 'add to'} wishlist`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    if (product.in_stock === false) {
      toast.warning('This product is out of stock')
      return
    }
    addToCart(product)
    toast.success(product.name, 4000, {
      image: product.image,
      productName: product.name,
    })
  }

  if (!isOpen || !product) {
    return null
  }

  // Calculate discount percentage - Check multiple sources (same logic as ProductCard)
  const calculateDiscount = () => {
    // Priority 1: Use discount field directly if available
    if (product.discount && product.discount > 0) {
      return product.discount
    }
    
    // Priority 2: Calculate from original_price and price
    if (product.original_price && product.price && product.original_price > product.price) {
      const calculated = Math.round(((product.original_price - product.price) / product.original_price) * 100)
      if (calculated > 0) {
        return calculated
      }
    }
    
    return 0
  }

  const discountPercent = product.is_promo ? calculateDiscount() : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[85svh] sm:max-h-[85vh] md:max-h-[90vh] shadow-2xl animate-fade-in-up overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors touch-target"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Product Image */}
            <div className="relative">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-full h-52 sm:h-64 md:h-72 object-cover rounded-lg"
                loading="eager"
              />
              {product.is_promo && discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{discountPercent}% OFF
                </span>
              )}
              {!product.in_stock && (
                <span className="absolute top-4 right-4 bg-gray-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  Out of stock
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                {product.category && (
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-2">
                    {product.category}
                  </span>
                )}
              </div>

              <h2 id="quick-view-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {product.name}
              </h2>

              {product.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-4">
                  {product.description}
                </p>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {product.price.toLocaleString()} RWF
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-lg sm:text-xl text-gray-400 line-through">
                      {product.original_price.toLocaleString()} RWF
                    </span>
                  )}
                </div>
                {product.is_promo && discountPercent > 0 && product.original_price && product.original_price > product.price && (
                  <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                    You save {Math.max(0, product.original_price - product.price).toLocaleString()} RWF
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.in_stock ? (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.in_stock === false}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-2.5"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleWishlist}
                  disabled={isLoading}
                  className={`btn-outline p-3 sm:p-4 min-w-[52px] sm:min-w-[56px] ${isWishlisted ? 'text-red-600 border-red-600' : ''}`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Social Links */}
              <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <SocialShare product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal

