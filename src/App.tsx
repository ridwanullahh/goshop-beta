import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './context/ThemeProvider';
import { TranslationProvider } from './components/providers/TranslationProvider';
import { AutoTranslateProvider } from './components/providers/AutoTranslateProvider';
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
import Help from './pages/Help';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import CustomerDashboard from './pages/CustomerDashboard';
import ReturnsRefunds from './pages/ReturnsRefunds';
import ShippingInfo from './pages/ShippingInfo';
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
import { MobileDashboardLayout } from '@/components/MobileDashboardLayout';
import EnhancedCustomerDashboard from './components/EnhancedCustomerDashboard';
import EnhancedSellerDashboard from './components/EnhancedSellerDashboard';
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
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <CommerceProvider>
        <RealTimeProvider>
            <BrowserRouter>
              <TranslationProvider>
          <AutoTranslateProvider>
              <div className="App">
                <Toaster />
                <Routes>
                  {/* Public Routes */}
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
                  <Route path="/checkout-enhanced" element={<EnhancedCheckout />} />
                  <Route path="/live" element={<LiveShopping />} />
                  <Route path="/live/:id" element={<LiveStream />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/community" element={<CommunityHub />} />
                  <Route path="/support" element={<HelpCenter />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/returns" element={<ReturnsRefunds />} />
                  <Route path="/shipping" element={<ShippingInfo />} />
                  <Route path="/blog" element={<BlogArchive />} />
                  <Route path="/blog/:slug" element={<BlogSingle />} />
                  <Route path="/:storeSlug" element={<StoreDetail />} />

                  {/* Customer Dashboard */}
                  <Route path="/customer-dashboard" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><EnhancedCustomerDashboard /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/orders" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Orders /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/wishlist" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Wishlist /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/profile" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Profile /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/wallet" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Wallet /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/notifications" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Notifications /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/support" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><HelpCenter /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/customer-dashboard/returns" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><RefundDispute /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Orders /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/order/:id" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><OrderDetail /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Wishlist /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Profile /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/wallet" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Wallet /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><Notifications /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/refunds-disputes" element={<ProtectedRoute><MobileDashboardLayout userType="customer"><RefundDispute /></MobileDashboardLayout></ProtectedRoute>} />

                  {/* Seller Dashboard - ALL wrapped with MobileDashboardLayout */}
                  <Route path="/seller-dashboard" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><EnhancedSellerDashboard /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/analytics" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardAnalytics /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/marketing" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardMarketing /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/reviews" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardReviews /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/payments" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardPayments /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/orders" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardOrders /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/settings" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardSettings /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/blog" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><SellerDashboardBlog /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/seller-dashboard/products-enhanced" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><MobileDashboardLayout userType="seller"><EnhancedProducts /></MobileDashboardLayout></ProtectedRoute>} />

                  {/* Affiliate Dashboard */}
                  <Route path="/affiliate-dashboard" element={<ProtectedRoute allowedRoles={['affiliate', 'admin']}><MobileDashboardLayout userType="affiliate"><AffiliateDashboard /></MobileDashboardLayout></ProtectedRoute>} />
                  <Route path="/affiliate-dashboard/wallet" element={<ProtectedRoute allowedRoles={['affiliate', 'admin']}><MobileDashboardLayout userType="affiliate"><Wallet /></MobileDashboardLayout></ProtectedRoute>} />

                  {/* Admin Dashboard */}
                  <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><MobileDashboardLayout userType="admin"><AdminDashboard /></MobileDashboardLayout></ProtectedRoute>} />
                </Routes>
                <BottomNavigation />
              </div>
          </AutoTranslateProvider>
              </TranslationProvider>
            </BrowserRouter>
        </RealTimeProvider>
      </CommerceProvider>
    </ThemeProvider>
  );
}

export default App;
