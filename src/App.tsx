import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CommerceProvider } from "@/context/CommerceContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import StoresDirectory from "./pages/StoresDirectory";
import StoreDetail from "./pages/StoreDetail";
import CustomerDashboard from "./pages/CustomerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerOnboarding from "./pages/CustomerOnboarding";
import SellerOnboarding from "./pages/SellerOnboarding";
import LiveShopping from "./pages/LiveShopping";
import CommunityHub from "./pages/CommunityHub";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import AffiliateOnboarding from "./pages/AffiliateOnboarding";
import Checkout from "./pages/Checkout";
import HelpCenter from "./pages/HelpCenter";
import TrackOrder from "./pages/TrackOrder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CommerceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categorySlug" element={<CategoryDetail />} />
              <Route path="/stores" element={<StoresDirectory />} />
              <Route path="/stores/:storeSlug" element={<StoreDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/live" element={<LiveShopping />} />
              <Route path="/community" element={<CommunityHub />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/track-order" element={<TrackOrder />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/customer-dashboard" element={
                <ProtectedRoute requireAuth allowedRoles={['customer', 'buyer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/seller-dashboard" element={
                <ProtectedRoute requireAuth allowedRoles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requireAuth allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/affiliate-dashboard" element={
                <ProtectedRoute requireAuth allowedRoles={['affiliate']}>
                  <AffiliateDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Onboarding Routes */}
              <Route path="/customer-onboarding" element={
                <ProtectedRoute requireAuth allowedRoles={['customer', 'buyer']}>
                  <CustomerOnboarding />
                </ProtectedRoute>
              } />
              
              <Route path="/seller-onboarding" element={
                <ProtectedRoute requireAuth allowedRoles={['seller']}>
                  <SellerOnboarding />
                </ProtectedRoute>
              } />
              
              <Route path="/affiliate-onboarding" element={
                <ProtectedRoute requireAuth allowedRoles={['affiliate']}>
                  <AffiliateOnboarding />
                </ProtectedRoute>
              } />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
      </CommerceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
