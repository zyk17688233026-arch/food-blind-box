export interface Location {
  latitude: number;      // 纬度
  longitude: number;     // 经度
  address: string;       // 详细地址
  city: string;          // 城市
  district: string;      // 区县
}

export type PriceRange = '15-25' | '25-40' | '40-60' | '60-100' | 'custom';

export interface CustomPriceRange {
  min: number;
  max: number;
}

export interface Dish {
  id: string;
  name: string;          // 菜品名称
  image: string;         // 菜品图片
  originalPrice: number; // 原价
  blindBoxPrice: number; // 盲盒价
}

export interface Restaurant {
  id: string;
  name: string;          // 商家名称
  rating: number;        // 评分 0-5
  distance: number;      // 距离（米）
  cuisine: string[];     // 菜系类型/餐厅标签
  image: string;         // 商家封面图URL
  openingHours?: string; // 营业时间
  phone?: string;        // 电话
  address?: string;      // 详细地址
  platform: 'meituan' | 'eleme';  // 所属平台
  platformUrl: string;   // 跳转链接
}

export interface BlindBoxRecord {
  id: string;
  timestamp: number;     // 抽取时间
  priceRange: string;    // 价格区间
  location: Location;    // 当时的位置
  restaurant: Restaurant; // 抽中的商家
  isFavorite: boolean;   // 是否收藏
}
