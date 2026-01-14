import { Link } from 'react-router-dom'
import { Package, ShoppingBag, DollarSign, TrendingUp, Users, Calendar, BarChart3, User, Plus, ArrowRight, Activity, Box, ShoppingCart, Wallet, UserCircle, Calendar as CalendarIcon, TrendingDown, LineChart, Settings, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'
import { statsAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    revenueByMonth: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await statsAPI.getBusinessStats()
      const data = response.data
      setStats({
        totalProducts: data.totalProducts || 0,
        activeProducts: data.activeProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        weeklyRevenue: data.weeklyRevenue || 0,
        todayRevenue: data.todayRevenue || 0,
        totalCustomers: data.totalCustomers || 0,
        revenueByMonth: data.revenueByMonth || {},
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Box,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      iconBg: 'bg-blue-500',
      link: '/admin/products',
      description: `${stats.activeProducts} active`,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      iconBg: 'bg-purple-500',
      link: '/admin/orders',
      description: 'All time',
    },
    {
      title: 'Total Revenue',
      value: `${stats.totalRevenue.toLocaleString()} RWF`,
      icon: Wallet,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      iconBg: 'bg-orange-500',
      link: '/admin/analytics',
      description: 'Lifetime',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UserCircle,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      iconBg: 'bg-green-500',
      link: '/admin/customers',
      description: 'Registered users',
    },
    {
      title: 'Monthly Revenue',
      value: `${stats.monthlyRevenue.toLocaleString()} RWF`,
      icon: CalendarIcon,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      iconBg: 'bg-indigo-500',
      link: '/admin/analytics',
      description: 'This month',
    },
    {
      title: 'Weekly Revenue',
      value: `${stats.weeklyRevenue.toLocaleString()} RWF`,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
      iconBg: 'bg-pink-500',
      link: '/admin/analytics',
      description: 'This week',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1">
        <div className="p-4 pt-20 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
               <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg">
                 Welcome back! Here's an overview of your store's performance.
               </p>
               <Link
                 to="/"
                 className="sm:hidden inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-semibold shadow-sm active:scale-[0.98] transition"
               >
                 <ShoppingBag className="w-4 h-4" />
                 Back to Store
               </Link>
             </div>
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white">
               <LineChart className="w-5 h-5" />
               <span className="font-semibold">Live Data</span>
            </div>
          </div>
        </div>

        {/* Business Summary */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Business Overview
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-0 sm:ml-16">
            Key metrics and performance indicators
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`}></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[11px] sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </p>
                  {stat.description && (
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${stat.iconBg}`}></div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {stat.description}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`p-2.5 sm:p-3 bg-gradient-to-br ${stat.gradient} rounded-xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <stat.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Revenue Chart */}
        {Object.keys(stats.revenueByMonth).length > 0 && (
          <div className="card p-4 sm:p-8 mb-6 sm:mb-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Revenue Trend
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last 6 months performance
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.revenueByMonth).map(([month, revenue], index) => {
                const maxRevenue = Math.max(...Object.values(stats.revenueByMonth))
                const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {month}
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {revenue.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-0 sm:ml-16">
            Navigate to key management areas
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            to="/admin/products"
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                Products
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Manage your catalog
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                Orders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Track & fulfill orders
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                <Activity className="w-4 h-4" />
                <span>View Orders</span>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                View insights
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>View Stats</span>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                Settings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                Account & preferences
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </div>
            </div>
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

