
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
import { toast } from 'sonner';
import { Post, Comment } from '@/lib/commerce-sdk';
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
  const { currentUser, sdk } = useCommerce();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', tags: '' });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [sdk]);

  const fetchPosts = async () => {
    if (!sdk) return;
    
    setLoading(true);
    try {
      const fetchedPosts = await sdk.getPosts();
      setPosts(fetchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!sdk || !currentUser || !newPost.content.trim()) return;

    try {
      const postData = {
        userId: currentUser.id!,
        userName: currentUser.name || currentUser.email,
        userAvatar: currentUser.avatar || '',
        content: newPost.content,
        likes: 0,
        comments: 0,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString()
      };

      await sdk.createPost(postData);
      toast.success('Post created successfully');
      setNewPost({ content: '', tags: '' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId: string, currentLikes: number, isLiked?: boolean) => {
    if (!sdk || !currentUser) {
      toast.error('Please login to like posts');
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
      toast.error('Failed to like post');
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

      toast.success('Comment added successfully');
      setNewComment('');
      fetchComments(selectedPost.id!);
      fetchPosts(); // Refresh to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
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
          {currentUser && (
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
          )}

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
                <Card key={post.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={post.userAvatar} />
                        <AvatarFallback>{post.userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{post.userName || 'Anonymous'}</h3>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id!, post.likes, post.isLiked)}
                            className={post.isLiked ? 'text-red-500' : ''}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              fetchComments(post.id!);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
