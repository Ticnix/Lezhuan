/**
 * 通用工具函数
 * 封装UniApp常用API，简化调用
 */

/**
 * 显示提示框
 * @param {string} title - 提示内容
 * @param {string} icon - 图标类型，默认none
 * @param {number} duration - 显示时长，默认2000ms
 */
export const showToast = (title, icon = 'none', duration = 2000) => {
  uni.showToast({
    title,
    icon,
    duration
  });
};

/**
 * 显示加载框
 * @param {string} title - 加载提示内容
 */
export const showLoading = (title = '加载中...') => {
  uni.showLoading({
    title,
    mask: true
  });
};

/**
 * 隐藏加载框
 */
export const hideLoading = () => {
  uni.hideLoading();
};

/**
 * 导航跳转
 * @param {string} url - 目标页面路径
 * @param {boolean} isTab - 是否是tabBar页面
 */
export const navigateTo = (url, isTab = false) => {
  if (isTab) {
    uni.switchTab({ url });
  } else {
    uni.navigateTo({ url });
  }
};

/**
 * 存储本地数据
 * @param {string} key - 存储键名
 * @param {any} value - 存储值
 */
export const setStorage = (key, value) => {
  uni.setStorageSync(key, value);
};

/**
 * 获取本地数据
 * @param {string} key - 存储键名
 * @returns {any} 存储的值
 */
export const getStorage = (key) => {
  return uni.getStorageSync(key);
};

/**
 * 删除本地数据
 * @param {string} key - 存储键名
 */
export const removeStorage = (key) => {
  uni.removeStorageSync(key);
};

// 图片域名白名单与清洗
export const ALLOWED_IMAGE_HOSTS = [
  'api.shaolezhuan.cn',
  'tcb-api.tencentcloudapi.com',
  'thirdwx.qlogo.cn',
  'wx.qlogo.cn',
  // 兼容对象存储/CDN等返回的主图域名
  'myqcloud.com',
  'shaolezhuan.cn'
];

export const sanitizeImageUrl = (url, type = 'product') => {
  const defaults = {
    product: 'https://api.shaolezhuan.cn/lzphoto/productDefault.jpg',
    demand: 'https://api.shaolezhuan.cn/lzphoto/demandpic.png',
    avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg'
  };
  if (!url) return defaults[type] || defaults.product;
  const isLocal = typeof url === 'string' && (url.startsWith('/') || url.startsWith('wxfile://') || url.startsWith('data:image'));
  if (isLocal) return url;
  const match = String(url).match(/^https?:\/\/([^\/]+)/i);
  const host = match ? match[1] : '';
  const allowed = ALLOWED_IMAGE_HOSTS.some(h => host.endsWith(h));
  return allowed ? url : (defaults[type] || defaults.product);
};

/**
 * 校验是否已登录，未登录则弹窗提醒并可跳转到“我的”页
 * 使用：if (!ensureLoggedIn({ content: '登录后才能使用该功能' })) return;
 * @param {Object} options - 可选配置
 * @param {string} options.title - 弹窗标题，默认“未登录”
 * @param {string} options.content - 弹窗内容说明
 * @param {string} options.confirmText - 确认按钮文字，默认“去登录”
 * @param {string} options.cancelText - 取消按钮文字，默认“取消”
 * @param {string} options.redirectTo - 登录页（或“我的”页）路径，默认`/pages/mine/mine`
 * @returns {boolean} 是否已登录
 */
export const ensureLoggedIn = (options = {}) => {
  const token = uni.getStorageSync('token');
  const userId = uni.getStorageSync('userId');
  const isLoggedIn = !!(token && userId);
  if (isLoggedIn) return true;

  const {
    title = '未登录',
    content = '您还未登录，请先登录以使用此功能',
    confirmText = '去登录',
    cancelText = '取消',
    redirectTo = '/pages/mine/mine',
  } = options;

  uni.showModal({
    title,
    content,
    confirmText,
    cancelText,
    success: (res) => {
      if (res.confirm) {
        // “我的”是 tabBar 页面，需使用 switchTab
        uni.switchTab({ url: redirectTo });
      }
    }
  });

  return false;
};

/**
 * 校验是否已完成学生认证，未认证则弹窗引导至学生认证页面
 * 使用：if (!ensureStudentCertified({ content: '请先完成学生认证' })) return;
 * 依据：本项目以本地存储键 `studentIdNumber` 是否存在来判断认证完成
 * @param {Object} options - 可选配置
 * @param {string} options.title - 弹窗标题，默认“未完成学生认证”
 * @param {string} options.content - 弹窗内容说明
 * @param {string} options.confirmText - 确认按钮文字，默认“去认证”
 * @param {string} options.cancelText - 取消按钮文字，默认“取消”
 * @param {string} options.redirectTo - 学生认证页路径，默认`/pages/student/student`
 * @returns {boolean} 是否已认证
 */
export const ensureStudentCertified = (options = {}) => {
  const studentIdNumber = uni.getStorageSync('studentIdNumber');
  const isCertified = !!studentIdNumber;
  if (isCertified) return true;

  const {
    title = '未完成学生认证',
    content = '请先完成学生认证以使用此功能',
    confirmText = '去认证',
    cancelText = '取消',
    redirectTo = '/pages/student/student',
  } = options;

  uni.showModal({
    title,
    content,
    confirmText,
    cancelText,
    success: (res) => {
      if (res.confirm) {
        // 学生认证页非 tabBar 页面，使用 navigateTo
        uni.navigateTo({ url: redirectTo });
      }
    }
  });

  return false;
};

/**
 * 校验会员等级是否满足要求，不满足则弹窗引导至会员购买/升级页面
 * 使用：if (!ensureMembership('platinum', { content: '发布需求需白金会员' })) return;
 * 依据：本项目 `membershipType` 存储值：'none' | 'normal' | 'platinum'
 * @param {'normal'|'platinum'} requiredType - 所需会员等级
 * @param {Object} options - 文案与跳转配置
 * @returns {boolean} 是否已满足会员等级
 */
export const ensureMembership = (requiredType = 'normal', options = {}) => {
  const current = uni.getStorageSync('membershipType') || 'none';
  const ok = requiredType === 'normal'
    ? (current === 'normal' || current === 'platinum')
    : (current === 'platinum');
  if (ok) return true;

  const defaultTextMap = {
    normal: {
      title: '非会员限制',
      content: '该功能需普通会员。开通后可聊一聊、购物、发布商品',
      confirmText: '去购买',
    },
    platinum: {
      title: '会员等级不足',
      content: '该功能需白金会员。升级后可发布需求等全部功能',
      confirmText: '去升级',
    }
  };
  const d = defaultTextMap[requiredType] || defaultTextMap.normal;

  const {
    title = d.title,
    content = d.content,
    confirmText = d.confirmText,
    cancelText = '取消',
    redirectTo = '/pages/membership/membership',
  } = options;

  uni.showModal({
    title,
    content,
    confirmText,
    cancelText,
    success: (res) => {
      if (res.confirm) {
        // 会员页非 tabBar 页面，使用 navigateTo
        uni.navigateTo({ url: redirectTo });
      }
    }
  });

  return false;
};
