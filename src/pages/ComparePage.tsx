import React from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Compare from '@/components/Compare';
import { Product } from '@/lib';

export default function ComparePage() {
  const { t } = useTranslation();
  const { compareList, products, removeFromCompare } = useCommerce();
  const compareProducts = products.filter(p => compareList.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('compare_products')}</h1>
        <Compare products={compareProducts} onClose={() => {}} onRemove={removeFromCompare} />
      </main>
      <Footer />
    </div>
  );
}