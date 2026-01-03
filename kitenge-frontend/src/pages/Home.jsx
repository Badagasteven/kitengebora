import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import RecentlyViewed from '../components/RecentlyViewed'
import Newsletter from '../components/Newsletter'
import QuickViewModal from '../components/QuickViewModal'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductGridSkeleton, LoadingSpinner } from '../components/SkeletonLoader'
import { EmptyProducts } from '../components/EmptyState'
import { getImageUrl } from '../utils/imageUtils'

const Home = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedView, setSelectedView] = useState('new')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory, selectedView])

  const loadProducts = async () => {
    try {
      console.log('🔄 Loading products...')
      const response = await productsAPI.getPublicProducts()
      console.log('✅ Products loaded:', response.data?.length || 0, 'items')
      setProducts(response.data || [])
      setFilteredProducts(response.data || [])
      
      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ No products found. Check if:')
        console.warn('   1. Backend is running')
        console.warn('   2. Database has products with active=true')
        console.warn('   3. API endpoint is correct')
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error)
      console.error('💡 Check browser console Network tab for details')
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // View filter (new, promo, etc.)
    if (selectedView === 'promo') {
      filtered = filtered.filter((p) => p.is_promo)
    }

    setFilteredProducts(filtered)
  }

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))]

  // Get featured product images for carousel (products with images)
  const featuredProducts = products
    .filter(p => p.image && p.image.trim() !== '')
    .slice(0, 8) // Use up to 8 products for the carousel

  // Auto-advance carousel
  useEffect(() => {
    if (featuredProducts.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [featuredProducts.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero skeleton */}
        <div className="relative h-[500px] sm:h-[600px] md:h-[700px] bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        {/* Products skeleton */}
        <div className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
            </div>
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section with Product Image Carousel */}
      <section className="relative h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {featuredProducts.length > 0 ? (
            <>
              {featuredProducts.map((product, index) => (
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
                  {/* Minimal gradient overlay - just for subtle text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30 sm:from-black/25 sm:via-black/15 sm:to-black/25"></div>
                </div>
              ))}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700"></div>
          )}
        </div>

        {/* Subtle dark overlay for text readability - minimal to preserve image quality */}
        <div className="absolute inset-0 bg-black/15 sm:bg-black/10 z-10"></div>

        {/* Text Content - Enhanced visibility with stronger backdrop */}
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl w-full animate-fade-in-up">
          {/* Text backdrop for better readability - stronger to ensure text is always visible */}
          <div className="relative inline-block px-8 sm:px-10 py-6 sm:py-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-black/60 via-black/50 to-black/60 border-2 border-white/30 shadow-2xl">
            <div className="text-xs sm:text-sm font-bold mb-4 sm:mb-5 text-accent-300 uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              New drop · Kitenge prints
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 sm:mb-7 text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] leading-tight sm:leading-tight bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Bold African prints for everyday wear.
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-8 sm:mb-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed font-semibold max-w-2xl mx-auto">
              Carefully selected kitenge, ankara and wax fabrics ready to be
              tailored into your favourite looks.
            </p>
            <button
              onClick={() =>
                document
                  .getElementById('collection')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="btn-primary bg-white text-accent hover:bg-gray-50 shadow-2xl hover:shadow-accent-lg hover:scale-110 transition-all duration-300 text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 font-bold"
            >
              Shop the collection
            </button>
          </div>
        </div>

        {/* Carousel Navigation - Enhanced styling */}
        {featuredProducts.length > 1 && (
          <>
            {/* Previous Button - Enhanced visibility */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md text-white transition-all touch-manipulation shadow-lg hover:shadow-xl hover:scale-110 border border-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {/* Next Button - Enhanced visibility */}
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md text-white transition-all touch-manipulation shadow-lg hover:shadow-xl hover:scale-110 border border-white/20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {/* Dots Indicator - Enhanced with backdrop */}
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full backdrop-blur-md bg-black/20 border border-white/10">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all touch-manipulation ${
                    index === currentSlide
                      ? 'bg-white h-2.5 sm:h-3 w-6 sm:w-8 shadow-lg'
                      : 'bg-white/60 hover:bg-white/80 h-2.5 sm:h-3 w-2.5 sm:w-3'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="order-2 md:order-1 animate-fade-in-up">
              <div className="inline-block mb-4">
                <span className="text-accent font-bold text-sm uppercase tracking-widest">About Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 sm:mb-6 text-gray-900 dark:text-white leading-tight">
                Our story
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                Kitenge Bora celebrates African craftsmanship by connecting you
                to quality fabrics sourced with care. Every fabric tells a
                story — of culture, identity, and beauty.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl hover:shadow-accent-lg transition-all duration-500 order-1 md:order-2 group bg-gray-200 dark:bg-gray-700">
              <img
                src="/kitenge-fabrics-display.jpeg"
                alt="Colorful display of Kitenge fabrics arranged on shelves"
                className="w-full h-56 sm:h-72 md:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                loading="eager"
                onError={(e) => {
                  console.error('Image failed to load:', '/kitenge-fabrics-display.jpeg')
                  if (!e.target.src.includes('placeholder')) {
                    e.target.src = '/placeholder.png'
                  } else if (!e.target.src.includes('data:')) {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmI5MjNjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2l0ZW5nZSBCb3JhPC90ZXh0Pjwvc3ZnPg=='
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', '/kitenge-fabrics-display.jpeg')
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Promos Section */}
      {products.filter(p => p.is_promo).length > 0 && (
        <section className="py-12 sm:py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/30 dark:via-orange-900/20 dark:to-yellow-900/20 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-6 sm:mb-10 text-center">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl animate-pulse">🔥</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Special Promotions
                </h2>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto">
                Limited time offers - Don't miss out on these amazing deals!
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products
                .filter(p => p.is_promo)
                .slice(0, 4)
                .map((product) => (
                  <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                    <ProductCard
                      product={product}
                      onView={setSelectedProduct}
                    />
                  </div>
                ))}
            </div>
            
            {products.filter(p => p.is_promo).length > 4 && (
              <div className="text-center mt-6 sm:mt-10">
                <button
                  onClick={() => {
                    setSelectedView('promo')
                    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-primary px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  View All Promos ({products.filter(p => p.is_promo).length})
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Collection Section */}
      <section id="collection" className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-12 text-center">
            <div className="inline-block mb-4">
              <span className="text-accent font-bold text-sm uppercase tracking-widest">Products</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900 dark:text-white">
              Collection
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Browse our curated selection of premium African fabrics
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              {/* Desktop Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field sm:w-48 hidden sm:block"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Category Buttons - Horizontal Scrollable */}
            <div className="sm:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Products' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('new')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedView === 'new'
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                New in
              </button>
              <button
                onClick={() => setSelectedView('promo')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
                  selectedView === 'promo'
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Promo
                {products.filter(p => p.is_promo).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {products.filter(p => p.is_promo).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <EmptyProducts actionLabel="View All Products" actionLink="/products" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* Newsletter Section */}
      <Newsletter />

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}

export default Home

