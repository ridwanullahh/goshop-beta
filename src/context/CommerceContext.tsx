import React, { createContext, useState, useEffect, useContext } from 'react';
import CommerceSDK, {
  User,
  Product,
  Order,
  Category,
  CartItem,
  WishlistItem
} from '@/lib/commerce-sdk';
import { toast } from 'sonner';

// Define the context type
type CommerceContextType = {
  user: User | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: { items: CartItem[] };
  wishlistItems: WishlistItem[];
  compareList: string[];
  isLoading: boolean;
  sdk: CommerceSDK;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: { 
    email: string; 
    password: string; 
    name: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    roles?: string[];
    businessName?: string;
    phone?: string;
    onboardingCompleted?: boolean;
  }) => Promise<User>;
  addToCart: (productId: string, quantity?: number) => Promise<CartItem>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<WishlistItem>;
  removeFromWishlist: (productId: string) => Promise<void>;
  searchProducts: (query: string, filters?: any) => Promise<Product[]>;
  loadUserData: () => Promise<void>;
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
};

// Create the context with a default value
export const CommerceContext = createContext<CommerceContextType>({
  user: null,
  products: [],
  categories: [],
  orders: [],
  cart: { items: [] },
  wishlistItems: [],
  compareList: [],
  isLoading: false,
  sdk: new CommerceSDK(),
  login: async () => { throw new Error('Login function not implemented'); },
  logout: async () => { throw new Error('Logout function not implemented'); },
  register: async () => { throw new Error('Register function not implemented'); },
  addToCart: async () => { throw new Error('AddToCart function not implemented'); },
  removeFromCart: async () => { throw new Error('removeFromCart function not implemented'); },
  updateCartQuantity: async () => { throw new Error('updateCartQuantity function not implemented'); },
  clearCart: async () => { throw new Error('clearCart function not implemented'); },
  addToWishlist: async () => { throw new Error('addToWishlist function not implemented'); },
  removeFromWishlist: async () => { throw new Error('removeFromWishlist function not implemented'); },
  searchProducts: async () => { return []; },
  loadUserData: async () => { throw new Error('loadUserData function not implemented'); },
  addToCompare: () => { throw new Error('addToCompare function not implemented'); },
  removeFromCompare: () => { throw new Error('removeFromCompare function not implemented'); }
});

// Create a custom hook to use the context
export const useCommerce = () => useContext(CommerceContext);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sdk] = useState(() => new CommerceSDK());

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      const currentUser = await sdk.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        await Promise.all([
          loadUserCart(currentUser.id),
          loadUserWishlist(currentUser.id)
        ]);
      }
      
      await Promise.all([
        loadProducts(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCart = async (userId: string) => {
    try {
      const cartItems = await sdk.getCart(userId);
      setCart({ items: cartItems });
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadUserWishlist = async (userId: string) => {
    try {
      const wishlist = await sdk.getWishlist(userId);
      setWishlistItems(wishlist);
    } catch (error) {
      console.error('Error loading wishlist:', error);
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

  const loadCategories = async () => {
    try {
      const categoriesData = await sdk.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        loadUserCart(user.id),
        loadUserWishlist(user.id)
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const register = async (userData: { 
    email: string; 
    password: string; 
    name: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    roles?: string[];
    businessName?: string;
    phone?: string;
    onboardingCompleted?: boolean;
  }) => {
    try {
      const newUser = await sdk.register(userData);
      setUser(newUser);
      
      // Load user-specific data after registration
      await Promise.all([
        loadUserCart(newUser.id),
        loadUserWishlist(newUser.id)
      ]);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const loggedInUser = await sdk.login(credentials);
      setUser(loggedInUser);
      
      // Load user-specific data after login
      await Promise.all([
        loadUserCart(loggedInUser.id),
        loadUserWishlist(loggedInUser.id)
      ]);
      
      toast.success('Login successful');
      return loggedInUser;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Invalid credentials');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await sdk.logout();
      setUser(null);
      setCart({ items: [] });
      setWishlistItems([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    try {
      const cartItem = await sdk.addToCart(user.id, productId, quantity);
      
      // Update local cart state immediately for better UX
      setCart(prevCart => {
        const existingItemIndex = prevCart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...prevCart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          return { items: updatedItems };
        } else {
          // Add new item
          return { items: [...prevCart.items, cartItem] };
        }
      });
      
      return cartItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const addToWishlist = async (productId: string): Promise<WishlistItem> => {
    if (!user) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const wishlistItem = await sdk.addToWishlist(user.id, productId);
      
      // Update local wishlist state
      setWishlistItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === productId);
        if (existingItem) {
          return prevItems;
        }
        return [...prevItems, wishlistItem];
      });
      
      return wishlistItem;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const wishlistItem = wishlistItems.find(item => item.productId === productId);
      if (!wishlistItem) return;

      await sdk.delete('wishlist', wishlistItem.id);
      
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      await loadUserWishlist(user.id);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      // Find the cart item to remove
      const cartItem = cart.items.find(item => item.productId === productId);
      if (!cartItem) return;

      // Remove from backend
      await sdk.delete('cart_items', cartItem.id);
      
      // Update local state immediately
      setCart(prevCart => ({
        items: prevCart.items.filter(item => item.productId !== productId)
      }));
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Revert local state on error
      await loadUserCart(user.id);
      throw error;
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      // Update in backend
      await sdk.update('cart_items', productId, { quantity });
      
      // Update local state
      setCart(prevCart => ({
        items: prevCart.items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
      }));
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Revert local state on error
      await loadUserCart(user.id);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      // Clear all cart items for user
      const cartItems = await sdk.getCart(user.id);
      await Promise.all(
        cartItems.map(item => sdk.delete('cart_items', item.id))
      );
      
      setCart({ items: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const searchProducts = async (query: string, filters?: any): Promise<Product[]> => {
    try {
      return await sdk.searchProducts(query, filters);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  const addToCompare = (productId: string) => {
    if (compareList.includes(productId)) {
      toast.info('Product already in compare list');
      return;
    }
    if (compareList.length >= 4) {
      toast.warning('You can only compare up to 4 products');
      return;
    }
    setCompareList([...compareList, productId]);
    toast.success('Product added to compare list');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(id => id !== productId));
    toast.success('Product removed from compare list');
  };

  const value: CommerceContextType = {
    user,
    products,
    categories,
    orders,
    cart,
    wishlistItems,
    compareList,
    isLoading,
    sdk,
    login,
    logout,
    register,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    searchProducts,
    loadUserData,
    addToCompare,
    removeFromCompare
  };

  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
};

export default CommerceContext;
