import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setStatus('loading')
    
    try {
      // Save to localStorage for now (can be connected to backend later)
      const subscribers = JSON.parse(localStorage.getItem('kb_newsletter_subscribers') || '[]')
      
      if (subscribers.includes(email)) {
        setStatus('error')
        toast.warning('You are already subscribed!')
        return
      }

      subscribers.push(email)
      localStorage.setItem('kb_newsletter_subscribers', JSON.stringify(subscribers))
      
      setStatus('success')
      toast.success('Successfully subscribed to our newsletter!')
      setEmail('')
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
      setStatus('error')
      toast.error('Failed to subscribe. Please try again.')
    }
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-yellow-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8 md:p-12 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-accent/10 rounded-full mb-4">
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Stay Updated
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and special promotions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-field pl-12 pr-4 w-full"
                  required
                  disabled={status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="btn-primary whitespace-nowrap px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Subscribing...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

            <p className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Newsletter

