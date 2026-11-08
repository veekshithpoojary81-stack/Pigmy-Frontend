import React, { useState } from "react";
import {
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  IndianRupee,
  Calendar,
} from "lucide-react";

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  });
  const [reportType, setReportType] = useState("overview");

  // Mock data for reports
  const reportData = {
    overview: {
      totalCollections: 1250000,
      totalWithdrawals: 450000,
      activeAccounts: 234,
      newCustomers: 45,
      totalInterest: 12500,
      averageDailyCollection: 12500,
    },
    collections: [
      {
        date: "2024-01-15",
        collector: "John Doe",
        amount: 25000,
        accounts: 25,
      },
      {
        date: "2024-01-14",
        collector: "Jane Smith",
        amount: 18000,
        accounts: 18,
      },
      {
        date: "2024-01-13",
        collector: "Mike Johnson",
        amount: 22000,
        accounts: 22,
      },
    ],
    customers: [
      {
        name: "Alice Brown",
        joinDate: "2024-01-15",
        totalSavings: 15000,
        collector: "John Doe",
      },
      {
        name: "Bob Wilson",
        joinDate: "2024-01-14",
        totalSavings: 8000,
        collector: "Jane Smith",
      },
      {
        name: "Carol Davis",
        joinDate: "2024-01-13",
        totalSavings: 12000,
        collector: "Mike Johnson",
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p
              className={`text-sm mt-1 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? "↑" : "↓"} {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const handleExport = () => {
    alert(
      `Exporting ${reportType} report for ${dateRange.startDate} to ${dateRange.endDate}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            View and analyze system performance
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overview">Overview</option>
                <option value="collections">Collections</option>
                <option value="customers">Customers</option>
                <option value="accounts">Accounts</option>
              </select>
            </div>
          </div>
          <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Filter className="h-5 w-5 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      {reportType === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Collections"
              value={`₹${reportData.overview.totalCollections.toLocaleString()}`}
              icon={IndianRupee}
              color="bg-green-100 text-green-600"
              change={12}
            />
            <StatCard
              title="Total Withdrawals"
              value={`₹${reportData.overview.totalWithdrawals.toLocaleString()}`}
              icon={TrendingUp}
              color="bg-blue-100 text-blue-600"
              change={8}
            />
            <StatCard
              title="Active Accounts"
              value={reportData.overview.activeAccounts}
              icon={CreditCard}
              color="bg-purple-100 text-purple-600"
              change={15}
            />
            <StatCard
              title="New Customers"
              value={reportData.overview.newCustomers}
              icon={Users}
              color="bg-orange-100 text-orange-600"
              change={22}
            />
            <StatCard
              title="Total Interest"
              value={`₹${reportData.overview.totalInterest.toLocaleString()}`}
              icon={BarChart3}
              color="bg-red-100 text-red-600"
              change={18}
            />
            <StatCard
              title="Avg Daily Collection"
              value={`₹${reportData.overview.averageDailyCollection.toLocaleString()}`}
              icon={Calendar}
              color="bg-indigo-100 text-indigo-600"
              change={5}
            />
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Collection Trends
              </h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">
                  Chart visualization would appear here
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Growth
              </h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">
                  Chart visualization would appear here
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Collections Report */}
      {reportType === "collections" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Collection Report
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accounts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.collections.map((collection, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.collector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{collection.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {collection.accounts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Report */}
      {reportType === "customers" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Report
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Savings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collector
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.customers.map((customer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{customer.totalSavings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.collector}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
