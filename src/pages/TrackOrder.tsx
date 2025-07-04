
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Order } from '@/lib/commerce-sdk';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Search,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useCommerce();
  const { data: orders } = useRealTimeData<Order>('orders', [], [currentUser?.id]);
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setLoading(true);
    try {
      const order = orders.find(o => o.id === orderNumber || o.id.includes(orderNumber));
      if (order) {
        setTrackedOrder(order);
        toast.success('Order found!');
      } else {
        toast.error('Order not found. Please check your order number.');
        setTrackedOrder(null);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTrackingSteps = (status: string) => {
    const allSteps = [
      { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
      { key: 'confirmed', label: 'Order Confirmed', description: 'Seller has confirmed your order' },
      { key: 'processing', label: 'Processing', description: 'Your order is being prepared' },
      { key: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
      { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered' }
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number to track your package
            </p>
          </div>

          {/* Order Search */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Order
              </CardTitle>
              <CardDescription>
                Enter your order number or tracking ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter order number (e.g., ORD-123456)"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleTrackOrder} disabled={loading}>
                    {loading ? 'Searching...' : 'Track Order'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {trackedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order #{trackedOrder.id}</CardTitle>
                      <CardDescription>
                        Placed on {new Date(trackedOrder.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(trackedOrder.status)}>
                      {getStatusIcon(trackedOrder.status)}
                      <span className="ml-1 capitalize">{trackedOrder.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">${trackedOrder.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p className="font-semibold">
                          {new Date(trackedOrder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p className="font-semibold">{trackedOrder.items.length} item(s)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Track your order progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getTrackingSteps(trackedOrder.status).map((step, index) => (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          step.completed 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : step.active
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            getStatusIcon(step.key)
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${step.active ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        
                        {step.active && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={item.product?.images?.[0] || '/placeholder.svg'}
                          alt={item.product?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ${item.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              {trackedOrder.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {trackedOrder.shippingAddress.firstName} {trackedOrder.shippingAddress.lastName}
                      </p>
                      <p>{trackedOrder.shippingAddress.address || trackedOrder.shippingAddress.street}</p>
                      <p>
                        {trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state} {trackedOrder.shippingAddress.zipCode || trackedOrder.shippingAddress.zip}
                      </p>
                      {trackedOrder.shippingAddress.phone && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {trackedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Contact us if you have any questions about your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Support
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Call Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Orders for logged-in users */}
          {currentUser && !trackedOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Orders</CardTitle>
                <CardDescription>Click on any order to track it</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setOrderNumber(order.id);
                          setTrackedOrder(order);
                        }}
                      >
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()} • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
