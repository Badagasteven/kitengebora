import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import ResendVerification from './pages/ResendVerification'
import Account from './pages/Account'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import ShippingInfo from './pages/ShippingInfo'
import ReturnsRefunds from './pages/ReturnsRefunds'
import FAQ from './pages/FAQ'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminOrders from './pages/Admin/Orders'
import AdminAnalytics from './pages/Admin/Analytics'
import AdminCustomers from './pages/Admin/Customers'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
              <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="verify-email" element={<VerifyEmail />} />
                <Route path="resend-verification" element={<ResendVerification />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="shipping-info" element={<ShippingInfo />} />
                <Route path="returns-refunds" element={<ReturnsRefunds />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route
                  path="account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/orders"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/analytics"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/customers"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCustomers />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App

