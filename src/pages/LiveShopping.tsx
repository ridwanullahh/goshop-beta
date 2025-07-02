
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  ShoppingCart,
  Radio,
  Eye,
  Gift,
  Star
} from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LiveShopping() {
  const { products, addToCart } = useCommerce();
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    // Simulate live streams
    const streams = [
      {
        id: '1',
        title: 'Tech Gadgets Flash Sale - Up to 70% Off!',
        host: 'TechReviewer Pro',
        hostAvatar: '/placeholder.svg',
        thumbnail: '/placeholder.svg',
        viewers: 2847,
        likes: 1230,
        isLive: true,
        products: products.slice(0, 3),
        category: 'Electronics'
      },
      {
        id: '2',
        title: 'Fashion Haul & Style Tips',
        host: 'StyleGuru',
        hostAvatar: '/placeholder.svg',
        thumbnail: '/placeholder.svg',
        viewers: 1654,
        likes: 890,
        isLive: true,
        products: products.slice(1, 4),
        category: 'Fashion'
      },
      {
        id: '3',
        title: 'Home Decor Essentials',
        host: 'HomeDesigner',
        hostAvatar: '/placeholder.svg',
        thumbnail: '/placeholder.svg',
        viewers: 934,
        likes: 567,
        isLive: false,
        products: products.slice(2, 5),
        category: 'Home & Garden'
      }
    ];
    setLiveStreams(streams);
    
    // Sample chat messages
    setChatMessages([
      { id: '1', user: 'ShopperX', message: 'Great deals!', timestamp: new Date() },
      { id: '2', user: 'BargainHunter', message: 'Is shipping free?', timestamp: new Date() },
      { id: '3', user: 'TechFan', message: 'Love this product!', timestamp: new Date() }
    ]);
  }, [products]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const formatViewers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Radio className="h-8 w-8 text-red-500 animate-pulse" />
            <h1 className="text-4xl font-bold">Live Shopping</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Watch live product demos and shop in real-time
          </p>
          <Badge variant="secondary" className="text-red-500 border-red-200">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            {liveStreams.filter(s => s.isLive).length} Live Now
          </Badge>
        </div>

        {selectedStream ? (
          /* Live Stream Viewer */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Main Stream */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-black">
                  <img
                    src={selectedStream.thumbnail}
                    alt={selectedStream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6 mr-2" />
                      Watch Live
                    </Button>
                  </div>
                  
                  {/* Live indicator */}
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </Badge>
                  
                  {/* Viewer count */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    <Eye className="h-4 w-4 inline mr-1" />
                    {formatViewers(selectedStream.viewers)}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{selectedStream.title}</h2>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedStream.hostAvatar} />
                          <AvatarFallback>{selectedStream.host.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedStream.host}</span>
                        <Badge variant="outline">{selectedStream.category}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedStream(null)}>
                      Back to Streams
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      {selectedStream.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Gift className="h-4 w-4 mr-2" />
                      Send Gift
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Featured Products */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Featured Products</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedStream.products.map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">${product.price}</span>
                          <Button size="sm" onClick={() => addToCart(product.id)}>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Live Chat */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  <h3 className="font-semibold mb-4">Live Chat</h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="font-medium text-primary">{msg.user}:</span>
                        <span className="ml-2">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="sm" onClick={handleSendMessage}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Live Streams Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <Card 
                key={stream.id} 
                className="group overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedStream(stream)}
              >
                <div className="relative aspect-video">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {stream.isLive ? (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      LIVE
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground">
                      REPLAY
                    </Badge>
                  )}
                  
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    <Eye className="h-3 w-3 inline mr-1" />
                    {formatViewers(stream.viewers)}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="lg" className="rounded-full">
                      <Play className="h-5 w-5 mr-2" />
                      {stream.isLive ? 'Watch Live' : 'Watch Replay'}
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{stream.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={stream.hostAvatar} />
                      <AvatarFallback>{stream.host.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{stream.host}</span>
                    <Badge variant="outline" className="text-xs">{stream.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {formatViewers(stream.viewers)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {stream.likes}
                      </span>
                    </div>
                    <span>{stream.products.length} products</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upcoming Streams */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Upcoming Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Radio className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">Fashion Week Special</h4>
                  <p className="text-sm text-muted-foreground mb-2">Tomorrow at 3:00 PM</p>
                  <Button size="sm" variant="outline">Set Reminder</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
