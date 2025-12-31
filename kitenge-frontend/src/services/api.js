import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  getAllUsers: () => api.get('/users/all'),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
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

