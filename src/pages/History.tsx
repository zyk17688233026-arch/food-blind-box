import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getHistory, clearHistory } from '../utils/storage';
import { BlindBoxRecord, Restaurant } from '../types';
import { useStore } from '../store';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [history, setHistory] = useState<BlindBoxRecord[]>(getHistory());
  const { favorites, toggleFav } = useStore();

  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setHistory([]);
    }
  };

  // 因为移除了 MOCK_RESTAURANTS，我们需要从历史记录中提取收藏的商家信息
  // 如果用户收藏了某个商家，那么这个商家一定在历史记录中出现过
  const favoriteRestaurants = history
    .filter(record => favorites.includes(record.restaurant.id))
    .map(record => record.restaurant)
    // 去重
    .filter((restaurant, index, self) => 
      index === self.findIndex((t) => t.id === restaurant.id)
    );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-[#FFF8F0]"
    >
      <header className="sticky top-0 z-50 bg-[#FFF8F0]/80 backdrop-blur-md flex items-center justify-between p-4 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">我的足迹</h1>
        {activeTab === 'history' && history.length > 0 ? (
          <button 
            onClick={handleClearHistory}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Trash2 className="w-5 h-5 text-gray-600" />
          </button>
        ) : <div className="w-10" />}
      </header>

      <main className="max-w-md mx-auto px-4 pt-2">
        {/* Tabs */}
        <div className="flex bg-white rounded-full p-1 mb-6 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'history' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'text-gray-500'
            }`}
          >
            盲盒历史
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'favorites' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'text-gray-500'
            }`}
          >
            我的收藏
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'history' ? (
            history.length > 0 ? (
              history.map((record, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <img 
                    src={record.restaurant.image} 
                    alt={record.restaurant.name} 
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{record.restaurant.name}</h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {record.priceRange}元
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>暂无盲盒记录，快去抽取吧！</p>
              </div>
            )
          ) : (
            favoriteRestaurants.length > 0 ? (
              favoriteRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{restaurant.name}</h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span className="text-orange-500 font-medium">★ {restaurant.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{restaurant.cuisine.join('/')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFav(restaurant.id)}
                    className="p-2"
                  >
                    <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>暂无收藏商家，遇到喜欢的记得点亮红心哦！</p>
              </div>
            )
          )}
        </div>
      </main>
    </motion.div>
  );
};
