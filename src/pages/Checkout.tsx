import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Building, 
  Shield, 
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';

export default function Checkout() {
  const { cart, currentUser, sdk, updateCartQuantity, clearCart } = useCommerce();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [orderNotes, setOrderNotes] = useState('');
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: ''
  });

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      fee: 0
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Wallet,
      description: 'Pay with your PayPal account',
      fee: 0
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: Smartphone,
      description: 'Touch ID or Face ID',
      fee: 0
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: Smartphone,
      description: 'Pay with Google',
      fee: 0
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building,
      description: 'Direct bank transfer',
      fee: 0
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Shield,
      description: 'Bitcoin, Ethereum, USDC',
      fee: 0
    },
    {
      id: 'crowdfunding',
      name: 'Crowdfunding',
      icon: Plus,
      description: 'Split payment with friends',
      fee: 0
    }
  ];

  const subtotal = cart?.items?.reduce((sum, item) => {
    if (!item?.product?.price || !item?.quantity) return sum;
    return sum + (item.product.price * item.quantity);
  }, 0) || 0;
  
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!shippingInfo.firstName || !shippingInfo.email || !shippingInfo.address) {
      toast.error('Please fill in all required shipping information');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: currentUser?.id || 'guest',
        items: cart.items,
        shippingInfo,
        paymentMethod: selectedPaymentMethod,
        paymentInfo: selectedPaymentMethod === 'card' ? paymentInfo : null,
        subtotal,
        shipping,
        tax,
        total,
        orderNotes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Process payment based on selected method
      let paymentResult;
      switch (selectedPaymentMethod) {
        case 'card':
          paymentResult = await processCardPayment(orderData);
          break;
        case 'paypal':
          paymentResult = await processPayPalPayment(orderData);
          break;
        case 'apple_pay':
          paymentResult = await processApplePayPayment(orderData);
          break;
        case 'google_pay':
          paymentResult = await processGooglePayPayment(orderData);
          break;
        case 'bank_transfer':
          paymentResult = await processBankTransferPayment(orderData);
          break;
        case 'crypto':
          paymentResult = await processCryptoPayment(orderData);
          break;
        case 'crowdfunding':
          paymentResult = await processCrowdfundingPayment(orderData);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      if (paymentResult.success) {
        // Create order in the system
        const order = await sdk.createOrder(orderData);
        
        // Clear cart
        await clearCart();
        
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${order.id}`);
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Payment processing functions (mock implementations)
  const processCardPayment = async (orderData: any) => {
    // Mock card payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, transactionId: 'card_' + Date.now() };
  };

  const processPayPalPayment = async (orderData: any) => {
    // Mock PayPal payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, transactionId: 'pp_' + Date.now() };
  };

  const processApplePayPayment = async (orderData: any) => {
    // Mock Apple Pay processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, transactionId: 'ap_' + Date.now() };
  };

  const processGooglePayPayment = async (orderData: any) => {
    // Mock Google Pay processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, transactionId: 'gp_' + Date.now() };
  };

  const processBankTransferPayment = async (orderData: any) => {
    // Mock bank transfer processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { success: true, transactionId: 'bt_' + Date.now() };
  };

  const processCryptoPayment = async (orderData: any) => {
    // Mock crypto payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    return { success: true, transactionId: 'crypto_' + Date.now() };
  };

  const processCrowdfundingPayment = async (orderData: any) => {
    // Mock crowdfunding payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, transactionId: 'cf_' + Date.now() };
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Shipping Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder="Street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <method.icon className="h-6 w-6" />
                        <div className="flex-1">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Details */}
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Card Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                          placeholder="123"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={paymentInfo.cardName}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'crowdfunding' && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Crowdfunding Split</h3>
                    <p className="text-sm text-muted-foreground">
                      Share this payment with friends and family. They can contribute to your order.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Enter email addresses (comma separated)" />
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special instructions for your order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <img
                        src={item.product?.images?.[0] || '/placeholder.svg'}
                        alt={item.product?.name || 'Product'}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product?.price || 0} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Secure SSL Encryption</span>
                </div>

                {/* Place Order Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
