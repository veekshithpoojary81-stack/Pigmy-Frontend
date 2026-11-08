import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  IndianRupee,
  Calendar,
  Users,
  Loader,
  TrendingUp,
} from "lucide-react";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  updatePlanStatus,
} from "../services/api";

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    planId: "",
    name: "",
    type: "daily",
    amount: "",
    duration: "",
    interestRate: "",
    description: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch plans from backend
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getPlans();
      setPlans(response.data.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      alert("Error fetching plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingPlan) {
        // Update existing plan
        await updatePlan(editingPlan._id, formData);
        alert("Plan updated successfully!");
      } else {
        // Create new plan
        await createPlan(formData);
        alert("Plan created successfully!");
      }

      setShowModal(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans(); // Refresh the list
    } catch (error) {
      console.error("Error saving plan:", error);
      alert(error.response?.data?.message || "Error saving plan");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.planId.trim()) {
      errors.planId = "Plan ID is required";
    }

    if (!formData.name.trim()) {
      errors.name = "Plan name is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = "Valid amount is required";
    }

    if (!formData.duration || formData.duration <= 0) {
      errors.duration = "Valid duration is required";
    }

    if (!formData.interestRate || formData.interestRate < 0) {
      errors.interestRate = "Valid interest rate is required";
    }

    // Type-specific validations
    if (formData.type === "daily" && formData.amount > 1000) {
      errors.amount = "Daily plan amount cannot exceed ₹1000";
    }

    if (formData.type === "weekly" && formData.amount > 5000) {
      errors.amount = "Weekly plan amount cannot exceed ₹5000";
    }

    if (formData.type === "monthly" && formData.amount > 20000) {
      errors.amount = "Monthly plan amount cannot exceed ₹20000";
    }

    return errors;
  };

  // Calculate maturity amount
  const calculateMaturityAmount = (amount, duration, interestRate) => {
    const totalInvestment = amount * duration;
    const interest = (totalInvestment * interestRate) / 100;
    return totalInvestment + interest;
  };

  const resetForm = () => {
    setFormData({
      planId: "",
      name: "",
      type: "daily",
      amount: "",
      duration: "",
      interestRate: "",
      description: "",
      status: "active",
    });
    setFormErrors({});
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planId: plan.planId || "",
      name: plan.name || "",
      type: plan.type || "daily",
      amount: plan.amount || "",
      duration: plan.duration || "",
      interestRate: plan.interestRate || "",
      description: plan.description || "",
      status: plan.status || "active",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    // Generate a unique plan ID
    const newPlanId = `PLAN-${Date.now().toString().slice(-6)}`;
    setFormData((prev) => ({
      ...prev,
      planId: newPlanId,
    }));
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan(id);
        alert("Plan deleted successfully!");
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert(error.response?.data?.message || "Error deleting plan");
      }
    }
  };

  const handleStatusUpdate = async (planId, newStatus) => {
    try {
      await updatePlanStatus(planId, { status: newStatus });
      alert(`Plan status updated to ${newStatus}`);
      fetchPlans();
    } catch (error) {
      console.error("Error updating plan status:", error);
      alert(error.response?.data?.message || "Error updating plan status");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800";
      case "weekly":
        return "bg-green-100 text-green-800";
      case "monthly":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Plans</h1>
          <p className="text-gray-600 mt-2">Create and manage savings plans</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Plan
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search plans by name, type, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const maturityAmount = calculateMaturityAmount(
            plan.amount,
            plan.duration,
            plan.interestRate
          );
          const totalInvestment = plan.amount * plan.duration;
          const interestEarned = maturityAmount - totalInvestment;

          return (
            <div
              key={plan._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-500">{plan.planId}</p>
                    <div className="flex gap-1 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          plan.type
                        )}`}
                      >
                        {plan.type}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          plan.status
                        )}`}
                      >
                        {plan.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
              )}

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-gray-900 flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {plan.amount}/{plan.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">
                    {plan.duration} {plan.type}s
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-medium text-green-600">
                    {plan.interestRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Investment</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {totalInvestment}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Interest Earned</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {interestEarned.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <span className="text-gray-700 font-medium">Maturity Amount</span>
                  <span className="font-bold text-blue-700 flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {maturityAmount.toFixed(2)}
                  </span>
                </div>

                {/* <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subscribers</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {plan.totalSubscribers || 0}
                  </span>
                </div> */}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>

                <select 
                
                  value={plan.status}
                  onChange={(e) => handleStatusUpdate(plan._id, e.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {plans.length === 0 ? "No plans created yet" : "No plans found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {plans.length === 0
              ? "Get started by creating your first savings plan."
              : "Try adjusting your search terms."}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.planId}
                      onChange={(e) =>
                        setFormData({ ...formData, planId: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.planId ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., PLAN-001"
                    />
                    {formErrors.planId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.planId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., Daily Savings Basic"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the plan..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.amount ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {formErrors.amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.duration
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.duration && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (%) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.interestRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          interestRate: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.interestRate
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {formErrors.interestRate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.interestRate}
                      </p>
                    )}
                  </div>

                  {/* Maturity Amount Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maturity Amount
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span className="font-medium">
                        ₹
                        {formData.amount && formData.duration && formData.interestRate
                          ? calculateMaturityAmount(
                              parseFloat(formData.amount),
                              parseFloat(formData.duration),
                              parseFloat(formData.interestRate)
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPlan(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {editingPlan ? "Update" : "Create"} Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlans;