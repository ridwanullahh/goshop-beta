import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Gift, Share2, TrendingUp } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Link } from 'react-router-dom';

export default function Marketing() {
  const { sdk, currentUser } = useCommerce();
  const [products, setProducts] = useState<any[]>([]);
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const [prods, ref] = await Promise.all([
          sdk.getSellerProducts(currentUser.id),
          sdk.getReferral().catch(() => null),
        ]);
        if (active) { setProducts(prods || []); setReferral(ref); }
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [currentUser]);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>;

  const affiliateProducts = products.filter(p => p.affiliateEnabled);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Gift className="h-8 w-8 text-emerald-600" />
              <div>
                <h3 className="font-semibold">Referral Program</h3>
                <p className="text-sm text-muted-foreground">Share your link and earn rewards.</p>
              </div>
            </div>
            {referral ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">{referral.referralLink || referral.code}</code>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(referral.referralLink || referral.code)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Clicks: {referral.clicks || 0}</span>
                  <span>Signups: {referral.signups || 0}</span>
                  <span>Earnings: ${(referral.earnings || 0).toFixed(2)}</span>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">Referral data unavailable.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Megaphone className="h-8 w-8 text-amber-500" />
              <div>
                <h3 className="font-semibold">Affiliate Products</h3>
                <p className="text-sm text-muted-foreground">Products with affiliate commission enabled.</p>
              </div>
            </div>
            <p className="text-2xl font-bold">{affiliateProducts.length}</p>
            <p className="text-sm text-muted-foreground">of {products.length} products</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Affiliate-Enabled Products</CardTitle></CardHeader>
        <CardContent>
          {affiliateProducts.length ? (
            <div className="space-y-2">
              {affiliateProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <Badge variant="outline" className="ml-2">{p.affiliateCommission || 0}% commission</Badge>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/product/${p.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No affiliate-enabled products. Enable affiliate commission on your products to boost sales.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
