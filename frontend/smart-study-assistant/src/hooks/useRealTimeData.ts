import { useState, useEffect, useRef } from 'react';

interface UseRealTimeDataOptions {
  fetchFunction: () => Promise<any>;
  interval?: number; // milliseconds
  enabled?: boolean;
  dependencies?: any[];
}

export const useRealTimeData = <T>({
  fetchFunction,
  interval = 30000, // 30 seconds default
  enabled = true,
  dependencies = []
}: UseRealTimeDataOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch data');
        console.error('Real-time data fetch error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(false); // Don't show loading for background updates
      }, interval);
    }
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const refresh = () => {
    fetchData(true);
  };

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchData(true);
    
    // Start polling
    startPolling();
    
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [enabled, interval, ...dependencies]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [enabled, interval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    startPolling,
    stopPolling
  };
};

// Hook specifically for admin data with shorter intervals
export const useAdminRealTimeData = <T>(
  fetchFunction: () => Promise<T>,
  options?: Partial<UseRealTimeDataOptions>
) => {
  return useRealTimeData<T>({
    fetchFunction,
    interval: 15000, // 15 seconds for admin data
    enabled: true,
    ...options
  });
};

// Hook for AI logs with very short intervals
export const useAiLogsRealTime = <T>(
  fetchFunction: () => Promise<T>,
  options?: Partial<UseRealTimeDataOptions>
) => {
  return useRealTimeData<T>({
    fetchFunction,
    interval: 5000, // 5 seconds for AI logs
    enabled: true,
    ...options
  });
};
