import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Copy, 
  Check, 
  X,
  MessageCircle
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';
import Logo from '../assets/logo-icon1.png';

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [networkFilter, setNetworkFilter] = useState('All');
  
  // Order form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  // Complaint form state
  const [complaintData, setComplaintData] = useState({
    fullName: '',
    mobileNumber: '',
    productName: '',
    productCost: '',
    transactionId: '',
    complaint: '',
    orderTime: ''
  });
  
  // Momo payment details
  const MOMO_NUMBER = '0531413817';
  const MOMO_NAME = 'Maxwell Tandoh';

  // Fetch shop products
  useEffect(() => {
    fetchShopProducts();
  }, []);

  const fetchShopProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/products/shop`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching shop products:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Number copied to clipboard',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
    setFullName('');
    setPhoneNumber('');
    setTransactionId('');
  };

  const handleOrderSubmit = async () => {
    if (!fullName.trim() || !phoneNumber.trim() || !transactionId.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all fields'
      });
      return;
    }

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 10-digit phone number'
      });
      return;
    }

    setLoading(true);
    try {
      // First, verify that the transaction amount matches or exceeds the product price
      const verifyResponse = await axios.post(`${BASE_URL}/api/sms/verify/amount`, {
        transactionId,
        productPrice: selectedProduct.price
      });

      if (!verifyResponse.data.success) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Verification Failed',
          text: verifyResponse.data.message
        });
        setLoading(false);
        return;
      }

      // If verification passed, place the order
      await axios.post(`${BASE_URL}/api/shop/order`, {
        fullName,
        phoneNumber,
        transactionId,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productDescription: selectedProduct.description,
        productPrice: selectedProduct.price
      });

      setIsOrderModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Order will be processed within 5 to 10mins. Please be patient with us. Thank You!',
        confirmButtonColor: '#10b981'
      });
      
      // Reset form
      setFullName('');
      setPhoneNumber('');
      setTransactionId('');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error submitting order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.response?.data?.message || error.response?.data?.error || 'Failed to place order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmit = async () => {
    // Validate all fields
    if (!complaintData.fullName.trim() || !complaintData.mobileNumber.trim() || 
        !complaintData.productName.trim() || !complaintData.productCost || 
        !complaintData.transactionId.trim() || !complaintData.complaint.trim() ||
        !complaintData.orderTime) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all fields'
      });
      return;
    }

    // Check if 40 minutes have passed
    const orderTime = new Date(complaintData.orderTime);
    const currentTime = new Date();
    const diffInMinutes = (currentTime - orderTime) / (1000 * 60);

    if (diffInMinutes < 40) {
      const remainingMinutes = Math.ceil(40 - diffInMinutes);
      Swal.fire({
        icon: 'warning',
        title: 'Too Early',
        text: `You can only file a complaint after 40 minutes from your order time. Please wait ${remainingMinutes} more minute(s).`
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/shop/complaint`, complaintData);
      
      setIsComplaintModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Complaint Filed!',
        text: 'Your complaint has been submitted. Admin will review it shortly.',
        confirmButtonColor: '#10b981'
      });
      
      // Reset form
      setComplaintData({
        fullName: '',
        mobileNumber: '',
        productName: '',
        productCost: '',
        transactionId: '',
        complaint: '',
        orderTime: ''
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.error || 'Failed to submit complaint. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getNetworkColor = (productName) => {
    const name = productName.toUpperCase();
    if (name.includes('MTN')) return 'from-yellow-400 to-yellow-600';
    if (name.includes('AIRTEL') || name.includes('TIGO')) return 'from-blue-500 to-indigo-600';
    if (name.includes('TELECEL')) return 'from-red-500 to-pink-600';
    return 'from-emerald-500 to-teal-600';
  };

  // Filter products based on selected network
  const filteredProducts = products.filter(product => {
    if (networkFilter === 'All') return true;
    const name = product.name.toUpperCase();
    if (networkFilter === 'MTN') return name.includes('MTN');
    if (networkFilter === 'Telecel') return name.includes('TELECEL');
    if (networkFilter === 'AirtelTigo') return name.includes('AIRTEL') || name.includes('TIGO');
    return true;
  });

  const networkButtons = [
    { name: 'All', color: 'from-emerald-500 to-teal-500' },
    { name: 'MTN', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Telecel', color: 'from-red-500 to-pink-600' },
    { name: 'AirtelTigo', color: 'from-blue-500 to-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <img src={Logo} alt="NovaTech" className="w-6 h-6 rounded" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                NovaTech
              </span>
            </button>

            {/* Network Filter Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {networkButtons.map((network) => (
                <button
                  key={network.name}
                  onClick={() => setNetworkFilter(network.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    networkFilter === network.name
                      ? `bg-gradient-to-r ${network.color} text-white shadow-lg scale-105`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile Network Filter Dropdown */}
              <select
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                className="md:hidden px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-emerald-400"
              >
                {networkButtons.map((network) => (
                  <option key={network.name} value={network.name} className="bg-gray-800">
                    {network.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all text-white"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden md:inline">File Complaint</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Shop Our Products
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse and purchase data bundles instantly. No account needed!
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-400">
              {products.length === 0 
                ? 'No products available at the moment' 
                : `No ${networkFilter} products available`}
            </p>
            {networkFilter !== 'All' && (
              <button
                onClick={() => setNetworkFilter('All')}
                className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden group hover:transform hover:scale-105 bg-cover bg-center ${
                  product.name.includes("MTN")
                    ? "bg-[url('https://img.freepik.com/premium-vector/trendy-abstract-background-design-with-yellow-background-used-texture-design-bright-poster_293525-2997.jpg')]"
                    : product.name.includes("TELECEL")
                    ? "bg-[url('https://cdn.vectorstock.com/i/500p/37/28/abstract-background-design-modern-red-and-gold-vector-49733728.jpg')]"
                    : product.name.includes("AIRTEL") || product.name.includes("TIGO")
                    ? "bg-[url('https://t4.ftcdn.net/jpg/00/72/07/17/360_F_72071785_iWP4jgsalJFR1YdiumPMboDHHOZhA3Wi.jpg')]"
                    : "bg-gradient-to-br from-slate-800/50 to-slate-900/50"
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${getNetworkColor(product.name)}`}></div>
                
                <div className="p-6 bg-black/10 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-sm text-white/90">{product.description}</p>
                    </div>
                    {product.stock > 0 && (
                      <span className="px-3 py-1 bg-green-500/30 text-white text-xs font-medium rounded-full border border-green-400/50">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-3xl font-bold text-white drop-shadow-lg">
                      GHS {product.price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOrderClick(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                      product.stock > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/50'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Modal */}
      <Dialog
        open={isOrderModalOpen}
        onClose={() => !loading && setIsOrderModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Place Your Order
              </h2>
              <button
                onClick={() => !loading && setIsOrderModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProduct && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-1.5">{selectedProduct.name}</h3>
                <p className="text-xl font-bold text-emerald-400">GHS {selectedProduct.price.toFixed(2)}</p>
              </div>
            )}

            {/* Payment Information */}
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h4 className="text-xs font-semibold text-emerald-400 mb-2.5">Payment Information</h4>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Momo Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-mono">{MOMO_NUMBER}</span>
                    <button
                      onClick={() => copyToClipboard(MOMO_NUMBER)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Copy number"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Name:</span>
                  <span className="text-white text-sm font-medium">{MOMO_NAME}</span>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0xxxxxxxxx"
                  disabled={loading}
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter Your Momo Transaction ID"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition-all mt-4 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Done'
                )}
              </button>
            </div>
          </div>
      </Dialog>

      {/* Complaint Modal */}
      <Dialog
        open={isComplaintModalOpen}
        onClose={() => !loading && setIsComplaintModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto md:max-h-none md:overflow-visible">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                File a Complaint
              </h2>
              <button
                onClick={() => !loading && setIsComplaintModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-300">
                Note: Complaints can only be filed 40 minutes after placing your order.
              </p>
            </div>

            <div className="space-y-4">
              {/* 2-column grid for form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={complaintData.fullName}
                    onChange={(e) => setComplaintData({...complaintData, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    value={complaintData.mobileNumber}
                    onChange={(e) => setComplaintData({...complaintData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="0xxxxxxxxx"
                    disabled={loading}
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={complaintData.productName}
                    onChange={(e) => setComplaintData({...complaintData, productName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Enter product name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Cost (GHS) *</label>
                  <input
                    type="number"
                    value={complaintData.productCost}
                    onChange={(e) => setComplaintData({...complaintData, productCost: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="0.00"
                    disabled={loading}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    value={complaintData.transactionId}
                    onChange={(e) => setComplaintData({...complaintData, transactionId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Enter transaction ID"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order Time *</label>
                  <input
                    type="datetime-local"
                    value={complaintData.orderTime}
                    onChange={(e) => setComplaintData({...complaintData, orderTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Complaint textarea spans full width */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Complaint *</label>
                <textarea
                  value={complaintData.complaint}
                  onChange={(e) => setComplaintData({...complaintData, complaint: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="Describe your issue..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleComplaintSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Complaint'
                )}
              </button>
            </div>
          </div>
      </Dialog>
    </div>
  );
};

export default Shop;
