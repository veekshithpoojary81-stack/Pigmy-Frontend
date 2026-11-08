import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add appropriate auth token
// API.interceptors.request.use(
//     (config) => {
//         // Define customer route patterns
//         const customerRoutePatterns = [
//             '/auth/customer',
//             '/customer/',
//             '/payments/process',
//             '/payments/account/',
//             '/payments/customer/my-payments',
//             '/accounts/customer/',
//             '/transactions/customer/'
//         ];

//         // Check if current URL matches any customer route pattern
//         const isCustomerRoute = customerRoutePatterns.some(pattern => 
//             config.url.includes(pattern)
//         );

//         if (isCustomerRoute) {
//             // Use customer token for customer routes
//             const customerToken = localStorage.getItem('customerToken');
//             if (customerToken) {
//                 config.headers.Authorization = `Bearer ${customerToken}`;
//                 console.log('🔐 Using customer token for:', config.url);
//             } else {
//                 console.warn('⚠️ No customer token found for customer route:', config.url);
//                 // Redirect to login if not already on login page
//                 if (!config.url.includes('/auth/customer/login')) {
//                     window.location.href = '/auth';
//                     return Promise.reject(new Error('No customer token found'));
//                 }
//             }
//         } else {
//             // Use admin token for all other routes
//             const adminToken = localStorage.getItem('adminToken');
//             if (adminToken) {
//                 config.headers.Authorization = `Bearer ${adminToken}`;
//                 console.log('👨‍💼 Using admin token for:', config.url);
//             }
//         }

//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Request interceptor to add appropriate auth token
// API.interceptors.request.use(
//     (config) => {
//         // Define customer route patterns
//         const customerRoutePatterns = [
//             '/auth/customer',
//             '/customer/',
//             '/payments/process',
//             '/payments/account/',
//             '/payments/customer/my-payments',
//             '/accounts/customer/',
//             '/transactions/customer/'
//         ];

//         // Define admin route patterns
//         const adminRoutePatterns = [
//             '/auth/login',
//             '/auth/register', 
//             '/auth/me',
//             '/auth/profile',
//             '/auth/change-password',
//             '/auth/logout',
//             '/collectors',
//             '/customers',
//             '/accounts',
//             '/transactions', 
//             '/plans',
//             '/payments',
//             '/reports',
//             '/feedback'
//         ];

//         // Check if current URL matches any customer route pattern
//         const isCustomerRoute = customerRoutePatterns.some(pattern => 
//             config.url.includes(pattern)
//         );

//         // Check if current URL matches any admin route pattern  
//         const isAdminRoute = adminRoutePatterns.some(pattern =>
//             config.url.includes(pattern)
//         );

//         console.log('🛣️ Route detection:', {
//             url: config.url,
//             isCustomerRoute,
//             isAdminRoute
//         });

//         if (isCustomerRoute) {
//             // Use customer token for customer routes
//             const customerToken = localStorage.getItem('customerToken');
//             if (customerToken) {
//                 config.headers.Authorization = `Bearer ${customerToken}`;
//                 console.log('🔐 Using customer token for:', config.url);
//             } else {
//                 console.warn('⚠️ No customer token found for customer route:', config.url);
//                 if (!config.url.includes('/auth/customer/login')) {
//                     window.location.href = '/auth';
//                     return Promise.reject(new Error('No customer token found'));
//                 }
//             }
//         } else if (isAdminRoute) {
//             // Use admin token for admin routes
//             const adminToken = localStorage.getItem('adminToken');
//             if (adminToken) {
//                 config.headers.Authorization = `Bearer ${adminToken}`;
//                 console.log('👨‍💼 Using admin token for:', config.url);
//             } else {
//                 console.warn('⚠️ No admin token found for admin route:', config.url);
//                 if (!config.url.includes('/auth/login')) {
//                     window.location.href = '/admin/login';
//                     return Promise.reject(new Error('No admin token found'));
//                 }
//             }
//         } else {
//             console.warn('🤔 Route not categorized:', config.url);
//             // For uncategorized routes, try admin token first, then customer
//             const adminToken = localStorage.getItem('adminToken');
//             if (adminToken) {
//                 config.headers.Authorization = `Bearer ${adminToken}`;
//                 console.log('👨‍💼 Using admin token (fallback) for:', config.url);
//             }
//         }

