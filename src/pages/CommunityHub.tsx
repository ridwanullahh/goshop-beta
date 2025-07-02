
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommerce } from '@/context/CommerceContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  Star,
  Play,
  Gift,
  Crown,
  Award
} from 'lucide-react';

interface CommunityPost {
  id: string;
  type: 'story' | 'review' | 'haul' | 'recommendation';
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    badges: string[];
  };
  content: {
    text?: string;
    images: string[];
    products?: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
    }>;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: Date;
}

interface CommunityStats {
  totalMembers: number;
  activeToday: number;
  totalPosts: number;
  totalPurchases: number;
}

export default function CommunityHub() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 125420,
    activeToday: 8934,
    totalPosts: 45620,
    totalPurchases: 234500
  });
  const { currentUser, addToCart } = useCommerce();

  useEffect(() => {
    // Mock community posts
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        type: 'haul',
        author: {
          name: 'TechReviewer',
          avatar: '/placeholder.svg',
          verified: true,
          badges: ['Top Reviewer', 'Tech Expert']
        },
        content: {
          text: 'Amazing haul from the tech sale! These wireless earbuds are a game-changer 🎧✨',
          images: ['/placeholder.svg', '/placeholder.svg'],
          products: [
            { id: '1', name: 'Wireless Earbuds Pro', price: 79.99, image: '/placeholder.svg' },
            { id: '2', name: 'Phone Case Premium', price: 24.99, image: '/placeholder.svg' }
          ]
        },
        engagement: { likes: 1247, comments: 89, shares: 34 },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'review',
        author: {
          name: 'FashionForward',
          avatar: '/placeholder.svg',
          verified: false,
          badges: ['Style Maven']
        },
        content: {
          text: 'Obsessed with this summer dress collection! Perfect fit and amazing quality. Worth every penny! 👗💕',
          images: ['/placeholder.svg'],
          products: [
            { id: '3', name: 'Summer Floral Dress', price: 45.99, image: '/placeholder.svg' }
          ]
        },
        engagement: { likes: 892, comments: 67, shares: 23 },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'story',
        author: {
          name: 'LifestyleBlogger',
          avatar: '/placeholder.svg',
          verified: true,
          badges: ['Influencer', 'Lifestyle']
        },
        content: {
          text: 'Day in my life with my favorite gadgets! Swipe to see my must-have tech essentials ➡️',
          images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
          products: [
            { id: '4', name: 'Smart Watch Ultra', price: 299.99, image: '/placeholder.svg' },
            { id: '5', name: 'Wireless Charger', price: 39.99, image: '/placeholder.svg' }
          ]
        },
        engagement: { likes: 2156, comments: 134, shares: 78 },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    setPosts(mockPosts);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, engagement: { ...post.engagement, likes: post.engagement.likes + 1 }}
        : post
    ));
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community Hub</h1>
            <p className="text-muted-foreground">
              Discover, share, and shop with the CommerceOS community
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Crown className="w-4 h-4 mr-2" />
            Join VIP Community
          </Button>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.activeToday.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Community Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{stats.totalPurchases.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Group Purchases</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="hauls">Hauls</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.author.name}</span>
                          {post.author.verified && (
                            <Badge className="bg-blue-500 text-white px-1 py-0 text-xs">
                              <Award className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.author.badges.map(badge => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {post.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Post Content */}
                  <p className="text-sm mb-4">{post.content.text}</p>

                  {/* Images */}
                  {post.content.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.content.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Featured Products */}
                  {post.content.products && post.content.products.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium text-sm">Featured Products:</h4>
                      {post.content.products.map(product => (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-primary font-bold">${product.price}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            className="shrink-0"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Engagement */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        {post.engagement.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.engagement.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.engagement.shares}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {post.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Community Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="font-semibold mb-2">Group Buying</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join group purchases to unlock exclusive discounts and deals
            </p>
            <Button variant="outline">View Active Groups</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-semibold mb-2">Creator Program</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Become a community creator and earn commissions on referrals
            </p>
            <Button variant="outline">Apply Now</Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold mb-2">VIP Benefits</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unlock exclusive perks, early access, and premium features
            </p>
            <Button variant="outline">Learn More</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
