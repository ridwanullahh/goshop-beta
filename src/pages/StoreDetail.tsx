
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Star,
  MapPin,
  Users,
  ShoppingBag,
  Search,
  ArrowLeft,
  Heart,
  Share2,
  Filter,
  BookOpen,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';

export default function StoreDetail() {
  const { storeSlug } = useParams();
  const { sdk } = useCommerce();
  const [store, setStore] = useState<any>(null);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [storeBlogPosts, setStoreBlogPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    async function loadStore() {
      if (!sdk || !storeSlug) return;

      try {
        // Check if storeSlug is actually a direct store slug (baseurl/storeslug)
        let storeData;

        // First try to get store by slug
        storeData = await sdk.getStoreBySlug(storeSlug);

        if (!storeData) {
          // If not found by slug, try by ID for backward compatibility
          storeData = await sdk.getStore(storeSlug);
        }

        if (storeData && storeData.isApproved && storeData.isActive) {
          setStore(storeData);

          // Load store-specific products and blog posts
          const [productsData, blogPostsData] = await Promise.all([
            sdk.getStoreProducts(storeData.sellerId),
            sdk.getStoreBlogPosts(storeData.id)
          ]);

          setStoreProducts(productsData);
          setFilteredProducts(productsData);
          setStoreBlogPosts(blogPostsData);
        } else {
          setStore(null);
          setStoreProducts([]);
          setFilteredProducts([]);
          setStoreBlogPosts([]);
        }
      } catch (error) {
        console.error('Failed to load store:', error);
        setStore(null);
        setStoreProducts([]);
        setFilteredProducts([]);
        setStoreBlogPosts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadStore();
  }, [sdk, storeSlug]);

  useEffect(() => {
    const filtered = storeProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, storeProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-muted h-8 w-1/2 rounded"></div>
                <div className="bg-muted h-20 rounded"></div>
              </div>
              <div className="bg-muted h-64 rounded-lg"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
          <p className="text-muted-foreground">The store you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Button>

        {/* Store Header */}
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
            {store.banner && (
              <img
                src={store.banner}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="absolute -bottom-6 left-6">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={store.logo} alt={store.name} />
              <AvatarFallback className="text-2xl">
                {store.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Store Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{store.name}</h1>
                  {store.isVerified && (
                    <Badge className="bg-primary text-primary-foreground">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  {store.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {store.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-secondary text-secondary" />
                    <span>{store.rating}</span>
                    <span>({store.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {store.description}
            </p>
          </div>

          {/* Store Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Store Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Products</span>
                  </div>
                  <span className="font-medium">{store.productCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Followers</span>
                  </div>
                  <span className="font-medium">2.5K</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-medium">{store.rating}/5</span>
                </div>
                
                {store.established && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Est.</span>
                    <span className="font-medium">{store.established}</span>
                  </div>
                )}
              </div>
              
              <Button className="w-full mt-6">Follow Store</Button>
            </CardContent>
          </Card>
        </div>

        {/* Store Products */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Products ({storeProducts.length})
            </TabsTrigger>
            <TabsTrigger value="blog">
              <BookOpen className="h-4 w-4 mr-2" />
              Blog ({storeBlogPosts.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            {/* Search & Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products in this store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'This store hasn\'t added any products yet'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            {storeBlogPosts.length > 0 ? (
              <div className="space-y-6">
                {storeBlogPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {post.featuredImage && (
                          <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg line-clamp-2">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {post.title}
                              </Link>
                            </h3>
                            {post.category && (
                              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                {post.category}
                              </Badge>
                            )}
                          </div>

                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {post.excerpt || post.content.substring(0, 150) + '...'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.ceil(post.content.split(' ').length / 200)} min read
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground">
                  This store hasn't published any blog posts yet. Check back later!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Store reviews coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">About {store.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {store.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Store Information</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {store.location && <p>📍 {store.location}</p>}
                      {store.established && <p>📅 Established {store.established}</p>}
                      <p>⭐ {store.rating}/5 rating</p>
                      <p>🛍️ {store.productCount} products</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Policies</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>🚚 Free shipping on orders over $50</p>
                      <p>↩️ 30-day return policy</p>
                      <p>💬 24/7 customer support</p>
                      <p>🔒 Secure payments guaranteed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
