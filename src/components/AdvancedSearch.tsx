
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { Search, Mic, Camera, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedSearchProps {
  onResults: (results: any[]) => void;
  onSuggestions: (suggestions: string[]) => void;
}

export function AdvancedSearch({ onResults, onSuggestions }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sdk, products } = useCommerce();
  const { toast } = useToast();

  // Voice search functionality
  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Search Unavailable",
        description: "Your browser doesn't support voice search. Please type your search instead.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = () => {
      toast({
        title: "Voice Search Error",
        description: "Could not process voice input. Please try again.",
        variant: "destructive"
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [toast]);

  // Image search functionality
  const handleImageSearch = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Convert image to base64 for processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        if (sdk?.aiHelper) {
          // Use AI to analyze image and suggest search terms
          const imageAnalysis = await sdk.aiHelper.chat([
            {
              role: 'system',
              content: 'Analyze this product image and suggest search terms that would help find similar products. Return only the search terms, comma-separated.'
            },
            {
              role: 'user',
              content: `Analyze this image and suggest product search terms: ${base64.slice(0, 100)}...`
            }
          ]);
          
          const searchTerms = imageAnalysis.split(',')[0]?.trim();
          if (searchTerms) {
            setQuery(searchTerms);
            handleSearch(searchTerms);
          }
        } else {
          toast({
            title: "Image Search Unavailable",
            description: "AI service not available for image search.",
            variant: "destructive"
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Image Search Failed",
        description: "Could not process the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [sdk, toast]);

  // Enhanced search with AI
  const handleSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      let results = [];
      let suggestions: string[] = [];

      if (sdk?.aiHelper) {
        // Use AI-enhanced search
        const enhancedResults = await sdk.aiHelper.enhancedSearch(searchQuery, products);
        results = enhancedResults.results;
        suggestions = enhancedResults.suggestions;
      } else {
        // Fallback to basic search
        results = await sdk?.searchProducts(searchQuery) || [];
        suggestions = [`${searchQuery} alternatives`, `${searchQuery} reviews`, `${searchQuery} deals`];
      }

      onResults(results);
      onSuggestions(suggestions);

      // Add to recent searches
      const updatedSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Could not complete search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, sdk, products, onResults, onSuggestions, recentSearches, toast]);

  // Load recent searches on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, brands, categories... or try voice/image search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-4 h-12 text-base"
              disabled={isSearching}
            />
          </div>
          
          <Button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="h-12 px-6"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Voice and Image Search Buttons */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startVoiceSearch}
            disabled={isListening || isSearching}
            className="flex-1"
          >
            <Mic className={`w-4 h-4 mr-2 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
            {isListening ? 'Listening...' : 'Voice Search'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSearching}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Image Search
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSearch(file);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Recent Searches</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentSearches}
                className="h-auto p-1 text-xs"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
