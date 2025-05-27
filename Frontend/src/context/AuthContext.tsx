import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  isLoading: boolean;
  login: (token: string, user?: any) => Promise<void>;
  logout: () => void;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Special case for admin token
        if (token === "admin-mock-token") {
          setIsAuthenticated(true);
          setUserRole("admin");
          setIsLoading(false);
          return;
        }
        
        const user = await authService.getCurrentUser();
        setIsAuthenticated(true);
        setUserRole(user.role);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (token: string, user?: any) => {
    localStorage.setItem('token', token);
    
    // If user object is provided directly (for admin), use it
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      return;
    }
    
    try {
      const userProfile = await authService.getCurrentUser();
      setIsAuthenticated(true);
      setUserRole(userProfile.role);
      return userProfile;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Refresh auth state (useful after navigation)
  const refreshAuthState = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUserRole(null);
      return;
    }

    try {
      // Special case for admin token
      if (token === "admin-mock-token") {
        setIsAuthenticated(true);
        setUserRole("admin");
        return;
      }
      
      const user = await authService.getCurrentUser();
      setIsAuthenticated(true);
      setUserRole(user.role);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        userRole, 
        isLoading, 
        login, 
        logout,
        refreshAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};