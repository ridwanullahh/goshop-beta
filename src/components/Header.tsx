import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Bell,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Home,
  List,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { CartSidebar } from './CartSidebar';
import { WishlistModal } from './WishlistModal';
import { NotificationsModal } from './NotificationsModal';
import { SearchModal } from './SearchModal';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function Header() {
  const { currentUser, logout, cart, wishlistItems, notifications } = useCommerce();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo-icon.png" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-lg">GoShop</span>
          </Link>

          <div className="flex-1 mx-4">
            <Input type="search" placeholder="Search products..." className="w-full" />
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <NotificationsModal>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </NotificationsModal>

                <WishlistModal>
                  <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistItems.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {wishlistItems.length || 0}
                      </Badge>
                    )}
                  </Button>
                </WishlistModal>

                <CartSidebar>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart && cart.items && cart.items.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </Badge>
                    )}
                  </Button>
                </CartSidebar>

                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo-icon.png" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-lg">GoShop</span>
          </Link>

          <div className="flex items-center space-x-3">
            {/* Search Icon with Modal */}
            <SearchModal>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </SearchModal>

            {/* Notifications */}
            <NotificationsModal>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </NotificationsModal>

            {/* Wishlist */}
            <WishlistModal>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {wishlistItems.length || 0}
                  </Badge>
                )}
              </Button>
            </WishlistModal>

            {/* Cart */}
            <CartSidebar>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cart && cart.items && cart.items.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </CartSidebar>

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-4 py-2 bg-gray-50">
            {currentUser ? (
              <div className="flex flex-col space-y-2">
                <Link to="/profile" className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{currentUser.name}</span>
                </Link>
                <Button variant="ghost" size="sm" className="justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="ghost" size="sm" className="justify-start">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t md:hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-5">
            <NavItem href="/" icon={<Home className="h-5 w-5" />} label="Home" />
            <NavItem href="/categories" icon={<List className="h-5 w-5" />} label="Categories" />
            <NavItem href="/customer-dashboard" icon={<User className="h-5 w-5" />} label="Account" />
            <NavItem href="/orders" icon={<ShoppingCart className="h-5 w-5" />} label="Orders" />
            <NavItem href="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
          </div>
        </div>
      </div>
    </>
  );
}

function NavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link to={href} className="flex flex-col items-center justify-center py-2 hover:bg-gray-100">
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
