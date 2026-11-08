import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowUpDown,
  DollarSign,
  Clock,
  CreditCard,
  Wallet,
  Users,
  MessageSquare,
  ArrowDownToLine,
  LogOut,
  Settings,
  User,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Shield,
  Target,
} from "lucide-react";
import Navbar from "./Navbar";

// Import images (you'll need to add these images to your project)
// For now, I'll use placeholder images from Unsplash with piggy bank/savings theme

const PigmyXpressDashboard = () => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState({});
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  // Image URLs - Replace these with your actual image paths
  const images = {
    headerBg:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80",
    piggyBank:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    savings:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    coins:
      "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
    growth:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  };

 useEffect(() => {
 const token = localStorage.getItem("customerToken");
 if (!token) {
    navigate("/auth");
  }
 }, [])
 

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("customerToken");
        const customerData = JSON.parse(
          localStorage.getItem("customerData") || "{}"
        );

        if (!token || !customerData._id) {
          throw new Error("Please login to view transactions");
        }

        setCustomerData(customerData);

        const response = await axios.get(
          `http://localhost:5000/api/payments/getuserpayments/${customerData._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", response.data);

        const data = response.data.data;

        if (data) {
          setAllTransactions(data.allTransactions || []);
          setPayments(data.payments || []);
          setWithdrawals(data.withdrawals || []);
          setSummary(data.summary || {});
          setFilteredTransactions(data.allTransactions || []);
        }

        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch transactions"
        );
        console.error("Error fetching transactions:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerData");
          navigate("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  // Handle tab change
  useEffect(() => {
    switch (activeTab) {
      case "all":
        setFilteredTransactions(allTransactions);
        break;
      case "deposits":
        setFilteredTransactions(payments);
        break;
      case "withdrawals":
        setFilteredTransactions(withdrawals);
        break;
      default:
        setFilteredTransactions(allTransactions);
    }
  }, [activeTab, allTransactions, payments, withdrawals]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    let transactionsToSearch = [];

    switch (activeTab) {
      case "all":
        transactionsToSearch = allTransactions;
        break;
      case "deposits":
        transactionsToSearch = payments;
        break;
      case "withdrawals":
        transactionsToSearch = withdrawals;
        break;
      default:
        transactionsToSearch = allTransactions;
    }

    const filtered = transactionsToSearch.filter(
      (t) =>
        t.description?.toLowerCase().includes(value.toLowerCase()) ||
        t.category?.toLowerCase().includes(value.toLowerCase()) ||
        t.mode?.toLowerCase().includes(value.toLowerCase()) ||
        t.purpose?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const handleFilterType = (value) => {
    setTypeFilter(value);
  };

  const handleFilterStatus = (value) => {
    setStatusFilter(value);
    let transactionsToFilter = [];

    switch (activeTab) {
      case "all":
        transactionsToFilter = allTransactions;
        break;
      case "deposits":
        transactionsToFilter = payments;
        break;
      case "withdrawals":
        transactionsToFilter = withdrawals;
        break;
      default:
        transactionsToFilter = allTransactions;
    }

    if (value === "all") {
      setFilteredTransactions(transactionsToFilter);
    } else {
      setFilteredTransactions(
        transactionsToFilter.filter((t) => t.status === value)
      );
    }
  };

  const handleExport = () => {
    alert(
      "Export Started: Your transaction history is being prepared for download."
    );
  };

  const handleCustomerLogin = () => {
    navigate("/auth");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerData");
    navigate("/auth");
  };

  // Transform transaction data for display
  const transformTransaction = (transaction) => ({
    id:
      transaction._id ||
      transaction.id ||
      Math.random().toString(36).substr(2, 9),
    date: transaction.date
      ? new Date(transaction.date).toISOString().split("T")[0]
      : transaction.createdAt
      ? new Date(transaction.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    description:
      transaction.description ||
      transaction.purpose ||
      transaction.notes ||
      (transaction.type === "credit" ? "Deposit" : "Withdrawal"),
    amount: transaction.amount || 0,
    type: (
      transaction.type || (activeTab === "withdrawals" ? "debit" : "credit")
    ).toLowerCase(),
    status: (transaction.status || "completed").toLowerCase(),
    category:
      transaction.category ||
      (transaction.type === "credit" ? "Deposit" : "Withdrawal"),
    mode: transaction.mode || "Cash",
  });

  // StatsCard Component with enhanced design
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    iconColor,
    subtitle,
    gradient,
  }) => (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${gradient}`}
    >
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
                {trend.isPositive ? "↑" : "↓"} {trend.value} from last month
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

  // Tab Navigation Component with enhanced design
  const TabNavigation = ({ activeTab, onTabChange }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 mb-6">
      <div className="flex space-x-2">
        {[
          {
            id: "all",
            name: "All Withdrawal Transactions",
            count: allTransactions.length,
            icon: BarChart3,
          },
          // {
          //   id: "deposits",
          //   name: "Deposits",
          //   count: payments.length,
          //   icon: PiggyBank,
          // },
          // {
          //   id: "withdrawals",
          //   name: "Withdrawals",
          //   count: withdrawals.length,
          //   icon: ArrowDownToLine,
          // },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-4 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <tab.icon
                className={`h-5 w-5 ${
                  activeTab === tab.id ? "text-white" : "text-gray-400"
                }`}
              />
              <span>{tab.name}</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // TransactionList Component
  const TransactionList = ({ transactions }) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <span className="ml-3 text-gray-600 mt-4 block">
              Loading your transactions...
            </span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-semibold">
            Error loading transactions
          </p>
          <p className="text-red-500 mt-2">{error}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login Again
            </button>
          </div>
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PiggyBank className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xl font-semibold">
            No transactions found
          </p>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">
            {activeTab === "deposits"
              ? "Start your savings journey by making your first deposit!"
              : activeTab === "withdrawals"
              ? "No withdrawals made yet. Your withdrawal history will appear here."
              : "Welcome! Your transaction history will appear here as you start using your account."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const transformed = transformTransaction(transaction);
          return (
            <div
              key={transformed.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 group hover:border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        transformed.type === "credit"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {transformed.type === "credit" ? "DEPOSIT" : "WITHDRAWAL"}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        transformed.status === "completed"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : transformed.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {transformed.status.toUpperCase()}
                    </span>
                    {transformed.mode && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {transformed.mode.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {transformed.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {transformed.date}
                    </span>
                    <span>•</span>
                    <span>{transformed.category}</span>
                    {transformed.mode && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {transformed.mode}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      transformed.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transformed.type === "credit" ? "+" : "-"}₹
                    {transformed.amount.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm mt-2 px-3 py-1 rounded-full font-medium ${
                      transformed.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transformed.status === "pending"
                      ? "Processing"
                      : "Completed"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // FilterBar Component with enhanced design
  const FilterBar = ({ onSearch, onFilterStatus, onExport, activeTab }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={(e) => onSearch(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onChange={(e) => onFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {/* <button
          onClick={onExport}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
        >
          <ArrowDownToLine className="h-5 w-5" />
          Export
        </button> */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-screen mx-[-9rem] mt-[-32px] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header with Background Image */}
      {/* <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${images.headerBg})` }}
        ></div>
        <div className="relative container mx-auto px-4 py-8 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">PigmyXpress</h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Smart Savings & Financial Freedom
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-blue-200">Welcome back,</p>
                <p className="font-bold text-white text-lg">
                  {customerData.name || "Valued Customer"}
                </p>
                <p className="text-xs text-blue-300 mt-1">Member since 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header> */}
<Navbar/>
      <main className="container mx-auto px-4 py-8 -mt-6 relative z-50">
        {/* Welcome Section with Card Design */}

        {/* Quick Actions with Enhanced Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mt-[2rem]">
          {[
            {
              name: "Accounts",
              icon: Wallet,
              color: "blue",
              onClick: () => navigate("/accountspage"),
              description: "View balance",
            },
            // {
            //   name: "New Deposit",
            //   icon: PiggyBank,
            //   color: "green",
            //   onClick: () => navigate("/deposit"),
            //   description: "Add savings"
            // },
            {
              name: "Withdrawal",
              icon: ArrowDownToLine,
              color: "purple",
              onClick: () => navigate("/withdrawal"),
              description: "Withdraw funds",
            },
            {
              name: "Feedback",
              icon: MessageSquare,
              color: "orange",
              onClick: () => navigate("/feedback"),
              description: "Share thoughts",
            },
          ].map((action, index) => (
            <button
              key={action.name}
              onClick={action.onClick}
              className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center group hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-${action.color}-200`}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <action.icon className="h-8 w-8 text-white" />
              </div>
              <span className="font-semibold text-gray-900 block">
                {action.name}
              </span>
              <span className="text-sm text-gray-500 mt-1 block">
                {action.description}
              </span>
            </button>
          ))}
        </div>

        {/* Stats Cards with Gradient Backgrounds */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Current Balance"
            value={loading ? "..." : `₹${(summary.currentBalance || 0).toLocaleString("en-IN")}`}
            icon={DollarSign}
            trend={{ value: "8%", isPositive: true }}
            iconColor="bg-emerald-100 text-emerald-600"
            subtitle="Available balance"
            gradient="bg-gradient-to-br from-white to-emerald-50"
          />
          <StatsCard
            title="Total Deposits"
            value={loading ? "..." : `₹${(summary.totalDeposits || 0).toLocaleString("en-IN")}`}
            icon={PiggyBank}
            trend={{ value: "12%", isPositive: true }}
            iconColor="bg-blue-100 text-blue-600"
            subtitle="All time deposits"
            gradient="bg-gradient-to-br from-white to-blue-50"
          />
          <StatsCard
            title="Total Withdrawals"
            value={loading ? "..." : `₹${(summary.totalWithdrawals || 0).toLocaleString("en-IN")}`}
            icon={TrendingUp}
            iconColor="bg-purple-100 text-purple-600"
            subtitle="All time withdrawals"
            gradient="bg-gradient-to-br from-white to-purple-50"
          />
          <StatsCard
            title="Pending Withdrawals"
            value={loading ? "..." : `₹${(summary.pendingWithdrawals || 0).toLocaleString("en-IN")}`}
            icon={Clock}
            iconColor="bg-amber-100 text-amber-600"
            subtitle="Awaiting clearance"
            gradient="bg-gradient-to-br from-white to-amber-50"
          />
        </div> */}

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Filter Bar */}
        <FilterBar
          onSearch={handleSearch}
          onFilterStatus={handleFilterStatus}
          onExport={handleExport}
          activeTab={activeTab}
        />

        {/* Transaction List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === "all"
                ? "All Transactions"
                : activeTab === "deposits"
                ? "Your Deposit History"
                : "Your Withdrawal History"}
            </h2>
            {!loading && !error && filteredTransactions.length > 0 && (
              <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Showing {filteredTransactions.length} of{" "}
                {activeTab === "all"
                  ? allTransactions.length
                  : activeTab === "deposits"
                  ? payments.length
                  : withdrawals.length}{" "}
                {activeTab === "all" ? "transactions" : activeTab}
              </p>
            )}
          </div>
          <TransactionList transactions={filteredTransactions} />
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12 mt-16">
        <div className="container  px-4 mx-70">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[15%] ">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">PigmyXpress</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Your trusted partner in building financial security through
                smart savings and disciplined investment habits.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="block text-gray-300 hover:text-white transition-colors text-left"
                >
                  Home Dashboard
                </button>
                <button
                  onClick={handleCustomerLogin}
                  className="block text-gray-300 hover:text-white transition-colors text-left"
                >
                  Customer Portal
                </button>
                <button
                  onClick={handleAdminLogin}
                  className="block text-gray-300 hover:text-white transition-colors text-left"
                >
                  Admin System
                </button>
                <button
                  onClick={() => navigate("/feedback")}
                  className="block text-gray-300 hover:text-white transition-colors text-left"
                >
                  Support & Feedback
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  support@pigmyxpress.com
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +91 98765 43210
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Bangalore, India
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 PigmyXpress. Building Financial Freedom, One Rupee at
              a Time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PigmyXpressDashboard;
