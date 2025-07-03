
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';

interface EnhancedRealTimeContextType {
  isConnected: boolean;
  subscribe: (collection: string, callback: (data: any) => void) => () => void;
  unsubscribe: (collection: string, callback: (data: any) => void) => void;
  forceRefresh: (collections?: string[]) => void;
  updateCollection: (collection: string, data: any) => void;
  getCollectionData: (collection: string) => any[];
}

const EnhancedRealTimeContext = createContext<EnhancedRealTimeContextType | undefined>(undefined);

export function EnhancedRealTimeProvider({ children }: { children: ReactNode }) {
  const { loadUserData, sdk } = useCommerce();
  const [isConnected, setIsConnected] = useState(true);
  const [subscribers, setSubscribers] = useState<Record<string, Set<(data: any) => void>>>({});
  const [collectionData, setCollectionData] = useState<Record<string, any[]>>({});
  
  // Reduced polling interval for better real-time experience
  const POLLING_INTERVAL = 2000; // 2 seconds

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
        let result;
        
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
          default:
            continue;
        }
        
        updateCollection(collection, result);
      }
      
      await loadUserData();
    } catch (error) {
      console.error('Force refresh error:', error);
    }
  }, [sdk, subscribers, updateCollection, loadUserData]);

  // Enhanced polling with exponential backoff
  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 10;
    
    const poll = async () => {
      if (Object.keys(subscribers).length > 0 && pollCount < maxPolls) {
        await forceRefresh();
        pollCount++;
      } else {
        pollCount = 0; // Reset counter
      }
    };

    const interval = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [subscribers, forceRefresh]);

  const value: EnhancedRealTimeContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    forceRefresh,
    updateCollection,
    getCollectionData
  };

  return (
    <EnhancedRealTimeContext.Provider value={value}>
      {children}
    </EnhancedRealTimeContext.Provider>
  );
}

export function useEnhancedRealTime() {
  const context = useContext(EnhancedRealTimeContext);
  if (context === undefined) {
    throw new Error('useEnhancedRealTime must be used within an EnhancedRealTimeProvider');
  }
  return context;
}
