
import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

type UserType = 'customer' | 'seller' | 'affiliate' | 'admin';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge: string | null;
}

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  userType: UserType;
}

/**
 * Per-userType dashboard root path. Used as the destination for sub-section
 * nav items that have no dedicated route — the corresponding dashboard page
 * (CustomerDashboard / SellerDashboard / AffiliateDashboard / AdminDashboard)
 * renders its own in-page tab UI for switching sections.
 */
const DASHBOARD_ROOTS: Record<UserType, string> = {
  customer: '/customer-dashboard',
  seller: '/seller-dashboard',
  affiliate: '/affiliate-dashboard',
  admin: '/admin-dashboard',
};

/**
 * Per-userType closest real "settings" route. The previous implementation
 * linked the sidebar Settings button to `/settings`, which is not a real
 * route (it would 404 / fall through to the catch-all store route). Each
 * user type now routes to the closest valid real settings-like page.
 */
const SETTINGS_PATHS: Record<UserType, string> = {
  customer: '/customer-dashboard/profile',
  seller: '/seller-dashboard/settings',
  affiliate: '/affiliate-dashboard',
  admin: '/admin-dashboard',
};

export function MobileDashboardLayout({ children, userType }: MobileDashboardLayoutProps) {
  const { currentUser, logout } = useCommerce();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = useMemo<NavItem[]>(
    () => getNavigationItems(userType),
    [userType],
  );

  /**
   * Some user types (affiliate, admin) intentionally have multiple nav items
   * that point to the dashboard root, because the corresponding dashboard
   * page renders its own internal section tabs and there are no dedicated
   * sub-routes. To keep the active-link indicator unambiguous, only the
   * FIRST item with a given path is highlighted as active when the current
   * pathname matches that path. Items with a unique path use the standard
   * exact-match rule.
   */
  const firstInstanceOfPath = useMemo(() => {
    const seen = new Set<string>();
    const firsts = new Set<string>();
    for (const item of navigationItems) {
      if (!seen.has(item.path)) {
        firsts.add(`${item.path}::${item.id}`);
        seen.add(item.path);
      }
    }
    return firsts;
  }, [navigationItems]);

  const isItemActive = (item: NavItem) => {
    if (location.pathname !== item.path) return false;
    return firstInstanceOfPath.has(`${item.path}::${item.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const settingsPath = SETTINGS_PATHS[userType];
  const settingsLabel = `${userType.charAt(0).toUpperCase()}${userType.slice(1)} settings`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.avatar} alt="" />
            <AvatarFallback>
              {currentUser?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser?.email}
            </p>
            <Badge variant="outline" className="text-xs mt-1 capitalize">
              {userType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2" aria-label={`${userType} dashboard navigation`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                <span className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link to={settingsPath} onClick={() => setSidebarOpen(false)} aria-label={settingsLabel}>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
            Settings
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetTitle className="sr-only">{userType} dashboard navigation</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <h1 className="font-semibold text-lg capitalize">
            {userType} Dashboard
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span
                className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"
                aria-hidden="true"
              >
                3
              </span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.avatar} alt="" />
              <AvatarFallback className="text-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <aside className="w-64 h-screen sticky top-0 border-r bg-card">
          <SidebarContent />
        </aside>
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

/**
 * Build the sidebar nav items for a given user type. Every returned item
 * MUST point to a real route defined in App.tsx — no hash fragments and no
 * dead links.
 *
 * For user types whose dashboard page renders its own internal section tabs
 * (affiliate, admin) and for which no dedicated sub-route exists, the
 * section items route to the dashboard root; the user switches sections via
 * the dashboard's in-page tab UI. Where a real sub-route exists (e.g. the
 * affiliate wallet), it is used directly.
 */
function getNavigationItems(userType: UserType): NavItem[] {
  const root = DASHBOARD_ROOTS[userType];
  const baseItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Home, path: root, badge: null },
  ];

  switch (userType) {
    case 'customer':
      return [
        ...baseItems,
        { id: 'orders', label: 'My Orders', icon: Package, path: '/customer-dashboard/orders', badge: null },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/customer-dashboard/wishlist', badge: null },
        { id: 'profile', label: 'Profile', icon: User, path: '/customer-dashboard/profile', badge: null },
        { id: 'wallet', label: 'Wallet', icon: CreditCard, path: '/customer-dashboard/wallet', badge: null },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/customer-dashboard/notifications', badge: null },
        { id: 'support', label: 'Support', icon: HelpCircle, path: '/customer-dashboard/support', badge: null },
      ];

    case 'seller':
      return [
        ...baseItems,
        { id: 'products', label: 'Products', icon: Package, path: '/seller-dashboard/products-enhanced', badge: null },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/seller-dashboard/orders', badge: null },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/seller-dashboard/analytics', badge: null },
        { id: 'marketing', label: 'Marketing', icon: TrendingUp, path: '/seller-dashboard/marketing', badge: null },
        { id: 'reviews', label: 'Reviews', icon: Star, path: '/seller-dashboard/reviews', badge: null },
        { id: 'payments', label: 'Payments', icon: CreditCard, path: '/seller-dashboard/payments', badge: null },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/seller-dashboard/settings', badge: null },
      ];

    case 'affiliate':
      // AffiliateDashboard renders its own internal section tabs
      // (overview / links / commissions / marketing) inside the page; there
      // are no dedicated routes for those sections. The wallet is the one
      // real sub-route.
      return [
        ...baseItems,
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: root, badge: null },
        { id: 'payments', label: 'Payments', icon: CreditCard, path: '/affiliate-dashboard/wallet', badge: null },
        { id: 'assets', label: 'Assets', icon: Package, path: root, badge: null },
      ];

    case 'admin':
      // AdminDashboard renders its own internal section tabs
      // (overview / users / stores / commissions / agreements / withdrawals
      // / refunds / help) inside the page; there are no dedicated routes
      // for those sections, so each section item routes to the dashboard
      // root and the user switches sections via the in-page tab UI.
      return [
        ...baseItems,
        { id: 'users', label: 'Users', icon: Users, path: root, badge: null },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, path: root, badge: null },
        { id: 'products', label: 'Products', icon: Package, path: root, badge: null },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: root, badge: null },
        { id: 'trust-safety', label: 'Trust & Safety', icon: Shield, path: root, badge: null },
        { id: 'support', label: 'Support', icon: MessageSquare, path: root, badge: null },
      ];

    default:
      return baseItems;
  }
}
