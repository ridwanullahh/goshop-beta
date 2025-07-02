
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCommerce } from '@/context/CommerceContext';
import { Search, ShoppingCart, User, Menu, Bell, Heart } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { WishlistModal } from './WishlistModal';
import { NotificationsModal } from './NotificationsModal';
import { CartSidebar } from './CartSidebar';

export function Header() {
  const { currentUser, cart, logout } = useCommerce();
  const location = useLocation();

  const cartItemCount = cart?.items?.length || 0;

  // Don't show header on auth pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-commerce rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl bg-gradient-commerce bg-clip-text text-transparent">
                CommerceOS
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link 
                to="/products" 
                className="transition-colors hover:text-primary"
              >
                Products
              </Link>
              <Link 
                to="/categories" 
                className="transition-colors hover:text-primary"
              >
                Categories
              </Link>
              <Link 
                to="/deals" 
                className="transition-colors hover:text-primary"
              >
                Deals
              </Link>
            </nav>
          </div>

          {/* Search - Icon Only */}
          <div className="flex-1 max-w-2xl mx-8 flex justify-center">
            <SearchModal>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Search className="h-5 w-5" />
              </Button>
            </SearchModal>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsModal>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </NotificationsModal>

            {/* Wishlist */}
            <WishlistModal>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  5
                </Badge>
              </Button>
            </WishlistModal>

            {/* Cart */}
            <CartSidebar>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-secondary text-secondary-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartSidebar>

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.roles?.includes('seller') ? 'Seller Account' : 
                         currentUser.roles?.includes('affiliate') ? 'Affiliate Account' : 'Buyer Account'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  {currentUser.roles?.includes('seller') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/seller/dashboard">Seller Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/products">My Products</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {currentUser.roles?.includes('affiliate') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/affiliate/dashboard">Affiliate Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="commerce">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
