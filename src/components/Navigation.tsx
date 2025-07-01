
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCommerce } from '@/context/CommerceContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  Heart,
  Bell,
  LogOut,
  Settings,
  Package,
  BarChart3
} from 'lucide-react';

const Navigation = () => {
  const { currentUser, cart, logout } = useCommerce();
  const location = useLocation();
  const navigate = useNavigate();
  
  const cartItemCount = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', active: isActive('/') },
    { to: '/products', label: 'Products', active: isActive('/products') },
    ...(currentUser ? [
      { 
        to: currentUser.roles?.[0] === 'admin' ? '/admin-dashboard' :
            currentUser.roles?.[0] === 'seller' ? '/seller-dashboard' : 
            '/customer-dashboard', 
        label: 'Dashboard', 
        active: location.pathname.includes('dashboard') 
      }
    ] : [])
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-commerce rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gradient">CommerceOS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  link.active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {currentUser && (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Button>

                {/* Wishlist */}
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Cart */}
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {/* User Menu */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{currentUser.email}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="commerce">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="flex items-center justify-around py-2">
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center space-y-1 px-3 py-2 text-xs ${
                link.active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label === 'Home' && <User className="h-4 w-4" />}
              {link.label === 'Products' && <Package className="h-4 w-4" />}
              {link.label === 'Dashboard' && <BarChart3 className="h-4 w-4" />}
              <span>{link.label}</span>
            </Link>
          ))}
          {currentUser && (
            <Link to="/cart" className="flex flex-col items-center space-y-1 px-3 py-2 text-xs text-muted-foreground relative">
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-0 -right-0 h-4 w-4 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
              <span>Cart</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
