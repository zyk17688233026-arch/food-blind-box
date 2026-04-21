import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { useLocation } from '../hooks/useLocation';

export const LocationCard: React.FC = () => {
  const { currentLocation, setLocation } = useStore();
  const { location, loading, error, refreshLocation } = useLocation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync hook location to store only if store location is not set manually
  React.useEffect(() => {
    if (location && !currentLocation) {
      setLocation(location);
    }
  }, [location, setLocation, currentLocation]);

  const handleClick = () => {
    navigate('/map');
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refreshLocation(true);
    setIsRefreshing(false);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center space-x-3 overflow-hidden flex-1">
        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
          <MapPin className="text-orange-500 w-5 h-5" />
        </div>
        <div className="overflow-hidden flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between w-full pr-2">
            <p className="text-xs text-gray-500 mb-0.5">当前位置</p>
            <button 
              onClick={handleRetry}
              disabled={loading || isRefreshing}
              className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
              <span>重定位</span>
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center space-x-2 mt-1">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span className="text-sm font-medium">定位中...</span>
            </div>
          ) : error ? (
            <span className="text-sm font-medium text-red-500 truncate block mt-1" onClick={handleRetry}>
              {error} (点击重试)
            </span>
          ) : (
            <h3 className="text-sm font-medium text-gray-800 truncate block mt-1 pr-2">
              {currentLocation?.address || '未知地址'}
            </h3>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
  );
};
