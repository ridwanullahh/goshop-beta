
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, DollarSign } from 'lucide-react';

export default function CrowdCheckout() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Group Buy #{orderId}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Wireless Headphones Pro - Group Purchase</h3>
                <p className="text-muted-foreground">
                  Join others to get this product at a discounted price when we reach the minimum quantity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Progress to minimum order</span>
                  <Badge variant="secondary">75/100 people</Badge>
                </div>
                <Progress value={75} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">$199.99</p>
                  <p className="text-sm text-muted-foreground">Group Price</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">2d 14h</p>
                  <p className="text-sm text-muted-foreground">Time Left</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full">Join Group Buy - $199.99</Button>
                <p className="text-xs text-center text-muted-foreground">
                  You'll only be charged if the minimum quantity is reached
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
