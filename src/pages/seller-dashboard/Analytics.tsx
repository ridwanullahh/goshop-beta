import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Package, ShoppingCart, Star } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

export default function Analytics() {
  const { sdk, currentUser } = useCommerce();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const [products, orders, analytics] = await Promise.all([
          sdk.getSellerProducts(currentUser.id),
          sdk.getOrders(),
          sdk.getSellerAnalytics(currentUser.id),
        ]);
        const sellerOrders = (orders || []).filter((o: any) => o.sellerId === currentUser.id);
        const totalRevenue = sellerOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);
        const totalUnits = sellerOrders.reduce((s: number, o: any) =>
          s + (o.items || []).reduce((ss: number, i: any) => ss + (i.quantity || 0), 0), 0);
        const avgRating = (products || []).reduce((s: number, p: any) => s + (p.rating || 0), 0) / (products?.length || 1);
        if (active) setData({ products: products || [], orders: sellerOrders, analytics, totalRevenue, totalUnits, avgRating });
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [currentUser]);

  if (loading) return <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>;

  const stats = [
    { label: 'Total Revenue', value: `$${(data?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Orders', value: data?.orders?.length || 0, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Products', value: data?.products?.length || 0, icon: Package, color: 'text-purple-600' },
    { label: 'Avg Rating', value: (data?.avgRating || 0).toFixed(1), icon: Star, color: 'text-amber-500' },
    { label: 'Units Sold', value: data?.totalUnits || 0, icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'AOV', value: `$${data?.orders?.length ? (data.totalRevenue / data.orders.length).toFixed(2) : '0.00'}`, icon: DollarSign, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Top Products by Sales</CardTitle></CardHeader>
        <CardContent>
          {data?.products?.length ? (
            <div className="space-y-2">
              {[...data.products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 10).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-sm text-muted-foreground">{p.soldCount || 0} sold</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No products yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {data?.orders?.length ? (
            <div className="space-y-2">
              {data.orders.slice(0, 10).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">#{o.id?.slice(-8)}</span>
                  <span className="text-sm capitalize">{o.status}</span>
                  <span className="text-sm font-medium">${(o.total || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No orders yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
