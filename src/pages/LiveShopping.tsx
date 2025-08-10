import React, { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveStream } from '@/lib';
import { Link } from 'react-router-dom';

export default function LiveShopping() {
  const { sdk } = useCommerce();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveStreams() {
      if (!sdk) return;
      try {
        const streams = await sdk.getLiveStreams();
        setLiveStreams(streams);
      } finally {
        setLoading(false);
      }
    }
    loadLiveStreams();
  }, [sdk]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Live Shopping</h1>
        {loading ? (
          <div className="text-center">Loading live streams...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveStreams.map(stream => (
              <Link to={`/live/${stream.id}`} key={stream.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/${stream.id}/600/400`} alt={stream.title} className="w-full h-48 object-cover" />
                    <Badge className="absolute top-2 right-2" variant={stream.status === 'live' ? 'destructive' : 'default'}>
                      {stream.status}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>{stream.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">{stream.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
