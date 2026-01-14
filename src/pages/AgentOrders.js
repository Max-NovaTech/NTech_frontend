import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Package,
  Filter,
  RefreshCw,
  Phone,
  User,
  CreditCard,
  AlertCircle,
  Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

const AgentOrders = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const allowedRoles = ['PREMIUM', 'NORMAL', 'USER', 'SUPER', 'Other'];

  useEffect(() => {
    if (!allowedRoles.includes(userRole)) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [userId, userRole, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/agent/storefront/${userId}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleApprove = async (orderId) => {
    const result = await Swal.fire({
      title: 'Approve Order?',
      text: 'Make sure you have verified the transaction ID with your Momo records.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Approve'
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${BASE_URL}/api/agent/storefront/${userId}/orders/${orderId}/approve`);
        fetchOrders();
        Swal.fire('Approved!', 'Order has been approved.', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to approve order', 'error');
      }
    }
  };

  const handleReject = async (orderId) => {
    const result = await Swal.fire({
      title: 'Reject Order?',
      text: 'This will mark the order as rejected. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Reject'
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${BASE_URL}/api/agent/storefront/${userId}/orders/${orderId}/reject`);
        fetchOrders();
        Swal.fire('Rejected!', 'Order has been rejected.', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to reject order', 'error');
      }
    }
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

  const getStatusBadge = (status, isPushed) => {
    if (isPushed) {
      return (
        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
          Pushed to Admin
        </span>
      );
    }
    
    switch(status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
            Pending Verification
          </span>
        );
      case 'Approved':
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            Rejected
          </span>
        );
      case 'Processing':
        return (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            Processing
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full border border-gray-500/30">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pushed') return order.isPushedToAdmin;
    return order.status === filterStatus && !order.isPushedToAdmin;
  });

  const statusCounts = {
    all: orders.length,
    Pending: orders.filter(o => o.status === 'Pending' && !o.isPushedToAdmin).length,
    Approved: orders.filter(o => o.status === 'Approved' && !o.isPushedToAdmin).length,
    pushed: orders.filter(o => o.isPushedToAdmin).length,
    Rejected: orders.filter(o => o.status === 'Rejected').length
  };

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
          <div className="flex flex-wrap justify-between items-center py-3 md:h-16 gap-2">
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
              <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-gray-800">Store Orders</span>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <button
                onClick={() => navigate('/storefront')}
                className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm md:text-base transition-all"
              >
                <span>Storefront</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
          {[
            { key: 'all', label: 'All', color: 'gray' },
            { key: 'Pending', label: 'Pending', color: 'yellow' },
            { key: 'Approved', label: 'Approved', color: 'green' },
            { key: 'pushed', label: 'Pushed', color: 'purple' },
            { key: 'Rejected', label: 'Rejected', color: 'red' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg font-medium transition-all flex items-center space-x-1 md:space-x-2 text-xs md:text-sm ${
                filterStatus === tab.key
                  ? 'text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{
                backgroundColor: filterStatus === tab.key 
                  ? tab.color === 'yellow' ? '#ca8a04' 
                    : tab.color === 'green' ? '#16a34a'
                    : tab.color === 'purple' ? '#9333ea'
                    : tab.color === 'red' ? '#dc2626'
                    : '#4b5563'
                  : undefined
              }}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] md:text-xs ${filterStatus === tab.key ? 'bg-black/20' : 'bg-gray-100'}`}>{statusCounts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-base md:text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-5 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-800">{order.productName}</h3>
                      <p className="text-gray-500 text-xs md:text-sm">{order.productDescription}</p>
                    </div>
                    {getStatusBadge(order.status, order.isPushedToAdmin)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{order.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-gray-600">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-gray-600 font-mono text-xs truncate">{order.transactionId}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-gray-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Customer Paid</p>
                      <p className="text-lg md:text-xl font-bold text-green-600">GHS {order.customerPrice?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Cost: GHS {order.agentPrice?.toFixed(2)} | <span className="text-green-600">Profit: GHS {(order.customerPrice - order.agentPrice).toFixed(2)}</span></p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'Pending' && !order.isPushedToAdmin && (
                        <>
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-xs md:text-sm transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 md:px-4 md:py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-xs md:text-sm transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      {order.status === 'Approved' && !order.isPushedToAdmin && (
                        <span className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>In Cart</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-700 font-semibold mb-2 text-sm md:text-base">How Agent Store Orders Work</h4>
              <ol className="text-gray-600 text-xs md:text-sm space-y-1 list-decimal list-inside">
                <li>Customers place orders on your store and pay via Momo</li>
                <li>Verify the transaction ID matches your Momo records</li>
                <li>Approve or reject the order based on payment verification</li>
                <li>Approved orders are automatically added to your cart</li>
                <li>Go to your dashboard and submit your cart to process orders</li>
                <li>Balance is deducted when you submit your cart</li>
                <li>Orders appear in your order history after submission</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentOrders;
