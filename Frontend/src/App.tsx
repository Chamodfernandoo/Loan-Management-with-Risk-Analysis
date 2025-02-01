import React from "react";
import { Routes, Route, } from "react-router-dom";
import Lender_dashbord from "./pages/Lender/lender_dashbord";
import Customer_dashbord from "./pages/Customer/customer_dashbord";
import Viwe_loans from "./pages/Lender/viwe_loans";
import Phoneno from "./pages/registration/phonenumber/phoneno";

const App: React.FC = () => {
  return (
    <>
     {/* // <Router> */}

     <Routes>
        <Route path="/register1" element={<Phoneno />} />
        <Route path="/register2" element={<Phoneno />} />
        <Route path="/register3" element={<Phoneno />} />
        <Route path="/register4" element={<Phoneno />} />
        <Route path="/register5" element={<Phoneno />} />
        <Route path="/register6" element={<Phoneno />} />
        <Route path="/register7" element={<Phoneno />} />
        <Route path="/register8" element={<Phoneno />} />
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
