
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CommerceProvider } from '@/context/CommerceContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

// Import all pages
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import Wishlist from '@/pages/Wishlist';
import Search from '@/pages/Search';
import Category from '@/pages/Category';
import Store from '@/pages/Store';
import Stores from '@/pages/Stores';
import Help from '@/pages/Help';
import CommunityHub from '@/pages/CommunityHub';
import LiveShopping from '@/pages/LiveShopping';
import TrackOrder from '@/pages/TrackOrder';
import ReturnsRefunds from '@/pages/ReturnsRefunds';
import ShippingInfo from '@/pages/ShippingInfo';
import ContactUs from '@/pages/ContactUs';
import BlogArchive from '@/pages/BlogArchive';
import BlogSingle from '@/pages/BlogSingle';
import HelpArticle from '@/pages/HelpArticle';
import CrowdCheckout from '@/pages/CrowdCheckout';

// Dashboard pages
import AdminDashboard from '@/pages/AdminDashboard';
import SellerDashboard from '@/pages/SellerDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';
import AffiliateDashboard from '@/pages/AffiliateDashboard';

// Onboarding pages
import SellerOnboarding from '@/pages/SellerOnboarding';
import AffiliateOnboarding from '@/pages/AffiliateOnboarding';

function App() {
  return (
    <CommerceProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/store/:slug" element={<Store />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/community" element={<CommunityHub />} />
            <Route path="/live" element={<LiveShopping />} />
            <Route path="/help" element={<Help />} />
            <Route path="/help/:slug" element={<HelpArticle />} />
            <Route path="/blog" element={<BlogArchive />} />
            <Route path="/blog/:slug" element={<BlogSingle />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/returns-refunds" element={<ReturnsRefunds />} />
            <Route path="/shipping-info" element={<ShippingInfo />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/crowd-checkout/:orderId" element={<CrowdCheckout />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller-dashboard"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliate-dashboard"
              element={
                <ProtectedRoute allowedRoles={['affiliate', 'admin']}>
                  <AffiliateDashboard />
                </ProtectedRoute>
              }
            />

            {/* Onboarding Routes */}
            <Route
              path="/seller-onboarding"
              element={
                <ProtectedRoute allowedRoles={['seller']} requireOnboarding={false}>
                  <SellerOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliate-onboarding"
              element={
                <ProtectedRoute allowedRoles={['affiliate']} requireOnboarding={false}>
                  <AffiliateOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-2">404</h1>
                    <p className="text-muted-foreground mb-4">Page not found</p>
                    <a href="/" className="text-primary hover:underline">
                      Go back home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </CommerceProvider>
  );
}

export default App;
