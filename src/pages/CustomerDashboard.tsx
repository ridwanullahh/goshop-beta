
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommerce } from '@/context/CommerceContext';
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
  Repeat
} from 'lucide-react';

export default function CustomerDashboard() {
  const { currentUser, sdk, orders, wishlistItems } = useCommerce();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (currentUser && sdk) {
      fetchCustomerData();
    }
  }, [currentUser, sdk]);

  const fetchCustomerData = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      const [
        ordersData,
        productsData,
        notificationsData
      ] = await Promise.all([
        sdk.getOrders(currentUser.id, 'buyer'),
        sdk.getProducts({ featured: true }),
        sdk.getNotifications(currentUser.id)
      ]);

      setCustomerOrders(ordersData);
      setRecentProducts(productsData.slice(0, 8));
      setNotifications(notificationsData);

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
        wishlistCount: wishlistItems?.length || 0
      });

    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
    { id: 'recommendations', label: 'For You', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell }
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
                  <div className="text-2xl font-bold">{analytics?.wishlistCount || 0}</div>
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
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.products.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
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
                          <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.products.length} item(s)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.products.slice(0, 2).map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <Package className="h-4 w-4" />
                            </div>
                            <span>{item.productName}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.products.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.products.length - 2} more items
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

        {/* Recommendations Section */}
        {activeSection === 'recommendations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Recommended For You</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>Products you might like based on your interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentProducts.map((product: any) => (
                    <Link key={product.id} to={`/product/${product.id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <img 
                            src={product.images[0] || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{product.rating}</span>
                            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                          </div>
                          <p className="font-bold text-primary">${product.price}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
