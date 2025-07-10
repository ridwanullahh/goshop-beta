import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommerce } from '@/context/CommerceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Calendar,
  Eye,
  Heart,
  Star
} from 'lucide-react';

export default function SellerAnalytics() {
  const { sdk, currentUser } = useCommerce();
  const [analytics, setAnalytics] = useState<any>({
    revenue: { total: 0, trend: 0 },
    orders: { total: 0, trend: 0 },
    products: { total: 0, trend: 0 },
    customers: { total: 0, trend: 0 },
    topProducts: [],
    recentSales: [],
    trafficSources: []
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [sdk, currentUser, timeRange]);

  const loadAnalytics = async () => {
    if (!sdk || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Get seller's orders
      const orders = await sdk.get('orders');
      const sellerOrders = orders.filter((order: any) => 
        order.items.some((item: any) => item.sellerId === currentUser.id)
      );

      // Get seller's products
      const products = await sdk.get('products');
      const sellerProducts = products.filter((product: any) => product.sellerId === currentUser.id);

      // Calculate analytics
      const now = new Date();
      const rangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                    timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                    90 * 24 * 60 * 60 * 1000;
      const rangeStart = new Date(now.getTime() - rangeMs);

      const recentOrders = sellerOrders.filter((order: any) => 
        new Date(order.createdAt) >= rangeStart
      );

      const totalRevenue = recentOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = recentOrders.length;
      const uniqueCustomers = new Set(recentOrders.map((order: any) => order.userId)).size;

      // Calculate trends (mock data for now)
      const revenueTrend = Math.random() * 20 - 10; // -10% to +10%
      const ordersTrend = Math.random() * 15 - 7.5;
      const productsTrend = Math.random() * 10 - 5;
      const customersTrend = Math.random() * 25 - 12.5;

      // Top products
      const productSales = recentOrders.reduce((acc: any, order: any) => {
        order.items.forEach((item: any) => {
          if (item.sellerId === currentUser.id) {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
          }
        });
        return acc;
      }, {});

      const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([productId, quantity]) => {
          const product = sellerProducts.find((p: any) => p.id === productId);
          return { product, quantity };
        });

      setAnalytics({
        revenue: { total: totalRevenue, trend: revenueTrend },
        orders: { total: totalOrders, trend: ordersTrend },
        products: { total: sellerProducts.length, trend: productsTrend },
        customers: { total: uniqueCustomers, trend: customersTrend },
        topProducts,
        recentSales: recentOrders.slice(0, 10),
        trafficSources: [
          { source: 'Direct', visits: Math.floor(Math.random() * 1000) + 500 },
          { source: 'Search', visits: Math.floor(Math.random() * 800) + 300 },
          { source: 'Social', visits: Math.floor(Math.random() * 600) + 200 },
          { source: 'Referral', visits: Math.floor(Math.random() * 400) + 100 }
        ]
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-muted h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.total)}</div>
            {formatTrend(analytics.revenue.trend)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.orders.total}</div>
            {formatTrend(analytics.orders.trend)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.products.total}</div>
            {formatTrend(analytics.products.trend)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.customers.total}</div>
            {formatTrend(analytics.customers.trend)}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Your best performing products this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((item: any, index: number) => (
                  <div key={item.product?.id || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.product?.price || 0)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{item.quantity} sold</Badge>
                  </div>
                ))}
                {analytics.topProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No sales data available for this period
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentSales.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {analytics.recentSales.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent sales to display
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trafficSources.map((source: any) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5" />
                      </div>
                      <p className="font-medium">{source.source}</p>
                    </div>
                    <Badge variant="outline">{source.visits} visits</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}