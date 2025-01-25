import React from "react";
import { Routes, Route, } from "react-router-dom";
import Lender_dashbord from "./pages/Lender/lender_dashbord";
import Customer_dashbord from "./pages/Customer/customer_dashbord";

const App: React.FC = () => {
  return (
    <>
     {/* // <Router> */}
      {/* lender routes */}
      <Routes>
        <Route path="/" element={<Lender_dashbord/>} />
        {/* <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> */}
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
