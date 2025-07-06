
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Search, 
  ArrowLeft,
  Star,
  Share2,
  Filter
} from 'lucide-react';

export default function Wishlist() {
  const navigate = useNavigate();
  const { currentUser, sdk, addToCart } = useCommerce();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [currentUser, navigate]);

  useEffect(() => {
    let filtered = wishlistItems;
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product?.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [wishlistItems, searchQuery]);

  const fetchWishlist = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      const userWishlist = await sdk.getWishlist(currentUser.id);
      
      // Fetch full product details for each wishlist item
      const itemsWithProducts = await Promise.all(
        userWishlist.map(async (item: any) => {
          const product = await sdk.getItem('products', item.productId);
          return { ...item, product };
        })
      );
      
      setWishlistItems(itemsWithProducts.filter((item: any) => item.product));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      await sdk.delete('wishlists', itemId);
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddAllToCart = async () => {
    try {
      for (const item of filteredItems) {
        if (item.product) {
          await addToCart(item.product, 1);
        }
      }
      toast.success(`Added ${filteredItems.length} items to cart`);
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  const handleShareWishlist = async () => {
    try {
      await navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Wishlist link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your wishlist...</p>
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
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/customer-dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground">Save your favorite items for later</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShareWishlist}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {filteredItems.length > 0 && (
                <Button onClick={handleAddAllToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Items */}
          {filteredItems.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in your wishlist
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        <Link to={`/product/${item.product.id}`}>
                          <img
                            src={item.product.images?.[0] || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </Link>
                        
                        {/* Remove Button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {/* Sale Badge */}
                        {item.product.salePrice && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Sale
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary">
                            {item.product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{item.product.rating || 0}</span>
                          <span className="text-xs text-muted-foreground">
                            ({item.product.reviewCount || 0})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-lg text-primary">
                            ${item.product.salePrice || item.product.price}
                          </span>
                          {item.product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${item.product.price}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleAddToCart(item.product)}
                            className="w-full"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                            >
                              <Heart className="h-4 w-4 mr-1 fill-current" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No items found' : 'Your wishlist is empty'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No items match your search for "${searchQuery}"`
                    : 'Save items you love to buy them later'
                  }
                </p>
                {!searchQuery && (
                  <Link to="/products">
                    <Button>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Start Shopping
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
