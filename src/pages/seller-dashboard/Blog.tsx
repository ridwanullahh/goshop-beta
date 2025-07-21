import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useCommerce } from '../../context/CommerceContext';
import { Store, Blog as BlogType } from '../../lib/commerce-sdk';
import { BlogCms } from '../../components/BlogCms';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const SellerBlogManager = () => {
  const { sdk, user } = useCommerce();
  const [store, setStore] = useState<Store | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogType[]>([]);
  const [editingPost, setEditingPost] = useState<BlogType | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    const fetchStoreAndPosts = async () => {
      if (!sdk || !user) return;
      // Assuming one user is linked to one store for simplicity
      const stores = await sdk.getStores();
      const userStore = stores.find(s => s.sellerId === user.id);
      setStore(userStore || null);

      if (userStore) {
        const posts = await sdk.getStoreBlogPosts(userStore.id);
        setBlogPosts(posts);
      }
    };
    fetchStoreAndPosts();
  }, [sdk, user]);

  const handlePostSaved = (savedPost: BlogType) => {
    if (editingPost) {
      setBlogPosts(posts => posts.map(p => p.id === savedPost.id ? savedPost : p));
    } else {
      setBlogPosts(posts => [...posts, savedPost]);
    }
    setEditingPost(null);
    setIsCreatingNew(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!sdk) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await sdk.delete('blogs', postId);
        setBlogPosts(posts => posts.filter(p => p.id !== postId));
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  if (!store) {
    return <div>Loading store information...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blog Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setIsCreatingNew(true); setEditingPost(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Post
            </Button>
          </div>
          
          {isCreatingNew || editingPost ? (
            <BlogCms 
              storeId={store.id}
              postToEdit={editingPost}
              onPostSaved={handlePostSaved}
            />
          ) : (
            <div className="space-y-4">
              {blogPosts.map(post => (
                <Card key={post.id} className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Published on {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingPost(post); setIsCreatingNew(false); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {blogPosts.length === 0 && <p>No blog posts yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerBlogManager;