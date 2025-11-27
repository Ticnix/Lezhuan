"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
const utils_navigationRefresh = require("./utils/navigationRefresh.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/lezhuan/lezhuan.js";
  "./pages/mine/mine.js";
  "./pages/category/category.js";
  "./pages/ProductDetail/ProductDetail.js";
  "./pages/chat/chat.js";
  "./pages/post/post.js";
  "./pages/receive/receive.js";
  "./pages/wait/wait.js";
  "./pages/message/message.js";
  "./pages/setting/setting.js";
  "./pages/student/student.js";
  "./pages/publish/publish.js";
  "./pages/sell/sell.js";
  "./pages/history/history.js";
  "./pages/demand/demand.js";
  "./pages/collect/collect.js";
  "./pages/guide/guide.js";
  "./pages/membership/membership.js";
  "./pages/notice/notice.js";
  "./pages/promo/promo.js";
}
const __default__ = {
  onShow() {
    common_vendor.index.__f__("log", "at App.vue:46", "App Show");
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:49", "App Hide");
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      common_vendor.wx$1.onAppRoute((res) => {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        common_vendor.wx$1.showShareMenu({
          withShareTicket: true,
          menus: ["shareAppMessage", "shareTimeline"]
        });
        if (!currentPage.onShareAppMessage) {
          currentPage.onShareAppMessage = () => {
            return {
              title: "趣乐转",
              path: "/pages/index/index",
              // 全局默认转发到首页
              imageUrl: "https://api.shaolezhuan.cn/lzphoto/logo.jpg"
            };
          };
        }
        if (!currentPage.onShareTimeline) {
          currentPage.onShareTimeline = () => {
            return {
              title: "我的小程序",
              query: ""
            };
          };
        }
      });
    });
    return () => {
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  app.config.globalProperties.$request = utils_request.request;
  utils_navigationRefresh.installNavigationRefreshInterceptors();
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
