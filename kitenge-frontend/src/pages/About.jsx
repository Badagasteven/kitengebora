import { Heart, Users, Award, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

const About = () => {
  const [imageError, setImageError] = useState(false)
  const features = [
    {
      icon: ShoppingBag,
      title: 'Curated Collection',
      description: 'Carefully selected African fabrics and outfits',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Premium quality materials and craftsmanship',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Supporting local artisans and communities',
    },
    {
      icon: Heart,
      title: 'Passion for Fashion',
      description: 'Celebrating African culture and style',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block mb-4">
            <span className="text-accent font-bold text-sm uppercase tracking-widest">About Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            About Kitenge Bora
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-3xl mx-auto">
            Your trusted source for authentic African fabrics and outfits
          </p>
        </div>

        {/* Our Story Section - Featured First */}
        <div className="card p-8 sm:p-10 lg:p-12 mb-12 bg-gradient-to-br from-white via-orange-50/50 to-white dark:from-gray-800 dark:via-orange-900/30 dark:to-gray-800 border-2 border-orange-200 dark:border-orange-700 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-accent font-bold text-sm uppercase tracking-widest">Our Journey</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              Our Story
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-6">
            <div className="order-2 md:order-1 space-y-6">
              <p className="text-gray-800 dark:text-gray-200 mb-5 text-lg sm:text-xl leading-relaxed font-medium">
                Founded with a vision to make authentic African fashion accessible to everyone,
                Kitenge Bora has grown into a trusted name in the industry. We work directly with
                skilled artisans and manufacturers to ensure every product meets our high standards of
                quality and authenticity.
              </p>
              <p className="text-gray-800 dark:text-gray-200 mb-5 text-lg sm:text-xl leading-relaxed font-medium">
                Kitenge Bora is a premier destination for curated African fabrics and outfits. We are
                passionate about bringing you the finest selection of traditional and contemporary
                African fashion.
              </p>
              <p className="text-gray-800 dark:text-gray-200 text-lg sm:text-xl leading-relaxed font-medium">
                Our mission is to celebrate African culture through fashion, supporting local artisans
                and providing our customers with authentic, high-quality products that tell a story
                of heritage, craftsmanship, and style.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl hover:shadow-accent-lg transition-all duration-500 order-1 md:order-2 group relative bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 min-h-[224px] sm:min-h-[288px] md:min-h-[384px]">
              {!imageError ? (
                <img
                  src="/kitenge-fabrics-display.jpeg"
                  alt="Colorful display of Kitenge fabrics arranged on shelves showcasing vibrant African patterns"
                  className="w-full h-56 sm:h-72 md:h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="eager"
                  onError={() => {
                    console.error('❌ Image failed to load:', '/kitenge-fabrics-display.jpeg')
                    setImageError(true)
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', '/kitenge-fabrics-display.jpeg')
                  }}
                />
              ) : (
                <div className="w-full h-56 sm:h-72 md:h-96 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                  <div className="text-center p-8">
                    <div className="text-5xl sm:text-6xl mb-4">🧵</div>
                    <div className="text-2xl sm:text-3xl font-black mb-2">Kitenge Bora</div>
                    <div className="text-base sm:text-lg font-medium opacity-90">African Fabrics & Outfits</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="card p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 rounded-xl w-fit mb-4">
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default About

