
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCommerce } from '@/context/CommerceContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { SidebarModal } from '@/components/SidebarModal';
import { SearchModal } from '@/components/SearchModal';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Bell, 
  User, 
  Menu, 
  Grid3X3,
  Store,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Package,
  Users,
  Zap
} from 'lucide-react';
import { Product, Notification } from '@/lib/commerce-sdk';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, cart, logout } = useCommerce();
  const { data: products } = useRealTimeData<Product>('products');
  const { data: notifications } = useRealTimeData<Notification>('notifications', [], [currentUser?.id]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart?.items?.length || 0;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Real-time search
  React.useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = products
        .filter(product => 
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const megaMenuCategories = [
    { name: 'Electronics', icon: Zap, featured: ['Smartphones', 'Laptops', 'Gaming'] },
    { name: 'Fashion', icon: Star, featured: ['Men\'s Wear', 'Women\'s Wear', 'Accessories'] },
    { name: 'Home & Garden', icon: Package, featured: ['Furniture', 'Decor', 'Appliances'] },
    { name: 'Sports', icon: TrendingUp, featured: ['Fitness', 'Outdoor', 'Team Sports'] }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar - Desktop Only */}
      <div className="hidden md:block border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>support@platform.com</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/help" className="hover:text-foreground">Help</Link>
              <Link to="/track-order" className="hover:text-foreground">Track Order</Link>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Ship to: USA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 mx-8">
            <div className="group relative">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Grid3X3 className="h-4 w-4" />
                <span>Categories</span>
              </Button>
              
              {/* Mega Menu */}
              <div className="absolute top-full left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 pt-2">
                <div className="bg-background border rounded-lg shadow-lg p-6 w-96">
                  <div className="grid grid-cols-2 gap-4">
                    {megaMenuCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.name} className="space-y-2">
                          <Link 
                            to={`/category/${category.name.toLowerCase()}`}
                            className="flex items-center space-x-2 font-medium hover:text-primary"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{category.name}</span>
                          </Link>
                          <div className="space-y-1">
                            {category.featured.map((item) => (
                              <Link
                                key={item}
                                to={`/search?q=${encodeURIComponent(item)}`}
                                className="block text-sm text-muted-foreground hover:text-foreground pl-6"
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Link 
                      to="/categories" 
                      className="text-sm text-primary hover:underline"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <Link to="/stores" className="hover:text-primary">Stores</Link>
            <Link to="/products" className="hover:text-primary">Products</Link>
            {currentUser?.role === 'seller' && (
              <Link to="/seller-dashboard" className="hover:text-primary">Dashboard</Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, stores, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
                onFocus={() => setShowSearchResults(searchQuery.length >= 2)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-lg mt-1 z-50">
                <div className="py-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-muted"
                      onClick={() => setShowSearchResults(false)}
                    >
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                    </Link>
                  ))}
                  
                  <div className="border-t mt-2 pt-2 px-4">
                    <button
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <SearchModal>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Search className="h-4 w-4" />
              </Button>
            </SearchModal>

            {/* Notifications */}
            <SidebarModal type="notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </SidebarModal>
            

            {/* Wishlist */}
            <SidebarModal type="wishlist">
              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </SidebarModal>

            {/* Cart */}
            <SidebarModal type="cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SidebarModal>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative group">
                <Button variant="ghost" size="icon">
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
                
                {/* User Dropdown */}
                <div className="absolute right-0 top-full invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 pt-2">
                  <div className="bg-background border rounded-lg shadow-lg py-2 w-48">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium text-sm">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        to="/customer-dashboard" 
                        className="block px-4 py-2 text-sm hover:bg-muted"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/orders" 
                        className="block px-4 py-2 text-sm hover:bg-muted"
                      >
                        My Orders
                      </Link>
                      <Link 
                        to="/wishlist" 
                        className="block px-4 py-2 text-sm hover:bg-muted"
                      >
                        Wishlist
                      </Link>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-4">
                  {/* User Section */}
                  {currentUser ? (
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        {currentUser.avatar ? (
                          <img 
                            src={currentUser.avatar} 
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pb-4 border-b">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Login</Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="space-y-2 pt-4">
                    <Link 
                      to="/categories" 
                      className="flex items-center space-x-3 py-2 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Grid3X3 className="h-4 w-4" />
                      <span>Categories</span>
                    </Link>
                    
                    <Link 
                      to="/products" 
                      className="flex items-center space-x-3 py-2 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      <span>Products</span>
                    </Link>
                    
                    <Link 
                      to="/stores" 
                      className="flex items-center space-x-3 py-2 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Store className="h-4 w-4" />
                      <span>Stores</span>
                    </Link>

                    {currentUser && (
                      <>
                        <Link 
                          to="/customer-dashboard" 
                          className="flex items-center space-x-3 py-2 hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        
                        {currentUser.role === 'seller' && (
                          <Link 
                            to="/seller-dashboard" 
                            className="flex items-center space-x-3 py-2 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            <span>Seller Dashboard</span>
                          </Link>
                        )}
                      </>
                    )}
                    
                    <Link 
                      to="/help" 
                      className="flex items-center space-x-3 py-2 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Phone className="h-4 w-4" />
                      <span>Help</span>
                    </Link>
                    
                    <Link 
                      to="/contact" 
                      className="flex items-center space-x-3 py-2 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Mail className="h-4 w-4" />
                      <span>Contact</span>
                    </Link>

                    {currentUser && (
                      <>
                        <div className="border-t my-4"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 py-2 hover:text-primary w-full text-left"
                        >
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
