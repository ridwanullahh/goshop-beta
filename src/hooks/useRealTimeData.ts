
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
      const result = await sdk.get(collection);
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
