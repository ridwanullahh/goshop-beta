
import { useEffect, useState } from 'react';
import { useRealTime } from '@/context/RealTimeContext';
import { useCommerce } from '@/context/CommerceContext';

export function useRealTimeData<T>(
  collection: string,
  initialData: T[] = [],
  dependencies: any[] = []
) {
  const { subscribe } = useRealTime();
  const { sdk } = useCommerce();
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let result;
      
      // Use the correct SDK methods based on collection type
      switch (collection) {
        case 'products':
          result = await sdk.getProducts();
          break;
        case 'categories':
          result = await sdk.getCategories();
          break;
        case 'stores':
          result = await sdk.getStores();
          break;
        case 'orders':
          result = await sdk.getOrders();
          break;
        case 'notifications':
          const currentUser = await sdk.getCurrentUser();
          result = await sdk.getNotifications(currentUser?.id || '');
          break;
        default:
          result = [];
      }
      
      setData(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error(`Error fetching ${collection}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const unsubscribe = subscribe(collection, () => {
      fetchData();
    });

    return unsubscribe;
  }, [collection, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}
