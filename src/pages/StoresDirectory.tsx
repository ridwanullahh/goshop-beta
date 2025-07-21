import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Search, MapPin, Star, ShoppingBag, Filter, LayoutGrid, List } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { Store } from '../lib/commerce-sdk';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export default function StoresDirectory() {
  const { sdk } = useCommerce();
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    isVerified: false,
    minRating: 0,
  });

  useEffect(() => {
    async function loadStores() {
      if (!sdk) return;
      try {
        const storesData = await sdk.getStores();
        const approvedStores = storesData.filter(store => store.approvalStatus === 'approved');
        setStores(approvedStores);
      } catch (error) {
        console.error('Failed to load stores:', error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadStores();
  }, [sdk]);

  const filteredAndSortedStores = useMemo(() => {
    return stores
      .filter(store => {
        const matchesSearch =
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilters =
          (!filters.isVerified || store.isVerified) &&
          (store.rating || 0) >= filters.minRating;
        return matchesSearch && matchesFilters;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default:
            return 0;
        }
      });
  }, [stores, searchQuery, sortBy, filters]);

  const StoreCardGrid = ({ store }: { store: Store }) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <Link to={`/@${store.slug}`} className="flex flex-col h-full">
        <div className="relative h-40 bg-muted overflow-hidden">
          {store.banner ? (
            <img src={store.banner} alt={store.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
          )}
          <div className="absolute inset-0 bg-black/20"></div>
          {store.isVerified && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-none">Verified</Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-start gap-4 mb-3">
            <Avatar className="w-16 h-16 border-4 border-background -mt-8">
              <AvatarImage src={store.logo} alt={store.name} />
              <AvatarFallback>{store.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2">
              <h3 className="font-bold text-lg leading-tight truncate">{store.name}</h3>
              {store.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{store.location}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">{store.description}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-foreground">{store.rating || 'N/A'}</span>
              <span>({store.reviewCount || 0})</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span>{store.productCount || 0} products</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const StoreCardList = ({ store }: { store: Store }) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg w-full">
      <Link to={`/@${store.slug}`} className="flex items-center p-4 gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={store.logo} alt={store.name} className="object-cover" />
          <AvatarFallback className="text-2xl">{store.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-xl">{store.name}</h3>
            {store.isVerified && <Badge className="bg-green-500 text-white border-none">Verified</Badge>}
          </div>
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{store.description}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {store.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {store.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-foreground">{store.rating || 'N/A'}</span>
              <span>({store.reviewCount || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span>{store.productCount || 0} products</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="ml-auto shrink-0">Visit Store</Button>
      </Link>
    </Card>
  );

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Explore Our Stores</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover a curated collection of unique products from our community of trusted sellers.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-16 bg-background/80 backdrop-blur-sm z-10 py-4 -mx-4 px-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by store name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Store Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.isVerified}
                  onCheckedChange={(checked) => setFilters(f => ({ ...f, isVerified: !!checked }))}
                >
                  Verified Stores
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by: Rating</SelectItem>
                <SelectItem value="newest">Sort by: Newest</SelectItem>
                <SelectItem value="name">Sort by: Name</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted"></div>
                <CardContent className="p-4"><div className="h-24 bg-muted rounded"></div></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedStores.length > 0 ? (
          <div className={`grid gap-x-6 gap-y-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredAndSortedStores.map((store) =>
              viewMode === 'grid' ? <StoreCardGrid key={store.id} store={store} /> : <StoreCardList key={store.id} store={store} />
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-semibold mb-2">No Stores Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
