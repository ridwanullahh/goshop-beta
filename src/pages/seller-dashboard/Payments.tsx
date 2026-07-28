import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

export default function Payments() {
  const { sdk, currentUser } = useCommerce();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const [w, allOrders] = await Promise.all([
          sdk.getWallet(currentUser.id),
          sdk.getOrders(),
        ]);
        if (active) {
          setWallet(w);
          setOrders((allOrders || []).filter((o: any) => o.sellerId === currentUser.id));
          if (w) {
            const txns = await sdk.getWalletTransactions(w.id);
            setTransactions(txns || []);
          }
        }
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [currentUser]);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>;

  const totalEarnings = orders.filter(o => o.paymentStatus === 'completed').reduce((s, o) => s + (o.total || 0), 0);
  const pendingPayouts = orders.filter(o => o.paymentStatus === 'pending').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Wallet className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold">${(wallet?.balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <ArrowDownCircle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">${pendingPayouts.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          {transactions.length ? (
            <div className="space-y-2">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    {t.type === 'credit' ? <ArrowUpCircle className="h-5 w-5 text-emerald-600" /> : <ArrowDownCircle className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="text-sm font-medium">{t.description || t.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'credit' ? '+' : '-'}${(t.amount || 0).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs capitalize">{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No transactions yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Paid Orders</CardTitle></CardHeader>
        <CardContent>
          {orders.filter(o => o.paymentStatus === 'completed').length ? (
            <div className="space-y-2">
              {orders.filter(o => o.paymentStatus === 'completed').map(o => (
                <div key={o.id} className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">#{o.id?.slice(-8)}</span>
                  <Badge variant="outline" className="capitalize">{o.paymentMethod}</Badge>
                  <span className="font-medium">${(o.total || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No paid orders yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
