
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { 
  ShoppingCart, 
  Heart, 
  Bell, 
  Minus, 
  Plus, 
  Trash2, 
  X,
  Package,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { Product, Notification, WishlistItem } from '@/lib/commerce-sdk';

interface SidebarModalProps {
  children: React.ReactNode;
  type: 'cart' | 'wishlist' | 'notifications';
}

export function SidebarModal({ children, type }: SidebarModalProps) {
  const [open, setOpen] = useState(false);
  const { currentUser, cart, addToCart, removeFromCart, updateCartQuantity } = useCommerce();
  const { data: products } = useRealTimeData<Product>('products');
  const { data: notifications } = useRealTimeData<Notification>('notifications', [], [currentUser?.id]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Load wishlist items from localStorage
  useEffect(() => {
    if (open && currentUser && type === 'wishlist') {
      const saved = localStorage.getItem(`wishlist_${currentUser.uid}`);
      if (saved) {
        const wishlistProductIds = JSON.parse(saved);
        const items = products.filter(p => wishlistProductIds.includes(p.id));
        setWishlistItems(items);
      }
    }
  }, [open, currentUser, products, type]);

  // Calculate cart items with product details
  const cartItems = cart?.items?.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean) || [];

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const removeFromWishlist = (productId: string) => {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`wishlist_${currentUser.uid}`);
    const wishlistProductIds = saved ? JSON.parse(saved) : [];
    const updatedIds = wishlistProductIds.filter((id: string) => id !== productId);
    
    localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(updatedIds));
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'cart': return `Shopping Cart (${cartItems.length})`;
      case 'wishlist': return `Wishlist (${wishlistItems.length})`;
      case 'notifications': return `Notifications (${notifications.filter(n => !n.read).length})`;
      default: return '';
    }
  };

  const renderCartContent = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" onClick={() => setOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 border rounded-lg">
                <Link to={`/product/${item.product.id}`} onClick={() => setOpen(false)}>
                  <img
                    src={item.product.images?.[0] || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/product/${item.product.id}`} onClick={() => setOpen(false)}>
                    <h4 className="font-medium text-sm hover:text-primary">{item.product.name}</h4>
                  </Link>
                  <p className="text-sm text-muted-foreground">${item.product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => updateCartQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {cartItems.length > 0 && (
        <div className="border-t p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Link to="/cart" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">View Cart</Button>
            </Link>
            <Link to="/checkout" onClick={() => setOpen(false)}>
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const renderWishlistContent = () => (
    <ScrollArea className="flex-1">
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Your wishlist is empty</p>
          <Button className="mt-4" onClick={() => setOpen(false)}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {wishlistItems.map((product) => (
            <div key={product.id} className="flex gap-3 p-3 border rounded-lg">
              <Link to={`/product/${product.id}`} onClick={() => setOpen(false)}>
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/product/${product.id}`} onClick={() => setOpen(false)}>
                  <h4 className="font-medium text-sm hover:text-primary">{product.name}</h4>
                </Link>
                <p className="text-sm text-muted-foreground">${product.price}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      addToCart(product.id);
                      removeFromWishlist(product.id);
                    }}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  const renderNotificationsContent = () => (
    <ScrollArea className="flex-1">
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full mt-6">
          {type === 'cart' && renderCartContent()}
          {type === 'wishlist' && renderWishlistContent()}
          {type === 'notifications' && renderNotificationsContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
