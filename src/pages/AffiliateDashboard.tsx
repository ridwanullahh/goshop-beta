
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Link2,
  Eye,
  Copy,
  Share2,
  BarChart3,
  Calendar,
  Clock,
  MousePointer,
  ShoppingCart,
  Star,
  Plus,
  Instagram,
  Twitter,
  Youtube,
  MapPin
} from 'lucide-react';

export default function AffiliateDashboard() {
  const { currentUser, sdk } = useCommerce();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [newLinkForm, setNewLinkForm] = useState({
    productId: '',
    campaignName: '',
    customMessage: ''
  });

  const [showCreateLink, setShowCreateLink] = useState(false);

  useEffect(() => {
    if (currentUser && sdk) {
      fetchAffiliateData();
    }
  }, [currentUser, sdk]);

  const fetchAffiliateData = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      const [
        affiliateData,
        linksData,
        commissionsData,
        productsData
      ] = await Promise.all([
        sdk.getAffiliate(currentUser.id),
        sdk.getAffiliateLinks(currentUser.id),
        sdk.getCommissions(currentUser.id),
        sdk.getProducts()
      ]);

      setAffiliate(affiliateData);
      setAffiliateLinks(linksData);
      setCommissions(commissionsData);
      setProducts(productsData);

      // Calculate analytics
      const totalClicks = linksData.reduce((sum: number, link: any) => sum + link.clicks, 0);
      const totalConversions = linksData.reduce((sum: number, link: any) => sum + link.conversions, 0);
      const totalEarnings = commissionsData.reduce((sum: number, comm: any) => sum + comm.amount, 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      setAnalytics({
        totalEarnings,
        totalClicks,
        totalConversions,
        conversionRate,
        pendingCommissions: commissionsData.filter((c: any) => c.status === 'pending').length,
        activeLinks: linksData.length
      });

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAffiliateLink = async () => {
    if (!sdk || !currentUser || !newLinkForm.productId) return;

    try {
      const product = products.find((p: any) => p.id === newLinkForm.productId);
      if (!product) {
        toast.error('Product not found');
        return;
      }

      const linkData = {
        affiliateId: currentUser.id,
        productId: newLinkForm.productId,
        url: `${window.location.origin}/product/${newLinkForm.productId}?ref=${currentUser.id}`,
        campaignName: newLinkForm.campaignName || product.name,
        customMessage: newLinkForm.customMessage
      };

      await sdk.createAffiliateLink(linkData);
      toast.success('Affiliate link created successfully');
      setNewLinkForm({ productId: '', campaignName: '', customMessage: '' });
      setShowCreateLink(false);
      fetchAffiliateData();
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      toast.error('Failed to create affiliate link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'links', label: 'Affiliate Links', icon: Link2 },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
    { id: 'products', label: 'Products', icon: ShoppingCart },
    { id: 'marketing', label: 'Marketing Tools', icon: Share2 },
    { id: 'profile', label: 'Profile', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">Manage your affiliate marketing and earnings</p>
        </div>

        {/* Mobile Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(item.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.totalEarnings?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalClicks || 0}</div>
                  <p className="text-xs text-muted-foreground">Link clicks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalConversions || 0}</div>
                  <p className="text-xs text-muted-foreground">Successful sales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.conversionRate?.toFixed(1) || '0.0'}%</div>
                  <p className="text-xs text-muted-foreground">Click to sale</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Performance</CardTitle>
                <CardDescription>Your top performing affiliate links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {affiliateLinks.slice(0, 5).map((link: any) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{link.campaignName || 'Campaign'}</p>
                        <p className="text-sm text-muted-foreground">{link.clicks} clicks • {link.conversions} conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${link.earnings?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-muted-foreground">
                          {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0.0'}% CR
                        </p>
                      </div>
                    </div>
                  ))}
                  {affiliateLinks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No affiliate links yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Affiliate Links Section */}
        {activeSection === 'links' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Affiliate Links</h2>
              <Button onClick={() => setShowCreateLink(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </div>

            {showCreateLink && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Affiliate Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Product</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newLinkForm.productId}
                      onChange={(e) => setNewLinkForm({...newLinkForm, productId: e.target.value})}
                    >
                      <option value="">Choose a product</option>
                      {products.map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Campaign Name (Optional)</Label>
                    <Input
                      value={newLinkForm.campaignName}
                      onChange={(e) => setNewLinkForm({...newLinkForm, campaignName: e.target.value})}
                      placeholder="e.g., Summer Sale 2024"
                    />
                  </div>
                  <div>
                    <Label>Custom Message (Optional)</Label>
                    <Textarea
                      value={newLinkForm.customMessage}
                      onChange={(e) => setNewLinkForm({...newLinkForm, customMessage: e.target.value})}
                      placeholder="Add a custom message for this campaign"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateAffiliateLink}>Create Link</Button>
                    <Button variant="outline" onClick={() => setShowCreateLink(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Your Affiliate Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {affiliateLinks.map((link: any) => (
                    <div key={link.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{link.campaignName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.shortUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded text-sm font-mono mb-3">
                        {link.shortUrl}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{link.clicks}</p>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{link.conversions}</p>
                          <p className="text-xs text-muted-foreground">Sales</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">${link.earnings?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-muted-foreground">Earned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {affiliateLinks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No affiliate links created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Commissions Section */}
        {activeSection === 'commissions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Commission History</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Commission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${commissions.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      ${commissions.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ${commissions.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + c.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {affiliate?.commissionRate ? (affiliate.commissionRate * 100).toFixed(1) : '5.0'}%
                    </p>
                    <p className="text-sm text-muted-foreground">Commission Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissions.map((commission: any) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{commission.orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rate: {(commission.rate * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${commission.amount.toFixed(2)}</p>
                        <Badge variant={
                          commission.status === 'paid' ? 'default' :
                          commission.status === 'approved' ? 'secondary' : 'outline'
                        }>
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {commissions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No commissions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Marketing Tools Section */}
        {activeSection === 'marketing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Marketing Tools</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Templates</CardTitle>
                  <CardDescription>Ready-to-use social media posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Instagram className="h-5 w-5 text-pink-500" />
                        <span className="font-medium">Instagram Story</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        "🛍️ Found amazing deals! Check out this awesome product I'm loving. Swipe up for exclusive discount! #affiliate #shopping"
                      </p>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard("Instagram template")}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Template
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Twitter className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Twitter Post</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        "Just discovered this amazing product! 🔥 Quality is top-notch and the price is unbeatable. Get yours now! #ProductReview"
                      </p>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard("Twitter template")}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Tips</CardTitle>
                  <CardDescription>Boost your affiliate success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Share Authentic Reviews</h4>
                        <p className="text-sm text-muted-foreground">
                          Personal experiences convert better than generic promotions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Time Your Posts</h4>
                        <p className="text-sm text-muted-foreground">
                          Post when your audience is most active for better engagement.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Track Performance</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor your links regularly and optimize based on data.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
