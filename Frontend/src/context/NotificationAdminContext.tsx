import React, { createContext, useContext, useState } from 'react';

// Define the context type
interface NotificationAdminContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => void;
}

// Create the context
const NotificationAdminContext = createContext<NotificationAdminContextType | undefined>(undefined);

// Provider component
export const NotificationAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock function for admin - doesn't make actual API calls
  const fetchUnreadCount = () => {
    console.log("Mock notification count fetch for admin");
    // No actual API call needed for admin
  };

  return (
    <NotificationAdminContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </NotificationAdminContext.Provider>
  );
};

// Hook for using the context
export const useNotificationAdmin = () => {
  const context = useContext(NotificationAdminContext);
  if (context === undefined) {
    throw new Error('useNotificationAdmin must be used within a NotificationAdminProvider');
  }
  return context;
};