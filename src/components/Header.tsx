
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarModal } from '@/components/SidebarModal';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
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
  const { currentUser, cartItems, wishlistItems, notifications, logout, searchProducts } = useCommerce();
  const { data: products } = useRealTimeData('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cartItems?.length || 0;
  const wishlistItemsCount = wishlistItems?.length || 0;
  const unreadNotifications = notifications?.filter((n: any) => !n.read).length || 0;

  // Real-time search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results.slice(0, 8)); // Limit to 8 results
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
        { name: 'Tech Hub Store', href: '/tech-hub-store' },
        { name: 'Fashion Forward', href: '/fashion-forward' },
        { name: 'Home Essentials', href: '/home-essentials' },
        { name: 'Sports Pro', href: '/sports-pro' }
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
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products, stores, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  />
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Search Results</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSearchResults(false)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {searchResults.map((product: any) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={() => setShowSearchResults(false)}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                          >
                            <img
                              src={product.images[0] || '/placeholder.svg'}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Categories Mega Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Grid3X3 className="h-5 w-5 mr-2" />
                    Categories
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Browse Categories</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {megaMenuSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <div key={section.title}>
                          <h3 className="font-semibold text-sm mb-3 flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {section.title}
                          </h3>
                          <div className="space-y-2">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
                      <div className="space-y-2">
                        {quickLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              to={link.href}
                              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {link.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Notifications */}
              <SidebarModal
                type="notifications"
                title={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}`}
                trigger={
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                }
              />

              {/* Wishlist */}
              <SidebarModal
                type="wishlist"
                title={`Wishlist${wishlistItemsCount > 0 ? ` (${wishlistItemsCount})` : ''}`}
                trigger={
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistItemsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {wishlistItemsCount}
                      </Badge>
                    )}
                  </Button>
                }
              />

              {/* Cart */}
              <SidebarModal
                type="cart"
                title={`Shopping Cart${cartItemsCount > 0 ? ` (${cartItemsCount})` : ''}`}
                trigger={
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                }
              />

              {/* User Menu */}
              {currentUser ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>
                          {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline">{currentUser.name}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Account Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback>
                            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{currentUser.name}</p>
                          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {currentUser.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link to={`/${currentUser.role}-dashboard`}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link to="/orders">
                          <Button variant="ghost" className="w-full justify-start">
                            <Package className="h-4 w-4 mr-2" />
                            My Orders
                          </Button>
                        </Link>
                        <Link to="/profile">
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-destructive"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
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

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
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

                  {/* Mobile Navigation Links */}
                  <div className="space-y-4">
                    <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        Categories
                      </Button>
                    </Link>
                    <Link to="/stores" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Store className="h-4 w-4 mr-2" />
                        Stores
                      </Button>
                    </Link>
                    <Link to="/deals" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Tag className="h-4 w-4 mr-2" />
                        Deals
                      </Button>
                    </Link>
                    <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </Link>
                  </div>

                  {currentUser ? (
                    <div className="space-y-2 pt-4 border-t">
                      <Link to={`/${currentUser.role}-dashboard`} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4 border-t">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Click overlay to close search results */}
      {showSearchResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </>
  );
}
