import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiClient } from '@/lib/api-client';
import type {
  User, Product, Order, Category, CartItem, WishlistItem, Language, Currency
} from '@/lib/commerce-sdk';
import { toast } from 'sonner';
import i18n from '@/i18n';

type CommerceContextType = {
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: { items: CartItem[] };
  wishlistItems: WishlistItem[];
  compareList: string[];
  isLoading: boolean;
  sdk: typeof apiClient;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<User>;
  addToCart: (productId: string, quantity?: number) => Promise<CartItem>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<WishlistItem>;
  searchProducts: (query: string, filters?: any) => Promise<Product[]>;
  loadUserData: () => Promise<void>;
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  currency: Currency;
  setCurrency: (curr: string) => void;
  languages: Language[];
  currencies: Currency[];
  convertCurrency: (amount: number) => number;
};

export const CommerceContext = createContext<CommerceContextType>({
  currentUser: null,
  products: [],
  categories: [],
  orders: [],
  cart: { items: [] },
  wishlistItems: [],
  compareList: [],
  isLoading: false,
  sdk: apiClient,
  login: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
  register: async () => { throw new Error('Not implemented'); },
  addToCart: async () => { throw new Error('Not implemented'); },
  removeFromCart: async () => {},
  updateCartQuantity: async () => {},
  clearCart: async () => {},
  addToWishlist: async () => { throw new Error('Not implemented'); },
  searchProducts: async () => [],
  loadUserData: async () => {},
  addToCompare: () => {},
  removeFromCompare: () => {},
  language: 'en',
  setLanguage: () => {},
  currency: { code: 'USD', exchangeRate: 1, id: '', name: '', symbol: '$' },
  setCurrency: () => {},
  languages: [],
  currencies: [],
  convertCurrency: (amount: number) => amount,
});

export const useCommerce = () => useContext(CommerceContext);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState(i18n.language || 'en');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currency, setCurrencyState] = useState<Currency>({ code: 'USD', exchangeRate: 1, id: '1', name: 'US Dollar', symbol: '$' });
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => { initializeApp(); }, []);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && currencies.length) {
      const found = currencies.find(c => c.code === savedCurrency);
      if (found) setCurrencyState(found);
    }
  }, [currencies]);

  useEffect(() => {
    if (originalProducts.length) {
      const converted = originalProducts.map(p => ({
        ...p,
        price: p.price * currency.exchangeRate,
        originalPrice: p.originalPrice ? p.originalPrice * currency.exchangeRate : undefined
      }));
      setProducts(converted as Product[]);
    }
  }, [currency, originalProducts]);

  const convertCurrency = (amount: number) => amount * currency.exchangeRate;

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      const user = await apiClient.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        const cached = localStorage.getItem('currentUser');
        if (cached) setCurrentUser(JSON.parse(cached));
      }

      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadLanguages(),
        loadCurrencies()
      ]);

      if (user) {
        await loadUserCart();
        await loadUserWishlist();
      }
    } catch (error) {
      console.error('Init error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await apiClient.getProducts();
      setOriginalProducts(data as Product[]);
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadLanguages = async () => {
    try {
      const data = await apiClient.getLanguages();
      setLanguages(data as Language[]);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const loadCurrencies = async () => {
    try {
      const data = await apiClient.getCurrencies();
      setCurrencies(data as Currency[]);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const loadUserCart = async () => {
    try {
      const items = await apiClient.getCart();
      setCart({ items: items as CartItem[] });
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadUserWishlist = async () => {
    try {
      const items = await apiClient.getWishlist();
      setWishlistItems(items as WishlistItem[]);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    await loadUserCart();
    await loadUserWishlist();
  };

  const login = async (credentials: { email: string; password: string }) => {
    const user = await apiClient.login(credentials.email, credentials.password);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    await loadUserCart();
    await loadUserWishlist();
    return user;
  };

  const register = async (userData: any) => {
    const user = await apiClient.register(userData);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    await loadUserCart();
    await loadUserWishlist();
    return user;
  };

  const logout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setCart({ items: [] });
    setWishlistItems([]);
    localStorage.removeItem('currentUser');
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!currentUser) throw new Error('Please login to add items to cart');

    const cartItem = await apiClient.addToCart(productId, quantity);

    setCart(prev => {
      const existingIdx = prev.items.findIndex(i => i.productId === productId);
      if (existingIdx >= 0) {
        const updated = [...prev.items];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + quantity };
        return { items: updated };
      }
      return { items: [...prev.items, cartItem as CartItem] };
    });

    return cartItem as CartItem;
  };

  const removeFromCart = async (productId: string) => {
    if (!currentUser) return;
    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      await apiClient.removeFromCart(item.id);
      setCart(prev => ({ items: prev.items.filter(i => i.productId !== productId) }));
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (!currentUser) return;
    if (quantity <= 0) { await removeFromCart(productId); return; }
    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      await apiClient.updateCartItem(item.id, quantity);
      setCart(prev => ({
        items: prev.items.map(i => i.productId === productId ? { ...i, quantity } : i)
      }));
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;
    await apiClient.clearCart();
    setCart({ items: [] });
  };

  const addToWishlist = async (productId: string) => {
    if (!currentUser) throw new Error('Please login to add items to wishlist');
    const item = await apiClient.addToWishlist(productId);
    setWishlistItems(prev => {
      if (prev.find(i => i.productId === productId)) return prev;
      return [...prev, item as WishlistItem];
    });
    return item as WishlistItem;
  };

  const searchProducts = async (query: string, filters?: any) => {
    try {
      return await apiClient.searchProducts(query, filters) as Product[];
    } catch {
      return [];
    }
  };

  const addToCompare = (productId: string) => {
    if (compareList.includes(productId)) { toast.info('Already in compare'); return; }
    if (compareList.length >= 4) { toast.warning('Max 4 products'); return; }
    setCompareList([...compareList, productId]);
    toast.success('Added to compare');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(id => id !== productId));
    toast.success('Removed from compare');
  };

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setCurrency = (currencyCode: string) => {
    const selected = currencies.find(c => c.code === currencyCode);
    if (selected) {
      setCurrencyState(selected);
      localStorage.setItem('currency', currencyCode);
    }
  };

  const value: CommerceContextType = {
    currentUser, products, categories, orders, cart, wishlistItems, compareList, isLoading,
    sdk: apiClient, login, logout, register, addToCart, removeFromCart, updateCartQuantity,
    clearCart, addToWishlist, searchProducts, loadUserData, addToCompare, removeFromCompare,
    language, setLanguage, currency, setCurrency, languages, currencies, convertCurrency,
  };

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
};

export default CommerceContext;
