import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Shield,
  TrendingUp,
  BarChart3,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Eye,
  Calendar,
  Wallet,
  CreditCard,
  UserCheck,
} from "lucide-react";
import {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../services/api";
import Footer from "../components/Footer";
import FooterCollector from "./FooterCollector";

const CollectorWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("collectorToken");
    if (!token) {
      navigate("/collector/login");
    }
  }, []);

  const collectorData = JSON.parse(
    localStorage.getItem("collectorData") || "{}"
  );

  // Load pending withdrawals for this collector's customers only
  // const loadWithdrawals = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     console.log(
  //       "🔄 Loading withdrawals for collector:",
  //       collectorData._id,
  //       collectorData.name
  //     );

  //     const response = await getPendingWithdrawals();
  //     console.log("📊 API Response:", response.data);

  //     if (response.data.success) {
  //       // Get all withdrawals from response
  //       const allWithdrawals = response.data.data || [];
  //       console.log("📦 All withdrawals from API:", allWithdrawals.length);

  //       if (allWithdrawals.length === 0) {
  //         console.log("❌ No withdrawals found in API response");
  //         setWithdrawals([]);
  //         return;
  //       }

  //       // Debug: Log the first withdrawal to see its structure
  //       console.log("🔍 First withdrawal structure:", allWithdrawals[0]);

  //       // Filter withdrawals to only show those from this collector's customers
  //       const collectorWithdrawals = allWithdrawals.filter((withdrawal) => {
  //         // Try different possible paths for collectorId
  //         const accountCollectorId =
  //           withdrawal.accountId?.collectorId?._id ||
  //           withdrawal.accountId?.collectorId ||
  //           withdrawal.collectorId?._id ||
  //           withdrawal.collectorId ||
  //           withdrawal.account?.collectorId?._id ||
  //           withdrawal.account?.collectorId;

  //         const loggedInCollectorId = collectorData._id;

  //         console.log("🔍 Withdrawal filtering:", {
  //           withdrawalId: withdrawal._id,
  //           accountCollectorId,
  //           loggedInCollectorId,
  //           matches: accountCollectorId === loggedInCollectorId,
  //         });

  //         return accountCollectorId === loggedInCollectorId;
  //       });

  //       console.log(
  //         "✅ Filtered withdrawals for collector:",
  //         collectorWithdrawals.length
  //       );

  //       // Transform API data to match our component structure
  //       const withdrawalsData = collectorWithdrawals.map((withdrawal) => {
  //         // Extract customer information from different possible paths
  //         const customerInfo =
  //           withdrawal.customerId || withdrawal.customer || {};
  //         const accountInfo = withdrawal.accountId || withdrawal.account || {};

  //         return {
  //           id: withdrawal._id,
  //           customerName: customerInfo.name || "N/A",
  //           customerId: customerInfo._id || withdrawal.customerId || "N/A",
  //           accountNumber:
  //             withdrawal.accountNumber || accountInfo.accountNumber || "N/A",
  //           amount: withdrawal.amount,
  //           reason: withdrawal.reason || "Not specified",
  //           status: withdrawal.status,
  //           requestDate: withdrawal.date || withdrawal.createdAt,
  //           customerPhone: customerInfo.phone || "N/A",
  //           currentBalance:
  //             accountInfo.currentBalance || withdrawal.currentBalance || 0,
  //           accountType: accountInfo.type || "N/A",
  //           // Additional fields from API
  //           _id: withdrawal._id,
  //           collectorId: withdrawal.collectorId,
  //           approvedBy: withdrawal.approvedBy,
  //           approvedAt: withdrawal.approvedAt,
  //           rejectedBy: withdrawal.rejectedBy,
  //           rejectedAt: withdrawal.rejectedAt,
  //           rejectionReason: withdrawal.rejectionReason,
  //           referenceNumber: withdrawal.referenceNumber,
  //           // Store the account collector ID for filtering
  //           accountCollectorId:
  //             accountInfo.collectorId?._id ||
  //             accountInfo.collectorId ||
  //             withdrawal.collectorId?._id ||
  //             withdrawal.collectorId,
  //         };
  //       });

  //       setWithdrawals(withdrawalsData);
  //       console.log("🎉 Final withdrawals data:", withdrawalsData);
  //     } else {
  //       throw new Error(response.data.message || "Failed to load withdrawals");
  //     }
  //   } catch (error) {
  //     console.error("❌ Error loading withdrawals:", error);
  //     setError(
  //       error.response?.data?.message || "Failed to load withdrawal requests"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
