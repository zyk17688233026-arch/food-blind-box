import { useState, useEffect } from 'react';
import { Location } from '../types';
import { getCurrentPosition } from '../utils/geolocation';
import { useStore } from '../store';

export const useLocation = () => {
  const { currentLocation, setLocation } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async (force: boolean = false) => {
    // 如果已经有缓存的位置（用户手动选择的，或者上一次定位的），且不强制刷新时，不要覆盖
    if (currentLocation && !force) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      setLocation(pos);
    } catch (err: any) {
      setError(err.message || '获取位置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location: currentLocation, loading, error, refreshLocation: fetchLocation };
};
