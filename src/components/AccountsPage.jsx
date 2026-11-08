import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowLeft,
  QrCode,
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Info,
  Download,
  User,
  MapPin,
  Phone,
  FileText,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAccountsByCustomer,
  getCustomerProfile,
  getPaymentHistory,
  processPayment,
  withdrawAmount,
  getWithdrawalHistory,
} from "../services/api";
import Footer from "./Footer";
import Navbar from "./Navbar";

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [pendingPayments, setPendingPayments] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomPayment, setIsCustomPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [coveredPeriodsMap, setCoveredPeriodsMap] = useState({});
  const [paidPeriodsMap, setPaidPeriodsMap] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [showWithdrawalHistoryModal, setShowWithdrawalHistoryModal] =
    useState(false);
  const [loadingWithdrawalHistory, setLoadingWithdrawalHistory] =
    useState(false);

  useEffect(() => {
    loadCustomerAccounts();
    const storedPaidPeriods = JSON.parse(
      localStorage.getItem("paidPeriods") || "{}"
    );
    setPaidPeriodsMap(storedPaidPeriods);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/auth");
    }
  }, []);
  useEffect(() => {
    console.log("🔄 Pending payments updated:", pendingPayments);
  }, [pendingPayments]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadCustomerAccounts();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const loadCustomerAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔑 STEP 1: Checking localStorage...");
      const customerToken = localStorage.getItem("customerToken");
      console.log("📦 Customer token:", customerToken ? "EXISTS" : "MISSING");

      if (!customerToken) {
        setError("Please login first");
        return;
      }

      console.log("🔑 STEP 2: Fetching customer profile...");
      const profileResponse = await getCustomerProfile();
      console.log("✅ Profile response:", profileResponse.data);

      const customerData = profileResponse.data.data;
      setCustomer(customerData);
      console.log("👤 Customer ID:", customerData._id);

      console.log("🔑 STEP 3: Fetching customer accounts...");
      const accountsResponse = await getAccountsByCustomer(customerData._id);
      console.log("✅ Accounts response:", accountsResponse.data);

      const accountsData = accountsResponse.data.data || [];
      console.log("📊 Accounts found:", accountsData.length);

      const updatedAccounts = accountsData.map((account) => {
        const currentBalance = calculateCurrentBalance(account);
        return {
          ...account,
          currentBalance,
        };
      });

      setAccounts(updatedAccounts);
      calculatePendingPayments(updatedAccounts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("💥 Error loading customer accounts:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError("Failed to load your accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentBalance = (account) => {
    // First try to use the account's totalBalance (updated by backend)
    if (account.totalBalance !== undefined && account.totalBalance !== null) {
      return account.totalBalance;
    }

    // Fallback to transaction calculation if totalBalance is not available
    if (!account.transactions || account.transactions.length === 0) {
      return 0;
    }

    let balance = 0;

    account.transactions.forEach((transaction) => {
      if (transaction.type === "deposit") {
        // Add deposits only if they are completed/verified
        if (
          transaction.status === "completed" ||
          transaction.status === "verified"
        ) {
          balance += transaction.amount || 0;
        }
      } else if (transaction.type === "withdrawal") {
        // Subtract withdrawals only if they are completed/approved
        // Pending withdrawals should NOT affect the current balance
        if (
          transaction.status === "completed" ||
          transaction.status === "approved" ||
          transaction.status === "verified"
        ) {
          balance -= transaction.amount || 0;
        }
      }
    });

    return Math.max(0, balance); // Ensure balance doesn't go negative
  };

  const calculateMaturityAmount = (account, includeInterest = true) => {
    const dailyAmount = account.dailyAmount || 0;
    const duration = account.duration || account.planId?.duration || 0;
    const interestRate =
      account.planId?.interestRate || account.interestRate || 0;

    const totalPrincipal = dailyAmount * duration;

    if (!includeInterest) {
      // For progress calculation, return only principal amount
      return {
        principalAmount: totalPrincipal,
        interestAmount: 0,
        maturityAmount: totalPrincipal,
        interestRate,
      };
    }

    // For display purposes, include interest
    const interestAmount = (totalPrincipal * interestRate) / 100;
    const maturityAmount = totalPrincipal + interestAmount;

    return {
      principalAmount: totalPrincipal,
      interestAmount,
      maturityAmount: Math.round(maturityAmount),
      interestRate,
    };
  };

  const checkIfTodayPaid = (account, planType, transactions, missedPeriods) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If there are missed periods that include today, then today is NOT paid
    const hasMissedPeriodForToday = missedPeriods.some((period) => {
      const periodDate = new Date(period.date);
      periodDate.setHours(0, 0, 0, 0);

      switch (planType) {
        case "daily":
          return periodDate.getTime() === today.getTime();
        case "weekly":
          const weekStart = new Date(period.weekStart);
          const weekEnd = new Date(period.weekEnd);
          return today >= weekStart && today <= weekEnd;
        case "monthly":
          const monthStart = new Date(period.monthStart);
          const monthEnd = new Date(period.monthEnd);
          return today >= monthStart && today <= monthEnd;
        default:
          return false;
      }
    });

    if (hasMissedPeriodForToday) {
      return false; // Today is in missed periods, so NOT paid
    }

    // Check if there's a transaction for the current period
    switch (planType) {
      case "daily":
        // Check if there's a transaction for today
        return transactions.some((transaction) => {
          if (!transaction.date) return false;
          const transactionDate = new Date(transaction.date);
          transactionDate.setHours(0, 0, 0, 0);
          return (
            transactionDate.getTime() === today.getTime() &&
            (transaction.status === "completed" ||
              transaction.status === "verified")
          );
        });

      case "weekly":
        // Check if there's a transaction in the current week
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Saturday)
        weekEnd.setHours(23, 59, 59, 999);

        return transactions.some((transaction) => {
          if (!transaction.date) return false;
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate >= weekStart &&
            transactionDate <= weekEnd &&
            (transaction.status === "completed" ||
              transaction.status === "verified")
          );
        });

      case "monthly":
        // Check if there's a transaction in the current month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        return transactions.some((transaction) => {
          if (!transaction.date) return false;
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate >= monthStart &&
            transactionDate <= monthEnd &&
            (transaction.status === "completed" ||
              transaction.status === "verified")
          );
        });

      default:
        return false;
    }
  };

  // const calculatePendingPayments = (accountsData) => {
  //   const pending = {};
  //   const today = new Date();
  //   today.setHours(23, 59, 59, 999);

  //   const storedPaidPeriods = JSON.parse(
  //     localStorage.getItem("paidPeriods") || "{}"
  //   );

  //   accountsData.forEach((account) => {
  //     console.log(`\n🔄 Calculating pending for account: ${account.accountNumber}`);

  //     const accountPaidPeriods = storedPaidPeriods[account._id] || [];
  //     const paidPeriodIds = new Set(accountPaidPeriods.map((p) => p.periodId));

  //     const planType = getPlanTypeFromAccount(account);
  //     const transactions = account.transactions || [];
  //     const openingDate = new Date(account.openingDate || account.startDate);
  //     openingDate.setHours(0, 0, 0, 0);

  //     const dailyAmount = account.dailyAmount || 0;
  //     const duration = account.duration || account.planId?.duration || 0;

  //     // FIXED: Use principal-only maturity calculation for progress
  //     const progressMaturityCalculation = calculateMaturityAmount(account, false);
  //     const displayMaturityCalculation = calculateMaturityAmount(account, true);

  //     const progressMaturityAmount = progressMaturityCalculation.maturityAmount;
  //     const displayMaturityAmount = displayMaturityCalculation.maturityAmount;
  //     const principalAmount = progressMaturityCalculation.principalAmount;
  //     const interestAmount = displayMaturityCalculation.interestAmount;

  //     // ✅ FIXED: Use account.totalBalance for totalPaidAmount
  //     const totalPaidAmount = account.totalBalance || 0;

  //     // FIXED: Calculate remaining amount based on principal-only for progress
  //     let remainingMaturityAmount = Math.max(0, progressMaturityAmount - totalPaidAmount);
  //     const missedPeriods = [];

  //     // If maturity reached, no pending payments
  //     if (totalPaidAmount >= progressMaturityAmount) {
  //       pending[account._id] = {
  //         amount: 0,
  //         count: 0,
  //         hasPending: false,
  //         maturityAmount: displayMaturityAmount,
  //         progressMaturityAmount: progressMaturityAmount,
  //         principalAmount,
  //         interestAmount,
  //         totalPaidAmount,
  //         remainingMaturityAmount: 0,
  //         isMaturityReached: true,
  //         missedPeriods: [],
  //         pendingDays: 0,
  //         maturityCalculation: displayMaturityCalculation,
  //         progressMaturityCalculation: progressMaturityCalculation,
  //         hasPaidToday: true,
  //         fullPendingAmount: 0,
  //       };
  //       return;
  //     }

  //     let pendingAmount = 0;
  //     let pendingCount = 0;
  //     let fullPendingAmount = 0;

  //     // FIXED: Calculate pending periods based on plan type - ONLY UP TO TODAY
  //     if (planType === "daily") {
  //       const checkDate = new Date(openingDate);
  //       let dayCount = 0;
  //       const processedDates = new Set();

  //       // Only check dates up to today (not future dates)
  //       while (checkDate <= today && dayCount < duration) {
  //         const dateKey = checkDate.toISOString().split("T")[0];
  //         const periodId = `day-${dateKey}`;

  //         if (processedDates.has(dateKey)) {
  //           checkDate.setDate(checkDate.getDate() + 1);
  //           dayCount++;
  //           continue;
  //         }

  //         processedDates.add(dateKey);

  //         const hasTransactionForDate = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           const transactionDateKey = transactionDate
  //             .toISOString()
  //             .split("T")[0];
  //           return (
  //             transactionDateKey === dateKey &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         // Track all pending periods for full amount calculation
  //         if (!hasTransactionForDate && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(checkDate),
  //             amount: dailyAmount,
  //             type: "day",
  //             periodId: periodId,
  //           });
  //         }

  //         checkDate.setDate(checkDate.getDate() + 1);
  //         dayCount++;
  //       }

  //       // For daily plans, pending amount equals full pending amount
  //       pendingAmount = fullPendingAmount;
  //       pendingCount = missedPeriods.length;

  //     } else if (planType === "weekly") {
  //       // FIXED: Weekly plan calculation - only up to current week
  //       const checkDate = new Date(openingDate);
  //       let weekCount = 0;
  //       const processedWeeks = new Set();

  //       // Only check weeks up to current week (not future weeks)
  //       while (checkDate <= today && weekCount < duration) {
  //         const weekStart = new Date(checkDate);
  //         const weekEnd = new Date(checkDate);
  //         weekEnd.setDate(weekEnd.getDate() + 6); // Week ends 6 days later

  //         const weekKey = `week-${weekStart.toISOString().split("T")[0]}`;
  //         const periodId = weekKey;

  //         if (processedWeeks.has(weekKey)) {
  //           checkDate.setDate(checkDate.getDate() + 7);
  //           weekCount++;
  //           continue;
  //         }

  //         processedWeeks.add(weekKey);

  //         // Check if there's any transaction in this week
  //         const hasTransactionForWeek = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           return (
  //             transactionDate >= weekStart &&
  //             transactionDate <= weekEnd &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         // Track all pending periods for full amount calculation
  //         if (!hasTransactionForWeek && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(weekStart),
  //             amount: dailyAmount,
  //             type: "week",
  //             periodId: periodId,
  //             weekStart: new Date(weekStart),
  //             weekEnd: new Date(weekEnd),
  //           });
  //         }

  //         checkDate.setDate(checkDate.getDate() + 7);
  //         weekCount++;
  //       }

  //       // For weekly plans, pending amount equals full pending amount
  //       pendingAmount = fullPendingAmount;
  //       pendingCount = missedPeriods.length;

  //     } else if (planType === "monthly") {
  //       // Monthly plan calculation - only up to current month
  //       const checkDate = new Date(openingDate);
  //       let monthCount = 0;
  //       const processedMonths = new Set();

  //       // Only check months up to current month (not future months)
  //       while (checkDate <= today && monthCount < duration) {
  //         const monthStart = new Date(
  //           checkDate.getFullYear(),
  //           checkDate.getMonth(),
  //           1
  //         );
  //         const monthEnd = new Date(
  //           checkDate.getFullYear(),
  //           checkDate.getMonth() + 1,
  //           0
  //         );
  //         monthEnd.setHours(23, 59, 59, 999);

  //         const monthKey = `month-${monthStart.getFullYear()}-${
  //           monthStart.getMonth() + 1
  //         }`;
  //         const periodId = monthKey;

  //         if (processedMonths.has(monthKey)) {
  //           checkDate.setMonth(checkDate.getMonth() + 1);
  //           monthCount++;
  //           continue;
  //         }

  //         processedMonths.add(monthKey);

  //         // Check if there's any transaction in this month
  //         const hasTransactionForMonth = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           return (
  //             transactionDate >= monthStart &&
  //             transactionDate <= monthEnd &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         // Track all pending periods for full amount calculation
  //         if (!hasTransactionForMonth && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(monthStart),
  //             amount: dailyAmount,
  //             type: "month",
  //             periodId: periodId,
  //             monthStart: new Date(monthStart),
  //             monthEnd: new Date(monthEnd),
  //           });
  //         }

  //         checkDate.setMonth(checkDate.getMonth() + 1);
  //         monthCount++;
  //       }

  //       // For monthly plans, pending amount equals full pending amount
  //       pendingAmount = fullPendingAmount;
  //       pendingCount = missedPeriods.length;
  //     }

  //     // ✅ FIXED: Calculate additional pending periods due to withdrawals
  //     let additionalPendingFromWithdrawals = 0;

  //     // Calculate total withdrawals that affect the balance
  //     const totalWithdrawals = transactions.reduce((sum, transaction) => {
  //       if (transaction.type === "withdrawal" &&
  //           (transaction.status === "completed" ||
  //            transaction.status === "approved" ||
  //            transaction.status === "verified")) {
  //         return sum + (transaction.amount || 0);
  //       }
  //       return sum;
  //     }, 0);

  //     console.log("💰 Withdrawal Analysis:");
  //     console.log("- Total Withdrawals:", totalWithdrawals);
  //     console.log("- Daily Amount:", dailyAmount);

  //     // Convert withdrawal amount to equivalent number of periods
  //     if (dailyAmount > 0 && totalWithdrawals > 0) {
  //       additionalPendingFromWithdrawals = Math.ceil(totalWithdrawals / dailyAmount);
  //       console.log("- Additional Periods from Withdrawals:", additionalPendingFromWithdrawals);
  //     } else {
  //       console.log("- No additional periods from withdrawals");
  //     }

  //     // ✅ FIXED: Total pending count = missed periods + additional periods from withdrawals
  //     const totalPendingCount = pendingCount + additionalPendingFromWithdrawals;

  //     console.log("📊 Pending Summary:");
  //     console.log("- Missed Periods Count:", pendingCount);
  //     console.log("- Additional from Withdrawals:", additionalPendingFromWithdrawals);
  //     console.log("- Total Pending Count:", totalPendingCount);

  //     // ✅ FIXED: Calculate pending days based on remaining maturity amount (principal-only)
  //     const pendingDays = calculatePendingDays(
  //       account,
  //       remainingMaturityAmount,
  //       planType
  //     );

  //     // FIXED: Check if today's payment requirement is fulfilled (no pending for today)
  //     const hasPaidToday = checkIfTodayPaid(
  //       account,
  //       planType,
  //       transactions,
  //       missedPeriods
  //     );

  //     // ✅ FIXED: The key issue - hasPending should be true if there are pending days OR missed periods OR withdrawals
  //     const hasPendingPayments = remainingMaturityAmount > 0 || missedPeriods.length > 0 || additionalPendingFromWithdrawals > 0;

  //     pending[account._id] = {
  //       amount: pendingAmount,
  //       count: totalPendingCount, // ✅ FIXED: Use total pending count (missed periods + withdrawal periods)
  //       hasPending: hasPendingPayments,
  //       maturityAmount: displayMaturityAmount,
  //       progressMaturityAmount: progressMaturityAmount,
  //       principalAmount,
  //       interestAmount,
  //       totalPaidAmount,
  //       remainingMaturityAmount,
  //       isMaturityReached: totalPaidAmount >= progressMaturityAmount,
  //       missedPeriods,
  //       pendingDays,
  //       maturityCalculation: displayMaturityCalculation,
  //       progressMaturityCalculation: progressMaturityCalculation,
  //       planType: planType,
  //       hasPaidToday: hasPaidToday,
  //       fullPendingAmount: fullPendingAmount,
  //       // ✅ ADDED: For debugging and display
  //       additionalPendingFromWithdrawals: additionalPendingFromWithdrawals,
  //       totalWithdrawals: totalWithdrawals,
  //     };

  //     console.log(`📊 Account ${account.accountNumber} Final Pending Calculation:`, {
  //       totalBalance: account.totalBalance,
  //       totalPaidAmount: totalPaidAmount,
  //       progressMaturityAmount: progressMaturityAmount,
  //       remainingMaturityAmount: remainingMaturityAmount,
  //       pendingAmount: pendingAmount,
  //       fullPendingAmount: fullPendingAmount,
  //       pendingCount: pendingCount,
  //       additionalPendingFromWithdrawals: additionalPendingFromWithdrawals,
  //       totalPendingCount: totalPendingCount,
  //       pendingDays: pendingDays,
  //       hasPaidToday: hasPaidToday,
  //       missedPeriodsCount: missedPeriods.length,
  //       hasPending: hasPendingPayments,
  //       totalWithdrawals: totalWithdrawals,
  //       progress: ((totalPaidAmount / progressMaturityAmount) * 100).toFixed(1) + "%",
  //     });
  //   });

  //   setPendingPayments(pending);
  // };

  // FIXED: Enhanced pending payment calculation with proper withdrawal impact
  // const calculatePendingPayments = (accountsData) => {
  //   const pending = {};
  //   const today = new Date();
  //   today.setHours(23, 59, 59, 999);

  //   const storedPaidPeriods = JSON.parse(
  //     localStorage.getItem("paidPeriods") || "{}"
  //   );

  //   accountsData.forEach((account) => {
  //     console.log(
  //       `\n🔄 Calculating pending for account: ${account.accountNumber}`
  //     );

  //     const accountPaidPeriods = storedPaidPeriods[account._id] || [];
  //     const paidPeriodIds = new Set(accountPaidPeriods.map((p) => p.periodId));

  //     const planType = getPlanTypeFromAccount(account);
  //     const transactions = account.transactions || [];
  //     const openingDate = new Date(account.openingDate || account.startDate);
  //     openingDate.setHours(0, 0, 0, 0);

  //     const dailyAmount = account.dailyAmount || 0;
  //     const duration = account.duration || account.planId?.duration || 0;

  //     // FIXED: Use principal-only maturity calculation for progress
  //     const progressMaturityCalculation = calculateMaturityAmount(
  //       account,
  //       false
  //     );
  //     const displayMaturityCalculation = calculateMaturityAmount(account, true);

  //     const progressMaturityAmount = progressMaturityCalculation.maturityAmount;
  //     const displayMaturityAmount = displayMaturityCalculation.maturityAmount;
  //     const principalAmount = progressMaturityCalculation.principalAmount;
  //     const interestAmount = displayMaturityCalculation.interestAmount;

  //     // ✅ FIXED: Use account.totalBalance for totalPaidAmount
  //     const totalPaidAmount = account.totalBalance || 0;

  //     // FIXED: Calculate remaining amount based on principal-only for progress
  //     let remainingMaturityAmount = Math.max(
  //       0,
  //       progressMaturityAmount - totalPaidAmount
  //     );
  //     const missedPeriods = [];

  //     // If maturity reached, no pending payments
  //     if (totalPaidAmount >= progressMaturityAmount) {
  //       pending[account._id] = {
  //         amount: 0,
  //         count: 0,
  //         hasPending: false,
  //         maturityAmount: displayMaturityAmount,
  //         progressMaturityAmount: progressMaturityAmount,
  //         principalAmount,
  //         interestAmount,
  //         totalPaidAmount,
  //         remainingMaturityAmount: 0,
  //         isMaturityReached: true,
  //         missedPeriods: [],
  //         pendingDays: 0,
  //         maturityCalculation: displayMaturityCalculation,
  //         progressMaturityCalculation: progressMaturityCalculation,
  //         hasPaidToday: true,
  //         fullPendingAmount: 0,
  //       };
  //       return;
  //     }

  //     let pendingAmount = 0;
  //     let pendingCount = 0;
  //     let fullPendingAmount = 0;

  //     // ✅ FIXED: NEW LOGIC - Calculate expected amount based on days passed
  //     let expectedAmount = 0;
  //     let daysPassed = 0;

  //     if (planType === "daily") {
  //       // Calculate days between opening date and today
  //       const timeDiff = today.getTime() - openingDate.getTime();
  //       daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  //       daysPassed = Math.min(daysPassed, duration); // Don't exceed plan duration

  //       expectedAmount = daysPassed * dailyAmount;

  //       console.log("📅 Daily Plan Calculation:");
  //       console.log("- Opening Date:", openingDate.toDateString());
  //       console.log("- Today:", today.toDateString());
  //       console.log("- Days Passed:", daysPassed);
  //       console.log("- Daily Amount:", dailyAmount);
  //       console.log("- Expected Amount:", expectedAmount);
  //       console.log("- Current Balance:", totalPaidAmount);

  //       // Calculate pending count based on difference
  //       const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
  //       pendingCount = Math.ceil(amountDifference / dailyAmount);

  //       console.log("- Amount Difference:", amountDifference);
  //       console.log("- Pending Count:", pendingCount);

  //       // Also calculate missed periods for historical tracking
  //       const checkDate = new Date(openingDate);
  //       let dayCount = 0;
  //       const processedDates = new Set();

  //       while (checkDate <= today && dayCount < duration) {
  //         const dateKey = checkDate.toISOString().split("T")[0];
  //         const periodId = `day-${dateKey}`;

  //         if (processedDates.has(dateKey)) {
  //           checkDate.setDate(checkDate.getDate() + 1);
  //           dayCount++;
  //           continue;
  //         }

  //         processedDates.add(dateKey);

  //         const hasTransactionForDate = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           const transactionDateKey = transactionDate
  //             .toISOString()
  //             .split("T")[0];
  //           return (
  //             transactionDateKey === dateKey &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         if (!hasTransactionForDate && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(checkDate),
  //             amount: dailyAmount,
  //             type: "day",
  //             periodId: periodId,
  //           });
  //         }

  //         checkDate.setDate(checkDate.getDate() + 1);
  //         dayCount++;
  //       }

  //       pendingAmount = fullPendingAmount;
  //     } else if (planType === "weekly") {
  //       // Weekly plan logic (similar approach but for weeks)
  //       const checkDate = new Date(openingDate);
  //       let weekCount = 0;
  //       const processedWeeks = new Set();

  //       while (checkDate <= today && weekCount < duration) {
  //         const weekStart = new Date(checkDate);
  //         const weekEnd = new Date(checkDate);
  //         weekEnd.setDate(weekEnd.getDate() + 6);

  //         const weekKey = `week-${weekStart.toISOString().split("T")[0]}`;
  //         const periodId = weekKey;

  //         if (processedWeeks.has(weekKey)) {
  //           checkDate.setDate(checkDate.getDate() + 7);
  //           weekCount++;
  //           continue;
  //         }

  //         processedWeeks.add(weekKey);

  //         const hasTransactionForWeek = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           return (
  //             transactionDate >= weekStart &&
  //             transactionDate <= weekEnd &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         if (!hasTransactionForWeek && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(weekStart),
  //             amount: dailyAmount,
  //             type: "week",
  //             periodId: periodId,
  //             weekStart: new Date(weekStart),
  //             weekEnd: new Date(weekEnd),
  //           });
  //         }

  //         checkDate.setDate(checkDate.getDate() + 7);
  //         weekCount++;
  //       }

  //       // For weekly plans, calculate expected weeks
  //       const timeDiff = today.getTime() - openingDate.getTime();
  //       const weeksPassed = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
  //       expectedAmount = Math.min(weeksPassed, duration) * dailyAmount;

  //       const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
  //       pendingCount = Math.ceil(amountDifference / dailyAmount);

  //       pendingAmount = fullPendingAmount;
  //     } else if (planType === "monthly") {
  //       // Monthly plan logic
  //       const checkDate = new Date(openingDate);
  //       let monthCount = 0;
  //       const processedMonths = new Set();

  //       while (checkDate <= today && monthCount < duration) {
  //         const monthStart = new Date(
  //           checkDate.getFullYear(),
  //           checkDate.getMonth(),
  //           1
  //         );
  //         const monthEnd = new Date(
  //           checkDate.getFullYear(),
  //           checkDate.getMonth() + 1,
  //           0
  //         );
  //         monthEnd.setHours(23, 59, 59, 999);

  //         const monthKey = `month-${monthStart.getFullYear()}-${
  //           monthStart.getMonth() + 1
  //         }`;
  //         const periodId = monthKey;

  //         if (processedMonths.has(monthKey)) {
  //           checkDate.setMonth(checkDate.getMonth() + 1);
  //           monthCount++;
  //           continue;
  //         }

  //         processedMonths.add(monthKey);

  //         const hasTransactionForMonth = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           return (
  //             transactionDate >= monthStart &&
  //             transactionDate <= monthEnd &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         if (!hasTransactionForMonth && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(monthStart),
  //             amount: dailyAmount,
  //             type: "month",
  //             periodId: periodId,
  //             monthStart: new Date(monthStart),
  //             monthEnd: new Date(monthEnd),
  //           });
  //         }

  //         checkDate.setMonth(checkDate.getMonth() + 1);
  //         monthCount++;
  //       }

  //       // For monthly plans, calculate expected months
  //       const monthsPassed =
  //         (today.getFullYear() - openingDate.getFullYear()) * 12 +
  //         (today.getMonth() - openingDate.getMonth());
  //       expectedAmount = Math.min(monthsPassed + 1, duration) * dailyAmount;

  //       const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
  //       pendingCount = Math.ceil(amountDifference / dailyAmount);

  //       pendingAmount = fullPendingAmount;
  //     }

  //     console.log("💰 Final Pending Calculation:");
  //     console.log("- Expected Amount:", expectedAmount);
  //     console.log("- Current Balance:", totalPaidAmount);
  //     console.log("- Pending Count:", pendingCount);

  //     // ✅ FIXED: Calculate pending days based on remaining maturity amount (principal-only)
  //     const pendingDays = calculatePendingDays(
  //       account,
  //       remainingMaturityAmount,
  //       planType
  //     );

  //     // FIXED: Check if today's payment requirement is fulfilled (no pending for today)
  //     const hasPaidToday = checkIfTodayPaid(
  //       account,
  //       planType,
  //       transactions,
  //       missedPeriods
  //     );

  //     // ✅ FIXED: The key issue - hasPending should be true if there are pending days OR missed periods
  //     const hasPendingPayments =
  //       remainingMaturityAmount > 0 ||
  //       missedPeriods.length > 0 ||
  //       pendingCount > 0;

  //     pending[account._id] = {
  //       amount: pendingAmount,
  //       count: pendingCount, // ✅ FIXED: Use calculated pending count
  //       hasPending: hasPendingPayments,
  //       maturityAmount: displayMaturityAmount,
  //       progressMaturityAmount: progressMaturityAmount,
  //       principalAmount,
  //       interestAmount,
  //       totalPaidAmount,
  //       remainingMaturityAmount,
  //       isMaturityReached: totalPaidAmount >= progressMaturityAmount,
  //       missedPeriods,
  //       pendingDays,
  //       maturityCalculation: displayMaturityCalculation,
  //       progressMaturityCalculation: progressMaturityCalculation,
  //       planType: planType,
  //       hasPaidToday: hasPaidToday,
  //       fullPendingAmount: fullPendingAmount,
  //       // ✅ ADDED: For debugging and display
  //       expectedAmount: expectedAmount,
  //       daysPassed: daysPassed,
  //     };

  //     console.log(
  //       `📊 Account ${account.accountNumber} Final Pending Calculation:`,
  //       {
  //         totalBalance: account.totalBalance,
  //         totalPaidAmount: totalPaidAmount,
  //         expectedAmount: expectedAmount,
  //         progressMaturityAmount: progressMaturityAmount,
  //         remainingMaturityAmount: remainingMaturityAmount,
  //         pendingAmount: pendingAmount,
  //         fullPendingAmount: fullPendingAmount,
  //         pendingCount: pendingCount,
  //         pendingDays: pendingDays,
  //         hasPaidToday: hasPaidToday,
  //         missedPeriodsCount: missedPeriods.length,
  //         hasPending: hasPendingPayments,
  //         progress:
  //           ((totalPaidAmount / progressMaturityAmount) * 100).toFixed(1) + "%",
  //       }
  //     );
  //   });

  //   setPendingPayments(pending);
  // };
  // FIXED: Enhanced pending payment calculation - removed extra count
  // const calculatePendingPayments = (accountsData) => {
  //   const pending = {};
  //   const today = new Date();
  //   today.setHours(23, 59, 59, 999);

  //   const storedPaidPeriods = JSON.parse(
  //     localStorage.getItem("paidPeriods") || "{}"
  //   );

  //   accountsData.forEach((account) => {
  //     console.log(
  //       `\n🔄 Calculating pending for account: ${account.accountNumber}`
  //     );

  //     const accountPaidPeriods = storedPaidPeriods[account._id] || [];
  //     const paidPeriodIds = new Set(accountPaidPeriods.map((p) => p.periodId));

  //     const planType = getPlanTypeFromAccount(account);
  //     const transactions = account.transactions || [];
  //     const openingDate = new Date(account.openingDate || account.startDate);
  //     openingDate.setHours(0, 0, 0, 0);

  //     const dailyAmount = account.dailyAmount || 0;
  //     const duration = account.duration || account.planId?.duration || 0;

  //     // FIXED: Use principal-only maturity calculation for progress
  //     const progressMaturityCalculation = calculateMaturityAmount(
  //       account,
  //       false
  //     );
  //     const displayMaturityCalculation = calculateMaturityAmount(account, true);

  //     const progressMaturityAmount = progressMaturityCalculation.maturityAmount;
  //     const displayMaturityAmount = displayMaturityCalculation.maturityAmount;
  //     const principalAmount = progressMaturityCalculation.principalAmount;
  //     const interestAmount = displayMaturityCalculation.interestAmount;

  //     // ✅ FIXED: Use account.totalBalance for totalPaidAmount
  //     const totalPaidAmount = account.totalBalance || 0;

  //     // FIXED: Calculate remaining amount based on principal-only for progress
  //     let remainingMaturityAmount = Math.max(
  //       0,
  //       progressMaturityAmount - totalPaidAmount
  //     );
  //     const missedPeriods = [];

  //     // If maturity reached, no pending payments
  //     if (totalPaidAmount >= progressMaturityAmount) {
  //       pending[account._id] = {
  //         amount: 0,
  //         count: 0,
  //         hasPending: false,
  //         maturityAmount: displayMaturityAmount,
  //         progressMaturityAmount: progressMaturityAmount,
  //         principalAmount,
  //         interestAmount,
  //         totalPaidAmount,
  //         remainingMaturityAmount: 0,
  //         isMaturityReached: true,
  //         missedPeriods: [],
  //         pendingDays: 0,
  //         maturityCalculation: displayMaturityCalculation,
  //         progressMaturityCalculation: progressMaturityCalculation,
  //         hasPaidToday: true,
  //         fullPendingAmount: 0,
  //       };
  //       return;
  //     }

  //     let pendingAmount = 0;
  //     let pendingCount = 0;
  //     let fullPendingAmount = 0;

  //     // ✅ FIXED: NEW LOGIC - Calculate expected amount based on days passed
  //     let expectedAmount = 0;
  //     let daysPassed = 0;

  //     if (planType === "daily") {
  //       // FIXED: Calculate days between opening date and today WITHOUT the +1
  //       const timeDiff = today.getTime() - openingDate.getTime();
  //       daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24)); // REMOVED: +1 that was causing extra day
  //       daysPassed = Math.min(daysPassed, duration); // Don't exceed plan duration

  //       expectedAmount = daysPassed * dailyAmount;

  //       console.log("📅 Daily Plan Calculation:");
  //       console.log("- Opening Date:", openingDate.toDateString());
  //       console.log("- Today:", today.toDateString());
  //       console.log("- Days Passed:", daysPassed);
  //       console.log("- Daily Amount:", dailyAmount);
  //       console.log("- Expected Amount:", expectedAmount);
  //       console.log("- Current Balance:", totalPaidAmount);

  //       // Calculate pending count based on difference
  //       const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
  //       pendingCount = Math.ceil(amountDifference / dailyAmount);

  //       console.log("- Amount Difference:", amountDifference);
  //       console.log("- Pending Count:", pendingCount);

  //       // Also calculate missed periods for historical tracking
  //       const checkDate = new Date(openingDate);
  //       let dayCount = 0;
  //       const processedDates = new Set();

  //       while (checkDate <= today && dayCount < duration) {
  //         const dateKey = checkDate.toISOString().split("T")[0];
  //         const periodId = `day-${dateKey}`;

  //         if (processedDates.has(dateKey)) {
  //           checkDate.setDate(checkDate.getDate() + 1);
  //           dayCount++;
  //           continue;
  //         }

  //         processedDates.add(dateKey);

  //         const hasTransactionForDate = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           const transactionDateKey = transactionDate
  //             .toISOString()
  //             .split("T")[0];
  //           return (
  //             transactionDateKey === dateKey &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         if (!hasTransactionForDate && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(checkDate),
  //             amount: dailyAmount,
  //             type: "day",
  //             periodId: periodId,
  //           });
  //         }

  //         checkDate.setDate(checkDate.getDate() + 1);
  //         dayCount++;
  //       }

  //       pendingAmount = fullPendingAmount;
  //     } else if (planType === "weekly") {
  //       // Weekly plan logic (similar approach but for weeks)
  //       const checkDate = new Date(openingDate);
  //       let weekCount = 0;
  //       const processedWeeks = new Set();

  //       while (checkDate <= today && weekCount < duration) {
  //         const weekStart = new Date(checkDate);
  //         const weekEnd = new Date(checkDate);
  //         weekEnd.setDate(weekEnd.getDate() + 6);

  //         const weekKey = `week-${weekStart.toISOString().split("T")[0]}`;
  //         const periodId = weekKey;

  //         if (processedWeeks.has(weekKey)) {
  //           checkDate.setDate(checkDate.getDate() + 7);
  //           weekCount++;
  //           continue;
  //         }

  //         processedWeeks.add(weekKey);

  //         const hasTransactionForWeek = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           return (
  //             transactionDate >= weekStart &&
  //             transactionDate <= weekEnd &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         if (!hasTransactionForWeek && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(weekStart),
  //             amount: dailyAmount,
  //             type: "week",
  //             periodId: periodId,
  //             weekStart: new Date(weekStart),
  //             weekEnd: new Date(weekEnd),
  //           });
  //         }

  //         checkDate.setDate(checkDate.getDate() + 7);
  //         weekCount++;
  //       }

  //       // For weekly plans, calculate expected weeks
  //       const timeDiff = today.getTime() - openingDate.getTime();
  //       const weeksPassed = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
  //       expectedAmount = Math.min(weeksPassed, duration) * dailyAmount;

  //       const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
  //       pendingCount = Math.ceil(amountDifference / dailyAmount);

  //       pendingAmount = fullPendingAmount;
  //     } else if (planType === "monthly") {
  //       // Monthly plan logic
  //       const checkDate = new Date(openingDate);
  //       let monthCount = 0;
  //       const processedMonths = new Set();

  //       while (checkDate <= today && monthCount < duration) {
  //         const monthStart = new Date(
  //           checkDate.getFullYear(),
  //           checkDate.getMonth(),
  //           1
  //         );
  //         const monthEnd = new Date(
  //           checkDate.getFullYear(),
  //           checkDate.getMonth() + 1,
  //           0
  //         );
  //         monthEnd.setHours(23, 59, 59, 999);

  //         const monthKey = `month-${monthStart.getFullYear()}-${
  //           monthStart.getMonth() + 1
  //         }`;
  //         const periodId = monthKey;

  //         if (processedMonths.has(monthKey)) {
  //           checkDate.setMonth(checkDate.getMonth() + 1);
  //           monthCount++;
  //           continue;
  //         }

  //         processedMonths.add(monthKey);

  //         const hasTransactionForMonth = transactions.some((transaction) => {
  //           if (!transaction.date) return false;
  //           const transactionDate = new Date(transaction.date);
  //           return (
  //             transactionDate >= monthStart &&
  //             transactionDate <= monthEnd &&
  //             (transaction.status === "completed" ||
  //               transaction.status === "verified")
  //           );
  //         });

  //         const isPeriodPaid = paidPeriodIds.has(periodId);

  //         if (!hasTransactionForMonth && !isPeriodPaid) {
  //           fullPendingAmount += dailyAmount;
  //           missedPeriods.push({
  //             date: new Date(monthStart),
  //             amount: dailyAmount,
  //             type: "month",
  //             periodId: periodId,
  //             monthStart: new Date(monthStart),
  //             monthEnd: new Date(monthEnd),
  //           });
  //         }

  //         checkDate.setMonth(checkDate.getMonth() + 1);
  //         monthCount++;
  //       }

  //       // For monthly plans, calculate expected months
  //       const monthsPassed =
  //         (today.getFullYear() - openingDate.getFullYear()) * 12 +
  //         (today.getMonth() - openingDate.getMonth());
  //       expectedAmount = Math.min(monthsPassed, duration) * dailyAmount; // REMOVED: +1 that was causing extra month

  //       const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
  //       pendingCount = Math.ceil(amountDifference / dailyAmount);

  //       pendingAmount = fullPendingAmount;
  //     }

  //     console.log("💰 Final Pending Calculation:");
  //     console.log("- Expected Amount:", expectedAmount);
  //     console.log("- Current Balance:", totalPaidAmount);
  //     console.log("- Pending Count:", pendingCount);

  //     // ✅ FIXED: Calculate pending days based on remaining maturity amount (principal-only)
  //     const pendingDays = calculatePendingDays(
  //       account,
  //       remainingMaturityAmount,
  //       planType
  //     );

  //     // FIXED: Check if today's payment requirement is fulfilled (no pending for today)
  //     const hasPaidToday = checkIfTodayPaid(
  //       account,
  //       planType,
  //       transactions,
  //       missedPeriods
  //     );

  //     // ✅ FIXED: The key issue - hasPending should be true if there are pending days OR missed periods
  //     const hasPendingPayments =
  //       remainingMaturityAmount > 0 ||
  //       missedPeriods.length > 0 ||
  //       pendingCount > 0;

  //     pending[account._id] = {
  //       amount: pendingAmount,
  //       count: pendingCount, // ✅ FIXED: Use calculated pending count
  //       hasPending: hasPendingPayments,
  //       maturityAmount: displayMaturityAmount,
  //       progressMaturityAmount: progressMaturityAmount,
  //       principalAmount,
  //       interestAmount,
  //       totalPaidAmount,
  //       remainingMaturityAmount,
  //       isMaturityReached: totalPaidAmount >= progressMaturityAmount,
  //       missedPeriods,
  //       pendingDays,
  //       maturityCalculation: displayMaturityCalculation,
  //       progressMaturityCalculation: progressMaturityCalculation,
  //       planType: planType,
  //       hasPaidToday: hasPaidToday,
  //       fullPendingAmount: fullPendingAmount,
  //       // ✅ ADDED: For debugging and display
  //       expectedAmount: expectedAmount,
  //       daysPassed: daysPassed,
  //     };

  //     console.log(
  //       `📊 Account ${account.accountNumber} Final Pending Calculation:`,
  //       {
  //         totalBalance: account.totalBalance,
  //         totalPaidAmount: totalPaidAmount,
  //         expectedAmount: expectedAmount,
  //         progressMaturityAmount: progressMaturityAmount,
  //         remainingMaturityAmount: remainingMaturityAmount,
  //         pendingAmount: pendingAmount,
  //         fullPendingAmount: fullPendingAmount,
  //         pendingCount: pendingCount,
  //         pendingDays: pendingDays,
  //         hasPaidToday: hasPaidToday,
  //         missedPeriodsCount: missedPeriods.length,
  //         hasPending: hasPendingPayments,
  //         progress:
  //           ((totalPaidAmount / progressMaturityAmount) * 100).toFixed(1) + "%",
  //       }
  //     );
  //   });

  //   setPendingPayments(pending);
  // };
  // FIXED: Enhanced pending payment calculation that properly handles withdrawals
  // FIXED: Correct pending calculation that properly identifies missed periods
  const calculatePendingPayments = (accountsData) => {
    const pending = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const storedPaidPeriods = JSON.parse(
      localStorage.getItem("paidPeriods") || "{}"
    );

    accountsData.forEach((account) => {
      console.log(
        `\n🔄 Calculating pending for account: ${account.accountNumber}`
      );

      const accountPaidPeriods = storedPaidPeriods[account._id] || [];
      const paidPeriodIds = new Set(accountPaidPeriods.map((p) => p.periodId));

      const planType = getPlanTypeFromAccount(account);
      const transactions = account.transactions || [];
      const openingDate = new Date(account.openingDate || account.startDate);
      openingDate.setHours(0, 0, 0, 0);

      const dailyAmount = account.dailyAmount || 0;
      const duration = account.duration || account.planId?.duration || 0;

      // Calculate maturity amounts
      const progressMaturityCalculation = calculateMaturityAmount(
        account,
        false
      );
      const displayMaturityCalculation = calculateMaturityAmount(account, true);

      const progressMaturityAmount = progressMaturityCalculation.maturityAmount;
      const displayMaturityAmount = displayMaturityCalculation.maturityAmount;
      const principalAmount = progressMaturityCalculation.principalAmount;
      const interestAmount = displayMaturityCalculation.interestAmount;

      // Use account.totalBalance for totalPaidAmount
      const totalPaidAmount = account.totalBalance || 0;

      // Calculate remaining amount
      let remainingMaturityAmount = Math.max(
        0,
        progressMaturityAmount - totalPaidAmount
      );

      // If maturity reached, no pending payments
      if (totalPaidAmount >= progressMaturityAmount) {
        pending[account._id] = {
          amount: 0,
          count: 0,
          hasPending: false,
          maturityAmount: displayMaturityAmount,
          progressMaturityAmount: progressMaturityAmount,
          principalAmount,
          interestAmount,
          totalPaidAmount,
          remainingMaturityAmount: 0,
          isMaturityReached: true,
          missedPeriods: [],
          pendingDays: 0,
          maturityCalculation: displayMaturityCalculation,
          progressMaturityCalculation: progressMaturityCalculation,
          hasPaidToday: true,
          fullPendingAmount: 0,
        };
        return;
      }

      let pendingAmount = 0;
      let pendingCount = 0;
      const missedPeriods = [];

      // ✅ FIXED: SIMPLIFIED LOGIC - Calculate based on expected vs actual
      if (planType === "daily") {
        // Calculate days between opening date and today
        const timeDiff = today.getTime() - openingDate.getTime();
        const daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const effectiveDaysPassed = Math.min(daysPassed, duration);

        // Expected amount based on time passed
        const expectedAmount = effectiveDaysPassed * dailyAmount;

        console.log("📅 Daily Plan Calculation:", {
          openingDate: openingDate.toDateString(),
          today: today.toDateString(),
          daysPassed,
          effectiveDaysPassed,
          dailyAmount,
          expectedAmount,
          currentBalance: totalPaidAmount,
        });

        // Calculate pending based on difference
        const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
        pendingCount = Math.ceil(amountDifference / dailyAmount);
        pendingAmount = pendingCount * dailyAmount;

        console.log("💰 Pending Calculation:", {
          amountDifference,
          pendingCount,
          pendingAmount,
        });

        // Also populate missed periods for display
        if (pendingCount > 0) {
          const checkDate = new Date(openingDate);
          for (let i = 0; i < effectiveDaysPassed; i++) {
            const dateKey = checkDate.toISOString().split("T")[0];
            const periodId = `day-${dateKey}`;

            const hasTransactionForDate = transactions.some((transaction) => {
              if (!transaction.date) return false;
              const transactionDate = new Date(transaction.date);
              const transactionDateKey = transactionDate
                .toISOString()
                .split("T")[0];
              return (
                transactionDateKey === dateKey &&
                (transaction.status === "completed" ||
                  transaction.status === "verified")
              );
            });

            const isPeriodPaid = paidPeriodIds.has(periodId);

            if (!hasTransactionForDate && !isPeriodPaid) {
              missedPeriods.push({
                date: new Date(checkDate),
                amount: dailyAmount,
                type: "day",
                periodId: periodId,
              });
            }

            checkDate.setDate(checkDate.getDate() + 1);
          }
        }
      } else if (planType === "weekly") {
        // Weekly plan calculation
        const timeDiff = today.getTime() - openingDate.getTime();
        const weeksPassed = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
        const effectiveWeeksPassed = Math.min(weeksPassed, duration);

        const expectedAmount = effectiveWeeksPassed * dailyAmount;
        const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
        pendingCount = Math.ceil(amountDifference / dailyAmount);
        pendingAmount = pendingCount * dailyAmount;
      } else if (planType === "monthly") {
        // Monthly plan calculation
        const monthsPassed =
          (today.getFullYear() - openingDate.getFullYear()) * 12 +
          (today.getMonth() - openingDate.getMonth());
        const effectiveMonthsPassed = Math.min(monthsPassed, duration);

        const expectedAmount = effectiveMonthsPassed * dailyAmount;
        const amountDifference = Math.max(0, expectedAmount - totalPaidAmount);
        pendingCount = Math.ceil(amountDifference / dailyAmount);
        pendingAmount = pendingCount * dailyAmount;
      }

      // Calculate pending days
      const pendingDays = calculatePendingDays(
        account,
        remainingMaturityAmount,
        planType
      );

      // Check if today is paid
      const hasPaidToday = checkIfTodayPaid(
        account,
        planType,
        transactions,
        missedPeriods
      );

      const hasPendingPayments = pendingCount > 0;

      pending[account._id] = {
        amount: pendingAmount,
        count: pendingCount,
        hasPending: hasPendingPayments,
        maturityAmount: displayMaturityAmount,
        progressMaturityAmount: progressMaturityAmount,
        principalAmount,
        interestAmount,
        totalPaidAmount,
        remainingMaturityAmount,
        isMaturityReached: totalPaidAmount >= progressMaturityAmount,
        missedPeriods,
        pendingDays,
        maturityCalculation: displayMaturityCalculation,
        progressMaturityCalculation: progressMaturityCalculation,
        planType: planType,
        hasPaidToday: hasPaidToday,
        fullPendingAmount: pendingAmount,
      };

      console.log(
        `📊 Account ${account.accountNumber} Final Pending Calculation:`,
        {
          totalBalance: account.totalBalance,
          totalPaidAmount: totalPaidAmount,
          progressMaturityAmount: progressMaturityAmount,
          remainingMaturityAmount: remainingMaturityAmount,
          pendingAmount: pendingAmount,
          pendingCount: pendingCount,
          pendingDays: pendingDays,
          hasPaidToday: hasPaidToday,
          missedPeriodsCount: missedPeriods.length,
          hasPending: hasPendingPayments,
          progress:
            ((totalPaidAmount / progressMaturityAmount) * 100).toFixed(1) + "%",
        }
      );
    });

    setPendingPayments(pending);
  };
  const calculatePendingDays = (account, remainingMaturityAmount, planType) => {
    const dailyAmount = account.dailyAmount || 0;
    if (dailyAmount <= 0) return 0;

    // FIXED: Calculate based on remaining principal amount only
    const remainingPeriods = Math.ceil(remainingMaturityAmount / dailyAmount);

    switch (planType) {
      case "daily":
        return remainingPeriods;
      case "weekly":
        return remainingPeriods * 7; // Convert weeks to days for display
      case "monthly":
        return remainingPeriods * 30; // Convert months to days for display
      default:
        return remainingPeriods;
    }
  };

  const getPendingTimeDisplay = (account, pending) => {
    if (!pending) return "";
    const planType = pending.planType || getPlanTypeFromAccount(account);
    const pendingDays = pending.pendingDays || 0;
    const remainingAmount = pending.remainingMaturityAmount || 0;
    const dailyAmount = account.dailyAmount || 1;

    switch (planType) {
      case "daily":
        return `${pendingDays} day${
          pendingDays > 1 ? "s" : ""
        } (₹${remainingAmount} remaining)`;
      case "weekly":
        const weeks = Math.ceil(pendingDays / 7);
        const weeklyAmount = dailyAmount;
        const remainingWeeks = Math.ceil(remainingAmount / weeklyAmount);
        return `${remainingWeeks} week${
          remainingWeeks > 1 ? "s" : ""
        } (₹${remainingAmount} remaining)`;
      case "monthly":
        const months = Math.ceil(pendingDays / 30);
        const monthlyAmount = dailyAmount;
        const remainingMonths = Math.ceil(remainingAmount / monthlyAmount);
        return `${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        } (₹${remainingAmount} remaining)`;
      default:
        return `${pendingDays} day${
          pendingDays > 1 ? "s" : ""
        } (₹${remainingAmount} remaining)`;
    }
  };

  const getPlanTypeFromAccount = (account) => {
    if (!account) return "monthly";
    if (account.accountType) return account.accountType;
    if (account.planId?.type) return account.planId.type;

    const planName =
      account.planId?.name?.toLowerCase() ||
      account.planName?.toLowerCase() ||
      "";
    if (planName.includes("weekly")) return "weekly";
    if (planName.includes("daily")) return "daily";
    if (planName.includes("monthly")) return "monthly";
    return "monthly";
  };

  const getAmountLabelFromAccount = (account) => {
    const planType = getPlanTypeFromAccount(account);
    switch (planType) {
      case "weekly":
        return "week";
      case "daily":
        return "day";
      case "monthly":
        return "month";
      default:
        return "month";
    }
  };

  const getDurationDisplayFromAccount = (account) => {
    if (!account) return "";
    const duration = account.duration || account.planId?.duration;
    const planType = getPlanTypeFromAccount(account);

    switch (planType.toLowerCase()) {
      case "daily":
        return `${duration} day${duration > 1 ? "s" : ""}`;
      case "weekly":
        return `${duration} week${duration > 1 ? "s" : ""}`;
      case "monthly":
        return `${duration} month${duration > 1 ? "s" : ""}`;
      default:
        return `${duration} months`;
    }
  };

  const generateReferenceNumber = () => {
    return "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const loadPaymentHistory = async (accountId) => {
    try {
      console.log("📋 Loading payment history for account:", accountId);

      const response = await getPaymentHistory(accountId);
      console.log("📊 Payment history API response:", response.data);

      // Handle different response structures
      let historyData = [];

      if (response.data && response.data.data) {
        historyData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        historyData = response.data;
      } else if (response.data && response.data.payments) {
        historyData = response.data.payments;
      } else if (response.data && response.data.transactions) {
        historyData = response.data.transactions;
      }

      console.log("📈 Processed payment history data:", historyData);

      // Sort by date descending (newest first)
      const sortedHistory = historyData.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || b.transactionDate) -
          new Date(a.date || a.createdAt || a.transactionDate)
      );

      setPaymentHistory(sortedHistory);
    } catch (error) {
      console.error("❌ Error loading payment history:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Fallback: Try to get transactions from account data
      try {
        const account = accounts.find((acc) => acc._id === accountId);
        if (account && account.transactions) {
          console.log("🔄 Using account transactions as fallback");
          const transactions = account.transactions
            .filter((t) => t.type === "deposit")
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setPaymentHistory(transactions);
        } else {
          setPaymentHistory([]);
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        setPaymentHistory([]);
      }
    }
  };

  const loadWithdrawalHistory = async (accountId) => {
    try {
      setLoadingWithdrawalHistory(true);
      console.log("📋 Loading withdrawal history for account:", accountId);

      const response = await getWithdrawalHistory(accountId);
      console.log("📊 Withdrawal history API response:", response.data);

      // Handle different response structures
      let historyData = [];

      if (response.data && response.data.data) {
        historyData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        historyData = response.data;
      } else if (response.data && response.data.withdrawals) {
        historyData = response.data.withdrawals;
      } else if (response.data && response.data.transactions) {
        historyData = response.data.transactions.filter(
          (t) => t.type === "withdrawal"
        );
      }

      console.log("📈 Processed withdrawal history data:", historyData);

      // Sort by date descending (newest first)
      const sortedHistory = historyData.sort(
        (a, b) =>
          new Date(b.date || b.createdAt || b.transactionDate) -
          new Date(a.date || a.createdAt || a.transactionDate)
      );

      setWithdrawalHistory(sortedHistory);
    } catch (error) {
      console.error("❌ Error loading withdrawal history:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Fallback: Try to get withdrawal transactions from account data
      try {
        const account = accounts.find((acc) => acc._id === accountId);
        if (account && account.transactions) {
          console.log("🔄 Using account withdrawal transactions as fallback");
          const withdrawals = account.transactions
            .filter((t) => t.type === "withdrawal")
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setWithdrawalHistory(withdrawals);
        } else {
          setWithdrawalHistory([]);
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        setWithdrawalHistory([]);
      }
    } finally {
      setLoadingWithdrawalHistory(false);
    }
  };

  const handleViewWithdrawalHistory = async (account) => {
    await loadWithdrawalHistory(account._id);
    setSelectedAccount(account);
    setShowWithdrawalHistoryModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAccount(null);
    setReferenceNumber("");
    setCustomAmount("");
    setIsCustomPayment(false);
    if (selectedAccount) {
      setCoveredPeriodsMap((prev) => {
        const newMap = { ...prev };
        delete newMap[selectedAccount._id];
        return newMap;
      });
    }
  };

  // const handlePayment = (account) => {
  //   const pending = pendingPayments[account._id];

  //   // FIXED: Only prevent payment if today is paid AND there are no pending payments
  //   if (pending?.hasPaidToday && !pending?.hasPending) {
  //     alert(
  //       "You have already made the payment for today. Please wait for the next payment period."
  //     );
  //     return;
  //   }

  //   if (pending?.isMaturityReached) {
  //     alert(
  //       "Congratulations! You have reached the maturity amount for this account. No further payments are required."
  //     );
  //     return;
  //   }

  //   if (pending && pending.hasPending) {
  //     const planType = pending.planType || getPlanTypeFromAccount(account);
  //     const pendingTimeDisplay = getPendingTimeDisplay(account, pending);
  //     const confirmMessage = `You have ${
  //       pending.count
  //     } pending ${planType} payment${pending.count > 1 ? "s" : ""} totaling ₹${
  //       pending.amount
  //     }. \n\nApproximately ${pendingTimeDisplay} remaining to reach maturity.\n\nDo you want to pay the pending amount of ₹${
  //       pending.amount
  //     } instead of the regular ${planType} amount of ₹${account.dailyAmount}?`;

  //     if (window.confirm(confirmMessage)) {
  //       setSelectedAccount({
  //         ...account,
  //         pendingAmount: pending.amount,
  //         isPendingPayment: true,
  //         maturityAmount: pending.maturityAmount,
  //         progressMaturityAmount: pending.progressMaturityAmount,
  //         totalPaidAmount: pending.totalPaidAmount,
  //         remainingMaturityAmount: pending.remainingMaturityAmount,
  //         pendingDetails: pending,
  //         collectorId: account.collectorId,
  //       });
  //     } else {
  //       setSelectedAccount({
  //         ...account,
  //         maturityAmount: pending.maturityAmount,
  //         progressMaturityAmount: pending.progressMaturityAmount,
  //         totalPaidAmount: pending.totalPaidAmount,
  //         remainingMaturityAmount: pending.remainingMaturityAmount,
  //         pendingDetails: pending,
  //         collectorId: account.collectorId,
  //       });
  //     }
  //   } else {
  //     setSelectedAccount({
  //       ...account,
  //       maturityAmount: pending?.maturityAmount || 0,
  //       progressMaturityAmount: pending?.progressMaturityAmount || 0,
  //       totalPaidAmount: pending?.totalPaidAmount || 0,
  //       remainingMaturityAmount: pending?.remainingMaturityAmount || 0,
  //       pendingDetails: pending,
  //       collectorId: account.collectorId,
  //     });
  //   }

  //   setReferenceNumber(generateReferenceNumber());
  //   setCustomAmount("");
  //   setIsCustomPayment(false);
  //   setShowPaymentModal(true);
  // };

  const handlePayment = (account) => {
    const pending = pendingPayments[account._id];

    // FIXED: Only prevent payment if today is paid AND there are no pending payments
    if (pending?.hasPaidToday && !pending?.hasPending) {
      alert(
        "You have already made the payment for today. Please wait for the next payment period."
      );
      return;
    }

    if (pending?.isMaturityReached) {
      alert(
        "Congratulations! You have reached the maturity amount for this account. No further payments are required."
      );
      return;
    }

    // ✅ FIXED: Always set isPendingPayment based on actual pending status
    const hasActualPendingPayments = pending?.hasPending && pending?.count > 0;

    if (pending && hasActualPendingPayments) {
      const planType = pending.planType || getPlanTypeFromAccount(account);
      const pendingTimeDisplay = getPendingTimeDisplay(account, pending);
      const confirmMessage = `You have ${
        pending.count
      } pending ${planType} payment${pending.count > 1 ? "s" : ""} totaling ₹${
        pending.amount
      }. \n\nApproximately ${pendingTimeDisplay} remaining to reach maturity.\n\nDo you want to pay the pending amount of ₹${
        pending.amount
      } instead of the regular ${planType} amount of ₹${account.dailyAmount}?`;

      if (window.confirm(confirmMessage)) {
        setSelectedAccount({
          ...account,
          pendingAmount: pending.amount,
          isPendingPayment: true, // ✅ FIXED: Set to true when user confirms
          maturityAmount: pending.maturityAmount,
          progressMaturityAmount: pending.progressMaturityAmount,
          totalPaidAmount: pending.totalPaidAmount,
          remainingMaturityAmount: pending.remainingMaturityAmount,
          pendingDetails: pending,
          collectorId: account.collectorId,
        });
      } else {
        setSelectedAccount({
          ...account,
          isPendingPayment: false, // ✅ FIXED: Set to false when user declines
          maturityAmount: pending.maturityAmount,
          progressMaturityAmount: pending.progressMaturityAmount,
          totalPaidAmount: pending.totalPaidAmount,
          remainingMaturityAmount: pending.remainingMaturityAmount,
          pendingDetails: pending,
          collectorId: account.collectorId,
        });
      }
    } else {
      setSelectedAccount({
        ...account,
        isPendingPayment: false, // ✅ FIXED: No pending payments
        maturityAmount: pending?.maturityAmount || 0,
        progressMaturityAmount: pending?.progressMaturityAmount || 0,
        totalPaidAmount: pending?.totalPaidAmount || 0,
        remainingMaturityAmount: pending?.remainingMaturityAmount || 0,
        pendingDetails: pending,
        collectorId: account.collectorId,
      });
    }

    setReferenceNumber(generateReferenceNumber());
    setCustomAmount("");
    setIsCustomPayment(false);
    setShowPaymentModal(true);
  };
  const calculateCoveredPeriods = (pending, paymentAmount) => {
    if (!pending?.missedPeriods || paymentAmount <= 0) return [];
    let coveredAmount = 0;
    const coveredPeriods = [];

    for (const period of pending.missedPeriods) {
      if (coveredAmount + period.amount <= paymentAmount) {
        coveredAmount += period.amount;
        coveredPeriods.push(period);
      } else {
        break;
      }
    }
    return coveredPeriods;
  };

  const getValidMultiples = (planAmount, maxAmount) => {
    const multiples = [];
    let multiple = planAmount;
    while (multiple <= maxAmount) {
      multiples.push(multiple);
      multiple += planAmount;
    }
    return multiples;
  };

  const isValidMultiple = (amount, planAmount) => {
    return amount % planAmount === 0;
  };

  const handleCustomAmountChange = (value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setProcessingPayment(true);

      if (paymentMethod === "online" && !referenceNumber.trim()) {
        alert("Please enter a reference number for online payment");
        return;
      }

      let paymentAmount;
      let isPartialPayment = false;
      let remainingPendingAmount = 0;

      const pending = pendingPayments[selectedAccount._id];
      const regularAmount = selectedAccount.dailyAmount || 0;

      // ✅ FIXED: Use fullPendingAmount for max amount calculation
      const maxAmount = pending?.fullPendingAmount || regularAmount;
      const minAmount = regularAmount;

      if (isCustomPayment && customAmount) {
        const enteredAmount = parseFloat(customAmount);

        if (isNaN(enteredAmount) || enteredAmount < minAmount) {
          alert(`Minimum payment amount is ₹${minAmount}`);
          return;
        }

        if (enteredAmount > maxAmount) {
          alert(`Payment amount cannot exceed pending amount of ₹${maxAmount}`);
          return;
        }

        if (enteredAmount > pending.remainingMaturityAmount) {
          alert(
            `Payment amount cannot exceed remaining maturity amount of ₹${pending.remainingMaturityAmount}`
          );
          return;
        }

        if (!isValidMultiple(enteredAmount, minAmount)) {
          const validMultiples = getValidMultiples(minAmount, maxAmount);
          alert(
            `Please enter a valid multiple of ₹${minAmount}. Valid amounts are: ${validMultiples.join(
              ", "
            )}`
          );
          return;
        }

        paymentAmount = enteredAmount;
        isPartialPayment = paymentAmount < maxAmount;
        remainingPendingAmount = maxAmount - paymentAmount;
      } else {
        // ✅ FIXED: Use the full pending amount when not in custom payment mode
        paymentAmount = maxAmount;
        if (paymentAmount > pending.remainingMaturityAmount) {
          paymentAmount = pending.remainingMaturityAmount;
          isPartialPayment = true;
          remainingPendingAmount = 0;
        }
      }

      const coveredPeriods = calculateCoveredPeriods(pending, paymentAmount);
      const isPendingPayment = selectedAccount.isPendingPayment;
      const paymentStatus = paymentMethod === "cash" ? "pending" : "completed";

      // STEP 1: Get collectorId from the selected account
      const collectorId =
        selectedAccount.collectorId?._id || selectedAccount.collectorId;

      const paymentData = {
        accountId: selectedAccount._id,
        customerId: customer._id,
        amount: paymentAmount,
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber,
        status: paymentStatus,
        isPendingPayment: isPendingPayment,
        isPartialPayment: isPartialPayment,
        remainingPendingAmount: remainingPendingAmount,
        type: "deposit",
        date: new Date().toISOString(),
        paymentPeriod: isPendingPayment ? "pending" : "current",
        maturityAmount: pending.maturityAmount,
        progressMaturityAmount: pending.progressMaturityAmount,
        totalPaidAmount: pending.totalPaidAmount,
        coveredPeriods: coveredPeriods,
        // STEP 2: Add collectorId to payment data
        collectorId: collectorId,
      };

      console.log("💰 Payment data being sent:", {
        ...paymentData,
        collectorId: collectorId ? "PRESENT" : "MISSING",
        paymentAmount: paymentAmount,
        maxAmount: maxAmount,
        isPartialPayment: isPartialPayment,
      });

      const response = await processPayment(paymentData);

      if (response.data.success) {
        // Store paid periods in localStorage
        const storedPaidPeriods = JSON.parse(
          localStorage.getItem("paidPeriods") || "{}"
        );
        storedPaidPeriods[selectedAccount._id] = [
          ...(storedPaidPeriods[selectedAccount._id] || []),
          ...coveredPeriods.map((period) => ({
            periodId: period.periodId,
            date: period.date,
            amount: period.amount,
            type: period.type,
            paymentDate: new Date().toISOString(),
            paymentAmount: paymentAmount,
          })),
        ];
        localStorage.setItem("paidPeriods", JSON.stringify(storedPaidPeriods));
        setPaidPeriodsMap(storedPaidPeriods);

        let alertMessage = "";
        if (paymentMethod === "cash") {
          if (isPartialPayment) {
            alertMessage = `Partial cash payment recorded as PENDING!\nReference: ${referenceNumber}\nAmount Paid: ₹${paymentAmount}\nRemaining Pending: ₹${remainingPendingAmount}\nStatus: ${paymentStatus}\n\nOur collector will verify and mark this payment as completed.`;
          } else {
            alertMessage = `Cash payment recorded as PENDING!\nReference: ${referenceNumber}\nAmount: ₹${paymentAmount}\nStatus: ${paymentStatus}\n\nOur collector will verify and mark this payment as completed.`;
          }
          alertMessage += `\n\n💰 The amount ₹${paymentAmount} will be added to your current balance ONLY AFTER the collector verifies and marks it as completed.`;
        } else {
          if (isPartialPayment) {
            alertMessage = `Partial online payment completed successfully!\nReference: ${referenceNumber}\nAmount Paid: ₹${paymentAmount}\nRemaining Pending: ₹${remainingPendingAmount}\nStatus: ${paymentStatus}`;
          } else {
            alertMessage = `Online payment completed successfully!\nReference: ${referenceNumber}\nAmount: ₹${paymentAmount}\nStatus: ${paymentStatus}`;
          }
          alertMessage += `\n\n💰 The amount ₹${paymentAmount} has been added to your current balance.`;
        }

        if (coveredPeriods.length > 0) {
          const periodType =
            pending.planType || getPlanTypeFromAccount(selectedAccount);
          alertMessage += `\n\nThis payment covers ${
            coveredPeriods.length
          } ${periodType}${coveredPeriods.length > 1 ? "s" : ""}:`;
          coveredPeriods.forEach((period) => {
            const dateStr = period.date.toLocaleDateString();
            alertMessage += `\n• ${dateStr} - ₹${period.amount}`;
          });

          if (isPartialPayment && remainingPendingAmount > 0) {
            alertMessage += `\n\nRemaining pending: ${
              pending.missedPeriods.length - coveredPeriods.length
            } ${periodType}${
              pending.missedPeriods.length - coveredPeriods.length > 1
                ? "s"
                : ""
            } (₹${remainingPendingAmount})`;
          }
        }

        const newTotalPaid = pending.totalPaidAmount + paymentAmount;
        if (newTotalPaid >= pending.progressMaturityAmount) {
          alertMessage += `\n\n🎉 Congratulations! You have reached the maturity amount of ₹${pending.maturityAmount}!`;
        }

        alert(alertMessage);

        handleClosePaymentModal();
        await loadCustomerAccounts(); // Refresh to get updated data
      } else {
        throw new Error("Payment processing failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (
      showPaymentModal &&
      selectedAccount &&
      isCustomPayment &&
      customAmount
    ) {
      const pending = pendingPayments[selectedAccount._id];
      if (pending) {
        const paymentAmount = parseFloat(customAmount);
        const coveredPeriods = calculateCoveredPeriods(pending, paymentAmount);
        setCoveredPeriodsMap((prev) => ({
          ...prev,
          [selectedAccount._id]: coveredPeriods,
        }));
      }
    }
  }, [
    customAmount,
    isCustomPayment,
    selectedAccount,
    showPaymentModal,
    pendingPayments,
  ]);

  const handleViewPaymentHistory = async (account) => {
    await loadPaymentHistory(account._id);
    setSelectedAccount(account);
    setShowHistoryModal(true);
  };

  const handleViewAccountDetails = (account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  // const handleWithdrawal = async () => {
  //   if (!selectedAccount) return;

  //   try {
  //     setProcessingWithdrawal(true);

  //     const amount = parseFloat(withdrawalAmount);
  //     const currentBalance = selectedAccount.currentBalance || 0;

  //     if (isNaN(amount) || amount <= 0) {
  //       alert("Please enter a valid withdrawal amount");
  //       return;
  //     }

  //     if (amount > currentBalance) {
  //       alert(`Insufficient balance. Available balance: ₹${currentBalance}`);
  //       return;
  //     }

  //     if (!withdrawalReason.trim()) {
  //       alert("Please provide a reason for withdrawal");
  //       return;
  //     }

  //     // STEP 1: Get collectorId from the selected account
  //     const collectorId =
  //       selectedAccount.collectorId?._id || selectedAccount.collectorId;

  //     const withdrawalData = {
  //       accountNumber: selectedAccount.accountNumber,
  //       amount: amount,
  //       reason: withdrawalReason,
  //       type: "withdrawal",
  //       status: "pending",
  //       collectorId: collectorId,
  //       customerId: customer?._id,
  //     };

  //     console.log("💰 Sending withdrawal data:", withdrawalData);

  //     const response = await withdrawAmount(withdrawalData);

  //     if (response.data.success) {
  //       const updatedBalance =
  //         response.data.data.currentBalance || currentBalance - amount;

  //       alert(
  //         `Withdrawal request submitted successfully!\nAmount: ₹${amount}\nStatus: Pending approval\nReference: ${response.data.data.referenceNumber}\nUpdated Balance: ₹${updatedBalance}`
  //       );

  //       // Reset form
  //       setWithdrawalAmount("");
  //       setWithdrawalReason("");

  //       // Immediately update the UI with the new balance
  //       updateAccountBalance(selectedAccount._id, updatedBalance);

  //       // FIXED: Force reload accounts to recalculate pending payments
  //       console.log("🔄 Forcing account reload after withdrawal...");
  //       await loadCustomerAccounts();
  //     } else {
  //       throw new Error("Withdrawal request failed");
  //     }
  //   } catch (error) {
  //     console.error("Withdrawal error:", error);
  //     alert(
  //       error.response?.data?.message ||
  //         "Withdrawal request failed. Please try again."
  //     );
  //   } finally {
  //     setProcessingWithdrawal(false);
  //   }
  // };
  const handleWithdrawal = async () => {
    if (!selectedAccount) return;

    try {
      setProcessingWithdrawal(true);

      const amount = parseFloat(withdrawalAmount);
      const currentBalance = selectedAccount.currentBalance || 0;
      const dailyAmount = selectedAccount.dailyAmount || 0;

      // Basic validation
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid withdrawal amount");
        return;
      }

      if (amount > currentBalance) {
        alert(`Insufficient balance. Available balance: ₹${currentBalance}`);
        return;
      }

      if (!withdrawalReason.trim()) {
        alert("Please provide a reason for withdrawal");
        return;
      }

      // ✅ NEW: Validate that amount is a multiple of daily amount
      if (dailyAmount > 0 && amount % dailyAmount !== 0) {
        const validMultiples = [];
        let multiple = dailyAmount;
        while (multiple <= currentBalance) {
          validMultiples.push(multiple);
          multiple += dailyAmount;
        }

        alert(
          `Withdrawal amount must be a multiple of the plan amount (₹${dailyAmount}).\n\nValid amounts: ${validMultiples
            .slice(0, 10)
            .join(", ")}${validMultiples.length > 10 ? "..." : ""}`
        );
        return;
      }

      // STEP 1: Get collectorId from the selected account
      const collectorId =
        selectedAccount.collectorId?._id || selectedAccount.collectorId;

      const withdrawalData = {
        accountNumber: selectedAccount.accountNumber,
        amount: amount,
        reason: withdrawalReason,
        type: "withdrawal",
        status: "pending",
        collectorId: collectorId,
        customerId: customer?._id,
      };

      console.log("💰 Sending withdrawal data:", withdrawalData);

      const response = await withdrawAmount(withdrawalData);

      if (response.data.success) {
        const updatedBalance =
          response.data.data.currentBalance || currentBalance - amount;

        alert(
          `Withdrawal request submitted successfully!\nAmount: ₹${amount}\nStatus: Pending approval\nReference: ${response.data.data.referenceNumber}\nUpdated Balance: ₹${updatedBalance}`
        );

        // Reset form
        setWithdrawalAmount("");
        setWithdrawalReason("");

        // Immediately update the UI with the new balance
        updateAccountBalance(selectedAccount._id, updatedBalance);

        // FIXED: Force reload accounts to recalculate pending payments
        console.log("🔄 Forcing account reload after withdrawal...");
        await loadCustomerAccounts();
      } else {
        throw new Error("Withdrawal request failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(
        error.response?.data?.message ||
          "Withdrawal request failed. Please try again."
      );
    } finally {
      setProcessingWithdrawal(false);
    }
  };
  const updateAccountBalance = (accountId, newBalance) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account._id === accountId
          ? { ...account, currentBalance: newBalance }
          : account
      )
    );

    // Also update selectedAccount if it's the same account
    if (selectedAccount && selectedAccount._id === accountId) {
      setSelectedAccount((prev) => ({
        ...prev,
        currentBalance: newBalance,
      }));
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "savings":
        return "bg-blue-100 text-blue-800";
      case "pigmy":
        return "bg-green-100 text-green-800";
      case "fixed deposit":
        return "bg-purple-100 text-purple-800";
      case "daily deposit":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "savings":
        return <Wallet className="h-5 w-5" />;
      case "pigmy":
        return <TrendingUp className="h-5 w-5" />;
      case "fixed deposit":
        return <Calendar className="h-5 w-5" />;
      case "daily deposit":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  // FIXED: Progress calculation now uses principal-only amount
  const calculateProgress = (balance, targetAmount) => {
    if (!targetAmount || targetAmount === 0) return 0;
    return Math.min((balance / targetAmount) * 100, 100);
  };

  // Enhanced Account Details Modal Component
  const AccountDetailsModal = () => {
    if (!showDetailsModal || !selectedAccount) return null;

    const amountLabel = getAmountLabelFromAccount(selectedAccount);
    const durationDisplay = getDurationDisplayFromAccount(selectedAccount);
    const pending = pendingPayments[selectedAccount._id];
    const pendingTimeDisplay = getPendingTimeDisplay(selectedAccount, pending);
    const planType = getPlanTypeFromAccount(selectedAccount);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  {getAccountTypeIcon(selectedAccount.type)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Account Details</h3>
                  <p className="text-blue-100">
                    {selectedAccount.accountNumber} • {selectedAccount.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-blue-200 transition-colors p-2"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handlePayment(selectedAccount);
                  }}
                  disabled={pending?.isMaturityReached || pending?.hasPaidToday}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    pending?.isMaturityReached || pending?.hasPaidToday
                      ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : pending?.hasPending
                      ? "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">
                      {pending?.isMaturityReached
                        ? "Maturity Reached"
                        : pending?.hasPaidToday
                        ? "Already Paid Today"
                        : pending?.hasPending
                        ? "Pay Pending"
                        : "Make Payment"}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleViewPaymentHistory(selectedAccount);
                  }}
                  className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Payment History</span>
                  </div>
                </button>

                <button
                  hidden
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleViewWithdrawalHistory(selectedAccount);
                  }}
                  className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <History className="h-5 w-5" />
                    <span className="font-semibold">Withdrawal History</span>
                  </div>
                </button>
              </div>

              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">Current Balance</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ₹{selectedAccount.currentBalance?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Maturity Amount</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ₹{pending?.maturityAmount?.toLocaleString() || "0"}
                  </p>
                </div>

                {/* <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Paid</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ₹{pending?.totalPaidAmount?.toLocaleString() || "0"}
                  </p>
                </div> */}

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Remaining</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ₹{pending?.remainingMaturityAmount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              {pending && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">
                    Maturity Progress
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Progress:{" "}
                        {calculateProgress(
                          pending.totalPaidAmount,
                          pending.progressMaturityAmount
                        ).toFixed(1)}
                        %
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        ₹{pending.totalPaidAmount} / ₹
                        {pending.progressMaturityAmount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${calculateProgress(
                            pending.totalPaidAmount,
                            pending.progressMaturityAmount
                          )}%`,
                        }}
                      ></div>
                    </div>
                    {/* <div className="flex justify-between text-xs text-gray-600">
                      <span>Started</span>
                      <span>{pendingTimeDisplay} remaining</span>
                    </div> */}
                  </div>

                  {/* Maturity Calculation */}
                  {pending.maturityCalculation && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-3">
                        Maturity Calculation
                      </h5>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Principal</p>
                          <p className="font-bold text-gray-900">
                            ₹{pending.principalAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Interest</p>
                          <p className="font-bold text-green-600">
                            ₹{pending.interestAmount?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Rate</p>
                          <p className="font-bold text-blue-600">
                            {pending.maturityCalculation.interestRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Account Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Account Type</span>
                      <span className="font-semibold capitalize">
                        {selectedAccount.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedAccount.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedAccount.status === "closed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedAccount.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Plan Type</span>
                      <span className="font-semibold capitalize">
                        {planType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">
                        {amountLabel === "week"
                          ? "Weekly Amount"
                          : amountLabel === "month"
                          ? "Monthly Amount"
                          : "Daily Amount"}
                      </span>
                      <span className="font-semibold">
                        ₹{selectedAccount.dailyAmount || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{durationDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Interest Rate</span>
                      <span className="font-semibold text-green-600">
                        {selectedAccount.planId?.interestRate ||
                          selectedAccount.interestRate ||
                          "N/A"}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Withdrawal Request
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Withdrawal Amount
                      </label>
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="Enter amount to withdraw"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max={selectedAccount.currentBalance}
                      />
                      {/* <p className="text-xs text-gray-500 mt-1">
                        Available balance: ₹
                        {selectedAccount.currentBalance?.toLocaleString() ||
                          "0"}
                      </p> */}

                      <p className="text-xs text-gray-500 mt-1">
                        Available balance: ₹
                        {selectedAccount.currentBalance?.toLocaleString() ||
                          "0"}
                        {selectedAccount.dailyAmount > 0 && (
                          <span className="block text-blue-600 font-medium">
                            Must be a multiple of ₹{selectedAccount.dailyAmount}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Withdrawal
                      </label>
                      <textarea
                        value={withdrawalReason}
                        onChange={(e) => setWithdrawalReason(e.target.value)}
                        placeholder="Please specify the reason for withdrawal"
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* <button
                      onClick={handleWithdrawal}
                      disabled={
                        processingWithdrawal ||
                        !withdrawalAmount ||
                        parseFloat(withdrawalAmount) <= 0 ||
                        parseFloat(withdrawalAmount) >
                          selectedAccount.currentBalance ||
                        !withdrawalReason.trim()
                      }
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        processingWithdrawal ||
                        !withdrawalAmount ||
                        parseFloat(withdrawalAmount) <= 0 ||
                        parseFloat(withdrawalAmount) >
                          selectedAccount.currentBalance ||
                        !withdrawalReason.trim()
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {processingWithdrawal ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Request Withdrawal"
                      )}
                    </button> */}

                    <button
                      onClick={handleWithdrawal}
                      disabled={
                        processingWithdrawal ||
                        !withdrawalAmount ||
                        parseFloat(withdrawalAmount) <= 0 ||
                        parseFloat(withdrawalAmount) >
                          selectedAccount.currentBalance ||
                        !withdrawalReason.trim() ||
                        // ✅ NEW: Check if amount is valid multiple
                        (selectedAccount.dailyAmount > 0 &&
                          parseFloat(withdrawalAmount) %
                            selectedAccount.dailyAmount !==
                            0)
                      }
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                        processingWithdrawal ||
                        !withdrawalAmount ||
                        parseFloat(withdrawalAmount) <= 0 ||
                        parseFloat(withdrawalAmount) >
                          selectedAccount.currentBalance ||
                        !withdrawalReason.trim() ||
                        (selectedAccount.dailyAmount > 0 &&
                          parseFloat(withdrawalAmount) %
                            selectedAccount.dailyAmount !==
                            0)
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {processingWithdrawal ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        "Request Withdrawal"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collector Information */}
              {selectedAccount.collectorId && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Collector Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-900">
                          {selectedAccount.collectorId.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Area</p>
                        <p className="font-semibold text-gray-900">
                          {selectedAccount.collectorId.area}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">
                          {selectedAccount.collectorId.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Status Alert */}
              {pending?.hasPaidToday && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-green-800">
                      Payment Already Made
                    </h4>
                  </div>
                  <p className="text-green-700">
                    You have already made the required payment for the current
                    period. Please wait for the next payment period to make
                    another payment.
                  </p>
                </div>
              )}

              {/* Pending Payments Alert */}
              {pending?.hasPending &&
                !pending?.isMaturityReached &&
                !pending?.hasPaidToday && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <h4 className="text-lg font-semibold text-red-800">
                        Pending Payments
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-red-700">
                        You have {pending.count} pending {planType} payment
                        {pending.count > 1 ? "s" : ""} totaling ₹
                        {pending.amount}
                      </p>
                      {pending.missedPeriods &&
                        pending.missedPeriods.length > 0 && (
                          <div className="text-sm text-red-600">
                            <p className="font-semibold mb-2">
                              Missed periods:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {pending.missedPeriods
                                .slice(0, 6)
                                .map((period, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1"
                                  >
                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                    {period.date.toLocaleDateString()} - ₹
                                    {period.amount}
                                  </div>
                                ))}
                              {pending.missedPeriods.length > 6 && (
                                <div className="text-red-500">
                                  ... and {pending.missedPeriods.length - 6}{" "}
                                  more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

              {/* Maturity Reached Message */}
              {pending?.isMaturityReached && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-xl font-semibold text-green-800 mb-2">
                    Maturity Amount Reached! 🎉
                  </h4>
                  <p className="text-green-700">
                    Congratulations! You have successfully reached the maturity
                    amount of ₹{pending.maturityAmount}. No further payments are
                    required.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              {!pending?.isMaturityReached && !pending?.hasPaidToday && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handlePayment(selectedAccount);
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-colors ${
                    pending?.hasPending || pending?.pendingDays > 0
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {pending?.hasPending || pending?.pendingDays > 0
                    ? "Pay Pending Amount"
                    : "Make Payment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Payment Modal Component - FIXED: Proper calculation that works after withdrawals
  const PaymentModal = () => {
    if (!showPaymentModal || !selectedAccount) return null;

    const amountLabel = getAmountLabelFromAccount(selectedAccount);
    const regularAmount = selectedAccount.dailyAmount || 0;
    const isPendingPayment = selectedAccount.isPendingPayment;
    const minAmount = regularAmount;

    // ✅ FIXED: Get the latest pending data from state
    const pending = pendingPayments[selectedAccount._id];

    // ✅ FIXED: Calculate maxAmount based on actual pending status, not just isPendingPayment
    let maxAmount = regularAmount; // Default to regular amount

    // ✅ FIXED: maxAmount calculation that works regardless of isPendingPayment
    const hasActualPendingPayments = pending?.hasPending && pending?.count > 0;

    if (hasActualPendingPayments) {
      maxAmount = pending.count * regularAmount;

      console.log("💰 Fixed maxAmount calculation:", {
        hasActualPendingPayments,
        pendingCount: pending.count,
        regularAmount,
        calculatedMax: pending.count * regularAmount,
        isPendingPayment, // Just for debug
      });

      // Don't exceed remaining maturity amount
      const remainingMaturityAmount =
        pending?.remainingMaturityAmount || maxAmount;
      if (maxAmount > remainingMaturityAmount) {
        maxAmount = remainingMaturityAmount;
        console.log("💰 Limited by remaining maturity:", maxAmount);
      }
    }

    // ✅ FIXED: Update hasPendingPayments to be more reliable
    const hasPendingPayments = hasActualPendingPayments;

    const maturityAmount = selectedAccount.maturityAmount || 0;
    const progressMaturityAmount =
      selectedAccount.progressMaturityAmount || maturityAmount;
    const totalPaidAmount = selectedAccount.totalPaidAmount || 0;
    const remainingMaturityAmount =
      pending?.remainingMaturityAmount || maxAmount;
    const pendingDetails = selectedAccount.pendingDetails;
    const pendingTimeDisplay = getPendingTimeDisplay(selectedAccount, pending);
    const coveredPeriods = coveredPeriodsMap[selectedAccount._id] || [];

    const calculatedPaymentAmount =
      isCustomPayment && customAmount ? parseFloat(customAmount) : maxAmount;
    const remainingAmount =
      isCustomPayment && customAmount
        ? maxAmount - parseFloat(customAmount)
        : 0;

    const validMultiples = getValidMultiples(minAmount, maxAmount);
    const isAmountValid = customAmount
      ? isValidMultiple(parseFloat(customAmount), minAmount)
      : true;

    const pendingCount = pending?.count || 0;
    const periodsCovered = Math.floor(calculatedPaymentAmount / regularAmount);

    console.log("💰 Payment Modal Final Values:", {
      isPendingPayment,
      regularAmount,
      pendingCount,
      maxAmount,
      calculatedPaymentAmount,
      formula: `${pendingCount} × ₹${regularAmount} = ₹${maxAmount}`,
      periodsCovered,
      hasPendingPayments,
      // Debug info
      pendingData: pending
        ? {
            count: pending.count,
            hasPending: pending.hasPending,
            remainingMaturityAmount: pending.remainingMaturityAmount,
            totalPaidAmount: pending.totalPaidAmount,
          }
        : "No pending data",
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xl font-bold">
              {isPendingPayment ? "Pay Pending Amount" : "Make Payment"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedAccount.accountNumber} - {selectedAccount.type}
            </p>

            {/* Show calculation breakdown for pending payments */}
            {hasPendingPayments && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                <p className="text-blue-700 font-semibold">
                  Pending: {pendingCount} {amountLabel}(s) × ₹{regularAmount} =
                  ₹{maxAmount}
                </p>
                {maxAmount !== pendingCount * regularAmount && (
                  <p className="text-blue-600 mt-1">
                    (Limited by remaining maturity amount: ₹
                    {remainingMaturityAmount})
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Current Balance</p>
                    <p className="font-semibold text-green-600">
                      ₹{selectedAccount.currentBalance?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining to Maturity</p>
                    <p className="font-semibold text-orange-600">
                      ₹{remainingMaturityAmount?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>

                {/* Pending Information */}
                {hasPendingPayments && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        Pending {amountLabel}(s):
                      </span>
                      <span className="font-semibold text-red-600">
                        {pendingCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        Amount per {amountLabel}:
                      </span>
                      <span className="font-semibold">₹{regularAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-600">Total Pending:</span>
                      <span className="text-red-600">
                        ₹{pendingCount * regularAmount}
                      </span>
                    </div>
                    {/* ✅ FIXED: Show withdrawal impact if applicable */}
                    {pending.additionalPendingFromWithdrawals > 0 && (
                      <div className="flex justify-between items-center text-xs text-orange-600 mt-1">
                        <span className="text-gray-600">From withdrawals:</span>
                        <span className="font-semibold">
                          {pending.additionalPendingFromWithdrawals}{" "}
                          {amountLabel}(s)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Amount Selection */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Amount</p>

                {/* DEBUG INFO - Remove after fixing */}
                {/* <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2 text-xs">
                  <p className="font-semibold">Debug Info:</p>
                  <p>
                    hasPendingPayments: {hasPendingPayments ? "true" : "false"}
                  </p>
                  <p>pendingCount: {pendingCount}</p>
                  <p>maxAmount: {maxAmount}</p>
                  <p>regularAmount: {regularAmount}</p>
                  <p>isPendingPayment: {isPendingPayment ? "true" : "false"}</p>
                  <p>
                    calculated: {pendingCount} × {regularAmount} ={" "}
                    {pendingCount * regularAmount}
                  </p>
                </div> */}

                <div className="space-y-3">
                  {hasPendingPayments ? (
                    <>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsCustomPayment(false);
                            setCustomAmount("");
                          }}
                          className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                            !isCustomPayment
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-700"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {hasPendingPayments
                            ? `Pay All (${pendingCount} ${amountLabel}s) - ₹${maxAmount}`
                            : `Full Amount - ₹${maxAmount}`}
                        </button>
                        <button
                          onClick={() => setIsCustomPayment(true)}
                          className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                            isCustomPayment
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-700"
                          }`}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Custom Amount
                        </button>
                      </div>

                      {isCustomPayment && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Enter Amount (Multiples of ₹{minAmount})
                            </label>
                            <input
                              type="text"
                              value={customAmount}
                              onChange={(e) =>
                                handleCustomAmountChange(e.target.value)
                              }
                              placeholder={`Enter multiple of ₹${minAmount}`}
                              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:border-blue-500 ${
                                customAmount && !isAmountValid
                                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                                  : "border-gray-300 focus:ring-blue-500"
                              }`}
                            />
                            {customAmount && !isAmountValid && (
                              <p className="text-xs text-red-600 mt-1">
                                Please enter a multiple of ₹{minAmount}. Valid
                                amounts: {validMultiples.slice(0, 5).join(", ")}
                                {validMultiples.length > 5 ? "..." : ""}
                              </p>
                            )}
                          </div>

                          {customAmount && isAmountValid && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-600">Amount to Pay</p>
                                  <p className="font-semibold text-green-600">
                                    ₹{calculatedPaymentAmount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">
                                    Remaining Pending
                                  </p>
                                  <p className="font-semibold text-orange-600">
                                    ₹{remainingAmount}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                This covers {periodsCovered} out of{" "}
                                {pendingCount} pending {amountLabel}(s)
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                        <p className="text-sm font-semibold text-blue-800">
                          {amountLabel === "week"
                            ? "Weekly Amount"
                            : amountLabel === "month"
                            ? "Monthly Amount"
                            : "Daily Amount"}
                          : ₹{maxAmount}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rest of the PaymentModal code remains the same */}
              {/* Payment Method Selection */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                      paymentMethod === "cash"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`flex-1 flex items-center justify-center p-3 border rounded-lg text-sm ${
                      paymentMethod === "online"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Online
                  </button>
                </div>
              </div>

              {/* Online Payment Details */}
              {paymentMethod === "online" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Scan QR Code to Pay
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg inline-block">
                      <QrCode className="h-24 w-24 mx-auto text-gray-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Enter UTR/Transaction ID"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <button
                        hidden
                        onClick={() =>
                          setReferenceNumber(generateReferenceNumber())
                        }
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300 whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Payment Details */}
              {paymentMethod === "cash" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-semibold">
                        Cash Payment - Status: PENDING
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please hand over ₹{calculatedPaymentAmount} to our
                        collector.
                      </p>
                      {hasPendingPayments && (
                        <p className="text-sm text-yellow-700">
                          This covers {periodsCovered} pending {amountLabel}(s)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-yellow-600 mt-2 space-y-1">
                    <p className="font-mono">Reference: {referenceNumber}</p>
                    {selectedAccount.collectorId && (
                      <>
                        <p>Collector: {selectedAccount.collectorId.name}</p>
                        <p>Area: {selectedAccount.collectorId.area}</p>
                        <p>Phone: {selectedAccount.collectorId.phone}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleClosePaymentModal}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 text-sm font-medium"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={
                  processingPayment ||
                  (paymentMethod === "online" && !referenceNumber.trim()) ||
                  (hasPendingPayments &&
                    isCustomPayment &&
                    (!customAmount ||
                      parseFloat(customAmount) < minAmount ||
                      parseFloat(customAmount) > maxAmount ||
                      !isAmountValid))
                }
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium ${
                  processingPayment ||
                  (paymentMethod === "online" && !referenceNumber.trim()) ||
                  (hasPendingPayments &&
                    isCustomPayment &&
                    (!customAmount ||
                      parseFloat(customAmount) < minAmount ||
                      parseFloat(customAmount) > maxAmount ||
                      !isAmountValid))
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : isPendingPayment ? (
                  hasPendingPayments && isCustomPayment && customAmount ? (
                    `Pay ₹${calculatedPaymentAmount}`
                  ) : (
                    `Pay Full Amount (₹${maxAmount})`
                  )
                ) : (
                  `Confirm Payment (₹${maxAmount})`
                )}
              </button>
            </div>

            {/* Payment Summary */}
            {hasPendingPayments && (
              <div className="mt-3 text-center text-xs text-gray-600">
                {!isCustomPayment ? (
                  <p>
                    Paying all {pendingCount} pending {amountLabel}(s) × ₹
                    {regularAmount} = ₹{maxAmount}
                  </p>
                ) : customAmount && isAmountValid ? (
                  <p>
                    Paying {periodsCovered} out of {pendingCount} pending{" "}
                    {amountLabel}(s)
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Payment History Modal Component
  const PaymentHistoryModal = () => {
    if (!showHistoryModal || !selectedAccount) return null;

    const pending = pendingPayments[selectedAccount._id];

    // Helper function to get payment date
    const getPaymentDate = (payment) => {
      return (
        payment.date ||
        payment.createdAt ||
        payment.transactionDate ||
        payment.paymentDate
      );
    };

    // Helper function to get payment status
    const getPaymentStatus = (payment) => {
      return payment.status || "completed";
    };

    // Helper function to get payment method
    const getPaymentMethod = (payment) => {
      return payment.paymentMethod || payment.method || "cash";
    };

    // Helper function to get reference number
    const getReferenceNumber = (payment) => {
      return (
        payment.referenceNumber ||
        payment.reference ||
        payment.transactionId ||
        payment._id
      );
    };

    // Helper function to get payment type
    const getPaymentType = (payment) => {
      if (payment.isPendingPayment) return "Pending Payment";
      if (payment.type === "deposit") return "Regular Payment";
      return payment.type || "Payment";
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Payment History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              {selectedAccount.accountNumber} - {selectedAccount.type}
            </p>

            {/* Current Balance Display */}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 font-semibold">Current Balance</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{selectedAccount.currentBalance?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 font-semibold">Total Paid Amount</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{pending?.totalPaidAmount?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-6">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment history found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Payment records will appear here after successful
                    transactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      Showing {paymentHistory.length} payment
                      {paymentHistory.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹
                      {paymentHistory
                        .reduce(
                          (sum, payment) => sum + (payment.amount || 0),
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>

                  {paymentHistory.map((payment, index) => (
                    <div
                      key={
                        payment._id ||
                        payment.transactionId ||
                        `payment-${index}`
                      }
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              getPaymentStatus(payment) === "completed" ||
                              getPaymentStatus(payment) === "verified"
                                ? "bg-green-100 text-green-800"
                                : getPaymentStatus(payment) === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getPaymentStatus(payment) === "completed" ||
                            getPaymentStatus(payment) === "verified" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : getPaymentStatus(payment) === "pending" ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            {getPaymentStatus(payment).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {new Date(
                                getPaymentDate(payment)
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(
                                getPaymentDate(payment)
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{(payment.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Reference</p>
                          <p className="font-mono text-gray-900 text-xs">
                            {getReferenceNumber(payment)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Payment Method</p>
                          <p className="capitalize text-gray-900">
                            {getPaymentMethod(payment)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="text-gray-900">
                            {getPaymentType(payment)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="capitalize text-gray-900">
                            {getPaymentStatus(payment)}
                          </p>
                        </div>
                      </div>

                      {/* Additional payment details */}
                      {payment.coveredPeriods &&
                        payment.coveredPeriods.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                            <p className="text-blue-700 font-semibold">
                              Covered Periods:
                            </p>
                            <div className="text-blue-600">
                              {payment.coveredPeriods
                                .slice(0, 3)
                                .map((period, idx) => (
                                  <div key={idx}>
                                    •{" "}
                                    {new Date(period.date).toLocaleDateString()}{" "}
                                    - ₹{period.amount}
                                  </div>
                                ))}
                              {payment.coveredPeriods.length > 3 && (
                                <div>
                                  ... and {payment.coveredPeriods.length - 3}{" "}
                                  more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {payment.isPartialPayment && (
                        <div className="mt-2 text-xs text-orange-600">
                          ⚠️ Partial Payment - Remaining: ₹
                          {payment.remainingPendingAmount || 0}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Withdrawal History Modal Component
  const WithdrawalHistoryModal = () => {
    if (!showWithdrawalHistoryModal || !selectedAccount) return null;

    // Helper function to get withdrawal date
    const getWithdrawalDate = (withdrawal) => {
      return (
        withdrawal.date ||
        withdrawal.createdAt ||
        withdrawal.transactionDate ||
        withdrawal.withdrawalDate
      );
    };

    // Helper function to get withdrawal status
    const getWithdrawalStatus = (withdrawal) => {
      return withdrawal.status || "pending";
    };

    // Helper function to get reference number
    const getReferenceNumber = (withdrawal) => {
      return (
        withdrawal.referenceNumber ||
        withdrawal.reference ||
        withdrawal.transactionId ||
        withdrawal._id
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Withdrawal History</h3>
              <button
                onClick={() => setShowWithdrawalHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              {selectedAccount.accountNumber} - {selectedAccount.type}
            </p>

            {/* Current Balance Display */}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 font-semibold">Current Balance</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{selectedAccount.currentBalance?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 font-semibold">Total Withdrawals</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹
                  {withdrawalHistory
                    .reduce(
                      (sum, withdrawal) => sum + (withdrawal.amount || 0),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-6">
              {loadingWithdrawalHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">
                    Loading withdrawal history...
                  </p>
                </div>
              ) : withdrawalHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No withdrawal history found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Withdrawal records will appear here after successful
                    transactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      Showing {withdrawalHistory.length} withdrawal
                      {withdrawalHistory.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹
                      {withdrawalHistory
                        .reduce(
                          (sum, withdrawal) => sum + (withdrawal.amount || 0),
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>

                  {withdrawalHistory.map((withdrawal, index) => (
                    <div
                      key={
                        withdrawal._id ||
                        withdrawal.transactionId ||
                        `withdrawal-${index}`
                      }
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              getWithdrawalStatus(withdrawal) === "completed" ||
                              getWithdrawalStatus(withdrawal) === "approved"
                                ? "bg-green-100 text-green-800"
                                : getWithdrawalStatus(withdrawal) === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : getWithdrawalStatus(withdrawal) === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getWithdrawalStatus(withdrawal) === "completed" ||
                            getWithdrawalStatus(withdrawal) === "approved" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : getWithdrawalStatus(withdrawal) ===
                              "pending" ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            {getWithdrawalStatus(withdrawal).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {new Date(
                                getWithdrawalDate(withdrawal)
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(
                                getWithdrawalDate(withdrawal)
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-red-600">
                          - ₹{(withdrawal.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Reference</p>
                          <p className="font-mono text-gray-900 text-xs">
                            {getReferenceNumber(withdrawal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="capitalize text-gray-900">
                            {getWithdrawalStatus(withdrawal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reason</p>
                          <p className="text-gray-900">
                            {withdrawal.reason || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="text-gray-900">Withdrawal</p>
                        </div>
                      </div>

                      {/* Additional withdrawal details */}
                      {withdrawal.approvedBy && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                          <p className="text-green-700 font-semibold">
                            Approved by: {withdrawal.approvedBy}
                          </p>
                          {withdrawal.approvedAt && (
                            <p className="text-green-600">
                              On:{" "}
                              {new Date(
                                withdrawal.approvedAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {withdrawal.rejectionReason && (
                        <div className="mt-3 p-2 bg-red-50 rounded text-xs">
                          <p className="text-red-700 font-semibold">
                            Rejection Reason: {withdrawal.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowWithdrawalHistoryModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  // Authentication Required State
  if (error && !customer) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen w-screen mx-[-9.5rem] mt-[-3.5rem] bg-gradient-to-br from-gray-50 via-gray-50 to-blue-500/5 p-6">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-6 mt-[2rem]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/pigmy")}
            className="flex items-center text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            {customer && (
              <span className="text-sm text-gray-600">
                Welcome, {customer.name} ({customer.customerId})
              </span>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">My Accounts</h1>
          <p className="text-gray-600">
            Manage all accounts created for you by admin
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Accounts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const pending = pendingPayments[account._id];

            return (
              <div
                key={account._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 relative"
                onClick={() => handleViewAccountDetails(account)}
              >
                {/* Maturity Reached Badge */}
                {pending?.isMaturityReached && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Matured
                    </span>
                  </div>
                )}

                {/* Pending Payment Badge */}
                {pending?.hasPending && !pending?.isMaturityReached && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {pending.count} pending
                      {pending.additionalPendingFromWithdrawals > 0 && (
                        <span className="ml-1 text-xs">
                          (+{pending.additionalPendingFromWithdrawals} W)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Already Paid Today Badge */}
                {pending?.hasPaidToday && !pending?.hasPending && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid Today
                    </span>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${getAccountTypeColor(
                          account.type
                        )}`}
                      >
                        {getAccountTypeIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {account.type}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {account.accountNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewAccountDetails(account)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Account Details"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quick Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Current Balance
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{account.currentBalance?.toLocaleString() || "0"}
                      </span>
                    </div>

                    {pending && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-blue-800">
                            Maturity Progress
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {calculateProgress(
                              pending.totalPaidAmount,
                              pending.progressMaturityAmount
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculateProgress(
                                pending.totalPaidAmount,
                                pending.progressMaturityAmount
                              )}%`,
                            }}
                          ></div>
                        </div>
                        {/* Show pending days */}
                        {pending.pendingDays > 0 && (
                          <div className="text-xs text-red-600 mt-1 font-semibold">
                            {pending.pendingDays} days remaining
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <button
                      hidden
                      onClick={() => handleViewPaymentHistory(account)}
                      className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      <Clock className="h-4 w-4" />
                      History
                    </button>
                    {account.status === "active" &&
                      account.dailyAmount > 0 &&
                      !pending?.isMaturityReached && (
                        <button
                          onClick={() => handlePayment(account)}
                          disabled={
                            pending?.hasPaidToday && !pending?.hasPending
                          }
                          className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-1 ${
                            pending?.hasPaidToday && !pending?.hasPending
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : pending?.hasPending
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                          {pending?.hasPaidToday && !pending?.hasPending
                            ? "Paid Today"
                            : pending?.hasPending
                            ? "Pay Pending"
                            : "Pay"}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {accounts.length === 0 && !error && (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No accounts found
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have any accounts yet. Contact admin to create an
              account for you.
            </p>
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Account Details Modal */}
      <AccountDetailsModal />

      {/* Payment Modal */}
      <PaymentModal />

      {/* Payment History Modal */}
      <PaymentHistoryModal />

      {/* Withdrawal History Modal */}
      <WithdrawalHistoryModal />
      <Footer />
    </div>
  );
};

export default AccountsPage;
