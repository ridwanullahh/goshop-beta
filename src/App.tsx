import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CommerceProvider } from "@/context/CommerceContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import CustomerDashboard from "./pages/CustomerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerOnboarding from "./pages/CustomerOnboarding";
import SellerOnboarding from "./pages/SellerOnboarding";
import LiveShopping from "./pages/LiveShopping";
import CommunityHub from "./pages/CommunityHub";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CommerceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/live" element={<LiveShopping />} />
            <Route path="/community" element={<CommunityHub />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/customer-onboarding" element={<CustomerOnboarding />} />
            <Route path="/seller-onboarding" element={<SellerOnboarding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CommerceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
