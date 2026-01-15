import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Store, 
  Plus, 
  Trash2, 
  Edit3, 
  Link2, 
  Copy, 
  Check,
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

const AgentStorefront = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');
  
  const [storefront, setStorefront] = useState(null);
  const [storefrontProducts, setStorefrontProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);
  
  const [settingsForm, setSettingsForm] = useState({
    storeName: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [profitStats, setProfitStats] = useState(null);
  const [productFilter, setProductFilter] = useState('All');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkPrices, setBulkPrices] = useState({});

  const allowedRoles = ['PREMIUM', 'NORMAL', 'USER', 'SUPER', 'Other'];

  useEffect(() => {
    if (!allowedRoles.includes(userRole)) {
      navigate('/login');
      return;
    }
    fetchStorefront();
    fetchStorefrontProducts();
    fetchAvailableProducts();
    fetchProfitStats();
  }, [userId, userRole, navigate]);

  const fetchStorefront = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/agent/storefront/${userId}`);
      setStorefront(response.data);
      if (response.data) {
        setSettingsForm({
          storeName: response.data.storeName || ''
        });
      }
    } catch (error) {
      console.error('Error fetching storefront:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorefrontProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/agent/storefront/${userId}/products`);
      setStorefrontProducts(response.data);
    } catch (error) {
      console.error('Error fetching storefront products:', error);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/agent/storefront/${userId}/available-products`);
      setAvailableProducts(response.data);
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  const fetchProfitStats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/agent/storefront/${userId}/profit-stats`);
      setProfitStats(response.data);
    } catch (error) {
      console.error('Error fetching profit stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsForm.storeName.trim()) {
      Swal.fire('Error', 'Please enter a store name', 'error');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/agent/storefront/${userId}`, settingsForm);
      setStorefront(response.data);
      setIsSettingsOpen(false);
      Swal.fire('Success', 'Storefront settings saved successfully', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to save settings', 'error');
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || !customPrice) {
      Swal.fire('Error', 'Please select a product and enter a price', 'error');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/agent/storefront/${userId}/products`, {
        productId: selectedProduct.id,
        customPrice: parseFloat(customPrice)
      });
      setIsAddProductOpen(false);
      setSelectedProduct(null);
      setCustomPrice('');
      fetchStorefrontProducts();
      Swal.fire('Success', 'Product added to storefront', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to add product', 'error');
    }
  };

  const handleAddMultipleProducts = async () => {
    if (selectedProducts.length === 0) {
      Swal.fire('Error', 'Please select at least one product', 'error');
      return;
    }

    const productsToAdd = selectedProducts.map(productId => ({
      productId,
      customPrice: parseFloat(bulkPrices[productId] || availableProducts.find(p => p.id === productId)?.price || 0)
    }));

    try {
      await axios.post(`${BASE_URL}/api/agent/storefront/${userId}/products/bulk`, {
        products: productsToAdd
      });
      setIsAddProductOpen(false);
      setSelectedProducts([]);
      setBulkPrices({});
      fetchStorefrontProducts();
      Swal.fire('Success', `${productsToAdd.length} products added to storefront`, 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to add products', 'error');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkPriceChange = (productId, price) => {
    setBulkPrices(prev => ({
      ...prev,
      [productId]: price
    }));
  };

  const handleUpdatePrice = async () => {
    if (!newPrice) {
      Swal.fire('Error', 'Please enter a new price', 'error');
      return;
    }

    try {
      await axios.put(`${BASE_URL}/api/agent/storefront/${userId}/products`, {
        storefrontProductId: editingProduct.id,
        customPrice: parseFloat(newPrice)
      });
      setIsEditPriceOpen(false);
      setEditingProduct(null);
      setNewPrice('');
      fetchStorefrontProducts();
      Swal.fire('Success', 'Price updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to update price', 'error');
    }
  };

  const handleRemoveProduct = async (storefrontProductId) => {
    const result = await Swal.fire({
      title: 'Remove Product?',
      text: 'This will remove the product from your storefront',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/agent/storefront/${userId}/products/${storefrontProductId}`);
        fetchStorefrontProducts();
        Swal.fire('Removed', 'Product removed from storefront', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to remove product', 'error');
      }
    }
  };

  const handleRegenerateLink = async () => {
    const result = await Swal.fire({
      title: 'Regenerate Store Link?',
      text: 'This will create a new link. The old link will stop working.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, regenerate'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${BASE_URL}/api/agent/storefront/${userId}/regenerate-link`);
        fetchStorefront();
        Swal.fire('Success', 'New store link generated', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to regenerate link', 'error');
      }
    }
  };

  const copyStoreLink = () => {
    const link = `${window.location.origin}/agent-store/${storefront?.storeSlug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Swal.fire({
      icon: 'success',
      title: 'Link Copied!',
      text: 'Store link copied to clipboard',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const getBackRoute = () => {
    switch(userRole) {
      case 'SUPER': return '/superagent';
      case 'NORMAL': return '/normalagent';
      case 'PREMIUM': return '/premium';
      case 'USER': return '/user';
      case 'Other': return '/otherdashboard';
      default: return '/';
    }
  };

  const getNetworkColor = (productName) => {
    const name = productName?.toUpperCase() || '';
    if (name.includes('MTN')) return 'from-yellow-400 to-yellow-600';
    if (name.includes('AIRTEL') || name.includes('TIGO')) return 'from-blue-500 to-indigo-600';
    if (name.includes('TELECEL')) return 'from-red-500 to-pink-600';
    return 'from-emerald-500 to-teal-600';
  };

  const networkButtons = [
    { name: 'All', color: 'bg-gray-600' },
    { name: 'MTN', color: 'bg-yellow-500' },
    { name: 'Telecel', color: 'bg-red-500' },
    { name: 'AirtelTigo', color: 'bg-blue-500' }
  ];

  const filteredStorefrontProducts = useMemo(() => {
    if (productFilter === 'All') return storefrontProducts;
    return storefrontProducts.filter(item => {
      const name = item.product?.name?.toUpperCase() || '';
      if (productFilter === 'MTN') return name.includes('MTN');
      if (productFilter === 'Telecel') return name.includes('TELECEL');
      if (productFilter === 'AirtelTigo') return name.includes('AIRTEL') || name.includes('TIGO');
      return true;
    });
  }, [storefrontProducts, productFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center h-auto py-3 md:h-16 gap-2">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => navigate(getBackRoute())}
                className="flex items-center space-x-1 md:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Back</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-gray-800">My Storefront</span>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <button
                onClick={() => navigate('/agent-orders')}
                className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm md:text-base transition-all"
              >
                <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />
                <span>Orders</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Profit Stats Card */}
        {profitStats && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Your Earnings</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                <p className="text-xs md:text-sm text-green-600 mb-1">Total Profit</p>
                <p className="text-xl md:text-2xl font-bold text-green-700">GHS {profitStats.totalProfit?.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 md:p-4 border border-yellow-200">
                <p className="text-xs md:text-sm text-yellow-600 mb-1">Pending Profit</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-700">GHS {profitStats.potentialProfit?.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
                <p className="text-xs md:text-sm text-blue-600 mb-1">Completed Orders</p>
                <p className="text-xl md:text-2xl font-bold text-blue-700">{profitStats.completedOrders}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 md:p-4 border border-purple-200">
                <p className="text-xs md:text-sm text-purple-600 mb-1">Pending Orders</p>
                <p className="text-xl md:text-2xl font-bold text-purple-700">{profitStats.pendingOrders}</p>
              </div>
            </div>
          </div>
        )}

        {/* Store Settings Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                {storefront?.storeName || 'Set Up Your Store'}
              </h2>
              {storefront && (
                <div className="space-y-1 text-gray-600">
                  {/* <p><span className="text-gray-500">Momo:</span> {storefront.momoNumber} ({storefront.momoName})</p> */}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm md:text-base transition-all"
              >
                <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                <span>{storefront ? 'Edit' : 'Set Up Store'}</span>
              </button>
              
              {storefront && (
                <>
                  <button
                    onClick={copyStoreLink}
                    className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm md:text-base transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                    <span>Copy Link</span>
                  </button>
                  
                  <button
                    onClick={handleRegenerateLink}
                    className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm md:text-base transition-all"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                    <span>New Link</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          {storefront && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Your Store Link:</p>
              <p className="text-blue-600 font-mono text-xs md:text-sm break-all">
                {window.location.origin}/agent-store/{storefront.storeSlug}
              </p>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="mb-4 md:mb-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Your Storefront Products</h3>
            {storefront && (
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm md:text-base transition-all"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span>Add Products</span>
              </button>
            )}
          </div>
          
          {/* Product Filter Buttons */}
          {storefrontProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {networkButtons.map((network) => (
                <button
                  key={network.name}
                  onClick={() => setProductFilter(network.name)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    productFilter === network.name
                      ? `${network.color} text-white`
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {!storefront ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <Store className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-base md:text-lg mb-4">Set up your storefront first to add products</p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
            >
              Set Up Storefront
            </button>
          </div>
        ) : storefrontProducts.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-base md:text-lg mb-4">No products in your storefront yet</p>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 md:px-6 md:py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all"
            >
              Add Your First Product
            </button>
          </div>
        ) : filteredStorefrontProducts.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-base md:text-lg mb-4">No {productFilter} products found</p>
            <button
              onClick={() => setProductFilter('All')}
              className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredStorefrontProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className={`h-2 bg-gradient-to-r ${getNetworkColor(item.product?.name)}`}></div>
                <div className="p-4 md:p-5">
                  <h4 className="text-base md:text-lg font-bold text-gray-800 mb-1">{item.product?.name}</h4>
                  <p className="text-gray-500 text-sm mb-3">{item.product?.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Your Cost</p>
                      <p className="text-gray-600">GHS {item.product?.price?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Your Price</p>
                      <p className="text-xl md:text-2xl font-bold text-green-600">GHS {item.customPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(item);
                        setNewPrice(item.customPrice?.toString());
                        setIsEditPriceOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-all"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Edit Price</span>
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(item.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <Dialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Storefront Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Store Name *</label>
              <input
                type="text"
                value={settingsForm.storeName}
                onChange={(e) => setSettingsForm({...settingsForm, storeName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="My Data Store"
              />
              <p className="text-xs text-gray-400 mt-2">
                Your store name will be visible to customers on your store page.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog
        open={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Add Products to Storefront</h2>
          <p className="text-gray-400 text-sm mb-4">Select multiple products and set your selling prices</p>
          
          {selectedProducts.length > 0 && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">{selectedProducts.length} product(s) selected</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Available Products</label>
              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
                {availableProducts
                  .filter(p => !storefrontProducts.find(sp => sp.productId === p.id))
                  .map((product) => (
                    <div
                      key={product.id}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedProducts.includes(product.id)
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="mt-1 w-4 h-4 rounded border-gray-400 text-green-500 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-medium text-sm">{product.name}</p>
                              <p className="text-gray-400 text-xs">{product.description}</p>
                            </div>
                            <p className="text-gray-300 text-sm">Cost: GHS {product.price?.toFixed(2)}</p>
                          </div>
                          {selectedProducts.includes(product.id) && (
                            <div className="flex items-center gap-2 mt-2">
                              <label className="text-xs text-gray-400">Your Price:</label>
                              <input
                                type="number"
                                value={bulkPrices[product.id] || product.price || ''}
                                onChange={(e) => handleBulkPriceChange(product.id, e.target.value)}
                                className="w-24 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-500"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                              <span className="text-xs text-green-400">
                                Profit: GHS {((parseFloat(bulkPrices[product.id]) || product.price) - product.price).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setIsAddProductOpen(false);
                setSelectedProducts([]);
                setBulkPrices({});
              }}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMultipleProducts}
              disabled={selectedProducts.length === 0}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white transition-all ${
                selectedProducts.length > 0
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add {selectedProducts.length > 0 ? `${selectedProducts.length} Products` : 'Products'}</span>
            </button>
          </div>
        </div>
      </Dialog>

      {/* Edit Price Modal */}
      <Dialog
        open={isEditPriceOpen}
        onClose={() => setIsEditPriceOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Update Price</h2>
          
          {editingProduct && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-white font-medium">{editingProduct.product?.name}</p>
                <p className="text-gray-400 text-sm">{editingProduct.product?.description}</p>
                <p className="text-gray-500 text-xs mt-1">Your cost: GHS {editingProduct.product?.price?.toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Selling Price (GHS)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Profit: GHS {(parseFloat(newPrice || 0) - (editingProduct.product?.price || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setIsEditPriceOpen(false);
                setEditingProduct(null);
                setNewPrice('');
              }}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdatePrice}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Update Price</span>
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AgentStorefront;
