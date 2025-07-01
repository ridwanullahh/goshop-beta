
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight,
  CreditCard,
  Truck,
  Shield,
  Tag,
  Gift
} from 'lucide-react';

const Cart = () => {
  const { cart, products, removeFromCart, currentUser, sdk } = useCommerce();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (cart && cart.items && products.length > 0) {
      const items = cart.items.map((cartItem: any) => {
        const product = products.find(p => p.id === cartItem.productId);
        return {
          ...cartItem,
          product
        };
      }).filter((item: any) => item.product);
      
      setCartItems(items);
    }
  }, [cart, products]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!sdk || !currentUser) return;
    
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId);
      } else {
        await sdk.updateCartQuantity(currentUser.id, productId, newQuantity);
        // Update local state
        setCartItems(prev => prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update cart quantity",
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const applyPromoCode = () => {
    // Simulate promo code application
    if (promoCode.toLowerCase() === 'welcome10') {
      toast({
        title: "Promo Code Applied!",
        description: "10% discount has been applied to your order."
      });
    } else if (promoCode) {
      toast({
        title: "Invalid Promo Code",
        description: "The promo code you entered is not valid.",
        variant: "destructive"
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleCheckout = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to proceed with checkout.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add some items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to checkout (to be implemented)
    toast({
      title: "Checkout",
      description: "Proceeding to secure checkout..."
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please log in to view your shopping cart
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Looks like you haven't added anything to your cart yet
            </p>
            <Button onClick={() => navigate('/products')} className="w-full">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold line-clamp-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {item.product.sellerName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.inventory}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${item.product.price} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? (
                      <Badge variant="secondary">FREE</Badge>
                    ) : (
                      `$${calculateShipping().toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={applyPromoCode}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Trust Signals */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Secure checkout</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Free shipping over $50</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Gift className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Easy returns within 30 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
