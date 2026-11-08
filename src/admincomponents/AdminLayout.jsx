import React from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LogOut, 
  User, 
  Shield, 
  Home,
  Users,
  CreditCard,
  Settings,
  Bell,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  Wallet,
  FileText
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  // Add debugging to see what's actually stored
  React.useEffect(() => {
    const adminData = localStorage.getItem("adminData");
    const adminToken = localStorage.getItem("adminToken");
    
    console.log('🏠 AdminLayout mounted');
    console.log('🔑 Admin token:', adminToken ? 'EXISTS' : 'MISSING');
    console.log('👤 Admin data:', adminData);
    console.log('📍 Current path:', location.pathname);
  }, [location]);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  // Safe parsing of admin data
  const getAdminData = () => {
    try {
      const adminDataStr = localStorage.getItem("adminData");
      if (!adminDataStr) return {};
      return JSON.parse(adminDataStr);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      return {};
    }
  };

  const adminData = getAdminData();

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: Home },
    { path: "/admin/customers", label: "Customers", icon: Users },
    { path: "/admin/collectors", label: "Collectors", icon: User },
    { path: "/admin/accounts", label: "Accounts", icon: CreditCard },
    { path: "/admin/plans", label: "Plans", icon: FileText },
    { path: "/admin/payments", label: "Payments", icon: Wallet },
    { path: "/admin/feedback", label: "Customer Feedback", icon: MessageSquare },
    { path: "/admin/collector/feedback", label: "Collector Feedback", icon: Users },
    // { path: "/admin/reports", label: "Reports", icon: BarChart3 },
    // { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  // Mock notifications data
  const notifications = [
    { id: 1, message: "New customer registration", time: "5 min ago", type: "info" },
    { id: 2, message: "Payment verification required", time: "10 min ago", type: "warning" },
    { id: 3, message: "Withdrawal request pending", time: "15 min ago", type: "alert" },
  ];

  return (
    <div className="flex h-screen w-screen fixed mx-[-9.8rem] mt-[-2rem]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  PigmyXpress
                </h1>
                <p className="text-blue-200 text-sm mt-1">Admin Panel</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-800 shadow-lg transform scale-105"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center space-x-3 p-3 bg-blue-700 rounded-lg">
              {/* <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div> */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                 Admin User
                </p>
                {/* <p className="text-xs text-blue-200 capitalize truncate">
                  {adminData.role || 'admin'}
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Section - Menu Button & Breadcrumb */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden sm:block">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <div className="flex items-center">
                        <span className="text-gray-400">Admin</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-gray-600 capitalize">
                          {location.pathname.split('/').pop() || 'Dashboard'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>

            {/* Right Section - Notifications & User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
             
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                     Admin User
                  </p>
                  {/* <p className="text-xs text-gray-500 capitalize">
                    {adminData.role || 'admin'}
                  </p> */}
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(adminData.name?.[0] || adminData.email?.[0] || 'A').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                © 2024 PigmyXpress. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Close notifications when clicking outside */}
      {notificationsOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;