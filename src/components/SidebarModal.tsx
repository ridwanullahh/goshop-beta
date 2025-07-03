
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCommerce } from '@/context/CommerceContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Bell, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Eye,
  Package,
  X 
} from 'lucide-react';

interface SidebarModalProps {
  type: 'cart' | 'wishlist' | 'notifications';
  trigger: React.ReactNode;
  title: string;
}

export function SidebarModal({ type, trigger, title }: SidebarModalProps) {
  const { 
    cart, 
    cartItems, 
    wishlistItems, 
    notifications, 
    products, 
    removeFromCart, 
    removeFromWishlist,
    currentUser 
  } = useCommerce();

  const renderContent = () => {
    if (!currentUser && type !== 'notifications') {
      return (
        <div className="text-center py-8">
          <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            {type === 'cart' && <ShoppingCart className="h-8 w-8 text-muted-foreground" />}
            {type === 'wishlist' && <Heart className="h-8 w-8 text-muted-foreground" />}
          </div>
          <h3 className="font-semibold mb-2">Sign in required</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Please sign in to view your {type}
          </p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      );
    }

    switch (type) {
      case 'cart':
        return renderCartContent();
      case 'wishlist':
        return renderWishlistContent();
      case 'notifications':
        return renderNotificationsContent();
      default:
        return null;
    }
  };

  const renderCartContent = () => {
    const items = cartItems?.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    }).filter(Boolean) || [];

    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + shipping;

    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-sm">
            Start shopping to add items to your cart
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 p-3 border rounded-lg">
              <img
                src={item.product.images[0] || '/placeholder.svg'}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">
                  {item.product.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  ${item.product.price.toFixed(2)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-6 w-6">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-6 w-6">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.productId)}
                    className="h-6 w-6 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <Badge variant="secondary">FREE</Badge>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" className="w-full">
                View Full Cart
              </Button>
            </Link>
          </div>

          {shipping > 0 && (
            <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
              💡 Add ${(50 - subtotal).toFixed(2)} more for free shipping!
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWishlistContent = () => {
    if (!wishlistItems || wishlistItems.length === 0) {
      return (
        <div className="text-center py-8">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm">
            Save items you love for later
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {wishlistItems.map((item) => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return null;

          return (
            <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                <div className="flex gap-2 mt-2">
                  <Link to={`/product/${product.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNotificationsContent = () => {
    if (!notifications || notifications.length === 0) {
      return (
        <div className="text-center py-8">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground text-sm">
            You're all caught up!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notifications.slice(0, 10).map((notification) => (
          <div key={notification.id} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
