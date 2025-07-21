import React, { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wallet, Transaction } from '@/lib/commerce-sdk';
import { toast } from 'sonner';
import { ArrowLeft, Plus, DollarSign, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyWallet() {
  const { currentUser, sdk } = useCommerce();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWallet() {
      if (!currentUser || !sdk) return;
      try {
        let userWallet = await sdk.getWallet(currentUser.id);
        if (!userWallet) {
          userWallet = await sdk.createWallet(currentUser.id);
        }
        setWallet(userWallet);
        const userTransactions = await sdk.getWalletTransactions(currentUser.id);
        setTransactions(userTransactions);
      } catch (error) {
        toast.error('Failed to load wallet information');
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, [currentUser, sdk]);

  const handleFundWallet = async (paymentGateway: string) => {
    // This would typically open a payment modal
    if (!currentUser || !sdk) return;
    const amount = prompt('Enter amount to fund:');
    if (amount && !isNaN(parseFloat(amount))) {
      try {
        await sdk.fundWallet(currentUser.id, parseFloat(amount), 'Wallet funding', paymentGateway);
        toast.success('Wallet funded successfully');
        // Refresh wallet data
        const userWallet = await sdk.getWallet(currentUser.id);
        setWallet(userWallet);
        const userTransactions = await sdk.getWalletTransactions(currentUser.id);
        setTransactions(userTransactions);
      } catch (error) {
        toast.error('Failed to fund wallet');
      }
    } else {
      toast.error('Invalid amount');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading wallet...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Wallet</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Balance</span>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${wallet?.balance.toFixed(2)}</p>
                <div className="space-y-2 mt-6">
                  <Button className="w-full" onClick={() => handleFundWallet('Paystack')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Fund with Paystack
                  </Button>
                  <Button className="w-full" onClick={() => handleFundWallet('PayPal')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Fund with PayPal
                  </Button>
                  <Button className="w-full" onClick={() => handleFundWallet('Flutterwave')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Fund with Flutterwave
                  </Button>
                  <Button className="w-full" onClick={() => handleFundWallet('Razorpay')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Fund with Razorpay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Transaction History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <ul className="space-y-4">
                    {transactions.map(tx => (
                      <li key={tx.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}