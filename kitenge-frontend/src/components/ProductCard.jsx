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
    // Open cart drawer after a small delay to ensure state is updated
    setTimeout(() => {
      window.dispatchEvent(new Event('cart:open'))
      console.log('Cart open event dispatched')
    }, 100)
  }

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (product.original_price && product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100)
    }
    return product.discount || 0
  }

  const discountPercent = product.is_promo ? calculateDiscount() : 0

  return (
    <article className="card group h-full flex flex-col" role="article" aria-label={`Product: ${product.name}`}>
      <div className="relative overflow-hidden rounded-t-2xl">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
          {product.is_promo && discountPercent > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse">
              -{discountPercent}% OFF
            </span>
          )}
          {!product.in_stock && (
            <span className="bg-gray-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
              Out of stock
            </span>
          )}
        </div>
        <button
          onClick={handleWishlist}
          disabled={isLoading}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-2 sm:top-3 left-2 sm:left-3 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`}
          />
        </button>
      </div>

      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-0.5 sm:mb-1 truncate">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className={`text-lg sm:text-xl font-bold ${product.is_promo ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {product.price.toLocaleString()} RWF
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 line-through">
                {product.original_price.toLocaleString()} RWF
              </span>
            )}
          </div>
          {product.is_promo && discountPercent > 0 && (
            <span className="text-[10px] sm:text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded inline-block w-fit">
              Save {((product.original_price - product.price) || 0).toLocaleString()} RWF
            </span>
          )}
        </div>

        <div className="flex gap-1.5 sm:gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={product.in_stock === false}
            aria-label={`Add ${product.name} to cart`}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add to cart</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={() => onView && onView(product)}
            aria-label={`View details for ${product.name}`}
            className="btn-outline px-3 sm:px-4 py-2 sm:py-2.5"
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

