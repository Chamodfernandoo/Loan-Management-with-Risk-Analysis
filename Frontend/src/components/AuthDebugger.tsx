import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthDebugger: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update token state when component mounts or localStorage changes
    setToken(localStorage.getItem('token'));
    
    // Log navigation events
    console.log(`📍 Navigation to: ${location.pathname}`);
  }, [location]);
  
  // Force clear token and reload
  const clearAuth = () => {
    localStorage.removeItem('token');
    console.log("🧹 Token cleared manually");
    navigate('/login', { replace: true });
  };
  
  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50">
      <div>
        <strong>🔑 Auth:</strong> {token ? '✅ Logged in' : '❌ No token'}
      </div>
      <div>
        <strong>📍 Path:</strong> {location.pathname}
      </div>
      <button 
        onClick={clearAuth}
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        Clear Auth
      </button>
    </div>
  );
};