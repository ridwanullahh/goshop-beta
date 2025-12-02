import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommerce } from '@/context/CommerceContext';
import { useEnhancedRealTime } from '@/context/EnhancedRealTimeContext';
import { Notification } from '@/lib';
import { toast } from 'sonner';
import { 
  Bell, 
  ArrowLeft,
  Check,
  CheckCheck,
  Filter,
  Search,
  Trash2,
  Package,
  CreditCard,
  Heart,
  MessageSquare,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

export default function Notifications() {
  const { currentUser, sdk } = useCommerce();
  const { subscribe, forceRefresh } = useEnhancedRealTime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const unsubscribe = subscribe('notifications', () => {
        loadNotifications();
      });
      return unsubscribe;
    }
  }, [currentUser]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, typeFilter, statusFilter]);

  const loadNotifications = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      const notificationsData = await sdk.get<Notification>('notifications');
      const userNotifications = notificationsData.filter((n: Notification) => n.userId === currentUser.id);
      userNotifications.sort((a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => 
        statusFilter === 'read' ? notification.read : !notification.read
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    if (!sdk) return;

    try {
      await sdk.update('notifications', notificationId, { read: true });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    if (!sdk) return;

    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      toast.info('All notifications are already read');
      return;
    }

    try {
      for (const notification of unreadNotifications) {
        await sdk.update('notifications', notification.id, { read: true });
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success(`Marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!sdk) return;

    try {
      await sdk.delete('notifications', notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to view notifications</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/customer-dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Stay updated with your activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => forceRefresh(['notifications'])}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {notifications.some(n => !n.read) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Notifications Found</h3>
            <p className="text-muted-foreground mb-6">
              {notifications.length === 0 
                ? "You don't have any notifications yet" 
                : "No notifications match your current filters"}
            </p>
            {notifications.length === 0 && (
              <Link to="/products">
                <Button>Start Shopping</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 transition-colors ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'shadow-md' : 'opacity-75'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {notifications.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</p>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'success').length}</p>
                  <p className="text-sm text-muted-foreground">Success</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'info').length}</p>
                  <p className="text-sm text-muted-foreground">Info</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}