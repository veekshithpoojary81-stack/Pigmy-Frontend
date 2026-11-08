import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PigmyXpressDashboard from "./components/PigmyXpressDashboard";
import PaymentPage from "./components/PaymentPage";
import AccountsPage from "./components/AccountsPage";
import Withdrawal from "./components/Withdrawal";
import Feedback from "./components/Feedback";
import CustomerLogin from "./components/CustomerLogin";

// Admin Components
import AdminLayout from "./admincomponents/AdminLayout";
import AdminDashboard from "./admincomponents/AdminDashboard";
import ManageCollectors from "./admincomponents/ManageCollectors";
import ManageCustomers from "./admincomponents/ManageCustomers";
import ManageAccounts from "./admincomponents/ManageAccounts";
import ManagePlans from "./admincomponents/ManagePlans";
import Reports from "./admincomponents/Reports";
import AdminFeedback from "./admincomponents/AdminFeedback";
import ManagePayments from "./admincomponents/ManagePayments";

// Auth Components
import ProtectedRoute from "./admincomponents/ProtectedRoute";
import Login from "./admincomponents/Login";

// Customer Components
import CustomerDashboard from "./components/CustomerDashboard";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";
import CollectorLogin from "./collectorcomponents/CollectorLogin";
import CollectorDashboard from "./collectorcomponents/CollectorDashboard";
import CollectorProfile from "./collectorcomponents/CollectorProfile";
import CollectorCustomers from "./collectorcomponents/CollectorCustomers";
import CollectorCollections from "./collectorcomponents/CollectorCollections";
import CollectorWithdrawals from "./collectorcomponents/CollectorWithdrawals";
import AdminCollectorFeedback from "./admincomponents/AdminCollectorFeedback";
import BankStatement from "./admincomponents/BankStatement";
import PigmyLandingPage from "./components/PigmyLandingPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
           <Route path="/" element={<PigmyLandingPage />} />
          <Route path="/pigmy" element={<PigmyXpressDashboard />} />
          <Route path="/paymentpage" element={<PaymentPage />} />
          <Route path="/accountspage" element={<AccountsPage />} />
          <Route path="/withdrawal" element={<Withdrawal />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/auth" element={<CustomerLogin />} />

          {/* Protected Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <CustomerProtectedRoute>
                <CustomerDashboard />
              </CustomerProtectedRoute>
            }
          />

          {/* Admin Authentication Routes */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* ✅ Remove the duplicate redirect and use index properly */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="collectors" element={<ManageCollectors />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="accounts" element={<ManageAccounts />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="plans" element={<ManagePlans />} />
            <Route path="reports" element={<Reports />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="collector/feedback" element={<AdminCollectorFeedback />} />
            <Route path="statement" element={<BankStatement />} />
          </Route>

          {/* ✅ FIXED: Remove the conflicting /admin redirect route */}

          {/* Other Redirects */}
          <Route
            path="/customer"
            element={<Navigate to="/customer/dashboard" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* collector route */}
          <Route path="/collector/login" element={<CollectorLogin />} />
          <Route path="/collector/dashboard" element={<CollectorDashboard />} />
          <Route path="/collector/profile" element={<CollectorProfile />} />
          <Route path="/collector/customers" element={<CollectorCustomers />} />
          <Route path="/collector/collections" element={<CollectorCollections />} />
          <Route path="/collector/withdrawals" element={<CollectorWithdrawals />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
