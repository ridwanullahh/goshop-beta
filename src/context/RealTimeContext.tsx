
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
  const { loadUserData } = useCommerce();
  const [isConnected, setIsConnected] = useState(true);
  const [subscribers, setSubscribers] = useState<Record<string, Set<(data: any) => void>>>({});
  
  // Polling interval for real-time updates (every 5 seconds)
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
    try {
      await loadUserData();
      
      // Notify all subscribers
      Object.keys(subscribers).forEach(collection => {
        if (!collections || collections.includes(collection)) {
          subscribers[collection]?.forEach(callback => callback({ refreshed: true }));
        }
      });
    } catch (error) {
      console.error('Force refresh error:', error);
    }
  };

  // Set up polling for real-time updates
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
