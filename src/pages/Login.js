import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Sparkles, CheckCircle, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnnouncementBanner from "./AnnouncementBanner";
import { motion } from "framer-motion";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import Logo from "../assets/logo-icon1.png";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and redirect to appropriate dashboard
    const token = localStorage.getItem("token");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("role");
    
    // Only redirect if ALL authentication data is present and valid
    if (token && isLoggedIn === 'true' && role && token.trim() !== '' && role.trim() !== '') {
      // Navigate to appropriate dashboard based on role
      const roleRoutes = {
        'ADMIN': '/admin',
        'USER': '/user',
        'PREMIUM': '/premium',
        'SUPER': '/superagent',
        'NORMAL': '/normalagent',
        'Other': '/other'
      };
      
      const route = roleRoutes[role];
      if (route) {
        navigate(route, { replace: true });
      }
    } else if (token || isLoggedIn || role) {
      // Clear corrupted/incomplete auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (res.data?.user?.isLoggedIn === false) {
        toast.warn(
          "This account is currently in use. Please log out from other devices."
        );
        setLoading(false);
        return;
      }

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("isLoggedIn", true);

      setTimeout(() => {
        setLoading(false);
        
        // Navigate to appropriate dashboard based on role
        const roleRoutes = {
          'ADMIN': '/admin',
          'USER': '/user',
          'PREMIUM': '/premium',
          'SUPER': '/superagent',
          'NORMAL': '/normalagent',
          'Other': '/other'
        };
        
        const route = roleRoutes[user.role];
        if (route) {
          navigate(route, { replace: true });
        }
      }, 500);
    } catch (err) {
      setLoading(false);

      if (err.response?.status === 403) {
        toast.warn(
          "This account is currently in use. Please log out from other devices."
        );
      } else {
        //toast.error("Invalid email or password");
      }

      setError("Login failed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
      <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 overflow-hidden py-20">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-[conic-gradient(from_45deg_at_50%_50%,rgba(16,185,129,0.15),rgba(20,184,166,0.15),rgba(6,182,212,0.15),rgba(59,130,246,0.12),rgba(147,51,234,0.12),rgba(236,72,153,0.15),rgba(16,185,129,0.15))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(34,197,94,0.2),transparent_50%)]" />
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-2xl transform rotate-12 animate-pulse" />
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-cyan-400/25 to-blue-400/25 rounded-full blur-sm animate-bounce" style={{ animationDuration: "3s" }} />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg transform -rotate-12 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Dynamic Announcement Banner */}
      <AnnouncementBanner />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-sm md:max-w-lg mx-4 z-10"
      >
        {/* Card with enhanced glassmorphism */}
        <div className="relative p-10 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20">
          {/* Gradient border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-60 animate-pulse" />
          
          {/* Inner glow effect */}
          <div className="absolute inset-1 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

          <div className="relative z-10">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur-lg opacity-50 animate-pulse" />
                  <a href="/landingpage" rel="noreferrer">
                  <img
                    src={Logo}
                    alt="Logo"
                    className="relative h-32 w-32 rounded-full border-4 border-white/20 shadow-2xl"
                  />
                  </a>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-spin" style={{ animationDuration: "8s" }} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-emerald-200 text-sm">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-xl text-red-300 text-sm flex items-center space-x-3"
              >
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-emerald-200 flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Email Address</span>
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-300 transition-all duration-300 focus:outline-none ${
                        focusedField === "email"
                          ? "border-emerald-400 shadow-lg shadow-emerald-400/25 bg-white/10"
                          : "border-white/20 hover:border-white/30"
                      }`}
                      placeholder="Enter your email address"
                      required
                    />
                    {email && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    {focusedField === "email" && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-emerald-200 flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Password</span>
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-xl text-white placeholder-gray-300 transition-all duration-300 focus:outline-none pr-12 ${
                        focusedField === "password"
                          ? "border-emerald-400 shadow-lg shadow-emerald-400/25 bg-white/10"
                          : "border-white/20 hover:border-white/30"
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-emerald-400 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {focusedField === "password" && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 pointer-events-none" />
                    )}
                  </div>
                  {password && (
                    <p className="text-xs text-emerald-300 flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Password strength: Strong</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-white font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-3">
                      <span>Sign In</span>
                      <Sparkles className="w-5 h-5" />
                    </span>
                  )}

                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-600/20 rounded-xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <a
                  href="https://wa.me/233544060817"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 text-sm text-emerald-200 hover:text-emerald-400 transition-colors group"
                >
                  <span>Request An Account</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
              </div>

              <div className="flex justify-center items-center space-x-4 text-xs text-gray-300">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Terms of use
                </button>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privacy policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms of Use Modal */}
      <Dialog open={showTermsModal} onClose={() => setShowTermsModal(false)} className="relative z-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel as={motion.div} 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white/10 backdrop-blur-2xl p-8 rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]"
          >
            <Dialog.Title className="text-2xl font-bold text-emerald-400 mb-6 text-center">
              Terms of Use
            </Dialog.Title>

            <div className="space-y-6 text-sm text-emerald-100/80">
              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  1. DEPOSIT
                </h3>
                <ul className="list-disc list-inside space-y-2 text-emerald-100/90">
                  <li>
                    The minimum deposit amount is{" "}
                    <span className="font-medium text-white">GHS 50</span>. Deposits below this amount will not be approved.
                  </li>
                  <li>All payments should be made to:</li>
                  <ul className="ml-6 space-y-1 mt-1">
                    <li>
                      Number: <span className="font-semibold text-cyan-300">0531413817</span>
                    </li>
                    <li>
                      Name:{" "}
                      <span className="font-semibold text-cyan-300">
                        Maxwell Tandoh
                      </span>
                    </li>
                  </ul>
                  <li className="mt-1">
                    If your top-up does not reflect within 10 minutes, kindly contact an admin for immediate assistance.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  2. LOAN
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    You are eligible to request a loan up to the total amount
                    you've deposited.
                  </li>
                  <li>Only one loan request is permitted per day.</li>
                  <li>
                    A loan that is cleared within the day cannot be requested
                    again on the same day.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  3. REFERRALS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    To refer a friend, simply share the link:{" "}
                    <a
                      href="https://www.novamaxgh.vercel.app"
                      className="text-emerald-500 underline"
                    >
                      www.novamaxgh.vercel.app
                    </a>
                    .
                  </li>
                  <li>
                    New users will be guided to contact the official
                    registration agent.
                  </li>
                  <li>
                    Only recommend hardworking and trustworthy individuals to
                    maintain community quality.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  4. WORKING HOURS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Operating hours are from{" "}
                    <span className="font-medium">7:30 AM to 8:50 PM</span>,
                    Monday to Saturday.
                  </li>
                  <li>
                    Orders can be placed anytime but will be processed only
                    during working hours.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  5. PROMOTIONS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Promotions may be introduced at any time for:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>100GB bundles</li>
                    <li>Tigo non-expiry packages</li>
                    <li>MTN bundles</li>
                  </ul>
                  <li>
                    Check the site regularly for updates on deals and prices.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  6. REFUNDS
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refund requests are handled only on Sundays.</li>
                  <li>You must present the following details:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>Order ID</li>
                    <li>Data size</li>
                  </ul>
                </ul>
              </section>

              <p className="italic text-white-500 border-t pt-4">
                If you need clarification on any of these rules, feel free to
                contact an admin. Thank you for being a valued member of the
                NovaTech community.
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        className="relative z-50"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel as={motion.div} 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white/10 backdrop-blur-2xl p-8 rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]"
          >
            <Dialog.Title className="text-2xl font-bold text-emerald-400 mb-4 text-center">
              Privacy Policy
            </Dialog.Title>

            <p className="text-center text-sm text-emerald-300/70 mb-6">
              <span className="italic">Effective Date:</span> 10/07/2025
            </p>

            <div className="space-y-6 text-sm text-emerald-100/80">
              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  1. Information We Collect
                </h3>
                <ul className="list-disc list-inside space-y-2 text-emerald-100/90">
                  <li>
                    <strong>Personal Information:</strong> Name, phone number,
                    email address, and network provider.
                  </li>
                  <li>
                    <strong>Transaction Information:</strong> Data bundle
                    purchases, payment methods (e.g., MoMo – not stored), and
                    transaction history.
                  </li>
                  <li>
                    <strong>Device Information:</strong> IP address, device
                    type, browser type, and location data (for security and
                    optimization).
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  2. How We Use Your Information
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Process your data bundle orders.</li>
                  <li>
                    Communicate with you regarding purchases, updates, or
                    issues.
                  </li>
                  <li>Improve our services and customer experience.</li>
                  <li>Prevent fraud and ensure account security.</li>
                  <li>
                    Send promotional messages (optional; opt-out available).
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  3. Data Sharing
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>We don't sell or share your personal data, except:</li>
                  <ul className="ml-6 list-disc space-y-1">
                    <li>
                      With trusted service providers (e.g., payment gateways).
                    </li>
                    <li>When legally required.</li>
                    <li>To prevent fraud or protect users and our platform.</li>
                  </ul>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  4. Data Security
                </h3>
                <p>
                  We use reasonable industry-standard practices to protect your
                  data. While no system is perfectly secure, we do our best to
                  keep your information safe.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  5. Your Rights
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access, update, or delete your personal information.</li>
                  <li>Opt-out of promotional messages.</li>
                  <li>
                    Request us to stop processing your data (with business/legal
                    limitations).
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  6. Cookies & Tracking
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Used to enhance browsing, remember preferences, and track
                    site traffic.
                  </li>
                  <li>You can disable cookies in your browser settings.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  7. Third-Party Links
                </h3>
                <p>
                  Links to third-party websites may exist. We are not
                  responsible for their content or privacy practices.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  8. Changes to This Policy
                </h3>
                <p>
                  This policy may be updated periodically. Changes will be
                  reflected with a revised effective date.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg text-emerald-300 mb-2">
                  9. Contact Us
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:novamaxgh@gmail.com"
                      className="text-emerald-500 underline"
                    >
                      novamaxgh@gmail.com
                    </a>
                  </li>
                  <li>
                    Phone: <span className="text-emerald-600">0247924942</span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Login;