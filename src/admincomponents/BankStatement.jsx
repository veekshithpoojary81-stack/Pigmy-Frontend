import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Users,
  X
} from "lucide-react";

const BankStatement = ({ customer, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    currentBalance: 0,
    pendingWithdrawals: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    if (customer) {
      fetchBankStatement();
    }
  }, [customer]);

  const fetchBankStatement = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      
      console.log("Fetching bank statement for customer:", customer._id, customer.name);

      const response = await axios.get(
        `http://localhost:5000/api/payments/getallpayments/${customer._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      console.log("Bank statement API response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        
        // Filter out pending transactions and format for display
        const completedTransactions = (data.allTransactions || [])
          .filter(transaction => transaction.status !== 'pending')
          .map(transaction => ({
            ...transaction,
            date: transaction.date,
            time: new Date(transaction.date).toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            description: transaction.description || (transaction.type === 'payment' ? 'Daily Collection' : 'Withdrawal'),
            paidIn: transaction.type === 'payment' ? transaction.amount : '',
            paidOut: transaction.type === 'withdrawal' ? transaction.amount : '',
            balance: calculateRunningBalance(transaction, data.allTransactions)
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

        setTransactions(completedTransactions);
        setSummary(data.summary || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          currentBalance: 0,
          pendingWithdrawals: 0,
          totalTransactions: completedTransactions.length
        });
        
        console.log(`Loaded ${completedTransactions.length} completed transactions`);
        
        if (completedTransactions.length === 0) {
          setError("No completed transactions found for this customer.");
        }
      } else {
        setError(response.data.message || "Failed to load bank statement data");
      }

    } catch (error) {
      console.error("Error fetching bank statement:", error);
      if (error.response?.status === 404) {
        setError("Bank statement endpoint not found. Please check the backend route.");
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.code === 'ECONNABORTED') {
        setError("Request timeout. Please try again.");
      } else {
        setError(`Failed to load bank statement: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate running balance for each transaction
  const calculateRunningBalance = (currentTransaction, allTransactions) => {
    // Sort all transactions by date ascending
    const sortedTransactions = [...allTransactions]
      .filter(t => t.status !== 'pending')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    
    for (const transaction of sortedTransactions) {
      if (transaction.type === 'payment') {
        balance += transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        balance -= transaction.amount;
      }
      
      // Stop when we reach the current transaction
      if (transaction._id === currentTransaction._id) {
        break;
      }
    }
    
    return balance;
  };

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    if (dateFilter === "all") return matchesType;
    
    if (!transaction.date) return matchesType;
    
    const transactionDate = new Date(transaction.date);
    const now = new Date();
    
    switch (dateFilter) {
      case "today":
        return matchesType && transactionDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesType && transactionDate >= weekAgo;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return matchesType && transactionDate >= monthAgo;
      default:
        return matchesType;
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Bank Statement - ${customer.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .section-header { background-color: #e0e0e0; font-weight: bold; }
            .text-right { text-align: right; }
            .credit { color: #008000; }
            .debit { color: #ff0000; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pigmy Bank Statement</h1>
            <h2>${customer.name} - ${customer.customerId}</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <td colspan="2"><b>Branch Details</b></td>
                <td><b>Your Details</b></td>
                <td><b>Period</b></td>
                <td colspan="2"><b>PIGMY SAVINGS ACCOUNT</b></td>
              </tr>
              <tr>
                <td colspan="2"><b>MAIN BRANCH</b></td>
                <td><b>${customer.name.toUpperCase()}</b></td>
                <td colspan="2"><b>Total Deposits</b></td>
                <td class="text-right"><b>${formatCurrency(summary.totalDeposits)}</b></td>
              </tr>
              <tr>
                <td colspan="2"><b>PIGMY STREET</b></td>
                <td><b>${customer.address || 'N/A'}</b></td>
                <td colspan="2"><b>Total Withdrawals</b></td>
                <td class="text-right"><b>${formatCurrency(summary.totalWithdrawals)}</b></td>
              </tr>
              <tr>
                <td colspan="2"><b>PIGMY TOWN</b></td>
                <td><b>${customer.phone}</b></td>
                <td colspan="2"><b>Current Balance</b></td>
                <td class="text-right"><b>${formatCurrency(summary.currentBalance)}</b></td>
              </tr>
              <tr>
                <td colspan="2"><b>PIN: 560001</b></td>
                <td><b>${customer.email || 'N/A'}</b></td>
                <td colspan="2"><b>Pending Withdrawals</b></td>
                <td class="text-right"><b>${formatCurrency(summary.pendingWithdrawals)}</b></td>
              </tr>
            </thead>
          </table>

          <table>
            <thead>
              <tr>
                <th colspan="2">Date</th>
                <th>Time</th>
                <th>Description</th>
                <th>Paid in</th>
                <th>Paid Out</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr class="section-header">
                <td colspan="7">TRANSACTION HISTORY</td>
              </tr>
              ${filteredTransactions.map(t => `
                <tr>
                  <td colspan="2">${formatDate(t.date)}</td>
                  <td>${t.time}</td>
                  <td>${t.description}${t.reason ? ` - ${t.reason}` : ''}${t.collector ? ` (${t.collector})` : ''}</td>
                  <td class="text-right credit">${t.paidIn ? formatCurrency(t.paidIn) : ''}</td>
                  <td class="text-right debit">${t.paidOut ? formatCurrency(t.paidOut) : ''}</td>
                  <td class="text-right">${formatCurrency(t.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border: 1px solid #ddd;">
            <h3>Statement Summary</h3>
            <p>Total Transactions: ${filteredTransactions.length}</p>
            <p>Statement Period: ${dateFilter === 'all' ? 'All Time' : dateFilter}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bank statement for {customer.name}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bank Statement</h2>
              <p className="text-sm text-gray-600">Customer: {customer.name} - {customer.customerId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="payment">Deposits Only</option>
              <option value="withdrawal">Withdrawals Only</option>
            </select>
            <button
              onClick={fetchBankStatement}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Statement Header Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr>
                  <td colSpan="2" className="border border-gray-300 p-3 font-bold bg-gray-50">
                    Branch Details
                  </td>
                  <td className="border border-gray-300 p-3 font-bold bg-gray-50">
                    Your Details
                  </td>
                  <td className="border border-gray-300 p-3 font-bold bg-gray-50">
                    Period
                  </td>
                  <td colSpan="2" className="border border-gray-300 p-3 font-bold bg-gray-50 text-center">
                    PIGMY SAVINGS ACCOUNT
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="border border-gray-300 p-3 font-semibold">
                    MAIN BRANCH
                  </td>
                  <td className="border border-gray-300 p-3 font-semibold">
                    {customer.name.toUpperCase()}
                  </td>
                  <td colSpan="2" className="border border-gray-300 p-3 font-semibold">
                    Total Deposits
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-semibold">
                    {formatCurrency(summary.totalDeposits)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="border border-gray-300 p-3">
                    PIGMY STREET
                  </td>
                  <td className="border border-gray-300 p-3">
                    {customer.address || 'N/A'}
                  </td>
                  <td colSpan="2" className="border border-gray-300 p-3 font-semibold">
                    Total Withdrawals
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-semibold text-red-600">
                    {formatCurrency(summary.totalWithdrawals)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="border border-gray-300 p-3">
                    PIGMY TOWN
                  </td>
                  <td className="border border-gray-300 p-3">
                    {customer.phone}
                  </td>
                  <td colSpan="2" className="border border-gray-300 p-3 font-semibold">
                    Current Balance
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-semibold text-green-600">
                    {formatCurrency(summary.currentBalance)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="border border-gray-300 p-3">
                    PIN: 560001
                  </td>
                  <td className="border border-gray-300 p-3">
                    {customer.email || 'N/A'}
                  </td>
                  <td colSpan="2" className="border border-gray-300 p-3 font-semibold">
                    Pending Withdrawals
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-semibold text-yellow-600">
                    {formatCurrency(summary.pendingWithdrawals)}
                  </td>
                </tr>
              </thead>
            </table>
          </div>

          {/* Transactions Table */}
          <div className="border border-gray-300">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-300 p-3 text-left font-semibold" colSpan="2">
                    Date
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Time
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Paid in
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Paid Out
                  </th>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Section Header */}
                <tr className="bg-gray-100">
                  <td colSpan="7" className="border border-gray-300 p-3 font-bold">
                    TRANSACTION HISTORY
                  </td>
                </tr>

                {/* Transactions */}
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="border border-gray-300 p-4 text-center text-gray-500">
                      No completed transactions found for this period.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td colSpan="2" className="border border-gray-300 p-3 font-medium">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="border border-gray-300 p-3 text-gray-600">
                        {transaction.time}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {transaction.description}
                        {transaction.reason && ` - ${transaction.reason}`}
                        {transaction.collector && ` (${transaction.collector})`}
                      </td>
                      <td className="border border-gray-300 p-3 text-right text-green-600 font-medium">
                        {transaction.paidIn ? formatCurrency(transaction.paidIn) : ''}
                      </td>
                      <td className="border border-gray-300 p-3 text-right text-red-600 font-medium">
                        {transaction.paidOut ? formatCurrency(transaction.paidOut) : ''}
                      </td>
                      <td className="border border-gray-300 p-3 text-right font-medium">
                        {formatCurrency(transaction.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800">Total Deposits</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(summary.totalDeposits)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800">Total Withdrawals</div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(summary.totalWithdrawals)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800">Current Balance</div>
              <div className="text-lg font-bold text-gray-800">
                {formatCurrency(summary.currentBalance)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800">Total Transactions</div>
              <div className="text-lg font-bold text-gray-800">
                {filteredTransactions.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStatement;