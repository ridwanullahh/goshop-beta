
import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedSection } from '@/components/FeaturedSection';
import { CategoriesMegaMenu } from '@/components/CategoriesMegaMenu';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedSection />
        <div className="py-8">
          <CategoriesMegaMenu />
        </div>
      </main>
      <Footer />
    </div>
  );
}
