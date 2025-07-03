
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { 
  Menu, 
  Home, 
  Package, 
  ShoppingCart,
  Heart,
  User,
  Settings,
  BarChart3,
  Star,
  CreditCard,
  Bell,
  MessageSquare,
  TrendingUp,
  Users,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  userType: 'customer' | 'seller' | 'affiliate' | 'admin';
}

export function MobileDashboardLayout({ children, userType }: MobileDashboardLayoutProps) {
  const { currentUser, logout } = useCommerce();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: Home, 
        path: `/${userType}-dashboard`,
        badge: null 
      }
    ];

    switch (userType) {
      case 'customer':
        return [
          ...baseItems,
          { id: 'orders', label: 'My Orders', icon: Package, path: '/orders', badge: null },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist', badge: null },
          { id: 'profile', label: 'Profile', icon: User, path: '/profile', badge: null },
          { id: 'wallet', label: 'Wallet', icon: CreditCard, path: '/wallet', badge: null },
          { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications', badge: '3' },
          { id: 'support', label: 'Support', icon: HelpCircle, path: '/support', badge: null }
        ];
      
      case 'seller':
        return [
          ...baseItems,
          { id: 'products', label: 'Products', icon: Package, path: '/seller/products', badge: null },
          { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/seller/orders', badge: '5' },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/seller/analytics', badge: null },
          { id: 'marketing', label: 'Marketing', icon: TrendingUp, path: '/seller/marketing', badge: null },
          { id: 'reviews', label: 'Reviews', icon: Star, path: '/seller/reviews', badge: '2' },
          { id: 'payments', label: 'Payments', icon: CreditCard, path: '/seller/payments', badge: null },
          { id: 'settings', label: 'Settings', icon: Settings, path: '/seller/settings', badge: null }
        ];
      
      case 'affiliate':
        return [
          ...baseItems,
          { id: 'campaigns', label: 'Campaigns', icon: TrendingUp, path: '/affiliate/campaigns', badge: null },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/affiliate/analytics', badge: null },
          { id: 'payments', label: 'Payments', icon: CreditCard, path: '/affiliate/payments', badge: null },
          { id: 'assets', label: 'Assets', icon: Package, path: '/affiliate/assets', badge: null }
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { id: 'users', label: 'Users', icon: Users, path: '/admin/users', badge: null },
          { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders', badge: null },
          { id: 'products', label: 'Products', icon: Package, path: '/admin/products', badge: null },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics', badge: null },
          { id: 'trust-safety', label: 'Trust & Safety', icon: Shield, path: '/admin/trust-safety', badge: null },
          { id: 'support', label: 'Support', icon: MessageSquare, path: '/admin/support', badge: '12' }
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>
              {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser?.email}
            </p>
            <Badge variant="outline" className="text-xs mt-1">
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link to="/settings" onClick={() => setSidebarOpen(false)}>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold text-lg capitalize">
            {userType} Dashboard
          </h1>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="text-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <div className="w-64 h-screen sticky top-0 border-r bg-card">
          <SidebarContent />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        {children}
      </div>
    </div>
  );
}
