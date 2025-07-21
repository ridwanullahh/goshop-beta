import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LiveVideoShopping } from '@/components/LiveVideoShopping';
import { LiveStream } from '@/lib/commerce-sdk';

export default function LiveShoppingPage() {
  const { id } = useParams();
  const { sdk } = useCommerce();
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStream() {
      if (!sdk || !id) return;
      try {
        const streams = await sdk.getLiveStreams();
        const streamData = streams.find(s => s.id === id);
        setStream(streamData || null);
      } catch (error) {
        console.error("Failed to load stream", error);
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
        <LiveVideoShopping />
      </main>
      <Footer />
    </div>
  );
}
