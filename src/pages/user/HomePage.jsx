import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowRight,
  FiCheck,
  FiShield,
  FiTruck,
  FiAward,
  FiLock,
} from "react-icons/fi";
import productsAPI from "../../api/products.api";
import ProductList from "../../components/user/ProductList";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import useAuthStore from "../../store/authStore";
import heroBg from "../../assets/hero-bg.png";

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsAPI.getFeatured(8),
  });

  const featuredProducts = data?.data?.products || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="grow">
        {/* Hero Section */}
        <section className="relative py-28 lg:py-36 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="ShopSecure Hero Background"
              className="w-full h-full object-cover"
            />
            {/* Improved overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-r from-slate-900/95 via-slate-900/80 to-slate-900/30"></div>
          </div>

          <div className="container-custom relative z-10">
            <div className="max-w-4xl animate-fade-in text-white">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 font-medium text-sm mb-8 backdrop-blur-sm">
                <FiShield className="w-4 h-4" /> Next Generation E-Commerce
                Security
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
                Shop with{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-200">
                  Confidence
                </span>{" "}
                <br />
                and Absolute Security
              </h1>

              <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl font-light">
                Experience a new standard of online shopping where
                enterprise-grade security meets premium user experience.
                Protection built into every pixel.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  to="/products"
                  className="btn-primary py-4 px-8 text-lg shadow-xl shadow-blue-900/20 hover:shadow-blue-600/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  Start Shopping <FiArrowRight className="w-5 h-5" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="flex items-center justify-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-emerald-400" /> Secure
                  Payments
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-emerald-400" /> 24/7 Support
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-emerald-400" /> Buyer
                  Protection
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section bg-white border-b border-gray-100">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="heading-2 mb-4">Why Choose ShopSecure?</h2>
              <p className="text-lg text-gray-600">
                We combine top-tier security with an exceptional shopping
                experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-hover group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <FiLock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="heading-3 text-xl mb-3">Enterprise Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  End-to-end encryption, 2FA, and real-time threat monitoring
                  keep your data safe at all times.
                </p>
              </div>

              <div
                className="card-hover group"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                  <FiTruck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="heading-3 text-xl mb-3">Fast Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Global shipping network ensures your products arrive quickly
                  and safely at your doorstep.
                </p>
              </div>

              <div
                className="card-hover group"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                  <FiAward className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="heading-3 text-xl mb-3">Quality Guarantee</h3>
                <p className="text-gray-600 leading-relaxed">
                  Verified authentic products with a 30-day money-back guarantee
                  for peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section bg-slate-50">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="heading-2 mb-2">Featured Products</h2>
                <p className="text-gray-600">
                  Discover our editors' top picks this week
                </p>
              </div>
              <Link to="/products" className="btn-outline mt-4 md:mt-0 gap-2">
                View All Products <FiArrowRight />
              </Link>
            </div>

            <ProductList
              products={featuredProducts}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </section>

        {/* Trust/Security Section */}
        <section className="section bg-slate-900 text-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">
                  Uncompromising Security Standards
                </h3>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                  We take your privacy seriously. Our platform is built on
                  modern security architecture to ensure every transaction is
                  protected.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <FiShield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Bank-grade Encryption</h4>
                      <p className="text-sm text-slate-400">
                        All data is encrypted in transit and at rest
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <FiLock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Secure Authentication</h4>
                      <p className="text-sm text-slate-400">
                        Multi-factor authentication support
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4">
                      <div className="text-4xl font-bold text-blue-400 mb-2">
                        99.9%
                      </div>
                      <div className="text-sm text-slate-400">Uptime</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-bold text-emerald-400 mb-2">
                        0
                      </div>
                      <div className="text-sm text-slate-400">
                        Data Breaches
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-bold text-purple-400 mb-2">
                        24/7
                      </div>
                      <div className="text-sm text-slate-400">Monitoring</div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl font-bold text-amber-400 mb-2">
                        100%
                      </div>
                      <div className="text-sm text-slate-400">Secure</div>
                    </div>
                  </div>
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
