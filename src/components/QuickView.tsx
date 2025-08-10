import React from 'react';
import { Product } from '@/lib';
import { Button } from './ui/button';
import { ShoppingCart, X } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { addToCart } = useCommerce();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-auto object-cover rounded-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-lg text-primary font-bold mb-4">${product.price}</p>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            <Button onClick={() => addToCart(product.id)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}