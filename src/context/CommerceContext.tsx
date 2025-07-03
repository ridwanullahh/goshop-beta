import React, { createContext, useContext, useEffect, useState } from 'react';
import CommerceSDK, { Product, Order, Seller } from '@/lib/commerce-sdk';
import { useToast } from '@/hooks/use-toast';

interface CommerceContextType {
  sdk: CommerceSDK | null;
  currentUser: any;
  cart: any;
  products: Product[];
  isLoading: boolean;
  cartItems: any[];
  wishlistItems: any[];
  notifications: any[];
  orders: any[];
  // Auth methods
  login: (email: string, password: string) => Promise<string | { otpRequired: boolean }>;
  register: (email: string, password: string, profile?: any) => Promise<void>;
  logout: () => void;
  // Product methods
  refreshProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  // State
  sessionToken: string | null;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<CommerceSDK | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem('commerce_token')
  );
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  // Initialize SDK
  useEffect(() => {
    async function initSDK() {
      try {
        const commerceSDK = new CommerceSDK();

        await commerceSDK.init();
        setSdk(commerceSDK);

        // Load initial data
        if (sessionToken) {
          const user = commerceSDK.getCurrentUser(sessionToken);
          if (user) {
            setCurrentUser(user);
            const userCart = await commerceSDK.getCart(user.id);
            setCart(userCart);
          }
        }

        const allProducts = await commerceSDK.getProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Failed to initialize Commerce SDK:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to commerce backend. Using demo mode.",
          variant: "destructive"
        });
        
        // Set demo products for development
        setProducts([
          {
            id: '1',
            uid: 'demo-1',
            name: 'Wireless Headphones Pro',
            description: 'Premium noise-canceling wireless headphones with 30-hour battery life.',
            price: 299.99,
            originalPrice: 399.99,
            category: 'Electronics',
            tags: ['wireless', 'audio', 'premium'],
            images: ['/placeholder.svg'],
            sellerId: 'seller1',
            sellerName: 'TechCorp',
            inventory: 50,
            rating: 4.8,
            reviewCount: 1247,
            isActive: true,
            isFeatured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            uid: 'demo-2',
            name: 'Smart Fitness Watch',
            description: 'Track your fitness goals with this advanced smartwatch featuring health monitoring.',
            price: 199.99,
            category: 'Wearables',
            tags: ['fitness', 'smartwatch', 'health'],
            images: ['/placeholder.svg'],
            sellerId: 'seller2',
            sellerName: 'FitTech',
            inventory: 30,
            rating: 4.6,
            reviewCount: 892,
            isActive: true,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    initSDK();
  }, [sessionToken, toast]);

  // Load user-specific data when user changes
  useEffect(() => {
    if (currentUser && sdk) {
      // Load cart items
      sdk.getCart(currentUser.id).then(cart => {
        setCartItems(cart?.items || []);
      }).catch(console.error);

      // Load wishlist items
      sdk.getWishlist(currentUser.id).then(wishlist => {
        setWishlistItems(wishlist?.items || []);
      }).catch(console.error);

      // Load notifications
      sdk.getNotifications(currentUser.id).then(notifications => {
        setNotifications(notifications || []);
      }).catch(console.error);

      // Load orders
      sdk.getOrders(currentUser.id).then(orders => {
        setOrders(orders || []);
      }).catch(console.error);
    }
  }, [currentUser, sdk]);

  const login = async (email: string, password: string): Promise<string | { otpRequired: boolean }> => {
    if (!sdk) throw new Error('SDK not initialized');
    
    try {
      const result = await sdk.login(email, password);
      
      if (typeof result === 'string') {
        // Direct login success
        setSessionToken(result);
        localStorage.setItem('commerce_token', result);
        
        const user = sdk.getCurrentUser(result);
        setCurrentUser(user);
        
        if (user) {
          const userCart = await sdk.getCart(user.id);
          setCart(userCart);
        }
        
        return result;
      } else {
        // OTP required
        return result;
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, profile = {}) => {
    if (!sdk) throw new Error('SDK not initialized');
    
    try {
      const user = await sdk.register(email, password, profile);
      toast({
        title: "Account Created",
        description: "Welcome to CommerceOS! Please verify your email."
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = () => {
    if (sessionToken && sdk) {
      sdk.logout(sessionToken);
    }
    setSessionToken(null);
    setCurrentUser(null);
    setCart(null);
    localStorage.removeItem('commerce_token');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  const refreshProducts = async () => {
    if (!sdk) return;
    
    try {
      const allProducts = await sdk.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    if (!sdk) return [];
    
    try {
      return await sdk.searchProducts(query);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!sdk || !currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedCart = await sdk.addToCart(currentUser.id, productId, quantity);
      setCart(updatedCart);
      
      toast({
        title: "Added to Cart",
        description: "Item successfully added to your cart."
      });
    } catch (error) {
      toast({
        title: "Failed to Add Item",
        description: error instanceof Error ? error.message : "Could not add to cart",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!sdk || !currentUser) return;
    
    try {
      const updatedCart = await sdk.removeFromCart(currentUser.id, productId);
      setCart(updatedCart);
      
      toast({
        title: "Removed from Cart",
        description: "Item removed from your cart."
      });
    } catch (error) {
      toast({
        title: "Failed to Remove Item",
        description: error instanceof Error ? error.message : "Could not remove from cart",
        variant: "destructive"
      });
    }
  };

  return (
    <CommerceContext.Provider
      value={{
        sdk,
        currentUser,
        cart,
        products,
        isLoading,
        cartItems,
        wishlistItems,
        notifications,
        orders,
        login,
        register,
        logout,
        refreshProducts,
        searchProducts,
        addToCart,
        removeFromCart,
        sessionToken
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (context === undefined) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
}
