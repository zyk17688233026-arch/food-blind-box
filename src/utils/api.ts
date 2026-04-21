import { Restaurant } from '../types';
import { useStore } from '../store';

// 简单的图片生成器，根据店铺类型匹配稍微靠谱一点的图片
const generateMockImage = (cuisine: string, amenity: string, name: string) => {
  const typeStr = `${cuisine} ${amenity} ${name}`.toLowerCase();
  
  if (typeStr.includes('burger') || typeStr.includes('fast_food') || typeStr.includes('麦当劳') || typeStr.includes('肯德基')) {
    return 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop';
  }
  if (typeStr.includes('cafe') || typeStr.includes('coffee') || typeStr.includes('咖啡')) {
    return 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop';
  }
  if (typeStr.includes('pizza') || typeStr.includes('披萨')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop';
  }
  if (typeStr.includes('noodle') || typeStr.includes('面')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop';
  }
  if (typeStr.includes('bbq') || typeStr.includes('烧烤')) {
    return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop';
  }
  if (typeStr.includes('japanese') || typeStr.includes('sushi') || typeStr.includes('日料') || typeStr.includes('寿司')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&auto=format&fit=crop';
  }
  if (typeStr.includes('salad') || typeStr.includes('轻食') || typeStr.includes('沙拉')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop';
  }
  
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';
};

// 将 Overpass API 返回的 OSM 节点转换为我们的 Restaurant 结构
const transformOSMNodeToRestaurant = (node: any, priceRange: string, radius: number): Restaurant => {
  // 生成一些随机但合理的评分
  const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5 - 5.0
  const platform = Math.random() > 0.5 ? 'meituan' : 'eleme';

  const name = node.tags?.name || node.tags?.['name:zh'] || '未命名餐厅';
  
  // 提取餐厅真实标签信息
  const cuisineType = node.tags?.cuisine || '';
  const amenityType = node.tags?.amenity || '';
  const dietInfo = [
    node.tags?.['diet:vegetarian'] === 'yes' ? '素食' : '',
    node.tags?.['diet:halal'] === 'yes' ? '清真' : '',
  ].filter(Boolean);

  let displayCuisine = [];
  if (cuisineType) {
    displayCuisine.push(...cuisineType.split(';').map((c: string) => c.replace('_', ' ')));
  } else if (amenityType === 'fast_food') {
    displayCuisine.push('快餐');
  } else if (amenityType === 'cafe') {
    displayCuisine.push('咖啡馆/甜点');
  } else {
    displayCuisine.push('餐饮');
  }
  
  if (dietInfo.length > 0) {
    displayCuisine.push(...dietInfo);
  }

  // 获取营业时间、电话和地址
  const openingHours = node.tags?.opening_hours || undefined;
  const phone = node.tags?.phone || node.tags?.['contact:phone'] || undefined;
  const address = [node.tags?.['addr:city'], node.tags?.['addr:street'], node.tags?.['addr:housenumber']].filter(Boolean).join(' ') || undefined;

  // 生成更合理的配图
  const img = generateMockImage(cuisineType, amenityType, name);
  
  // 简单计算距离
  const distance = Math.floor(Math.random() * radius);

  return {
    id: `osm_${node.id}`,
    name,
    rating,
    distance,
    cuisine: displayCuisine,
    image: img,
    openingHours,
    phone,
    address,
    platform,
    platformUrl: platform === 'meituan' ? 'https://waimai.meituan.com/' : 'https://h5.ele.me/',
  };
};

export const fetchRealRestaurants = async (
  latitude: number,
  longitude: number,
  priceRange: string,
  distanceStr: string
): Promise<Restaurant[]> => {
  try {
    const radius = parseInt(distanceStr) || 3000;
    const amapKey = useStore.getState().amapKey;

    // 如果用户配置了高德 API Key，优先使用高德 POI 周边搜索 API，速度极快且极其准确
    if (amapKey) {
      // 050000 是高德的 POI 类型编码，代表“餐饮服务”
      const amapUrl = `https://restapi.amap.com/v3/place/around?key=${amapKey}&location=${longitude},${latitude}&types=050000&radius=${radius}&offset=50&page=1&extensions=all`;
      
      const response = await fetch(amapUrl);
      const data = await response.json();

      if (data.status === '1' && data.pois && data.pois.length > 0) {
        return data.pois.map((poi: any) => {
          const rating = poi.biz_ext?.rating && poi.biz_ext.rating !== "0.0" 
            ? parseFloat(poi.biz_ext.rating) 
            : parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
            
          const platform = Math.random() > 0.5 ? 'meituan' : 'eleme';
          
          return {
            id: `amap_${poi.id}`,
            name: poi.name,
            rating,
            distance: parseInt(poi.distance),
            cuisine: poi.type ? poi.type.split(';').map((t: string) => t.split('|').pop() || t) : ['餐饮'],
            image: poi.photos && poi.photos.length > 0 ? poi.photos[0].url : generateMockImage(poi.type || '', '', poi.name),
            openingHours: poi.biz_ext?.open_time || undefined,
            phone: poi.tel && typeof poi.tel === 'string' && poi.tel.length > 0 ? poi.tel.split(';')[0] : undefined,
            address: poi.address && typeof poi.address === 'string' ? poi.address : undefined,
            platform,
            platformUrl: platform === 'meituan' ? 'https://waimai.meituan.com/' : 'https://h5.ele.me/',
          };
        });
      }
    }

    // 如果没有配置高德 Key，或者高德请求失败，走 Overpass API 兜底
    // 既然高德限制严格，我们直接使用完全免费、免 Key、无跨域限制的 OpenStreetMap Overpass API
    // 搜索当前经纬度周边 radius 米内的所有餐饮(amenity=restaurant, fast_food, cafe 等)
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radius},${latitude},${longitude});
        node["amenity"="fast_food"](around:${radius},${latitude},${longitude});
        node["amenity"="cafe"](around:${radius},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;
    
    // 使用 Vercel Rewrite 代理解决跨域问题，如果本地开发则直接请求完整 URL
    const url = window.location.hostname.includes('vercel.app') 
      ? '/api/overpass' 
      : 'https://overpass.kumi.systems/api/interpreter';
      
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    const data = await response.json();

    // 过滤出真正有名字的店铺
    const validNodes = data.elements.filter((el: any) => el.type === 'node' && el.tags && el.tags.name);

    if (validNodes.length > 0) {
      return validNodes.map((node: any) => transformOSMNodeToRestaurant(node, priceRange, radius));
    }
    
    throw new Error(`抱歉，在你周边 ${radius} 米内没有搜索到公开的餐饮店铺信息，试试扩大搜索距离吧。`);
  } catch (error: any) {
    console.error('Failed to fetch real restaurants:', error);
    throw new Error(error.message || '网络请求失败，无法获取真实餐厅数据');
  }
};
