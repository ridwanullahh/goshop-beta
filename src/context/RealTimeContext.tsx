
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';

interface RealTimeContextType {
  isConnected: boolean;
  subscribe: (collection: string, callback: (data: any) => void) => () => void;
  unsubscribe: (collection: string, callback: (data: any) => void) => void;
  forceRefresh: (collections?: string[]) => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const { loadUserData, sdk } = useCommerce();
  const [isConnected, setIsConnected] = useState(true);
  const [subscribers, setSubscribers] = useState<Record<string, Set<(data: any) => void>>>({});
  
  const POLLING_INTERVAL = 5000;

  const subscribe = (collection: string, callback: (data: any) => void) => {
    setSubscribers(prev => ({
      ...prev,
      [collection]: (prev[collection] || new Set()).add(callback)
    }));

    return () => unsubscribe(collection, callback);
  };

  const unsubscribe = (collection: string, callback: (data: any) => void) => {
    setSubscribers(prev => {
      const collectionSubs = prev[collection];
      if (collectionSubs) {
        collectionSubs.delete(callback);
        if (collectionSubs.size === 0) {
          const { [collection]: _, ...rest } = prev;
          return rest;
        }
      }
      return prev;
    });
  };

  const forceRefresh = async (collections?: string[]) => {
    if (!sdk) return;
    
    try {
      await loadUserData();
      
      const collectionsToNotify = collections || Object.keys(subscribers);
      
      for (const collection of collectionsToNotify) {
        const callbacks = subscribers[collection];
        if (callbacks) {
          let data;
          try {
            switch (collection) {
              case 'products':
                data = await sdk.getProducts();
                break;
              case 'orders':
                data = await sdk.getOrders();
                break;
              case 'stores':
                data = await sdk.getStores();
                break;
              case 'categories':
                data = await sdk.getCategories();
                break;
              default:
                data = await sdk.get(collection);
            }
            
            // Ensure data is always an array
            const arrayData = Array.isArray(data) ? data : [];
            
            callbacks.forEach(callback => {
              try {
                callback(arrayData);
              } catch (error) {
                console.error(`Error in callback for ${collection}:`, error);
              }
            });
          } catch (error) {
            console.error(`Error fetching ${collection}:`, error);
            callbacks.forEach(callback => {
              try {
                callback([]);
              } catch (callbackError) {
                console.error(`Error in callback for ${collection}:`, callbackError);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Force refresh error:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(subscribers).length > 0) {
        forceRefresh();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [subscribers]);

  const value: RealTimeContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    forceRefresh
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}
