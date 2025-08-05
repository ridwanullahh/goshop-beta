
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MapPin, Star, Users, ShoppingBag, Filter, Grid, List, Clock, CheckCircle } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StoresDirectory() {
  const { sdk } = useCommerce();
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    async function loadStores() {
      if (!sdk) return;

      try {
        const storesData = await sdk.getStores();
        // Filter only approved and active stores
        const approvedStores = storesData.filter(store => store.isApproved && store.isActive);
        setStores(approvedStores);
        setFilteredStores(approvedStores);
      } catch (error) {
        console.error('Failed to load stores:', error);
        setStores([]);
        setFilteredStores([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadStores();
  }, [sdk]);

  useEffect(() => {
    let filtered = [...stores];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.categories?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(store => {
        if (filterBy === 'verified') return store.isVerified;
        if (filterBy === 'new') return new Date(store.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
        return store.categories?.includes(filterBy);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredStores(filtered);
  }, [searchQuery, stores, sortBy, filterBy]);

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
          <div className="max-w-4xl mx-auto space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search stores by name, description, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters and View Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="new">New Stores</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="products">Most Products</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

        {/* Stores Display */}
        {isLoading ? (
          <div className={viewMode === 'grid' ?
            "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" :
            "space-y-4"
          }>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="h-24 md:h-32 bg-muted"></div>
                    <CardContent className="p-3 md:p-6">
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-muted rounded-full"></div>
                        <div className="space-y-1 md:space-y-2">
                          <div className="h-3 md:h-4 bg-muted rounded w-16 md:w-24"></div>
                          <div className="h-2 md:h-3 bg-muted rounded w-12 md:w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <div className="h-2 md:h-3 bg-muted rounded"></div>
                        <div className="h-2 md:h-3 bg-muted rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No stores found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all stores
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ?
            "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" :
            "space-y-4"
          }>
            {filteredStores.map((store) => (
              <Card key={store.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                {viewMode === 'grid' ? (
                  <>
                    <div className="relative h-24 md:h-32 bg-gradient-to-r from-primary/20 to-secondary/20">
                      {store.banner && (
                        <img
                          src={store.banner}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20"></div>
                      {store.isVerified && (
                        <Badge className="absolute top-1 right-1 md:top-2 md:right-2 text-xs bg-primary text-primary-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {store.established && new Date(store.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
                        <Badge className="absolute top-1 left-1 md:top-2 md:left-2 text-xs bg-green-500 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-3 md:p-6">
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <Avatar className="w-8 h-8 md:w-12 md:h-12">
                          <AvatarImage src={store.logo} alt={store.name} />
                          <AvatarFallback className="text-xs md:text-sm">
                            {store.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm md:text-lg truncate">{store.name}</h3>
                          {store.location && (
                            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                              <MapPin className="h-2 w-2 md:h-3 md:w-3" />
                              <span className="truncate">{store.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                        {store.description}
                      </p>

                      <div className="flex items-center justify-between mb-3 md:mb-4 text-xs md:text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{store.rating || '4.5'}</span>
                          <span className="text-muted-foreground">({store.reviewCount || '0'})</span>
                        </div>
                        <span className="text-muted-foreground">
                          {store.productCount || '0'} products
                        </span>
                      </div>

                      <Link to={`/${store.slug}`}>
                        <Button className="w-full text-xs md:text-sm h-8 md:h-10">Visit Store</Button>
                      </Link>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={store.logo} alt={store.name} />
                          <AvatarFallback>
                            {store.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {store.isVerified && (
                          <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-primary bg-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{store.name}</h3>
                            {store.location && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {store.location}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {store.isVerified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                            {new Date(store.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
                              <Badge className="text-xs bg-green-500">New</Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {store.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{store.rating || '4.5'}</span>
                              <span className="text-muted-foreground">({store.reviewCount || '0'})</span>
                            </div>
                            <span className="text-muted-foreground">
                              {store.productCount || '0'} products
                            </span>
                          </div>

                          <Link to={`/${store.slug}`}>
                            <Button>Visit Store</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
