
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Search
} from 'lucide-react';

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  const handleTrack = () => {
    // Mock tracking data
    setOrderData({
      orderNumber: trackingNumber,
      status: 'In Transit',
      estimatedDelivery: '2024-01-15',
      trackingSteps: [
        { status: 'Order Placed', date: '2024-01-10', completed: true },
        { status: 'Order Confirmed', date: '2024-01-10', completed: true },
        { status: 'Shipped', date: '2024-01-12', completed: true },
        { status: 'In Transit', date: '2024-01-13', completed: true, active: true },
        { status: 'Out for Delivery', date: '', completed: false },
        { status: 'Delivered', date: '', completed: false }
      ],
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 299.99 }
      ]
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number or tracking ID to see the latest updates
            </p>
          </div>

          {/* Tracking Input */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="tracking">Order Number or Tracking ID</Label>
                  <Input
                    id="tracking"
                    placeholder="Enter your tracking number..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handleTrack} className="mt-6">
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Results */}
          {orderData && (
            <div className="space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Order #{orderData.orderNumber}</span>
                    <Badge variant="secondary">{orderData.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                      <p className="text-2xl font-bold text-primary">
                        {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Delivery Address</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p>123 Main Street</p>
                          <p>Lagos, Nigeria</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.trackingSteps.map((step: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-500 text-white' : 
                          step.active ? 'bg-blue-500 text-white' : 'bg-muted'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : step.active ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${step.active ? 'text-blue-600' : ''}`}>
                            {step.status}
                          </h4>
                          {step.date && (
                            <p className="text-sm text-muted-foreground">
                              {new Date(step.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
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
                  <div className="space-y-3">
                    {orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">${item.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find your order or having delivery issues?
              </p>
              <Button variant="outline">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
