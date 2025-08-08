import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Wallet as WalletIcon,
  Download,
  Upload,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function Wallet() {
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    routingNumber: ''
  });

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    if (!sdk || !currentUser) return;

    try {
      const [walletData, transactionsData, withdrawalsData] = await Promise.all([
        sdk.getUserWallet(currentUser.id),
        sdk.getData('transactions'),
        sdk.getWithdrawalRequests(currentUser.id)
      ]);

      setWallet(walletData);
      setTransactions(transactionsData.filter((t: any) => t.walletId === walletData.id));
      setWithdrawalRequests(withdrawalsData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdk || !currentUser || !wallet) return;

    const amount = parseFloat(withdrawalForm.amount);
    
    if (amount <= 0 || amount > wallet.balance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your available balance.",
        variant: "destructive"
      });
      return;
    }

    try {
      const withdrawalData = {
        userId: currentUser.id,
        userType: currentUser.role === 'affiliate' ? 'affiliate' : 'customer',
        amount,
        bankDetails: {
          accountName: withdrawalForm.accountName,
          accountNumber: withdrawalForm.accountNumber,
          bankName: withdrawalForm.bankName,
          routingNumber: withdrawalForm.routingNumber
        }
      };

      await sdk.createWithdrawalRequest(withdrawalData);
      
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully!"
      });

      setShowWithdrawalForm(false);
      setWithdrawalForm({
        amount: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        routingNumber: ''
      });
      
      loadWalletData();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: AlertCircle, label: 'Rejected' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      failed: { variant: 'destructive' as const, icon: X, label: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? TrendingUp : TrendingDown;
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Wallet</h1>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">
              Manage your wallet balance and withdrawal requests
            </p>
          </div>

          {/* Wallet Balance Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <WalletIcon className="h-6 w-6" />
                    <span className="text-lg font-medium">Available Balance</span>
                  </div>
                  <p className="text-4xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</p>
                  <p className="text-blue-100 mt-2">
                    Last updated: {wallet?.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <Button
                    variant="secondary"
                    onClick={() => setShowWithdrawalForm(true)}
                    disabled={!wallet?.balance || wallet.balance <= 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          {showWithdrawalForm && (
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={wallet?.balance || 0}
                        value={withdrawalForm.amount}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available: ${wallet?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">Account Holder Name</Label>
                      <Input
                        id="accountName"
                        value={withdrawalForm.accountName}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, accountName: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bankName"
                          value={withdrawalForm.bankName}
                          onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bankName: e.target.value }))}
                          placeholder="Bank of America"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={withdrawalForm.accountNumber}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="1234567890"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={withdrawalForm.routingNumber}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                        placeholder="021000021"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowWithdrawalForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Withdrawal Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              {transactions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">
                      Your transaction history will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                transactions.map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type);
                  const colorClass = getTransactionColor(transaction.type);
                  
                  return (
                    <Card key={transaction.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-medium">{transaction.description}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(transaction.createdAt).toLocaleDateString()}
                                {getStatusBadge(transaction.status)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${colorClass}`}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </p>
                            {transaction.orderId && (
                              <p className="text-xs text-muted-foreground">
                                Order #{transaction.orderId.slice(-8)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-4">
              {withdrawalRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No withdrawal requests</h3>
                    <p className="text-muted-foreground">
                      You haven't made any withdrawal requests yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                withdrawalRequests.map((withdrawal) => (
                  <Card key={withdrawal.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Withdrawal Request #{withdrawal.id.slice(-8)}</h3>
                          <p className="text-2xl font-bold text-green-600">${withdrawal.amount.toFixed(2)}</p>
                        </div>
                        {getStatusBadge(withdrawal.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Bank:</span>
                          <p className="text-muted-foreground">{withdrawal.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <span className="font-medium">Account:</span>
                          <p className="text-muted-foreground">
                            ****{withdrawal.bankDetails.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span>
                          <p className="text-muted-foreground">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {withdrawal.processedAt && (
                          <div>
                            <span className="font-medium">Processed:</span>
                            <p className="text-muted-foreground">
                              {new Date(withdrawal.processedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {withdrawal.adminNotes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <span className="font-medium">Admin Notes:</span>
                          <p className="text-sm text-muted-foreground mt-1">{withdrawal.adminNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
