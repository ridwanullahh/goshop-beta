import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductGrid } from '@/components/ProductGrid';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { useCommerce } from '@/context/CommerceContext';
import { Search, Filter, SlidersHorizontal, Grid, List, Sparkles, TrendingUp } from 'lucide-react';

const Products = () => {
  const { products, searchProducts, currentUser } = useCommerce();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200+', label: '$200+' }
  ];

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => parseFloat(p) || Infinity);
      filtered = filtered.filter(product => {
        if (priceRange === '200+') return product.price >= 200;
        return product.price >= min && product.price <= max;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'trending':
        // Sort by a combination of rating and review count for trending
        filtered.sort((a, b) => (b.rating * Math.log(b.reviewCount + 1)) - (a.rating * Math.log(a.reviewCount + 1)));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, category, priceRange, sortBy]);

  const handleSearchResults = (results: any[]) => {
    setFilteredProducts(results);
  };

  const handleSearchSuggestions = (suggestions: string[]) => {
    setSearchSuggestions(suggestions);
  };

  const clearFilters = () => {
    setCategory('all');
    setPriceRange('all');
    setSortBy('newest');
    setFilteredProducts(products);
  };

  const activeFilters = [
    category !== 'all' && { type: 'category', value: category },
    priceRange !== 'all' && { type: 'price', value: priceRanges.find(r => r.value === priceRange)?.label },
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* AI-Enhanced Search Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Discover Products</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Search
            </Button>
            {currentUser && (
              <Button
                variant="outline"
                onClick={() => setShowAssistant(!showAssistant)}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Shopping Assistant
              </Button>
            )}
          </div>
        </div>

        {showAdvancedSearch && (
          <div className="mb-6">
            <AdvancedSearch
              onResults={handleSearchResults}
              onSuggestions={handleSearchSuggestions}
            />
          </div>
        )}

        {!showAdvancedSearch && (
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, brands, categories..."
              className="pl-12 pr-4 h-12 text-lg"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              Search
            </Button>
          </div>
        )}

        {/* Search Suggestions */}
        {searchSuggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Related:</span>
            {searchSuggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex flex-wrap gap-4 flex-1">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </div>
              </SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {filter.type}: {filter.value}
            </Badge>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {sortBy === 'trending' && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending Now
          </Badge>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid products={filteredProducts} className={viewMode === 'list' ? 'grid-cols-1' : ''} />

      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="mb-4 opacity-50">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Shopping Assistant */}
      {(showAssistant || !isAssistantMinimized) && currentUser && (
        <AIChatAssistant
          mode="buyer"
          isMinimized={isAssistantMinimized}
          onToggleMinimize={() => setIsAssistantMinimized(!isAssistantMinimized)}
          onClose={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
};

export default Products;
