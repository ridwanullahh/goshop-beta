import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommerce } from '@/context/CommerceContext';
import { useEnhancedRealTime } from '@/context/EnhancedRealTimeContext';
import { toast } from 'sonner';
import { 
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Building,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  reference?: string;
}

interface WalletData {
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalSpent: number;
  transactions: Transaction[];
}

export default function MyWallet() {
  const { currentUser, sdk } = useCommerce();
  const { subscribe, forceRefresh } = useEnhancedRealTime();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    totalSpent: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [transactionFilter, setTransactionFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      loadWalletData();
      const unsubscribe = subscribe('wallets', () => {
        loadWalletData();
      });
      return unsubscribe;
    }
  }, [currentUser]);

  const loadWalletData = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      // Get wallet data
      const wallets = await sdk.get('wallets');
      const wallet = wallets.find((w: any) => w.userId === currentUser.id);
      
      // Get transactions
      const allTransactions = await sdk.get<Transaction>('transactions');
      const transactions = allTransactions.filter((t: Transaction) => t.reference === currentUser.id)
        .sort((a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const balance = wallet?.balance || 0;
      const pendingBalance = wallet?.pendingBalance || 0;
      
      // Calculate totals
      const totalEarnings = transactions
        .filter(t => t.type === 'credit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalSpent = transactions
        .filter(t => t.type === 'debit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      setWalletData({
        balance,
        pendingBalance,
        totalEarnings,
        totalSpent,
        transactions
      });
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amount = Number(topUpAmount);
      
      // Create transaction
      const newTransaction = {
        type: 'credit',
        amount,
        description: `Wallet top-up via ${selectedPaymentMethod}`,
        status: 'pending',
        reference: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      
      // Simple mock transaction creation since we're using basic SDK
      const allTransactions = await sdk.get('transactions');
      const transactionId = (allTransactions.length + 1).toString();
      allTransactions.push({ ...newTransaction, id: transactionId });
      
      // Update wallet balance
      const wallets = await sdk.get('wallets');
      const existingWallet = wallets.find((w: any) => w.userId === currentUser?.id);
      
      if (existingWallet) {
        existingWallet.balance = (existingWallet.balance || 0) + amount;
      } else {
        const newWallet = {
          id: (wallets.length + 1).toString(),
          userId: currentUser?.id,
          balance: amount,
          pendingBalance: 0
        };
        wallets.push(newWallet);
      }

      toast.success(`Successfully added $${amount} to your wallet`);
      setTopUpAmount('');
      await loadWalletData();
    } catch (error) {
      console.error('Top-up failed:', error);
      toast.error('Failed to top up wallet');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = Number(withdrawAmount);
    if (amount > walletData.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      // Simple mock transaction for withdrawal
      const allTransactions = await sdk.get('transactions');
      const transactionId = (allTransactions.length + 1).toString();
      const newTransaction = {
        id: transactionId,
        type: 'debit',
        amount,
        description: `Wallet withdrawal via ${selectedPaymentMethod}`,
        status: 'completed',
        reference: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      allTransactions.push(newTransaction);

      // Update wallet balance
      const wallets = await sdk.get('wallets');
      const existingWallet = wallets.find((w: any) => w.userId === currentUser?.id);
      if (existingWallet) {
        existingWallet.balance = walletData.balance - amount;
      }

      toast.success(`Successfully withdrew $${amount} from your wallet`);
      setWithdrawAmount('');
      await loadWalletData();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Failed to withdraw from wallet');
    }
  };

  const filteredTransactions = walletData.transactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? 
      <ArrowDownLeft className="h-4 w-4 text-green-500" /> : 
      <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to access your wallet</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/customer-dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">My Wallet</h1>
                <p className="text-muted-foreground">Manage your funds and transactions</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => forceRefresh(['wallets', 'transactions'])}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">Available Balance</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold">
                  {balanceVisible ? `$${walletData.balance.toFixed(2)}` : '****'}
                </span>
              </div>
              {walletData.pendingBalance > 0 && (
                <p className="text-sm text-muted-foreground">
                  + ${walletData.pendingBalance.toFixed(2)} pending
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">
                    ${walletData.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-red-600">
                    ${walletData.totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-500" />
                <span>Top Up Wallet</span>
              </CardTitle>
              <CardDescription>Add funds to your wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topup-amount">Amount</Label>
                <Input
                  id="topup-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label>Payment Method</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="apple_pay">Apple Pay</SelectItem>
                    <SelectItem value="google_pay">Google Pay</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleTopUp}
                disabled={!topUpAmount}
              >
                <Plus className="h-4 w-4 mr-2" />
                Top Up ${topUpAmount || '0.00'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Minus className="h-5 w-5 text-red-500" />
                <span>Withdraw Funds</span>
              </CardTitle>
              <CardDescription>Transfer funds to your bank account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={walletData.balance}
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ${walletData.balance.toFixed(2)}
                </p>
              </div>
              
              <div>
                <Label>Withdrawal Method</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || Number(withdrawAmount) > walletData.balance}
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw ${withdrawAmount || '0.00'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <span className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}