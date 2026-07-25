import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Globe,
  Tag
} from 'lucide-react';

export default function CommissionSettings() {
  const { sdk } = useCommerce();
  const { toast } = useToast();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCommission, setEditingCommission] = useState<any>(null);
  const [formData, setFormData] = useState({
    percentage: '',
    category: '',
    isGlobal: false
  });

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books',
    'Beauty', 'Automotive', 'Toys', 'Health', 'Food & Beverages'
  ];

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    if (!sdk) return;

    try {
      const commissionsData = await sdk.getPlatformCommissions();
      setCommissions(commissionsData);
    } catch (error) {
      console.error('Error loading commissions:', error);
      toast({
        title: "Error",
        description: "Failed to load commission settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdk) return;

    try {
      const commissionData = {
        percentage: parseFloat(formData.percentage),
        category: formData.isGlobal ? undefined : formData.category,
        isGlobal: formData.isGlobal
      };

      if (editingCommission) {
        await sdk.updatePlatformCommission(editingCommission.id, commissionData);
        toast({
          title: "Success",
          description: "Commission updated successfully!"
        });
      } else {
        await sdk.createPlatformCommission(commissionData);
        toast({
          title: "Success",
          description: "Commission created successfully!"
        });
      }

      resetForm();
      loadCommissions();
    } catch (error) {
      console.error('Error saving commission:', error);
      toast({
        title: "Error",
        description: "Failed to save commission settings.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (commission: any) => {
    setEditingCommission(commission);
    setFormData({
      percentage: commission.percentage.toString(),
      category: commission.category || '',
      isGlobal: commission.isGlobal
    });
    setShowForm(true);
  };

  const handleDelete = async (commissionId: string) => {
    if (!sdk || !confirm('Are you sure you want to delete this commission setting?')) return;

    try {
      await sdk.sdk.delete('platformCommissions', commissionId);
      toast({
        title: "Success",
        description: "Commission deleted successfully!"
      });
      loadCommissions();
    } catch (error) {
      console.error('Error deleting commission:', error);
      toast({
        title: "Error",
        description: "Failed to delete commission.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      percentage: '',
      category: '',
      isGlobal: false
    });
    setEditingCommission(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Commission Settings</h1>
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Commission Settings</h1>
          <p className="text-muted-foreground">
            Manage platform commission rates for different product categories
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Commission
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingCommission ? 'Edit Commission' : 'Add New Commission'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="percentage">Commission Percentage *</Label>
                <div className="relative">
                  <Input
                    id="percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                    placeholder="5.0"
                    required
                    className="pr-8"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGlobal: checked }))}
                />
                <Label htmlFor="isGlobal">Global Commission (applies to all categories)</Label>
              </div>

              {!formData.isGlobal && (
                <div>
                  <Label htmlFor="category">Product Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCommission ? 'Update' : 'Create'} Commission
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {commissions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Percent className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No commission settings</h3>
              <p className="text-muted-foreground mb-4">
                Set up commission rates for your platform to start earning from sales.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Commission
              </Button>
            </CardContent>
          </Card>
        ) : (
          commissions.map((commission) => (
            <Card key={commission.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {commission.percentage}% Commission
                      </h3>
                      {commission.isGlobal ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Globe className="h-3 w-3 mr-1" />
                          Global
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {commission.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {commission.isGlobal 
                        ? 'Applied to all product categories by default'
                        : `Applied to products in the ${commission.category} category`
                      }
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(commission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(commission)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(commission.id)}
                      disabled={commission.isGlobal && commissions.filter(c => c.isGlobal).length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
