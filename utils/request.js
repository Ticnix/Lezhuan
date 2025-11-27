export default function request(options) {
  // 请求前拦截（添加token）
  const token = uni.getStorageSync('token');
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    };
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: 'https://api.shaolezhuan.cn' + options.url, // 拼接基础地址
      method: options.method || 'GET',
      data: options.data,
      header: options.header || {},
      success: (res) => {
        // 响应拦截（处理401 token失效或未携带token）
        if (res.data.code === 401) {
          // 先判断是否有token，没有的话提示请先登录
          if (!token) {
            uni.showToast({
              title: '请先完成用户登录',
              icon: 'none'
            });
          } else {
            reject('登录已过期，请重新登录');
          }
        } else {
          resolve(res.data);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}