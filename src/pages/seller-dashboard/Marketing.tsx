import React, { useState } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

export default function Marketing() {
  const { sdk, user } = useCommerce();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [newDiscount, setNewDiscount] = useState({ code: '', percentage: '' });

  const handleCreateDiscount = async () => {
    if (!sdk || !user) return;
    // Mock implementation
    const createdDiscount = { id: Date.now().toString(), ...newDiscount };
    setDiscounts([...discounts, createdDiscount]);
    setNewDiscount({ code: '', percentage: '' });
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discounts.map(discount => (
              <div key={discount.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{discount.code}</p>
                  <p className="text-sm text-muted-foreground">{discount.percentage}% off</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDiscount(discount.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Create New Discount</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Discount Code"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Percentage"
                value={newDiscount.percentage}
                onChange={(e) => setNewDiscount({ ...newDiscount, percentage: e.target.value })}
              />
              <Button onClick={handleCreateDiscount}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}