import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Wallet, 
  Building, 
  Truck,
  Lock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Order, Product } from '@/lib/commerce-sdk';

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export default function Checkout() {
  const { cart, currentUser, sdk, clearCart, products } = useCommerce();
  const navigate = useNavigate();

  // Redirect to enhanced checkout
  useEffect(() => {
    navigate('/checkout-enhanced', { replace: true });
  }, [navigate]);

  // Return loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirecting to enhanced checkout...</p>
      </div>
    </div>
  );
}
