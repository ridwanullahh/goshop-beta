import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import {
  Store,
  User,
  Settings as SettingsIcon,
  Save,
  Globe,
  Phone,
  MapPin,
  Building,
  FileText,
  Shield
} from 'lucide-react';

export default function Settings() {
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    slug: '',
    location: '',
    website: '',
    phone: '',
    email: '',
    businessType: '',
    policies: {
      shipping: '',
      returns: '',
      privacy: ''
    }
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    if (!sdk || !currentUser) return;

    try {
      const storeInfo = await sdk.getSellerStore(currentUser.id);
      if (storeInfo) {
        setStore(storeInfo);
        setStoreData({
          name: storeInfo.name || '',
          description: storeInfo.description || '',
          slug: storeInfo.slug || '',
          location: storeInfo.location || '',
          website: storeInfo.website || '',
          phone: storeInfo.phone || '',
          email: storeInfo.email || '',
          businessType: storeInfo.businessType || '',
          policies: {
            shipping: storeInfo.policies?.shipping || '',
            returns: storeInfo.policies?.returns || '',
            privacy: storeInfo.policies?.privacy || ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStore = async () => {
    if (!sdk || !store) return;

    try {
      await sdk.updateStore(store.id, storeData);
      toast({
        title: "Success",
        description: "Store settings updated successfully!"
      });
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: "Error",
        description: "Failed to update store settings.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store and account settings</p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="store">
            <Store className="h-4 w-4 mr-2" />
            Store Settings
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeData.name}
                    onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Store Name"
                  />
                </div>
                <div>
                  <Label htmlFor="storeSlug">Store URL Slug</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{window.location.origin}/</span>
                    <Input
                      id="storeSlug"
                      value={storeData.slug}
                      onChange={(e) => setStoreData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="store-slug"
                      disabled
                      className="opacity-60"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your store URL
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  value={storeData.description}
                  onChange={(e) => setStoreData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your store and what you sell..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={storeData.location}
                      onChange={(e) => setStoreData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State, Country"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessType"
                      value={storeData.businessType}
                      onChange={(e) => setStoreData(prev => ({ ...prev, businessType: e.target.value }))}
                      placeholder="LLC, Corporation, etc."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={storeData.website}
                      onChange={(e) => setStoreData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://your-website.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={storeData.phone}
                      onChange={(e) => setStoreData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveStore} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Store Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={currentUser?.name || ''}
                    placeholder="Your full name"
                    disabled
                    className="opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser?.email || ''}
                    placeholder="your@email.com"
                    disabled
                    className="opacity-60"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact support to update your account information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                <Textarea
                  id="shippingPolicy"
                  value={storeData.policies.shipping}
                  onChange={(e) => setStoreData(prev => ({
                    ...prev,
                    policies: { ...prev.policies, shipping: e.target.value }
                  }))}
                  placeholder="Describe your shipping policy..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="returnsPolicy">Returns & Refunds Policy</Label>
                <Textarea
                  id="returnsPolicy"
                  value={storeData.policies.returns}
                  onChange={(e) => setStoreData(prev => ({
                    ...prev,
                    policies: { ...prev.policies, returns: e.target.value }
                  }))}
                  placeholder="Describe your returns and refunds policy..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                <Textarea
                  id="privacyPolicy"
                  value={storeData.policies.privacy}
                  onChange={(e) => setStoreData(prev => ({
                    ...prev,
                    policies: { ...prev.policies, privacy: e.target.value }
                  }))}
                  placeholder="Describe your privacy policy..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveStore} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Policies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}