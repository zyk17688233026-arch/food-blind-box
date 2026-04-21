import { Restaurant } from '../types';

export const selectRandomRestaurant = (
  restaurants: Restaurant[],
  history: string[],   // 已排除的商家ID
  favorites: string[]  // 收藏的商家ID（提高权重）
): Restaurant => {
  // 严格过滤掉已抽过的商家 (去重逻辑)
  const available = restaurants.filter(r => !history.includes(r.id));
  
  // 如果所有周边商家都被抽过了，抛出异常让外层处理
  if (available.length === 0) {
    throw new Error('ALL_DRAWN');
  }
  
  // 加权随机：收藏商家权重+30%，高评分商家权重+20%
  const weighted = available.map(r => {
    let weight = 1;
    if (favorites.includes(r.id)) weight += 0.3;
    if (r.rating >= 4.5) weight += 0.2;
    return { restaurant: r, weight };
  });
  
  // 根据权重随机选择
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of weighted) {
    random -= item.weight;
    if (random <= 0) return item.restaurant;
  }
  
  return weighted[weighted.length - 1].restaurant;
};
