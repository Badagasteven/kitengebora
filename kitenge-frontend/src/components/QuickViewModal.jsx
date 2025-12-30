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

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
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
    toast.success(`${product.name} added to cart!`, 4000, {
      image: product.image,
      productName: product.name,
    })
    setTimeout(() => {
      window.dispatchEvent(new Event('cart:open'))
    }, 100)
  }

  if (!isOpen || !product) {
    return null
  }

  const discountPercent = product.is_promo && product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-4 sm:p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors z-10 touch-target"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Product Image */}
            <div className="relative">
              <LazyImage
                src={product.image}
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
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
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {product.description}
                </p>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {product.price.toLocaleString()} RWF
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      {product.original_price.toLocaleString()} RWF
                    </span>
                  )}
                </div>
                {product.is_promo && (
                  <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                    You save {((product.original_price - product.price) || 0).toLocaleString()} RWF
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

