
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, Store, Clock, BookOpen } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

export default function BlogSingle() {
  const { slug } = useParams();
  const { sdk } = useCommerce();
  const [post, setPost] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    loadBlogPost();
  }, [slug]);

  const loadBlogPost = async () => {
    if (!sdk || !slug) return;

    try {
      const blogs = await sdk.getBlogs();
      const foundPost = blogs.find(blog => blog.slug === slug && blog.isPublished);

      if (foundPost) {
        setPost(foundPost);

        // If it's a store post, load store information
        if (foundPost.storeId) {
          const storeInfo = await sdk.getStore(foundPost.storeId);
          setStore(storeInfo);
        }

        // Load related posts
        const related = blogs
          .filter(blog =>
            blog.id !== foundPost.id &&
            blog.isPublished &&
            (blog.category === foundPost.category || blog.storeId === foundPost.storeId)
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          
          <article className="prose prose-lg max-w-none">
            <div className="flex items-center gap-2 mb-4">
              {post.category && (
                <Badge variant="secondary">{post.category}</Badge>
              )}
              {store && (
                <Badge variant="outline" className="text-xs">
                  <Store className="h-3 w-3 mr-1" />
                  {store.name}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {Math.ceil(post.content.split(' ').length / 200)} min read
              </div>
            </div>

            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-lg mb-8"
              />
            )}

            {/* Store Information Banner */}
            {store && (
              <Card className="mb-8 bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">About {store.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {store.description}
                      </p>
                      <Link to={`/${store.slug}`}>
                        <Button variant="outline" size="sm">
                          Visit Store
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: post.content.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {relatedPost.category && (
                          <Badge variant="secondary" className="text-xs">
                            {relatedPost.category}
                          </Badge>
                        )}
                        {relatedPost.storeId && (
                          <Badge variant="outline" className="text-xs">
                            <Store className="h-3 w-3 mr-1" />
                            Store
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 100) + '...'}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        {relatedPost.author}
                        <span className="mx-2">•</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(relatedPost.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
