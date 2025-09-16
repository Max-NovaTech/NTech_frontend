import { useState, useEffect, useMemo, useRef, useDeferredValue, useCallback, memo, lazy, Suspense, startTransition } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FileText,
  Bell,
  Check,
  SpellCheck,
  Clock,
  RotateCcw,
  CheckSquare,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import Swal from "sweetalert2";
import BASE_URL from "../endpoints/endpoints";

const TotalRequestsComponent = () => {
  const resetAllFilters = () => {
    setOrderIdFilter("");
    setPhoneNumberFilter("");
    setSelectedProduct("");
    setSelectedStatusMain("");
    setSelectedDate("");
    setStartTime("");
    setEndTime("");
    setSortOrder("newest");
    setCurrentPage(1);
    setShowNewRequestsOnly(false);
  };
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(() => {
    const savedTime = localStorage.getItem("lastFetchTime");
    return savedTime ? new Date(savedTime) : null;
  });

  // Removed duplicate useEffect - keeping the one at line 182
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const newRequestsTimerRef = useRef(null);
  const [showNewRequestsOnly, setShowNewRequestsOnly] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds - fixed to 30 seconds
  const audioRef = useRef(null);
  const [ticker, setTicker] = useState(0);

  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [phoneNumberFilter, setPhoneNumberFilter] = useState("");
  // Use deferred values for instant input with longer delay
  const deferredOrderIdFilter = useDeferredValue(orderIdFilter);
  const deferredPhoneNumberFilter = useDeferredValue(phoneNumberFilter);
  
  // Debounced filter function to reduce expensive operations
  const debounceTimeout = useRef(null);
  const [debouncedFilters, setDebouncedFilters] = useState({
    orderId: '',
    phoneNumber: '',
    product: '',
    status: '',
    date: ''
  });

  // Pagination - Optimized for 500 items with virtual scrolling
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(500);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 }); // Virtual scrolling

  // Filters
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStatusMain, setSelectedStatusMain] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  // Modal for status update
  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Create a ref to track previous items count for detecting new items
  const prevOrderIdsRef = useRef(new Set());
  const intervalRef = useRef(null);

  const fetchOrderData = useCallback(async () => {
    setLoading(true);
    
    // Show loading state immediately for better UX
    setPaginatedItems([]);
    try {
      console.log('Fetching orders from:', `${BASE_URL}/order/admin/allorder`);
      
      // Build query parameters for server-side filtering
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        orderIdFilter: deferredOrderIdFilter || undefined,
        phoneNumberFilter: deferredPhoneNumberFilter || undefined,
        selectedProduct: selectedProduct || undefined,
        selectedStatusMain: selectedStatusMain || undefined,
        selectedDate: selectedDate || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        sortOrder: sortOrder,
        showNewRequestsOnly: showNewRequestsOnly
      };
      
      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await axios.get(`${BASE_URL}/order/admin/allorder`, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        params
      });
      console.log('API Response:', response.data);
      const currentTime = new Date();

      // Handle the new paginated response structure
      if (response.data && response.data.data) {
        const { data: itemsList, pagination } = response.data;
        
        // Update pagination info
        setTotalPages(pagination.totalPages);
        
        // Check for new items since last fetch (only on first page)
        if (currentPage === 1) {
          // Check for orders with isNew tag from backend
          const newTaggedOrders = itemsList.filter(item => item.isNew === true);
          const newTaggedOrdersCount = newTaggedOrders.length;

          // Filter for orders that should trigger notifications (new tag + Pending status)
          const newPendingOrders = newTaggedOrders.filter(item => 
            item.order?.items?.[0]?.status === "Processing"
          );
          const newPendingOrdersCount = newPendingOrders.length;

          // Only trigger notifications if we have new tagged orders and this isn't the first load and modal is closed
          if (newTaggedOrdersCount > 0 && prevOrderIdsRef.current.size > 0) {
            setHasNewRequests(true);
            setNewRequestsCount(newTaggedOrdersCount);
            
            // Clear any existing timer
            if (newRequestsTimerRef.current) {
              clearTimeout(newRequestsTimerRef.current);
            }
            
            // Set timer to hide "New" tag after 30 seconds (30000ms)
            newRequestsTimerRef.current = setTimeout(() => {
              setHasNewRequests(false);
              setNewRequestsCount(0);
            }, 30000);
            
            // Only show notifications and play sound for pending orders and when modal is closed
            if (notificationsEnabled && newPendingOrdersCount > 0 && !open) {
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("New Pending Orders", {
                  body: `${newPendingOrdersCount} new pending order(s) require attention.`,
                  icon: "/notification-icon.png",
                });
              }
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));
              }
            }
          }
          
          // Update the reference for next comparison
          const currentOrderIds = new Set(itemsList.map(item => item.orderId));
          prevOrderIdsRef.current = currentOrderIds;
        }

        // Set items directly from server response (no client-side processing needed)
        // Use startTransition for non-urgent updates to prevent blocking
        startTransition(() => {
          setAllItems(itemsList);
          setPaginatedItems(itemsList); // Server already handles pagination
          setLastFetchTime(currentTime);
          localStorage.setItem("lastFetchTime", currentTime.toISOString());
          // Reset virtual scrolling to top
          setVisibleRange({ start: 0, end: 50 });
        });
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `${BASE_URL}/order/admin/allorder`
      });
      
      // Show user-friendly error message
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - API is taking too long to respond');
      } else if (error.response?.status === 404) {
        console.error('API endpoint not found');
      } else if (error.response?.status >= 500) {
        console.error('Server error - API is down or having issues');
      } else if (!error.response) {
        console.error('Network error - unable to reach API');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, deferredOrderIdFilter, deferredPhoneNumberFilter, selectedProduct, selectedStatusMain, selectedDate, startTime, endTime, sortOrder, showNewRequestsOnly, notificationsEnabled]);

  // Request notification permission when component mounts
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Create audio element for notification sound
    const audio = new Audio("/notification-sound.mp3"); // You'll need to add this file to your public directory
    audioRef.current = audio;

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Set up auto-refresh interval effect - optimized
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchOrderData, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, fetchOrderData]);

  // Fetch data on component mount
  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  // Effect to make the 'new requests' filter dynamic - optimized
  useEffect(() => {
    let interval = null;
    if (showNewRequestsOnly) {
      interval = setInterval(() => {
        setTicker(prev => prev + 1);
      }, 30000); // Increased to 30 seconds to reduce re-renders
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showNewRequestsOnly]);

  // Effect to request notification permission
  useEffect(() => {
    if (notificationsEnabled && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (newRequestsTimerRef.current) {
        clearTimeout(newRequestsTimerRef.current);
      }
    };
  }, []);

  const handleBatchCompleteProcessing = async () => {
    // Get all processing orders
    const processingItems = allItems.filter(
      (item) => item.order?.items?.[0]?.status === "Processing"
    );

    console.log("Processing Items:", processingItems);

    // If no processing orders, show a message
    if (processingItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Processing Orders",
        text: "There are no orders with 'Processing' status to update.",
      });
      return;
    }

    // Get unique order IDs (to prevent duplicates)
    const orderIds = [
      ...new Set(processingItems.map((item) => item.order?.id)),
    ].filter(Boolean);

    console.log("Unique Order IDs:", orderIds);

    // Confirm with the user
    const { isConfirmed } = await Swal.fire({
      icon: "question",
      title: "Batch Update",
      text: `Are you sure you want to update ${orderIds.length} orders from 'Processing' to 'Completed'?`,
      showCancelButton: true,
      confirmButtonText: "Yes, update all",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    try {
      Swal.fire({
        title: "Processing...",
        text: `Updating ${orderIds.length} orders to "Completed" status`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Update each order
      const updatePromises = orderIds.map((orderId) =>
        axios.put(`${BASE_URL}/order/orders/${orderId}/status`, {
          status: "Completed",
        })
      );

      await Promise.all(updatePromises);

      // Update local state
      setAllItems((prevItems) =>
        prevItems.map((item) => {
          if (
            item.order?.items?.[0]?.status === "Processing" &&
            orderIds.includes(item.order?.id)
          ) {
            return {
              ...item,
              order: {
                ...item.order,
                items: item.order.items.map((orderItem) => ({
                  ...orderItem,
                  status: "Completed",
                })),
              },
            };
          }
          return item;
        })
      );

      Swal.fire({
        icon: "success",
        title: "Batch Update Complete",
        text: `${orderIds.length} orders have been updated to "Completed" status`,
        timer: 2000,
      });

      // Refresh data to ensure UI is in sync
      fetchOrderData();
    } catch (error) {
      console.error("Error updating order statuses:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update some order statuses. Please check the console for details.",
      });
    }
  };

  // Server handles filtering and sorting, so we just use allItems directly
  const filteredOrders = allItems;

  // Server handles pagination, so we don't need this effect
  useEffect(() => {
    if (allItems.length > 0) {
      console.log("Inspecting the first item in allItems:", allItems[0]);
    }
  }, [allItems]);

  // console.log("All Orders", paginatedItems)

  const handleViewClickStatus = (orderItemId) => {
    // Find the item to check if it's cancelled
    const item = allItems.find((item) => item.id === orderItemId);
    if (item?.order?.items?.[0]?.status === "Cancelled") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Update",
        text: "Cancelled orders cannot be modified.",
      });
      return;
    }

    console.log("Order Item", orderItemId);
    setSelectedOrderId(orderItemId);
    setIsOpenStatus(true);
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      Swal.fire({
        title: "Processing...",
        text: "Updating order status",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const config = {
        method: "put",
        url: `${BASE_URL}/order/orders/${orderId}/status`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          status: "Completed",
        }),
      };

      await axios.request(config);

      // Update local state to reflect the change
      setAllItems((prevItems) =>
        prevItems.map((item) =>
          item.order?.id === orderId
            ? {
                ...item,
                order: {
                  ...item.order,
                  items: item.order.items.map((orderItem) => ({
                    ...orderItem,
                    status: "Completed",
                  })),
                },
              }
            : item
        )
      );

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: "Order status has been updated to Completed",
        timer: 2000,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update order status",
      });
    }
  };

  const handleCloseModal = () => {
    const currentTime = new Date();
    setLastFetchTime(currentTime);
    localStorage.setItem("lastFetchTime", currentTime.toISOString());

    // Mark all items as not new
    setAllItems((prevItems) =>
      prevItems.map((item) => ({ ...item, isNew: false }))
    );

    setOpen(false);
    setHasNewRequests(false);
    setNewRequestsCount(0);
  };

  const handleSubmit = async () => {
    if (!selectedOrderId || !selectedStatus) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please select a status before proceeding.",
      });
      return;
    }

    console.log("Selected Order ID:", selectedOrderId);

    try {
      Swal.fire({
        title: "Processing...",
        text: "Updating order status, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${BASE_URL}/order/admin/process/order`,
        {
          orderItemId: selectedOrderId,
          status: selectedStatus,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("API Response:", response.data);
      console.log("Request payload:", {
        orderItemId: selectedOrderId,
        status: selectedStatus,
      });

      setAllItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedOrderId
            ? {
                ...item,
                order: {
                  ...item.order,
                  items: item.order.items.map((orderItem) =>
                    orderItem.id === selectedOrderId
                      ? { ...orderItem, status: selectedStatus }
                      : orderItem
                  ),
                },
                isNew: false,
              }
            : item
        )
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Order status updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsOpenStatus(false);
    } catch (error) {
      console.error("Error updating order:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong while updating the order. Please try again.",
      });
    }
  };

  const handleDownloadExcel = async () => {
    // Only export PENDING orders to avoid re-downloading processed ones
    const pendingItems = filteredOrders.filter(
      (item) => item.order?.items?.[0]?.status === "Pending"
    );

    if (!pendingItems.length) {
      Swal.fire({
        icon: "warning",
        title: "No Pending Orders",
        text: "No pending orders available for download. Only pending orders can be exported to avoid duplicates.",
      });
      return;
    }

    const pendingOrderIds = [
      ...new Set(pendingItems.map((item) => item.order?.id)),
    ].filter(Boolean);

    // Only export phone number and data size in simple format
    const dataToExport = pendingItems.map((item) => {
      const phoneNumber = item?.mobileNumber || "N/A";
      const dataSize = item.product?.description
        ? item.product.description.replace(/\D+$/, "")
        : "N/A";
      
      return {
        "Phone Number": phoneNumber,
        "Data Size": dataSize
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending_Orders");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    XLSX.writeFile(wb, `Pending_Orders_${timestamp}.xlsx`);

    // After successful download, update the status of pending items to processing
    if (pendingOrderIds.length > 0) {
      try {
        Swal.fire({
          title: "Processing...",
          text: `Updating ${pendingOrderIds.length} pending orders to "Processing" status`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Update each pending order
        const updatePromises = pendingOrderIds.map((orderId) =>
          axios.put(`${BASE_URL}/order/orders/${orderId}/status`, {
            status: "Processing",
          })
        );

        await Promise.all(updatePromises);

        // Update local state immediately to reflect changes
        setAllItems((prevItems) =>
          prevItems.map((item) => {
            if (
              item.order?.items?.[0]?.status === "Pending" &&
              pendingOrderIds.includes(item.order?.id)
            ) {
              return {
                ...item,
                order: {
                  ...item.order,
                  items: item.order.items.map((orderItem) => ({
                    ...orderItem,
                    status: "Processing",
                  })),
                },
              };
            }
            return item;
          })
        );

        // Update paginated items as well to ensure UI consistency
        setPaginatedItems((prevItems) =>
          prevItems.map((item) => {
            if (
              item.order?.items?.[0]?.status === "Pending" &&
              pendingOrderIds.includes(item.order?.id)
            ) {
              return {
                ...item,
                order: {
                  ...item.order,
                  items: item.order.items.map((orderItem) => ({
                    ...orderItem,
                    status: "Processing",
                  })),
                },
              };
            }
            return item;
          })
        );

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `${pendingOrderIds.length} orders have been updated to "Processing" status`,
          timer: 2000,
        });

        // Always refresh data after status update to ensure UI shows updated status
        // and prevents re-downloading the same orders
        setTimeout(() => {
          fetchOrderData();
        }, 100); // Small delay to ensure state updates are processed
      } catch (error) {
        console.error("Error updating order statuses:", error);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update some order statuses. Please check the console for details.",
        });
      }
    }
  };

  const paginate = useCallback((pageNumber) => {
    if (pageNumber !== currentPage && !loading) {
      setCurrentPage(pageNumber);
      // fetchOrderData will be called automatically due to useEffect dependency
    }
  }, [currentPage, loading]);

  const handleRefresh = () => {
    fetchOrderData();
    setHasNewRequests(false);
    setNewRequestsCount(0);
  };

  // Handle modal open/close to control notifications
  const handleModalOpen = () => {
    setOpen(true);
    // Clear notifications when modal opens (user has viewed the orders)
    setHasNewRequests(false);
    setNewRequestsCount(0);
    if (newRequestsTimerRef.current) {
      clearTimeout(newRequestsTimerRef.current);
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    // Notifications will resume for new orders when modal is closed
  };

  // totalPages is now set from server response

  const getRowColor = (productName) => {
    if (!productName) return "";
    const name = productName.toUpperCase();
    if (name.includes("AIRTEL TIGO")) {
      return "bg-blue-300";
    }
    if (name.includes("MTN")) {
      return "bg-yellow-100";
    }
    if (name.includes("TELECEL")) {
      return "bg-red-300";
    }
    return "";
  };

  // Calculate statistics
  const pendingCount = allItems.filter(
    (item) => item.order?.items?.[0]?.status === "Pending"
  ).length;
  const completedCount = allItems.filter(
    (item) => item.order?.items?.[0]?.status === "Completed"
  ).length;
  const processingCount = allItems.filter(
    (item) => item.order?.items?.[0]?.status === "Processing"
  ).length;

  // Update hasNewRequests based on pending orders
  const hasPendingOrders = pendingCount > 0;

  return (
    <>
      <div
        className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 w-full md:w-auto flex-1 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition duration-300 relative"
        onClick={() => {
          resetAllFilters(); // Reset filters before opening
          setCurrentPage(1); // Reset to first page
          handleModalOpen();
          fetchOrderData();
        }}
      >
        <FileText className="w-12 h-12 text-purple-500" />
        <div>
          <h3 className="text-xl font-semibold">Total Requests</h3>
          <p className="text-lg font-bold">
            {hasPendingOrders ? "New Order" : "No New Order"}
          </p>
          {hasPendingOrders && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold animate-pulse">
              New
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleCloseModal}
        className="fixed inset-0 flex items-center justify-center sm:justify-end bg-black bg-opacity-50 sm:pr-20"
      >
        <div className="overflow-x-auto bg-white p-6 rounded shadow-lg w-[95%] sm:w-[80%] h-[90%]">
          {/* Header with stats */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">
              Requests Dashboard
            </h2>

            <div className="flex space-x-2 mb-2 md:mb-0">
              <div className="bg-blue-100 p-2 rounded-md">
                <span className="font-bold text-blue-700">{pendingCount}</span>{" "}
                Pending
              </div>
              <div className="bg-yellow-100 p-2 rounded-md">
                <span className="font-bold text-yellow-700">
                  {processingCount}
                </span>{" "}
                Processing
              </div>
              <div className="bg-green-100 p-2 rounded-md">
                <span className="font-bold text-green-700">
                  {completedCount}
                </span>{" "}
                Completed
              </div>
              {/* {newRequestsCount > 0 && (
                <div className="bg-red-100 p-2 rounded-md animate-pulse">
                  <span className="font-bold text-red-700">
                    {newRequestsCount}
                  </span>{" "}
                  New
                </div>
              )} */}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 flex items-center"
                title="Refresh Data"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <label htmlFor="autoRefresh" className="text-sm">
                  Auto-refresh
                </label>
              </div>


              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notificationsEnabled}
                  onChange={() =>
                    setNotificationsEnabled(!notificationsEnabled)
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor="notifications"
                  className="text-sm flex items-center"
                >
                  <Bell className="w-4 h-4 mr-1" /> Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Last updated indicator */}
          <div className="text-xs text-gray-500 mb-2 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last updated:{" "}
            {lastFetchTime
              ? new Date(lastFetchTime).toLocaleTimeString()
              : "Never"}
          </div>

          {/* New Requests Toggle */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="newRequestsToggle"
              checked={showNewRequestsOnly}
              onChange={() => {
                setShowNewRequestsOnly(!showNewRequestsOnly);
                setCurrentPage(1); // Reset to first page
                fetchOrderData(); // Fetch new data with updated filter
              }}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label htmlFor="newRequestsToggle" className="ml-2 font-medium">
              Show only new requests (last 5 mins)
            </label>
          </div>

          <div className="overflow-x-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow-md rounded-lg p-4 space-y-3 md:space-y-0 md:space-x-4 flex-wrap">
              {/* Order ID Filter - New Addition */}
              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="orderIdFilter"
                  className="font-medium text-gray-700"
                >
                  Order ID:
                </label>
                <input
                  type="text"
                  id="orderIdFilter"
                  value={orderIdFilter}
                  onChange={(e) => {
                    setOrderIdFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  placeholder="Enter order ID"
                  className="border p-2 rounded-md w-full md:w-auto"
                />
              </div>

              {/* Phone Number Filter */}
              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="phoneNumberFilter"
                  className="font-medium text-gray-700"
                >
                  Phone:
                </label>
                <input
                  type="text"
                  id="phoneNumberFilter"
                  value={phoneNumberFilter}
                  onChange={(e) => {
                    setPhoneNumberFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  placeholder="Enter phone number"
                  className="border p-2 rounded-md w-full md:w-auto"
                />
              </div>

              {/* Product Filter */}
              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="productFilter"
                  className="font-medium text-gray-700"
                >
                  Product:
                </label>
                <select
                  id="productFilter"
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="border p-2 rounded-md w-full md:w-auto"
                >
                  <option value="">All Products</option>
                  <option value="MTN">MTN</option>
                  <option value="MTN - PREMIUM">MTN - PREMIUM</option>
                  <option value="MTN - SUPER">MTN - SUPER</option>
                  <option value="MTN - NORMAL">MTN - NORMAL</option>
                  <option value="MTN - OTHER">MTN - OTHER</option>
                  <option value="TELECEL">TELECEL</option>
                  <option value="TELECEL - PREMIUM">TELECEL - PREMIUM</option>
                  <option value="TELECEL - SUPER">TELECEL - SUPER</option>
                  <option value="TELECEL - NORMAL">TELECEL - NORMAL</option>
                  <option value="TELECEL - OTHER">TELECEL - OTHER</option>
                  <option value="AIRTEL TIGO">AIRTEL TIGO</option>
                  <option value="AIRTEL TIGO - PREMIUM">AIRTEL TIGO - PREMIUM</option>
                  <option value="AIRTEL TIGO - SUPER">AIRTEL TIGO - SUPER</option>
                  <option value="AIRTEL TIGO - NORMAL">AIRTEL TIGO - NORMAL</option>
                  <option value="AIRTEL TIGO - OTHER">AIRTEL TIGO - OTHER</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="statusFilter"
                  className="font-medium text-gray-700"
                >
                  Status:
                </label>
                <select
                  id="statusFilter"
                  value={selectedStatusMain}
                  onChange={(e) => {
                    setSelectedStatusMain(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="border p-2 rounded-md w-full md:w-auto"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="dateFilter"
                  className="font-medium text-gray-700"
                >
                  Date:
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="border p-2 rounded-md w-full md:w-auto"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="startTimeFilter"
                  className="font-medium text-gray-700 whitespace-nowrap"
                >
                  Start Time:
                </label>
                <input
                  type="time"
                  id="startTimeFilter"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="border p-2 rounded-md w-full md:w-auto"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="endTimeFilter"
                  className="font-medium text-gray-700 whitespace-nowrap"
                >
                  End Time:
                </label>
                <input
                  type="time"
                  id="endTimeFilter"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="border p-2 rounded-md w-full md:w-auto"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3 w-full md:w-auto">
                <label
                  htmlFor="sortOrder"
                  className="font-medium text-gray-700"
                >
                  Sort:
                </label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1); // Reset to first page on sort change
                fetchOrderData(); // Fetch new data with updated sort
                  }}
                  className="border p-2 rounded-md w-full md:w-auto"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          <>
              <div className="flex justify-between mt-4">
              <button
                onClick={handleModalClose}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={handleBatchCompleteProcessing}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                title="Mark all Processing orders as Completed"
              >
                <CheckSquare className="mr-2 w-5 h-5" />
                Complete All Processing
              </button>
              <button
                onClick={handleDownloadExcel}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Download Excel
              </button>
            </div>

              <div className="mt-4 text-sm text-gray-600">
                Showing {itemsPerPage} of {paginatedItems.length} results (Page {currentPage} of {totalPages})
              </div>

              <VirtualizedTable 
                loading={loading}
                items={paginatedItems}
                visibleRange={visibleRange}
                setVisibleRange={setVisibleRange}
                getRowColor={getRowColor}
                handleViewClickStatus={handleViewClickStatus}
                handleUpdateStatus={handleUpdateStatus}
              />
          </>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded border ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded border ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </Dialog>

      {/* Status update modal */}
      <Dialog
        open={isOpenStatus}
        onClose={() => setIsOpenStatus(false)}
        className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <Dialog.Title className="text-lg font-semibold">
            Update Order Status
          </Dialog.Title>
          <Dialog.Description className="text-gray-600">
            Select a status for order <strong>#{selectedOrderId}</strong>.
          </Dialog.Description>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              className="w-full mt-2 p-2 border rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded-md"
              onClick={() => setIsOpenStatus(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={handleSubmit}
            >
              Update
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

// Virtualized Table Component for handling large datasets efficiently
const VirtualizedTable = memo(({ loading, items, visibleRange, setVisibleRange, getRowColor, handleViewClickStatus, handleUpdateStatus }) => {
  const containerRef = useRef(null);
  const ROW_HEIGHT = 60; // Approximate height of each row in pixels
  const BUFFER_SIZE = 10; // Extra rows to render outside visible area

  // Calculate visible items based on scroll position
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const containerHeight = e.target.clientHeight;
    
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_SIZE,
      items.length
    );
    
    const newStart = Math.max(0, startIndex - BUFFER_SIZE);
    const newEnd = endIndex;
    
    // Only update if range changed significantly to avoid excessive re-renders
    if (Math.abs(newStart - visibleRange.start) > 5 || Math.abs(newEnd - visibleRange.end) > 5) {
      setVisibleRange({ start: newStart, end: newEnd });
    }
  }, [items.length, visibleRange.start, visibleRange.end, setVisibleRange]);

  // Throttled scroll handler to improve performance
  const throttledScrollHandler = useMemo(() => {
    let timeoutId;
    return (e) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(e), 16); // ~60fps
    };
  }, [handleScroll]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * ROW_HEIGHT;
  const offsetY = visibleRange.start * ROW_HEIGHT;

  if (loading) {
    return (
      <div className="w-full h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] overflow-y-auto mt-4" 
         ref={containerRef}
         onScroll={throttledScrollHandler}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <table className="w-full border-collapse border border-gray-300 text-sm md:text-base">
          <thead className="bg-sky-700 text-white sticky top-0 z-10">
            <tr>
              <th className="border p-2 whitespace-nowrap">Order ID</th>
              <th className="border p-2 whitespace-nowrap">Item ID</th>
              <th className="border p-2 whitespace-nowrap">Username</th>
              <th className="border p-2 whitespace-nowrap">Phone Number</th>
              <th className="border p-2 whitespace-nowrap">Status</th>
              <th className="border p-2 whitespace-nowrap">Name</th>
              <th className="border p-2 whitespace-nowrap">Description</th>
              <th className="border p-2 whitespace-nowrap">Date</th>
              <th className="border p-2 whitespace-nowrap">Time</th>
              <th className="border p-2 whitespace-nowrap">Price</th>
              <th className="border p-2 whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>
          <tbody style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.length > 0 ? (
              visibleItems.map((item, index) => (
                <TableRow
                  key={`${item.id}-${item.orderId}-${visibleRange.start + index}`}
                  item={item}
                  index={visibleRange.start + index}
                  getRowColor={getRowColor}
                  handleViewClickStatus={handleViewClickStatus}
                  handleUpdateStatus={handleUpdateStatus}
                />
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center p-4">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TotalRequestsComponent;

// Memoized table row component to prevent unnecessary re-renders
const TableRow = memo(({ item, index, getRowColor, handleViewClickStatus, handleUpdateStatus }) => {
  return (
    <tr
      className={`hover:bg-gray-100 text-black ${
        item.order?.items?.[0]?.status === "Cancelled"
          ? "bg-red-700 text-white"
          : getRowColor(item.product?.name)
      }`}
    >
      <td className="border px-2 py-2 md:px-4">
        {item.orderId || "N/A"}
      </td>
      <td className="border px-2 py-2 md:px-4">
        {item.id || "N/A"}
      </td>
      <td className="border px-2 py-2 md:px-4">
        {item.user?.name || "N/A"}
      </td>
      <td className="border px-2 py-2 md:px-4">
        {item?.mobileNumber || "N/A"}
      </td>
      <td className="border px-2 py-2 md:px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.order?.items?.[0]?.status === "Completed"
              ? "bg-green-100 text-green-800"
              : item.order?.items?.[0]?.status === "Processing"
              ? "bg-yellow-100 text-yellow-800"
              : item.order?.items?.[0]?.status === "Cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {item.order?.items?.[0]?.status || "N/A"}
        </span>
      </td>
      <td className="border px-2 py-2 md:px-4 whitespace-nowrap">
        {item.product?.name || "N/A"}
      </td>
      <td className="border px-2 py-2 md:px-4 font-semibold">
        {item.product?.description
          ? item.product.description.replace(/\D+$/, "")
          : "N/A"}{" "}
        GB
      </td>
      <td className="border px-2 py-2 md:px-4 whitespace-nowrap">
        {item.order?.createdAt
          ? new Date(item.order.createdAt).toISOString().split("T")[0]
          : "N/A"}
      </td>
      <td className="border px-2 py-2 md:px-4 whitespace-nowrap">
        {item.order?.createdAt
          ? new Date(item.order.createdAt).toLocaleTimeString()
          : "N/A"}
      </td>
      <td
        className={`border px-4 py-2 text-left whitespace-nowrap ${
          item.order?.items?.[0]?.status === "Cancelled"
            ? "text-red-800 font-bold"
            : item.product?.price >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        GH₵ {item.product?.price || 0}
      </td>
      <td className="border px-2 py-2 md:px-4 text-center flex items-center justify-center space-x-2">
        <button
          className={`text-blue-500 hover:text-blue-700 mr-2 ${
            item.order?.items?.[0]?.status === "Cancelled"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => handleViewClickStatus(item.id)}
          disabled={item.order?.items?.[0]?.status === "Cancelled"}
        >
          <SpellCheck className="w-5 h-5" />
        </button>
        <button
          className={`text-green-500 hover:text-green-700 ${
            item.order?.items?.[0]?.status === "Cancelled"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => handleUpdateStatus(item.order?.id)}
          title="Mark as Completed"
          disabled={item.order?.items?.[0]?.status === "Cancelled"}
        >
          <Check className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
});