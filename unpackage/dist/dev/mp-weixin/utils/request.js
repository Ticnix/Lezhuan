"use strict";
const common_vendor = require("../common/vendor.js");
function request(options) {
  const token = common_vendor.index.getStorageSync("token");
  if (token) {
    options.header = {
      ...options.header,
      "Authorization": `Bearer ${token}`
    };
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: "https://api.shaolezhuan.cn" + options.url,
      // 拼接基础地址
      method: options.method || "GET",
      data: options.data,
      header: options.header || {},
      success: (res) => {
        if (res.data.code === 401) {
          if (!token) {
            common_vendor.index.showToast({
              title: "请先完成用户登录",
              icon: "none"
            });
          } else {
            reject("登录已过期，请重新登录");
          }
        } else {
          resolve(res.data);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
