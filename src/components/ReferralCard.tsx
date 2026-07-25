import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import { Gift, Copy, Share2, Users, MousePointerClick, Wallet, TrendingUp } from 'lucide-react';

// Inherent referral card — every user type has a referral code (no standalone referral account).
// BismiLLAH Ar-Rahman Ar-Roheem. Uses GET /api/referral.
export function ReferralCard() {
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!currentUser) return;
      try {
        const res = await sdk.getReferral();
        if (active) setData(res);
      } catch (e) {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [currentUser?.id]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied`, description: text });
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' });
    }
  };

  const share = async () => {
    if (!data?.referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join me on GoShop', url: data.referralLink });
      } catch {}
    } else {
      copy(data.referralLink, 'Referral link');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { icon: MousePointerClick, label: 'Link clicks', value: data?.clicks ?? 0 },
    { icon: Users, label: 'Signups', value: data?.signups ?? 0 },
    { icon: TrendingUp, label: 'Referrals', value: data?.referralCount ?? 0 },
    { icon: Wallet, label: 'Earnings', value: `$${(data?.earnings ?? 0).toFixed(2)}` },
  ];

  return (
    <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900/40">
      <CardHeader className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5" />
          Refer & Earn
        </CardTitle>
        <p className="text-sm text-emerald-50">
          Share your referral link. Earn rewards when friends sign up and shop.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border bg-muted/40 p-3 text-center">
              <s.icon className="mx-auto mb-1 h-4 w-4 text-emerald-600" />
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your referral code</label>
          <div className="flex gap-2">
            <Input readOnly value={data?.code || ''} className="font-mono" />
            <Button variant="outline" size="icon" onClick={() => copy(data?.code || '', 'Code')} aria-label="Copy code">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your referral link</label>
          <div className="flex gap-2">
            <Input readOnly value={data?.referralLink || ''} className="text-xs" />
            <Button variant="outline" size="icon" onClick={() => copy(data?.referralLink || '', 'Link')} aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button onClick={share} className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Share2 className="mr-2 h-4 w-4" /> Share your link
        </Button>

        {data?.referrals?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Your referrals</h4>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {data.referrals.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium">{r.name || r.email}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReferralCard;
