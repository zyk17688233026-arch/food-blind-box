import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2, RefreshCw, ThumbsDown, ExternalLink } from 'lucide-react';
import { useStore } from '../store';
import { RestaurantCard } from '../components/RestaurantCard';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentResult } = useStore();

  useEffect(() => {
    // 只在组件首次挂载且没有 currentResult 时重定向
    // 这样当用户从外卖平台返回时（如果是在同一个标签页），或者切换标签页时不会触发重定向
    if (!currentResult) {
      navigate('/');
    }
  }, []); // 移除 currentResult 和 navigate 依赖，防止状态重置时跳转

  if (!currentResult) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#FFF8F0] pb-24"
    >
      <header className="sticky top-0 z-50 bg-[#FFF8F0]/80 backdrop-blur-md flex items-center justify-between p-4 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">你的盲盒</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm">
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <RestaurantCard restaurant={currentResult} />
        </motion.div>
      </main>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 pb-safe">
        <div className="max-w-md mx-auto flex space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 bg-orange-50 text-orange-600 rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            <span>再来一次</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-[0.5] py-3.5 bg-gray-50 text-gray-600 rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <ThumbsDown className="w-5 h-5" />
            <span>不喜欢</span>
          </button>
          <a 
            href={currentResult.platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
          >
            <span>去下单</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
