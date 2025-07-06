
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Eye } from 'lucide-react';

export default function Orders() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          
          <div className="space-y-4">
            {[1, 2, 3].map((order) => (
              <Card key={order}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order}001</CardTitle>
                      <p className="text-sm text-muted-foreground">Placed on Dec {order}, 2024</p>
                    </div>
                    <Badge variant="outline">Delivered</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">2 items</p>
                        <p className="text-sm text-muted-foreground">Total: $299.99</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
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
