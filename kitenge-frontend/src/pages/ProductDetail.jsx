import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import ProductReviews from '../components/ProductReviews'
import { ShoppingCart, Heart, ArrowLeft, Plus, Minus, ZoomIn, X } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'
import { LoadingSpinner } from '../components/SkeletonLoader'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const zoomRef = useRef(null)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getProduct(id)
      setProduct(response.data)
    } catch (error) {
      console.error('Failed to load product:', error)
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product.in_stock === false) {
      toast.warning('This product is out of stock')
      return
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    toast.success(`${product.name} added to cart!`, 4000, {
      image: product.image,
      productName: product.name,
    })
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">Product not found</p>
          <Link to="/products" className="text-accent hover:underline font-medium">
            Browse all products →
          </Link>
        </div>
      </div>
    )
  }

  const images = product.image ? [product.image] : ['/placeholder.png']

  const handleImageMouseMove = (e) => {
    if (!imageRef.current || !zoomRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  const handleImageClick = () => {
    setIsZoomed(!isZoomed)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <div 
              className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 cursor-zoom-in group"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onClick={handleImageClick}
              ref={imageRef}
            >
              <img
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                onError={(e) => {
                  e.target.src = '/placeholder.png'
                }}
              />
              {isZoomed && (
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute w-32 h-32 border-2 border-white rounded-full shadow-lg"
                    style={{
                      left: `${zoomPosition.x}%`,
                      top: `${zoomPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 text-white p-2 rounded-lg">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-accent shadow-lg scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.category && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-2">
                  {product.category}
                </span>
              )}
              {product.is_promo && (
                <span className="inline-block px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium ml-2">
                  -{product.discount}% OFF
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                {product.description}
              </p>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.price.toLocaleString()} RWF
                </span>
                {product.original_price && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.original_price.toLocaleString()} RWF
                  </span>
                )}
              </div>
              {product.is_promo && (
                <p className="text-green-600 dark:text-green-400 font-medium">
                  You save{' '}
                  {((product.original_price - product.price) / product.original_price) * 100}%
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

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.in_stock === false}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="btn-outline p-4">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Product Details
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {product.category && (
                  <p>
                    <span className="font-medium">Category:</span> {product.category}
                  </p>
                )}
                <p>
                  <span className="font-medium">Price:</span> {product.price.toLocaleString()} RWF
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  )
}

export default ProductDetail