// Load pending withdrawals for this collector's customers only
const loadWithdrawals = async () => {
  try {
    setLoading(true);
    setError("");
    console.log(
      "🔄 Loading withdrawals for collector:",
      collectorData._id,
      collectorData.name
    );

    const response = await getPendingWithdrawals();
    console.log("📊 API Response:", response.data);

    if (response.data.success) {
      // Get all withdrawals from response
      const allWithdrawals = response.data.data || [];
      console.log("📦 All withdrawals from API:", allWithdrawals.length);

      if (allWithdrawals.length === 0) {
        console.log("❌ No withdrawals found in API response");
        setWithdrawals([]);
        return;
      }

      // Debug: Log the first withdrawal to see its structure
      console.log("🔍 First withdrawal structure:", allWithdrawals[0]);
      console.log("🔍 First withdrawal remarks:", allWithdrawals[0].remarks);

      // Filter withdrawals to only show those from this collector's customers
      const collectorWithdrawals = allWithdrawals.filter((withdrawal) => {
        // Try different possible paths for collectorId
        const accountCollectorId =
          withdrawal.accountId?.collectorId?._id ||
          withdrawal.accountId?.collectorId ||
          withdrawal.collectorId?._id ||
          withdrawal.collectorId ||
          withdrawal.account?.collectorId?._id ||
          withdrawal.account?.collectorId;

        const loggedInCollectorId = collectorData._id;

        console.log("🔍 Withdrawal filtering:", {
          withdrawalId: withdrawal._id,
          accountCollectorId,
          loggedInCollectorId,
          matches: accountCollectorId === loggedInCollectorId,
        });

        return accountCollectorId === loggedInCollectorId;
      });

      console.log(
        "✅ Filtered withdrawals for collector:",
        collectorWithdrawals.length
      );

      // Transform API data to match our component structure
      const withdrawalsData = collectorWithdrawals.map((withdrawal) => {
        // Extract customer information from different possible paths
        const customerInfo =
          withdrawal.customerId || withdrawal.customer || {};
        const accountInfo = withdrawal.accountId || withdrawal.account || {};

        // ✅ CORRECTED: Use 'remarks' field instead of 'reason'
        const withdrawalReason = 
          withdrawal.remarks || 
          withdrawal.reason || 
          "Not specified";

        console.log("💰 Withdrawal reason extraction:", {
          withdrawalId: withdrawal._id,
          remarks: withdrawal.remarks,
          reason: withdrawal.reason,
          finalReason: withdrawalReason
        });

        return {
          id: withdrawal._id,
          customerName: customerInfo.name || "N/A",
          customerId: customerInfo._id || withdrawal.customerId || "N/A",
          accountNumber:
            withdrawal.accountNumber || accountInfo.accountNumber || "N/A",
          amount: withdrawal.amount,
          reason: withdrawalReason, // ✅ Now using the correct 'remarks' field
          status: withdrawal.status,
          requestDate: withdrawal.date || withdrawal.createdAt,
          customerPhone: customerInfo.phone || "N/A",
          currentBalance:
            accountInfo.currentBalance || withdrawal.currentBalance || 0,
          accountType: accountInfo.type || "N/A",
          // Additional fields from API
          _id: withdrawal._id,
          collectorId: withdrawal.collectorId,
          approvedBy: withdrawal.approvedBy,
          approvedAt: withdrawal.approvedAt,
          rejectedBy: withdrawal.rejectedBy,
          rejectedAt: withdrawal.rejectedAt,
          rejectionReason: withdrawal.rejectionReason,
          referenceNumber: withdrawal.referenceNumber,
          // Store the account collector ID for filtering
          accountCollectorId:
            accountInfo.collectorId?._id ||
            accountInfo.collectorId ||
            withdrawal.collectorId?._id ||
            withdrawal.collectorId,
        };
      });

      setWithdrawals(withdrawalsData);
      console.log("🎉 Final withdrawals data:", withdrawalsData);
    } else {
      throw new Error(response.data.message || "Failed to load withdrawals");
    }
  } catch (error) {
    console.error("❌ Error loading withdrawals:", error);
    setError(
      error.response?.data?.message || "Failed to load withdrawal requests"
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApprove = async (withdrawalId) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this withdrawal request?"
      )
    ) {
      return;
    }

    try {
      setProcessingAction(withdrawalId);
      const response = await approveWithdrawal(withdrawalId);

      if (response.data.success) {
        alert("Withdrawal request approved successfully!");
        await loadWithdrawals();
      } else {
        throw new Error(response.data.message || "Approval failed");
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      alert(
        error.response?.data?.message || "Failed to approve withdrawal request"
      );
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (withdrawalId) => {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) {
      return;
    }

    if (reason.trim().length < 5) {
      alert(
        "Please provide a detailed reason for rejection (minimum 5 characters)"
      );
      return;
    }

    try {
      setProcessingAction(withdrawalId);
      const response = await rejectWithdrawal(withdrawalId, { reason });

      if (response.data.success) {
        alert("Withdrawal request rejected!");
        await loadWithdrawals();
      } else {
        throw new Error(response.data.message || "Rejection failed");
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      alert(
        error.response?.data?.message || "Failed to reject withdrawal request"
      );
    } finally {
      setProcessingAction(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.accountNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      withdrawal.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || withdrawal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200";
      case "rejected":
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200";
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  // Function to generate random color for customer avatar
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

  // Function to get initials from name
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

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const approvedCount = withdrawals.filter(
    (w) => w.status === "approved"
  ).length;
  const rejectedCount = withdrawals.filter(
    (w) => w.status === "rejected"
  ).length;
  const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading withdrawal requests...
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your customer withdrawal data
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Manage Withdrawals
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Approve or reject withdrawal requests from your customers in{" "}
                    <strong>{collectorData.area}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {collectorData.name}
                  </span>
                </div>
              </div>
              <button
                onClick={loadWithdrawals}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-red-800 font-medium">
                  Error loading withdrawals
                </p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Area Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {withdrawals.length}
                </p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Your customers only
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {pendingCount}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Awaiting your action
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl border border-yellow-200">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {approvedCount}
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
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  ₹{totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Across all requests
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl border border-purple-200">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Search and Filter */}
        

        {/* Withdrawals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWithdrawals.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
                <Download className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all"
                    ? "No withdrawals found"
                    : "No withdrawal requests"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search terms or filters to see more results."
                    : "No withdrawal requests available from customers in your area."}
                </p>
                <button
                  onClick={loadWithdrawals}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg mx-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${getRandomColor(
                          withdrawal.id
                        )} shadow-lg`}
                      >
                        {getInitials(withdrawal.customerName)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {withdrawal.customerName}
                        </h3>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1">
                          Acc: {withdrawal.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600">
                        - ₹{withdrawal.amount.toLocaleString()}
                      </div>
                      <div className="mt-1">
                        {withdrawal.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 shadow-sm">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              withdrawal.status
                            )}`}
                          >
                            {getStatusIcon(withdrawal.status)}
                            {getStatusText(withdrawal.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>ID: {withdrawal.customerId}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{withdrawal.customerPhone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            withdrawal.requestDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {/* <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Balance: ₹{withdrawal.currentBalance.toLocaleString()}
                      </div> */}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span>{" "}
                        {withdrawal.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                    <button
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>

                    {withdrawal.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={processingAction === withdrawal.id}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                        >
                          {processingAction === withdrawal.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(withdrawal.id)}
                          disabled={processingAction === withdrawal.id}
                          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                        >
                          {processingAction === withdrawal.id ? (
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Withdrawal Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Withdrawal Details
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Complete withdrawal request information
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
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
                      selectedWithdrawal.id
                    )} shadow-lg`}
                  >
                    {getInitials(selectedWithdrawal.customerName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedWithdrawal.customerName}
                    </h3>
                    <p className="text-gray-600">
                      {selectedWithdrawal.customerPhone}
                    </p>
                    <p className="text-sm text-gray-500">
                      Customer ID: {selectedWithdrawal.customerId}
                    </p>
                  </div>
                </div>

                {/* Withdrawal Details Card */}
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
                        {selectedWithdrawal.accountNumber}
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
                        {selectedWithdrawal.accountType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-gray-700">
                          Withdrawal Amount
                        </span>
                      </div>
                      <span className="text-xl font-bold text-red-600">
                        - ₹{selectedWithdrawal.amount.toLocaleString()}
                      </span>
                    </div>

                    {/* <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-700">Current Balance</span>
                      </div>
                      <span className="text-gray-900 font-semibold">₹{selectedWithdrawal.currentBalance.toLocaleString()}</span>
                    </div> */}

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-gray-700">
                          Request Date
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {new Date(
                          selectedWithdrawal.requestDate
                        ).toLocaleDateString()}
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
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            selectedWithdrawal.status
                          )}`}
                        >
                          {getStatusIcon(selectedWithdrawal.status)}
                          {getStatusText(selectedWithdrawal.status)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Reason Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-700">
                        Withdrawal Reason
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700">
                        {selectedWithdrawal.reason}
                      </p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {selectedWithdrawal.referenceNumber && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-700">
                          Reference Information
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Reference Number:
                        </span>
                        <span className="text-sm text-gray-900 font-medium font-mono">
                          {selectedWithdrawal.referenceNumber}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-3">
                {selectedWithdrawal.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedWithdrawal.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={processingAction === selectedWithdrawal.id}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {processingAction === selectedWithdrawal.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve Withdrawal</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedWithdrawal.id);
                        setShowDetailsModal(false);
                      }}
                      disabled={processingAction === selectedWithdrawal.id}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {processingAction === selectedWithdrawal.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Reject Withdrawal</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
     <FooterCollector/>
    </div>
  );
};

export default CollectorWithdrawals;
