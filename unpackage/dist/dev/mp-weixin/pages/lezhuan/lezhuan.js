"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "lezhuan",
  setup(__props) {
    const navigateTo = (page) => {
      common_vendor.index.navigateTo({
        url: `/pages/${page}/${page}`
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => navigateTo("post")),
        b: common_vendor.o(($event) => navigateTo("receive"))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4dd96cc0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/lezhuan/lezhuan.js.map
