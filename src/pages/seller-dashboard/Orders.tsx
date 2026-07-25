import React, { useEffect, useState } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SellerOrders() {
  const { currentUser, sdk } = useCommerce();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!sdk || !currentUser) return;
      try {
        const all = await sdk.getOrders(currentUser.id);
        setOrders(all.filter((o: any) => o.sellerId === currentUser.id));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sdk, currentUser]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? 'Loading...' : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>#{o.id.slice(-8)}</TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Badge>{o.status}</Badge></TableCell>
                    <TableCell>${o.total?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
