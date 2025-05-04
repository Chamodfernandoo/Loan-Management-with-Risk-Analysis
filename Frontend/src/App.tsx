import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { authService } from "./services/api";
import { AuthDebugger } from './components/AuthDebugger';
import { AuthProvider, useAuth } from './context/AuthContext';
// Import the NotificationProvider
import { NotificationProvider } from './context/NotificationContext';

// Lender pages
import Lender_dashbord from "./pages/Lender/lender_dashbord";
import Create_loan from "./pages/Lender/create_loan";
import LoanHistoryPage from "./pages/Lender/All-loans/page";
import CustomerLoanHistoryPage from "./pages/Lender/Customer-loans/page";
import InvoiceView from "./pages/Lender/invoice/page";
import LenderProfilePage from "./pages/Lender/Profile/page";
import LenderSupportPage from "./pages/Lender/Support/support";
import RiskProfilePage from "./pages/Lender/risk_profile/page";
import AdsLayout from "./pages/Lender/Advertisments/Layout";
import AllAdsPage from "./pages/Lender/Advertisments/all-ads/Allads";
import CreateAdPage from "./pages/Lender/Advertisments/creat-ads/Createads";
import AdDetailPage from "./pages/Lender/Advertisments/id/Id";
import EditAdPage from "./pages/Lender/Advertisments/edit/EditAd";
import LenderNotificationsPage from "./pages/Lender/Notify/lender_noification";

// Customer/Borrower pages
import Customer_dashbord from "./pages/Customer/customer_dashbord";
import MyLoanHistoryPage from "./pages/Customer/MyLoans/page";
import MyInvoiceView from "./pages/Customer/MyInvoices/page";
import BorrowerProfilePage from "./pages/Customer/profile-cus/page";
import BorrowerLoanSummaryPage from "./pages/Customer/Summary/page";
import IndividualLoanPage from "./pages/Customer/Summary/individual-loan/page";
import BorrowerSupportPage from "./pages/Customer/Support/page";
import BorrowerNotificationsPage from "./pages/Customer/Notification/noti";
import BorrowerAdsLayout from "./pages/Customer/Ads/Layout";
import BorrowerAllAdsPage from "./pages/Customer/Ads/all-ads";
import BorrowerAdDetailPage from "./pages/Customer/Ads/Ad-details";

// Admin pages
import AdminDashboardPage from "./pages/admin/Adminpage";
import AdminLayout from "./pages/admin/layout";
import { UserManagement } from "./components/admin/user-manegement";
import { SupportRequests } from "./components/admin/support-req";
import { SystemSettings } from "./components/admin/system-setting";

// Shared pages
import Agreement from "./pages/Agreement";
import RegistrationPage from "./pages/registration/register";
import Phoneno from "./pages/registration/phonenumber/phoneno";
import Personalinfo from "./pages/registration/account/personalinfo";
import Addressinfo from "./pages/registration/account/addressinfo";
import Doctype from "./pages/registration/documents/doctype";
import Uploadtype from "./pages/registration/documents/uploadtype";
import Termsconditions from "./pages/Terms&conditions";
import Login from "./pages/Login";
import Welcomepage from "./pages/welcomepage";

