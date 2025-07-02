
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  Plus,
  Search,
  TrendingUp,
  Camera,
  Video,
  ShoppingBag,
  Star
} from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function CommunityHub() {
  const { currentUser, products } = useCommerce();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    // Sample community posts
    const samplePosts = [
      {
        id: '1',
        user: 'TechReviewer',
        userAvatar: '/placeholder.svg',
        content: 'Just unboxed the new wireless headphones! The sound quality is incredible 🎧',
        image: '/placeholder.svg',
        likes: 45,
        comments: 12,
        shares: 5,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        product: products[0],
        tags: ['#TechReview', '#Headphones']
      },
      {
        id: '2',
        user: 'Fashionista',
        userAvatar: '/placeholder.svg',
        content: 'Perfect outfit for the weekend! Love how this fits 💃',
        image: '/placeholder.svg',
        likes: 78,
        comments: 23,
        shares: 15,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        tags: ['#OOTD', '#Fashion', '#Weekend']
      },
      {
        id: '3',
        user: 'HomeDesigner',
        userAvatar: '/placeholder.svg',
        content: 'Transformed my living room with these amazing finds! What do you think?',
        image: '/placeholder.svg',
        likes: 92,
        comments: 31,
        shares: 8,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        tags: ['#HomeDecor', '#InteriorDesign', '#Makeover']
      }
    ];
    setPosts(samplePosts);
  }, [products]);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post = {
      id: Date.now().toString(),
      user: currentUser?.email || 'Anonymous',
      userAvatar: '/placeholder.svg',
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date(),
      tags: []
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Community Hub</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Connect, share, and discover with fellow shoppers
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary">25.7K Members</Badge>
            <Badge variant="secondary">1.2K Online</Badge>
            <Badge variant="secondary">500+ Posts Today</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="mt-6">
                {/* Create Post */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="What's on your mind? Share your latest finds or ask for recommendations..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="mb-3"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Camera className="h-4 w-4 mr-2" />
                              Photo
                            </Button>
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Video
                            </Button>
                            <Button variant="outline" size="sm">
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Product
                            </Button>
                          </div>
                          <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar>
                            <AvatarImage src={post.userAvatar} />
                            <AvatarFallback>{post.user.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{post.user}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatTimeAgo(post.timestamp)}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Post Content */}
                        <p className="mb-4">{post.content}</p>

                        {/* Post Image */}
                        {post.image && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <img
                              src={post.image}
                              alt="Post content"
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        )}

                        {/* Featured Product */}
                        {post.product && (
                          <Card className="mb-4 border border-muted">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <img
                                  src={post.product.images[0]}
                                  alt={post.product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium line-clamp-1">{post.product.name}</h5>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {post.product.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-bold text-primary">${post.product.price}</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                                      <span className="text-sm">{post.product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm">View</Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Post Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-6">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Share2 className="h-4 w-4" />
                              {post.shares}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="trending" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Trending Content</h3>
                    <p className="text-muted-foreground">
                      Discover what's hot in the community right now
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Product Reviews</h3>
                    <p className="text-muted-foreground">
                      Read and share honest product reviews
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="groups" className="mt-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Community Groups</h3>
                    <p className="text-muted-foreground">
                      Join groups based on your interests
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search community..." className="pl-10" />
                </div>
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Popular Topics</h3>
                <div className="space-y-2">
                  {['#TechReviews', '#FashionFinds', '#HomeDecor', '#DealAlert', '#Unboxing'].map((topic) => (
                    <Button key={topic} variant="ghost" size="sm" className="w-full justify-start">
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Suggested for You</h3>
                <div className="space-y-3">
                  {['TechGuru', 'StyleMaven', 'BargainHunter'].map((user) => (
                    <div key={user} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user}</span>
                      </div>
                      <Button size="sm" variant="outline">Follow</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Members</span>
                    <span className="font-medium">25.7K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts Today</span>
                    <span className="font-medium">500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Online Now</span>
                    <span className="font-medium">1.2K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
