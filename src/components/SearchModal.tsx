import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Mic, Camera, Filter, TrendingUp, Clock, X, Star, ArrowRight } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Link } from 'react-router-dom';

interface SearchModalProps {
  children: React.ReactNode;
}

export function SearchModal({ children }: SearchModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState(['iPhone 15', 'MacBook Pro', 'AirPods', 'Gaming Chair']);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: ''
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: products } = useRealTimeData('products');
  const { data: categories } = useRealTimeData('categories');

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      let filteredResults = (products || []).filter((product: any) =>
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Apply filters
      if (filters.category) {
        filteredResults = filteredResults.filter((p: any) => p?.category === filters.category);
      }
      if (filters.minPrice) {
        filteredResults = filteredResults.filter((p: any) => (p?.price || 0) >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filteredResults = filteredResults.filter((p: any) => (p?.price || 0) <= parseFloat(filters.maxPrice));
      }
      if (filters.rating) {
        filteredResults = filteredResults.filter((p: any) => (p?.rating || 0) >= parseFloat(filters.rating));
      }

      setResults(filteredResults);

      // Save to recent searches
      if (searchQuery && !recentSearches.includes(searchQuery)) {
        const updatedSearches = [searchQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const handleTrendingSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const categoryList = ['All', ...(categories || []).map((c: any) => c?.name || '')];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="p-6 border-b bg-background sticky top-0 z-10">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products, brands, categories..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value) {
                      handleSearch(e.target.value);
                    } else {
                      setResults([]);
                    }
                  }}
                  className="pl-10 pr-10 h-12 text-base border-2 focus:border-primary"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {categoryList.map((category) => (
                <Badge
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    category: category === 'All' ? '' : category 
                  }))}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-y-auto">
            {!query && (
              <div className="p-6">
                {/* Trending Searches */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Trending</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleTrendingSearch(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Recent</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <Badge
                          key={term}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleTrendingSearch(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search Results */}
            {query && (
              <div className="p-6">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Searching...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-muted-foreground">
                        Found {results.length} results for "{query}"
                      </p>
                      <Link 
                        to={`/search?q=${encodeURIComponent(query)}`}
                        onClick={() => setOpen(false)}
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                      >
                        View all <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.slice(0, 12).map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/product/${product.id}`}
                          onClick={() => setOpen(false)}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <img
                                src={product.images?.[0] || '/placeholder.svg'}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded mb-3"
                              />
                              <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-primary">${product.price}</p>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs ml-1">{product.rating || 0}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : query ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or filters
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
