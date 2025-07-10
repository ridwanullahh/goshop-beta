import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  Star, 
  ThumbsUp,
  MessageCircle,
  Flag,
  Filter,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function SellerReviews() {
  const { sdk, currentUser } = useCommerce();
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadReviewsData();
  }, [sdk, currentUser]);

  const loadReviewsData = async () => {
    if (!sdk || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Get seller's products
      const productsData = await sdk.get('products');
      const sellerProducts = productsData.filter((product: any) => product.sellerId === currentUser.id);
      setProducts(sellerProducts);

      // Get reviews for seller's products
      const reviewsData = await sdk.get('reviews');
      const sellerReviews = reviewsData.filter((review: any) => 
        sellerProducts.some((product: any) => product.id === review.productId)
      );
      setReviews(sellerReviews);
    } catch (error) {
      console.error('Failed to load reviews data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToReview = async (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response?.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await sdk.update('reviews', reviewId, {
        sellerResponse: response.trim(),
        sellerResponseDate: new Date().toISOString()
      });
      
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, sellerResponse: response.trim(), sellerResponseDate: new Date().toISOString() }
          : review
      ));
      
      setResponseText({ ...responseText, [reviewId]: '' });
      toast.success('Response posted successfully');
    } catch (error) {
      console.error('Failed to respond to review:', error);
      toast.error('Failed to post response');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'positive') return review.rating >= 4;
    if (filter === 'negative') return review.rating <= 2;
    if (filter === 'unresponded') return !review.sellerResponse;
    return true;
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-muted h-8 w-48 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reviews</h1>

      {/* Reviews Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({reviews.length} reviews)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {products.length} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0 
                ? Math.round((reviews.filter(r => r.sellerResponse).length / reviews.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {reviews.filter(r => r.sellerResponse).length} responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-12">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Reviews' },
          { key: 'positive', label: 'Positive (4-5★)' },
          { key: 'negative', label: 'Negative (1-2★)' },
          { key: 'unresponded', label: 'Unresponded' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const product = products.find(p => p.id === review.productId);
          return (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.buyerName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.buyerName || 'Anonymous'}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant={review.rating >= 4 ? 'default' : review.rating <= 2 ? 'destructive' : 'secondary'}>
                            {review.rating}/5
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()} • {product?.name || 'Product'}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm leading-relaxed">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2">
                        {review.images.map((image: string, index: number) => (
                          <img
                            key={index}
                            src={image}
                            alt=""
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {/* Seller Response */}
                    {review.sellerResponse ? (
                      <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-l-primary">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Seller Response</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.sellerResponseDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{review.sellerResponse}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-muted-foreground">No response yet</span>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write a professional response to this review..."
                            value={responseText[review.id] || ''}
                            onChange={(e) => setResponseText({
                              ...responseText,
                              [review.id]: e.target.value
                            })}
                            rows={3}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleRespondToReview(review.id)}
                            disabled={!responseText[review.id]?.trim()}
                          >
                            Post Response
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? "You haven't received any reviews yet."
                  : `No ${filter} reviews found.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}