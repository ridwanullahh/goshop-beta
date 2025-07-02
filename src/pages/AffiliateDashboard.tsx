
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommerce } from '@/context/CommerceContext';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Link as LinkIcon,
  Copy,
  Eye,
  BarChart3
} from 'lucide-react';

export default function AffiliateDashboard() {
  const { sdk, currentUser } = useCommerce();
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    async function loadAffiliateData() {
      if (!sdk || !currentUser) return;
      
      try {
        const affiliate = await sdk.getAffiliate(currentUser.id);
        setAffiliateData(affiliate);
        
        // Load earnings and referrals data
        // This would be implemented with proper SDK methods
      } catch (error) {
        console.error('Failed to load affiliate data:', error);
      }
    }

    loadAffiliateData();
  }, [sdk, currentUser]);

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${currentUser?.id}`;
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
            <p className="text-muted-foreground">
              Track your referrals and earnings
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold">${affiliateData?.totalEarnings || 0}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Referrals</p>
                    <p className="text-2xl font-bold">{referrals.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Commission Rate</p>
                    <p className="text-2xl font-bold">{affiliateData?.commissionRate || 5}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">This Month</p>
                    <p className="text-2xl font-bold">$0</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}?ref=${currentUser?.id}`}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-muted"
                />
                <Button onClick={copyReferralLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analytics */}
          <Tabs defaultValue="earnings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="earnings">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings History</CardTitle>
                </CardHeader>
                <CardContent>
                  {earnings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No earnings yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start referring customers to earn commissions
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {earnings.map((earning, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{earning.description}</p>
                            <p className="text-sm text-muted-foreground">{earning.date}</p>
                          </div>
                          <Badge variant="secondary">+${earning.amount}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No referrals yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Share your referral link to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referrals.map((referral, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{referral.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {referral.joinDate}
                            </p>
                          </div>
                          <Badge>{referral.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Click-through Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Order Value</span>
                        <span className="font-medium">$0</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Clicks</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Conversions</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Earnings</span>
                        <span className="font-medium">$0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
