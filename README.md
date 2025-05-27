# Loan Management Application  

A modern loan management system built with React, TypeScript, and Tailwind CSS. This application simplifies lending processes for both customers and loan providers, enhancing transparency, efficiency, and trust.  

## Features  

### For Customers:  
- View payment statuses: paid, partially paid, and pending.  
- Receive notifications for payment deadlines and confirmations.  
- Make secure online payments and generate PDF receipts.  
- Search for loan providers with advanced filtering options.  
- Update profile information and access terms and conditions.  

### For Loan Providers:  
- Add or update payment records with customer QR verification.  
- Analyze customer risk profiles using machine learning.  
- Track customer payments and collect payments online or manually.  
- Post advertisements and gain insights into transaction history.  
- Earn additional interest for late payments.  

## Tech Stack  
- **Frontend**: React, TypeScript, Tailwind CSS  
- **State Management**: React Context API or Redux (if used)  
- **Backend**: (To be integrated or describe any backend used)  
- **Tools**: QR Code API, PDF Generation Libraries  

## Getting Started  

### Prerequisites  
- Node.js (v14 or later)  
- npm or yarn  

### Installation  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/Chamodfernandoo/Loan-Management-with-Risk-Analysis.git 
   cd Loan-Management-with-Risk-Analysis

### inside Frontend folder
1. npm install 
2. npm install axios  html5-qrcode
3. npm run dev  


### inside Backend folder
activate virtual environment
- venv\Scripts\activate

install dependancies
- pip install fastapi uvicorn motor pydantic python-jose python-multipart passlib pymongo[srv] python-dotenv email-validator
- pip install cloudinary
- uvicorn app.main:app --reload