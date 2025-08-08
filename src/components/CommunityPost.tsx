import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Post } from '@/lib/commerce-sdk';

interface CommunityPostProps {
  post: Post;
}

export default function CommunityPost({ post }: CommunityPostProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback>{post.userName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.userName}</p>
            <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.images.map((image, index) => (
              <img key={index} src={image} alt={`Post image ${index + 1}`} className="rounded-lg object-cover" />
            ))}
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <Button variant="ghost" size="sm">
            <Heart className="h-4 w-4 mr-2" />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.comments}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}