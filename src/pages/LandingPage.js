import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../utils/auth';
import {  
  Zap, 
  Shield, 
  Users,  
  Star, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  Clock,
  Menu,
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Logo from '../assets/logo-icon1.png';

const NovaTechLanding = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const networks = [
    { name: 'MTN', color: 'from-yellow-400 to-yellow-600', logo: '📶' },
    { name: 'Airtel Tigo', color: 'from-red-500 to-pink-600', logo: '📡' },
    { name: 'Telecel', color: 'from-blue-500 to-indigo-600', logo: '📞' }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Delivery",
      description: "Get your data bundles delivered instantly to your phone within seconds of purchase."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Best Prices",
      description: "Enjoy the most competitive rates in Ghana. Save up to 30% compared to direct purchases."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Secure",
      description: "Your transactions are protected with bank-level security and encryption."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support to assist you whenever you need help."
    }
  ];

  const plans = [
    {
      network: 'MTN',
      data: '1GB',
      validity: 'Unexpiry',
      popular: false
    },
    {
      network: 'Airtel Tigo',
      data: '2GB',
      validity: 'Unexpiry',
      popular: true
    },
    {
      network: 'Telecel',
      data: '5GB',
      validity: 'Unexpiry',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Kwame Asante",
      location: "Accra",
      text: "NovaTech has been a game-changer for me. I save so much money on data bundles and the service is incredibly fast!",
      rating: 5
    },
    {
      name: "Ama Serwaa",
      location: "Kumasi", 
      text: "The best data bundle service in Ghana! Instant delivery and amazing prices. Highly recommended!",
      rating: 5
    },
    {
      name: "Kofi Mensah",
      location: "Tema",
      text: "I've been using NovaTech for 6 months now. Never had any issues and their support team is excellent.",
      rating: 5
    }
  ];

  const handleGetStarted = () => {
    // Clear any existing auth data to prevent redirect loops
    clearAuthData();
    // Navigate to login page using React Router
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <img src={Logo} alt="NovaTech" className="w-6 h-6 rounded" />
              </div>
              <a href="/" rel="noreferrer">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  NovaTech
                </span>
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="hover:text-emerald-400 transition-colors">Home</a>
              <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
              <a href="#services" className="hover:text-emerald-400 transition-colors">Services</a>
              <a href="/shop" className="relative px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white font-semibold animate-pulse hover:animate-none hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300">
                <span className="relative z-10">Shop</span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-ping opacity-30"></span>
              </a>
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#home" className="block py-2 hover:text-emerald-400">Home</a>
              <a href="#about" className="block py-2 hover:text-emerald-400">About</a>
              <a href="#services" className="block py-2 hover:text-emerald-400">Services</a>
              <a href="/shop" className="block py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-semibold text-center animate-pulse">
                Shop
              </a>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 rounded-full mt-4"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-cyan-900/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.15),transparent_50%)]"></div>
        </div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Geometric Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-3xl transform rotate-12 animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-full animate-bounce" style={{ animationDuration: "4s" }}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl transform -rotate-12 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 rounded-full animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.5s" }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8">

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black leading-tight">
                  <span className="block text-white mb-2">Affordable</span>
                  <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Data Bundles
                  </span>
                  <span className="block text-xl text-emerald-200 font-medium mt-4">
                    For Every Ghanaian
                  </span>
                </h1>
              </div>
              
              {/* Description */}
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Experience lightning-fast internet with our premium data bundles. 
                <span className="text-emerald-300 font-semibold"> Instant delivery, unbeatable prices, </span>
                and support for all major networks in Ghana.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">10K+</div>
                  <div className="text-sm text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-400">99.9%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/login" 
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-lg font-bold text-white shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                rel="noreferrer">
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                
                <a href="/Shop" className="px-8 py-4 border-2 border-emerald-400/50 rounded-2xl text-lg font-semibold text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all duration-300">
                  View Packages
                </a>
              </div>
            </div>

            {/* Right Column - Visual Elements */}
            <div className="relative flex items-center justify-center">
              {/* Central Logo with Enhanced Effects */}
              <div className="relative">
                {/* Outer Glow Rings */}
                <div className="absolute inset-0 -m-20">
                  <div className="w-full h-full rounded-full border border-emerald-400/20 animate-ping" style={{ animationDuration: "3s" }}></div>
                </div>
                <div className="absolute inset-0 -m-16">
                  <div className="w-full h-full rounded-full border border-teal-400/30 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }}></div>
                </div>
                <div className="absolute inset-0 -m-12">
                  <div className="w-full h-full rounded-full border border-cyan-400/40 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "1s" }}></div>
                </div>
                
                {/* Main Logo Container */}
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
                  
                  {/* Logo */}
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-full border-4 border-emerald-400/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                    <img
                      src={Logo}
                      alt="NovaTech Logo"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-xl"
                    />
                  </div>
                  
                  {/* Rotating Border */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-spin" style={{ 
                    animationDuration: "10s",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "xor"
                  }}></div>
                </div>
              </div>

              {/* Rotating Network Icons Container */}
              <div 
                className="absolute inset-0 flex items-center justify-center orbit-container"
              >
                {networks.map((network, index) => {
                  const angle = (index * 120) - 90; // 120 degrees apart, starting from top
                  const radius = 180;
                  
                  return (
                    <div
                      key={network.name}
                      className={`absolute w-16 h-16 bg-gradient-to-r ${network.color} rounded-2xl flex items-center justify-center shadow-lg hover:scale-125 transition-transform duration-300 orbit-icon`}
                      style={{
                        '--start-angle': `${angle}deg`,
                        '--radius': `${radius}px`
                      }}
                    >
                      <span className="text-2xl orbit-icon-content">{network.logo}</span>
                    </div>
                  );
                })}
              </div>

              {/* CSS for orbit animations */}
              <style>{`
                .orbit-container {
                  animation: orbit-spin 12s linear infinite;
                }
                .orbit-icon {
                  transform: rotate(var(--start-angle)) translateX(var(--radius));
                }
                .orbit-icon-content {
                  display: block;
                  animation: counter-orbit 12s linear infinite;
                }
                @keyframes orbit-spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes counter-orbit {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(-360deg); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Why Choose NovaTech?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're revolutionizing how Ghanaians access affordable data bundles with cutting-edge technology and unmatched service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-emerald-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-teal-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Data Packages
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose from our wide range of data packages for all major networks in Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 hover:transform hover:scale-105 hover:rotate-1 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-400/60 shadow-2xl shadow-emerald-500/30' 
                    : 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-600/50 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/20'
                }`}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}
                
                <div className="relative text-center">
                  {/* Network Icon */}
                  <div className="mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${networks.find(n => n.name === plan.network)?.color || 'from-emerald-500 to-teal-600'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{networks.find(n => n.name === plan.network)?.logo || '📶'}</span>
                    </div>
                  </div>
                  
                  {/* Network Name */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-300 transition-colors">{plan.network}</h3>
                  
                  {/* Data Amount */}
                  <div className="mb-4">
                    <div className="text-5xl font-black text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
                      {plan.data}
                    </div>
                    <div className="text-emerald-300 text-lg font-medium">Data Bundle</div>
                  </div>
                  
                  {/* Validity */}
                  <div className="mb-8">
                    <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                      <Clock className="w-4 h-4 mr-2 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">{plan.validity}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="mb-8 space-y-3">
                    <div className="flex items-center justify-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                      <span>Instant Delivery</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                      <span>24/7 Support</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                      <span>Secure Payment</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button 
                    onClick={handleGetStarted}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform group-hover:scale-105 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/30'
                        : 'border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-300 hover:text-white'
                    }`}
                  >
                    Get This Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              About NovaTech
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your trusted partner for affordable data bundles across Ghana
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-gray-300 leading-relaxed">
                  At NovaTech, we're committed to making internet connectivity affordable and accessible 
                  for every Ghanaian. We bridge the gap between expensive data costs and the need for 
                  reliable internet access by providing competitively priced data bundles for all major networks.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Why Choose Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">Instant Delivery</h4>
                      <p className="text-gray-400 text-sm">Get your data bundles delivered to your phone within seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">Secure & Reliable</h4>
                      <p className="text-gray-400 text-sm">Bank-level security with 99.9% uptime guarantee</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-300 mb-1">24/7 Customer Support</h4>
                      <p className="text-gray-400 text-sm">Round-the-clock assistance whenever you need help</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Our Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
                      10K+
                    </div>
                    <div className="text-gray-400 text-sm">Happy Customers</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
                      50K+
                    </div>
                    <div className="text-gray-400 text-sm">Data Bundles Sold</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
                      99.9%
                    </div>
                    <div className="text-gray-400 text-sm">Success Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text mb-2">
                      24/7
                    </div>
                    <div className="text-gray-400 text-sm">Support Available</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-3xl p-8 border border-emerald-500/30">
                <h3 className="text-xl font-bold text-white mb-4">Our Networks</h3>
                <p className="text-gray-300 mb-6 text-sm">
                  We support all major telecommunications networks in Ghana
                </p>
                <div className="flex justify-center space-x-4">
                  {networks.map((network, index) => (
                    <div 
                      key={network.name}
                      className={`p-3 rounded-xl bg-gradient-to-r ${network.color} shadow-lg`}
                    >
                      <div className="text-lg">{network.logo}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                "{testimonials[activeTestimonial].text}"
              </p>
              
              <div>
                <div className="font-semibold text-white">{testimonials[activeTestimonial].name}</div>
                <div className="text-gray-400">{testimonials[activeTestimonial].location}</div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
            Ready to Start Saving?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers and start enjoying affordable data bundles today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all transform hover:scale-105"
            >
              Get Started Now
            </button>
            <a
                href="https://wa.me/233544060817"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 border-2 border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all"
            >
                Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <img src={Logo} alt="NovaTech" className="w-6 h-6 rounded" />
                </div>
                <a href="/" rel="noreferrer">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  NovaTech
                </span>
                </a>
              </div>
              <p className="text-gray-400">
                Ghana's premier data bundle provider, delivering affordable connectivity to everyone.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>MTN Data Bundles</li>
                <li>Airtel Tigo Data</li>
                <li>Telecel Bundles</li>
                <li>Bulk Purchases</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Support</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+233544060817</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>novamaxgh@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NovaTech Ghana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NovaTechLanding;
