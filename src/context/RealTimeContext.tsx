
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';

interface RealTimeContextType {
  isConnected: boolean;
  subscribe: (collection: string, callback: (data: any) => void) => () => void;
  unsubscribe: (collection: string, callback: (data: any) => void) => void;
  forceRefresh: (collections?: string[]) => void;
  updateCollection: (collection: string, data: any) => void;
  getCollectionData: (collection: string) => any[];
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const { loadUserData, sdk } = useCommerce();
  const [isConnected, setIsConnected] = useState(true);
  const [subscribers, setSubscribers] = useState<Record<string, Set<(data: any) => void>>>({});
  const [collectionData, setCollectionData] = useState<Record<string, any[]>>({});
  
  // Polling interval for real-time updates (every 5 seconds)
  const POLLING_INTERVAL = 5000;

  const subscribe = useCallback((collection: string, callback: (data: any) => void) => {
    setSubscribers(prev => ({
      ...prev,
      [collection]: (prev[collection] || new Set()).add(callback)
    }));

    return () => unsubscribe(collection, callback);
  }, []);

  const unsubscribe = useCallback((collection: string, callback: (data: any) => void) => {
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
  }, []);

  const updateCollection = useCallback((collection: string, data: any) => {
    setCollectionData(prev => ({
      ...prev,
      [collection]: Array.isArray(data) ? data : [data]
    }));

    // Notify subscribers
    subscribers[collection]?.forEach(callback => callback(data));
  }, [subscribers]);

  const getCollectionData = useCallback((collection: string) => {
    return collectionData[collection] || [];
  }, [collectionData]);

  const forceRefresh = useCallback(async (collections?: string[]) => {
    if (!sdk) return;

    try {
      const collectionsToRefresh = collections || Object.keys(subscribers);
      
      for (const collection of collectionsToRefresh) {
        let result: any = [];
        
        try {
          switch (collection) {
            case 'products':
              result = await sdk.getProducts();
              break;
            case 'orders':
              result = await sdk.getOrders();
              break;
            case 'stores':
              result = await sdk.getStores();
              break;
            case 'notifications':
              // Skip if no current user
              if (!loadUserData) continue;
              result = [];
              break;
            default:
              continue;
          }
          
          if (Array.isArray(result)) {
            updateCollection(collection, result);
          }
        } catch (error) {
          console.error(`Error refreshing ${collection}:`, error);
        }
      }
      
      if (loadUserData) {
        await loadUserData();
      }
    } catch (error) {
      console.error('Force refresh error:', error);
    }
  }, [sdk, subscribers, updateCollection, loadUserData]);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(subscribers).length > 0) {
        forceRefresh();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [subscribers, forceRefresh]);

  const value: RealTimeContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    forceRefresh,
    updateCollection,
    getCollectionData
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

// Export aliases for enhanced real-time functionality
export const EnhancedRealTimeProvider = RealTimeProvider;
export const useEnhancedRealTime = useRealTime;