//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );
// Request interceptor to add appropriate auth token
// API.interceptors.request.use(
//     (config) => {
//         // Define routes that DON'T require authentication
//         const publicRoutes = [
//             '/auth/login',
//             '/auth/register',
//             '/auth/customer/login'
//         ];

//         // Check if this is a public route (no auth required)
//         const isPublicRoute = publicRoutes.some(pattern =>
//             config.url.includes(pattern)
//         );

//         if (isPublicRoute) {
//             console.log('🌐 Public route, no token required:', config.url);
//             return config;
//         }

//         // Define customer route patterns
//         const customerRoutePatterns = [
//             '/auth/customer',
//             '/customer/',
//             '/payments/process',
//             '/payments/account/',
//             '/payments/customer/my-payments',
//             '/accounts/customer/',
//             '/transactions/customer/'
//         ];

//         // Define admin route patterns (EXCLUDING login/register)
//         const adminRoutePatterns = [
//             '/auth/me',
//             '/auth/profile',
//             '/auth/change-password',
//             '/auth/logout',
//             '/collectors',
//             '/customers',
//             '/accounts',
//             '/transactions',
//             '/plans',
//             '/payments',
//             '/reports',
//             '/feedback'
//         ];

//         // Check if current URL matches any customer route pattern
//         const isCustomerRoute = customerRoutePatterns.some(pattern =>
//             config.url.includes(pattern)
//         );

//         // Check if current URL matches any admin route pattern  
//         const isAdminRoute = adminRoutePatterns.some(pattern =>
//             config.url.includes(pattern)
//         );

//         console.log('🛣️ Route detection:', {
//             url: config.url,
//             isPublicRoute,
//             isCustomerRoute,
//             isAdminRoute
//         });

//         if (isCustomerRoute) {
//             // Use customer token for customer routes
//             const customerToken = localStorage.getItem('customerToken');
//             if (customerToken) {
//                 config.headers.Authorization = `Bearer ${customerToken}`;
//                 console.log('🔐 Using customer token for:', config.url);
//             } else {
//                 console.warn('⚠️ No customer token found for customer route:', config.url);
//                 // Don't redirect for API calls, let the component handle it
//                 return Promise.reject(new Error('No customer token found'));
//             }
//         } else if (isAdminRoute) {
//             // Use admin token for admin routes
//             const adminToken = localStorage.getItem('adminToken');
//             if (adminToken) {
//                 config.headers.Authorization = `Bearer ${adminToken}`;
//                 console.log('👨‍💼 Using admin token for:', config.url);
//             } else {
//                 console.warn('⚠️ No admin token found for admin route:', config.url);
//                 return Promise.reject(new Error('No admin token found'));
//             }
//         } else {
//             console.log('🤔 Uncategorized route, trying tokens...');
//             // For uncategorized routes, try both tokens
//             const adminToken = localStorage.getItem('adminToken');
//             const customerToken = localStorage.getItem('customerToken');

//             if (adminToken) {
//                 config.headers.Authorization = `Bearer ${adminToken}`;
//                 console.log('👨‍💼 Using admin token (fallback) for:', config.url);
//             } else if (customerToken) {
//                 config.headers.Authorization = `Bearer ${customerToken}`;
//                 console.log('🔐 Using customer token (fallback) for:', config.url);
//             } else {
//                 console.warn('⚠️ No tokens available for route:', config.url);
//             }
//         }

