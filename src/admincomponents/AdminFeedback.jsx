import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Edit,
  Send,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const AdminFeedback = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Debug authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    console.log("🔐 Admin Authentication Debug:");
    console.log("   Token exists:", !!token);
    console.log("   Token length:", token ? token.length : 0);
    console.log(
      "   Token sample:",
      token ? `${token.substring(0, 20)}...` : "None"
    );
    console.log("   Admin role:", role);
    console.log("   Full token:", token); // Remove this in production
  }, []);

  // Test authentication first
  useEffect(() => {
    testAuthentication();
  }, []);

  const testAuthentication = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("🧪 Testing authentication...");

      const response = await axios.get(
        "http://localhost:5000/api/feedback/test-auth",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Authentication test passed:", response.data);
      // If auth test passes, fetch feedback data
      fetchFeedbackData();
    } catch (authError) {
      console.error("❌ Authentication test failed:", authError);
      setError("Authentication failed. Please log in again.");
      setLoading(false);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      console.log("📡 Fetching feedback data...");
      console.log("   Endpoint: /api/feedback/admin/list");
      console.log("   Token present:", !!token);

      const response = await axios.get(
        "http://localhost:5000/api/feedback/admin/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("✅ Feedback API Response:", response.data);

      if (response.data.success) {
        setFeedbackData(response.data.data);
        console.log(`📊 Loaded ${response.data.data.length} feedback entries`);
      } else {
        setError(response.data.message || "Failed to fetch feedback data");
      }
    } catch (error) {
      console.error("❌ Error fetching feedback:", error);

      // Detailed error analysis
      if (error.code === "ECONNABORTED") {
        setError("Request timeout. Please try again.");
      } else if (error.response) {
        // Server responded with error status
        console.error("   Status:", error.response.status);
        console.error("   Data:", error.response.data);

        if (error.response.status === 401) {
          setError("Authentication expired. Please log in again.");
          // Redirect to login or show login modal
        } else if (error.response.status === 403) {
          setError("You don't have permission to access feedback.");
        } else if (error.response.status === 404) {
          setError("Feedback endpoint not found. Please check the server.");
        } else {
          setError(
            error.response.data?.message ||
              `Server error: ${error.response.status}`
          );
        }
      } else if (error.request) {
        // No response received
        console.error("   No response received");
        setError(
          "Cannot connect to server. Please check your connection and try again."
        );
      } else {
        // Other errors
        setError("Failed to make request: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the status update function to use the correct endpoint
  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      setActionLoading(feedbackId);
      const token = localStorage.getItem("adminToken");

      console.log(`Updating feedback ${feedbackId} to status: ${newStatus}`);

      const response = await axios.patch(
        `http://localhost:5000/api/feedback/admin/${feedbackId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Status update response:", response.data);

      if (response.data.success) {
        alert(`Feedback marked as ${getStatusDisplay(newStatus)}`);
        fetchFeedbackData();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  // Update the response function to use the correct endpoint
  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      alert("Please enter a response message");
      return;
    }

    try {
      setActionLoading("sending_response");
      const token = localStorage.getItem("adminToken");

      console.log("Sending response to feedback:", selectedFeedback._id);

      const response = await axios.patch(
        `http://localhost:5000/api/feedback/admin/${selectedFeedback._id}/status`,
        {
          response: responseText,
          status: "resolved",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response sent successfully:", response.data);

      if (response.data.success) {
        alert("Response sent successfully!");
        setShowResponseModal(false);
        setResponseText("");
        setSelectedFeedback(null);
        fetchFeedbackData();
      } else {
        alert(response.data.message || "Failed to send response");
      }
    } catch (error) {
      console.error("Error sending response:", error);

      let errorMessage = "Failed to send response";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ... rest of your component code remains the same
  const filteredFeedback = feedbackData.filter((feedback) => {
    const matchesSearch =
      feedback.customerId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      feedback.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;

    const matchesType = typeFilter === "all" || feedback.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "open":
        return "New";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openResponseModal = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response?.message || "");
    setShowResponseModal(true);
  };

  const closeResponseModal = () => {
    setShowResponseModal(false);
    setSelectedFeedback(null);
    setResponseText("");
  };

  // Stats for dashboard
  const stats = {
    total: feedbackData.length,
    open: feedbackData.filter((f) => f.status === "open").length,
    inProgress: feedbackData.filter((f) => f.status === "in_progress").length,
    resolved: feedbackData.filter((f) => f.status === "resolved").length,
    closed: feedbackData.filter((f) => f.status === "closed").length,
  };

  // ... rest of your JSX remains the same
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Feedback
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={testAuthentication}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Test Authentication
            </button>
            <button
              onClick={fetchFeedbackData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to customer feedback
          </p>
        </div>
        <button
          onClick={fetchFeedbackData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          <div className="text-sm text-blue-600">New</div>
        </div>
        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.inProgress}
          </div>
          <div className="text-sm text-yellow-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.resolved}
          </div>
          <div className="text-sm text-green-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-gray-600">Closed</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, subject, or message..."
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
            <option value="open">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="inquiry">Inquiry</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <div
            key={feedback._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feedback.customerId?.name || "Unknown Customer"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {feedback.customerId?.email || feedback.email || "No email"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {feedback.customerId?.phone || "No phone"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2 justify-end">
                  {getRatingStars(feedback.rating)}
                  <span className="text-sm text-gray-500">
                    ({feedback.rating})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      feedback.status
                    )}`}
                  >
                    {getStatusIcon(feedback.status)}
                    <span className="ml-1">
                      {getStatusDisplay(feedback.status)}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                      feedback.priority
                    )}`}
                  >
                    {feedback.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {feedback.subject}
                </h4>
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{feedback.message}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
                  {feedback.type}
                </span>
              </div>
            </div>

            {feedback.response?.message && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-blue-900 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Admin Response
                  </h5>
                  <span className="text-xs text-blue-600">
                    {new Date(feedback.response.respondedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-blue-800">{feedback.response.message}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                {feedback.status === "open" && (
                  <button
                    onClick={() =>
                      updateFeedbackStatus(feedback._id, "in_progress")
                    }
                    disabled={actionLoading === feedback._id}
                    className="flex items-center text-yellow-600 hover:text-yellow-800 text-sm font-medium disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {actionLoading === feedback._id
                      ? "Updating..."
                      : "Start Progress"}
                  </button>
                )}
                {feedback.status === "in_progress" && (
                  <button
                    onClick={() =>
                      updateFeedbackStatus(feedback._id, "resolved")
                    }
                    disabled={actionLoading === feedback._id}
                    className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {actionLoading === feedback._id
                      ? "Updating..."
                      : "Mark Resolved"}
                  </button>
                )}
                {feedback.status === "resolved" && (
                  <button
                    onClick={() => updateFeedbackStatus(feedback._id, "closed")}
                    disabled={actionLoading === feedback._id}
                    className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50"
                  >
                    {actionLoading === feedback._id
                      ? "Updating..."
                      : "Close Ticket"}
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openResponseModal(feedback)}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {feedback.response?.message
                    ? "Edit Response"
                    : "Send Response"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFeedback.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No feedback found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "No feedback matches your search criteria."
              : "No feedback has been submitted yet."}
          </p>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedFeedback.response?.message
                    ? "Edit Response"
                    : "Send Response"}
                </h2>
                <button
                  onClick={closeResponseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Customer Feedback Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {selectedFeedback.customerId?.name || "Unknown Customer"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getRatingStars(selectedFeedback.rating)}
                    <span className="text-sm text-gray-500">
                      ({selectedFeedback.rating})
                    </span>
                  </div>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">
                  {selectedFeedback.subject}
                </h4>
                <p className="text-gray-600 text-sm">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response to the customer. This will automatically mark the feedback as resolved."
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This response will be sent to the customer and the feedback
                    will be marked as resolved.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeResponseModal}
                    disabled={actionLoading === "sending_response"}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendResponse}
                    disabled={
                      actionLoading === "sending_response" ||
                      !responseText.trim()
                    }
                    className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {actionLoading === "sending_response"
                      ? "Sending..."
                      : "Send Response"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
