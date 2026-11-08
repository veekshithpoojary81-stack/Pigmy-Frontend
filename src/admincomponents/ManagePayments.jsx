import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  User,
  CreditCard,
  Calendar,
  Loader,
  RefreshCw,
} from "lucide-react";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Adjust based on your backend URL
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    accountId: "",
    amount: "",
    type: "deposit",
    collectedBy: "",
    description: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchCustomersAndCollectors();
  }, []);

  // API functions using axios
  const getAllPayments = async () => {
    try {
      const response = await api.get('/payments');
      return response;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  };

  const updatePaymentStatus = async (paymentId, statusData) => {
    try {
      const response = await api.put(`/payments/${paymentId}/status`, statusData);
      return response;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  };

  const getCustomers = async () => {
    try {
      const response = await api.get('/customers');
      return response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  };

  const getCollectors = async () => {
    try {
      const response = await api.get('/collectors');
      return response;
    } catch (error) {
      console.error("Error fetching collectors:", error);
      throw error;
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  const getAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      return response;
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw error;
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getAllPayments();
      
      if (response.data && response.data.success) {
        // Handle different response structures
        const paymentsData = response.data.data || response.data.payments || [];
        setPayments(paymentsData);
      } else {
        console.error("Unexpected response structure:", response.data);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      alert("Error fetching payments data");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersAndCollectors = async () => {
    try {
      const [customersRes, collectorsRes] = await Promise.all([
        getCustomers(),
        getCollectors(),
      ]);
      
      if (customersRes.data && customersRes.data.success) {
        setCustomers(customersRes.data.data || []);
      }
      
      if (collectorsRes.data && collectorsRes.data.success) {
        setCollectors(collectorsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching customers or collectors:", error);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      
      const paymentData = {
        accountId: paymentForm.accountId,
        amount: parseFloat(paymentForm.amount),
        type: paymentForm.type,
        collectorId: paymentForm.collectedBy,
        description: paymentForm.description,
        status: "completed", // Auto-complete admin payments
        date: new Date().toISOString(),
      };

      const response = await addTransaction(paymentData);

      if (response.data && response.data.success) {
        alert("Payment processed successfully!");
        setShowPaymentModal(false);
        setPaymentForm({
          accountId: "",
          amount: "",
          type: "deposit",
          collectedBy: "",
          description: "",
        });
        fetchPayments(); // Refresh payments list
      } else {
        throw new Error(response.data?.message || "Payment processing failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(error.response?.data?.message || "Error processing payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      setProcessing(true);
      
      const response = await updatePaymentStatus(paymentId, { status: newStatus });
      
      if (response.data && response.data.success) {
        alert(`Payment status updated to ${newStatus}`);
        fetchPayments(); // Refresh the list
      } else {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(error.response?.data?.message || "Error updating payment status");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    return type === "deposit" ? "text-green-600" : "text-red-600";
  };

  const getTypeSymbol = (type) => {
    return type === "deposit" ? "+" : "-";
  };

  // const formatPaymentData = (payment) => {
  //   // Handle different payment object structures from API
  //   return {
  //     _id: payment._id,
  //     accountNumber: payment.accountId?.accountNumber || payment.accountNumber || "N/A",
  //     customerName: payment.customerId?.name || payment.customerName || "Unknown",
  //     customerId: payment.customerId?.customerId || payment.customerId?._id || "N/A",
  //     amount: payment.amount || 0,
  //     type: payment.type || "deposit",
  //     status: payment.status || "pending",
  //     date: payment.date || payment.createdAt || new Date().toISOString(),
  //     collectedBy: payment.collectorId?.name || payment.collectedBy || "Unknown",
  //     description: payment.description || "No description",
  //     referenceNumber: payment.referenceNumber || payment._id,
  //   };
  // };
const formatPaymentData = (payment) => {
  // Handle different payment object structures from API
  return {
    _id: payment._id,
    accountNumber: payment.accountId?.accountNumber || payment.accountNumber || "N/A",
    customerName: payment.customerId?.name || payment.customerName || "Unknown",
    customerId: payment.customerId?.customerId || payment.customerId?._id || "N/A",
    amount: payment.amount || 0,
    type: payment.type || "deposit",
    status: payment.status || "pending",
    date: payment.date || payment.createdAt || new Date().toISOString(),
    collectedBy: payment.collectorId?.name || payment.collectedBy || "Unknown",
    description: payment.description || "No description",
    referenceNumber: payment.referenceNumber || payment._id,
    remarks: payment.remarks || "", // ✅ ADD REMARKS FIELD
  };
};
  const filteredPayments = payments
    .map(formatPaymentData)
    .filter((payment) => {
      const matchesSearch =
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;
      const matchesType = typeFilter === "all" || payment.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

  // const exportPayments = () => {
  //   try {
  //     const csvContent = [
  //       ["Customer Name", "Account Number", "Amount", "Type", "Status", "Date", "Collector", "Reference"],
  //       ...filteredPayments.map(payment => [
  //         payment.customerName,
  //         payment.accountNumber,
  //         payment.amount,
  //         payment.type,
  //         payment.status,
  //         new Date(payment.date).toLocaleDateString(),
  //         payment.collectedBy,
  //         payment.referenceNumber
  //       ])
  //     ].map(row => row.join(",")).join("\n");

  //     const blob = new Blob([csvContent], { type: "text/csv" });
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
  //     link.click();
  //     window.URL.revokeObjectURL(url);
      
  //     alert("Payments data exported successfully!");
  //   } catch (error) {
  //     console.error("Error exporting payments:", error);
  //     alert("Error exporting payments data");
  //   }
  // };
const exportPayments = () => {
  try {
    const csvContent = [
      ["Customer Name", "Account Number", "Amount", "Type", "Status", "Date", "Collector", "Reference", "Remarks"], // ✅ ADD REMARKS
      ...filteredPayments.map(payment => [
        payment.customerName,
        payment.accountNumber,
        payment.amount,
        payment.type,
        payment.status,
        new Date(payment.date).toLocaleDateString(),
        payment.collectedBy,
        payment.referenceNumber,
        payment.remarks || "" // ✅ ADD REMARKS DATA
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert("Payments data exported successfully!");
  } catch (error) {
    console.error("Error exporting payments:", error);
    alert("Error exporting payments data");
  }
};
  const totalCollections = payments
    .filter((p) => p.type === "deposit" && (p.status === "completed" || p.status === "verified"))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalWithdrawals = payments
    .filter((p) => p.type === "withdrawal" && (p.status === "completed" || p.status === "verified"))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  const refreshData = () => {
    fetchPayments();
    fetchCustomersAndCollectors();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Payments</h1>
          <p className="text-gray-600 mt-2">
            Process and monitor customer payments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <button
            onClick={refreshData}
            disabled={processing}
            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${processing ? 'animate-spin' : ''}`} />
            Refresh
          </button> */}
          <button
            onClick={exportPayments}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {payments.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Collections
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
                <IndianRupee className="h-5 w-5 mr-1" />
                {totalCollections.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Withdrawals
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center">
                <IndianRupee className="h-5 w-5 mr-1" />
                {totalWithdrawals.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pendingPayments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, account number, customer ID, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>

          <button 
          hidden
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            New Payment
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead> */}
            <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Customer
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Account
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Collector
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Reference
          </th>
          {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Remarks
          </th>  */}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
            {/* <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.customerId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.accountNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={getTypeColor(payment.type)}>
                      {getTypeSymbol(payment.type)}₹
                      {payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.type === "deposit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                    <div className="text-xs text-gray-500">
                      {new Date(payment.date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.collectedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {payment.referenceNumber.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {payment.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(payment._id, "completed")
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(payment._id, "failed")
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Mark as Failed"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody> */}
            <tbody className="bg-white divide-y divide-gray-200">
  {filteredPayments.map((payment) => (
    <tr key={payment._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {payment.customerName}
            </div>
            <div className="text-sm text-gray-500">
              {payment.customerId}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {payment.accountNumber}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <span className={getTypeColor(payment.type)}>
          {getTypeSymbol(payment.type)}₹
          {payment.amount.toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            payment.type === "deposit"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {payment.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(payment.status)}
          <span
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              payment.status
            )}`}
          >
            {payment.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(payment.date).toLocaleDateString()}
        <div className="text-xs text-gray-500">
          {new Date(payment.date).toLocaleTimeString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {payment.collectedBy}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
        {payment.referenceNumber.substring(0, 8)}...
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs" hidden>
        {payment.remarks ? (
          <div className="group relative">
            <span className="truncate block cursor-help" title={payment.remarks}>
              {payment.remarks.length > 30 
                ? `${payment.remarks.substring(0, 30)}...` 
                : payment.remarks
              }
            </span>
            {/* Tooltip for full remarks */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
              <div  className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {payment.remarks}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic">No remarks</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPayment(payment)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {payment.status === "pending" && (
            <>
              <button
                onClick={() =>
                  handleStatusUpdate(payment._id, "completed")
                }
                className="text-green-600 hover:text-green-900"
                title="Mark as Completed"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(payment._id, "failed")
                }
                className="text-red-600 hover:text-red-900"
                title="Mark as Failed"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No payments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {payments.length === 0
                ? "No payments have been processed yet."
                : "Try adjusting your search filters."}
            </p>
          </div>
        )}
      </div>
      

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Process New Payment
              </h2>

              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Account
                  </label>
                  <select
                    required
                    value={paymentForm.accountId}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, accountId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Customer Account</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.customerId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    required
                    value={paymentForm.type}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collected By
                  </label>
                  <select
                    required
                    value={paymentForm.collectedBy}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        collectedBy: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Collector</option>
                    {collectors.map((collector) => (
                      <option key={collector._id} value={collector._id}>
                        {collector.name} - {collector.area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment description..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentForm({
                        accountId: "",
                        amount: "",
                        type: "deposit",
                        collectedBy: "",
                        description: "",
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {processing ? "Processing..." : "Process Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {/* {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Details
                </h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Customer:</span>
                  <span className="text-sm text-gray-900">{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Account:</span>
                  <span className="text-sm text-gray-900">{selectedPayment.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className={`text-sm font-medium ${getTypeColor(selectedPayment.type)}`}>
                    {getTypeSymbol(selectedPayment.type)}₹{selectedPayment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900 capitalize">{selectedPayment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`text-sm ${getStatusColor(selectedPayment.status)} px-2 py-1 rounded-full`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedPayment.date).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Collector:</span>
                  <span className="text-sm text-gray-900">{selectedPayment.collectedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Reference:</span>
                  <span className="text-sm text-gray-900 font-mono">{selectedPayment.referenceNumber}</span>
                </div>
                {selectedPayment.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )} */}
      {/* Payment Details Modal */}
{selectedPayment && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h2>
          <button
            onClick={() => setSelectedPayment(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Customer:</span>
            <span className="text-sm text-gray-900">{selectedPayment.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Account:</span>
            <span className="text-sm text-gray-900">{selectedPayment.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Amount:</span>
            <span className={`text-sm font-medium ${getTypeColor(selectedPayment.type)}`}>
              {getTypeSymbol(selectedPayment.type)}₹{selectedPayment.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Type:</span>
            <span className="text-sm text-gray-900 capitalize">{selectedPayment.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className={`text-sm ${getStatusColor(selectedPayment.status)} px-2 py-1 rounded-full`}>
              {selectedPayment.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Date:</span>
            <span className="text-sm text-gray-900">
              {new Date(selectedPayment.date).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Collector:</span>
            <span className="text-sm text-gray-900">{selectedPayment.collectedBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Reference:</span>
            <span className="text-sm text-gray-900 font-mono">{selectedPayment.referenceNumber}</span>
          </div>
          {/* ✅ ADD REMARKS TO DETAILS MODAL */}
          {selectedPayment.remarks && (
            <div>
              <span className="text-sm font-medium text-gray-600">Remarks:</span>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                <p className="text-sm text-gray-900">{selectedPayment.remarks}</p>
              </div>
            </div>
          )}
          {selectedPayment.description && (
            <div>
              <span className="text-sm font-medium text-gray-600">Description:</span>
              <p className="text-sm text-gray-900 mt-1">{selectedPayment.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ManagePayments;