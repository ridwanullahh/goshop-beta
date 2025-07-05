
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { Search, X, TrendingUp, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { searchProducts, products, categories } = useCommerce();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches] = useState(['Headphones', 'Smart Watch', 'Laptop']);
  const [trendingSearches] = useState(['iPhone', 'Gaming Chair', 'Wireless Earbuds', 'Monitor']);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const searchResults = await searchProducts(query);
          setResults(searchResults.slice(0, 8));
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, searchProducts]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Products
            </span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {query && results.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="font-semibold mb-3">Search Results</h3>
              <div className="grid gap-3">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={handleClose}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{product.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-semibold text-primary">
                                ${product.price}
                              </span>
                              {product.rating && (
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs ml-1">{product.rating}</span>
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && !isSearching && (
            <div className="px-6 pb-6 text-center">
              <div className="py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          )}

          {!query && (
            <div className="px-6 pb-6 space-y-6">
              {/* Recent Searches */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <Button
                      key={search}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearchClick(search)}
                      className="h-8"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Trending Searches */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search) => (
                    <Button
                      key={search}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearchClick(search)}
                      className="h-8"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-3">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      onClick={handleClose}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="text-center">
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured Products */}
              <div>
                <h3 className="font-semibold mb-3">Featured Products</h3>
                <div className="grid gap-3">
                  {products.filter(p => p.isFeatured).slice(0, 3).map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={handleClose}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.images?.[0] || '/placeholder.svg'}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{product.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-primary text-sm">
                                  ${product.price}
                                </span>
                                {product.rating && (
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs ml-1">{product.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
