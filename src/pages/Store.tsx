
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductGrid } from '@/components/ProductGrid';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { toast } from 'sonner';
import { 
  Star, 
  MapPin, 
  Users, 
  Package, 
  TrendingUp, 
  Shield, 
  Clock, 
  MessageSquare,
  Heart,
  Share2,
  Store as StoreIcon,
  Calendar,
  Award,
  Truck,
  RefreshCw
} from 'lucide-react';

export default function Store() {
  const { id } = useParams();
  const { sdk, currentUser } = useCommerce();
  const { data: stores } = useRealTimeData('stores');
  const { data: products } = useRealTimeData('products');
  const [store, setStore] = useState<any>(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (stores && id) {
      const foundStore = (stores || []).find((s: any) => 
        (s as any)?.id === id || (s as any)?.slug === id
      );
      setStore(foundStore);
      
      if (foundStore) {
        // Filter products for this store
        const filtered = (products || []).filter((p: any) => 
          (p as any)?.storeId === (foundStore as any)?.id || 
          (p as any)?.sellerId === (foundStore as any)?.ownerId
        );
        setStoreProducts(filtered);
      }
      
      setLoading(false);
    }
  }, [stores, products, id]);

  const handleFollowStore = async () => {
    if (!currentUser) {
      toast.error('Please login to follow stores');
      return;
    }
    
    try {
      setFollowing(!following);
      toast.success(following ? 'Unfollowed store' : 'Following store');
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleContactStore = () => {
    if (!currentUser) {
      toast.error('Please login to contact stores');
      return;
    }
    
    // This would open a message composer or redirect to messaging
    toast.info('Message feature coming soon!');
  };

  const handleShareStore = async () => {
    try {
      await navigator.share({
        title: store?.name,
        text: store?.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Store link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading store...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <StoreIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Store Not Found</h2>
              <p className="text-muted-foreground mb-4">The store you're looking for doesn't exist.</p>
              <Link to="/stores">
                <Button>Browse All Stores</Button>
              </Link>
            </CardContent>
          </Card>
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
          {/* Store Header */}
          <Card className="mb-8">
            <CardContent className="p-0">
              {/* Cover Image */}
              <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={store.avatar || '/placeholder.svg'} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {store.name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{store.name}</h1>
                        {store.verified && (
                          <Badge className="bg-white/20 text-white border-white/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-white/90 mb-3 max-w-2xl">
                        {store.description || 'Welcome to our store!'}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{store.rating || 0}</span>
                          <span className="text-white/70">({store.reviewCount || 0} reviews)</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-white/70">
                          <MapPin className="w-4 h-4" />
                          <span>{store.location || 'Location not specified'}</span>
                        </div>
                        
                        {store.joinedDate && (
                          <div className="flex items-center gap-1 text-white/70">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(store.joinedDate).getFullYear()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 md:self-start">
                      <Button
                        variant={following ? "secondary" : "default"}
                        onClick={handleFollowStore}
                        className="bg-white text-black hover:bg-white/90"
                      >
                        <Heart className={`h-4 w-4 mr-2 ${following ? 'fill-current' : ''}`} />
                        {following ? 'Following' : 'Follow'}
                      </Button>
                      
                      <Button variant="outline" onClick={handleContactStore} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      
                      <Button variant="outline" size="icon" onClick={handleShareStore} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-lg font-bold">{(store.followers || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-lg font-bold">{storeProducts.length}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-lg font-bold">${(store.totalSales || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-lg font-bold">{store.rating || 0}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Store Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              {storeProducts.length > 0 ? (
                <ProductGrid products={storeProducts} />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                    <p className="text-muted-foreground">This store hasn't added any products yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">About {store.name}</h3>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {store.description || 'No description available for this store.'}
                    </p>
                    
                    {store.categories && store.categories.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {store.categories.map((category, index) => (
                            <Badge key={index} variant="outline">{category}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Response Time</div>
                          <div className="text-sm text-muted-foreground">Usually within 24 hours</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Shipping</div>
                          <div className="text-sm text-muted-foreground">Worldwide shipping available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{store.rating || 0}</span>
                      <span className="text-muted-foreground">({store.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-semibold mb-2">No reviews yet</h4>
                    <p className="text-muted-foreground">Be the first to review this store!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Store Policies</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Shipping Policy
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {store.policies?.shipping || 'Standard shipping rates apply. Orders are processed within 1-2 business days.'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Return Policy
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {store.policies?.returns || '30-day return policy. Items must be in original condition.'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Warranty
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {store.policies?.warranty || 'Standard manufacturer warranty applies to all products.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
