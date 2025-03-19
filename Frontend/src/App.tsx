import React from "react";
import { Routes, Route, } from "react-router-dom";
import Lender_dashbord from "./pages/Lender/lender_dashbord";
import Customer_dashbord from "./pages/Customer/customer_dashbord";
import Agreement from "./pages/Agreement";
import Phoneno from "./pages/registration/phonenumber/phoneno";
import { InputOTPForm } from "./pages/registration/phonenumber/otp";
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


const App: React.FC = () => {
  return (
    <>
     {/* // <Router> */}

     <Routes>
        <Route path="/register1" element={<Phoneno />} />
        <Route path="/register2" element={<InputOTPForm />} />
        <Route path="/register3" element={<Personalinfo />} />
        <Route path="/register4" element={<Addressinfo />} />
        <Route path="/register5" element={<Doctype />} />
        <Route path="/register6" element={<Uploadtype />} />
        <Route path="/terms" element={<Termsconditions />} />
      </Routes>

      {/* lender routes */}
      <Routes>
        <Route path="/" element={<Lender_dashbord/>} />
         <Route path="/view_loan" element={<LoanHistoryPage />} />
          <Route path="/agreement" element={<Agreement />} />
          <Route path="/customer-history" element={<CustomerLoanHistoryPage/>} />
         <Route path="/create_loan" element={<Create_loan />} />
        <Route path="/invoice" element={<InvoiceView />} />
        <Route path="/lender/profile" element={<LenderProfilePage />} />
        
        {/* Ads routes */}
        <Route path="/lender/ads" element={<AdsLayout />}>
          <Route index element={<AllAdsPage />} />
          <Route path="all-ads" element={<AllAdsPage />} />
          <Route path="create" element={<CreateAdPage />} />
          <Route path=":id" element={<AdDetailPage />} />
        </Route>

      </Routes>

    {/* customer routes */}
      <Routes>
         <Route path="/customer" element={<Customer_dashbord />} />
          <Route path="/customer/loans" element={<MyLoanHistoryPage />} />
          <Route path="/invoice1" element={<MyInvoiceView />} />
          <Route path="/borrower/profile" element={<BorrowerProfilePage />} />
          <Route path="/borrower/loan-summary" element={<BorrowerLoanSummaryPage />} />
        <Route path="/borrower/loans/:loanId" element={<IndividualLoanPage />} />
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
