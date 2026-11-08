import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  DollarSign,
  Users,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  X,
  FileText,
  Eye,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Shield,
  Target,
} from "lucide-react";
import axios from "axios";
import Footer from "../components/Footer";
import NavbarCollector from "./NavbarCollector";
import FooterCollector from "./FooterCollector";

const CollectorDashboard = () => {
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    category: "general",
    message: "",
    rating: "5",
  });

  useEffect(() => {
    const token = localStorage.getItem("collectorToken");
    if (!token) {
      navigate("/collector/login");
    }
  }, []);

  const collectorData = JSON.parse(
    localStorage.getItem("collectorData") || "{}"
  );

  // Fetch collector's feedback when component mounts
  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const token = localStorage.getItem("collectorToken");

      const response = await axios.get(
        "http://localhost:5000/api/feedback/collector/my-feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMyFeedback(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching collector feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("collectorToken");
    localStorage.removeItem("collectorData");
    navigate("/collector/login");
  };

  const handleFeedbackInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("collectorToken");

      const feedbackPayload = {
        message: feedbackData.message,
        rating: parseInt(feedbackData.rating),
        category: feedbackData.category,
      };

      const response = await axios.post(
        "http://localhost:5000/api/feedback/collector/submit",
        feedbackPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Feedback submitted successfully! Thank you for your feedback.");
        setShowFeedbackModal(false);
        setFeedbackData({
          category: "general",
          message: "",
          rating: "5",
        });
        fetchMyFeedback();
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("❌ Feedback submission error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackData({
      category: "general",
      message: "",
      rating: "5",
    });
  };

  const openViewFeedbackModal = () => {
    setShowViewFeedbackModal(true);
  };

  const closeViewFeedbackModal = () => {
    setShowViewFeedbackModal(false);
  };

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

  // Mock data
  const pendingWithdrawals = 3;
  const totalWithdrawalsProcessed = 15;
  const totalCustomers = 45;
  const todaysCollection = 12500;
  const feedbackWithAdminNotes = myFeedback.filter(
    (fb) => fb.admin_notes
  ).length;

  // Enhanced StatsCard Component
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    iconColor,
    subtitle,
  }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p
                className={`text-sm mt-1 ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value} from last week
              </p>
            )}
          </div>
          <div
            className={`p-3 rounded-full ${iconColor} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-tl-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] mt-[-3rem] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      {/* <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl overflow-hidden">
        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Collector Dashboard</h1>
                <p className="text-blue-100 mt-1 text-sm">
                  Efficient Collection & Customer Management
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-blue-200">Welcome back,</p>
                <p className="font-bold text-white text-lg">
                  {collectorData?.name || "Collector"}
                </p>
                <p className="text-xs text-blue-300 mt-1">Active Collector</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-semibold text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header> */}
      <NavbarCollector />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-6 relative z-10 mt-3.5">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome back, {collectorData?.name || "Collector"}! 👋
                </h2>
                <p className="text-gray-600 mt-3 text-lg max-w-2xl">
                  Manage your collections, process withdrawals, and stay
                  connected with your customers efficiently.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}

        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
           

            <button
              onClick={() => navigate("/collector/customers")}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-yellow-300 text-left transition-all duration-300 group bg-gradient-to-br from-white to-yellow-50"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">My Customers</h3>
              </div>
              <p className="text-sm text-gray-600">View customer list</p>
            </button>
            <button
              onClick={() => navigate("/collector/collections")}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-yellow-300 text-left transition-all duration-300 group bg-gradient-to-br from-white to-yellow-50"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">My Collections</h3>
              </div>
              <p className="text-sm text-gray-600">View collections list</p>
            </button>

            <button
              onClick={() => navigate("/collector/withdrawals")}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-orange-300 text-left transition-all duration-300 group bg-gradient-to-br from-white to-orange-50"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Manage Withdrawals
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Approve/Reject withdrawals
              </p>
            </button>

            <button
              onClick={() => navigate("/collector/profile")}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-300 text-left transition-all duration-300 group bg-gradient-to-br from-white to-purple-50"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Profile</h3>
              </div>
              <p className="text-sm text-gray-600">Update my profile</p>
            </button>
             <button
              onClick={openFeedbackModal}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 text-left transition-all duration-300 group bg-gradient-to-br from-white to-blue-50"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Send Feedback</h3>
              </div>
              <p className="text-sm text-gray-600">
                Share your feedback with admin
              </p>
            </button>

            <button
              onClick={openViewFeedbackModal}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-300 text-left transition-all duration-300 group bg-gradient-to-br from-white to-green-50"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">View Responses</h3>
              </div>
              <p className="text-sm text-gray-600">
                Check admin responses ({feedbackWithAdminNotes})
              </p>
            </button>
          </div>
        </div>

        {/* Recent Admin Responses Section */}
        {feedbackWithAdminNotes > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Admin Responses
              </h2>
              <button
                onClick={openViewFeedbackModal}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                View All
              </button>
            </div>
            <div className="space-y-4">
              {myFeedback
                .filter((feedback) => feedback.admin_notes)
                .slice(0, 2)
                .map((feedback) => (
                  <div
                    key={feedback._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg capitalize mb-2">
                          {feedback.category} Feedback
                        </h3>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              feedback.status
                            )}`}
                          >
                            {getStatusDisplay(feedback.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center">
                            {getRatingStars(feedback.rating)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-900 flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Admin Response
                        </h4>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {new Date(feedback.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-green-800 text-sm leading-relaxed">
                        {feedback.admin_notes}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Enhanced Pending Withdrawals Section */}
      </main>

      {/* Enhanced Send Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Send Feedback to Admin
                </h2>
                <button
                  onClick={closeFeedbackModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                {/* Rating Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    How would you rate your experience?
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {["1", "2", "3", "4", "5"].map((value) => (
                      <div key={value} className="flex flex-col items-center">
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          id={`rating-${value}`}
                          checked={feedbackData.rating === value}
                          onChange={handleFeedbackInputChange}
                          className="hidden peer"
                        />
                        <label
                          htmlFor={`rating-${value}`}
                          className={`flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-2 text-lg font-bold transition-all duration-300
                            ${
                              feedbackData.rating === value
                                ? "border-blue-600 bg-blue-600 text-white shadow-lg scale-105"
                                : "border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-300 hover:shadow-md"
                            }`}
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={feedbackData.category}
                    onChange={handleFeedbackInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="general">General</option>
                    <option value="colleague">Colleague</option>
                    <option value="system">System</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                {/* Message Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Your Feedback
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    value={feedbackData.message}
                    onChange={handleFeedbackInputChange}
                    placeholder="Please share your thoughts, suggestions, or concerns with the admin..."
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeFeedbackModal}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-300 rounded-xl transition-all duration-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-400 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Send Feedback"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced View Feedback Modal */}
      {showViewFeedbackModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  My Feedback & Admin Responses
                </h2>
                <button
                  onClick={closeViewFeedbackModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {loadingFeedback ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">
                    Loading your feedback...
                  </p>
                </div>
              ) : myFeedback.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Feedback Submitted
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    You haven't submitted any feedback yet.
                  </p>
                  <button
                    onClick={() => {
                      closeViewFeedbackModal();
                      openFeedbackModal();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Submit Your First Feedback
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myFeedback.map((feedback) => (
                    <div
                      key={feedback._id}
                      className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                            {feedback.category} Feedback
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
                              {feedback.category}
                            </span>
                            <span className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(
                                feedback.created_at
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                feedback.status
                              )}`}
                            >
                              {getStatusDisplay(feedback.status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-full">
                          {getRatingStars(feedback.rating)}
                          <span className="text-sm text-yellow-700 font-semibold">
                            ({feedback.rating})
                          </span>
                        </div>
                      </div>

                      {/* Your Original Feedback */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                          Your Feedback:
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {feedback.message}
                        </p>
                      </div>

                      {/* Admin Notes */}
                      {feedback.admin_notes ? (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-green-900 flex items-center text-lg">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Admin Response
                            </h4>
                            <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              {new Date(feedback.updated_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-green-800 leading-relaxed">
                            {feedback.admin_notes}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                          <p className="text-blue-800 text-sm flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Your feedback is under review. The admin will
                            respond soon.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <FooterCollector/>
    </div>
  );
};

// Star component for ratings
const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Calendar component
const Calendar = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export default CollectorDashboard;