// Payment pages
import AddCardPage from "./pages/Payments/add-card";
import CardsPage from "./pages/Payments/card";
import MakePaymentPage from "./pages/Payments/make-paymnet";
import PaymentHistoryPage from "./pages/Payments/payment-history";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, userRole, isLoading, refreshAuthState } = useAuth();
  const navigate = useNavigate();

  // This effect runs once on component mount
  useEffect(() => {
    console.log("🔄 Checking auth status in App component");
    refreshAuthState();
  }, [refreshAuthState]);

  // Add a listener for localStorage changes
  useEffect(() => {
    // Function to handle storage events (when token is added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log("🔑 Token changed in localStorage, rechecking auth");
        refreshAuthState();
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshAuthState]);

  // Improved ProtectedRoute component
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    console.log("🛡️ ProtectedRoute check - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "userRole:", userRole);
    
    // Don't render anything if still loading
    if (isLoading) {
      console.log("⏳ Still loading auth state");
      return <div>Loading...</div>;
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log("🔑 Not authenticated, redirecting to login");
      return <Navigate to="/login" replace />;
    }
    
    // Redirect to appropriate dashboard if not authorized for this route
    if (userRole && !allowedRoles.includes(userRole)) {
      console.log("🚫 User not authorized for this route, redirecting to appropriate dashboard");
      
      if (userRole === 'borrower') {
        console.log("🧭 Redirecting to borrower dashboard");
        return <Navigate to="/borrower" replace />;
      } else if (userRole === 'lender') {
        console.log("🧭 Redirecting to lender dashboard");
        return <Navigate to="/lender" replace />;
      } else if (userRole === 'admin') {
        console.log("🧭 Redirecting to admin dashboard");
        return <Navigate to="/admin" replace />;
      }
    }
    
    console.log("✅ Access granted to protected route");
    return <>{children}</>;
  };

  return (
    <>
      {process.env.NODE_ENV === 'development' && <AuthDebugger />}
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/register1" element={<Phoneno />} />
        <Route path="/register3" element={<Personalinfo />} />
        <Route path="/register4" element={<Addressinfo />} />
        <Route path="/register5" element={<Doctype />} />
        <Route path="/register6" element={<Uploadtype />} />
        <Route path="/terms" element={<Termsconditions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Welcomepage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/support" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <SupportRequests />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout>
              <SystemSettings />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        {/* Lender routes */}
        <Route path="/lender" element={<ProtectedRoute allowedRoles={['lender']}><Lender_dashbord /></ProtectedRoute>} />
        <Route path="/view_loan" element={<ProtectedRoute allowedRoles={['lender']}><LoanHistoryPage /></ProtectedRoute>} />
        <Route path="/agreement" element={<ProtectedRoute allowedRoles={['lender', 'borrower']}><Agreement /></ProtectedRoute>} />
        <Route path="/agreement/:loanId" element={
          <ProtectedRoute allowedRoles={['lender', 'borrower']}>
            <Agreement />
          </ProtectedRoute>
        } />
        <Route path="/customer-history" element={<ProtectedRoute allowedRoles={['lender']}><CustomerLoanHistoryPage /></ProtectedRoute>} />
        <Route path="/create_loan" element={<ProtectedRoute allowedRoles={['lender']}><Create_loan /></ProtectedRoute>} />
        <Route path="/invoice/:loanId?" element={
          <ProtectedRoute allowedRoles={['lender']}>
            <InvoiceView />
          </ProtectedRoute>
        } />
        <Route path="/lender/profile" element={<ProtectedRoute allowedRoles={['lender']}><LenderProfilePage /></ProtectedRoute>} />
        <Route path="/lender/support" element={<ProtectedRoute allowedRoles={['lender']}><LenderSupportPage /></ProtectedRoute>} />
        <Route path="/risk_profile" element={<ProtectedRoute allowedRoles={['lender']}><RiskProfilePage /></ProtectedRoute>} />
        
        {/* Lender Ads routes */}
        <Route path="/lender/ads" element={<ProtectedRoute allowedRoles={['lender']}><AdsLayout /></ProtectedRoute>}>
          <Route index element={<AllAdsPage />} />
          <Route path="all-ads" element={<AllAdsPage />} />
          <Route path="create" element={<CreateAdPage />} />
          <Route path="edit/:id" element={<EditAdPage />} />
          <Route path=":id" element={<AdDetailPage />} />
        </Route>
        
        {/* Payment routes */}
        <Route path="/payments/add-card" element={<ProtectedRoute allowedRoles={['borrower', 'lender']}><AddCardPage /></ProtectedRoute>} />
        <Route path="/payments/cards" element={<ProtectedRoute allowedRoles={['borrower', 'lender']}><CardsPage /></ProtectedRoute>} />
        <Route path="/payments/make-payment" element={<ProtectedRoute allowedRoles={['borrower', 'lender']}><MakePaymentPage /></ProtectedRoute>} />
        <Route path="/payments/payment-history" element={<ProtectedRoute allowedRoles={['lender']}><PaymentHistoryPage /></ProtectedRoute>} />
        
        {/* Customer routes */}
        <Route path="/borrower" element={<ProtectedRoute allowedRoles={['borrower']}><Customer_dashbord /></ProtectedRoute>} />
        <Route path="/borrower/loans" element={<ProtectedRoute allowedRoles={['borrower']}><MyLoanHistoryPage /></ProtectedRoute>} />
        <Route path="/payments/make-payment" element={<ProtectedRoute allowedRoles={['borrower', 'lender']}><MakePaymentPage /></ProtectedRoute>} />
        <Route path="/invoice1" element={<ProtectedRoute allowedRoles={['borrower']}><MyInvoiceView /></ProtectedRoute>} />
        <Route path="/borrower/profile" element={<ProtectedRoute allowedRoles={['borrower']}><BorrowerProfilePage /></ProtectedRoute>} />
        <Route path="/borrower/loan-summary" element={<ProtectedRoute allowedRoles={['borrower']}><BorrowerLoanSummaryPage /></ProtectedRoute>} />
        <Route path="/borrower/loans/:loanId" element={<ProtectedRoute allowedRoles={['borrower']}><IndividualLoanPage /></ProtectedRoute>} />
        <Route path="/borrower/support" element={<ProtectedRoute allowedRoles={['borrower']}><BorrowerSupportPage /></ProtectedRoute>} />
        <Route path="/borrower/notifications" element={<ProtectedRoute allowedRoles={['borrower']}><BorrowerNotificationsPage /></ProtectedRoute>} />
        
        {/* Borrower Ads routes */}
        <Route path="/borrower/ads" element={<ProtectedRoute allowedRoles={['borrower']}><BorrowerAdsLayout /></ProtectedRoute>}>
          <Route index element={<BorrowerAllAdsPage />} />
          <Route path="all-ads" element={<BorrowerAllAdsPage />} />
          <Route path=":id" element={<BorrowerAdDetailPage />} />
        </Route>
        <Route path="/lender/notifications" element={
          <ProtectedRoute allowedRoles={['lender']}>
            <LenderNotificationsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

export default App;
