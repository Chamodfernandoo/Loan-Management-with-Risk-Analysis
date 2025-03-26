import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom'

const Welcomepage = () => {
  return (
    <div className="min-h-screen flex flex-col">
    {/* Header */}
    <header className="p-6 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="m2 17 10 5 10-5"/>
          <path d="m2 12 10 5 10-5"/>
        </svg>
        <span className="text-2xl font-bold text-indigo-800">PAY ME</span>
      </div>
    </header>

    {/* Main Content */}
    <main className="flex-grow flex-col flex xl:flex-row items-center justify-center px-4 gap-10">
        <div>
            <img src="/src/assets/loan.png.png" alt="hero" className="w-auto rounded-xl" />
        </div>
      <div className="max-w-4xl text-center">
        <h1 className="xl:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
        Smart Loan Management <br /> 
          <span className="text-blue-600">With Risk Prediction</span>
        </h1>
        <p className="xl:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Streamline your lending process with our AI-powered platform. 
        Transparent, secure, and efficient for both lenders and borrowers.
        </p>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
        <Link to="/login" >
          <Button 
            size="lg" 
            className="group bg-blue-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out"
          >
            <LogIn className="mr-2 group-hover:translate-x-1 transition-transform" />
            Login
          </Button>
          </Link>
          <Link to="/regiter">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-indigo-600 text-blue-800 hover:bg-indigo-50 group"
          >
            <UserPlus className="mr-2 group-hover:rotate-6 transition-transform" />
            Register Now
          </Button>
          </Link>
        </div>
      </div>
    </main>

    {/* Footer */}
    <footer className="p-6 text-center text-gray-500">
      © 2024 YourProject. All rights reserved.
    </footer>
  </div>
  )
}

export default Welcomepage
