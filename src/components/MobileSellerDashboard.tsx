import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  DollarSign, 
  Settings, 
  LogOut,
  MessageSquare,
  Megaphone
} from 'lucide-react';

export function MobileSellerDashboard() {
  const location = useLocation();
  
  const navItems = [
    {
      label: 'Overview',
      icon: BarChart3,
      path: '/seller/dashboard',
      isActive: location.pathname === '/seller/dashboard'
    },
    {
      label: 'Products',
      icon: Package,
      path: '/seller/products',
      isActive: location.pathname.startsWith('/seller/products')
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      path: '/seller/orders',
      isActive: location.pathname === '/seller/orders'
    },
    {
      label: 'Analytics',
      icon: TrendingUp,
      path: '/seller/analytics',
      isActive: location.pathname === '/seller/analytics'
    },
    {
      label: 'Marketing',
      icon: Megaphone,
      path: '/seller/marketing',
      isActive: location.pathname === '/seller/marketing'
    },
    {
      label: 'Reviews',
      icon: Star,
      path: '/seller/reviews',
      isActive: location.pathname === '/seller/reviews'
    },
    {
      label: 'Payments',
      icon: DollarSign,
      path: '/seller/payments',
      isActive: location.pathname === '/seller/payments'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/seller/settings',
      isActive: location.pathname === '/seller/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <div className="grid grid-cols-4 h-16 overflow-x-auto">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-2 transition-colors ${
                  item.isActive 
                    ? 'text-primary bg-primary/5' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <div className="w-64 border-r bg-background">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Seller Dashboard</h2>
          </div>
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    item.isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted w-full">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
        
        <div className="flex-1">
          <Outlet />
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden pb-16">
        <Outlet />
      </div>
    </div>
  );
}