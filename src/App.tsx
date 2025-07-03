import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryPage from './pages/CategoryPage';
import Stores from './pages/Stores';
import StorePage from './pages/StorePage';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Live from './pages/Live';
import Community from './pages/Community';
import Support from './pages/Support';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import CustomerDashboard from './pages/CustomerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { CommerceProvider } from './context/CommerceContext';
import { EnhancedRealTimeProvider } from './context/EnhancedRealTimeContext';
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
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/store/:id" element={<StorePage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/live" element={<Live />} />
              <Route path="/community" element={<Community />} />
              <Route path="/support" element={<Support />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
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
