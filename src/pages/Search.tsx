import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommerce } from '@/context/CommerceContext';
import { Search as SearchIcon, Filter, SlidersHorizontal, X } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, searchProducts } = useCommerce();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let filteredResults = await searchProducts(searchTerm);
      
      // Apply category filter
      if (selectedCategory !== 'all') {
        filteredResults = filteredResults.filter(product => 
          product.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      // Apply price range filter
      if (priceRange !== 'all') {
        filteredResults = filteredResults.filter(product => {
          switch (priceRange) {
            case 'under-25':
              return product.price < 25;
            case '25-50':
              return product.price >= 25 && product.price <= 50;
            case '50-100':
              return product.price >= 50 && product.price <= 100;
            case 'over-100':
              return product.price > 100;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          filteredResults.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredResults.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredResults.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          // Keep relevance order (default from search)
          break;
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'relevance';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {query ? `Search results for "${query}"` : 'Search Products'}
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </form>

            {/* Results Summary */}
            {query && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {loading ? 'Searching...' : `${results.length} results found`}
                </p>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-25">Under $25</SelectItem>
                        <SelectItem value="25-50">$25 - $50</SelectItem>
                        <SelectItem value="50-100">$50 - $100</SelectItem>
                        <SelectItem value="over-100">Over $100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Active Filters</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory !== 'all' && (
                          <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('all')}>
                            {selectedCategory} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                        {priceRange !== 'all' && (
                          <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange('all')}>
                            {priceRange} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                        {sortBy !== 'relevance' && (
                          <Badge variant="secondary" className="cursor-pointer" onClick={() => setSortBy('relevance')}>
                            {sortBy} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : results.length > 0 ? (
                <ProductGrid products={results} />
              ) : query ? (
                <div className="text-center py-12">
                  <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                  <p className="text-muted-foreground">
                    Enter a search term to find products
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
      <Footer />
    </div>
  );
}
