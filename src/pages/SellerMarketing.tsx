import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  Megaphone, 
  Target, 
  Mail, 
  Share2, 
  BarChart3,
  Calendar,
  Users,
  Zap,
  Gift,
  Percent
} from 'lucide-react';

export default function SellerMarketing() {
  const { sdk, currentUser } = useCommerce();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'promotion',
    description: '',
    budget: '',
    targetAudience: 'all',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    minOrderValue: '',
    maxUses: '',
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    loadMarketingData();
  }, [sdk, currentUser]);

  const loadMarketingData = async () => {
    if (!sdk || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Load marketing campaigns
      const campaignsData = await sdk.get('marketing_campaigns');
      const sellerCampaigns = campaignsData.filter((campaign: any) => 
        campaign.sellerId === currentUser.id
      );
      setCampaigns(sellerCampaigns);

      // Load coupons
      const couponsData = await sdk.get('coupons');
      const sellerCoupons = couponsData.filter((coupon: any) => 
        coupon.sellerId === currentUser.id
      );
      setCoupons(sellerCoupons);
    } catch (error) {
      console.error('Failed to load marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.description || !newCampaign.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const campaignData = {
        ...newCampaign,
        sellerId: currentUser?.id,
        budget: parseFloat(newCampaign.budget),
        createdAt: new Date().toISOString(),
        stats: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spent: 0
        }
      };

      await sdk.insert('marketing_campaigns', campaignData);
      toast.success('Campaign created successfully');
      setNewCampaign({
        name: '',
        type: 'promotion',
        description: '',
        budget: '',
        targetAudience: 'all',
        startDate: '',
        endDate: '',
        isActive: true
      });
      loadMarketingData();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.code || !newCoupon.value) {
      toast.error('Please fill in code and value');
      return;
    }

    try {
      const couponData = {
        ...newCoupon,
        sellerId: currentUser?.id,
        value: parseFloat(newCoupon.value),
        minOrderValue: newCoupon.minOrderValue ? parseFloat(newCoupon.minOrderValue) : 0,
        maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
        currentUses: 0,
        createdAt: new Date().toISOString()
      };

      await sdk.insert('coupons', couponData);
      toast.success('Coupon created successfully');
      setNewCoupon({
        code: '',
        type: 'percentage',
        value: '',
        description: '',
        minOrderValue: '',
        maxUses: '',
        expiryDate: '',
        isActive: true
      });
      loadMarketingData();
    } catch (error) {
      console.error('Failed to create coupon:', error);
      toast.error('Failed to create coupon');
    }
  };

  const toggleCampaignStatus = async (campaignId: string, isActive: boolean) => {
    try {
      await sdk.update('marketing_campaigns', campaignId, { isActive });
      toast.success(`Campaign ${isActive ? 'activated' : 'deactivated'}`);
      loadMarketingData();
    } catch (error) {
      console.error('Failed to update campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      await sdk.update('coupons', couponId, { isActive });
      toast.success(`Coupon ${isActive ? 'activated' : 'deactivated'}`);
      loadMarketingData();
    } catch (error) {
      console.error('Failed to update coupon:', error);
      toast.error('Failed to update coupon');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-muted h-8 w-48 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Marketing</h1>

      {/* Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length} total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.filter(c => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {coupons.length} total coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${campaigns.reduce((sum, c) => sum + (c.stats?.spent || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>Manage your promotional campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                          {campaign.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={campaign.isActive}
                          onCheckedChange={(checked) => toggleCampaignStatus(campaign.id, checked)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">${campaign.budget}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-medium">${campaign.stats?.spent || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Impressions</p>
                        <p className="font-medium">{campaign.stats?.impressions || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-medium">{campaign.stats?.clicks || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No campaigns created yet. Create your first campaign to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardHeader>
              <CardTitle>Discount Coupons</CardTitle>
              <CardDescription>Manage your discount codes and promotions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Badge variant="outline">
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={(checked) => toggleCouponStatus(coupon.id, checked)}
                        />
                      </div>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Min Order</p>
                        <p className="font-medium">${coupon.minOrderValue || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uses</p>
                        <p className="font-medium">
                          {coupon.currentUses || 0}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium">
                          {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(coupon.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No coupons created yet. Create your first coupon to offer discounts.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Campaign */}
            <Card>
              <CardHeader>
                <CardTitle>Create Campaign</CardTitle>
                <CardDescription>Launch a new marketing campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="Summer Sale 2024"
                  />
                </div>

                <div>
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      <SelectItem value="product_launch">Product Launch</SelectItem>
                      <SelectItem value="retargeting">Retargeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="campaignDescription">Description</Label>
                  <Textarea
                    id="campaignDescription"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    placeholder="Describe your campaign goals and message"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="campaignBudget">Budget ($)</Label>
                  <Input
                    id="campaignBudget"
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                    placeholder="100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={createCampaign} className="w-full">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Create Coupon */}
            <Card>
              <CardHeader>
                <CardTitle>Create Coupon</CardTitle>
                <CardDescription>Create a new discount coupon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <Input
                    id="couponCode"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    placeholder="SUMMER20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="couponType">Type</Label>
                    <Select value={newCoupon.type} onValueChange={(value) => setNewCoupon({...newCoupon, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="couponValue">Value</Label>
                    <Input
                      id="couponValue"
                      type="number"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
                      placeholder={newCoupon.type === 'percentage' ? '20' : '10'}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="couponDescription">Description (Optional)</Label>
                  <Input
                    id="couponDescription"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                    placeholder="Summer discount for all items"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrderValue">Min Order Value ($)</Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      value={newCoupon.minOrderValue}
                      onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxUses">Max Uses</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={newCoupon.maxUses}
                      onChange={(e) => setNewCoupon({...newCoupon, maxUses: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newCoupon.expiryDate}
                    onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                  />
                </div>

                <Button onClick={createCoupon} className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}