
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCommerce } from '@/context/CommerceContext';
import { 
  ShoppingCart, 
  Heart, 
  Bell, 
  Search, 
  Menu, 
  User, 
  Store, 
  Settings,
  LogOut,
  Package,
  Grid3X3,
  Tag,
  Percent,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Home,
  ShoppingBag,
  Users,
  MessageSquare,
  Radio,
  HelpCircle,
  FileText,
  Shield,
  X
} from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { currentUser, cartItems, wishlistItems, notifications } = useCommerce();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const cartItemsCount = cartItems?.length || 0;
  const wishlistItemsCount = wishlistItems?.length || 0;
  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    navigate('/');
  };

  const megaMenuSections = [
    {
      title: 'Categories',
      icon: Grid3X3,
      items: [
        { name: 'Electronics', href: '/category/electronics' },
        { name: 'Fashion', href: '/category/fashion' },
        { name: 'Home & Garden', href: '/category/home-garden' },
        { name: 'Sports', href: '/category/sports' },
        { name: 'Books', href: '/category/books' }
      ]
    },
    {
      title: 'Featured Stores',
      icon: Store,
      items: [
        { name: 'Tech Hub Store', href: '/store/tech-hub-store' },
        { name: 'Fashion Forward', href: '/store/fashion-forward' },
        { name: 'Home Essentials', href: '/store/home-essentials' },
        { name: 'Sports Pro', href: '/store/sports-pro' }
      ]
    },
    {
      title: 'Deals & Offers',
      icon: Tag,
      items: [
        { name: 'Flash Sales', href: '/deals/flash-sales' },
        { name: 'Weekly Deals', href: '/deals/weekly' },
        { name: 'Clearance', href: '/deals/clearance' },
        { name: 'Bulk Discounts', href: '/deals/bulk' }
      ]
    }
  ];

  const quickLinks = [
    { name: 'Track Order', href: '/track-order', icon: Package },
    { name: 'Customer Service', href: '/contact', icon: Phone },
    { name: 'Returns & Refunds', href: '/returns-refunds', icon: Shield },
    { name: 'Shipping Info', href: '/shipping-info', icon: MapPin }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl hidden sm:inline">GoShop</span>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, stores, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {notifications?.slice(0, 5).map((notification: any) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {(!notifications || notifications.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">No notifications</p>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Wishlist */}
              <Sheet open={showWishlist} onOpenChange={setShowWishlist}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistItemsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {wishlistItemsCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Wishlist</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {wishlistItems?.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <img 
                          src={item.image || '/placeholder.svg'} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-sm text-primary">${item.price}</p>
                        </div>
                      </div>
                    ))}
                    {(!wishlistItems || wishlistItems.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">Your wishlist is empty</p>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>
                      {currentUser.name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden lg:inline">
                    {currentUser.name || currentUser.email}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center space-x-2 md:hidden">
              {/* Mobile Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                          <span className="font-bold text-lg">GoShop</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* Mobile Search */}
                      <form onSubmit={handleSearch} className="mt-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </form>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-4 border-b">
                      {currentUser ? (
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>
                              {currentUser.name?.[0]?.toUpperCase() || currentUser.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{currentUser.name || 'User'}</p>
                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                            <Badge variant="outline" className="text-xs">
                              {currentUser.role}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full" variant="outline">Sign In</Button>
                          </Link>
                          <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full">Sign Up</Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto">
                      {/* Main Navigation */}
                      <div className="p-4 space-y-2">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted">
                            <Home className="h-5 w-5" />
                            <span>Home</span>
                          </div>
                        </Link>
                        
                        <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted">
                            <Package className="h-5 w-5" />
                            <span>Products</span>
                          </div>
                        </Link>

                        <Link to="/stores" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted">
                            <Store className="h-5 w-5" />
                            <span>Stores</span>
                          </div>
                        </Link>

                        <Link to="/community" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted">
                            <Users className="h-5 w-5" />
                            <span>Community</span>
                          </div>
                        </Link>

                        <Link to="/live" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted">
                            <Radio className="h-5 w-5" />
                            <span>Live Shopping</span>
                          </div>
                        </Link>
                      </div>

                      {/* Mega Menu Sections */}
                      {megaMenuSections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <div key={section.title} className="border-t">
                            <div className="p-4">
                              <h3 className="flex items-center space-x-2 font-semibold text-sm text-muted-foreground mb-3">
                                <Icon className="h-4 w-4" />
                                <span>{section.title}</span>
                              </h3>
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block p-2 text-sm hover:bg-muted rounded"
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Quick Links */}
                      <div className="border-t">
                        <div className="p-4">
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Quick Links</h3>
                          <div className="space-y-1">
                            {quickLinks.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link
                                  key={link.name}
                                  to={link.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center space-x-3 p-2 text-sm hover:bg-muted rounded"
                                >
                                  <Icon className="h-4 w-4" />
                                  <span>{link.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Menu Footer */}
                    {currentUser && (
                      <div className="border-t p-4 space-y-2">
                        {currentUser.role === 'admin' && (
                          <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex items-center space-x-3 p-2 text-sm hover:bg-muted rounded">
                              <Shield className="h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </div>
                          </Link>
                        )}
                        
                        {(currentUser.role === 'seller' || currentUser.role === 'admin') && (
                          <Link to="/seller-dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex items-center space-x-3 p-2 text-sm hover:bg-muted rounded">
                              <Store className="h-4 w-4" />
                              <span>Seller Dashboard</span>
                            </div>
                          </Link>
                        )}

                        {(currentUser.role === 'affiliate' || currentUser.role === 'admin') && (
                          <Link to="/affiliate-dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex items-center space-x-3 p-2 text-sm hover:bg-muted rounded">
                              <TrendingUp className="h-4 w-4" />
                              <span>Affiliate Dashboard</span>
                            </div>
                          </Link>
                        )}

                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center space-x-3 p-2 text-sm hover:bg-muted rounded">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </div>
                        </Link>

                        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
