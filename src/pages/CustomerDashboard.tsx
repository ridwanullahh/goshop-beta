
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTime } from '@/context/RealTimeContext';
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Package,
  Clock,
  MapPin,
  CreditCard,
  Gift,
  Truck,
  BarChart3,
  User,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  Users,
  Repeat,
  Wallet,
  Mail
} from 'lucide-react';

export default function CustomerDashboard() {
  const { currentUser, sdk } = useCommerce();
  const { subscribe } = useRealTime();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (currentUser && sdk) {
      fetchCustomerData();
      
      // Subscribe to real-time updates
      const unsubscribeOrders = subscribe('orders', () => {
        fetchCustomerOrders();
      });
      
      const unsubscribeNotifications = subscribe('notifications', () => {
        fetchNotifications();
      });

      return () => {
        unsubscribeOrders();
        unsubscribeNotifications();
      };
    }
  }, [currentUser, sdk, subscribe]);

  const fetchCustomerData = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchCustomerOrders(),
        fetchWishlist(),
        fetchNotifications(),
        fetchMessages(),
        fetchWallet()
      ]);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    if (!currentUser || !sdk) return;
    try {
      const ordersData = await sdk.getOrders(currentUser.id);
      setCustomerOrders(ordersData);
      
      // Calculate analytics
      const totalSpent = ordersData.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = ordersData.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const completedOrders = ordersData.filter((order: any) => order.status === 'delivered').length;

      setAnalytics({
        totalSpent,
        totalOrders,
        averageOrderValue,
        completedOrders,
        pendingOrders: ordersData.filter((order: any) => ['pending', 'processing', 'shipped'].includes(order.status)).length
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!currentUser || !sdk) return;
    try {
      const wishlistData = await sdk.getWishlist(currentUser.id);
      setWishlistItems(wishlistData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser || !sdk) return;
    try {
      const notificationsData = await sdk.getNotifications(currentUser.id);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentUser || !sdk) return;
    try {
      const messagesData = await sdk.getMessages(currentUser.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchWallet = async () => {
    if (!currentUser || !sdk) return;
    try {
      let walletData = await sdk.getWallet(currentUser.id);
      if (!walletData) {
        walletData = await sdk.createWallet(currentUser.id);
      }
      setWallet(walletData);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.name || 'Customer'}!</p>
        </div>

        {/* Mobile Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(item.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.totalSpent?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Lifetime purchases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">Orders placed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wishlistItems?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Saved products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Available balance</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/orders">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Package className="h-6 w-6 mb-2" />
                      <span className="text-sm">Track Orders</span>
                    </Button>
                  </Link>
                  
                  <Link to="/wishlist">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Heart className="h-6 w-6 mb-2" />
                      <span className="text-sm">Wishlist</span>
                    </Button>
                  </Link>
                  
                  <Link to="/products">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <ShoppingBag className="h-6 w-6 mb-2" />
                      <span className="text-sm">Shop Now</span>
                    </Button>
                  </Link>
                  
                  <Link to="/contact">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      <span className="text-sm">Support</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerOrders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getOrderStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total.toFixed(2)}</p>
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {customerOrders.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Link to="/products">
                        <Button className="mt-2">Start Shopping</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Section */}
        {activeSection === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Orders</h2>
              <Link to="/products">
                <Button>Continue Shopping</Button>
              </Link>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {customerOrders.map((order: any) => (
                    <div key={order.id} className="p-6 border-b last:border-b-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getOrderStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} item(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                        <Button variant="outline" size="sm">
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {customerOrders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                      <Link to="/products">
                        <Button>Browse Products</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wishlist Section */}
        {activeSection === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Wishlist</h2>
            
            {wishlistItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">Save items you love to your wishlist</p>
                  <Link to="/products">
                    <Button>Start Shopping</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Heart className="h-6 w-6" />
                        </div>
                        <p className="font-medium">Wishlist Item</p>
                        <p className="text-sm text-muted-foreground">Added {new Date(item.createdAt).toLocaleDateString()}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wallet Section */}
        {activeSection === 'wallet' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Wallet</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</div>
                  <p className="text-muted-foreground">Available to spend</p>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm">Add Funds</Button>
                    <Button variant="outline" size="sm">Withdraw</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {wallet?.transactions?.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {wallet?.transactions?.slice(0, 5).map((transaction: any) => (
                        <div key={transaction.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`font-semibold ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Notifications</h2>
            
            <Card>
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {notifications.map((notification: any) => (
                      <div key={notification.id} className="p-4 border-b last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages Section */}
        {activeSection === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Messages</h2>
            
            <Card>
              <CardContent className="p-0">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No messages</h3>
                    <p className="text-muted-foreground">Your inbox is empty</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {messages.map((message: any) => (
                      <div key={message.id} className="p-4 border-b last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!message.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="text-2xl">
                      {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Photo</Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="mt-1 p-2 border rounded bg-muted">
                      {currentUser?.name || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="mt-1 p-2 border rounded bg-muted">
                      {currentUser?.email || 'Not set'}
                    </div>
                  </div>
                </div>
                
                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
