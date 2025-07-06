
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Store as StoreIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Stores() {
  const stores = [
    { id: 1, name: 'Tech Hub Store', slug: 'tech-hub-store', rating: 4.8, reviews: 1234, location: 'New York, NY' },
    { id: 2, name: 'Fashion Forward', slug: 'fashion-forward', rating: 4.9, reviews: 856, location: 'Los Angeles, CA' },
    { id: 3, name: 'Home Essentials', slug: 'home-essentials', rating: 4.7, reviews: 692, location: 'Chicago, IL' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Browse Stores</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        <StoreIcon className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{store.name}</h3>
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{store.rating}</span>
                      <span className="text-muted-foreground ml-1">({store.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{store.location}</span>
                    </div>
                  </div>
                  
                  <Link to={`/store/${store.slug}`}>
                    <Button className="w-full">Visit Store</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
