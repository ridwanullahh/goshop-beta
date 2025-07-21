import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/ProductGrid';
import { useCommerce } from '@/context/CommerceContext';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';

const Wishlist = () => {
  const { user, wishlistItems, products, addToCart, removeFromWishlist } = useCommerce();

  const getWishlistedProducts = () => {
    return products.filter(p => wishlistItems.some(item => item.productId === p.id));
  };

  const addAllToCart = () => {
    getWishlistedProducts().forEach(item => {
      addToCart(item.id);
    });
  };

  if (!user) {
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

  const wishlistedProducts = getWishlistedProducts();

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
                    {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              
              {wishlistedProducts.length > 0 && (
                <Button onClick={addAllToCart} size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
              )}
            </div>
          </div>

          {wishlistedProducts.length === 0 ? (
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
            <ProductGrid products={wishlistedProducts} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
