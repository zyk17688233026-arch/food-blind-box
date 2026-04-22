import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location, Restaurant } from '../types';
import { getHistory, saveRecord, getFavorites, toggleFavorite } from '../utils/storage';

interface AppState {
  currentLocation: Location | null;
  setLocation: (location: Location) => void;
  
  priceRange: string;
  setPriceRange: (range: string) => void;

  distance: string;
  setDistance: (distance: string) => void;
  
  history: string[]; // 仅存储ID用于过滤
  addToHistory: (id: string) => void;
  
  favorites: string[];
  toggleFav: (id: string) => void;
  
  currentResult: Restaurant | null;
  setCurrentResult: (result: Restaurant | null) => void;

  amapKey: string | null;
  setAmapKey: (key: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentLocation: null,
      setLocation: (location) => set({ currentLocation: location }),
      
      priceRange: '15-25',
      setPriceRange: (range) => set({ priceRange: range }),
      
      distance: '3000',
      setDistance: (dist) => set({ distance: dist }),
      
      history: getHistory().map(h => h.restaurant.id),
      addToHistory: (id) => set((state) => ({ history: [...state.history, id] })),
      
      favorites: getFavorites(),
      toggleFav: (id) => {
        toggleFavorite(id);
        set({ favorites: getFavorites() });
      },
      
      currentResult: null,
      setCurrentResult: (result) => set({ currentResult: result }),

      amapKey: null,
      setAmapKey: (key) => set({ amapKey: key }),
    }),
    {
      name: 'food-blind-box-storage', // 存储到 localStorage 的 key
      // 我们持久化 currentResult，搜索条件，上一次的 location 以及 高德 API Key
      partialize: (state) => ({ 
        currentResult: state.currentResult, 
        priceRange: state.priceRange, 
        distance: state.distance,
        currentLocation: state.currentLocation,
        amapKey: state.amapKey
      }),
      // 处理由于之前的缓存可能存了 null 的情况，确保它 fallback 到默认的 Key
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          amapKey: persistedState.amapKey || null,
        };
      }
    }
  )
);
