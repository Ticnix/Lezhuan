"use strict";
const common_vendor = require("../../common/vendor.js");
const promoImageUrl = "https://api.shaolezhuan.cn/lzphoto/membership/tuiguang.jpg";
const _sfc_main = {
  __name: "promo",
  setup(__props) {
    const previewImage = () => {
      common_vendor.index.previewImage({
        urls: [promoImageUrl],
        current: 0
      });
    };
    const handleLongPress = () => {
      previewImage();
    };
    return (_ctx, _cache) => {
      return {
        a: promoImageUrl,
        b: common_vendor.o(handleLongPress),
        c: common_vendor.o(previewImage)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b0a191c7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/promo/promo.js.map
