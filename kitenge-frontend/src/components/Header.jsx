import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, User, Moon, Sun, LogOut, Search, X, Menu, Monitor, Check, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState, useEffect, useRef } from 'react'
import { productsAPI } from '../services/api'

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { getCartCount } = useCart()
  const { isDark, theme, setThemeMode } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const themeMenuRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const cartCount = getCartCount()

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('kb_search_history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }, [])

  // Save search to history
  const saveToHistory = (query) => {
    if (!query.trim()) return
    const updatedHistory = [
      query.trim(),
      ...searchHistory.filter(item => item.toLowerCase() !== query.trim().toLowerCase())
    ].slice(0, 5) // Keep only last 5 searches
    setSearchHistory(updatedHistory)
    localStorage.setItem('kb_search_history', JSON.stringify(updatedHistory))
  }

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        const response = await productsAPI.getPublicProducts()
        const products = response.data || []
        const query = searchQuery.toLowerCase()
        const filtered = products
          .filter(
            (product) =>
              product.name?.toLowerCase().includes(query) ||
              product.description?.toLowerCase().includes(query) ||
              product.category?.toLowerCase().includes(query)
          )
          .slice(0, 5)
        setSearchResults(filtered)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setSearchLoading(false)
      }
    }

    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false)
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false)
      }
    }

    if (showSearch || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch, showThemeMenu])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveToHistory(searchQuery)
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleSearchClick = (query) => {
    setSearchQuery(query)
    saveToHistory(query)
    navigate(`/products?q=${encodeURIComponent(query)}`)
    setShowSearch(false)
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('kb_search_history')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowMenu(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0 min-w-0">
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors leading-tight tracking-tight">
                KITENGE BORA
              </div>
              <div className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Curated African fabrics & outfits
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Contact
            </Link>
            <Link
              to="/wishlist"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 touch-target"
              aria-label="Menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            {/* Global Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 touch-target"
                aria-label="Search"
              >
                <Search className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {showSearch && (
                <div 
                  className="absolute right-0 top-full mt-1.5 sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-md bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50"
                  style={{
                    maxWidth: 'calc(100vw - 1.5rem)',
                  }}
                >
                  <form onSubmit={handleSearchSubmit} className="p-2.5 sm:p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                      <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="input-field pl-9 sm:pl-10 pr-8 sm:pr-10 w-full text-sm sm:text-base py-2 sm:py-2.5"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('')
                            setSearchResults([])
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Search Results */}
                  <div className="max-h-[calc(100vh-200px)] sm:max-h-96 overflow-y-auto -webkit-overflow-scrolling-touch">
                    {searchLoading ? (
                      <div className="p-6 sm:p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            onClick={() => {
                              setShowSearch(false)
                              setSearchQuery('')
                            }}
                            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <img
                              src={product.image || '/placeholder.png'}
                              alt={product.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {product.price.toLocaleString()} RWF
                              </p>
                            </div>
                          </Link>
                        ))}
                        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full text-center text-xs sm:text-sm text-accent hover:underline py-2"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-6 sm:p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No products found
                      </div>
                    ) : searchHistory.length > 0 ? (
                      <div className="p-2">
                        <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200 dark:border-gray-800">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent Searches</p>
                          <button
                            onClick={clearSearchHistory}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            Clear
                          </button>
                        </div>
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchClick(item)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 sm:p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Start typing to search...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Admin Button - Always visible when admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 border-0"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">A</span>
              </Link>
            )}

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <Link 
                to="/login" 
                className="px-3.5 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95 transition-all duration-200 whitespace-nowrap"
              >
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95 transition-all duration-200"
                >
                  <User className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline truncate max-w-[120px]">{user?.name || user?.email}</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setShowMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setShowMenu(false)}
                      >
                        My Account
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle with Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 touch-target"
                aria-label="Theme options"
              >
                {theme === 'system' ? (
                  <Monitor className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                ) : isDark ? (
                  <Moon className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Theme</span>
                  </div>
                  <button
                    onClick={() => {
                      setThemeMode('light')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="flex-1 text-left">Light</span>
                    {theme === 'light' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('dark')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="flex-1 text-left">Dark</span>
                    {theme === 'dark' && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('system')
                      setShowThemeMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      theme === 'system'
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="flex-1 text-left">System Default</span>
                    {theme === 'system' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => window.dispatchEvent(new Event('cart:open'))}
              className="relative p-2.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-200 touch-target"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center leading-none shadow-md border-2 border-white dark:border-gray-900">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto">
            <nav className="px-3 sm:px-4 py-2.5 sm:py-4 space-y-0.5 sm:space-y-1">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
              >
                Products
              </Link>
              <Link
                to="/about"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
              >
                Contact
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700 flex items-center gap-2"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                Wishlist
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
                >
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    to="/account"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowMobileMenu(false)
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3.5 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:bg-gray-200 dark:active:bg-gray-700"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

