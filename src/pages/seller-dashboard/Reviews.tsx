import React, { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function Reviews() {
  const { sdk, user } = useCommerce();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      if (!sdk || !user) return;
      try {
        const allReviews = await sdk.get('reviews');
        const sellerReviews = allReviews.filter((r: any) => r.sellerId === user.id);
        setReviews(sellerReviews);
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [sdk, user]);

  if (loading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Product Reviews</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">on {review.productName}</p>
                      <p className="mt-2">{review.comment}</p>
                      <Button variant="link" className="p-0 h-auto mt-2">Reply</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}