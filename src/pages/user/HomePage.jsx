import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import productsAPI from '../../api/products.api';
import ProductList from '../../components/user/ProductList';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const HomePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeatured(8),
  });

  const featuredProducts = data?.data?.products || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero-gradient text-white py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
          <div className="container-custom relative z-10">
            <div className="text-center animate-fade-in">
              <h1 className="hero-text mb-6">
                Welcome to ShopSecure
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
                Your trusted e-commerce platform with enterprise-grade security
                and exceptional shopping experience
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/products"
                  className="bg-white text-purple-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/50 transform hover:scale-105 inline-block"
                >
                  Shop Now 🛍️
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-700 transition-all duration-300 inline-block"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </section>

        {/* Features Section */}
        <section className="section bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose Us?
            </h2>
            <p className="text-center text-gray-600 mb-16 text-lg">
              Experience the difference with our premium features
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-hover text-center group animate-fade-in">
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🔒</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Secure Payments
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  All transactions are secured with Stripe and enterprise-grade encryption. Your data is always protected.
                </p>
              </div>
              <div className="card-hover text-center group animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🚚</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Fast Shipping
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Free shipping on orders over $100 with real-time tracking. Get your items delivered fast.
                </p>
              </div>
              <div className="card-hover text-center group animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">💯</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Quality Guaranteed
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  30-day money-back guarantee on all products. Shop with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-600">Discover our handpicked selection</p>
              </div>
              <Link
                to="/products"
                className="btn-primary mt-4 md:mt-0"
              >
                View All Products →
              </Link>
            </div>
            <ProductList
              products={featuredProducts}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </section>

        {/* Security Badge */}
        <section className="section bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container-custom text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Built with Security First 🔐</h3>
              <p className="text-xl mb-10 text-white/90 leading-relaxed">
                This platform implements defense-in-depth security practices including JWT authentication,
                2FA, rate limiting, CSRF protection, input sanitization, and comprehensive audit logging.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="font-semibold">PCI Compliant</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="font-semibold">OWASP Secure</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="font-semibold">HTTPS Encrypted</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="text-3xl mb-2">✓</div>
                  <div className="font-semibold">GDPR Ready</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
