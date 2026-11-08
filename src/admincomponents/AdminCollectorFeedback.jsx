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
  Users,
} from "lucide-react";
import axios from "axios";

const AdminCollectorFeedback = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch collector feedback data
  useEffect(() => {
    fetchCollectorFeedback();
  }, []);

  const fetchCollectorFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      console.log("📡 Fetching collector feedback data...");

      const response = await axios.get(
        "http://localhost:5000/api/feedback/collector/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      console.log("✅ Collector Feedback API Response:", response.data);

      if (response.data.success) {
        setFeedbackData(response.data.data || []);
        console.log(`📊 Loaded ${response.data.data?.length || 0} collector feedback entries`);
      } else {
        setError(response.data.message || "Failed to fetch collector feedback");
      }
    } catch (error) {
      console.error("❌ Error fetching collector feedback:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication expired. Please log in again.");
        } else if (error.response.status === 403) {
          setError("You don't have permission to access collector feedback.");
        } else {
          setError(
            error.response.data?.message ||
              `Server error: ${error.response.status}`
          );
        }
      } else if (error.request) {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("Failed to make request: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update feedback status
  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      setActionLoading(feedbackId);
      const token = localStorage.getItem("adminToken");

      console.log(`Updating collector feedback ${feedbackId} to status: ${newStatus}`);

      const response = await axios.put(
        `http://localhost:5000/api/feedback/collector/admin/${feedbackId}/status`,
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
        fetchCollectorFeedback();
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

  // Add admin notes
  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      alert("Please enter admin notes");
      return;
    }

    try {
      setActionLoading("sending_response");
      const token = localStorage.getItem("adminToken");

      console.log("Adding admin notes to feedback:", selectedFeedback._id);

      const response = await axios.put(
        `http://localhost:5000/api/feedback/collector/admin/${selectedFeedback._id}/notes`,
        {
          admin_notes: responseText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Admin notes added successfully:", response.data);

      if (response.data.success) {
        alert("Admin notes added successfully!");
        setShowResponseModal(false);
        setResponseText("");
        setSelectedFeedback(null);
        fetchCollectorFeedback();
      } else {
        alert(response.data.message || "Failed to add admin notes");
      }
    } catch (error) {
      console.error("Error adding admin notes:", error);
      alert(error.response?.data?.message || "Failed to add admin notes");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter feedback
  const filteredFeedback = feedbackData.filter((feedback) => {
    const matchesSearch =
      feedback.submitted_by?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      feedback.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || feedback.status === statusFilter;

    const matchesCategory = categoryFilter === "all" || feedback.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Status and styling helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "action_taken":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "reviewed":
        return <Clock className="h-4 w-4" />;
      case "action_taken":
        return <AlertCircle className="h-4 w-4" />;
      case "pending":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "reviewed":
        return "Reviewed";
      case "action_taken":
        return "Action Taken";
      case "resolved":
        return "Resolved";
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

  const getCategoryColor = (category) => {
    switch (category) {
      case "complaint":
        return "bg-red-100 text-red-800 border-red-200";
      case "suggestion":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "system":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "colleague":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "general":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openResponseModal = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.admin_notes || "");
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
    pending: feedbackData.filter((f) => f.status === "pending").length,
    reviewed: feedbackData.filter((f) => f.status === "reviewed").length,
    action_taken: feedbackData.filter((f) => f.status === "action_taken").length,
    resolved: feedbackData.filter((f) => f.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collector feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Collector Feedback
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCollectorFeedback}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
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
            Collector Feedback
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to feedback from collectors
          </p>
        </div>
        <button
          onClick={fetchCollectorFeedback}
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
          <div className="text-sm text-blue-600">Reviewed</div>
        </div>
        <div className="bg-white rounded-lg border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.action_taken}
          </div>
          <div className="text-sm text-yellow-600">Action Taken</div>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.resolved}
          </div>
          <div className="text-sm text-green-600">Resolved</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by collector name, category, or message..."
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
            <option value="reviewed">Reviewed</option>
            <option value="action_taken">Action Taken</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="colleague">Colleague</option>
            <option value="system">System</option>
            <option value="suggestion">Suggestion</option>
            <option value="complaint">Complaint</option>
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feedback.submitted_by?.name || "Unknown Collector"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {feedback.submitted_by?.email || "No email"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {feedback.submitted_by?.phone || "No phone"}
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
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                      feedback.category
                    )}`}
                  >
                    {feedback.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {feedback.category} Feedback
                </h4>
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(feedback.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{feedback.message}</p>
              
              {/* About Collector (if specified) */}
              {feedback.about_collector && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">About Collector:</span> {feedback.about_collector.name}
                  </p>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            {feedback.admin_notes && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-green-900 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Admin Notes
                  </h5>
                  <span className="text-xs text-green-600">
                    {new Date(feedback.updated_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-green-800">{feedback.admin_notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                {feedback.status === "pending" && (
                  <button
                    onClick={() =>
                      updateFeedbackStatus(feedback._id, "reviewed")
                    }
                    disabled={actionLoading === feedback._id}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {actionLoading === feedback._id
                      ? "Updating..."
                      : "Mark Reviewed"}
                  </button>
                )}
                {feedback.status === "reviewed" && (
                  <button
                    onClick={() =>
                      updateFeedbackStatus(feedback._id, "action_taken")
                    }
                    disabled={actionLoading === feedback._id}
                    className="flex items-center text-yellow-600 hover:text-yellow-800 text-sm font-medium disabled:opacity-50"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {actionLoading === feedback._id
                      ? "Updating..."
                      : "Mark Action Taken"}
                  </button>
                )}
                {feedback.status === "action_taken" && (
                  <button
                    onClick={() => updateFeedbackStatus(feedback._id, "resolved")}
                    disabled={actionLoading === feedback._id}
                    className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {actionLoading === feedback._id
                      ? "Updating..."
                      : "Mark Resolved"}
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openResponseModal(feedback)}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {feedback.admin_notes
                    ? "Edit Notes"
                    : "Add Notes"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFeedback.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No collector feedback found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "No collector feedback matches your search criteria."
              : "No collector feedback has been submitted yet."}
          </p>
        </div>
      )}

      {/* Admin Notes Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedFeedback.admin_notes
                    ? "Edit Admin Notes"
                    : "Add Admin Notes"}
                </h2>
                <button
                  onClick={closeResponseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Collector Feedback Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {selectedFeedback.submitted_by?.name || "Unknown Collector"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getRatingStars(selectedFeedback.rating)}
                    <span className="text-sm text-gray-500">
                      ({selectedFeedback.rating})
                    </span>
                  </div>
                </div>
                <h4 className="font-medium text-gray-800 mb-2 capitalize">
                  {selectedFeedback.category} Feedback
                </h4>
                <p className="text-gray-600 text-sm">
                  {selectedFeedback.message}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Add your notes or response for this collector feedback..."
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These notes will be visible to administrators and can be used to track actions taken.
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
                      ? "Saving..."
                      : "Save Notes"}
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

export default AdminCollectorFeedback;