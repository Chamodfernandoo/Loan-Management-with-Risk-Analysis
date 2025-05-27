import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();
  
  // Fetch unread count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
      
      // Set up polling interval (every 3 minutes to reduce server load)
      const interval = setInterval(refreshUnreadCount, 180000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);
  
  const refreshUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Don't update the count on error
    }
  };
  
  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};