
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { ProductCard } from './ProductCard';

interface WishlistModalProps {
  children: React.ReactNode;
}

export function WishlistModal({ children }: WishlistModalProps) {
  const [open, setOpen] = useState(false);
  const { currentUser, products, addToCart } = useCommerce();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    if (open && currentUser) {
      // Load wishlist items from localStorage for now
      const saved = localStorage.getItem(`wishlist_${currentUser.id || currentUser.uid}`);
      if (saved) {
        const wishlistProductIds = JSON.parse(saved);
        const items = products.filter(p => wishlistProductIds.includes(p.id));
        setWishlistItems(items);
      }
    }
  }, [open, currentUser, products]);

  const removeFromWishlist = (productId: string) => {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`wishlist_${currentUser.id || currentUser.uid}`);
    const wishlistProductIds = saved ? JSON.parse(saved) : [];
    const updatedIds = wishlistProductIds.filter((id: string) => id !== productId);
    
    localStorage.setItem(`wishlist_${currentUser.id || currentUser.uid}`, JSON.stringify(updatedIds));
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const addAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item.id);
    });
    setOpen(false);
  };

  if (!currentUser) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Wishlist
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Please sign in to view your wishlist
            </p>
            <Button onClick={() => setOpen(false)}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              My Wishlist ({wishlistItems.length})
            </div>
            {wishlistItems.length > 0 && (
              <Button onClick={addAllToCart} size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save items you love by clicking the heart icon
              </p>
              <Button onClick={() => setOpen(false)}>
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {wishlistItems.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
