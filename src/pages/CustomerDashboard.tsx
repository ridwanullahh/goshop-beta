
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Edit,
  Save,
  Mail,
  Phone
} from 'lucide-react';

export default function CustomerDashboard() {
  const { currentUser, sdk, orders, wishlistItems, updateUser } = useCommerce();
  const { subscribe, forceRefresh } = useRealTime();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerWishlist, setCustomerWishlist] = useState([]);
  const [customerNotifications, setCustomerNotifications] = useState([]);
  const [customerMessages, setCustomerMessages] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });

  useEffect(() => {
    if (currentUser && sdk) {
      fetchCustomerData();
      
      // Subscribe to real-time updates
      const unsubscribeOrders = subscribe('orders', handleOrdersUpdate);
      const unsubscribeProducts = subscribe('products', handleProductsUpdate);
      const unsubscribeNotifications = subscribe('notifications', handleNotificationsUpdate);
      
      return () => {
        unsubscribeOrders();
        unsubscribeProducts();
        unsubscribeNotifications();
      };
    }
  }, [currentUser, sdk]);

  const handleOrdersUpdate = (data: any) => {
    console.log('Orders updated:', data);
    if (data.refreshed) {
      fetchCustomerData();
    }
  };

  const handleProductsUpdate = (data: any) => {
    console.log('Products updated:', data);
    if (data.refreshed) {
      fetchWishlistData();
    }
  };

  const handleNotificationsUpdate = (data: any) => {
    console.log('Notifications updated:', data);
    if (data.refreshed) {
      fetchNotifications();
    }
  };

  const fetchCustomerData = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      // Fetch customer's orders
      const ordersData = await sdk.getOrders(currentUser.id);
      setCustomerOrders(ordersData);

      // Fetch wishlist
      await fetchWishlistData();

      // Fetch notifications
      await fetchNotifications();

      // Fetch messages
      await fetchMessages();

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
        pendingOrders: ordersData.filter((order: any) => ['pending', 'processing', 'shipped'].includes(order.status)).length,
        wishlistCount: customerWishlist.length
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistData = async () => {
    if (!currentUser || !sdk) return;
    
    try {
      const wishlistData = await sdk.getWishlist(currentUser.id);
      setCustomerWishlist(wishlistData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser || !sdk) return;
    
    try {
      const notificationsData = await sdk.getNotifications(currentUser.id);
      setCustomerNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentUser || !sdk) return;
    
    try {
      const messagesData = await sdk.getMessages(currentUser.id);
      setCustomerMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !sdk) return;
    
    try {
      await updateUser(currentUser.id!, profileData);
      setEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    if (!sdk) return;
    
    try {
      await sdk.markNotificationAsRead(notificationId);
      await fetchNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!currentUser || !sdk) return;
    
    try {
      await sdk.removeFromWishlist(currentUser.id, productId);
      await fetchWishlistData();
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
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
                  <div className="text-2xl font-bold">{customerWishlist?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Saved products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.averageOrderValue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Per order</p>
                </CardContent>
              </Card>
            </div>

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
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.products?.length || 0} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getOrderStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total?.toFixed(2) || '0.00'}</p>
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
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getOrderStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            {order.trackingNumber && (
                              <Badge variant="outline">
                                Tracking: {order.trackingNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${order.total?.toFixed(2) || '0.00'}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.products?.length || 0} item(s)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {(order.products || []).slice(0, 2).map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <Package className="h-4 w-4" />
                            </div>
                            <span>{item.productName}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          </div>
                        ))}
                        {(order.products?.length || 0) > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{(order.products?.length || 0) - 2} more items
                          </p>
                        )}
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
                    <div className="p-12 text-center">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start shopping to see your orders here
                      </p>
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
            
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customerWishlist.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.svg'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold mb-2">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.product?.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">${item.product?.price?.toFixed(2) || '0.00'}</span>
                        <div className="flex space-x-2">
                          <Link to={`/product/${item.productId}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleRemoveFromWishlist(item.productId)}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {customerWishlist.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground mb-4">
                        Add products you love to your wishlist
                      </p>
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

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <Button
                onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
              >
                {editingProfile ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {editingProfile ? 'Save' : 'Edit'}
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>
                      {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{currentUser?.name}</h3>
                    <p className="text-muted-foreground">{currentUser?.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {currentUser?.role || 'Customer'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!editingProfile}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!editingProfile}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!editingProfile}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wallet Section */}
        {activeSection === 'wallet' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Wallet</h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$0.00</div>
                  <p className="text-sm text-muted-foreground">Available for spending</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$0.00</div>
                  <p className="text-sm text-muted-foreground">Processing refunds</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rewards Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">Earned from purchases</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">Your wallet transactions will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Notifications</h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {customerNotifications.map((notification: any) => (
                    <div key={notification.id} className={`p-4 border-b last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {customerNotifications.length === 0 && (
                    <div className="p-12 text-center">
                      <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                      <p className="text-muted-foreground">
                        We'll notify you about important updates here
                      </p>
                    </div>
                  )}
                </div>
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
                <div className="space-y-0">
                  {customerMessages.map((message: any) => (
                    <div key={message.id} className="p-4 border-b last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {message.senderId === currentUser?.id ? 'You' : 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {message.senderId === currentUser?.id ? 'You' : 'Support'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {customerMessages.length === 0 && (
                    <div className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No messages</h3>
                      <p className="text-muted-foreground">
                        Your conversations will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates about your orders</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get shipping updates via SMS</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-muted-foreground">Manage your data and privacy</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
