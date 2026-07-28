import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

export default function Reviews() {
  const { sdk, currentUser } = useCommerce();
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const prods = await sdk.getSellerProducts(currentUser.id);
        if (active) setProducts(prods || []);
        const all: any[] = [];
        await Promise.all((prods || []).map(async (p: any) => {
          try {
            const r = await sdk.getProductReviews(p.id);
            all.push(...(r || []).map((rev: any) => ({ ...rev, productName: p.name })));
          } catch {}
        }));
        if (active) setReviews(all);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [currentUser]);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{reviews.length}</p>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold flex items-center justify-center gap-1">{avgRating}<Star className="h-4 w-4 text-amber-500 fill-amber-500" /></p>
          <p className="text-sm text-muted-foreground">Average Rating</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{reviews.filter(r => r.isVerified).length}</p>
          <p className="text-sm text-muted-foreground">Verified</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Customer Reviews</CardTitle></CardHeader>
        <CardContent>
          {reviews.length ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.userName}</span>
                      {r.isVerified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < (r.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{r.productName}</p>
                  {r.title && <p className="font-medium text-sm">{r.title}</p>}
                  {r.content && <p className="text-sm">{r.content}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No reviews yet. Reviews appear here when customers review your products.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
