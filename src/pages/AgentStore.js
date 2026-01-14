import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Copy, 
  Check, 
  X,
  Store,
  AlertCircle
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

const AgentStore = () => {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [networkFilter, setNetworkFilter] = useState('All');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    transactionId: ''
  });

  useEffect(() => {
    fetchStoreData();
  }, [storeSlug]);

  const fetchStoreData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/agent/store/${storeSlug}`);
      setStoreData(response.data.storefront);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching store:', error);
      setError(error.response?.data?.error || 'Store not found');
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
    setOrderForm({
      customerName: '',
      customerPhone: '',
      transactionId: ''
    });
  };

  const handleOrderSubmit = async () => {
    if (!orderForm.customerName.trim() || !orderForm.customerPhone.trim() || !orderForm.transactionId.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all fields'
      });
      return;
    }

    if (orderForm.customerPhone.length !== 10 || !/^\d+$/.test(orderForm.customerPhone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 10-digit phone number'
      });
      return;
    }

    setOrderLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/agent/store/${storeSlug}/order`, {
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        storefrontProductId: selectedProduct.id,
        transactionId: orderForm.transactionId
      });

      setIsOrderModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Your order has been submitted. The agent will verify your payment and process your order.',
        confirmButtonColor: '#10b981'
      });
      
      setOrderForm({
        customerName: '',
        customerPhone: '',
        transactionId: ''
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error submitting order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.response?.data?.error || 'Failed to place order. Please try again.'
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const getNetworkColor = (productName) => {
    const name = productName?.toUpperCase() || '';
    if (name.includes('MTN')) return 'from-yellow-400 to-yellow-600';
    if (name.includes('AIRTEL') || name.includes('TIGO')) return 'from-blue-500 to-indigo-600';
    if (name.includes('TELECEL')) return 'from-red-500 to-pink-600';
    return 'from-emerald-500 to-teal-600';
  };

  const getNetworkBg = (productName) => {
    const name = productName?.toUpperCase() || '';
    if (name.includes('MTN')) return "bg-[url('https://img.freepik.com/premium-vector/trendy-abstract-background-design-with-yellow-background-used-texture-design-bright-poster_293525-2997.jpg')]";
    if (name.includes('TELECEL')) return "bg-[url('https://cdn.vectorstock.com/i/500p/37/28/abstract-background-design-modern-red-and-gold-vector-49733728.jpg')]";
    if (name.includes('AIRTEL') || name.includes('TIGO')) return "bg-[url('https://t4.ftcdn.net/jpg/00/72/07/17/360_F_72071785_iWP4jgsalJFR1YdiumPMboDHHOZhA3Wi.jpg')]";
    return 'bg-gradient-to-br from-slate-800/50 to-slate-900/50';
  };

  const networkButtons = [
    { name: 'All', color: 'from-emerald-500 to-teal-500' },
    { name: 'MTN', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Telecel', color: 'from-red-500 to-pink-600' },
    { name: 'AirtelTigo', color: 'from-blue-500 to-indigo-600' }
  ];

  const filteredProducts = useMemo(() => {
    if (networkFilter === 'All') return products;
    return products.filter(product => {
      const name = product.name?.toUpperCase() || '';
      if (networkFilter === 'MTN') return name.includes('MTN');
      if (networkFilter === 'Telecel') return name.includes('TELECEL');
      if (networkFilter === 'AirtelTigo') return name.includes('AIRTEL') || name.includes('TIGO');
      return true;
    });
  }, [products, networkFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 md:w-20 md:h-20 mx-auto text-red-400 mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Store Not Found</h1>
          <p className="text-gray-400 mb-6 text-sm md:text-base">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 md:px-6 md:py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center py-3 md:h-16 gap-2">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Store className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                {storeData?.storeName}
              </span>
            </div>

            {/* Network Filter Buttons - Desktop */}
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

            {/* Mobile Network Filter Dropdown */}
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="md:hidden px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:border-emerald-400 text-sm"
            >
              {networkButtons.map((network) => (
                <option key={network.name} value={network.name} className="bg-gray-800">
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-400 mb-4" />
            <p className="text-lg md:text-xl text-gray-400">
              {products.length === 0 
                ? 'No products available at the moment' 
                : `No ${networkFilter} products available`}
            </p>
            {networkFilter !== 'All' && (
              <button
                onClick={() => setNetworkFilter('All')}
                className="mt-4 px-4 py-2 md:px-6 md:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm md:text-base"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`rounded-xl md:rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden group hover:transform hover:scale-[1.02] bg-cover bg-center ${getNetworkBg(product.name)}`}
              >
                <div className={`h-1.5 md:h-2 bg-gradient-to-r ${getNetworkColor(product.name)}`}></div>
                
                <div className="p-4 md:p-6 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div>
                      <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-2">{product.name}</h3>
                      <p className="text-xs md:text-sm text-white/90">{product.description}</p>
                    </div>
                    {product.stock > 0 && (
                      <span className="px-2 py-0.5 md:px-3 md:py-1 bg-green-500/30 text-white text-[10px] md:text-xs font-medium rounded-full border border-green-400/50">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="mb-4 md:mb-6">
                    <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                      GHS {product.customPrice?.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOrderClick(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold text-white text-sm md:text-base transition-all duration-300 ${
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
        onClose={() => !orderLoading && setIsOrderModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl max-w-md w-full p-4 md:p-5 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-white">
              Place Your Order
            </h2>
            <button
              onClick={() => !orderLoading && setIsOrderModalOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedProduct && (
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-1.5">{selectedProduct.name}</h3>
              <p className="text-xs text-gray-400 mb-1">{selectedProduct.description}</p>
              <p className="text-lg md:text-xl font-bold text-emerald-400">GHS {selectedProduct.customPrice?.toFixed(2)}</p>
            </div>
          )}

          {/* Payment Information */}
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <h4 className="text-xs font-semibold text-emerald-400 mb-2.5">Send Payment To:</h4>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Momo Number:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-mono">{storeData?.momoNumber}</span>
                  <button
                    onClick={() => copyToClipboard(storeData?.momoNumber)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
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
                <span className="text-white text-sm font-medium">{storeData?.momoName}</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                value={orderForm.customerName}
                onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Enter your full name"
                disabled={orderLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Phone Number (to receive data) *
              </label>
              <input
                type="tel"
                value={orderForm.customerPhone}
                onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="0xxxxxxxxx"
                disabled={orderLoading}
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Transaction ID *
              </label>
              <input
                type="text"
                value={orderForm.transactionId}
                onChange={(e) => setOrderForm({...orderForm, transactionId: e.target.value})}
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Enter your Momo Transaction ID"
                disabled={orderLoading}
              />
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-2">
              <p className="text-xs text-orange-300">
                <strong>Note:</strong> Send exactly GHS {selectedProduct?.customPrice?.toFixed(2)} to the Momo number above, 
                then enter your transaction ID. The agent will verify your payment before processing.
              </p>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={orderLoading}
              className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition-all mt-4 ${
                orderLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg'
              }`}
            >
              {orderLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Order'
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AgentStore;
