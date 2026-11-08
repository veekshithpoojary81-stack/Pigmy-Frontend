import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  MapPin,
  User,
  Eye,
  ArrowLeft,
  Mail,
  Award,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarCollector from "./NavbarCollector";
import Footer from "../components/Footer";
import FooterCollector from "./FooterCollector";

const CollectorCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("collectorToken");
    if (!token) {
      navigate("/collector/login");
    }
  }, []);
  const token = localStorage.getItem("collectorToken");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/collector/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading customers...</p>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we fetch your customer data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] mt-[-3rem] bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    My Customers
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {customers.length} customer
                    {customers.length !== 1 ? "s" : ""} assigned to you
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Collector Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {customers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Today
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {Math.floor(customers.length * 0.7)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Collections Due
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {Math.floor(customers.length * 0.3)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {customers.length}
                </span>{" "}
                customers
              </div>
            </div>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? "No customers found" : "No customers assigned"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm
                    ? "Try adjusting your search terms or browse all customers."
                    : "Customers will appear here once they are assigned to your collection route."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:border-blue-300/50 transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="p-6">
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${getRandomColor(
                          customer._id
                        )} shadow-lg`}
                      >
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {customer.name}
                        </h3>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1">
                          ID: {customer.customerId}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200 transform group-hover:scale-110"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>

                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {customer.address || "Address not provided"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-gray-200/60">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-scaleIn">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Customer Profile
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Complete customer information
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

              {/* Customer Profile */}
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${getRandomColor(
                      selectedCustomer._id
                    )} shadow-lg`}
                  >
                    {getInitials(selectedCustomer.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-gray-600">
                      ID: {selectedCustomer.customerId}
                    </p>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-4 border border-gray-200/60">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200/40">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-700">Phone</span>
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {selectedCustomer.phone}
                    </span>
                  </div>

                  {selectedCustomer.email && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200/40">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-700">Email</span>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {selectedCustomer.email}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between py-2 border-b border-gray-200/40">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                      <span className="font-medium text-gray-700">Address</span>
                    </div>
                    <span className="text-gray-900 font-semibold text-right max-w-xs">
                      {selectedCustomer.address || "Not provided"}
                    </span>
                  </div>

                  {selectedCustomer.nomineeName && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200/40">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-700">
                          Nominee
                        </span>
                      </div>
                      <span className="text-gray-900 font-semibold">
                        {selectedCustomer.nomineeName}
                      </span>
                    </div>
                  )}

                  {/* {selectedCustomer.totalSavings !== undefined && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <Award className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-gray-700">Total Savings</span>
                      </div>
                      <span className="text-green-600 font-bold text-lg">
                        ₹{selectedCustomer.totalSavings?.toLocaleString()}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
                >
                  Close
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
                  Contact Customer
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

export default CollectorCustomers;
