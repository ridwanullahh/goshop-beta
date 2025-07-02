
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommerce } from '@/context/CommerceContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Wallet, 
  Users, 
  Shield, 
  Clock,
  Truck,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react';

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  available: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, currentUser, products } = useCommerce();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria'
  });
  const [crowdCheckout, setCrowdCheckout] = useState({
    enabled: false,
    targetAmount: 0,
    message: '',
    shareableLink: ''
  });

  const isGuestCheckout = !currentUser;
  const isCrowdCheckout = searchParams.get('crowd') === 'true';

  const paymentOptions: PaymentOption[] = [
    {
      id: 'paystack',
      name: 'Pay Now',
      description: 'Pay with card, bank transfer, or USSD',
      icon: CreditCard,
      available: true
    },
    {
      id: 'wallet',
      name: 'Pay with Wallet',
      description: 'Use your platform wallet balance',
      icon: Wallet,
      available: currentUser && currentUser.walletBalance > 0
    },
    {
      id: 'escrow',
      name: 'Escrow Payment',
      description: 'Secure payment held until delivery',
      icon: Shield,
      available: true
    },
    {
      id: 'bnpl',
      name: 'Buy Now, Pay Later',
      description: 'Split payment into installments',
      icon: Clock,
      available: currentUser && !isGuestCheckout
    },
    {
      id: 'pod',
      name: 'Pay on Delivery',
      description: 'Pay when your order arrives',
      icon: Truck,
      available: true
    },
    {
      id: 'crowd',
      name: 'Crowd Checkout',
      description: 'Let others contribute to your purchase',
      icon: Users,
      available: currentUser && !isGuestCheckout
    }
  ];

  // Calculate order totals
  const cartItems = cart?.items?.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean) || [];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (crowdCheckout.enabled && currentUser) {
      const shareableLink = `${window.location.origin}/checkout?crowd=true&id=${currentUser.id}&token=secure_token_here`;
      setCrowdCheckout(prev => ({ ...prev, shareableLink }));
    }
  }, [crowdCheckout.enabled, currentUser]);

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const enableCrowdCheckout = () => {
    setCrowdCheckout(prev => ({ 
      ...prev, 
      enabled: true, 
      targetAmount: total 
    }));
    setPaymentMethod('crowd');
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(crowdCheckout.shareableLink);
    toast({
      title: "Link Copied!",
      description: "Share this link with friends to let them contribute"
    });
  };

  const processPayment = async () => {
    if (!shippingInfo.firstName || !shippingInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping details",
        variant: "destructive"
      });
      return;
    }

    try {
      // Process payment based on selected method
      switch (paymentMethod) {
        case 'paystack':
          // Initialize Paystack payment
          toast({
            title: "Redirecting to Payment",
            description: "You will be redirected to complete your payment"
          });
          break;
          
        case 'escrow':
          toast({
            title: "Escrow Payment Initiated",
            description: "Your payment will be held securely until delivery"
          });
          break;
          
        case 'wallet':
          toast({
            title: "Payment Successful",
            description: "Payment completed using wallet balance"
          });
          break;
          
        case 'crowd':
          toast({
            title: "Crowd Checkout Created",
            description: "Share your link to let others contribute"
          });
          break;
          
        default:
          toast({
            title: "Payment Processing",
            description: "Your order is being processed"
          });
      }
      
      // Navigate to success page
      setTimeout(() => {
        navigate('/checkout-success');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some products to your cart before checkout
              </p>
              <Button onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest/User Info */}
              {isGuestCheckout && (
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Checkout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have an account? <button className="text-primary hover:underline">Sign in</button> for faster checkout
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                    <TabsList className="grid grid-cols-2 lg:grid-cols-3 mb-6">
                      {paymentOptions.filter(option => option.available).map(option => {
                        const Icon = option.icon;
                        return (
                          <TabsTrigger key={option.id} value={option.id} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{option.name}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {paymentOptions.map(option => (
                      <TabsContent key={option.id} value={option.id}>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {React.createElement(option.icon, { className: "h-5 w-5" })}
                            <div>
                              <h3 className="font-medium">{option.name}</h3>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                          
                          {option.id === 'crowd' && crowdCheckout.enabled && (
                            <div className="bg-muted p-4 rounded-lg space-y-4">
                              <div>
                                <Label htmlFor="crowdMessage">Message for Contributors</Label>
                                <Input
                                  id="crowdMessage"
                                  value={crowdCheckout.message}
                                  onChange={(e) => setCrowdCheckout(prev => ({ ...prev, message: e.target.value }))}
                                  placeholder="Help me get this amazing product!"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Input
                                  value={crowdCheckout.shareableLink}
                                  readOnly
                                  className="font-mono text-sm"
                                />
                                <Button onClick={copyShareableLink} size="icon">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => {}} size="icon">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Crowd Checkout Option */}
              {currentUser && !isGuestCheckout && !crowdCheckout.enabled && (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Try Crowd Checkout</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Let friends and family contribute to your purchase
                    </p>
                    <Button onClick={enableCrowdCheckout} variant="outline">
                      Enable Crowd Checkout
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <img
                          src={item.product.images[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ${item.product.price}
                          </p>
                        </div>
                        <span className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <Badge variant="secondary">FREE</Badge>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Payment Button */}
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={processPayment}
                    variant="commerce"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {paymentMethod === 'crowd' && crowdCheckout.enabled 
                      ? 'Create Crowd Checkout' 
                      : `Pay $${total.toFixed(2)}`
                    }
                  </Button>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    🔒 Secure checkout with SSL encryption
                  </div>
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
