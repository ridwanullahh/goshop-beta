
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/ProductGrid';
import { useCommerce } from '@/context/CommerceContext';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
  const { currentUser, products, addToCart } = useCommerce();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`wishlist_${currentUser.id || currentUser.uid}`);
      if (saved) {
        const wishlistProductIds = JSON.parse(saved);
        const items = products.filter(p => wishlistProductIds.includes(p.id));
        setWishlistItems(items);
      }
    }
  }, [currentUser, products]);

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
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your wishlist and save your favorite items.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <Link to="/login">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="w-full">
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
            <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <h1 className="text-3xl font-bold">My Wishlist</h1>
                  <p className="text-muted-foreground">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              
              {wishlistItems.length > 0 && (
                <Button onClick={addAllToCart} size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
              )}
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground opacity-30" />
              <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Save items you love by clicking the heart icon. We'll keep them safe here for you.
              </p>
              <Link to="/products">
                <Button size="lg">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <ProductGrid products={wishlistItems} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
