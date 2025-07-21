import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCommerce } from '../context/CommerceContext';
import { Blog } from '../lib/commerce-sdk';
import { useToast } from '../hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BlogCmsProps {
  storeId: string;
  postToEdit?: Blog | null;
  onPostSaved: (post: Blog) => void;
}

export const BlogCms: React.FC<BlogCmsProps> = ({ storeId, postToEdit, onPostSaved }) => {
  const { sdk, user } = useCommerce();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setSlug(postToEdit.slug);
    } else {
      setTitle('');
      setContent('');
      setSlug('');
    }
  }, [postToEdit]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdk || !user || !storeId) return;

    setIsSubmitting(true);
    try {
      let imageUrl = postToEdit?.featuredImage || '';
      if (featuredImage) {
        // In a real app, you would upload the image to a service like Cloudinary
        // and get the URL. For now, we'll simulate this.
        console.log("Uploading image...", featuredImage.name);
        // imageUrl = await sdk.uploadFile(featuredImage); 
        imageUrl = URL.createObjectURL(featuredImage); // Placeholder
      }

      const postData = {
        title,
        content,
        slug,
        storeId,
        authorId: user.id,
        authorName: user.name,
        authorType: 'store' as 'store',
        featuredImage: imageUrl,
        isPublished: true, // Or add a toggle for draft/published status
      };

      let savedPost;
      if (postToEdit) {
        savedPost = await sdk.update('blogs', postToEdit.id, postData);
      } else {
        // savedPost = await sdk.createBlog(postData);
        const blogs = await sdk.get('blogs');
        savedPost = { ...postData, id: String(blogs.length + 1), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        await sdk.saveData('blogs', [...blogs, savedPost]);
      }
      
      toast({ title: "Success", description: `Blog post ${postToEdit ? 'updated' : 'created'} successfully.` });
      onPostSaved(savedPost);
    } catch (error) {
      console.error("Failed to save post:", error);
      toast({ title: "Error", description: "Failed to save blog post.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{postToEdit ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title">Title</label>
            <Input id="title" value={title} onChange={handleTitleChange} placeholder="Post title" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug">URL Slug</label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="content">Content</label>
            {/* Replace this with a rich text editor like Tiptap or TinyMCE for a real app */}
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post here..."
              className="w-full p-2 border rounded-md min-h-[200px]"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="featuredImage">Featured Image</label>
            <Input id="featuredImage" type="file" onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)} accept="image/*" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {postToEdit ? 'Save Changes' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};