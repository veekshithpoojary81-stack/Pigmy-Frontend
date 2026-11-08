import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  History, 
  LogOut, 
  Home,
  Wallet,
  TrendingUp
} from 'lucide-react';
import { getCustomerProfile, logoutCustomer } from '../services/api';

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await getCustomerProfile();
      setCustomer(response.data.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // If there's an error, redirect to login
      logoutCustomer();
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-gray-600">Welcome back, {customer?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to Pigmy Savings!</h2>
          <p className="text-green-100">
            Manage your savings accounts and track your financial growth with us.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customer ID</p>
                <p className="text-xl font-bold text-gray-900">
                  {customer?.customerId}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-xl font-bold text-gray-900 capitalize">
                  {customer?.status}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{customer?.totalSavings?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">My Accounts</h3>
                <p className="text-gray-600">View your savings accounts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center">
              <History className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <p className="text-gray-600">View your transaction history</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <p className="text-gray-600">Update your information</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{customer?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email Address</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{customer?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{customer?.phone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{customer?.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{customer?.aadhaarNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nominee</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {customer?.nomineeName} ({customer?.nomineeRelation})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">
            Contact your assigned collector or visit our branch for assistance with your accounts.
          </p>
          {customer?.collectorId && (
            <div className="bg-white rounded p-4">
              <p className="font-medium text-gray-900">Your Collector: {customer.collectorId.name}</p>
              <p className="text-gray-600">Phone: {customer.collectorId.phone}</p>
              <p className="text-gray-600">Area: {customer.collectorId.area}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;