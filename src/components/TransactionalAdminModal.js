import { Fragment, useEffect, useState, useMemo, useCallback, memo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { ArrowRightLeft, Download, Search } from "lucide-react";

// Memoized Tabs Component
const Tabs = memo(({ tabs, activeTab, setActiveTab }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
            activeTab === tab.id
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab.name}
        </button>
      ))}
    </nav>
  </div>
));

// Optimized virtualization hook with better calculations
const useVirtualization = (items, containerHeight = 400, itemHeight = 50) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 2,
    items.length
  );

  const visibleItems = useMemo(() => 
    items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return { visibleItems, totalHeight, offsetY, onScroll, startIndex };
};

// Pre-calculate format functions to avoid recreation
const formatAmount = (amount) => 
  `GH₵ ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) => new Date(dateString).toLocaleString();

// Highly optimized transaction row with minimal re-renders
const TransactionRow = memo(({ tx, index, style }) => {
  const isRejected = tx.type === "TOPUP_REJECTED" || 
    (tx.description && tx.description.includes("Top-up rejected"));

  // Pre-calculated styles to avoid inline calculations
  const typeColorClass = useMemo(() => {
    const colors = {
      TOPUP_APPROVED: "bg-green-100 text-green-800",
      TOPUP_REJECTED: "bg-red-100 text-red-800",
      ORDER: "bg-blue-100 text-blue-800",
      LOAN_DEDUCTION: "bg-red-100 text-red-800",
      CART_ADD: "bg-orange-100 text-orange-800",
      CART_REMOVE: "bg-purple-100 text-purple-800",
      LOAN_STATUS: "bg-yellow-100 text-yellow-800",
      TOPUP_REQUEST: "bg-gray-100 text-gray-800",
    };
    return colors[tx.type] || "";
  }, [tx.type]);

  const rowBgClass = isRejected
    ? "bg-red-50 hover:bg-red-100"
    : index % 2 === 0
    ? "bg-white hover:bg-blue-50"
    : "bg-gray-50 hover:bg-blue-50";

  const textColorClass = isRejected
    ? "text-red-600"
    : tx.amount >= 0
    ? "text-green-600"
    : "text-red-600";

  const showPreviousBalance = ["REFUND", "TOPUP_APPROVED", "ORDER", "ORDER_ITEM_STATUS"].includes(tx.type);

  return (
    <tr className={rowBgClass} style={style}>
      <td className={`border px-4 py-2 text-xs font-semibold ${typeColorClass} w-32`}>
        {tx.type}
      </td>
      <td className={`border px-4 py-2 ${textColorClass} w-80`}>
        {tx.description}
      </td>
      <td className={`border px-4 py-2 whitespace-nowrap ${textColorClass} w-32`}>
        {formatAmount(tx.amount)}
      </td>
      <td className={`border px-4 py-2 whitespace-nowrap ${
        tx.balance >= 0 ? "text-green-600" : "text-red-600"
      } w-32`}>
        {formatAmount(tx.balance)}
      </td>
      <td className={`border px-4 py-2 whitespace-nowrap w-32 ${
        showPreviousBalance ? "text-blue-700" : "text-gray-400"
      }`}>
        {showPreviousBalance ? formatAmount(tx.previousBalance || 0) : "—"}
      </td>
      <td className={`border px-4 py-2 ${isRejected ? "text-red-600" : ""} w-40`}>
        {tx.user?.name || "Unknown"}
      </td>
      <td className={`border px-4 py-2 whitespace-nowrap ${
        isRejected ? "text-red-600" : ""
      } w-48`}>
        {formatDate(tx.createdAt)}
      </td>
    </tr>
  );
});

// Memoized User Sales Summary Component
const UserSalesSummary = memo(({ userSales }) => (
  <div className="bg-white border rounded-lg p-4 mb-4">
    <h3 className="text-lg font-semibold mb-3 text-gray-900">
      Sales Summary by User
    </h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left border">User</th>
            <th className="px-4 py-2 text-right border">Total Orders</th>
            <th className="px-4 py-2 text-right border">Total Sales Amount</th>
            <th className="px-4 py-2 text-right border">Avg Order Value</th>
            <th className="px-4 py-2 text-right border">Current Balance</th>
          </tr>
        </thead>
        <tbody>
          {userSales.map((user, index) => (
            <tr key={user.userName} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-2 border font-medium">{user.userName}</td>
              <td className="px-4 py-2 border text-right">{user.orderCount}</td>
              <td className="px-4 py-2 border text-right font-semibold text-blue-600">
                {formatAmount(Math.abs(user.totalSales))}
              </td>
              <td className="px-4 py-2 border text-right">
                {formatAmount(Math.abs(user.totalSales / user.orderCount))}
              </td>
              <td className="px-4 py-2 border text-right">
                {formatAmount(Math.abs(user.loanBalance))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));

// Memoized Admin Balance Sheet Component  
const AdminBalanceSheet = memo(({ balanceData }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
    <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm mr-3">
        Admin
      </span>
      Balance Sheet Summary
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-green-200">
        <div className="text-sm text-green-800 font-medium">Total Revenue (Sales)</div>
        <div className="text-2xl font-bold text-green-600">
          {formatAmount(balanceData.totalRevenue)}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800 font-medium">Total Top-ups</div>
        <div className="text-2xl font-bold text-blue-600">
          {formatAmount(balanceData.totalTopups)}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-teal-200">
        <div className="text-sm text-teal-800 font-medium">Total Refunds</div>
        <div className="text-2xl font-bold text-teal-600">
          {formatAmount(balanceData.totalRefunds)}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800 font-medium whitespace-nowrap">
          Total Top-ups + Refunds
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {formatAmount(balanceData.totalTopupsAndRefunds)}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-red-200">
        <div className="text-sm text-red-800 font-medium">Total Expenses</div>
        <div className="text-2xl font-bold text-red-600">
          {formatAmount(Math.abs(balanceData.totalExpenses))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-purple-200">
        <div className="text-sm text-purple-800 font-medium">Previous Balance</div>
        <div className={`text-2xl font-bold ${
          balanceData.netPosition >= 0 ? "text-green-600" : "text-red-600"
        }`}>
          {formatAmount(balanceData.previousBalance || 0)}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-700 mb-2">Transaction Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Orders:</span>
            <span className="font-medium">{balanceData.orderCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Approved Top-ups:</span>
            <span className="font-medium">{balanceData.topupCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Refunds:</span>
            <span className="font-medium text-teal-700">{balanceData.refundCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Rejected Top-ups:</span>
            <span className="font-medium text-red-600">{balanceData.rejectedTopupCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Loan Deductions:</span>
            <span className="font-medium">{balanceData.loanCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-700 mb-2">Cash Flow Analysis</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Money In:</span>
            <span className="font-medium text-green-600">
              {formatAmount(balanceData.totalCredits)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Money Out:</span>
            <span className="font-medium text-red-600">
              {formatAmount(Math.abs(balanceData.totalDebits))}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Net Cash Flow:</span>
            <span className={`font-bold ${
              balanceData.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatAmount(balanceData.netCashFlow)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-700 mb-2">Key Metrics</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Avg Order Value:</span>
            <span className="font-medium">
              {balanceData.orderCount > 0
                ? formatAmount(balanceData.totalRevenue / balanceData.orderCount)
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Users:</span>
            <span className="font-medium">{balanceData.activeUsers}</span>
          </div>
          <div className="flex justify-between">
            <span>Success Rate:</span>
            <span className="font-medium text-green-600">
              {balanceData.topupCount + balanceData.rejectedTopupCount > 0
                ? `${((balanceData.topupCount / 
                    (balanceData.topupCount + balanceData.rejectedTopupCount)) * 100).toFixed(1)}%`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

// Memoized Stats Cards Component
const StatsCards = memo(({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div className="text-sm text-blue-800">Total Transactions</div>
      <div className="font-bold text-lg">{stats.totalTransactions}</div>
    </div>
    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
      <div className="text-sm text-green-800">Total Credits</div>
      <div className="font-bold text-lg">{formatAmount(stats.totalCredits)}</div>
    </div>
    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
      <div className="text-sm text-red-800">Total Debits</div>
      <div className="font-bold text-lg">{formatAmount(Math.abs(stats.totalDebits))}</div>
    </div>
    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
      <div className="text-sm text-purple-800">Net Balance Change</div>
      <div className="font-bold text-lg">{formatAmount(stats.netBalance)}</div>
    </div>
  </div>
));

const TransactionalAdminModal = () => {
  const tabs = [
    { id: 'transactions', name: 'Transactions' },
    { id: 'sales', name: 'Sales Summary' },
    { id: 'balance', name: 'Admin Balance Sheet' },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amountFilter, setAmountFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);

  // Debounced search with faster timeout
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 150); // Reduced from 300ms
    return () => clearTimeout(timer);
  }, [search]);

  // Optimized fetchTransactions with caching
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let url = BASE_URL + "/api/transactions";
      const queryParams = [];

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        queryParams.push(`startDate=${start.toISOString()}`);
        queryParams.push(`endDate=${end.toISOString()}`);
      }

      if (typeFilter) {
        queryParams.push(`type=${typeFilter}`);
      }

      queryParams.push(`page=${currentPage}`);
      queryParams.push(`limit=${itemsPerPage}`);

      if (queryParams.length > 0) {
        url += "?" + queryParams.join("&");
      }

      const response = await axios.get(url);
      const data = response.data.data || [];
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
    setLoading(false);
  }, [startDate, endDate, typeFilter, currentPage, itemsPerPage]);

  // Highly optimized filtered transactions with better memoization
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    let filtered = transactions;

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    if (amountFilter !== "all") {
      filtered = amountFilter === "positive" 
        ? filtered.filter((tx) => tx.amount >= 0)
        : filtered.filter((tx) => tx.amount < 0);
    }

    // Default sort by date desc (most recent first) - no additional sorting needed
    return filtered;
  }, [transactions, debouncedSearch, amountFilter]);

  // Optimized user sales data calculation
  const userSalesData = useMemo(() => {
    if (!filteredTransactions.length) return [];
    
    const salesByUser = new Map();
    const latestBalanceByUser = new Map();

    // Single pass through transactions for better performance
    filteredTransactions.forEach((tx) => {
      const userName = tx.user?.name;
      if (!userName) return;

      // Track latest balance
      const existing = latestBalanceByUser.get(userName);
      if (!existing || new Date(tx.createdAt) > new Date(existing.createdAt)) {
        latestBalanceByUser.set(userName, { balance: tx.balance || 0, createdAt: tx.createdAt });
      }

      // Track sales
      if (tx.type === "ORDER") {
        const userSales = salesByUser.get(userName) || {
          userName,
          totalSales: 0,
          orderCount: 0,
          loanBalance: 0,
        };
        userSales.totalSales += tx.amount;
        userSales.orderCount += 1;
        salesByUser.set(userName, userSales);
      }
    });

    // Attach current balance
    for (const [userName, userSales] of salesByUser) {
      const balanceInfo = latestBalanceByUser.get(userName);
      userSales.loanBalance = balanceInfo?.balance || 0;
    }

    return Array.from(salesByUser.values()).sort(
      (a, b) => Math.abs(b.totalSales) - Math.abs(a.totalSales)
    );
  }, [filteredTransactions]);

  // Optimized admin balance data calculation
  const adminBalanceData = useMemo(() => {
    if (!filteredTransactions.length) return {
      totalRevenue: 0, totalTopups: 0, totalExpenses: 0,
      totalCredits: 0, totalDebits: 0, orderCount: 0,
      topupCount: 0, rejectedTopupCount: 0, loanCount: 0,
      activeUsers: 0, netPosition: 0, netCashFlow: 0,
      totalRefunds: 0, refundCount: 0, previousBalance: 0,
      totalTopupsAndRefunds: 0
    };

    const data = {
      totalRevenue: 0, totalTopups: 0, totalExpenses: 0,
      totalCredits: 0, totalDebits: 0, orderCount: 0,
      topupCount: 0, rejectedTopupCount: 0, loanCount: 0,
      activeUsers: new Set(), netPosition: 0, netCashFlow: 0,
      totalRefunds: 0, refundCount: 0, previousBalance: 0,
      totalTopupsAndRefunds: 0
    };

    // Single pass calculation
    filteredTransactions.forEach((tx) => {
      if (tx.user?.name) {
        data.activeUsers.add(tx.user.name);
      }

      if (tx.amount > 0) {
        data.totalCredits += tx.amount;
      } else {
        data.totalDebits += tx.amount;
      }

      switch (tx.type) {
        case "ORDER":
          data.totalRevenue += Math.abs(tx.amount);
          data.orderCount += 1;
          break;
        case "TOPUP_APPROVED":
          data.totalTopups += tx.amount;
          data.topupCount += 1;
          break;
        case "REFUND":
          data.totalRefunds += tx.amount;
          data.refundCount += 1;
          break;
        case "TOPUP_REJECTED":
          data.rejectedTopupCount += 1;
          break;
        case "LOAN_DEDUCTION":
          data.totalExpenses += Math.abs(tx.amount);
          data.loanCount += 1;
          break;
        case "CART_ADD":
        case "CART_REMOVE":
          data.totalExpenses += Math.abs(tx.amount);
          break;
      }
    });

    data.activeUsers = data.activeUsers.size;
    data.netPosition = data.totalRevenue + data.totalTopups - data.totalExpenses;
    data.netCashFlow = data.totalCredits + data.totalDebits;
    data.totalTopupsAndRefunds = data.totalTopups + data.totalRefunds;

    // Calculate previousBalance (simplified for performance)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const transactionsBefore12am = transactions.filter(tx => 
      new Date(tx.createdAt) < today
    );

    if (debouncedSearch) {
      const userName = debouncedSearch.toLowerCase();
      const userTxs = transactionsBefore12am.filter(tx => 
        tx.user?.name?.toLowerCase().includes(userName)
      );
      const latestUserTx = userTxs.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      data.previousBalance = latestUserTx ? latestUserTx.balance : 0;
    } else {
      const latestByUser = new Map();
      transactionsBefore12am.forEach(tx => {
        const uname = tx.user?.name;
        if (!uname) return;
        const existing = latestByUser.get(uname);
        if (!existing || new Date(tx.createdAt) > new Date(existing.createdAt)) {
          latestByUser.set(uname, tx);
        }
      });
      data.previousBalance = Array.from(latestByUser.values())
        .reduce((sum, tx) => sum + (tx.balance || 0), 0);
    }

    return data;
  }, [filteredTransactions, transactions, debouncedSearch]);

  // Optimized statistics calculation
  const stats = useMemo(() => {
    if (!filteredTransactions.length) return {
      totalTransactions: 0, totalCredits: 0, 
      totalDebits: 0, netBalance: 0
    };

    let totalCredits = 0;
    let totalDebits = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.amount > 0) {
        totalCredits += tx.amount;
      } else {
        totalDebits += tx.amount;
      }
    });

    return {
      totalTransactions: filteredTransactions.length,
      totalCredits,
      totalDebits,
      netBalance: totalCredits + totalDebits,
    };
  }, [filteredTransactions]);

  // Optimized virtualization
  const { visibleItems, totalHeight, offsetY, onScroll, startIndex } = useVirtualization(
    filteredTransactions, 400, 50
  );

  const openModal = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setEndDate(today);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);

    setCurrentPage(1);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  const resetFilters = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setSearch("");
    setTypeFilter("");
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setEndDate(today);
    setAmountFilter("all");
    setCurrentPage(1);
  }, []);

  const exportToCSV = useCallback(async () => {
    setExportLoading(true);
    try {
      let csvContent = "";

      if (activeTab === "sales") {
        const headers = ["User", "Total Orders", "Total Sales Amount", "Average Order Value"];
        const rows = userSalesData.map((user) => [
          user.userName,
          user.orderCount,
          Math.abs(user.totalSales),
          Math.abs(user.totalSales / user.orderCount),
        ]);
        csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      } else if (activeTab === "balance") {
        const headers = ["Metric", "Value"];
        const rows = [
          ["Total Revenue", adminBalanceData.totalRevenue],
          ["Total Top-ups", adminBalanceData.totalTopups],
          ["Total Expenses", Math.abs(adminBalanceData.totalExpenses)],
          ["Net Position", adminBalanceData.netPosition],
          ["Total Orders", adminBalanceData.orderCount],
          ["Active Users", adminBalanceData.activeUsers],
          ["Success Rate (%)", 
            adminBalanceData.topupCount + adminBalanceData.rejectedTopupCount > 0
              ? ((adminBalanceData.topupCount / 
                  (adminBalanceData.topupCount + adminBalanceData.rejectedTopupCount)) * 100).toFixed(1)
              : 0],
        ];
        csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      } else {
        const headers = ["Type", "Description", "Amount", "Balance", "User", "Date"];
        const rows = filteredTransactions.map((tx) => [
          tx.type,
          `"${tx.description || ""}"`,
          tx.amount,
          tx.balance,
          tx.user?.name || "Unknown",
          new Date(tx.createdAt).toLocaleString(),
        ]);
        csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export data", err);
    }
    setExportLoading(false);
  }, [filteredTransactions, userSalesData, adminBalanceData, activeTab]);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, fetchTransactions]);

  const transactionTypes = [
    "TOPUP_APPROVED", "ORDER", "LOAN_DEDUCTION", 
    "CART_ADD", "CART_REMOVE", "LOAN_STATUS", "TOPUP_REQUEST"
  ];

  return (
    <div className="">
      <li
        className="flex items-center space-x-3 p-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600"
        onClick={openModal}
      >
        <ArrowRightLeft className="w-5 h-5" />
        <div>Show Transactions</div>
      </li>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-white rounded-lg w-11/12 max-w-7xl h-[90vh] overflow-y-auto p-4 flex flex-col">
                  <Dialog.Title as="div" className="text-xl font-bold text-gray-900 mb-4 flex justify-between items-center sticky top-0 bg-white p-4 z-20 border-b">
                    <span>Transactional Overview</span>
                    <button
                      onClick={exportToCSV}
                      disabled={exportLoading}
                      className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {exportLoading ? "Exporting..." : `Export ${activeTab}`}
                    </button>
                  </Dialog.Title>

                  <div className="flex-grow overflow-y-auto px-4">
                    <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="mt-6">
                      {activeTab === "transactions" && (
                        <>
                          {/* Optimized Filters */}
                          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                            <div className="flex flex-col lg:flex-row gap-4">
                              {/* Date Range Section */}
                              <div className="flex flex-col sm:flex-row gap-3 lg:border-r lg:border-gray-200 lg:pr-6">
                                <div className="flex flex-col">
                                  <label className="text-sm font-medium text-gray-700 mb-1">From</label>
                                  <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-sm font-medium text-gray-700 mb-1">To</label>
                                  <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                  />
                                </div>
                              </div>

                              {/* Filters Section */}
                              <div className="flex flex-col sm:flex-row gap-3 lg:border-r lg:border-gray-200 lg:pr-6">
                                <div className="flex flex-col">
                                  <label className="text-sm font-medium text-gray-700 mb-1">Type</label>
                                  <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                                  >
                                    <option value="">All Types</option>
                                    {transactionTypes.map((type) => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-sm font-medium text-gray-700 mb-1">Amount</label>
                                  <select
                                    value={amountFilter}
                                    onChange={(e) => setAmountFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                                  >
                                    <option value="all">All Amounts</option>
                                    <option value="positive">Credits Only</option>
                                    <option value="negative">Debits Only</option>
                                  </select>
                                </div>
                              </div>

                              {/* Search Section */}
                              <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Search by user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                  />
                                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats Cards */}
                          <StatsCards stats={stats} />

                          {/* Optimized Virtualized Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <div
                              className="overflow-auto"
                              style={{ height: "450px" }}
                              onScroll={onScroll}
                            >
                              <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                  <tr>
                                    <th className="px-4 py-2 border w-32">Type</th>
                                    <th className="px-4 py-2 border w-80">Description</th>
                                    <th className="px-4 py-2 border w-32">Amount</th>
                                    <th className="px-4 py-2 border w-32 whitespace-nowrap">Current Balance</th>
                                    <th className="px-4 py-2 border w-32 whitespace-nowrap">Previous Balance</th>
                                    <th className="px-4 py-2 border w-40">User</th>
                                    <th className="px-4 py-2 border w-48">Date & Time</th>
                                  </tr>
                                </thead>
                                <tbody style={{ position: "relative", height: `${totalHeight}px` }}>
                                  {loading ? (
                                    <tr>
                                      <td colSpan="7" className="text-center py-12 text-gray-500">
                                        Loading transactions...
                                      </td>
                                    </tr>
                                  ) : (
                                    <>
                                      <div style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        width: '100%', 
                                        transform: `translateY(${offsetY}px)` 
                                      }}>
                                        {visibleItems.map((tx, index) => (
                                          <TransactionRow
                                            key={`${tx.id}-${startIndex + index}`}
                                            tx={tx}
                                            index={startIndex + index}
                                            style={{ height: '50px' }}
                                          />
                                        ))}
                                      </div>
                                      {!filteredTransactions.length && !loading && (
                                        <tr>
                                          <td colSpan="7" className="text-center py-8 text-gray-500">
                                            No transactions found.
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Pagination */}
                          {filteredTransactions.length > 0 && (
                            <div className="flex justify-between items-center mt-4">
                              <div className="text-sm text-gray-600">
                                Showing {Math.min(itemsPerPage, filteredTransactions.length)} of {stats.totalTransactions} transactions
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                  disabled={currentPage === 1}
                                  className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                  Previous
                                </button>
                                <span className="px-3 py-1">Page {currentPage}</span>
                                <button
                                  onClick={() => setCurrentPage((p) => p + 1)}
                                  disabled={filteredTransactions.length < itemsPerPage}
                                  className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === "sales" && (
                        <UserSalesSummary userSales={userSalesData} />
                      )}

                      {activeTab === "balance" && (
                        <AdminBalanceSheet balanceData={adminBalanceData} />
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t sticky bottom-0 bg-white p-4 z-20">
                    <button
                      onClick={closeModal}
                      className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default TransactionalAdminModal;