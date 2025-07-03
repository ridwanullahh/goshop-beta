
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { ProductGrid } from '@/components/ProductGrid';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const query = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            {query ? `Search results for "${query}"` : 'Search Products'}
          </h1>
          
          <AdvancedSearch 
            onResults={setResults}
            onSuggestions={setSuggestions}
          />
          
          {results.length > 0 && (
            <div className="mt-8">
              <ProductGrid products={results} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
