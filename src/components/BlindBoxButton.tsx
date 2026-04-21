import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { selectRandomRestaurant } from '../utils/random';
import { saveRecord } from '../utils/storage';
import { fetchRealRestaurants } from '../utils/api';

export const BlindBoxButton: React.FC = () => {
  const [isOpening, setIsOpening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { history, favorites, setCurrentResult, currentLocation, priceRange, distance, addToHistory } = useStore();

  const handleOpen = async () => {
    if (isOpening) return;
    setIsOpening(true);
    setErrorMsg(null);

    try {
      // 在模拟/IP定位的情况下允许抽取
      if (!currentLocation) {
        throw new Error('定位失败，请先确认允许了定位权限或者刷新重试。');
      }

      // 调用高德API/OSM API获取周边真实商家
      const realData = await fetchRealRestaurants(
        currentLocation.latitude,
        currentLocation.longitude,
        priceRange,
        distance
      );
      
      if (!realData || realData.length === 0) {
        throw new Error('啊哦，你附近暂时没有找到合适的餐厅，要不换个地方试试？');
      }

      // Simulate animation delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = selectRandomRestaurant(realData, history, favorites);
      setCurrentResult(result);
      addToHistory(result.id);
      
      // Save record
      saveRecord({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        priceRange,
        location: currentLocation,
        restaurant: result,
        isFavorite: favorites.includes(result.id)
      });

      setIsOpening(false);
      navigate('/result');
    } catch (error: any) {
      console.error('Error during blind box opening:', error);
      
      if (error.message === 'ALL_DRAWN') {
        setErrorMsg('你已经把周边这个距离内的所有餐厅都抽过一遍啦！去历史记录里看看吧，或者扩大搜索距离试试~');
      } else {
        setErrorMsg(error.message || '抽取盲盒时发生了未知错误，请重试');
      }
      setIsOpening(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center h-48 mt-4">
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="text-4xl animate-bounce">🍱</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🥡</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍜</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={
          isOpening
            ? {
                scale: [1, 1.1, 0.95, 1.05, 1],
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5, repeat: Infinity }
              }
            : {
                scale: [1, 1.02, 1],
                transition: { duration: 2, repeat: Infinity }
              }
        }
        onClick={handleOpen}
        disabled={isOpening}
        className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-colors duration-300 ${
          isOpening ? 'bg-orange-400' : 'bg-gradient-to-br from-orange-400 to-orange-600'
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping" />
        <Gift className={`w-10 h-10 mb-1 ${isOpening ? 'animate-pulse' : ''}`} />
        <span className="text-lg font-bold tracking-wider">
          {isOpening ? '抽取中...' : '开盲盒'}
        </span>
      </motion.button>

      {/* Error Message Toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-16 w-full text-center"
          >
            <div className="inline-block bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm shadow-sm border border-red-100">
              {errorMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
