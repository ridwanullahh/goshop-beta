
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CommerceSDK, Product, Order, Seller, User, CartItem, WishlistItem, Notification } from '@/lib/commerce-sdk';
import { toast } from 'sonner';

interface CommerceContextType {
  sdk: CommerceSDK;
  currentUser: User | null;
  products: Product[];
  cart: {
    items: CartItem[];
  } | null;
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  notifications: Notification[];
  orders: Order[];
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<any>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  loadUserData: () => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [sdk] = useState(() => new CommerceSDK());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cart = {
    items: cartItems
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      return await sdk.searchProducts(query);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      const [userCart, userWishlist, userNotifications, userOrders] = await Promise.all([
        sdk.getCart(currentUser.id),
        sdk.getWishlist(currentUser.id),
        sdk.getNotifications(currentUser.id),
        sdk.getOrders(currentUser.id)
      ]);

      setCartItems(userCart);
      setWishlistItems(userWishlist);
      setNotifications(userNotifications);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const result = await sdk.login(credentials);
      
      if (result) {
        const user = await sdk.getCurrentUser();
        if (user) {
          setCurrentUser({
            ...user,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
          });
          await loadUserData();
        }
        toast.success('Login successful!');
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await sdk.logout();
      setCurrentUser(null);
      setCartItems([]);
      setWishlistItems([]);
      setNotifications([]);
      setOrders([]);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const result = await sdk.register(userData);
      
      if (result) {
        const user = await sdk.getCurrentUser();
        if (user) {
          setCurrentUser({
            ...user,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
          });
        }
        toast.success('Registration successful!');
        return result;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await sdk.addToCart(currentUser.id, productId, quantity);
      await loadUserData();
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await sdk.sdk.delete('cart_items', itemId);
      await loadUserData();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!currentUser) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await sdk.sdk.insert('wishlist_items', {
        userId: currentUser.id,
        productId
      });
      await loadUserData();
      toast.success('Item added to wishlist');
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      await sdk.sdk.delete('wishlist_items', itemId);
      await loadUserData();
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await sdk.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const checkCurrentUser = async () => {
    try {
      const user = await sdk.getCurrentUser();
      if (user) {
        setCurrentUser({
          ...user,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        });
        await loadUserData();
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCurrentUser();
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const value: CommerceContextType = {
    sdk,
    currentUser,
    products,
    cart,
    cartItems,
    wishlistItems,
    notifications,
    orders,
    isLoading,
    login,
    logout,
    register,
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
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
