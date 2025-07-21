import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Wallet, 
  Building, 
  Truck,
  Lock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Order, Product } from '@/lib/commerce-sdk';

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export default function Checkout() {
  const { cart, currentUser, sdk, clearCart, products } = useCommerce();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address?.address || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
    zipCode: currentUser?.address?.zipCode || '',
    country: currentUser?.address?.country || 'US'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  const paymentMethods = [
    { id: 'wallet', name: 'Pay with Wallet', icon: Wallet, description: `Balance: $${(currentUser?.walletBalance || 0).toFixed(2)}` },
    { id: 'paystack', name: 'Paystack', icon: CreditCard, description: 'Pay via Paystack' },
    { id: 'flutterwave', name: 'Flutterwave', icon: CreditCard, description: 'Pay via Flutterwave' },
    { id: 'paypal', name: 'PayPal', icon: Wallet, description: 'Pay with your PayPal account' },
    { id: 'razorpay', name: 'Razorpay', icon: CreditCard, description: 'Pay via Razorpay' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building, description: 'Direct bank deposit' },
    { id: 'cod', name: 'Pay on Delivery', icon: Truck, description: 'Pay cash upon arrival' },
  ];

  useEffect(() => {
    if (cart && products.length > 0) {
      const detailedCartItems = cart.items.map((item: any) => {
        const product = products.find((p: any) => p.id === item.productId);
        return { ...item, product };
      }).filter(item => item.product); // Ensure product is found
      setCartItems(detailedCartItems as CartItemWithProduct[]);
    }
  }, [cart, products]);

  const processPayment = async (order: Order, paymentMethod: string) => {
    // This is a placeholder for server-driven payment processing.
    // In a real implementation, this would call an endpoint like `/api/initiate-payment`
    // which would then interact with the specific payment gateway's API.
    console.log(`Processing ${paymentMethod} for order ${order.id}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (paymentMethod === 'paystack' || paymentMethod === 'flutterwave' || paymentMethod === 'paypal' || paymentMethod === 'razorpay') {
      toast.info(`Redirecting to ${paymentMethod}...`);
      // In a real app, the backend would return a redirect URL.
      // For this simulation, we'll just navigate to a confirmation page.
      return { success: true, requiresRedirect: true, orderId: order.id };
    }
    
    return { success: true };
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!shippingInfo.firstName || !shippingInfo.email || !shippingInfo.address) {
      toast.error('Please fill in all required shipping information.');
      return;
    }

    setLoading(true);
    let createdOrder: Order | null = null;
    try {
      const createOrderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
          shippingInfo,
          paymentMethod: selectedPaymentMethod,
          userId: currentUser?.id,
        }),
      });

      if (!createOrderResponse.ok) {
        const { error } = await createOrderResponse.json();
        throw new Error(error || 'Failed to create order.');
      }

      createdOrder = await createOrderResponse.json();
      const paymentResult = await processPayment(createdOrder!, selectedPaymentMethod);

      if (paymentResult.success) {
        if (paymentResult.requiresRedirect) {
          // The user is being redirected, the webhook will handle the final status update.
          // We can clear the cart now.
          await clearCart();
          navigate(`/order-detail/${paymentResult.orderId}`);
        } else {
          // For direct payments (Wallet, COD, etc.)
          const finalStatus = selectedPaymentMethod === 'cod' ? 'processing' : 'paid';
          await sdk.updateOrderStatus(createdOrder!.id, finalStatus);
          await clearCart();
          toast.success('Order placed successfully!');
          navigate(`/order-detail/${createdOrder!.id}`);
        }
      } else {
        throw new Error('Payment failed. Please try another method.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
      if (createdOrder) {
        await sdk.updateOrderStatus(createdOrder.id, 'payment_failed');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Guard clause to prevent rendering with incomplete data
  if (!cart || products.length === 0 || cart.items.length !== cartItems.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Derived values for UI display
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Secure Checkout</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={shippingInfo.firstName} onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={shippingInfo.lastName} onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={shippingInfo.address} onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={shippingInfo.city} onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={shippingInfo.state} onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input id="zipCode" value={shippingInfo.zipCode} onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <method.icon className="h-6 w-6 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product?.images?.[0] || '/placeholder.svg'}
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-600">Tax (8%)</p>
                    <p className="font-medium">${tax.toFixed(2)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <p>Total</p>
                  <p>${total.toFixed(2)}</p>
                </div>
                <Button
                  className="w-full text-lg py-6"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </Button>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-2">
                  <Lock className="h-4 w-4" />
                  <span>Secure SSL Encrypted Checkout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
