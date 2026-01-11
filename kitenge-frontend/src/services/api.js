import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kb_jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors and log API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors for debugging
    if (import.meta.env.DEV) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network Error - Backend not reachable at:', API_BASE_URL)
        console.error('Make sure backend is running on the correct port')
      } else if (error.response) {
        console.error('API Error:', error.response.status, error.response.statusText)
        console.error('URL:', error.config?.url)
      } else {
        console.error('Request Error:', error.message)
      }
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('kb_jwt_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  checkAuth: () => api.get('/check-auth'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/reset-password', { token, newPassword }),
  verifyTwoFactor: (email, code) => api.post('/verify-2fa', { email, code }),
  verifyEmail: (token) => api.post('/verify-email', { token }),
  resendVerification: (email) => api.post('/resend-verification', { email }),
}

// Products API
export const productsAPI = {
  getPublicProducts: () => api.get('/public-products'),
  getAllProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  toggleActive: (id, active) => api.patch(`/products/${id}/active`, { active }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Orders API
export const ordersAPI = {
  createOrder: (data) => api.post('/orders', data),
  getAllOrders: () => api.get('/orders'),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
  trackOrderByNumber: (orderNumber, phone) =>
    api.post('/orders/track', { orderNumber, phone }),
  updateOrderStatus: (id, status, trackingNumber) =>
    api.put(`/orders/${id}/status`, { status, trackingNumber }),
}

// Stats API
export const statsAPI = {
  getBusinessStats: () => api.get('/stats/business'),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/users/change-password', { currentPassword, newPassword }),
  updateTwoFactor: (enabled) => api.put('/users/two-factor', { enabled }),
  uploadProfileImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deactivateAccount: () => api.post('/users/deactivate'),
  deleteAccount: () => api.delete('/users/me'),
  getAllUsers: () => api.get('/users/all'),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  // Addresses
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (addressId, data) => api.put(`/users/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  
  // Preferences
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (data) => api.put('/users/preferences', data),
  
  // Notifications
  getNotifications: () => api.get('/users/notifications'),
  updateNotifications: (data) => api.put('/users/notifications', data),
}

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getProductRating: (productId) => api.get(`/reviews/product/${productId}/rating`),
  createReview: (data) => api.post('/reviews', data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
}

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (productId, action) =>
    api.post('/wishlist', { productId: productId, action }),
}

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post('/contact', data),
}

export default api

