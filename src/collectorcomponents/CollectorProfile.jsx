import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Navigation,
  Shield,
  Edit3,
  Camera,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import FooterCollector from "./FooterCollector";

const CollectorProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    address: "",
    collectorId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("collectorToken");
    if (!token) {
      navigate("/collector/login");
    }
  }, []);

  // Get collector token from localStorage
  const token = localStorage.getItem("collectorToken");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/collector/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showMessage("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
    setMessage(""); // Clear message when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/collector/profile",
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        showMessage("Profile updated successfully!", "success");
        setIsEditing(false);
        // Update local storage with new data
        const updatedData = {
          ...JSON.parse(localStorage.getItem("collectorData")),
          ...response.data.data,
        };
        localStorage.setItem("collectorData", JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    My Profile
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={toggleEdit}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                isEditing
                  ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              } shadow-lg`}
            >
              <Edit3 className="h-4 w-4" />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 backdrop-blur-sm border transition-all duration-300 ${
              messageType === "success"
                ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800"
                : "bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              {messageType === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              {/* Profile Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-3">
                    {profile.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.name}
                </h2>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Collector ID: {profile.collectorId}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Status
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-blue-800 bg-blue-200 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Rating
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-800">
                    4.8/5
                  </span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Profile Information
              </h3>
              <ul className="text-xs text-blue-700 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Update your contact information here
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Changes will be reflected immediately
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  Ensure your phone number is correct for login
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200/60">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-gray-600" />
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update your personal details and contact information
                </p>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        readOnly
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 text-gray-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Name cannot be changed
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        readOnly
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 text-gray-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        readOnly
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 text-gray-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Phone number cannot be changed
                    </p>
                  </div>

                  {/* Area */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Working Area
                    </label>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="area"
                        value={profile.area}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          isEditing
                            ? "border-gray-300 bg-white"
                            : "border-gray-200 bg-gray-50/50 text-gray-600"
                        }`}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Your assigned collection area
                    </p>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows="3"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none ${
                          isEditing
                            ? "border-gray-300 bg-white"
                            : "border-gray-200 bg-gray-50/50 text-gray-600"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Your complete residential address
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200/60">
                    <button
                      type="button"
                      onClick={toggleEdit}
                      className="px-6 py-3 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Security Note */}
            <div className="mt-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-green-800 mb-2">
                    Security Information
                  </h3>
                  <p className="text-xs text-green-700">
                    Your profile information is securely stored and only used
                    for official collection purposes. Regular updates help
                    maintain accurate records and ensure smooth operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterCollector/>
    </div>
  );
};

export default CollectorProfile;
