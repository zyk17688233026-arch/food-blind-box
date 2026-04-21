import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { ResultPage } from './pages/Result';
import { HistoryPage } from './pages/History';
import { MapPickerPage } from './pages/MapPicker';

function App() {
  return (
    <BrowserRouter>
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
