
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './context/ThemeProvider';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Category from './pages/Category';

import StoresDirectory from './pages/StoresDirectory';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import MyWallet from './pages/MyWallet';
import LiveShopping from './pages/LiveShopping';
import LiveStream from './pages/LiveStream';
import ComparePage from './pages/ComparePage';
import CommunityHub from './pages/CommunityHub';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboardAnalytics from './pages/seller-dashboard/Analytics';
import SellerDashboardMarketing from './pages/seller-dashboard/Marketing';
import SellerDashboardReviews from './pages/seller-dashboard/Reviews';
import SellerDashboardPayments from './pages/seller-dashboard/Payments';
import SellerDashboardSettings from './pages/seller-dashboard/Settings';
import SellerDashboardOrders from './pages/seller-dashboard/Orders';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CommerceProvider } from './context/CommerceContext';
import { RealTimeProvider } from './context/RealTimeContext';
import { EnhancedRealTimeProvider } from './context/EnhancedRealTimeContext';
import EnhancedCustomerDashboard from './components/EnhancedCustomerDashboard';
import EnhancedSellerDashboard from './components/EnhancedSellerDashboard';
import { MobileDashboardLayout } from '@/components/MobileDashboardLayout';
import StoreDetail from './pages/StoreDetail';
import OrderDetail from './pages/OrderDetail';
import Notifications from './pages/Notifications';
import BlogArchive from './pages/BlogArchive';
import BlogSingle from './pages/BlogSingle';
import SellerDashboardBlog from './pages/seller-dashboard/Blog';
import EnhancedCheckout from './pages/EnhancedCheckout';
import RefundDispute from './pages/RefundDispute';
import Wallet from './pages/Wallet';
import { BottomNavigation } from './components/BottomNavigation';
import EnhancedProducts from './pages/seller-dashboard/EnhancedProducts';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CommerceProvider>
      <RealTimeProvider>
        <EnhancedRealTimeProvider>
        <BrowserRouter>
          <div className="App">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/stores" element={<StoresDirectory />} />
              <Route path="/stores/:slug" element={<StoreDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wallet" element={<MyWallet />} />
              <Route path="/live" element={<LiveShopping />} />
              <Route path="/live/:id" element={<LiveStream />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/community" element={<CommunityHub />} />
              <Route path="/support" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route
                path="/customer-dashboard"
                element={
                  <ProtectedRoute>
                    <MobileDashboardLayout userType="customer">
                      <EnhancedCustomerDashboard />
                    </MobileDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller-dashboard"
                element={
                  <ProtectedRoute>
                    <MobileDashboardLayout userType="seller">
                      <EnhancedSellerDashboard />
                    </MobileDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/seller-dashboard/analytics" element={<SellerDashboardAnalytics />} />
              <Route path="/seller-dashboard/marketing" element={<SellerDashboardMarketing />} />
              <Route path="/seller-dashboard/reviews" element={<SellerDashboardReviews />} />
              <Route path="/seller-dashboard/payments" element={<SellerDashboardPayments />} />
              <Route path="/seller-dashboard/orders" element={<SellerDashboardOrders />} />
              <Route path="/seller-dashboard/settings" element={<SellerDashboardSettings />} />
              <Route path="/seller-dashboard/blog" element={<SellerDashboardBlog />} />
              <Route path="/seller-dashboard/products-enhanced" element={<EnhancedProducts />} />
              <Route path="/blog" element={<BlogArchive />} />
              <Route path="/blog/:slug" element={<BlogSingle />} />
              <Route path="/checkout-enhanced" element={<EnhancedCheckout />} />
              <Route path="/refunds-disputes" element={<RefundDispute />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route
                path="/affiliate-dashboard"
                element={
                  <ProtectedRoute>
                    <MobileDashboardLayout userType="affiliate">
                      <AffiliateDashboard />
                    </MobileDashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute>
                    <MobileDashboardLayout userType="admin">
                      <AdminDashboard />
                    </MobileDashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* Direct store slug route - must be last to avoid conflicts */}
              <Route path="/:storeSlug" element={<StoreDetail />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
        </EnhancedRealTimeProvider>
      </RealTimeProvider>
    </CommerceProvider>
    </ThemeProvider>
  );
}

export default App;
