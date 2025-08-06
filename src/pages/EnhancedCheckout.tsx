import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  CreditCard,
  Truck,
  MapPin,
  Package,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function EnhancedCheckout() {
  const { sdk, currentUser, cart, clearCart } = useCommerce();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [platformCommission, setPlatformCommission] = useState(5);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryOptions, setDeliveryOptions] = useState<{ [key: string]: 'pickup' | 'shipping' }>({});

  useEffect(() => {
    calculateOrderSummary();
  }, [cart, deliveryOptions]);

  const calculateOrderSummary = async () => {
    if (!sdk || !cart || cart.length === 0) return;

    try {
      // Get platform commission rate
      const globalCommission = await sdk.getGlobalCommission();
      setPlatformCommission(globalCommission);

      let subtotal = 0;
      let totalShipping = 0;
      let totalPlatformCommission = 0;
      let totalAffiliateCommission = 0;
      const itemsWithCalculations = [];

      for (const item of cart) {
        const product = await sdk.getProduct(item.productId);
        if (!product) continue;

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        // Calculate platform commission
        const categoryCommission = await sdk.getCategoryCommission(product.category);
        const itemPlatformCommission = (itemTotal * categoryCommission) / 100;
        totalPlatformCommission += itemPlatformCommission;

        // Calculate affiliate commission if applicable
        let itemAffiliateCommission = 0;
        const affiliateId = getAffiliateIdFromUrl(); // Check if came through affiliate link
        if (affiliateId && product.affiliateEnabled) {
          itemAffiliateCommission = (itemTotal * (product.affiliateCommission || 0)) / 100;
          totalAffiliateCommission += itemAffiliateCommission;
        }

        // Calculate shipping
        let itemShipping = 0;
        const deliveryMethod = deliveryOptions[item.productId] || 'pickup';
        if (deliveryMethod === 'shipping' && product.shippingEnabled) {
          itemShipping = (product.shippingCost || 0) * item.quantity;
          totalShipping += itemShipping;
        }

        itemsWithCalculations.push({
          ...item,
          product,
          itemTotal,
          platformCommission: itemPlatformCommission,
          affiliateCommission: itemAffiliateCommission,
          shipping: itemShipping,
          deliveryMethod
        });
      }

      const total = subtotal + totalShipping;
      const paidAtCheckout = totalPlatformCommission + totalAffiliateCommission + totalShipping;
      const remainingAmount = total - paidAtCheckout;

      setOrderSummary({
        items: itemsWithCalculations,
        subtotal,
        totalShipping,
        totalPlatformCommission,
        totalAffiliateCommission,
        total,
        paidAtCheckout,
        remainingAmount
      });
    } catch (error) {
      console.error('Error calculating order summary:', error);
    }
  };

  const getAffiliateIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  };

  const handleDeliveryMethodChange = (productId: string, method: 'pickup' | 'shipping') => {
    setDeliveryOptions(prev => ({
      ...prev,
      [productId]: method
    }));
  };

  const handlePlaceOrder = async () => {
    if (!sdk || !currentUser || !orderSummary) return;

    setIsLoading(true);
    try {
      const orderData = {
        userId: currentUser.id,
        items: orderSummary.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name,
          images: item.product.images,
          sellerId: item.product.sellerId,
          storeId: item.product.storeId,
          variantId: item.variantId,
          shippingCost: item.shipping,
          deliveryMethod: item.deliveryMethod,
          platformCommission: item.platformCommission,
          affiliateCommission: item.affiliateCommission,
          affiliateId: getAffiliateIdFromUrl(),
          status: 'pending'
        })),
        subtotal: orderSummary.subtotal,
        platformCommission: orderSummary.totalPlatformCommission,
        affiliateCommission: orderSummary.totalAffiliateCommission,
        shippingTotal: orderSummary.totalShipping,
        total: orderSummary.total,
        paidAmount: orderSummary.paidAtCheckout,
        remainingAmount: orderSummary.remainingAmount,
        status: 'pending',
        paymentStatus: 'partial',
        paymentMethod,
        shippingAddress,
        billingAddress: shippingAddress,
        deliveryMethod: 'mixed', // Since we can have mixed delivery methods
        affiliateId: getAffiliateIdFromUrl()
      };

      const order = await sdk.createOrder(orderData);

      // Process payment for the partial amount (commissions + shipping)
      // In a real implementation, you would integrate with a payment processor here
      
      // Clear cart after successful order
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `You paid $${orderSummary.paidAtCheckout.toFixed(2)} now. You'll pay the remaining $${orderSummary.remainingAmount.toFixed(2)} upon delivery.`
      });

      // Redirect to order confirmation
      window.location.href = `/orders/${order.id}`;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some products to continue</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item) => {
                    const product = orderSummary?.items.find((i: any) => i.productId === item.productId)?.product;
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`delivery-${item.productId}`}
                              value="pickup"
                              checked={deliveryOptions[item.productId] !== 'shipping'}
                              onChange={() => handleDeliveryMethodChange(item.productId, 'pickup')}
                            />
                            <span className="text-sm">Pickup (Free)</span>
                          </label>
                          
                          {product.shippingEnabled && (
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`delivery-${item.productId}`}
                                value="shipping"
                                checked={deliveryOptions[item.productId] === 'shipping'}
                                onChange={() => handleDeliveryMethodChange(item.productId, 'shipping')}
                              />
                              <span className="text-sm">
                                Shipping (+${(product.shippingCost || 0).toFixed(2)})
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderSummary && (
                    <>
                      {/* Items */}
                      <div className="space-y-3">
                        {orderSummary.items.map((item: any) => (
                          <div key={item.productId} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.product.price}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.deliveryMethod === 'shipping' ? 'Shipping' : 'Pickup'}
                                </Badge>
                                {item.affiliateCommission > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    Affiliate Sale
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="font-medium">${item.itemTotal.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Calculations */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${orderSummary.subtotal.toFixed(2)}</span>
                        </div>
                        
                        {orderSummary.totalShipping > 0 && (
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>${orderSummary.totalShipping.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>${orderSummary.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Breakdown */}
                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Payment Breakdown
                        </h4>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Pay now (Service fees + Shipping)</span>
                            <span className="font-medium">${orderSummary.paidAtCheckout.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Pay on delivery</span>
                            <span>${orderSummary.remainingAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          You'll complete the remaining payment when your items are delivered
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={isLoading || !shippingAddress.fullName}
                      >
                        {isLoading ? 'Processing...' : `Pay $${orderSummary.paidAtCheckout.toFixed(2)} Now`}
                      </Button>

                      <div className="text-xs text-center text-muted-foreground">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Secure checkout powered by industry-standard encryption
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
