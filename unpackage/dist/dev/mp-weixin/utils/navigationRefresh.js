"use strict";
const common_vendor = require("../common/vendor.js");
const appendParam = (url, key, value) => {
  try {
    const hasQuery = url.includes("?");
    const sep = hasQuery ? "&" : "?";
    return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/navigationRefresh.js:12", "appendParam 处理失败:", e);
    return url;
  }
};
const markSwitchTabRefresh = (urlPath) => {
  try {
    const ts = Date.now();
    common_vendor.index.setStorageSync("__refresh_switchTab_path", urlPath);
    common_vendor.index.setStorageSync("__refresh_switchTab_ts", ts);
  } catch (e) {
    common_vendor.index.__f__("warn", "at utils/navigationRefresh.js:24", "设置 switchTab 刷新标记失败:", e);
  }
};
const installNavigationRefreshInterceptors = () => {
  const handler = {
    invoke(args) {
      if (args && args.url) {
        args.url = appendParam(args.url, "__ts", Date.now());
      }
      return args;
    }
  };
  try {
    common_vendor.index.addInterceptor("navigateTo", handler);
    common_vendor.index.addInterceptor("redirectTo", handler);
    common_vendor.index.addInterceptor("reLaunch", handler);
  } catch (e) {
    common_vendor.index.__f__("warn", "at utils/navigationRefresh.js:44", "注册非 tabBar 导航拦截器失败:", e);
  }
  try {
    common_vendor.index.addInterceptor("switchTab", {
      invoke(args) {
        if (args && args.url) {
          const path = args.url.split("?")[0];
          markSwitchTabRefresh(path);
        }
        return args;
      }
    });
  } catch (e) {
    common_vendor.index.__f__("warn", "at utils/navigationRefresh.js:59", "注册 switchTab 导航拦截器失败:", e);
  }
};
exports.installNavigationRefreshInterceptors = installNavigationRefreshInterceptors;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/navigationRefresh.js.map
