<script setup>
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  // 仅在微信小程序中生效
  // #ifdef MP-WEIXIN
  // 监听路由变化，为每个页面设置默认转发
  wx.onAppRoute((res) => {
    const pages = getCurrentPages(); // 获取当前页面栈
    const currentPage = pages[pages.length - 1]; // 当前页面实例

    // 确保右上角分享菜单可见（好友/朋友圈）
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    // 如果页面没有单独定义分享回调，则使用全局默认
    if (!currentPage.onShareAppMessage) {
      currentPage.onShareAppMessage = () => {
        return {
          title: '趣乐转',
          path: '/pages/index/index', // 全局默认转发到首页
          imageUrl: 'https://api.shaolezhuan.cn/lzphoto/logo.jpg',
        };
      };
    }

    // 全局默认朋友圈分享
    if (!currentPage.onShareTimeline) {
      currentPage.onShareTimeline = () => {
        return {
          title: '我的小程序',
          query: '',
        };
      };
    }
  });
  // #endif
});
</script>

<script>
export default {
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>

</style>