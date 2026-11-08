import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, MessageSquare, Calendar, Star, CheckCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Feedback = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState("5");
  const [viewMode, setViewMode] = useState("submit"); // "submit" or "view"
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    email: "",
  });

  // Fetch user's feedback when in view mode
  useEffect(() => {
    if (viewMode === "view") {
      fetchMyFeedback();
    }
  }, [viewMode]);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("customerToken");
      
      const response = await axios.get(
        "http://localhost:5000/api/feedback/customer/my-feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFeedbackList(response.data.data);
      } else {
        setError("Failed to fetch feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError(error.response?.data?.message || "Failed to load your feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("customerToken");
      
      const feedbackData = {
        type: formData.category || "general",
        subject: formData.subject,
        message: formData.message,
        rating: parseInt(rating),
        email: formData.email || undefined,
      };

      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Feedback Submitted! Thank you for your valuable feedback.");
        // Reset form
        setFormData({
          subject: "",
          category: "",
          message: "",
          email: "",
        });
        setRating("5");
        // Switch to view mode to see the new feedback
        setViewMode("view");
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert(error.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] mt-[-5rem] bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <Navbar/>
      <div className="max-w-4xl mx-auto space-y-6 mt-[2rem]">
        {/* Back Button */}
        <button
          onClick={() => navigate("/pigmy")}
          className="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Feedback</h1>
          <p className="text-gray-600">Help us improve PigmyXpress</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewMode("submit")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                viewMode === "submit"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Send className="h-4 w-4 inline mr-2" />
              Submit Feedback
            </button>
            <button
              onClick={() => setViewMode("view")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                viewMode === "view"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              My Feedback ({feedbackList.length})
            </button>
          </div>

          <div className="p-6">
            {/* Submit Feedback Form */}
            {viewMode === "submit" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    How would you rate your experience?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["1", "2", "3", "4", "5"].map((value) => (
                      <div key={value} className="flex flex-col items-center">
                        <input
                          type="radio"
                          value={value}
                          id={`rating-${value}`}
                          checked={rating === value}
                          onChange={(e) => setRating(e.target.value)}
                          className="hidden peer"
                        />
                        <label
                          htmlFor={`rating-${value}`}
                          className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 text-lg font-semibold transition-all
                            ${
                              rating === value
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-300"
                            }`}
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your feedback"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="inquiry">Inquiry</option>
                    <option value="general">General Feedback</option>
                  </select>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Feedback
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please share your thoughts, suggestions, or concerns..."
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email (Optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    We'll only use this to follow up on your feedback
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}

            {/* View My Feedback */}
            {viewMode === "view" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your feedback...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={fetchMyFeedback}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Try Again
                    </button>
                  </div>
                ) : feedbackList.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No feedback submitted yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Share your thoughts to help us improve our service!
                    </p>
                    <button
                      onClick={() => setViewMode("submit")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                      Submit Your First Feedback
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((feedback) => (
                      <div
                        key={feedback._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {feedback.subject}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(feedback.createdAt).toLocaleDateString()}
                              </span>
                              <span className="capitalize">{feedback.type}</span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                  feedback.status
                                )}`}
                              >
                                {getStatusDisplay(feedback.status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getRatingStars(feedback.rating)}
                              <span className="text-sm text-gray-500">({feedback.rating}/5)</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer's Original Message */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Your Feedback:</h4>
                          <p className="text-gray-700">{feedback.message}</p>
                        </div>

                        {/* Admin Response */}
                        {feedback.response?.message ? (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-green-900 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Admin Response
                              </h4>
                              <span className="text-xs text-green-600">
                                {new Date(feedback.response.respondedAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-green-800">{feedback.response.message}</p>
                            {feedback.response.respondedBy && (
                              <p className="text-xs text-green-600 mt-2">
                                Responded by: {feedback.response.respondedBy.name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-800 text-sm flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Your feedback has been received and is under review. We'll respond soon.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Feedback;