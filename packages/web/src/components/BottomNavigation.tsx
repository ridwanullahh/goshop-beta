
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Grid3X3, 
  Store, 
  Radio, 
  Users,
  ShoppingCart 
} from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';

export function BottomNavigation() {
  const location = useLocation();
  const { cart } = useCommerce();
  
  const cartItemCount = cart?.items?.length || 0;
  
  const navItems = [
    {
      label: 'Feed',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/'
    },
    {
      label: 'Categories',
      icon: Grid3X3,
      path: '/categories',
      isActive: location.pathname === '/categories'
    },
    {
      label: 'Stores',
      icon: Store,
      path: '/stores',
      isActive: location.pathname === '/stores'
    },
    {
      label: 'Live',
      icon: Radio,
      path: '/live',
      isActive: location.pathname === '/live'
    },
    {
      label: 'Community',
      icon: Users,
      path: '/community',
      isActive: location.pathname === '/community'
    }
  ];

  // Don't show on auth pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                item.isActive 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.label === 'Feed' && cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
