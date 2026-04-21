import { Restaurant } from '../types';

export const STORAGE_KEYS = {
  HISTORY: 'blindbox_history',
  FAVORITES: 'blindbox_favorites',
  SETTINGS: 'blindbox_settings'
};

export const PRICE_RANGES = [
  { id: '15-25', label: '15-25元' },
  { id: '25-40', label: '25-40元' },
  { id: '40-60', label: '40-60元' },
  { id: '60-100', label: '60-100元' }
];

export const DISTANCE_RANGES = [
  { id: '500', label: '500米内' },
  { id: '1000', label: '1公里内' },
  { id: '3000', label: '3公里内' },
  { id: '5000', label: '5公里内' }
];

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: '老北京柴氏风味面馆',
    rating: 4.8,
    distance: 350,
    cuisine: ['中餐', '面食'],
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600',
    platform: 'meituan',
    platformUrl: 'https://waimai.meituan.com/',
  },
  {
    id: '2',
    name: 'Manner Coffee (创智天地店)',
    rating: 4.6,
    distance: 120,
    cuisine: ['咖啡', '轻食'],
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600',
    platform: 'eleme',
    platformUrl: 'https://h5.ele.me/',
  },
  {
    id: '3',
    name: '一风堂拉面',
    rating: 4.7,
    distance: 800,
    cuisine: ['日料', '面食'],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
    platform: 'meituan',
    platformUrl: 'https://waimai.meituan.com/',
  },
  {
    id: '4',
    name: 'Shake Shack',
    rating: 4.5,
    distance: 450,
    cuisine: ['快餐', '汉堡'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    platform: 'eleme',
    platformUrl: 'https://h5.ele.me/',
  },
  {
    id: '5',
    name: '点都德',
    rating: 4.9,
    distance: 1200,
    cuisine: ['粤菜', '点心'],
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=600',
    platform: 'meituan',
    platformUrl: 'https://waimai.meituan.com/',
  },
  {
    id: '6',
    name: 'Wagas (中关村店)',
    rating: 4.4,
    distance: 200,
    cuisine: ['轻食', '健康餐'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    platform: 'eleme',
    platformUrl: 'https://h5.ele.me/',
  },
  {
    id: '7',
    name: '海底捞火锅',
    rating: 4.9,
    distance: 1500,
    cuisine: ['火锅', '川菜'],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600',
    platform: 'meituan',
    platformUrl: 'https://waimai.meituan.com/',
  },
  {
    id: '8',
    name: '喜茶 STARBUCKS',
    rating: 4.5,
    distance: 100,
    cuisine: ['饮品', '甜点'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600',
    platform: 'eleme',
    platformUrl: 'https://h5.ele.me/',
  },
  {
    id: '9',
    name: '西贝莜面村',
    rating: 4.6,
    distance: 900,
    cuisine: ['西北菜', '面食'],
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600',
    platform: 'meituan',
    platformUrl: 'https://waimai.meituan.com/',
  },
  {
    id: '10',
    name: '绿茶餐厅',
    rating: 4.3,
    distance: 1100,
    cuisine: ['江浙菜'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    platform: 'eleme',
    platformUrl: 'https://h5.ele.me/',
  }
];
