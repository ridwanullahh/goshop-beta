import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommerce } from '@/context/CommerceContext';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  delivered: 'default',
  shipped: 'secondary',
  processing: 'outline',
  pending: 'outline',
  cancelled: 'destructive',
  confirmed: 'secondary',
};

export default function Orders() {
  const { sdk, currentUser } = useCommerce();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    let active = true;
    (async () => {
      try {
        const data = await sdk.getOrders();
        if (active) setOrders(data || []);
      } catch (e) {
        console.error('Error loading orders:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [currentUser]);

  const fmtPrice = (n: number) => `$${(n || 0).toFixed(2)}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
            </div>
          ) : !currentUser ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Please log in</h2>
                <p className="text-muted-foreground mb-4">Log in to view your orders.</p>
                <Button asChild><Link to="/login">Login</Link></Button>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-4">You haven't placed any orders. Start shopping!</p>
                <Button asChild><Link to="/products">Browse Products</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id?.slice(-8)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Placed on {fmtDate(order.createdAt)}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANTS[order.status] || 'outline'} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                          <p className="text-sm text-muted-foreground">Total: {fmtPrice(order.total)}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/order/${order.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                    {order.items?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item: any, i: number) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                            {item.name?.slice(0, 30)}{item.name?.length > 30 ? '...' : ''} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
