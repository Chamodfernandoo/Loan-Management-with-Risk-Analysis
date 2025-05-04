import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

interface NotificationBadgeProps {
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { userRole } = useAuth();
  
  const handleClick = () => {
    // Navigate to appropriate notification page based on user role
    if (userRole === 'lender') {
      navigate('/lender/notifications');
    } else if (userRole === 'borrower') {
      navigate('/borrower/notifications');
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`relative ${className}`}
      onClick={handleClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};