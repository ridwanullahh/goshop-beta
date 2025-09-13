import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-commerce rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl bg-gradient-commerce bg-clip-text text-transparent">
                CommerceOS
              </span>
            </div>
            <p className="text-muted-foreground">
              The future of social commerce. Discover, shop, and sell in the world's most immersive commerce platform.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('quick_links')}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/categories" className="hover:text-primary transition-colors">{t('categories')}</Link></li>
              <li><Link to="/deals" className="hover:text-primary transition-colors">Deals</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
              <li><Link to="/trending" className="hover:text-primary transition-colors">Trending</Link></li>
              <li><Link to="/brands" className="hover:text-primary transition-colors">Brands</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('customer_service')}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">{t('help')}</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/track-order" className="hover:text-primary transition-colors">{t('track_order')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('stay_updated')}</h3>
            <p className="text-muted-foreground text-sm">
              Get the latest deals and product updates delivered to your inbox.
            </p>
            <div className="space-y-2">
              <Input placeholder="Enter your email" type="email" />
              <Button variant="commerce" className="w-full">
                {t('subscribe')}
              </Button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@commerceos.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>1-800-COMMERCE</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">{t('privacy_policy')}</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">{t('terms_of_service')}</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
            <Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">
              © 2024 CommerceOS. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-xs text-center">
              <div className="font-semibold">Secure Payments</div>
              <div>256-bit SSL</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">Fast Shipping</div>
              <div>24-48h Delivery</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">30-Day Returns</div>
              <div>No Questions Asked</div>
            </div>
            <div className="text-xs text-center">
              <div className="font-semibold">24/7 Support</div>
              <div>Always Here to Help</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}