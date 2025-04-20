import React from "react";
import { Routes, Route, } from "react-router-dom";
import Lender_dashbord from "./pages/Lender/lender_dashbord";
import Customer_dashbord from "./pages/Customer/customer_dashbord";
import Agreement from "./pages/Agreement";
import Phoneno from "./pages/registration/phonenumber/phoneno";
import Personalinfo from "./pages/registration/account/personalinfo";
import Addressinfo from "./pages/registration/account/addressinfo";
import Doctype from "./pages/registration/documents/doctype";
import Uploadtype from "./pages/registration/documents/uploadtype";
import Termsconditions from "./pages/Terms&conditions";
import Create_loan from "./pages/Lender/create_loan";
import LoanHistoryPage from "./pages/Lender/All-loans/page";
import CustomerLoanHistoryPage from "./pages/Lender/Customer-loans/page";
import InvoiceView from "./pages/Lender/invoice/page";
import AdsLayout from "./pages/Lender/Advertisments/Layout";
import AllAdsPage from "./pages/Lender/Advertisments/all-ads/Allads";
import CreateAdPage from "./pages/Lender/Advertisments/creat-ads/Createads";
import AdDetailPage from "./pages/Lender/Advertisments/id/Id";
import BorrowerAdsLayout from "./pages/Customer/Ads/Layout";
import BorrowerAllAdsPage from "./pages/Customer/Ads/all-ads";
import BorrowerAdDetailPage from "./pages/Customer/Ads/Ad-details";
import MyLoanHistoryPage from "./pages/Customer/MyLoans/page";
import MyInvoiceView from "./pages/Customer/MyInvoices/page";
import LenderProfilePage from "./pages/Lender/Profile/page";
import BorrowerProfilePage from "./pages/Customer/profile-cus/page";
import BorrowerLoanSummaryPage from "./pages/Customer/Summary/page";
import IndividualLoanPage from "./pages/Customer/Summary/individual-loan/page";
import BorrowerSupportPage from "./pages/Customer/Support/page";
import LenderSupportPage from "./pages/Lender/Support/support";
import BorrowerNotificationsPage from "./pages/Customer/Notification/noti";
import AddCardPage from "./pages/Payments/add-card";
import CardsPage from "./pages/Payments/card";
import MakePaymentPage from "./pages/Payments/make-paymnet";
import PaymentHistoryPage from "./pages/Payments/payment-history";
import RegistrationPage from "./pages/registration/register";
import Login from "./pages/Login";
import Welcomepage from "./pages/welcomepage";
import AdminDashboardPage from "./pages/admin/Adminpage";
import AdminLayout from "./pages/admin/layout";
import { UserManagement } from "./components/admin/user-manegement";
import { SupportRequests } from "./components/admin/support-req";
import { SystemSettings } from "./components/admin/system-setting";
import RiskProfilePage from "./pages/Lender/risk_profile/page";


const App: React.FC = () => {
  return (
    <>
     {/* // <Router> */}

     <Routes>
        <Route path="/regiter" element={<RegistrationPage />} />
        <Route path="/register1" element={<Phoneno />} />
        <Route path="/register3" element={<Personalinfo />} />
        <Route path="/register4" element={<Addressinfo />} />
        <Route path="/register5" element={<Doctype />} />
        <Route path="/register6" element={<Uploadtype />} />
        <Route path="/terms" element={<Termsconditions />} />
      </Routes>

      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<Welcomepage/>}/>
      </Routes>

      {/* admin routes */}
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="support" element={<SupportRequests />} />
                <Route path="settings" element={<SystemSettings />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
      {/* lender routes */}
      <Routes>
        <Route path="/lender" element={<Lender_dashbord/>} />
         <Route path="/view_loan" element={<LoanHistoryPage />} />
          <Route path="/agreement" element={<Agreement />} />
          <Route path="/customer-history" element={<CustomerLoanHistoryPage/>} />
         <Route path="/create_loan" element={<Create_loan />} />
        <Route path="/invoice" element={<InvoiceView />} />
        <Route path="/lender/profile" element={<LenderProfilePage />} />
        <Route path="/lender/support" element={<LenderSupportPage />} />
        <Route path="/risk_profile" element={<RiskProfilePage />} />
        
        
        {/* Ads routes */}
        <Route path="/lender/ads" element={<AdsLayout />}>
          <Route index element={<AllAdsPage />} />
          <Route path="all-ads" element={<AllAdsPage />} />
          <Route path="create" element={<CreateAdPage />} />
          <Route path=":id" element={<AdDetailPage />} />
        </Route>

         {/* Payment routes */}
         <Route path="/payments/add-card" element={<AddCardPage />} />
        <Route path="/payments/cards" element={<CardsPage />} />
        <Route path="/payments/make-payment" element={<MakePaymentPage />} />
        <Route path="/payments/payment-history" element={<PaymentHistoryPage />} />

      </Routes>

    {/* customer routes */}
      <Routes>
         <Route path="/borrower" element={<Customer_dashbord />} />
          <Route path="/borrower/loans" element={<MyLoanHistoryPage />} />
          <Route path="/invoice1" element={<MyInvoiceView />} />
          <Route path="/borrower/profile" element={<BorrowerProfilePage />} />
          <Route path="/borrower/loan-summary" element={<BorrowerLoanSummaryPage />} />
        <Route path="/borrower/loans/:loanId" element={<IndividualLoanPage />} />
        <Route path="/borrower/support" element={<BorrowerSupportPage />} />
        <Route path="/borrower/notifications" element={<BorrowerNotificationsPage />} />
          {/* <Route path="/contact" element={<Contact />} /> */}

          {/* Borrower Ads routes */}
          <Route path="/borrower/ads" element={<BorrowerAdsLayout />}>
            <Route index element={<BorrowerAllAdsPage />} />
            <Route path="all-ads" element={<BorrowerAllAdsPage />} />
            <Route path=":id" element={<BorrowerAdDetailPage />} />
          </Route>

        </Routes>
    {/* </Router> */}
    </>
   
      
  );
};

export default App;
