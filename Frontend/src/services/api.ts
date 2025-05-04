import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Rate limiting for API calls
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; 
let authFlowInProgress = false; 

// Create an axios instance with base URL
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Adding auth token to request");
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No auth token found for request");
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log detailed error information
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services with enhanced debugging
export const authService = {
  login: async (email: string, password: string) => {
    console.log("🔑 Login attempt for:", email);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const response = await axios.post(`${API_BASE_URL}/auth/token`, formData);
      console.log("✅ Login successful, token received");
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error details:', error.response?.data);
      if (error.code === 'ERR_NETWORK') {
        console.error('Network error: Make sure the backend server is running at', API_BASE_URL);
      }
      throw error;
    }
  },
  
  // Register function
  register: async (userData: any) => {
    console.log("📝 Registration attempt with data:", userData);
    try {
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      
      // Add all basic fields
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('phone_number', userData.phone_number);
      formData.append('full_name', userData.full_name);
      formData.append('role', userData.role);
      formData.append('terms_accepted', String(userData.terms_accepted));
      
      // Add optional fields if they exist
      if (userData.nic_number) formData.append('nic_number', userData.nic_number);
      if (userData.gender) formData.append('gender', userData.gender);
      if (userData.date_of_birth) formData.append('date_of_birth', userData.date_of_birth);
      if (userData.marital_status) formData.append('marital_status', userData.marital_status);
      if (userData.housing_status) formData.append('housing_status', userData.housing_status);
      if (userData.job_title) formData.append('job_title', userData.job_title);
      if (userData.monthly_income) formData.append('monthly_income', String(userData.monthly_income));
      if (userData.business_name) formData.append('business_name', userData.business_name);
      
      // Add address as JSON string if it exists
      if (userData.address) {
        formData.append('address', JSON.stringify(userData.address));
      }
      
      // Add document type if it exists
      if (userData.document_type) {
        formData.append('document_type', userData.document_type);
      }
      
      // Add document files if they exist
      if (userData.document_uploads && userData.document_uploads.length > 0) {
        userData.document_uploads.forEach((file: File, index: number) => {
          formData.append('document_files', file);
        });
      }
      
      // Send the request to the register endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("✅ Registration successful:", response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    console.log("👤 Getting current user profile");
    
    // Check for admin mock token
    if (localStorage.getItem('token') === "admin-mock-token") {
      console.log("👤 Admin user profile retrieved");
      return {
        id: "admin-id",
        email: "admin@gmail.com",
        role: "admin",
        full_name: "System Administrator",
        phone_number: "N/A",
        is_active: true
      };
    }
    
    try {
      // Regular flow for normal users
      const response = await api.get('/users/me');
      console.log("👤 User profile retrieved:", response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  },
  setAuthFlowInProgress: (inProgress: boolean) => {
    authFlowInProgress = inProgress;
    console.log(`🔄 Auth flow in progress: ${inProgress}`);
  }
};

// User services
export const userService = {
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  changePassword: async (passwordData: any) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },
  getBorrowerProfile: async () => {
    try {
      console.log("Fetching borrower profile data");
      const response = await api.get('/users/me');
      
      // If the user has a borrower_profile, fetch that too for additional details
      if (response.data.role === 'borrower') {
        try {
          const borrowerResponse = await api.get('/borrowers/profile');
          return { ...response.data, borrower_profile: borrowerResponse.data };
        } catch (error) {
          console.error('Error fetching borrower profile details:', error);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  updateBorrowerProfile: async (profileData: any) => {
    try {
      console.log("Updating borrower profile data:", profileData);
      // Change this line to use the correct endpoint
      const response = await api.put('/borrowers/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  // Get lender profile
  getLenderProfile: async () => {
    try {
      console.log("Fetching lender profile data");
      const response = await api.get('/users/me');
      
      // If the user has a lender profile, fetch additional details
      if (response.data.role === 'lender') {
        try {
          const lenderResponse = await api.get('/lenders/profile');
          return { ...response.data, lender_profile: lenderResponse.data };
        } catch (error) {
          console.error('Error fetching lender profile details:', error);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Update lender profile
  updateLenderProfile: async (profileData: any) => {
    try {
      console.log("Updating lender profile data:", profileData);
      const response = await api.put('/users/me', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Update lender's business details
  updateLenderBusiness: async (businessData: any) => {
    try {
      console.log("Updating lender business data:", businessData);
      const response = await api.put('/lenders/business', businessData);
      return response.data;
    } catch (error) {
      console.error('Error updating business details:', error);
      throw error;
    }
  },
  
  // Update user's address
  updateAddress: async (addressData: any) => {
    try {
      console.log("Updating address data:", addressData);
      const response = await api.put('/users/address', addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },
};

// Support services
export const supportService = {
  createTicket: async (ticketData: any) => {
    const response = await api.post('/support/tickets', ticketData);
    return response.data;
  },
  getTickets: async (status?: string) => {
    const response = await api.get('/support/tickets', { params: { status } });
    return response.data;
  },
  getTicket: async (ticketId: string) => {
    const response = await api.get(`/support/tickets/${ticketId}`);
    return response.data;
  },
  replyToTicket: async (ticketId: string, replyData: any) => {
    const response = await api.post(`/support/tickets/${ticketId}/reply`, replyData);
    return response.data;
  },
  closeTicket: async (ticketId: string) => {
    const response = await api.patch(`/support/tickets/${ticketId}/close`);
    return response.data;
  },
};

// Loan services
export const loanService = {
  getLoans: async (status?: string) => {
    try {
      console.log("Fetching loans from API...");
      // Use consistent URL without trailing slash
      const response = await api.get('/loans', { params: { status } });
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching loans:', error);
      // Return empty array instead of throwing, to avoid breaking the UI
      return [];
    }
  },
  getLoan: async (loanId: string): Promise<any> => {
    try {
      // Use consistent URL without trailing slash
      const response = await api.get(`/loans/${loanId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan details:', error);
      throw error;
    }
  },
  createLoan: async (loanData: any) => {
    try {
      // Ensure all necessary fields are present and in the correct format
      const formattedData = {
        borrower_nic: loanData.borrower_nic,
        amount: parseFloat(loanData.amount),
        interest_rate: parseFloat(loanData.interest_rate),
        term_months: parseInt(loanData.term_months),
        purpose: loanData.purpose || "",
        lender_name: loanData.lender_name || "",
        customer_name: loanData.customer_name || "",
        customer_phone: loanData.customer_phone || "",
        customer_address: loanData.customer_address || "",
        installment_amount: loanData.installment_amount || 0,
        // Add customer gender
        customer_gender: loanData.customer_gender || ""
      };
      
      // Make the API call
      const response = await api.post('/loans', formattedData);
      console.log("Loan creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },
  // Add this new method
  updateLoanStatus: async (loanId: string, status: string) => {
    // Use consistent URL without trailing slash
    const response = await api.patch(`/loans/${loanId}/status?status=${status}`);
    return response.data;
  },
  searchCustomerByNIC: async (nicNumber: string) => {
    try {
      const response = await api.get(`/borrowers/search`, { 
        params: { nic_number: nicNumber } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching customer:', error);
      throw error;
    }
  },
  calculateLoanDetails: async (amount: number, taxRate: number, installments: number) => {
    // Simple calculation on client side (could be moved to server)
    const taxAmount = amount * (taxRate / 100);
    const totalAmount = amount + taxAmount;
    const installmentPrice = totalAmount / installments;
    
    return {
      taxAmount,
      totalAmount,
      installmentPrice: Math.round(installmentPrice * 100) / 100
    };
  },
  getLoanPayments: async (loanId: string) => {
    try {
        console.log(`Fetching payments for loan: ${loanId}`);
        const response = await api.get(`/loans/${loanId}/payments`);
        console.log("Loan payments response:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching loan payments:', error);
        // Return empty array to prevent UI errors
        return [];
    }
  },

  getNextInstallment: async (loanId: string) => {
    try {
      const response = await api.get(`/loans/${loanId}/next-installment`);
      return response.data;
    } catch (error) {
      console.error('Error fetching next installment:', error);
      return null;
    }
  },
  getBorrowerLoanSummary: async () => {
    try {
      console.log("Fetching loan summary from API...");
      // Make sure there's no trailing slash - be consistent with URL format
      const response = await api.get('/loans/borrower/summary');
      console.log("API response for loan summary:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan summary:', error);
      // Return a default structure to avoid breaking the UI
      return {
        stats: {
          activeLoans: 0,
          completedLoans: 0,
          totalBorrowed: 0,
          currentBalance: 0,
          totalPaid: 0,
          nextPaymentDue: new Date(),
          nextPaymentAmount: 0,
        },
        loans: [],
        upcomingPayments: [],
        recentPayments: []
      };
    }
  },
  calculateLoanHealth: (loans: any[]): string => {
    if (loans.length === 0) return "Good";
    
    // Count overdue payments
    let overdueCount = 0;
    let totalPayments = 0;
    
    for (const loan of loans) {
      if (loan.payments) {
        for (const payment of loan.payments) {
          totalPayments++;
          if (payment.status === "LATE" || payment.status === "MISSED") {
            overdueCount++;
          }
        }
      }
    }
    
    // Calculate health based on overdue ratio
    if (totalPayments === 0) return "Good";
    
    const overdueRatio = overdueCount / totalPayments;
    
    if (overdueRatio === 0) return "Excellent";
    if (overdueRatio < 0.05) return "Good";
    if (overdueRatio < 0.1) return "Fair";
    return "Poor";
  },

  formatLoanSummaryData: (data: any) => {
    // Format dates
    if (data.stats?.nextPaymentDue) {
      data.stats.nextPaymentDue = new Date(data.stats.nextPaymentDue);
    }
    
    // Format loans
    if (data.loans) {
      data.loans = data.loans.map((loan: any) => ({
        ...loan,
        startDate: new Date(loan.startDate),
        endDate: new Date(loan.endDate)
      }));
    }
    
    // Format upcoming payments
    if (data.upcomingPayments) {
      data.upcomingPayments = data.upcomingPayments.map((payment: any) => ({
        ...payment,
        dueDate: new Date(payment.dueDate)
      }));
    }
    
    // Format recent payments
    if (data.recentPayments) {
      data.recentPayments = data.recentPayments.map((payment: any) => ({
        ...payment,
        paidDate: new Date(payment.paidDate)
      }));
    }
    
    return data;
  },
  getCustomerLoansByNIC: async (nicNumber: string): Promise<any> => {
    try {
        console.log("Fetching customer loans by NIC:", nicNumber);
        // First get the borrower by NIC
        const borrower = await api.get(`/borrowers/search`, { 
            params: { nic_number: nicNumber } 
        });
        
        if (!borrower.data || !borrower.data.id) {
            console.warn("Borrower found but no ID available");
            return [];
        }
        
        console.log("Found borrower:", borrower.data);
        console.log("Borrower ID:", borrower.data.id);
        
        // Then get loans for that borrower
        try {
            // Directly try to get the borrower's loans
            const response = await api.get(`/loans/borrower/${borrower.data.id}`);
            console.log("Customer loans:", response.data);
            
            // Map the response to match our CustomerLoan type
            return response.data.map((loan: any) => ({
                id: loan._id || loan.id,
                customerName: borrower.data.full_name,
                createdAt: new Date(loan.created_at || loan.start_date || new Date()),
                totalAmount: loan.total_amount,
                paidAmount: loan.total_paid,
                orderState: loan.total_paid === 0 ? "pending" : 
                          loan.total_paid < loan.total_amount ? "partial_paid" : "paid"
            }));
        } catch (error: any) {
            console.error("Error details:", error.response?.data);
            
            // If we get a 404, it means the borrower exists but has no loans
            if (error.response?.status === 404) {
                console.log("Endpoint not found or borrower has no loans");
                // Return empty array for no loans
                return [];
            }
            
            // Generic error fallback
            console.error("Error fetching borrower loans:", error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching customer loans:', error);
        return []; // Return empty array instead of throwing
    }
  },
  searchCustomerByUserId: async (userId: string) => {
    try {
      const response = await api.get(`/borrowers/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error searching customer by user ID:', error);
      throw error;
    }
  }
};

// Payment services
export const paymentService = {
  createPayment: async (paymentData: any) => {
    try {
      console.log("Creating payment with data:", paymentData);
      const response = await api.post('/payments', paymentData);
      
      // If successful, fetch updated loan details to refresh the UI
      if (paymentData.loan_id) {
        try {
          await loanService.getLoan(paymentData.loan_id);
        } catch (err) {
          console.log("Error refreshing loan data after payment");
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
  getPayments: async (loanId?: string, status?: string) => {
    try {
      const params: any = {};
      if (loanId) params.loan_id = loanId;
      if (status) params.status = status;
      
      // Try to get payments from the payments API endpoint
      let response;
      try {
        response = await api.get('/payments', { params });
      } catch (error) {
        console.error('Error fetching payments from main endpoint:', error);
        
        // Fallback: try to get payments directly from the loan
        if (loanId) {
          const loanResponse = await api.get(`/loans/${loanId}`);
          if (loanResponse.data && loanResponse.data.payments) {
            return loanResponse.data.payments;
          }
        }
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];  // Return empty array to avoid breaking the UI
    }
  },
  getPayment: async (paymentId: string) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },
  updatePaymentStatus: async (paymentId: string, status: string) => {
    try {
      const response = await api.patch(`/payments/${paymentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },
  getCards: async () => {
    try {
      console.log("Fetching cards from API");
      // Use consistent URL without trailing slash
      const response = await api.get('/cards');
      console.log("Cards fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];  // Return empty array to avoid breaking the UI
    }
  },
  addCard: async (cardData: any) => {
    try {
      console.log("Adding card with data:", cardData);
      // Use consistent URL without trailing slash
      const response = await api.post('/cards', cardData);
      console.log("Card added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  },
  deleteCard: async (cardId: string) => {
    try {
      console.log("Deleting card:", cardId);
      // Use consistent URL without trailing slash
      const response = await api.delete(`/cards/${cardId}`);
      console.log("Card deleted successfully");
      return response.data;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },
  addLoanPayment: async (loanId: string, paymentData: {
    amount: number;
    payment_date: Date;
    method: string;
    status: string;
  }): Promise<any> => {
    try {
      const response = await api.post(`/loans/${loanId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },
};

// Advertisement services
export const adService = {
  getAds: async (filters?: any) => {
    try {
      const response = await api.get('/advertisements', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching advertisements:', error);
      // Return empty array instead of throwing error when no ads exist
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },
  getMyAds: async () => {
    try {
      const response = await api.get('/advertisements/my');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching my advertisements:', error);
      // Return empty array instead of throwing error when no ads exist
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },
  getAd: async (adId: string) => {
    try {
      const response = await api.get(`/advertisements/${adId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching advertisement details:', error);
      throw error;
    }
  },
  createAd: async (formData: FormData) => {
    try {
      const response = await api.post('/advertisements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  },
  updateAd: async (adId: string, formData: FormData) => {
    try {
      const response = await api.put(`/advertisements/${adId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  },
  deleteAd: async (adId: string) => {
    try {
      const response = await api.delete(`/advertisements/${adId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  },
};

// Risk analysis services
export const riskService = {
  getBorrowerRiskData: async (borrowerId: string) => {
    try {
      const response = await api.get(`/risk-analysis/borrower/${borrowerId}/data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching borrower risk data:', error);
      throw error;
    }
  },
  
  analyzeRisk: async (riskData: any) => {
    try {
      console.log("Analyzing risk with data:", riskData);
      const response = await api.post('/risk-analysis/analyze', riskData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing risk profile:', error);
      throw error;
    }
  },
};

// Notification services
export const notificationService = {
  getNotifications: async (params: { read?: boolean; type?: string; limit?: number; offset?: number } = {}) => {
    try {
      console.log("Fetching notifications from API...");
      const response = await api.get('/notifications', { params });
      
      // Debug notification timestamps
      if (response.data.notifications && response.data.notifications.length > 0) {
        console.log("Sample notification timestamp:", response.data.notifications[0].timestamp);
        console.log("Current time:", new Date().toISOString());
      }
      
      // Format timestamps in notifications
      if (response.data.notifications && Array.isArray(response.data.notifications)) {
        response.data.notifications = response.data.notifications.map((notification: any) => {
          if (notification.timestamp) {
            const originalTime = notification.timestamp;
            notification.formattedTime = formatNotificationTime(notification.timestamp);
            console.log(`Formatted time: "${originalTime}" -> "${notification.formattedTime}"`);
          } else {
            notification.formattedTime = "No timestamp";
          }
          return notification;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return a default structure to avoid breaking the UI
      return { 
        notifications: [], 
        total: 0, 
        limit: params.limit || 10, 
        offset: params.offset || 0 
      };
    }
  },
  
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  deleteNotification: async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  deleteAllNotifications: async () => {
    try {
      await api.delete('/notifications');
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },
  
  checkPaymentReminders: async () => {
    try {
      const response = await api.post('/notifications/check-reminders');
      return response.data;
    } catch (error) {
      console.error('Error checking payment reminders:', error);
      return false;
    }
  },
  createTestNotification: async () => {
    try {
      const response = await api.post('/notifications/test');
      return response.data;
    } catch (error) {
      console.error('Error creating test notification:', error);
      throw error;
    }
  }
};

// Add this helper function to format notification timestamps
function formatNotificationTime(timestamp: string): string {
  try {
    // Parse the timestamp with explicit UTC handling
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date received:', timestamp);
      return "Unknown time";
    }
    
    // Get current date in UTC to match server time
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now";
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Format date string with client's local time format
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return "Unknown time";
  }
}

export default api;
