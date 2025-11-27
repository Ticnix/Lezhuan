// 全局导航拦截：为所有非 tabBar 跳转附加时间戳参数，确保页面重新触发加载
// 对于 switchTab，无法传参，使用 Storage 记录一次“应刷新”标记，由目标页在 onShow 自行刷新

// 附加查询参数（简易实现，兼容各端）
const appendParam = (url, key, value) => {
  try {
    const hasQuery = url.includes('?');
    const sep = hasQuery ? '&' : '?';
    return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  } catch (e) {
    // 兜底：不抛出错误，返回原 url
    console.error('appendParam 处理失败:', e);
    return url;
  }
};

// 记录一次 switchTab 刷新标记（目标页在 onShow 消费）
const markSwitchTabRefresh = (urlPath) => {
  try {
    const ts = Date.now();
    uni.setStorageSync('__refresh_switchTab_path', urlPath);
    uni.setStorageSync('__refresh_switchTab_ts', ts);
  } catch (e) {
    console.warn('设置 switchTab 刷新标记失败:', e);
  }
};

export const installNavigationRefreshInterceptors = () => {
  // navigateTo / redirectTo / reLaunch：统一附加时间戳参数
  const handler = {
    invoke(args) {
      if (args && args.url) {
        args.url = appendParam(args.url, '__ts', Date.now());
      }
      return args;
    }
  };

  try {
    uni.addInterceptor('navigateTo', handler);
    uni.addInterceptor('redirectTo', handler);
    uni.addInterceptor('reLaunch', handler);
  } catch (e) {
    console.warn('注册非 tabBar 导航拦截器失败:', e);
  }

  // switchTab：无法传参，使用 Storage 记录刷新意图
  try {
    uni.addInterceptor('switchTab', {
      invoke(args) {
        if (args && args.url) {
          const path = args.url.split('?')[0];
          markSwitchTabRefresh(path);
        }
        return args;
      }
    });
  } catch (e) {
    console.warn('注册 switchTab 导航拦截器失败:', e);
  }
};

// 供页面在 onShow 使用：如果是最近一次被 switchTab 唤起的页面，则返回 true
export const shouldRefreshOnShow = (currentPagePath) => {
  try {
    const lastPath = uni.getStorageSync('__refresh_switchTab_path');
    const lastTs = uni.getStorageSync('__refresh_switchTab_ts');
    if (!lastPath || !lastTs) return false;
    // 命中路径且时间戳仍存在则消费一次并返回 true
    if (currentPagePath && currentPagePath.split('?')[0] === lastPath) {
      uni.removeStorageSync('__refresh_switchTab_path');
      uni.removeStorageSync('__refresh_switchTab_ts');
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};