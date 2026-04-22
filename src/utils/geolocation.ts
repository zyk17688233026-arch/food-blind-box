import { Location } from '../types';
import { useStore } from '../store';

// 使用高德（优先）或 OpenStreetMap Nominatim（兜底）进行逆地理编码
export const reverseGeocode = async (latitude: number, longitude: number) => {
  const amapKey = useStore.getState().amapKey;

  // 如果用户配置了高德 API Key，优先使用高德的高精度逆地理编码，速度秒出且不会被墙
  if (amapKey) {
    try {
      const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${amapKey}&location=${longitude},${latitude}`);
      const data = await response.json();
      if (data.status === '1' && data.regeocode) {
        const addressComponent = data.regeocode.addressComponent;
        // 高德的 city 可能是空数组（比如直辖市北京、上海），此时取 province
        const city = (typeof addressComponent.city === 'string' && addressComponent.city) 
          ? addressComponent.city 
          : addressComponent.province;
          
        return {
          address: data.regeocode.formatted_address || '未知详细地址',
          city: city || '未知城市',
          district: (typeof addressComponent.district === 'string' && addressComponent.district) ? addressComponent.district : '未知区域'
        };
      } else if (data.status === '0') {
        // 如果高德明确返回错误（如 Key 错误、类型不匹配），直接抛出异常，不再静默兜底，避免用户被蒙在鼓里
        throw new Error(`高德API报错: ${data.info} (请检查是否申请了"Web服务"类型的Key，而不是"Web端(JS API)")`);
      }
    } catch (e: any) {
      console.error('Amap reverse geocoding failed:', e);
      if (e.message && e.message.includes('高德API报错')) {
        throw e; // 如果是明确的 API 错误，直接向上抛出显示在界面上
      }
      console.warn('Falling back to OSM...');
    }
  }

  // 兜底：使用开源的 OSM 接口
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
    // 为了防止部分移动端浏览器在请求定位时既不报错也不返回（假死），我们加一个手动的 Promise.race 兜底超时
    let isResolved = false;
    
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.warn('Geolocation manual timeout triggered, falling back to IP...');
        isResolved = true;
        fallbackToIPLocation();
      }
    }, 10000); // 10秒强制超时兜底

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        
        const { latitude, longitude } = position.coords;
        try {
          const addressInfo = await reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude, ...addressInfo });
        } catch (err: any) {
          // 如果逆地理编码失败，我们把具体的错误信息附加到 address 字段里返回
          const errorMsg = err.message ? err.message : '未知错误';
          resolve({
            latitude,
            longitude,
            address: `解析失败: ${errorMsg}`,
            city: '未知城市',
            district: '未知区域'
          });
        }
      },
      (error) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        
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
      // 手机端如果开启高精度定位，经常会导致部分安卓或 iOS 设备假死不返回
      // 关闭 enableHighAccuracy 可以大大提高定位成功率和速度
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  });
};
