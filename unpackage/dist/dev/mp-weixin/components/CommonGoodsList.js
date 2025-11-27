"use strict";
const common_vendor = require("../common/vendor.js");
const utils_uniHelper = require("../utils/uniHelper.js");
if (!Math) {
  uniIcons();
}
const uniIcons = () => "../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _sfc_main = {
  __name: "CommonGoodsList",
  props: {
    /** 商品列表数据 */
    goodsList: {
      type: Array,
      required: true,
      default: () => []
    },
    /** 是否加载中 */
    isLoading: {
      type: Boolean,
      default: false
    },
    /** 空状态文本（可选，自定义空提示） */
    emptyText: {
      type: String,
      default: ""
    },
    /** 商品详情页路径（可选，默认为'/pages/ProductDetail/ProductDetail'） */
    detailPath: {
      type: String,
      default: "/pages/ProductDetail/ProductDetail"
    },
    /** 是否禁用点击跳转到详情 */
    disableNavigation: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    "go-to-detail",
    // 跳转商品详情前触发
    "navigate-success",
    // 跳转成功后触发
    "navigate-fail"
    // 跳转失败时触发
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const sanitizedGoodsList = common_vendor.computed(() => {
      return (props.goodsList || []).map((item) => {
        const inferredType = (item == null ? void 0 : item.type) ? item.type === "demand" ? "demand" : "product" : (item == null ? void 0 : item.function) === "需求" ? "demand" : "product";
        return {
          ...item,
          type: inferredType,
          imgUrl: utils_uniHelper.sanitizeImageUrl(item.imgUrl, inferredType)
        };
      });
    });
    const emit = __emit;
    const navigateToDetail = (id, type) => {
      emit("go-to-detail", id);
      const targetType = type === "demand" ? "demand" : "product";
      common_vendor.index.navigateTo({
        url: `${props.detailPath}?id=${id}&type=${targetType}`,
        success: () => emit("navigate-success", id),
        fail: (err) => {
          emit("navigate-fail", { id, error: err });
          common_vendor.index.__f__("error", "at components/CommonGoodsList.vue:114", "跳转详情失败:", err);
        }
      });
    };
    const handleItemClick = (id, type) => {
      if (props.disableNavigation)
        return;
      navigateToDetail(id, type);
    };
    __expose({
      navigateToDetail
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.isLoading
      }, __props.isLoading ? {
        b: common_vendor.p({
          type: "loading",
          size: "40",
          color: "#7c89ff",
          spin: true
        })
      } : sanitizedGoodsList.value.length > 0 ? {
        d: common_vendor.f(sanitizedGoodsList.value, (goods, k0, i0) => {
          return {
            a: goods.imgUrl,
            b: common_vendor.t(goods.title),
            c: common_vendor.t(goods.price.toFixed(2)),
            d: common_vendor.f(goods.attributes, (attr, index, i1) => {
              return {
                a: common_vendor.t(attr),
                b: index,
                c: common_vendor.n(attr === "可刀" ? "negotiable" : "normal")
              };
            }),
            e: common_vendor.o(($event) => handleItemClick(goods.id, goods.type), goods.id),
            f: goods.id
          };
        })
      } : {
        e: common_vendor.p({
          type: "empty",
          size: "60",
          color: "#ccc"
        }),
        f: common_vendor.t(__props.emptyText || "暂无符合条件的商品")
      }, {
        c: sanitizedGoodsList.value.length > 0
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1d90967c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/CommonGoodsList.js.map
