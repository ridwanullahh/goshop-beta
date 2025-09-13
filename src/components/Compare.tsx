import React from 'react';
import { Product } from '@/lib';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CompareProps {
  products: Product[];
  onClose: () => void;
  onRemove: (productId: string) => void;
}

export default function Compare({ products, onClose, onRemove }: CompareProps) {
  const { t } = useTranslation();
  if (products.length === 0) {
    return null;
  }

  const attributes = ['price', 'rating', 'category', 'sellerName', 'inventory'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-4">{t('compare_products')}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('feature')}</TableHead>
              {products.map(product => (
                <TableHead key={product.id}>
                  {product.name}
                  <Button variant="ghost" size="icon" onClick={() => onRemove(product.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map(attr => (
              <TableRow key={attr}>
                <TableCell className="font-semibold">{t(attr.toLowerCase())}</TableCell>
                {products.map(product => (
                  <TableCell key={product.id}>{(product as any)[attr]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}