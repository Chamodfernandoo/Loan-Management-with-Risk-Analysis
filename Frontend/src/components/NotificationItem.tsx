import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    formattedTime?: string;
    read: boolean;
    type: string;
  };
  onRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
        return '💰';
      case 'payment_received':
        return '✅';
      case 'payment_overdue':
        return '⚠️';
      case 'loan_application':
        return '📝';
      case 'loan_approved':
        return '🎉';
      case 'loan_rejected':
        return '❌';
      default:
        return '📣';
    }
  };
  
  return (
    <Card 
      className={`mb-3 cursor-pointer hover:bg-gray-50 ${notification.read ? 'opacity-70' : ''}`}
      onClick={() => onRead(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className="text-2xl mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-medium">{notification.title}</h4>
                {!notification.read && (
                  <Badge className="ml-2 bg-blue-500">New</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">
              {notification.formattedTime || "Unknown time"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};