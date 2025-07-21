import React, { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Settings() {
  const { sdk, user, loadUserData } = useCommerce();
  const [storeSettings, setStoreSettings] = useState({
    name: '',
    description: '',
    logo: '',
  });
  const [profileSettings, setProfileSettings] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setProfileSettings({
        name: user.name || '',
        email: user.email || '',
      });
      // Assuming store data is attached to user or fetched separately
      // This is a mock-up
      setStoreSettings({
        name: user.businessName || '',
        description: 'A great store.',
        logo: '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!sdk || !user) return;
    try {
      await sdk.update('users', user.id, profileSettings);
      toast.success('Profile updated successfully');
      await loadUserData(); // Refresh user data in context
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };
  
  const handleUpdateStore = async () => {
    if (!sdk || !user) return;
    try {
      // This assumes a 'stores' collection and a link to the user
      // This is a mock implementation
      await sdk.update('stores', user.id, { ...storeSettings, businessName: storeSettings.name });
      toast.success('Store settings updated successfully');
    } catch (error) {
      toast.error('Failed to update store settings');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profileSettings.name}
              onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileSettings.email}
              onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
            />
          </div>
          <Button onClick={handleUpdateProfile}>Update Profile</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={storeSettings.name}
              onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              value={storeSettings.description}
              onChange={(e) => setStoreSettings({ ...storeSettings, description: e.target.value })}
            />
          </div>
          <Button onClick={handleUpdateStore}>Update Store Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}