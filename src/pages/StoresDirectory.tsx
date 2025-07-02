
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MapPin, Star, Users, ShoppingBag, Filter } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

export default function StoresDirectory() {
  const { sdk } = useCommerce();
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      if (!sdk) return;
      
      try {
        const storesData = await sdk.getStores();
        setStores(storesData);
        setFilteredStores(storesData);
      } catch (error) {
        console.error('Failed to load stores:', error);
        // Fallback stores for demo
        const fallbackStores = [
          {
            id: '1',
            name: 'TechHub Electronics',
            slug: 'techhub-electronics',
            description: 'Your one-stop shop for all electronic gadgets and accessories.',
            logo: '/placeholder.svg',
            banner: '/placeholder.svg',
            sellerId: 'seller1',
            rating: 4.8,
            reviewCount: 1247,
            productCount: 156,
            isVerified: true,
            location: 'New York, USA'
          },
          {
            id: '2',
            name: 'Fashion Forward',
            slug: 'fashion-forward',
            description: 'Trendy clothing and accessories for the modern lifestyle.',
            logo: '/placeholder.svg',
            banner: '/placeholder.svg',
            sellerId: 'seller2',
            rating: 4.6,
            reviewCount: 892,
            productCount: 234,
            isVerified: true,
            location: 'Los Angeles, USA'
          }
        ];
        setStores(fallbackStores);
        setFilteredStores(fallbackStores);
      } finally {
        setIsLoading(false);
      }
    }

    loadStores();
  }, [sdk]);

  useEffect(() => {
    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchQuery, stores]);

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Stores</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find unique products from verified sellers around the world
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold">{stores.length}+</h3>
              <p className="text-muted-foreground">Active Stores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold">10K+</h3>
              <p className="text-muted-foreground">Happy Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold">4.7</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card key={store.id} className="group overflow-hidden hover:shadow-card transition-all duration-300">
                <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20">
                  {store.banner && (
                    <img
                      src={store.banner}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20"></div>
                  {store.isVerified && (
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={store.logo} alt={store.name} />
                      <AvatarFallback>
                        {store.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{store.name}</h3>
                      {store.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {store.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {store.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      <span className="text-sm font-medium">{store.rating}</span>
                      <span className="text-sm text-muted-foreground">({store.reviewCount})</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {store.productCount} products
                    </span>
                  </div>
                  
                  <Link to={`/stores/${store.slug}`}>
                    <Button className="w-full">Visit Store</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredStores.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No stores found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all stores
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
