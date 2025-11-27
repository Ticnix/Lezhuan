"use strict";
const common_vendor = require("../common/vendor.js");
const useStorage = () => {
  const getStorage = (key) => {
    try {
      const value = common_vendor.index.getStorageSync(key);
      return value;
    } catch (e) {
      common_vendor.index.__f__("error", "at hooks/useStorage.js:9", `获取存储${key}失败:`, e);
      return null;
    }
  };
  const setStorage = (key, value) => {
    try {
      common_vendor.index.setStorageSync(key, value);
      return true;
    } catch (e) {
      common_vendor.index.__f__("error", "at hooks/useStorage.js:20", `设置存储${key}失败:`, e);
      return false;
    }
  };
  const removeStorage = (key) => {
    try {
      common_vendor.index.removeStorageSync(key);
      return true;
    } catch (e) {
      common_vendor.index.__f__("error", "at hooks/useStorage.js:31", `移除存储${key}失败:`, e);
      return false;
    }
  };
  return {
    getStorage,
    setStorage,
    removeStorage
  };
};
exports.useStorage = useStorage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/hooks/useStorage.js.map
