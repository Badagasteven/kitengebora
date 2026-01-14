import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { ordersAPI } from '../services/api'
import { EmptyCart } from '../components/EmptyState'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const ADMIN_WHATSAPP_NUMBER = '250788883986'

const CartDrawer = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState('pickup')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const closeCart = () => {
    setIsOpen(false)
    window.dispatchEvent(new Event('cart:close'))
  }

  // Auto-fill customer name and phone from user data when authenticated and drawer opens
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      // Use functional updates to check current state without needing it in dependencies
      setCustomerName(prev => {
        if (!prev.trim() && user.name) {
          return user.name
        }
        return prev
      })
      setCustomerPhone(prev => {
        if (!prev.trim() && user.phone) {
          return user.phone
        }
        return prev
      })
    }
  }, [isOpen, isAuthenticated, user])

  const deliveryFees = {
    pickup: 0,
    kigali: 2000,
    upcountry: 3500,
  }

  const deliveryFee = deliveryFees[deliveryOption] || 0
  const subtotal = getCartTotal()
  const grandTotal = subtotal + deliveryFee

  const handleCheckout = async () => {
    if (!customerPhone.trim()) {
      toast.warning('Please enter your WhatsApp number')
      return
    }

    // Validate delivery location if delivery is not pickup
    if (deliveryOption !== 'pickup' && !deliveryLocation.trim()) {
      toast.warning('Please enter your delivery location/address')
      return
    }

    setIsProcessing(true)
    try {
      // Save order to backend
      const orderData = {
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim(),
        channel: 'whatsapp',
        subtotal: subtotal,
        deliveryOption: deliveryOption,
        deliveryFee: deliveryFee,
        deliveryLocation: deliveryOption !== 'pickup' ? deliveryLocation.trim() : null,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      }
      
      // Fast WhatsApp checkout: save order in background and redirect immediately (no 10s timeout, no popup blocker).
      const checkoutCustomerName = customerName.trim() ? customerName.trim() : 'Guest'
      const checkoutDeliveryLabel =
        deliveryOption === 'pickup'
          ? 'Pickup'
          : deliveryOption === 'kigali'
            ? 'Kigali Delivery'
            : 'Upcountry Delivery'

      const checkoutMessageLines = [
        'NEW ORDER',
        '',
        `Customer: ${checkoutCustomerName}`,
        `Phone: ${customerPhone.trim()}`,
      ]

      if (deliveryOption !== 'pickup') {
        checkoutMessageLines.push(`Delivery: ${checkoutDeliveryLabel}`)
        if (deliveryLocation.trim()) {
          checkoutMessageLines.push(`Location: ${deliveryLocation.trim()}`)
        }
      }

      checkoutMessageLines.push('', 'ORDER ITEMS:')
      cart.forEach((item, index) => {
        checkoutMessageLines.push(
          `${index + 1}. ${item.name} - Qty: ${item.quantity} x ${item.price.toLocaleString()} RWF`
        )
      })
      checkoutMessageLines.push('', `TOTAL: ${grandTotal.toLocaleString()} RWF`)

      const checkoutText = checkoutMessageLines.join('\n')
      const whatsappCheckoutUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(checkoutText)}`

      // Fire-and-forget order save (works with Render cold starts).
      const beaconUrl = `${API_BASE_URL}/orders/beacon`
      const beaconBody = JSON.stringify(orderData)
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon(beaconUrl, beaconBody)
        } else {
          fetch(beaconUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: beaconBody,
            keepalive: true,
          }).catch(() => {})
        }
      } catch {
        // ignore
      }

      clearCart()
      closeCart()
      window.location.assign(whatsappCheckoutUrl)
      return

      const savedOrder = await ordersAPI.createOrder(orderData)
      console.log('✅ Order saved successfully:', savedOrder.data)

      // Single WhatsApp checkout action (avoid popup blockers + duplicate WhatsApp steps)
      const adminPhoneForCheckout = '250788883986' // Admin WhatsApp number
      const safeCustomerName = customerName.trim() ? customerName.trim() : 'Guest'
      const deliveryLabel =
        deliveryOption === 'pickup'
          ? 'Pickup'
          : deliveryOption === 'kigali'
            ? 'Kigali Delivery'
            : 'Upcountry Delivery'

      const messageLines = [
        'NEW ORDER',
        '',
        `Customer: ${safeCustomerName}`,
        `Phone: ${customerPhone.trim()}`,
      ]

      if (deliveryOption !== 'pickup') {
        messageLines.push(`Delivery: ${deliveryLabel}`)
        if (deliveryLocation.trim()) {
          messageLines.push(`Location: ${deliveryLocation.trim()}`)
        }
      }

      messageLines.push('', 'ORDER ITEMS:')
      cart.forEach((item, index) => {
        messageLines.push(
          `${index + 1}. ${item.name} - Qty: ${item.quantity} x ${item.price.toLocaleString()} RWF`
        )
      })
      messageLines.push('', `TOTAL: ${grandTotal.toLocaleString()} RWF`)

      const checkoutMessage = messageLines.join('\n')
      const checkoutWhatsAppUrl = `https://wa.me/${adminPhoneForCheckout}?text=${encodeURIComponent(checkoutMessage)}`

      clearCart()
      setIsOpen(false)
      window.location.assign(checkoutWhatsAppUrl)
      return

      // Get order number (monthly sequential) or fallback to ID
      const orderNumber = savedOrder.data?.order?.orderNumber || savedOrder.data?.order?.id || savedOrder.data?.id
      console.log('Order Number:', orderNumber)
      
      // Get admin WhatsApp URL from backend response
      let adminWhatsAppUrl = savedOrder.data?.adminWhatsAppUrl || savedOrder.data?.order?.adminWhatsAppUrl
      console.log('Backend WhatsApp URL:', adminWhatsAppUrl)
      
      // Generate WhatsApp URL - ALWAYS generate on frontend to ensure it works
      const adminPhone = '250788883986' // Admin WhatsApp number
      
      // Build message with product details (no URLs, includes category)
      let message = `╔═══════════════════════════════════╗\n`
      message += `║   *NEW ORDER #${orderNumber || 'N/A'}*   ║\n`
      message += `╚═══════════════════════════════════╝\n\n`
      
      message += `*CUSTOMER DETAILS*\n`
      message += `─────────────────────────────────────\n`
      if (customerName && customerName.trim()) {
        message += `► Name: ${customerName}\n`
      }
      message += `► Phone: ${customerPhone}\n`
      message += `► Channel: WHATSAPP\n\n`
      
      message += `*ORDER ITEMS*\n`
      message += `─────────────────────────────────────\n`
      
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity
        message += `\n${index + 1}. *${item.name}*\n`
        message += `   [Qty] ${item.quantity}\n`
        message += `   [Price] ${item.price.toLocaleString()} RWF\n`
        message += `   [Subtotal] ${itemTotal.toLocaleString()} RWF\n`
      })
      
      message += `\n─────────────────────────────────────\n`
      message += `*PAYMENT SUMMARY*\n`
      message += `─────────────────────────────────────\n`
      message += `Subtotal: ${subtotal.toLocaleString()} RWF\n`
      
      if (deliveryFee > 0) {
        const deliveryLabel = deliveryOption === 'pickup' ? 'Pickup (Free)' : 
                             deliveryOption === 'kigali' ? 'Kigali Delivery' : 
                             'Upcountry Delivery'
        message += `Delivery: ${deliveryLabel} (${deliveryFee.toLocaleString()} RWF)\n`
        if (deliveryLocation && deliveryLocation.trim()) {
          message += `Location: ${deliveryLocation}\n`
        }
      } else {
        message += `Delivery: Pickup (Free)\n`
      }
      
      message += `─────────────────────────────────────\n`
      message += `*TOTAL: ${grandTotal.toLocaleString()} RWF*\n`
      message += `─────────────────────────────────────\n\n`
      message += `Please process this order. Thank you!`
      
      // Use backend URL if available, otherwise use frontend generated
      const finalWhatsAppUrl = adminWhatsAppUrl && adminWhatsAppUrl.trim().length > 0 
        ? adminWhatsAppUrl 
        : `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`
      
      console.log('═══════════════════════════════════════════')
      console.log('📱 WHATSAPP URL GENERATED')
      console.log('═══════════════════════════════════════════')
      console.log('URL:', finalWhatsAppUrl)
      console.log('URL Length:', finalWhatsAppUrl.length)
      console.log('Message Length:', message.length)
      console.log('═══════════════════════════════════════════')
      
      // Store URL and show green button
      setWhatsappUrl(finalWhatsAppUrl)
      setShowWhatsAppButton(true)
      
      // Show success message
      toast.success('Order saved! Click the WhatsApp button below to send order details.')
      
      // Try to open WhatsApp automatically
      console.log('🚀 Attempting to open WhatsApp automatically...')
      try {
        const link = document.createElement('a')
        link.href = finalWhatsAppUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        console.log('✅ WhatsApp opened automatically')
        
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link)
          }
        }, 500)
      } catch (e) {
        console.log('⚠️ Auto-open failed, but green button is available:', e.message)
      }
      
      // Keep cart open so user can see and click the green button
    } catch (error) {
      console.error('❌❌❌ CHECKOUT FAILED ❌❌❌')
      console.error('Error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
      
      // Better error handling for network errors
      let errorMessage = 'Failed to process order'
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8080'
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused. The backend server may not be running'
      } else if (error.response?.status === 400) {
        // Handle validation errors
        if (error.response.data?.details) {
          const validationErrors = Object.values(error.response.data.details).join(', ')
          errorMessage = `Validation error: ${validationErrors}`
        } else {
          errorMessage = error.response.data?.error || 'Invalid order data. Please check your information'
        }
      } else if (error.response?.status === 500) {
        errorMessage = error.response.data?.error || 'Server error. Please try again later'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(`${errorMessage}. Please try again or contact support.`)
      
      // Even if order fails, try to generate WhatsApp URL as fallback
      try {
        const adminPhone = '250788883986'
        let message = `🧵 *NEW ORDER*\n\n`
        if (customerName) {
          message += `👤 *Customer:* ${customerName}\n`
        }
        message += `📱 *Phone:* ${customerPhone}\n\n`
        message += `🛍️ *ORDER ITEMS:*\n`
        cart.forEach((item, index) => {
          message += `${index + 1}. ${item.name} - Qty: ${item.quantity} × ${item.price.toLocaleString()} RWF\n`
        })
        message += `\n💵 *TOTAL: ${grandTotal.toLocaleString()} RWF*\n`
        
        const fallbackUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`
        console.log('WhatsApp fallback URL:', fallbackUrl)
      } catch (e) {
        console.error('Failed to generate fallback URL:', e)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const handleCartOpen = () => {
      console.log('Cart open event received')
      setIsOpen(true)
    }
    window.addEventListener('cart:open', handleCartOpen)
    return () => window.removeEventListener('cart:open', handleCartOpen)
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />
      <div
        className="fixed right-0 top-0 h-[100dvh] w-full sm:max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-hidden transform transition-transform"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 flex items-center justify-between p-3 sm:p-6 border-b-2 border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3.5 bg-gradient-accent rounded-xl shadow-accent">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                {cart.length > 0 && (
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors touch-target"
              aria-label="Close cart"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {cart.length === 0 ? (
              <EmptyCart onClose={closeCart} />
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {cart.map((item) => {
                  const itemTotal = item.price * item.quantity
                  return (
                    <div
                      key={item.id}
                      className="group flex gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-accent/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.src = '/placeholder.png'
                          }}
                        />
                        <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {item.price.toLocaleString()} RWF each
                        </p>
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                          <div className="flex items-center justify-between sm:justify-start gap-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 w-full sm:w-auto">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-3 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-50 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <span className="px-4 sm:px-4 py-2 text-base sm:text-sm font-medium text-gray-900 dark:text-white min-w-[2.5rem] sm:min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-3 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-r-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {(itemTotal).toLocaleString()} RWF
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-3 sm:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg transition-colors flex-shrink-0 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 p-3 sm:p-6 shadow-2xl max-h-[70dvh] flex flex-col pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
              <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 sm:space-y-5">
                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {subtotal.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Delivery Option
                    </label>
                    <select
                      value={deliveryOption}
                      onChange={(e) => {
                        setDeliveryOption(e.target.value)
                        // Clear location when switching to pickup
                        if (e.target.value === 'pickup') {
                          setDeliveryLocation('')
                        }
                      }}
                      className="w-full input-field text-base sm:text-sm"
                      disabled={isProcessing}
                    >
                      <option value="pickup">Pick up (Free)</option>
                      <option value="kigali">Kigali Delivery (2,000 RWF)</option>
                      <option value="upcountry">Upcountry Delivery (3,500 RWF)</option>
                    </select>
                  </div>
                  {deliveryOption !== 'pickup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Delivery Location/Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Enter your full delivery address"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="w-full input-field text-base sm:text-sm resize-none"
                        rows="2"
                        required={deliveryOption !== 'pickup'}
                        disabled={isProcessing}
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                    <span className="font-black text-lg sm:text-xl text-gray-900 dark:text-white">Total</span>
                    <span className="font-black text-xl sm:text-2xl bg-gradient-to-r from-accent to-accent-600 bg-clip-text text-transparent">
                      {grandTotal.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Name <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-field text-base sm:text-sm"
                      disabled={isProcessing}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g., +250 788 123 456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="input-field text-base sm:text-sm"
                      required
                      disabled={isProcessing}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 sm:pt-5">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={clearCart}
                    className="btn-outline w-full sm:flex-1 text-base sm:text-base py-3 sm:py-3 min-h-[48px] touch-manipulation"
                    disabled={isProcessing}
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || !customerPhone.trim() || (deliveryOption !== 'pickup' && !deliveryLocation.trim())}
                    className="btn-primary w-full sm:flex-1 text-base sm:text-base py-3 sm:py-3 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Checkout via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* WhatsApp Button - Shows after order is placed */}
              {false && (
                <div className="mt-4 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-400 dark:border-green-600 shadow-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-1.5 bg-green-500 rounded-full">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                        ✅ Order saved successfully!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Click below to open WhatsApp and send your order details
                      </p>
                    </div>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-3 px-4 rounded-lg text-center transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    onClick={() => {
                      console.log('📱 Opening WhatsApp via green button')
                      setShowWhatsAppButton(false)
                      // Clear cart and close after clicking
                      setTimeout(() => {
                      clearCart()
                      setIsOpen(false)
                      setCustomerName('')
                      setCustomerPhone('')
                      setDeliveryLocation('')
                      setDeliveryOption('pickup')
                      setWhatsappUrl(null)
                      }, 1000)
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Open WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDrawer

