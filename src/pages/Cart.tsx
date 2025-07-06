import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCommerce } from '@/context/CommerceContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';

const Cart = () => {
  const { cart, products, removeFromCart, currentUser, updateCartQuantity } = useCommerce();
  const navigate = useNavigate();

  // Get cart items with product details
  const cartItems = cart?.items?.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean) || [];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      await updateCartQuantity(productId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your cart and continue shopping.
              </p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full" variant="commerce">
                    Sign In
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
              </p>
              <Link to="/products">
                <Button variant="commerce">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Shopping Cart ({cartItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product.images?.[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.product.description}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {item.product.category}
                        </Badge>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-lg">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {shipping > 0 && (
                    <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                      💡 Add ${(50 - subtotal).toFixed(2)} more to get free shipping!
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg" 
                    variant="commerce"
                    onClick={handleProceedToCheckout}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Secure checkout with 256-bit SSL encryption
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-xs text-center">
                    <div>
                      <div className="font-semibold">Free Returns</div>
                      <div className="text-muted-foreground">30 days</div>
                    </div>
                    <div>
                      <div className="font-semibold">Fast Shipping</div>
                      <div className="text-muted-foreground">1-2 days</div>
                    </div>
                    <div>
                      <div className="font-semibold">Secure Payment</div>
                      <div className="text-muted-foreground">SSL Protected</div>
                    </div>
                    <div>
                      <div className="font-semibold">24/7 Support</div>
                      <div className="text-muted-foreground">Always here</div>
                    </div>
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
};

export default Cart;
