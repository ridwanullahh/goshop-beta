
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProductGrid } from '@/components/ProductGrid';
import { useCommerce } from '@/context/CommerceContext';
import { Star, MapPin } from 'lucide-react';

export default function Store() {
  const { slug } = useParams();
  const { products } = useCommerce();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl">ST</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">Store Name</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="secondary">Verified Seller</Badge>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">4.8</span>
                      <span className="text-muted-foreground ml-1">(1,234 reviews)</span>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>New York, NY</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-bold mb-6">Products from this store</h2>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
