import { Location } from '../types';
import { useStore } from '../store';

// 使用 OpenStreetMap Nominatim 免费 API 进行逆地理编码
export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'zh-CN,zh;q=0.9'
      }
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    const addressDetails = data.address || {};
    
    const city = addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.county || '未知城市';
    const district = addressDetails.suburb || addressDetails.district || addressDetails.county || '未知区域';
    const address = data.display_name || '未知详细地址';

    return {
      address,
      city,
      district
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    throw error;
  }
};

export const getCurrentPosition = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    const amapKey = useStore.getState().amapKey;

    // 局域网 HTTP 环境下，或者桌面端环境，或者浏览器不支持 geolocation 时，使用 IP 定位兜底
    const fallbackToIPLocation = async () => {
      try {
        console.warn('Geolocation API unavailable or failed, falling back to IP location...');
        
        // 如果用户配置了高德 API Key，优先使用高德的高精度 IP 定位
        if (amapKey) {
          try {
            const amapRes = await fetch(`https://restapi.amap.com/v3/ip?key=${amapKey}`);
            const amapData = await amapRes.json();
            
            if (amapData.status === '1' && amapData.rectangle) {
              // 高德返回的是矩形区域 "左下,右上"，我们取中心点
              const [bl, tr] = amapData.rectangle.split(';');
              const [blLng, blLat] = bl.split(',');
              const [trLng, trLat] = tr.split(',');
              const longitude = (parseFloat(blLng) + parseFloat(trLng)) / 2;
              const latitude = (parseFloat(blLat) + parseFloat(trLat)) / 2;
              
              resolve({
                latitude,
                longitude,
                address: `${amapData.city} (高德IP定位)`,
                city: amapData.city,
                district: amapData.city || '未知区域' // 高德IP定位不一定返回district
              });
              return; // 成功则退出
            }
          } catch (e) {
            console.error('Amap IP location failed, falling back to open IP api...', e);
          }
        }

        // 使用 ip-api 免费接口获取粗略经纬度 (改为 HTTPS 的 ipapi.co 或其他支持 HTTPS 的接口，因为 Vercel 线上是 HTTPS，请求 HTTP 会被浏览器拦截)
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        
        if (data.error) throw new Error(data.reason);

        const latitude = data.latitude;
        const longitude = data.longitude;
        
        try {
          const addressInfo = await reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude, ...addressInfo });
        } catch (err) {
          resolve({
            latitude,
            longitude,
            address: `${data.city}, ${data.region} (IP定位)`,
            city: data.city,
            district: data.region
          });
        }
      } catch (err) {
        console.error('IP location fallback failed:', err);
        // 终极兜底：北京中关村附近
        resolve({
          latitude: 39.9841,
          longitude: 116.3194,
          address: '北京市海淀区中关村 (模拟定位)',
          city: '北京市',
          district: '海淀区'
        });
      }
    };

    // Tauri 桌面端环境下，window.__TAURI__ 存在，由于没有浏览器的 GPS 权限管理，
    // 我们直接跳过 HTML5 Geolocation，直接使用 IP 定位
    if (('__TAURI__' in window) || !navigator.geolocation) {
      fallbackToIPLocation();
      return;
    }

    // 在 HTTP 环境下（非 localhost 且非 HTTPS），现代浏览器会直接静默拦截 geolocation 请求
    // 我们设置一个较短的超时时间，如果超时或者报错，立刻转 IP 定位
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const addressInfo = await reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude, ...addressInfo });
        } catch (err) {
          resolve({
            latitude,
            longitude,
            address: '定位成功，但地址解析失败',
            city: '未知城市',
            district: '未知区域'
          });
        }
      },
      (error) => {
        let errorMessage = '获取位置失败，请重试';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '定位失败：您拒绝了地理位置权限请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '定位失败：无法获取当前位置';
            break;
          case error.TIMEOUT:
            errorMessage = '定位失败：获取位置超时';
            break;
        }
        console.error(errorMessage);
        // 如果 HTML5 定位失败，转入 IP 兜底
        fallbackToIPLocation();
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};
