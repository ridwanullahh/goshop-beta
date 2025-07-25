import React from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Compare from '@/components/Compare';
import { Product } from '@/lib/commerce-sdk';

export default function ComparePage() {
  const { compareList, products, removeFromCompare } = useCommerce();
  const compareProducts = products.filter(p => compareList.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Compare Products</h1>
        <Compare products={compareProducts} onClose={() => {}} onRemove={removeFromCompare} />
      </main>
      <Footer />
    </div>
  );
}