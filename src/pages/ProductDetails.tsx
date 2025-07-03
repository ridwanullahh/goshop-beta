
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, ShoppingCart } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img 
              src="/placeholder.svg" 
              alt="Product" 
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Product Name</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(123 reviews)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">$299.99</span>
              <Badge variant="secondary">In Stock</Badge>
            </div>

            <p className="text-muted-foreground">
              Product description goes here. This is a detailed description of the product.
            </p>

            <div className="flex gap-4">
              <Button className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
