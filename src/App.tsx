import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { ResultPage } from './pages/Result';
import { HistoryPage } from './pages/History';
import { MapPickerPage } from './pages/MapPicker';

function App() {
  // 从 Vite 环境变量中读取 base 路径（对应 vite.config.ts 里的 base 配置）
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <div className="font-sans antialiased text-gray-900 selection:bg-orange-100 selection:text-orange-900">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/map" element={<MapPickerPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;
