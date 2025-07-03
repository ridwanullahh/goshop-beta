
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CommerceProvider } from '@/context/CommerceContext';
import { RealTimeProvider } from '@/context/RealTimeContext';
import { Toaster } from 'sonner';
import { BottomNavigation } from '@/components/BottomNavigation';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ProductDetails from '@/pages/ProductDetails';
import Categories from '@/pages/Categories';
import CategoryProducts from '@/pages/CategoryProducts';
import Cart from '@/pages/Cart';
import CustomerDashboard from '@/pages/CustomerDashboard';
import SellerDashboard from '@/pages/SellerDashboard';

// Lazy load other pages
const Products = React.lazy(() => import('@/pages/Products'));
const Stores = React.lazy(() => import('@/pages/Stores'));
const Search = React.lazy(() => import('@/pages/Search'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const TrackOrder = React.lazy(() => import('@/pages/TrackOrder'));
const ContactUs = React.lazy(() => import('@/pages/ContactUs'));
const Help = React.lazy(() => import('@/pages/Help'));

function App() {
  return (
    <Router>
      <CommerceProvider>
        <RealTimeProvider>
          <div className="min-h-screen bg-background">
            <React.Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:slug" element={<CategoryProducts />} />
                <Route path="/stores" element={<Stores />} />
                <Route path="/:storeSlug" element={<Stores />} />
                <Route path="/search" element={<Search />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/seller-dashboard" element={<SellerDashboard />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/help" element={<Help />} />
                
                {/* Catch all route - redirect to home */}
                <Route path="*" element={<Home />} />
              </Routes>
            </React.Suspense>
            
            <BottomNavigation />
            <Toaster position="top-right" />
          </div>
        </RealTimeProvider>
      </CommerceProvider>
    </Router>
  );
}

export default App;
