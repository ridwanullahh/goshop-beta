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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const { currency } = useCommerce();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  const formattedShippingCost = (cost: number) => formatPrice(cost);
  const formattedItemTotal = (total: number) => formatPrice(total);
  const formattedSubtotal = formatPrice(orderSummary?.subtotal || 0);
  const formattedTotalShipping = formatPrice(orderSummary?.totalShipping || 0);
  const formattedTotal = formatPrice(orderSummary?.total || 0);
  const formattedPaidAtCheckout = formatPrice(orderSummary?.paidAtCheckout || 0);
  const formattedRemainingAmount = formatPrice(orderSummary?.remainingAmount || 0);

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
            <h1 className="text-2xl font-bold mb-2">{t('your_cart_is_empty')}</h1>
            <p className="text-muted-foreground">{t('add_products_to_continue')}</p>
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
          <h1 className="text-2xl font-bold mb-8">{t('checkout')}</h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t('delivery_options')}
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
                            <p className="text-sm text-muted-foreground">{t('qty')}: {item.quantity}</p>
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
                            <span className="text-sm">{t('pickup_free')}</span>
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
                                {t('shipping_cost', { cost: formattedShippingCost(product.shippingCost || 0) })}
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
                    {t('shipping_address')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">{t('full_name')}</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">{t('address')}</Label>
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
                      <Label htmlFor="city">{t('city')}</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">{t('state')}</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">{t('zip_code')}</Label>
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
                    {t('payment_method')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_payment_method')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">{t('credit_debit_card')}</SelectItem>
                      <SelectItem value="paypal">{t('paypal')}</SelectItem>
                      <SelectItem value="bank">{t('bank_transfer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{t('order_summary')}</CardTitle>
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
                                {t('qty')}: {item.quantity} × {formattedItemTotal(item.product.price)}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.deliveryMethod === 'shipping' ? t('shipping_delivery') : t('pickup')}
                                </Badge>
                                {item.affiliateCommission > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {t('affiliate_sale')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="font-medium">{formattedItemTotal(item.itemTotal)}</p>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Calculations */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t('subtotal')}</span>
                          <span>{formattedSubtotal}</span>
                        </div>
                        
                        {orderSummary.totalShipping > 0 && (
                          <div className="flex justify-between">
                            <span>{t('shipping')}</span>
                            <span>{formattedTotalShipping}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-semibold">
                          <span>{t('total')}</span>
                          <span>{formattedTotal}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Breakdown */}
                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          {t('payment_breakdown')}
                        </h4>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>{t('pay_now')}</span>
                            <span className="font-medium">{formattedPaidAtCheckout}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>{t('pay_on_delivery')}</span>
                            <span>{formattedRemainingAmount}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {t('remaining_payment_desc')}
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={isLoading || !shippingAddress.fullName}
                      >
                        {isLoading ? t('processing') : t('pay_now_button', { amount: formattedPaidAtCheckout })}
                      </Button>

                      <div className="text-xs text-center text-muted-foreground">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        {t('secure_checkout_footer')}
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
