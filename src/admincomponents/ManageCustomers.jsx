import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Loader,
  AlertCircle,
  RefreshCw,
  Key,
  CreditCard,
} from "lucide-react";
import BankStatement from "./BankStatement";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollector, setFilterCollector] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showBankStatement, setShowBankStatement] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    gender: "male",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    aadhaarNumber: "",
    panNumber: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineeContact: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // Function to validate token
  const validateToken = () => {
    const token = localStorage.getItem("adminToken");
    return !!token;
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate token before making requests
      if (!validateToken()) {
        setError("Please login as admin first.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("adminToken");

      try {
        const [customersRes, collectorsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
          axios.get(`${API_BASE_URL}/collectors`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }),
        ]);

        setCustomers(customersRes?.data?.data || []);
        setCollectors(collectorsRes?.data?.data || []);
      } catch (apiError) {
        let errorMessage = "Failed to load data. ";

        if (
          apiError.code === "NETWORK_ERROR" ||
          apiError.code === "ECONNREFUSED"
        ) {
          errorMessage =
            "Cannot connect to server. Please make sure the backend is running on localhost:5000";
        } else if (apiError.response?.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
          handleLogout();
        } else if (apiError.response?.status === 403) {
          errorMessage = "Access denied. Admin privileges required.";
        } else if (apiError.response?.status === 404) {
          errorMessage =
            "API endpoint not found. Please check the backend routes.";
        } else if (apiError.message?.includes("timeout")) {
          errorMessage =
            "Request timeout. Server is taking too long to respond.";
        } else {
          errorMessage += "Please check your connection and try again.";
        }

        setError(errorMessage);
        setCustomers([]);
        setCollectors([]);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setCustomers([]);
      setCollectors([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete customer function
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API_BASE_URL}/customers/${customerToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Customer deleted successfully!");
      setShowDeleteConfirm(false);
      setCustomerToDelete(null);
      fetchData(); // Refresh the list
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(error.response?.data?.message || "Error deleting customer");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirm = (customer) => {
    if (!validateToken()) {
      alert("Please login first.");
      return;
    }
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const generateCustomerId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `CUST${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!validateToken()) {
      alert("Please login first.");
      setSubmitting(false);
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const customerData = {
        ...formData,
        password: formData.customerId,
      };

      if (editingCustomer) {
        await axios.put(
          `${API_BASE_URL}/customers/${editingCustomer._id}`,
          customerData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Customer updated successfully!");
        setShowModal(false);
        setEditingCustomer(null);
        resetForm();
      } else {
        await axios.post(`${API_BASE_URL}/customers`, customerData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Customer created successfully!");

        setCredentials({
          email: formData.email,
          password: formData.customerId,
          customerId: formData.customerId,
        });
        setShowCredentials(true);
        setShowModal(false);
        resetForm();
      }
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(error.response?.data?.message || "Error saving customer.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (customerId) => {
    if (!validateToken()) {
      alert("Please login first.");
      return;
    }

    if (
      !window.confirm(
        "Reset password to Customer ID? This will allow the customer to login again using their Customer ID as password."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_BASE_URL}/customers/${customerId}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(
        "Password reset successfully! Customer can now login using their Customer ID as password."
      );
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert(error.response?.data?.message || "Error resetting password");
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.phone.trim() || formData.phone.length !== 10)
      errors.phone = "Valid 10-digit phone number is required";
    if (!formData.email.trim()) errors.email = "Email is required for login";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.aadhaarNumber.trim() || formData.aadhaarNumber.length !== 12)
      errors.aadhaarNumber = "Valid 12-digit Aadhaar number is required";
    if (!formData.nomineeName.trim())
      errors.nomineeName = "Nominee name is required";
    if (!formData.nomineeRelation.trim())
      errors.nomineeRelation = "Nominee relation is required";
    if (!formData.nomineeContact.trim())
      errors.nomineeContact = "Nominee contact is required";

    return errors;
  };

  const resetForm = () => {
    const newCustomerId = generateCustomerId();
    setFormData({
      customerId: newCustomerId,
      name: "",
      gender: "male",
      dateOfBirth: "",
      phone: "",
      email: `${newCustomerId.toLowerCase()}@pigmy.com`,
      address: "",
      aadhaarNumber: "",
      panNumber: "",
      nomineeName: "",
      nomineeRelation: "",
      nomineeContact: "",
      status: "active",
    });
    setFormErrors({});
    setCredentials(null);
    setShowCredentials(false);
  };

  const openCreateModal = () => {
    if (!validateToken()) {
      alert("Please login first.");
      return;
    }
    resetForm();
    setEditingCustomer(null);
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    if (!validateToken()) {
      alert("Please login first.");
      return;
    }
    setEditingCustomer(customer);
    setFormData({
      customerId: customer.customerId,
      name: customer.name,
      gender: customer.gender || "male",
      dateOfBirth: customer.dateOfBirth
        ? new Date(customer.dateOfBirth).toISOString().split("T")[0]
        : "",
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address,
      aadhaarNumber: customer.aadhaarNumber || "",
      panNumber: customer.panNumber || "",
      nomineeName: customer.nomineeName || "",
      nomineeRelation: customer.nomineeRelation || "",
      nomineeContact: customer.nomineeContact || "",
      status: customer.status || "active",
    });
    setShowModal(true);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollector =
      !filterCollector || customer.collectorId?._id === filterCollector;

    return matchesSearch && matchesCollector;
  });

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchData}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with logout button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Customers
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage pigmy customers
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {customers.length} customers, {collectors.length} collectors
            </span>
            {/* <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-300 rounded-lg transition-colors"
            >
              Logout
            </button> */}
            <button
              onClick={openCreateModal}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, ID, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCollector}
              onChange={(e) => setFilterCollector(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Collectors</option>
              {collectors.map((collector) => (
                <option key={collector._id} value={collector._id}>
                  {collector.name} - {collector.area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {customer.customerId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span className="flex text-sm">{customer.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-5">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowBankStatement(true);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium pl-3.5"
                      title="View Bank Statement"
                    >
                      <CreditCard className="h-6 w-6" />
                      <p>Statement</p>
                    </button>
                    <button
                      onClick={() => openEditModal(customer)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium pl-[9rem]"
                      title="Edit Customer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(customer)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {customers.length === 0
                ? "No customers yet"
                : "No customers found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {customers.length === 0
                ? "Get started by creating your first customer."
                : "Try adjusting your search criteria."}
            </p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Your First Customer
            </button>
          </div>
        )}

        {/* Customer Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCustomer(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Personal Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.customerId}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This will be used as password for login
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter full name"
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors.dateOfBirth && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.dateOfBirth}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="10-digit mobile number"
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Email address for login"
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.email}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          This will be used as username for login
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aadhaar Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.aadhaarNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              aadhaarNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="12-digit Aadhaar"
                        />
                        {formErrors.aadhaarNumber && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.aadhaarNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={formData.panNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              panNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="PAN number (optional)"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Full residential address"
                        rows="3"
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nominee Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Nominee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nominee Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomineeName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomineeName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Nominee full name"
                        />
                        {formErrors.nomineeName && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.nomineeName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relation with Nominee *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomineeRelation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomineeRelation: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., Spouse, Son, Daughter"
                        />
                        {formErrors.nomineeRelation && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.nomineeRelation}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nominee Contact *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomineeContact}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nomineeContact: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Phone number"
                        />
                        {formErrors.nomineeContact && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.nomineeContact}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCustomer(null);
                        resetForm();
                      }}
                      className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting
                        ? "Saving..."
                        : editingCustomer
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && customerToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-800">
                      Warning: This action cannot be undone!
                    </span>
                  </div>

                  <p className="text-sm text-red-700">
                    Are you sure you want to delete customer{" "}
                    <strong>{customerToDelete.name}</strong> (ID:{" "}
                    {customerToDelete.customerId})? This will permanently remove
                    all customer data including their transactions and account
                    information.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCustomer}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  >
                    {deleting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Customer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {showCredentials && credentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customer Login Credentials
                  </h3>
                  <button
                    onClick={() => setShowCredentials(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Key className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">
                      Share these credentials with the customer:
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email (Username)
                      </label>
                      <div className="mt-1 p-2 bg-white border border-gray-300 rounded-lg font-mono text-sm">
                        {credentials.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="mt-1 p-2 bg-white border border-gray-300 rounded-lg font-mono text-sm">
                        {credentials.customerId}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-yellow-700 mt-3">
                    💡 The customer should use their Customer ID as password
                    when logging in.
                  </p>
                </div>

                <button
                  onClick={() => setShowCredentials(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bank Statement Modal */}
        {showBankStatement && selectedCustomer && (
          <BankStatement
            customer={selectedCustomer}
            onClose={() => {
              setShowBankStatement(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageCustomers;
