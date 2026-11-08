import React from "react";
import { 
  PiggyBank, 
  Users, 
  Shield, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle,
  Lock,
  UserCheck,
  Building,
  BarChart3,
  CreditCard,
  Smartphone,
  HeartHandshake
} from "lucide-react";

const PigmyLandingPage = () => {
  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PigmyXpress
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                How It Works
              </a>
            
            </div>

           
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-8">
              <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">
                Trusted by 10,000+ users nationwide
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Modern{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pigmy
              </span>
              <br />
              Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing daily collection systems with cutting-edge technology. 
              Streamline operations, enhance transparency, and empower your financial ecosystem.
            </p>
            
            {/* Login Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
              {/* Admin Login */}
              <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:border-blue-200 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Admin Portal
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Complete control and oversight of pigmy operations. Manage customers, 
                  collectors, and monitor real-time performance metrics.
                </p>
                <div className="space-y-3">
                  <a
                    href="/admin/login"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group/btn shadow-lg hover:shadow-xl"
                  >
                    Admin Login 
                    <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Collector Login */}
              <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-green-100 hover:border-green-200 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <UserCheck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Collector App
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Streamlined daily collection management. Record transactions, 
                  update customer records, and track collection progress on-the-go.
                </p>
                <div className="space-y-3">
                  <a
                    href="/collector/login"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group/btn shadow-lg hover:shadow-xl"
                  >
                    Collector Login
                    <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Customer Login */}
              <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-200 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Customer Portal
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access your pigmy account 24/7. View statements, check balances, 
                  track savings progress, and manage your financial portfolio.
                </p>
                <div className="space-y-3">
                  <a
                    href="/auth"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group/btn shadow-lg hover:shadow-xl"
                  >
                    Customer Login
                    <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-blue-600">PigmyPro</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technology to provide seamless experience for all stakeholders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Lock,
                title: "Bank-Grade Security",
                description: "Military-grade encryption and secure authentication protocols",
                color: "blue"
              },
              {
                icon: TrendingUp,
                title: "Real-time Analytics",
                description: "Live dashboards with performance metrics and insights",
                color: "green"
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                description: "Responsive design that works perfectly on all devices",
                color: "purple"
              },
              {
                icon: CreditCard,
                title: "Digital Payments",
                description: "Support for multiple payment methods and instant processing",
                color: "orange"
              },
              {
                icon: Building,
                title: "Multi-branch Support",
                description: "Manage multiple branches and locations seamlessly",
                color: "indigo"
              },
              {
                icon: HeartHandshake,
                title: "Customer First",
                description: "Designed with customer experience as top priority",
                color: "pink"
              },
              {
                icon: BarChart3,
                title: "Smart Reports",
                description: "Automated reporting with customizable dashboards",
                color: "teal"
              },
              {
                icon: CheckCircle,
                title: "99.9% Uptime",
                description: "Reliable cloud infrastructure with minimal downtime",
                color: "emerald"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: "from-blue-500 to-blue-600",
                green: "from-green-500 to-green-600",
                purple: "from-purple-500 to-purple-600",
                orange: "from-orange-500 to-orange-600",
                indigo: "from-indigo-500 to-indigo-600",
                pink: "from-pink-500 to-pink-600",
                teal: "from-teal-500 to-teal-600",
                emerald: "from-emerald-500 to-emerald-600"
              };

              return (
                <div key={index} className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[feature.color]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600">
              Simple, efficient, and transparent process for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Admin Setup & Management",
                description: "Admins register customers and collectors, set up accounts, and monitor overall operations through the comprehensive dashboard.",
                icon: Shield
              },
              {
                step: "2",
                title: "Daily Collection Process",
                description: "Collectors visit customers, record transactions in real-time, and sync data instantly with the central system.",
                icon: UserCheck
              },
              {
                step: "3",
                title: "Customer Self-Service",
                description: "Customers access their accounts anytime to check balances, view statements, and track their savings journey.",
                icon: Users
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow h-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Login CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Pigmy Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust PigmyPro for their daily collection management
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/admin/login"
              className="bg-white text-blue-600 hover:bg-blue-50 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Admin Login
            </a>
            <a
              href="/collector/login"
              className="bg-green-500 text-white hover:bg-green-600 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Collector Login
            </a>
            <a
              href="/auth"
              className="bg-purple-500 text-white hover:bg-purple-600 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Customer Login
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">PigmyPro</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Modern digital solution revolutionizing pigmy collection management 
                and financial services with cutting-edge technology.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Quick Access</h4>
              <ul className="space-y-3">
                <li><a href="/admin/login" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" /> Admin Portal
                </a></li>
                <li><a href="/collector/login" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" /> Collector App
                </a></li>
                <li><a href="/auth" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" /> Customer Portal
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Contact Info</h4>
              <ul className="space-y-3 text-gray-400">
                <li>📧 support@pigmypro.com</li>
                <li>📞 +1 (555) 123-PIGMY</li>
                <li>🏢 123 Finance District, Banking City, BC 10001</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PigmyPro. All rights reserved. Built with ❤️ for the financial community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PigmyLandingPage;