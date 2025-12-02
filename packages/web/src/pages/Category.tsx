
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { useCommerce } from '@/context/CommerceContext';

export default function Category() {
  const { slug } = useParams();
  const { products } = useCommerce();

  const categoryName = slug?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
