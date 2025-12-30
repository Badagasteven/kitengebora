import { Heart, Users, Award, ShoppingBag } from 'lucide-react'

const About = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            About Kitenge Bora
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Your trusted source for authentic African fabrics and outfits
          </p>
        </div>

        {/* Our Story Section - Featured First */}
        <div className="card p-6 sm:p-8 lg:p-10 mb-12 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Our Story
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center mb-6">
            <div className="prose prose-lg dark:prose-invert max-w-none order-2 md:order-1">
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-base sm:text-lg leading-relaxed">
                Founded with a vision to make authentic African fashion accessible to everyone,
                Kitenge Bora has grown into a trusted name in the industry. We work directly with
                skilled artisans and manufacturers to ensure every product meets our high standards of
                quality and authenticity.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-base sm:text-lg leading-relaxed">
                Kitenge Bora is a premier destination for curated African fabrics and outfits. We are
                passionate about bringing you the finest selection of traditional and contemporary
                African fashion.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                Our mission is to celebrate African culture through fashion, supporting local artisans
                and providing our customers with authentic, high-quality products that tell a story
                of heritage, craftsmanship, and style.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg order-1 md:order-2">
              <img
                src="/kitenge-fabrics-display.jpeg"
                alt="Colorful display of Kitenge fabrics arranged on shelves showcasing vibrant African patterns"
                className="w-full h-48 sm:h-64 md:h-80 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/placeholder.png'
                  e.target.alt = 'Kitenge fabrics display'
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="card p-6">
              <feature.icon className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default About

