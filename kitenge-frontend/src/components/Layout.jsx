import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import ErrorBoundary from './ErrorBoundary'

const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      <main className="flex-grow">
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
    </div>
  )
}

export default Layout

