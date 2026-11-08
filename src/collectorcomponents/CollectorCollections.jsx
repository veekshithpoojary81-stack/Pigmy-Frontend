// src/components/CollectorCollections.jsx
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ArrowLeft,
  User,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Shield,
  BarChart3,
  Wallet,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

const CollectorCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [collectorInfo, setCollectorInfo] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
  });

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("collectorToken");
    if (!token) {
      navigate("/collector/login");
    }
  }, []);

  const token = localStorage.getItem("collectorToken");

  useEffect(() => {
    fetchCollectorCollections();
  }, []);

  const fetchCollectorCollections = async () => {
    try {
      setLoading(true);

      const paymentsResponse = await axios.get(
        "http://localhost:5000/api/payments/payments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (paymentsResponse.data.success) {
        const payments = paymentsResponse.data.data || [];
        const apiStats = paymentsResponse.data.stats || {};

        console.log("All payments received:", payments);

        // ✅ FILTER OUT WITHDRAWAL REQUESTS - Only show deposits
        const collectionsOnly = payments.filter(
          (payment) =>
            payment.type !== "withdrawal" &&
            payment.type !== "withdrawal_request"
        );

        console.log("Filtered collections (no withdrawals):", collectionsOnly);

        setCollections(collectionsOnly);

        // Update stats to reflect only collections (deposits)
        const filteredStats = {
          total: collectionsOnly.length,
          pending: collectionsOnly.filter((p) => p.status === "pending").length,
          completed: collectionsOnly.filter(
            (p) => p.status === "completed" || p.status === "verified"
          ).length,
          rejected: collectionsOnly.filter((p) => p.status === "failed").length, // Count 'failed' as rejected
          totalAmount: collectionsOnly.reduce(
            (sum, p) => sum + (p.amount || 0),
            0
          ),
        };

        setStats(filteredStats);

        // Set collector info from the first payment if available
        if (collectionsOnly.length > 0 && collectionsOnly[0].collectorId) {
          setCollectorInfo(collectionsOnly[0].collectorId);
        }
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };
  // const handleUpdateStatus = async (paymentId, newStatus) => {
  //   // If rejecting, ask for a reason and use 'failed' status
  //   let rejectionReason = "";
  //   if (newStatus === "rejected") {
  //     const reason = prompt("Please enter reason for rejection:");
  //     if (!reason || reason.trim().length === 0) {
  //       alert("Rejection reason is required.");
  //       return;
  //     }
  //     rejectionReason = reason.trim();
  //     // Use 'failed' status for rejections
  //     newStatus = "failed";
  //   }

  //   setUpdatingStatus(paymentId);
  //   try {
  //     const response = await axios.patch(
  //       `http://localhost:5000/api/payments/${paymentId}/status`,
  //       {
  //         status: newStatus,
  //         // Include rejection reason if available
  //         ...(rejectionReason && { rejectionReason }),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       // Update local state
  //       setCollections(
  //         collections.map((collection) =>
  //           collection._id === paymentId
  //             ? {
  //                 ...collection,
  //                 status: newStatus,
  //                 ...(rejectionReason && { rejectionReason }),
  //               }
  //             : collection
  //         )
  //       );

  //       // Refresh stats
  //       fetchCollectorCollections();

  //       alert(
  //         `Payment status updated to ${
  //           newStatus === "failed" ? "rejected" : newStatus
  //         }`
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     alert("Failed to update status");
  //   } finally {
  //     setUpdatingStatus(null);
  //   }
  // };
const handleUpdateStatus = async (paymentId, newStatus) => {
  // If rejecting, ask for a reason and use 'failed' status
  let remarks = ""; // Changed from rejectionReason to remarks
  if (newStatus === "rejected") {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason || reason.trim().length === 0) {
      alert("Rejection reason is required.");
      return;
    }
    remarks = reason.trim(); // Store in remarks field
    // Use 'failed' status for rejections
    newStatus = "failed";
  }

  setUpdatingStatus(paymentId);
  try {
    const response = await axios.patch(
      `http://localhost:5000/api/payments/${paymentId}/status`,
      {
        status: newStatus,
        // Send as 'remarks' instead of 'rejectionReason'
        ...(remarks && { remarks }), // Changed from rejectionReason to remarks
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

   if (response.data.success) {
  // Update local state with remarks from response
  setCollections(
    collections.map((collection) =>
      collection._id === paymentId
        ? {
            ...collection,
            status: newStatus,
            remarks: response.data.data.remarks || remarks, // Use response data
          }
        : collection
    )
  );

  // Refresh stats
  fetchCollectorCollections();

  alert(
    `Payment status updated to ${
      newStatus === "failed" ? "rejected" : newStatus
    }`
  );
}
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status");
  } finally {
    setUpdatingStatus(null);
  }
};

  const handleViewDetails = (collection) => {
    setSelectedCollection(collection);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color:
          "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      completed: {
        color:
          "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200",
        icon: CheckCircle,
        label: "Completed",
      },
      verified: {
        color:
          "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200",
        icon: Shield,
        label: "Verified",
      },
      failed: {
        color:
          "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200",
        icon: XCircle,
        label: "Rejected", // Show "Rejected" label for "failed" status
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} shadow-sm`}
      >
        <IconComponent className="w-3 h-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const config = {
      cash: { icon: DollarSign, color: "text-green-600 bg-green-100" },
      online: { icon: CreditCard, color: "text-blue-600 bg-blue-100" },
      upi: { icon: Wallet, color: "text-purple-600 bg-purple-100" },
    };

    const methodConfig = config[method] || config.cash;
    const IconComponent = methodConfig.icon;

    return (
      <div className={`p-2 rounded-lg ${methodConfig.color}`}>
        <IconComponent className="h-4 w-4" />
      </div>
    );
  };

  const getRandomColor = (id) => {
    const colors = [
      "bg-gradient-to-r from-blue-500 to-blue-600",
      "bg-gradient-to-r from-green-500 to-green-600",
      "bg-gradient-to-r from-purple-500 to-purple-600",
      "bg-gradient-to-r from-orange-500 to-orange-600",
      "bg-gradient-to-r from-pink-500 to-pink-600",
      "bg-gradient-to-r from-teal-500 to-teal-600",
    ];
    return colors[id?.charCodeAt(0) % colors.length] || colors[0];
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CU"
    );
  };

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.customerId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.accountId?.accountNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (collection.customerId?.phone &&
        collection.customerId.phone.includes(searchTerm));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "failed"
        ? collection.status === "failed"
        : collection.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Customer",
      "Phone",
      "Account",
      "Amount",
      "Method",
      "Status",
      "Payment Date",
    ];
    const csvData = filteredCollections.map((collection) => [
      new Date(collection.createdAt).toLocaleDateString(),
      collection.customerId?.name || "N/A",
      collection.customerId?.phone || "N/A",
      collection.accountId?.accountNumber || "N/A",
      collection.amount,
      collection.paymentMethod,
      collection.status,
      new Date(collection.paymentDate).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collections-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading collections...</p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your collection data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/collector/dashboard")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Collection History
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Track and manage all your payment collections
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {collectorInfo && (
                <div className="hidden md:block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {collectorInfo.name}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={fetchCollectorCollections}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Collections
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All time records
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pending}
                </p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting action</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl border border-yellow-200">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completed}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Successfully processed
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-50 rounded-xl border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{stats.totalAmount?.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">Collected amount</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl border border-purple-200">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, account number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Filter:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Rejected</option>
              </select>

              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredCollections.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {collections.length}
                </span>{" "}
                collections
              </div>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCollections.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all"
                    ? "No collections found"
                    : "No collections yet"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search terms or filters to see more results."
                    : "Your collection history will appear here once you start receiving payments."}
                </p>
                <button
                  onClick={fetchCollectorCollections}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg mx-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          ) : (
            filteredCollections.map((collection) => (
              <div
                key={collection._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${getRandomColor(
                          collection._id
                        )} shadow-lg`}
                      >
                        {getInitials(collection.customerId?.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {collection.customerId?.name || "N/A"}
                        </h3>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1">
                          Acc: {collection.accountId?.accountNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{collection.amount}
                      </div>
                      {getStatusBadge(collection.status)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{collection.customerId?.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(collection.paymentMethod)}
                        <span className="text-gray-700 capitalize font-medium">
                          {collection.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            collection.paymentDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {/* <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {collection.accountId?.accountType || "N/A"} • ₹
                        {collection.accountId?.dailyAmount}/week
                      </div> */}
                    </div>

                    {/* Show rejection reason if available */}
                    {collection.remarks && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    <p className="text-sm text-red-700">
      <span className="font-medium">Rejection Reason:</span>{" "}
      {collection.remarks}
    </p>
  </div>
)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                    <button
                      onClick={() => handleViewDetails(collection)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  
                    {collection.status === "pending" && (
                      <div className="flex space-x-2">
                        {/* Reject Button - Show for cash payments */}
                        {collection.paymentMethod === "cash" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(collection._id, "rejected")
                            } // Pass "rejected" but it will be converted to "failed"
                            disabled={updatingStatus === collection._id}
                            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                          >
                            {updatingStatus === collection._id ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Complete Button */}
                        <button
                          onClick={() =>
                            handleUpdateStatus(collection._id, "completed")
                          }
                          disabled={updatingStatus === collection._id}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                        >
                          {updatingStatus === collection._id ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>Complete</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Collection Detail Modal */}
      {showDetailModal && selectedCollection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Collection Details
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Complete payment information
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <span className="text-2xl text-gray-400 hover:text-gray-600">
                    ×
                  </span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Profile */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${getRandomColor(
                      selectedCollection._id
                    )} shadow-lg`}
                  >
                    {getInitials(selectedCollection.customerId?.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedCollection.customerId?.name || "N/A"}
                    </h3>
                    <p className="text-gray-600">
                      {selectedCollection.customerId?.phone || "N/A"}
                    </p>
                    {selectedCollection.customerId?.email && (
                      <p className="text-sm text-gray-500">
                        {selectedCollection.customerId.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Details Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-4 border border-gray-200/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">
                          Account Number
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {selectedCollection.accountId?.accountNumber || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <Wallet className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-700">
                          Account Type
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold capitalize">
                        {selectedCollection.accountId?.accountType || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-700">
                          Payment Amount
                        </span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        ₹{selectedCollection.amount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-gray-700">
                          Payment Date
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {new Date(
                          selectedCollection.paymentDate
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-gray-700">
                          Payment Method
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold capitalize flex items-center space-x-2">
                        {getPaymentMethodIcon(selectedCollection.paymentMethod)}
                        <span>{selectedCollection.paymentMethod}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-700">
                          Status
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {getStatusBadge(selectedCollection.status)}
                      </span>
                    </div>
                  </div>

                  {/* Show rejection reason if available */}
                  {selectedCollection.rejectionReason && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-gray-700">
                          Rejection Reason
                        </span>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">
                          {selectedCollection.rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedCollection.collectorId && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">
                          Collector Information
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Collector Name:
                          </span>
                          <span className="text-sm text-gray-900 font-medium">
                            {selectedCollection.collectorId.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Area:</span>
                          <span className="text-sm text-gray-900 font-medium">
                            {selectedCollection.collectorId.area}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-3">
                {selectedCollection.status === "pending" && (
                  <>
                    {/* Reject Button - Show for cash payments */}
                    {selectedCollection.paymentMethod === "cash" && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to reject this payment? This action cannot be undone."
                            )
                          ) {
                            handleUpdateStatus(
                              selectedCollection._id,
                              "rejected"
                            );
                            setShowDetailModal(false);
                          }
                        }}
                        disabled={updatingStatus === selectedCollection._id}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                      >
                        {updatingStatus === selectedCollection._id ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span>Reject Payment</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Complete Button */}
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedCollection._id, "completed");
                        setShowDetailModal(false);
                      }}
                      disabled={updatingStatus === selectedCollection._id}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {updatingStatus === selectedCollection._id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Complete</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default CollectorCollections;
