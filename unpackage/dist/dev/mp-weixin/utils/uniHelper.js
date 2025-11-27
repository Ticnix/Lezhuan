"use strict";
const common_vendor = require("../common/vendor.js");
const showToast = (title, icon = "none", duration = 2e3) => {
  common_vendor.index.showToast({
    title,
    icon,
    duration
  });
};
const ALLOWED_IMAGE_HOSTS = [
  "api.shaolezhuan.cn",
  "tcb-api.tencentcloudapi.com",
  "thirdwx.qlogo.cn",
  "wx.qlogo.cn",
  // 兼容对象存储/CDN等返回的主图域名
  "myqcloud.com",
  "shaolezhuan.cn"
];
const sanitizeImageUrl = (url, type = "product") => {
  const defaults = {
    product: "https://api.shaolezhuan.cn/lzphoto/productDefault.jpg",
    demand: "https://api.shaolezhuan.cn/lzphoto/demandpic.png",
    avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg"
  };
  if (!url)
    return defaults[type] || defaults.product;
  const isLocal = typeof url === "string" && (url.startsWith("/") || url.startsWith("wxfile://") || url.startsWith("data:image"));
  if (isLocal)
    return url;
  const match = String(url).match(/^https?:\/\/([^\/]+)/i);
  const host = match ? match[1] : "";
  const allowed = ALLOWED_IMAGE_HOSTS.some((h) => host.endsWith(h));
  return allowed ? url : defaults[type] || defaults.product;
};
const ensureLoggedIn = (options = {}) => {
  const token = common_vendor.index.getStorageSync("token");
  const userId = common_vendor.index.getStorageSync("userId");
  const isLoggedIn = !!(token && userId);
  if (isLoggedIn)
    return true;
  const {
    title = "未登录",
    content = "您还未登录，请先登录以使用此功能",
    confirmText = "去登录",
    cancelText = "取消",
    redirectTo = "/pages/mine/mine"
  } = options;
  common_vendor.index.showModal({
    title,
    content,
    confirmText,
    cancelText,
    success: (res) => {
      if (res.confirm) {
        common_vendor.index.switchTab({ url: redirectTo });
      }
    }
  });
  return false;
};
const ensureStudentCertified = (options = {}) => {
  const studentIdNumber = common_vendor.index.getStorageSync("studentIdNumber");
  const isCertified = !!studentIdNumber;
  if (isCertified)
    return true;
  const {
    title = "未完成学生认证",
    content = "请先完成学生认证以使用此功能",
    confirmText = "去认证",
    cancelText = "取消",
    redirectTo = "/pages/student/student"
  } = options;
  common_vendor.index.showModal({
    title,
    content,
    confirmText,
    cancelText,
    success: (res) => {
      if (res.confirm) {
        common_vendor.index.navigateTo({ url: redirectTo });
      }
    }
  });
  return false;
};
const ensureMembership = (requiredType = "normal", options = {}) => {
  const current = common_vendor.index.getStorageSync("membershipType") || "none";
  const ok = requiredType === "normal" ? current === "normal" || current === "platinum" : current === "platinum";
  if (ok)
    return true;
  const defaultTextMap = {
    normal: {
      title: "非会员限制",
      content: "该功能需普通会员。开通后可聊一聊、购物、发布商品",
      confirmText: "去购买"
    },
    platinum: {
      title: "会员等级不足",
      content: "该功能需白金会员。升级后可发布需求等全部功能",
      confirmText: "去升级"
    }
  };
  const d = defaultTextMap[requiredType] || defaultTextMap.normal;
  const {
    title = d.title,
    content = d.content,
    confirmText = d.confirmText,
    cancelText = "取消",
    redirectTo = "/pages/membership/membership"
  } = options;
  common_vendor.index.showModal({
    title,
    content,
    confirmText,
    cancelText,
    success: (res) => {
      if (res.confirm) {
        common_vendor.index.navigateTo({ url: redirectTo });
      }
    }
  });
  return false;
};
exports.ensureLoggedIn = ensureLoggedIn;
exports.ensureMembership = ensureMembership;
exports.ensureStudentCertified = ensureStudentCertified;
exports.sanitizeImageUrl = sanitizeImageUrl;
exports.showToast = showToast;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/uniHelper.js.map
