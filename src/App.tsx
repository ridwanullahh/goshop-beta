
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import MyWallet from './pages/MyWallet';
import LiveShopping from './pages/LiveShopping';
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
import SellerDashboardBlog from './pages/seller-dashboard/Blog';
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

function App() {
  return (
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
              <Route path="/live/:id" element={<LiveShopping />} />
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
              <Route path="/seller-dashboard/settings" element={<SellerDashboardSettings />} />
              <Route path="/seller-dashboard/blog" element={<SellerDashboardBlog />} />
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
              <Route path="/:storeSlug" element={<StoreDetail />} />
            </Routes>
          </div>
        </BrowserRouter>
        </EnhancedRealTimeProvider>
      </RealTimeProvider>
    </CommerceProvider>
  );
}

export default App;
