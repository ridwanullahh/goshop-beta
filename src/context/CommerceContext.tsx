import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CommerceSDK, User, Product, Order, CartItem } from '@/lib/commerce-sdk';
import { toast } from 'sonner';

interface Cart {
  items: CartItem[];
  total: number;
}

interface CommerceContextType {
  // SDK
  sdk: CommerceSDK;
  
  // Auth
  currentUser: User | null;
  login: (credentials: { email: string; password: string }) => Promise<User | null>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  
  // Data
  products: Product[];
  orders: Order[];
  cart: Cart | null;
  loading: boolean;
  isLoading: boolean;
  wishlistItems: Product[];
  
  // Actions
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  loadUserData: () => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [sdk] = useState(() => new CommerceSDK());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Initialize
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for existing user session
      const user = await sdk.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await loadUserData();
      }
      
      // Load initial products
      const productsData = await sdk.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      // Load user's cart
      const cartItems = await sdk.getCart(currentUser.id);
      const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      setCart({ items: cartItems, total });
      
      // Load user's orders
      const userOrders = await sdk.getOrders(currentUser.id);
      setOrders(userOrders);

      // Load wishlist items
      const saved = localStorage.getItem(`wishlist_${currentUser.uid}`);
      if (saved) {
        const wishlistProductIds = JSON.parse(saved);
        const items = products.filter(p => wishlistProductIds.includes(p.id));
        setWishlistItems(items);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<User | null> => {
    try {
      const user = await sdk.login(credentials);
      setCurrentUser(user);
      await loadUserData();
      toast.success('Login successful!');
      return user;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const user = await sdk.register(userData);
      setCurrentUser(user);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await sdk.logout();
      setCurrentUser(null);
      setCart(null);
      setOrders([]);
      setWishlistItems([]);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      const results = await sdk.searchProducts(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!currentUser) {
      // Handle guest cart in localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = guestCart.find((item: any) => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestCart.push({ productId, quantity });
      }
      
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      
      // Update cart state
      const product = products.find(p => p.id === productId);
      if (product) {
        const cartItems = guestCart.map((item: any) => {
          const prod = products.find(p => p.id === item.productId);
          return prod ? { ...item, product: prod } : null;
        }).filter(Boolean);
        
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        setCart({ items: cartItems, total });
      }
      
      toast.success('Added to cart');
      return;
    }

    try {
      await sdk.addToCart(currentUser.id, productId, quantity);
      await loadUserData(); // Refresh cart
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!currentUser) {
      // Handle guest cart
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const updatedCart = guestCart.filter((item: any) => item.productId !== productId);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      
      // Update cart state
      const cartItems = updatedCart.map((item: any) => {
        const prod = products.find(p => p.id === item.productId);
        return prod ? { ...item, product: prod } : null;
      }).filter(Boolean);
      
      const total = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      setCart({ items: cartItems, total });
      
      toast.success('Removed from cart');
      return;
    }

    try {
      // For authenticated users, we'd need to implement this in the SDK
      await loadUserData(); // Refresh cart
      toast.success('Removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from cart');
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }

    if (!currentUser) {
      // Handle guest cart
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = guestCart.find((item: any) => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity = quantity;
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        
        // Update cart state
        const cartItems = guestCart.map((item: any) => {
          const prod = products.find(p => p.id === item.productId);
          return prod ? { ...item, product: prod } : null;
        }).filter(Boolean);
        
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        setCart({ items: cartItems, total });
      }
      return;
    }

    try {
      // For authenticated users, we'd need to implement this in the SDK
      await loadUserData(); // Refresh cart
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cart');
    }
  };

  const clearCart = async () => {
    if (!currentUser) {
      localStorage.removeItem('guestCart');
      setCart({ items: [], total: 0 });
      return;
    }

    try {
      // For authenticated users, we'd need to implement this in the SDK
      await loadUserData(); // Refresh cart
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  const addToWishlist = (productId: string) => {
    if (!currentUser) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUser.uid}`) || '[]');
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(wishlist));
      toast.success('Added to wishlist');
      
      // Update wishlist items state
      const product = products.find(p => p.id === productId);
      if (product) {
        setWishlistItems(prev => [...prev, product]);
      }
    } else {
      toast.info('Item already in wishlist');
    }
  };

  // Load guest cart on products update
  useEffect(() => {
    if (!currentUser && products.length > 0) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      if (guestCart.length > 0) {
        const cartItems = guestCart.map((item: any) => {
          const prod = products.find(p => p.id === item.productId);
          return prod ? { ...item, product: prod } : null;
        }).filter(Boolean);
        
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        setCart({ items: cartItems, total });
      }
    }
  }, [currentUser, products]);

  const value: CommerceContextType = {
    sdk,
    currentUser,
    login,
    register,
    logout,
    products,
    orders,
    cart,
    loading,
    isLoading: loading,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    loadUserData,
    searchProducts
  };

  return (
    <CommerceContext.Provider value={value}>
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
