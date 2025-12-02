import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommerce } from '@/context/CommerceContext';
import { useEnhancedRealTime } from '@/context/EnhancedRealTimeContext';
import { Order } from '@/lib';
import { toast } from 'sonner';
import { 
  Package, 
  Eye, 
  Download, 
  RefreshCw, 
  Filter, 
  Search,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function MyOrders() {
  const { currentUser, sdk } = useCommerce();
  const { subscribe, forceRefresh } = useEnhancedRealTime();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      loadOrders();
      const unsubscribe = subscribe('orders', () => {
        loadOrders();
      });
      return unsubscribe;
    }
  }, [currentUser]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const loadOrders = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      const userOrders = await sdk.get<Order>('orders');
      const filteredOrders = userOrders.filter((order: Order) => order.userId === currentUser.id);
      filteredOrders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.includes(searchQuery) ||
        order.items.some(item => 
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(order => 
          new Date(order.createdAt) >= filterDate
        );
      }
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to view your orders</p>
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
                <h1 className="text-2xl font-bold">My Orders</h1>
                <p className="text-muted-foreground">Track and manage your orders</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => forceRefresh(['orders'])}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="3months">Past 3 Months</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-6">
              {orders.length === 0 
                ? "You haven't placed any orders yet" 
                : "No orders match your current filters"}
            </p>
            {orders.length === 0 && (
              <Link to="/products">
                <Button>Start Shopping</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-lg">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                          <img 
                            src={item.images?.[0] || '/placeholder.svg'}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {item.name || 'Product'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center bg-muted rounded-lg p-2 min-w-[60px]">
                          <span className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col md:flex-row gap-2">
                    <Link to={`/order/${order.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    
                    {order.status === 'delivered' && (
                      <Button variant="outline" className="md:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                    
                    {['pending', 'processing'].includes(order.status) && (
                      <Button variant="outline" className="md:w-auto">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}