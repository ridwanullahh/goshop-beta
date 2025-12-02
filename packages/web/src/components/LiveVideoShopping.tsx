
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommerce } from '@/context/CommerceContext';
import { 
  Play, 
  Pause, 
  ShoppingCart, 
  Heart, 
  Share2, 
  MessageCircle, 
  Users, 
  Volume2,
  Maximize,
  Gift,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveStream {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  thumbnail: string;
  isLive: boolean;
  viewerCount: number;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  startTime: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'purchase' | 'join';
}

export function LiveVideoShopping() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addToCart, currentUser } = useCommerce();
  const { toast } = useToast();

  // Mock live streams data
  useEffect(() => {
    const mockStreams: LiveStream[] = [
      {
        id: 'stream1',
        title: 'Tech Gadgets Flash Sale - Up to 70% Off!',
        sellerId: 'seller1',
        sellerName: 'TechZone Store',
        sellerAvatar: '/placeholder.svg',
        thumbnail: '/placeholder.svg',
        isLive: true,
        viewerCount: 1247,
        products: [
          { id: '1', name: 'Wireless Earbuds Pro', price: 79.99, image: '/placeholder.svg' },
          { id: '2', name: 'Smart Watch Series X', price: 199.99, image: '/placeholder.svg' }
        ],
        startTime: new Date().toISOString()
      },
      {
        id: 'stream2',
        title: 'Fashion Haul - Summer Collection 2024',
        sellerId: 'seller2',
        sellerName: 'StyleHub',
        sellerAvatar: '/placeholder.svg',
        thumbnail: '/placeholder.svg',
        isLive: true,
        viewerCount: 892,
        products: [
          { id: '3', name: 'Summer Dress Collection', price: 45.99, image: '/placeholder.svg' },
          { id: '4', name: 'Casual Sneakers', price: 89.99, image: '/placeholder.svg' }
        ],
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    setStreams(mockStreams);
    setActiveStream(mockStreams[0]);

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'shopper123',
        message: 'Love these earbuds! Just ordered a pair 🎧',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        type: 'message'
      },
      {
        id: '2',
        username: 'techfan',
        message: 'How long is the battery life?',
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        type: 'message'
      },
      {
        id: '3',
        username: 'buyer456',
        message: 'Just purchased the smart watch! 🛒',
        timestamp: new Date(),
        type: 'purchase'
      }
    ];

    setChatMessages(mockMessages);
  }, []);

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

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      
      // Add purchase message to chat
      if (currentUser) {
        const purchaseMessage: ChatMessage = {
          id: Date.now().toString(),
          username: currentUser.email?.split('@')[0] || 'Anonymous',
          message: `Just added ${selectedProduct?.name || 'item'} to cart! 🛒`,
          timestamp: new Date(),
          type: 'purchase'
        };
        setChatMessages(prev => [...prev, purchaseMessage]);
      }

      toast({
        title: "Added to Cart!",
        description: "Item added successfully during live stream",
      });
    } catch (error) {
      toast({
        title: "Failed to Add",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !currentUser) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: currentUser.email?.split('@')[0] || 'Anonymous',
      message: chatInput,
      timestamp: new Date(),
      type: 'message'
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  if (!activeStream) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {streams.map(stream => (
          <Card key={stream.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={stream.thumbnail}
                alt={stream.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {stream.isLive && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white animate-pulse">
                  LIVE
                </Badge>
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                <Users className="w-3 h-3" />
                {stream.viewerCount.toLocaleString()}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{stream.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={stream.sellerAvatar}
                  alt={stream.sellerName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-muted-foreground">{stream.sellerName}</span>
              </div>
              <Button 
                className="w-full"
                onClick={() => setActiveStream(stream)}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Live
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-120px)]">
      {/* Video Player */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1">
          <CardContent className="p-0 relative h-full">
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              {/* Placeholder for video */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{activeStream.title}</h3>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activeStream.viewerCount.toLocaleString()} watching
                    </span>
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="secondary">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Products */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Featured Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeStream.products.map(product => (
                <div
                  key={product.id}
                  className="cursor-pointer group"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="aspect-square mb-2 overflow-hidden rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                  <p className="text-primary font-bold">${product.price}</p>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-80">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3">
                {chatMessages.map(message => (
                  <div key={message.id} className="text-sm">
                    {message.type === 'purchase' && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            {message.username}
                          </span>
                        </div>
                        <p className="text-green-700 dark:text-green-300 mt-1">
                          {message.message}
                        </p>
                      </div>
                    )}
                    {message.type === 'message' && (
                      <div>
                        <span className="font-medium text-primary">
                          {message.username}:
                        </span>
                        <span className="ml-2">{message.message}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            {currentUser ? (
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Join the conversation..."
                  className="text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  size="icon"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Sign in to join the chat
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
