import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import BackToTop from './BackToTop'
import ErrorBoundary from './ErrorBoundary'
import MobileBottomNav from './MobileBottomNav'

const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      <main className="flex-grow pb-24 lg:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
      <ErrorBoundary>
        <CartDrawer />
      </ErrorBoundary>
      <ErrorBoundary>
        <MobileBottomNav />
      </ErrorBoundary>
      <BackToTop />
    </div>
  )
}

export default Layout

