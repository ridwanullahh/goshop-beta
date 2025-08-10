import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommerce } from '@/context/CommerceContext';
import { useToast } from '@/hooks/use-toast';
import { Post, Comment } from '@/lib';
import CommunityPost from '@/components/CommunityPost';
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Send
} from 'lucide-react';

export default function CommunityHub() {
  const { toast } = useToast();
  const { currentUser, sdk } = useCommerce();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState<{content: string; tags: string; productIds: string[]}>({ content: '', tags: '', productIds: [] });
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'moderation'>('feed');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchAvailableProducts();
  }, [sdk, currentUser]);

  const fetchPosts = async () => {
    if (!sdk) return;

    setLoading(true);
    try {
      const fetchedPosts = await sdk.getPosts();
      setPosts(fetchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: 'Failed to load community posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    if (!sdk || !currentUser) return;
    try {
      let prods = [] as any[];
      if (currentUser.role === 'seller') {
        prods = await sdk.getSellerProducts(currentUser.id);
      } else {
        prods = await sdk.getAffiliateProducts();
      }
      setAvailableProducts(prods);
    } catch (err) {
      console.error('Error loading products for post attachment:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!sdk || !currentUser || !newPost.content.trim()) return;

    if (!['seller', 'affiliate', 'admin'].includes(currentUser.role)) {
      toast({ title: 'Only sellers, affiliates, and admins can post.', variant: 'destructive' });
      return;
    }

    try {
      const postData = {
        userId: currentUser.id!,
        userName: currentUser.name || currentUser.email,
        userAvatar: currentUser.avatar || '',
        role: currentUser.role,
        content: newPost.content,
        productIds: newPost.productIds,
        likes: 0,
        comments: 0,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      await sdk.createPost(postData);
      toast({ title: 'Post submitted for moderation.', variant: 'default' });
      setNewPost({ content: '', tags: '', productIds: [] });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: 'Failed to create post', variant: 'destructive' });
    }
  };

  const handleLikePost = async (postId: string, currentLikes: number, isLiked?: boolean) => {
    if (!sdk || !currentUser) {
      toast({ title: 'Please login to like posts', variant: 'destructive' });
      return;
    }

    try {
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
      await sdk.updatePost(postId, {
        likes: newLikes,
        isLiked: !isLiked
      });

      // Update local state
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, likes: newLikes, isLiked: !isLiked }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      toast({ title: 'Failed to like post', variant: 'destructive' });
    }
  };

  const fetchComments = async (postId: string) => {
    if (!sdk) return;

    try {
      const fetchedComments = await sdk.getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!sdk || !currentUser || !selectedPost || !newComment.trim()) return;

    try {
      const commentData = {
        postId: selectedPost.id!,
        userId: currentUser.id!,
        userName: currentUser.name || currentUser.email,
        userAvatar: currentUser.avatar || '',
        content: newComment,
        createdAt: new Date().toISOString()
      };

      await sdk.createComment(commentData);

      // Update post comment count
      await sdk.updatePost(selectedPost.id!, {
        comments: selectedPost.comments + 1
      });

      toast({ title: 'Comment added successfully', variant: 'default' });
      setNewComment('');
      fetchComments(selectedPost.id!);
      fetchPosts(); // Refresh to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);

	          {/* Admin Moderation Tab Toggle */}
	          {currentUser?.role === 'admin' && (
	            <div className="mb-6 flex gap-2">
	              <Button variant={activeTab === 'feed' ? 'default' : 'outline'} onClick={() => setActiveTab('feed')}>Feed</Button>
	              <Button variant={activeTab === 'moderation' ? 'default' : 'outline'} onClick={async () => {
	                setActiveTab('moderation');
	                const all = await sdk.getPosts();
	                setPendingPosts(all.filter(p => p.status !== 'approved'));
	              }}>Moderation</Button>
	            </div>
	          )}

      toast({ title: 'Failed to add comment', variant: 'destructive' });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Community Hub</h1>
            <p className="text-muted-foreground">
              Connect with other shoppers, share experiences, and discover new products
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{posts.reduce((acc, post) => acc + post.comments, 0)}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{posts.reduce((acc, post) => acc + post.likes, 0)}</p>
                <p className="text-sm text-muted-foreground">Likes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Active Today</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Post Button */}
          {currentUser && (<>
            <Card className="mb-6">
              <CardContent className="p-4">
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Share something with the community...
                </Button>
              </CardContent>
            </Card>

            {/* Moderation Panel */}
            {activeTab === 'moderation' && currentUser?.role === 'admin' && (
              <div className="space-y-4 mb-8">
                {pendingPosts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">No posts pending moderation.</CardContent>
                  </Card>
                ) : pendingPosts.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <p className="font-medium">{p.userName} <span className="text-xs text-muted-foreground">({p.role})</span></p>
                        <p className="text-sm">{p.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={async () => { await sdk.moderatePost(p.id, 'approve', currentUser.id); toast({ title: 'Approved' }); fetchPosts(); setPendingPosts(prev => prev.filter(x => x.id !== p.id)); }}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={async () => { await sdk.moderatePost(p.id, 'reject', currentUser.id); toast({ title: 'Rejected', variant: 'destructive' }); setPendingPosts(prev => prev.filter(x => x.id !== p.id)); }}>Reject</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Product attachments */}
            {availableProducts.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Attach Products (optional)</p>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {availableProducts.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newPost.productIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPost(prev => ({ ...prev, productIds: [...prev.productIds, p.id] }));
                          } else {
                            setNewPost(prev => ({ ...prev, productIds: prev.productIds.filter(id => id !== p.id) }));
                          }
                        }}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>)}

          {/* Create Post Modal */}
          {showCreatePost && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
                <Input
                  placeholder="Add tags (comma separated)"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
                <div className="flex space-x-2">
                  <Button onClick={handleCreatePost} disabled={!newPost.content.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading community posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something with the community!
                  </p>
                  {currentUser && (
                    <Button onClick={() => setShowCreatePost(true)}>
                      Create First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <CommunityPost key={post.id} post={post} />
              ))
            )}
          </div>

          {/* Comment Modal */}
          {selectedPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Comments</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPost(null)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Comment */}
                  {currentUser && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.userAvatar} />
                          <AvatarFallback>{comment.userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{comment.userName || 'Anonymous'}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
