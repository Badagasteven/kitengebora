import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { wishlistAPI } from '../services/api'
import LazyImage from './LazyImage'

const ProductCard = ({ product, onView }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated) {
        const localWishlist = JSON.parse(
          localStorage.getItem('kb_wishlist') || '[]'
        )
        setIsWishlisted(localWishlist.includes(product.id))
      } else {
        try {
          const wishlistRes = await wishlistAPI.getWishlist()
          const wishlistIds = wishlistRes.data || []
          setIsWishlisted(wishlistIds.includes(product.id))
        } catch (error) {
          // Fallback to local storage
          const localWishlist = JSON.parse(
            localStorage.getItem('kb_wishlist') || '[]'
          )
          setIsWishlisted(localWishlist.includes(product.id))
        }
      }
    }
    checkWishlistStatus()
  }, [product.id, isAuthenticated])

  // Listen for wishlist changes
  useEffect(() => {
    const handleWishlistChange = () => {
      if (!isAuthenticated) {
        const localWishlist = JSON.parse(
          localStorage.getItem('kb_wishlist') || '[]'
        )
        setIsWishlisted(localWishlist.includes(product.id))
      } else {
        wishlistAPI.getWishlist()
          .then(res => {
            const wishlistIds = res.data || []
            setIsWishlisted(wishlistIds.includes(product.id))
          })
          .catch(() => {
            const localWishlist = JSON.parse(
              localStorage.getItem('kb_wishlist') || '[]'
            )
            setIsWishlisted(localWishlist.includes(product.id))
          })
      }
    }

    window.addEventListener('wishlist:changed', handleWishlistChange)
    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChange)
    }
  }, [product.id, isAuthenticated])

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      // Store locally for guests
      const localWishlist = JSON.parse(
        localStorage.getItem('kb_wishlist') || '[]'
      )
      if (isWishlisted) {
        const updated = localWishlist.filter((id) => id !== product.id)
        localStorage.setItem('kb_wishlist', JSON.stringify(updated))
        toast.success(`${product.name} removed from wishlist`)
      } else {
        localStorage.setItem(
          'kb_wishlist',
          JSON.stringify([...localWishlist, product.id])
        )
        toast.success(`${product.name} added to wishlist`)
      }
      setIsWishlisted(!isWishlisted)
      // Dispatch event for wishlist page to refresh
      window.dispatchEvent(new Event('wishlist:changed'))
      return
    }

    setIsLoading(true)
    try {
      await wishlistAPI.toggleWishlist(
        product.id,
        isWishlisted ? 'remove' : 'add'
      )
      setIsWishlisted(!isWishlisted)
      toast.success(
        isWishlisted 
          ? `${product.name} removed from wishlist`
          : `${product.name} added to wishlist`
      )
      // Dispatch event for wishlist page to refresh
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
    console.log('Adding to cart:', product)
    if (product.in_stock === false) {
      toast.warning('This product is out of stock')
      return
    }
    addToCart(product)
    toast.success(`${product.name} added to cart!`, 4000, {
      image: product.image,
      productName: product.name,
    })
  }

  // Calculate discount percentage - Check multiple sources
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
  
  // Debug logging in development
  if (import.meta.env.DEV && product.is_promo) {
    console.log('Product promo:', {
      name: product.name,
      is_promo: product.is_promo,
      discount: product.discount,
      original_price: product.original_price,
      price: product.price,
      calculated: discountPercent
    })
  }

  return (
    <article className="card-hover group h-full flex flex-col relative" role="article" aria-label={`Product: ${product.name}`}>
      <div className="relative overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-800">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Enhanced gradient overlay with shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        </div>
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2 sm:gap-2.5 z-10">
          {product.is_promo && discountPercent > 0 && (
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-[11px] sm:text-xs md:text-sm font-black px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full shadow-xl shadow-red-500/50 animate-pulse-slow border-2 border-white/30 transform group-hover:scale-110 transition-transform duration-300">
              -{discountPercent}% OFF
            </span>
          )}
          {!product.in_stock && (
            <span className="bg-gradient-to-r from-gray-600 to-gray-700 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg">
              Out of stock
            </span>
          )}
        </div>
        <button
          onClick={handleWishlist}
          disabled={isLoading}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-3 sm:top-4 left-3 sm:left-4 p-3 sm:p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg z-10 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
            isWishlisted
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/50 active:scale-110'
              : 'bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300 active:bg-gradient-to-br active:from-red-500 active:to-red-600 active:text-white active:shadow-red-500/50 active:scale-110'
          }`}
        >
          <Heart
            className={`w-5 h-5 sm:w-5 sm:h-5 transition-all duration-300 ${isWishlisted ? 'fill-current scale-110' : ''}`}
          />
        </button>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 dark:text-white mb-1 sm:mb-1.5 truncate group-hover:text-accent transition-colors duration-300">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate font-semibold uppercase tracking-wide">
                {product.category}
              </p>
            )}
          </div>
        </div>

        {product.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className={`text-xl sm:text-2xl md:text-3xl font-black ${product.is_promo ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'} transition-colors duration-300`}>
              {product.price.toLocaleString()} RWF
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm sm:text-base md:text-lg text-gray-400 dark:text-gray-500 line-through font-semibold">
                {product.original_price.toLocaleString()} RWF
              </span>
            )}
          </div>
          {product.is_promo && discountPercent > 0 && product.original_price && product.original_price > product.price && (
            <span className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg inline-block w-fit border-2 border-green-200 dark:border-green-800 shadow-sm group-hover:shadow-md transition-shadow duration-300">
              Save {Math.max(0, product.original_price - product.price).toLocaleString()} RWF
            </span>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={product.in_stock === false}
            aria-label={`Add ${product.name} to cart`}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-sm py-4 sm:py-3.5 min-h-[48px] group-hover:shadow-accent-lg transition-all duration-300 touch-manipulation"
          >
            <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" aria-hidden="true" />
            <span className="hidden sm:inline font-bold">Add to cart</span>
            <span className="sm:hidden font-bold">Add</span>
          </button>
          <button
            onClick={() => onView && onView(product)}
            aria-label={`View details for ${product.name}`}
            className="btn-outline px-5 sm:px-5 py-4 sm:py-3.5 min-w-[48px] min-h-[48px] active:bg-accent active:text-white active:border-accent transition-all duration-300 group-hover:scale-105 touch-manipulation flex items-center justify-center"
          >
            <Eye className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

