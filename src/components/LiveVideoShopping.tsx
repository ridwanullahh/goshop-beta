import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { LiveStream, ChatMessage } from '@/lib/commerce-sdk';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Play,
  Pause,
  ShoppingCart,
  Send,
  Users,
  Heart
} from 'lucide-react';

export function LiveVideoShopping() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addToCart, user: currentUser, sdk } = useCommerce();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLiveStreams = async () => {
      if (!sdk) return;
      const liveStreams = await sdk.getLiveStreams();
      setStreams(liveStreams);
      if (liveStreams.length > 0) {
        setActiveStream(liveStreams[0]);
      }
    };
    fetchLiveStreams();
  }, [sdk]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = async (product: any) => {
    if (!currentUser) {
      toast({ title: 'Please log in to add items to your cart.', variant: 'destructive' });
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast({ title: 'Product added to cart!', variant: 'default' });
    } catch (error) {
      toast({ title: 'Failed to add product to cart.', variant: 'destructive' });
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && currentUser) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        username: currentUser.name || 'Anonymous',
        message: chatInput.trim(),
        timestamp: new Date(),
        type: 'message'
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
    }
  };

  if (streams.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">No Live Streams Available</h2>
        <p className="text-muted-foreground">Check back later for live shopping events.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Video Player Section */}
      <div className="lg:col-span-3">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video ref={videoRef} className="w-full h-full" onClick={handlePlayPause} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={handlePlayPause}>
              {!isPlaying && <Play className="h-16 w-16 text-white" />}
            </div>
            <div className="absolute top-4 left-4">
              <Badge variant="destructive">LIVE</Badge>
            </div>
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">{activeStream?.viewerCount || 0}</span>
            </div>
          </div>
        </Card>
        <div className="mt-4">
          <h2 className="text-2xl font-bold">{activeStream?.title}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <img src={activeStream?.sellerAvatar} alt={activeStream?.sellerName} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-semibold">{activeStream?.sellerName}</p>
              <Button size="sm" variant="outline">Follow</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat & Products Section */}
      <div>
        <Card>
          <CardContent className="p-0">
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex space-x-2">
                  <p className="text-sm">
                    <span className="font-semibold">{msg.username}:</span> {msg.message}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t">
              <div className="relative">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Join the conversation..."
                  className="pr-12"
                />
                <Button size="icon" variant="ghost" className="absolute top-1/2 right-1 transform -translate-y-1/2" onClick={handleSendMessage}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 space-y-4">
          <h3 className="font-bold text-lg">Featured Products</h3>
          {activeStream?.products.map(product => (
            <Card key={product.id} className="flex items-center p-2 space-x-3 cursor-pointer" onClick={() => handleProductClick(product)}>
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{product.name}</p>
                <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
              </div>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
