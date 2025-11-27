// 封装本地存储相关操作
export const useStorage = () => {
  // 获取存储值
  const getStorage = (key) => {
    try {
      const value = uni.getStorageSync(key);
      return value;
    } catch (e) {
      console.error(`获取存储${key}失败:`, e);
      return null;
    }
  };

  // 设置存储值
  const setStorage = (key, value) => {
    try {
      uni.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error(`设置存储${key}失败:`, e);
      return false;
    }
  };

  // 移除存储值
  const removeStorage = (key) => {
    try {
      uni.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error(`移除存储${key}失败:`, e);
      return false;
    }
  };

  return {
    getStorage,
    setStorage,
    removeStorage
  };
};