//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Request interceptor to add appropriate auth token
API.interceptors.request.use(
    (config) => {
        // Define routes that DON'T require authentication
        const publicRoutes = [
            '/auth/login',
            '/auth/register',
            '/auth/customer/login'
        ];

        // Check if this is a public route (no auth required)
        const isPublicRoute = publicRoutes.some(pattern =>
            config.url.includes(pattern)
        );

        if (isPublicRoute) {
            console.log('🌐 Public route, no token required:', config.url);
            return config;
        }

        // Define customer route patterns - FIXED
        const customerRoutePatterns = [
            '/auth/customer',           // Customer auth routes
            '/customer/',               // Customer-specific routes  
            '/accounts/customer',       // Customer accounts
            '/transactions/customer',   // Customer transactions
            '/payments/customer',       // Customer payments
            '/payments/process',        // Payment processing
            '/payments/account'         // Account payments
        ];

        // Define admin route patterns
        const adminRoutePatterns = [
            '/auth/me',
            '/auth/profile',
            '/auth/change-password',
            '/auth/logout',
            '/collectors',
            '/customers',
            '/accounts',
            '/transactions',
            '/plans',
            '/payments',
            '/reports',
            '/feedback'
        ].filter(pattern => !pattern.includes('/customer')); // Exclude customer routes

        // Check if current URL matches any customer route pattern
        const isCustomerRoute = customerRoutePatterns.some(pattern =>
            config.url.includes(pattern)
        );

        // Check if current URL matches any admin route pattern  
        const isAdminRoute = adminRoutePatterns.some(pattern =>
            config.url.includes(pattern)
        );

        console.log('🛣️ Route detection:', {
            url: config.url,
            isPublicRoute,
            isCustomerRoute,
            isAdminRoute
        });

        if (isCustomerRoute) {
            // Use customer token for customer routes
            const customerToken = localStorage.getItem('customerToken');
            if (customerToken) {
                config.headers.Authorization = `Bearer ${customerToken}`;
                console.log('🔐 Using customer token for:', config.url);
            } else {
                console.warn('⚠️ No customer token found for customer route:', config.url);
                return Promise.reject(new Error('No customer token found'));
            }
        } else if (isAdminRoute) {
            // Use admin token for admin routes
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
                console.log('👨‍💼 Using admin token for:', config.url);
            } else {
                console.warn('⚠️ No admin token found for admin route:', config.url);
                return Promise.reject(new Error('No admin token found'));
            }
        } else {
            console.log('🤔 Uncategorized route, trying tokens...');
            // For uncategorized routes, try customer token first, then admin
            const customerToken = localStorage.getItem('customerToken');
            const adminToken = localStorage.getItem('adminToken');

            if (customerToken) {
                config.headers.Authorization = `Bearer ${customerToken}`;
                console.log('🔐 Using customer token (fallback) for:', config.url);
            } else if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
                console.log('👨‍💼 Using admin token (fallback) for:', config.url);
            } else {
                console.warn('⚠️ No tokens available for route:', config.url);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
// API.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Check if it's a customer route
//             const isCustomerRoute = error.config.url.includes('/auth/customer') || 
//                                    error.config.url.includes('/customer/') ||
//                                    error.config.url.includes('/payments/process');

//             if (isCustomerRoute) {
//                 // Clear customer tokens and redirect to customer login
//                 localStorage.removeItem('customerToken');
//                 localStorage.removeItem('customerData');
//                 if (window.location.pathname.startsWith('/customer') || window.location.pathname === '/auth') {
//                     window.location.href = '/auth';
//                 }
//             } else {
//                 // Clear admin tokens and redirect to admin login
//                 localStorage.removeItem('adminToken');
//                 localStorage.removeItem('adminData');
//                 if (window.location.pathname.startsWith('/admin')) {
//                     window.location.href = '/admin/login';
//                 }
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// Response interceptor to handle token expiration
// In your api.js - FIX THE RESPONSE INTERCEPTOR
// API.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.log('🚨 API Error:', {
//             status: error.response?.status,
//             url: error.config?.url,
//             message: error.message
//         });

//         if (error.response?.status === 401) {
//             const url = error.config?.url;

//             console.log('🔐 401 Unauthorized for:', url);

//             // Don't auto-redirect for certain routes
//             if (url && (
//                 url.includes('/auth/login') ||
//                 url.includes('/auth/verify-token') ||
//                 url.includes('/test-auth')
//             )) {
//                 console.log('🛑 Skipping auto-redirect for auth route');
//                 return Promise.reject(error);
//             }

//             // Check if it's a customer route
//             const isCustomerRoute = url && (
//                 url.includes('/auth/customer') ||
//                 url.includes('/customer/') ||
//                 url.includes('/payments/process')
//             );

//             if (isCustomerRoute) {
//                 console.log('👤 Clearing customer tokens due to 401');
//                 // localStorage.removeItem('customerToken');
//                 // localStorage.removeItem('customerData');
//                 // Only redirect if not already on auth page
//                 if (!window.location.pathname.includes('/auth')) {
//                     window.location.href = '/auth';
//                 }
//             } else {
//                 console.log('👨‍💼 Clearing admin tokens due to 401');
//                 // localStorage.removeItem('adminToken');
//                 // localStorage.removeItem('adminData');
//                 // Only redirect if not already on admin login page
//                 if (!window.location.pathname.includes('/admin/login')) {
//                     window.location.href = '/admin/login';
//                 }
//             }
//         }
//         return Promise.reject(error);
//     }
// );
// In your api.js - FIX THE RESPONSE INTERCEPTOR
// In your api.js - COMPLETELY FIXED RESPONSE INTERCEPTOR
API.interceptors.response.use(
    (response) => {
        console.log('✅ API Success:', response.config.url, response.status);
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        console.log('🚨 API Error:', {
            status: status,
            url: url,
            message: error.message
        });

        // For 401 errors, just log and reject - DON'T clear tokens automatically
        if (status === 401) {
            console.log('🔐 401 Unauthorized detected for:', url);
            console.log('ℹ️  Token will be handled by component logic');
            
            // DON'T clear tokens here - let the ProtectedRoute handle it
            // This prevents automatic logout on single failed API calls
        }

        // For other errors, you might want different handling
        if (status === 403) {
            console.log('🚫 403 Forbidden - Insufficient permissions');
        }

        if (status === 404) {
            console.log('🔍 404 Not Found - Resource not available');
        }

        if (status >= 500) {
            console.log('💥 Server Error - Backend issue');
        }

        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================

// Admin Auth API
export const loginAdmin = (credentials) => API.post('/auth/login', credentials);
export const registerAdmin = (adminData) => API.post('/auth/register', adminData);
export const getAdminProfile = () => API.get('/auth/me');
export const updateAdminProfile = (profileData) => API.put('/auth/profile', profileData);
export const changeAdminPassword = (passwordData) => API.put('/auth/change-password', passwordData);
export const logoutAdmin = () => API.post('/auth/logout');

// Customer Auth API
export const loginCustomer = (credentials) => API.post('/auth/customer/login', credentials);
export const getCustomerProfile = () => API.get('/auth/customer/me');
export const changeCustomerPassword = (passwordData) => API.put('/auth/customer/change-password', passwordData);
export const logoutCustomer = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    return Promise.resolve();
};

// ==================== CUSTOMER PLANS API ====================

export const getCustomerPlans = () => API.get('/customer/plans');
export const getCustomerPlanDetails = (planId) => API.get(`/customer/plans/${planId}`);
export const makePlanPayment = (paymentData) => API.post('/customer/payments', paymentData);
export const getCustomerTransactions = (params = {}) => API.get('/customer/transactions', { params });
export const getCustomerPaymentHistory = () => API.get('/customer/payments/history');

// ==================== COLLECTORS API ====================

export const getCollectors = (params = {}) => API.get('/collectors', { params });
export const createCollector = (collectorData) => API.post('/collectors', collectorData);
export const updateCollector = (id, collectorData) => API.put(`/collectors/${id}`, collectorData);
export const deleteCollector = (id) => API.delete(`/collectors/${id}`);
export const getCollectorStats = () => API.get('/collectors/stats/overview');
export const getCollectorById = (id) => API.get(`/collectors/${id}`);

// ==================== CUSTOMERS API ====================

export const getCustomers = (params = {}) => API.get('/customers', { params });
export const createCustomer = (customerData) => API.post('/customers', customerData);
export const updateCustomer = (id, customerData) => API.put(`/customers/${id}`, customerData);
export const getCustomerById = (id) => API.get(`/customers/${id}`);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
export const getCustomersByCollector = (collectorId) => API.get(`/customers/collector/${collectorId}`);
export const resetCustomerPassword = (id) => API.put(`/customers/${id}/reset-password`);
export const getCustomerStats = () => API.get('/customers/stats/overview');
export const searchCustomers = (query) => API.get(`/customers/search?q=${query}`);

// ==================== ACCOUNTS API ====================

export const getAccounts = (params = {}) => API.get('/accounts', { params });
// export const createAccount = (data) => API.post('/accounts', data);
export const createAccount = (data) => {
  const token = localStorage.getItem("adminToken");
  return API.post('/accounts', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateAccount = (id, data) => API.put(`/accounts/${id}`, data);
export const getAccountById = (id) => API.get(`/accounts/${id}`);
export const deleteAccount = (id) => API.delete(`/accounts/${id}`);
export const getAccountStats = () => API.get('/accounts/stats/overview');
// export const getAccountsByCustomer = (customerId) => API.get(`/accounts/customer/${customerId}`);
export const getAccountsByCustomer = (customerId) => {
    return API.get(`/accounts/customer/${customerId}?t=${Date.now()}`);
};
export const getAccountByNumber = (accountNumber) => API.get(`/accounts/number/${accountNumber}`);
export const updateAccountBalance = (accountId, balanceData) => API.patch(`/accounts/${accountId}/balance`, balanceData);

// ==================== TRANSACTIONS API ====================

export const getTransactions = (params = {}) => API.get('/transactions', { params });
export const addTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getTransactionStats = () => API.get('/transactions/stats/overview');
export const getTransactionsByAccount = (accountId) => API.get(`/transactions/account/${accountId}`);
export const getTransactionsByCustomer = (customerId) => API.get(`/transactions/customer/${customerId}`);
export const getRecentTransactions = (limit = 10) => API.get(`/transactions/recent?limit=${limit}`);

// ADD WITHDRAWAL FUNCTIONS
// FIXED WITHDRAWAL FUNCTION - Bypass interceptor issues
export const withdrawAmount = (withdrawalData) => {
  const token = localStorage.getItem('customerToken');
  console.log('🔐 Withdrawal Token:', token ? 'PRESENT' : 'MISSING');
  
  // Use axios directly instead of API to avoid interceptor issues
  return axios.post('http://localhost:5000/api/payments/withdraw', withdrawalData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};
export const getWithdrawalHistory = (accountId) => {
  const token = localStorage.getItem('customerToken');
  return API.get(`/payments/account/${accountId}/withdrawals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// Withdrawal API functions
export const getPendingWithdrawals = async () => {
  try {
    const token = localStorage.getItem("collectorToken");
    const response = await axios.get(
      `http://localhost:5000/api/payments/withdrawals/pending`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error);
    throw error;
  }
};

export const approveWithdrawal = async (withdrawalId) => {
  try {
    console.log(withdrawalId, "withdrawal id")
    const token = localStorage.getItem("collectorToken");
    const response = await axios.put(
      `http://localhost:5000/api/payments/withdrawals/${withdrawalId}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    throw error;
  }
};

export const rejectWithdrawal = async (withdrawalId, rejectionData) => {
  try {
    const token = localStorage.getItem("collectorToken");
    const response = await axios.put(
      `http://localhost:5000/api/payments/withdrawals/${withdrawalId}/reject`,
      rejectionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    throw error;
  }
};

// ==================== PLANS API ====================

export const getPlans = (params = {}) => API.get('/plans', { params });
export const getPlanById = (id) => API.get(`/plans/${id}`);
export const createPlan = (planData) => API.post('/plans', planData);
export const updatePlan = (id, planData) => API.put(`/plans/${id}`, planData);
export const deletePlan = (id) => API.delete(`/plans/${id}`);
export const updatePlanStatus = (id, statusData) => API.patch(`/plans/${id}/status`, statusData);
export const getPlanStats = () => API.get('/plans/stats/overview');
export const getPlansByType = (type) => API.get(`/plans/type/${type}`);
export const calculateMaturity = (id, data) => API.post(`/plans/${id}/calculate-maturity`, data);
export const getActivePlans = () => API.get('/plans/active');
export const getPlanSubscribers = (planId) => API.get(`/plans/${planId}/subscribers`);

// ==================== PAYMENTS API ====================

export const getPayments = (params = {}) => API.get('/payments', { params });
export const createPayment = (paymentData) => API.post('/payments', paymentData);
export const updatePayment = (id, paymentData) => API.put(`/payments/${id}`, paymentData);
export const deletePayment = (id) => API.delete(`/payments/${id}`);
export const getPaymentStats = () => API.get('/payments/stats/overview');
export const getPaymentsByCustomer = (customerId) => API.get(`/payments/customer/${customerId}`);
export const getPaymentsByCollector = (collectorId) => API.get(`/payments/collector/${collectorId}`);
export const processBulkPayments = (paymentsData) => API.post('/payments/bulk', paymentsData);


// UPDATED PAYMENT PROCESSING ENDPOINTS - Now properly authenticated
export const processPayment = (paymentData) => API.post('/payments/process', paymentData);
export const updatePaymentStatus = (paymentId, statusData) => API.patch(`/payments/${paymentId}/status`, statusData);
// export const getPaymentHistory = (accountId) => API.get(`/payments/account/${accountId}/history`);
export const getPaymentHistory = (accountId) => {
    return API.get(`/payments/account/${accountId}/history?t=${Date.now()}`);
};
export const verifyPayment = (paymentId, verificationData) => API.post(`/payments/${paymentId}/verify`, verificationData);
export const getPendingPayments = (params = {}) => API.get('/payments/pending', { params });
export const getMyPayments = () => API.get('/payments/customer/my-payments');

// ==================== REPORTS API ====================

export const getReports = (params = {}) => API.get('/reports', { params });
export const generateReport = (reportData) => API.post('/reports/generate', reportData);
export const getDashboardStats = () => API.get('/reports/dashboard-stats');
export const getCollectionReport = (params = {}) => API.get('/reports/collections', { params });
export const getCustomerReport = (params = {}) => API.get('/reports/customers', { params });
export const getFinancialReport = (params = {}) => API.get('/reports/financial', { params });

// ==================== FEEDBACK API ====================

export const getFeedback = (params = {}) => API.get('/feedback', { params });
export const submitFeedback = (feedbackData) => API.post('/feedback', feedbackData);
export const updateFeedbackStatus = (id, statusData) => API.patch(`/feedback/${id}/status`, statusData);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
export const getFeedbackStats = () => API.get('/feedback/stats/overview');

// ==================== UTILITY FUNCTIONS ====================

// Helper function to get current user type
export const getCurrentUserType = () => {
    if (localStorage.getItem('adminToken')) return 'admin';
    if (localStorage.getItem('customerToken')) return 'customer';
    return null;
};

// Helper function to get current user token
export const getCurrentToken = () => {
    const userType = getCurrentUserType();
    if (userType === 'admin') return localStorage.getItem('adminToken');
    if (userType === 'customer') return localStorage.getItem('customerToken');
    return null;
};

// Helper function to logout all users
export const logoutAll = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    return !!(localStorage.getItem('adminToken') || localStorage.getItem('customerToken'));
};

// Helper function to get user data
export const getUserData = () => {
    const userType = getCurrentUserType();
    if (userType === 'admin') {
        const adminData = localStorage.getItem('adminData');
        return adminData ? JSON.parse(adminData) : null;
    }
    if (userType === 'customer') {
        const customerData = localStorage.getItem('customerData');
        return customerData ? JSON.parse(customerData) : null;
    }
    return null;
};

export default API;