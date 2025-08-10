import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveStream, Product } from '@/lib';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function LiveStreamPage() {
  const { id } = useParams();
  const { sdk, addToCart } = useCommerce();
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStream() {
      if (!sdk || !id) return;
      try {
        const streamData = await sdk.getLiveStreams().then(streams => streams.find(s => s.id === id));
        setStream(streamData);
        if (streamData) {
          const productData = await Promise.all(
            streamData.productIds.map(productId => sdk.getProduct(productId))
          );
          setProducts(productData.filter(p => p) as Product[]);
        }
      } catch (error) {
        console.error("Failed to load stream", error)
      } finally {
        setLoading(false);
      }
    }
    loadStream();
  }, [sdk, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading live stream...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Live stream not found.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-lg mb-4">
              {/* Agora video player would be integrated here */}
              <div className="w-full h-full flex items-center justify-center text-white">
                Live Stream Video (ID: {stream.id})
              </div>
            </div>
            <h1 className="text-3xl font-bold">{stream.title}</h1>
            <p className="text-muted-foreground mt-2">{stream.description}</p>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Featured Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-primary font-bold">${product.price}</p>
                    </div>
                    <Button size="sm" onClick={() => addToCart(product.id)}>
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}