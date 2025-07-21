import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Package, Heart, MessageCircle } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Notification } from '@/lib/commerce-sdk';

interface NotificationsModalProps {
  children: React.ReactNode;
}

export function NotificationsModal({ children }: NotificationsModalProps) {
  const [open, setOpen] = useState(false);
  const { user: currentUser, sdk } = useCommerce();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (open && currentUser) {
      const fetchNotifications = async () => {
        if (!sdk || !currentUser) return;
        const userNotifications = await sdk.getNotifications(currentUser.id);
        setNotifications(userNotifications);
      };
      fetchNotifications();
    }
  }, [open, currentUser, sdk]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'wishlist':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex items-start space-x-4 border-b ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.createdAt)}</p>
                </div>
                {!notification.isRead && (
                  <Button size="icon" variant="ghost" onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No notifications</p>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex justify-end p-4 border-t">
            <Button variant="outline" onClick={markAllAsRead}>Mark all as read</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
