import { BlindBoxRecord } from '../types';
import { STORAGE_KEYS } from '../constants';

export const getHistory = (): BlindBoxRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to get history', e);
    return [];
  }
};

export const saveRecord = (record: BlindBoxRecord) => {
  try {
    const history = getHistory();
    history.unshift(record);
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save record', e);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
};

export const getFavorites = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const toggleFavorite = (restaurantId: string): boolean => {
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(restaurantId);
    let isFavorite = false;
    
    if (index === -1) {
      favorites.push(restaurantId);
      isFavorite = true;
    } else {
      favorites.splice(index, 1);
    }
    
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return isFavorite;
  } catch (e) {
    console.error('Failed to toggle favorite', e);
    return false;
  }
};
