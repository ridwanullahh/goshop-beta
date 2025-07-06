
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Star, MapPin, Store as StoreIcon, Search, Users, Package, TrendingUp, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Stores() {
  const { sdk } = useCommerce();
  const { data: stores, loading, refetch } = useRealTimeData('stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState([]);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    let filtered = (stores || []).filter((store: any) => store != null);
    
    if (searchQuery) {
      filtered = filtered.filter((store: any) =>
        store?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store?.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort stores
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'rating':
          return (b?.rating || 0) - (a?.rating || 0);
        case 'followers':
          return (b?.followers || 0) - (a?.followers || 0);
        case 'sales':
          return (b?.totalSales || 0) - (a?.totalSales || 0);
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '');
        default:
          return 0;
      }
    });

    setFilteredStores(filtered);
  }, [stores, searchQuery, sortBy]);

  const handleFollowStore = async (storeId: string) => {
    try {
      // This would typically update user's followed stores
      toast.success('Store followed successfully!');
    } catch (error) {
      toast.error('Failed to follow store');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading stores...</p>
            </div>
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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Discover Amazing Stores</h1>
            <p className="text-muted-foreground">Find your favorite brands and discover new ones</p>
          </div>

          {/* Search and Filter Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search stores by name, category, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="rating">Sort by Rating</option>
                    <option value="followers">Sort by Followers</option>
                    <option value="sales">Sort by Sales</option>
                    <option value="name">Sort by Name</option>
                  </select>
                  
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <StoreIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{(stores || []).length}</div>
                <div className="text-sm text-muted-foreground">Total Stores</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">
                  {(stores || []).reduce((sum: number, store: any) => sum + (store?.followers || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Followers</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">
                  {(stores || []).reduce((sum: number, store: any) => sum + (store?.products?.length || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  ${(stores || []).reduce((sum: number, store: any) => sum + (store?.totalSales || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </CardContent>
            </Card>
          </div>

          {/* Stores Grid */}
          {filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardContent className="p-0">
                    {/* Store Header */}
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-white">
                            <AvatarImage src={store.avatar || '/placeholder.svg'} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {store.name?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-white">
                            <h3 className="font-bold text-lg">{store.name}</h3>
                            <div className="flex items-center gap-2">
                              {store.verified && (
                                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Store Info */}
                      <div className="space-y-3 mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {store.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{store.rating || 0}</span>
                            <span className="text-muted-foreground">
                              ({store.reviewCount || 0} reviews)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{store.location || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Store Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div>
                          <div className="font-semibold text-sm">{store.followers || 0}</div>
                          <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{store.products?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Products</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">${(store.totalSales || 0).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Sales</div>
                        </div>
                      </div>

                      {/* Categories */}
                      {store.categories && store.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {store.categories.slice(0, 3).map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {store.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{store.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link to={`/store/${store.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            Visit Store
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollowStore(store.id)}
                        >
                          Follow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <StoreIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No stores found' : 'No stores available'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No stores match your search for "${searchQuery}"`
                    : 'Be the first to create a store on our platform!'
                  }
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/seller-dashboard">Become a Seller</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {filteredStores.length > 12 && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={refetch}>
                Load More Stores
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
