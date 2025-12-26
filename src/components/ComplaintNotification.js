import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Bell, Check, Clock, AlertCircle, Trash2, MessageCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import BASE_URL from '../endpoints/endpoints';

const ComplaintNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch pending complaints count
  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/shop/complaints/count`);
      setPendingCount(response.data.count);
    } catch (error) {
      console.error('Error fetching pending complaints count:', error);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/shop/complaints`);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch complaints'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    fetchComplaints();
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/shop/complaints/${complaintId}/status`, {
        status: newStatus
      });

      // Update local state
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, status: newStatus } : c
      ));

      // Update pending count
      fetchPendingCount();

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Complaint marked as ${newStatus}`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating complaint status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update complaint status'
      });
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    const result = await Swal.fire({
      title: 'Delete Complaint?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/shop/complaints/${complaintId}`);

        // Remove from local state
        setComplaints(complaints.filter(c => c.id !== complaintId));

        // Update pending count
        fetchPendingCount();

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Complaint has been deleted.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting complaint:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete complaint'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleWhatsAppReply = (complaint) => {
    const complaintDetails = `*Complaint Response*\n\n` +
      `Hello ${complaint.fullName},\n\n` +
      `Thank you for contacting us regarding your complaint.\n\n` +
      `*Complaint Details:*\n` +
      `Transaction ID: ${complaint.transactionId}\n` +
      `Product: ${complaint.productName}\n` +
      `Cost: GHS ${complaint.productCost.toFixed(2)}\n` +
      `Order Time: ${formatDate(complaint.orderTime)}\n\n` +
      `*Your Complaint:*\n${complaint.complaint}\n\n` +
      `*Our Response:*\n[Please type your response here]`;
    
    const phoneNumber = complaint.mobileNumber.replace(/^0/, '233').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(complaintDetails)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={handleOpenModal}
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="View Complaints"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Complaints Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      >
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-sky-700 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Bell className="w-8 h-8 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Shop Complaints
                    </h2>
                    <p className="text-orange-100 text-sm mt-1">
                      {pendingCount} pending complaint{pendingCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-xl text-gray-600">No complaints filed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {complaint.fullName}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(complaint.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          <button
                            onClick={() => handleWhatsAppReply(complaint)}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reply via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete complaint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Mobile:</span>
                          <span className="ml-2 font-medium text-gray-800">{complaint.mobileNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Product:</span>
                          <span className="ml-2 font-medium text-gray-800">{complaint.productName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <span className="ml-2 font-medium text-gray-800">GHS {complaint.productCost.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Transaction ID:</span>
                          <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{complaint.transactionId}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-gray-500 text-sm">Order Time:</span>
                        <span className="ml-2 text-sm text-gray-700">{formatDate(complaint.orderTime)}</span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Complaint:</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {complaint.complaint}
                        </p>
                      </div>

                      {complaint.status === 'Pending' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleUpdateStatus(complaint.id, 'Resolved')}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Mark as Resolved
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(complaint.id, 'Rejected')}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </Dialog>
    </>
  );
};

export default ComplaintNotification;
