import React, { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign } from 'lucide-react';

export default function Payments() {
  const { sdk, user } = useCommerce();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      if (!sdk || !user) return;
      try {
        const paymentsData = await sdk.get('payments');
        const sellerPayments = paymentsData.filter((p: any) => p.sellerId === user.id);
        const currentBalance = sellerPayments.reduce((acc: number, p: any) => acc + p.amount, 0);
        setBalance(currentBalance);
        setTransactions(sellerPayments);
      } catch (error) {
        console.error("Failed to load payments", error);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, [sdk, user]);

  if (loading) {
    return <div className="text-center py-12">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-4xl font-bold">${balance.toFixed(2)}</div>
          <Button>
            <DollarSign className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>${t.amount.toFixed(2)}</TableCell>
                  <TableCell>{t.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}