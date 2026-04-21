import React from 'react';
import { motion } from 'framer-motion';
import { DISTANCE_RANGES } from '../constants';
import { useStore } from '../store';

export const DistanceSelector: React.FC = () => {
  const { distance, setDistance } = useStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">选择搜索距离</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DISTANCE_RANGES.map((range) => (
          <motion.button
            key={range.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setDistance(range.id)}
          className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
            distance === range.id
              ? 'border-orange-500 bg-orange-50'
              : 'border-transparent bg-white hover:bg-gray-50'
          }`}
        >
          {distance === range.id && (
            <motion.div
              layoutId="distance-active"
              className="absolute inset-0 bg-orange-100/50"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className={`relative z-10 font-bold ${
            distance === range.id ? 'text-orange-600' : 'text-gray-700'
          }`}>
            {range.label}
          </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
