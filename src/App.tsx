
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Stores from './pages/Stores';
import Store from './pages/Store';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import LiveShopping from './pages/LiveShopping';
import CommunityHub from './pages/CommunityHub';
import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CommerceProvider } from './context/CommerceContext';
import { EnhancedRealTimeProvider } from './context/RealTimeContext';
import EnhancedCustomerDashboard from './components/EnhancedCustomerDashboard';
import EnhancedSellerDashboard from './components/EnhancedSellerDashboard';
import { MobileDashboardLayout } from '@/components/MobileDashboardLayout';

function App() {
  return (
    <CommerceProvider>
      <EnhancedRealTimeProvider>
        <BrowserRouter>
          <div className="App">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/store/:id" element={<Store />} />
              <Route path="/search" element={<Search />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/live" element={<LiveShopping />} />
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
            </Routes>
          </div>
        </BrowserRouter>
      </EnhancedRealTimeProvider>
    </CommerceProvider>
  );
}

export default App;
