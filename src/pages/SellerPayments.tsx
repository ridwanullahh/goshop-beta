import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  DollarSign, 
  CreditCard, 
  Building2 as Bank, 
  TrendingUp,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function SellerPayments() {
  const { sdk, currentUser } = useCommerce();
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'bank',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    bankName: ''
  });

  useEffect(() => {
    loadPaymentsData();
  }, [sdk, currentUser, timeRange]);

  const loadPaymentsData = async () => {
    if (!sdk || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Get orders for this seller
      const orders = await sdk.get('orders');
      const sellerOrders = orders.filter((order: any) => 
        order.items.some((item: any) => item.sellerId === currentUser.id)
      );

      // Calculate time range
      const now = new Date();
      const rangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                    timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                    90 * 24 * 60 * 60 * 1000;
      const rangeStart = new Date(now.getTime() - rangeMs);

      // Filter payments by time range
      const recentPayments = sellerOrders
        .filter((order: any) => new Date(order.createdAt) >= rangeStart)
        .map((order: any) => ({
          id: order.id,
          orderId: order.id,
          amount: order.total,
          status: order.paymentStatus || 'completed',
          method: order.paymentMethod || 'card',
          fee: order.total * 0.029, // 2.9% processing fee
          net: order.total * 0.971,
          date: order.createdAt,
          customerName: `${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || ''}`.trim() || 'Guest'
        }));

      setPayments(recentPayments);

      // Mock payouts data
      const mockPayouts = [
        {
          id: '1',
          amount: recentPayments.reduce((sum, p) => sum + p.net, 0),
          status: 'pending',
          date: new Date().toISOString(),
          method: 'Bank Transfer'
        }
      ];
      setPayouts(mockPayouts);

      // Mock payment methods
      setPaymentMethods([
        {
          id: '1',
          type: 'bank',
          accountNumber: '****1234',
          bankName: 'Chase Bank',
          isDefault: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load payments data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!newPaymentMethod.accountNumber || !newPaymentMethod.routingNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const methodData = {
        ...newPaymentMethod,
        sellerId: currentUser?.id,
        accountNumber: `****${newPaymentMethod.accountNumber.slice(-4)}`,
        createdAt: new Date().toISOString(),
        isDefault: paymentMethods.length === 0
      };

      const newMethod = await sdk.insert('payment_methods', methodData);
      setPaymentMethods([...paymentMethods, newMethod]);
      setNewPaymentMethod({
        type: 'bank',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        bankName: ''
      });
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const requestPayout = async () => {
    try {
      const availableBalance = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.net, 0);

      if (availableBalance <= 0) {
        toast.error('No available balance for payout');
        return;
      }

      const payoutData = {
        sellerId: currentUser?.id,
        amount: availableBalance,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        method: 'bank_transfer'
      };

      await sdk.insert('payouts', payoutData);
      toast.success('Payout requested successfully');
      loadPaymentsData();
    } catch (error) {
      console.error('Failed to request payout:', error);
      toast.error('Failed to request payout');
    }
  };

  const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalFees = payments.reduce((sum, payment) => sum + payment.fee, 0);
  const netEarnings = payments.reduce((sum, payment) => sum + payment.net, 0);
  const availableBalance = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.net, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-muted h-8 w-48 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
            <p className="text-xs text-muted-foreground">
              2.9% average rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              After fees deducted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Bank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
            <Button 
              size="sm" 
              className="mt-2"
              onClick={requestPayout}
              disabled={availableBalance <= 0}
            >
              Request Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Recent payments from your customers</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{payment.orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.customerName} • {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Net: {formatCurrency(payment.net)}
                        </p>
                        <Badge variant={
                          payment.status === 'completed' ? 'default' :
                          payment.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {payments.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Your payment history will appear here once you start receiving orders.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Track your withdrawals and bank transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Payout #{payout.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {payout.method} • {new Date(payout.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(payout.amount)}</p>
                      <Badge variant={
                        payout.status === 'completed' ? 'default' :
                        payout.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        <Clock className="h-3 w-3 mr-1" />
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {payouts.length === 0 && (
                  <div className="text-center py-8">
                    <Bank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No payouts yet</h3>
                    <p className="text-muted-foreground">
                      Request your first payout when you have available balance.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage how you receive payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bank className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{method.bankName}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'bank' ? 'Bank Account' : 'Card'} ending in {method.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
                
                {paymentMethods.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No payment methods</h3>
                    <p className="text-muted-foreground">
                      Add a payment method to receive payouts.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Payment Method</CardTitle>
                <CardDescription>Add a new bank account for payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={newPaymentMethod.accountHolderName}
                    onChange={(e) => setNewPaymentMethod({
                      ...newPaymentMethod,
                      accountHolderName: e.target.value
                    })}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={newPaymentMethod.bankName}
                    onChange={(e) => setNewPaymentMethod({
                      ...newPaymentMethod,
                      bankName: e.target.value
                    })}
                    placeholder="Chase Bank"
                  />
                </div>

                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={newPaymentMethod.routingNumber}
                    onChange={(e) => setNewPaymentMethod({
                      ...newPaymentMethod,
                      routingNumber: e.target.value
                    })}
                    placeholder="021000021"
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={newPaymentMethod.accountNumber}
                    onChange={(e) => setNewPaymentMethod({
                      ...newPaymentMethod,
                      accountNumber: e.target.value
                    })}
                    placeholder="1234567890"
                  />
                </div>

                <Button onClick={addPaymentMethod} className="w-full">
                  <Bank className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}