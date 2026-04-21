import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Check } from 'lucide-react';
import { useStore } from '../store';
import { reverseGeocode } from '../utils/geolocation';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component that captures map clicks
const LocationPicker: React.FC<{
  position: L.LatLng | null;
  setPosition: (pos: L.LatLng) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

export const MapPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, setLocation } = useStore();
  
  // Default to Beijing or user's current location
  const initialLat = currentLocation?.latitude || 39.9042;
  const initialLng = currentLocation?.longitude || 116.4074;
  
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(initialLat, initialLng));
  const [address, setAddress] = useState<string>(currentLocation?.address || '正在获取地址...');
  const [loading, setLoading] = useState(false);

  // When position changes, do reverse geocoding
  useEffect(() => {
    const fetchAddress = async () => {
      setLoading(true);
      try {
        const info = await reverseGeocode(position.lat, position.lng);
        setAddress(info.address);
      } catch (err) {
        setAddress('获取地址失败');
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [position]);

  const handleConfirm = async () => {
    try {
      const info = await reverseGeocode(position.lat, position.lng);
      setLocation({
        latitude: position.lat,
        longitude: position.lng,
        ...info
      });
      navigate(-1);
    } catch (err) {
      setLocation({
        latitude: position.lat,
        longitude: position.lng,
        address: address !== '正在获取地址...' && address !== '获取地址失败' ? address : '自定义位置',
        city: '未知城市',
        district: '未知区域'
      });
      navigate(-1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <header className="bg-white sticky top-0 z-50 flex items-center justify-between p-4 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">选择位置</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 relative z-0 h-[60vh] w-full">
        <MapContainer 
          center={[initialLat, initialLng]} 
          zoom={15} 
          className="h-full w-full absolute inset-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker position={position} setPosition={setPosition} />
        </MapContainer>
        
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-gray-700 pointer-events-none z-[1000]">
          点击地图即可选择新位置
        </div>
      </div>

      <div className="bg-white p-6 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-start mb-6">
          <div className="mt-1 bg-orange-100 p-2 rounded-full mr-3 shrink-0">
            <MapPin className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">当前选择位置</p>
            <h3 className="text-gray-800 font-medium leading-snug">
              {loading ? '解析中...' : address}
            </h3>
          </div>
        </div>

        <button 
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/30 transition-transform active:scale-95 disabled:opacity-70"
        >
          <Check className="w-5 h-5" />
          <span>确认位置</span>
        </button>
      </div>
    </motion.div>
  );
};
