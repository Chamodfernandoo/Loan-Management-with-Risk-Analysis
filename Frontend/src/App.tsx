import React from "react";
import { Routes, Route, } from "react-router-dom";
import Lender_dashbord from "./pages/Lender/lender_dashbord";
import Customer_dashbord from "./pages/Customer/customer_dashbord";
import Viwe_loans from "./pages/Lender/viwe_loans";
import Phoneno from "./pages/registration/phonenumber/phoneno";
import { InputOTPForm } from "./pages/registration/phonenumber/otp";
import Personalinfo from "./pages/registration/account/personalinfo";
import Addressinfo from "./pages/registration/account/addressinfo";
import Doctype from "./pages/registration/documents/doctype";
import Uploadtype from "./pages/registration/documents/uploadtype";
import Termsconditions from "./pages/Terms&conditions";

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
         <Route path="/view_loan" element={<Viwe_loans />} />
        {/*<Route path="/contact" element={<Contact />} /> */}
      </Routes>

    {/* customer routes */}
      <Routes>
         <Route path="/lender" element={<Customer_dashbord />} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
        </Routes>
    {/* </Router> */}
    </>
   
      
  );
};

export default App;
