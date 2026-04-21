import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Utensils, X, Minus, Settings } from 'lucide-react';
import { Window } from '@tauri-apps/api/window';
import { LocationCard } from '../components/LocationCard';
import { DistanceSelector } from '../components/DistanceSelector';
import { BlindBoxButton } from '../components/BlindBoxButton';
import { useStore } from '../store';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { amapKey, setAmapKey } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(amapKey || '');

  const minimizeWindow = () => {
    try {
      const appWindow = new Window('main');
      appWindow.minimize();
    } catch (e) {
      console.log('Not running in Tauri');
    }
  };

  const closeWindow = () => {
    try {
      const appWindow = new Window('main');
      appWindow.close();
    } catch (e) {
      console.log('Not running in Tauri');
    }
  };

  const handleSaveSettings = () => {
    setAmapKey(tempKey);
    setShowSettings(false);
    // Reload page to re-trigger geolocation with new key
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-24 relative overflow-hidden rounded-xl border border-gray-200/50 shadow-2xl">
      {/* 桌面端拖拽区域 (自定义标题栏) */}
      <div className="h-10 w-full drag-region fixed top-0 left-0 z-50 flex justify-between items-center px-3 bg-white/50 backdrop-blur-md">
        <div className="flex space-x-2 no-drag">
          <button onClick={closeWindow} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 active:bg-red-600 transition-colors flex items-center justify-center group">
            <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" />
          </button>
          <button onClick={minimizeWindow} className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 transition-colors flex items-center justify-center group">
            <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100" />
          </button>
          <div className="w-3 h-3 rounded-full bg-green-400 opacity-50"></div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-md mx-auto px-6 pt-16 relative z-10">
        <header className="mb-10 flex justify-between items-start no-drag">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">今天吃什么？</h1>
            <p className="text-gray-500">附近美食，一键抽取</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 active:scale-95 transition-transform"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/history')}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 active:scale-95 transition-transform"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm no-drag">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold mb-4">设置</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">高德地图 Web 服务 API Key</label>
                <p className="text-xs text-gray-500 mb-3">用于桌面端获取高精度定位。请在<a href="https://console.amap.com/dev/key/app" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">高德开放平台</a>申请"Web服务"类型的Key。</p>
                <input 
                  type="text" 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="例如: 8a4b...e5d"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 active:scale-95 transition-all"
                >
                  保存并重新定位
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="mb-8">
          <LocationCard />
        </section>

        <section className="mb-12">
          <DistanceSelector />
        </section>

        <section>
          <BlindBoxButton />
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-4">
          <button className="flex flex-col items-center space-y-1 text-orange-500">
            <Utensils className="w-6 h-6" />
            <span className="text-[10px] font-medium">盲盒</span>
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">历史</span>
          </button>
        </div>
      </div>
    </div>
  );
};
