import React from 'react';
import { Star, MapPin, Clock, Phone, Heart, Info } from 'lucide-react';
import { Restaurant } from '../types';
import { useStore } from '../store';

interface Props {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<Props> = ({ restaurant }) => {
  const { favorites, toggleFav } = useStore();
  const isFav = favorites.includes(restaurant.id);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
      <div className="relative h-48 w-full">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <button 
          onClick={() => toggleFav(restaurant.id)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-90"
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-2xl font-bold mb-2 truncate drop-shadow-md">{restaurant.name}</h2>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <div className="flex items-center bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <span>距你约 {restaurant.distance}m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 bg-gray-50/50">
        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          {restaurant.cuisine.map((tag, idx) => (
            <span key={idx} className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md font-medium border border-orange-200/50">
              {tag}
            </span>
          ))}
        </div>

        {/* 详细信息 */}
        <div className="space-y-2.5 text-sm text-gray-600">
          {restaurant.openingHours && (
            <div className="flex items-start">
              <Clock className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
              <span className="break-words">营业时间：{restaurant.openingHours}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-start">
              <Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
              <span>联系电话：{restaurant.phone}</span>
            </div>
          )}
          {restaurant.address && (
            <div className="flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
              <span className="break-words text-gray-500 text-xs mt-0.5">{restaurant.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
