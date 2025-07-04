
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  User,
  Bell,
  TrendingUp,
  Eye,
  MessageSquare,
  Search,
  Zap,
  Award,
  Calendar,
  DollarSign,
  ArrowRight,
  Plus,
  Sparkles
} from 'lucide-react';

export default function EnhancedCustomerDashboard() {
  const { currentUser, sdk, cart } = useCommerce();
  const { subscribe, forceRefresh } = useRealTime();
  const [activeView, setActiveView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser && sdk) {
      initializeDashboard();
    }
  }, [currentUser, sdk]);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      // Subscribe to real-time updates
      const unsubscribeOrders = subscribe('orders', (data) => {
        console.log('Orders updated:', data);
        fetchCustomerData();
      });

      const unsubscribeProducts = subscribe('products', (data) => {
        console.log('Products updated:', data);
        setRecentProducts(data.slice(0, 8));
      });

      await fetchCustomerData();
      await forceRefresh(['orders', 'products']);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    if (!currentUser || !sdk) return;
    
    try {
      const [ordersData, productsData, notificationsData] = await Promise.all([
        sdk.getOrders(currentUser.id),
        sdk.getProducts({ featured: true }),
        sdk.getNotifications(currentUser.id)
      ]);

      // Calculate analytics
      const totalSpent = ordersData.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = ordersData.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const completedOrders = ordersData.filter((order: any) => order.status === 'delivered').length;

      setCustomerData({
        orders: ordersData,
        totalSpent,
        totalOrders,
        averageOrderValue,
        completedOrders,
        pendingOrders: ordersData.filter((order: any) => ['pending', 'processing', 'shipped'].includes(order.status)).length,
        loyaltyPoints: Math.floor(totalSpent / 10), // 1 point per $10 spent
        wishlistCount: 0 // Will be updated from wishlist data
      });

      setRecentProducts(productsData.slice(0, 8));
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

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
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">Hi, {currentUser?.name?.split(' ')[0] || 'Customer'}👋</h1>
                <p className="text-sm text-muted-foreground">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Spent</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    ${customerData?.totalSpent?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Orders</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">
                    {customerData?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Points</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {customerData?.loyaltyPoints || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Wishlist</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {customerData?.wishlistCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/products" className="block">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-primary/5">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Shop Now</span>
                </Button>
              </Link>
              
              <Link to="/orders" className="block">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-blue-50">
                  <Truck className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">Track Orders</span>
                </Button>
              </Link>
              
              <Link to="/wishlist" className="block">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-pink-50">
                  <Heart className="h-6 w-6 text-pink-500" />
                  <span className="text-sm font-medium">Wishlist</span>
                </Button>
              </Link>
              
              <Link to="/support" className="block">
                <Button variant="outline" className="w-full h-20 flex-col space-y-2 hover:bg-green-50">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">Support</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Recommended For You</span>
              </div>
              <Link to="/products">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-4">
                {recentProducts.map((product: any) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="flex-shrink-0">
                    <Card className="w-40 hover:shadow-lg transition-shadow">
                      <CardContent className="p-3">
                        <img 
                          src={product.images[0] || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-primary">${product.price}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs ml-1">{product.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerData?.orders?.slice(0, 3).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <Button variant="ghost" size="sm" className="mt-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Link to="/products" className="block mt-2">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button size="lg" className="rounded-full shadow-lg">
          <Plus className="h-5 w-5 mr-2" />
          Quick Order
        </Button>
      </div>
    </div>
  );
}
