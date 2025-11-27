"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  UniTag();
}
const UniTag = () => "../node-modules/@dcloudio/uni-ui/lib/uni-tag/uni-tag.js";
const _sfc_main = {
  __name: "Waterfall-one",
  props: {
    list: {
      type: Array,
      default: () => [],
      required: true
    },
    columnCount: {
      type: Number,
      default: 2,
      validator: (val) => val >= 1 && val <= 5
    },
    gap: {
      type: Number,
      default: 20
    },
    borderRadius: {
      type: Number,
      default: 10
    },
    contentPadding: {
      type: Number,
      default: 16
    },
    titleSize: {
      type: Number,
      default: 28
    },
    titleMarginTop: {
      type: Number,
      default: 8
    },
    // 价格相关属性
    priceSize: {
      type: Number,
      default: 26
    },
    priceMarginTop: {
      type: Number,
      default: 8
    },
    priceColor: {
      type: String,
      default: "#ff4d4f"
    },
    // 用户信息相关属性
    userInfoMarginTop: {
      type: Number,
      default: 12
    },
    avatarSize: {
      type: Number,
      default: 40
    },
    nicknameSize: {
      type: Number,
      default: 24
    },
    nicknameMarginLeft: {
      type: Number,
      default: 8
    }
  },
  setup(__props) {
    const props = __props;
    const getTagType = (tagText) => {
      if (tagText === "需求") {
        return "warning";
      } else if (tagText === "可刀" || tagText === "不可刀") {
        return "error";
      }
      return "primary";
    };
    const firstColumnItems = common_vendor.ref([]);
    const otherColumns = common_vendor.ref([]);
    const columnHeights = common_vendor.ref([]);
    const imageSizes = common_vendor.ref({});
    const columnWidth = common_vendor.computed(() => {
      return `calc( (100% - ${(props.columnCount - 1) * props.gap}rpx) / ${props.columnCount} )`;
    });
    const initColumns = () => {
      columnHeights.value = Array(props.columnCount).fill(0);
      columnHeights.value[0] = 300;
      otherColumns.value = Array.from({ length: props.columnCount - 1 }, () => []);
      firstColumnItems.value = [];
      distributeItems();
    };
    const distributeItems = () => {
      const validItems = props.list.filter((item) => item && item.id);
      validItems.forEach((item) => {
        var _a;
        const minIndex = columnHeights.value.indexOf(Math.min(...columnHeights.value));
        if (minIndex === 0) {
          firstColumnItems.value.push(item);
        } else {
          otherColumns.value[minIndex - 1].push(item);
        }
        const tagAdjustment = ((_a = item.tags) == null ? void 0 : _a.length) > 1 ? (item.tags.length - 1) * 20 : 0;
        const baseHeight = item.type === "出物" ? 320 : 300;
        columnHeights.value[minIndex] += baseHeight + tagAdjustment;
      });
    };
    const handleImageLoad = (e, item, columnIndex) => {
      var _a, _b;
      const { width, height } = e && e.detail || {};
      if (width && height) {
        imageSizes.value[item.id] = { width, height };
        const imageRatio = height / width;
        const estimatedHeight = 300 * imageRatio;
        const tagHeightAdjustment = ((_a = item.tags) == null ? void 0 : _a.length) > 1 ? 20 : 0;
        const contentHeight = 120 + tagHeightAdjustment;
        const totalHeight = estimatedHeight + contentHeight;
        columnHeights.value[columnIndex] = totalHeight;
      } else {
        const tagHeightAdjustment = ((_b = item.tags) == null ? void 0 : _b.length) > 1 ? 20 : 0;
        const contentHeight = 120 + tagHeightAdjustment;
        columnHeights.value[columnIndex] = 300 + contentHeight;
      }
    };
    const handleImageError = (item) => {
      item.imgUrl = "https://api.shaolezhuan.cn/lzphoto/productDefault.jpg";
    };
    const goToDetail = (id, type) => {
      const targetType = type || "product";
      common_vendor.index.navigateTo({
        url: `/pages/ProductDetail/ProductDetail?id=${id}&type=${targetType}`
      });
    };
    common_vendor.watch(
      () => [props.list, props.columnCount, props.gap],
      () => initColumns(),
      { deep: true, immediate: true }
    );
    common_vendor.onMounted(() => {
      initColumns();
    });
    return (_ctx, _cache) => {
      return {
        a: `${__props.borderRadius}rpx`,
        b: __props.gap + "rpx",
        c: common_vendor.f(firstColumnItems.value, (item, k0, i0) => {
          var _a, _b;
          return common_vendor.e({
            a: item.imgUrl,
            b: item.title,
            c: common_vendor.o(($event) => handleImageLoad($event, item, 0), item.id),
            d: common_vendor.o(($event) => handleImageError(item), item.id),
            e: item.tags && item.tags.length > 0
          }, item.tags && item.tags.length > 0 ? {
            f: common_vendor.f(item.tags, (tag, index, i1) => {
              return {
                a: "d5a45521-0-" + i0 + "-" + i1,
                b: common_vendor.p({
                  size: "mini",
                  text: tag,
                  type: getTagType(tag)
                }),
                c: index
              };
            })
          } : {}, {
            g: common_vendor.t(item.title),
            h: common_vendor.t(item.type === "出物" ? "￥" : "￥"),
            i: common_vendor.t(item.price),
            j: (_a = item.user) == null ? void 0 : _a.avatar,
            k: common_vendor.t(((_b = item.user) == null ? void 0 : _b.nickname) || "未知用户"),
            l: item.id,
            m: common_vendor.o(($event) => goToDetail(item.id, item.type), item.id)
          });
        }),
        d: `${__props.borderRadius}rpx ${__props.borderRadius}rpx 0 0`,
        e: `${__props.titleSize}rpx`,
        f: `${__props.titleMarginTop}rpx`,
        g: `${__props.priceSize}rpx`,
        h: `${__props.priceMarginTop}rpx`,
        i: __props.priceColor,
        j: `${__props.avatarSize}rpx`,
        k: `${__props.avatarSize}rpx`,
        l: `${__props.avatarSize / 2}rpx`,
        m: `${__props.nicknameSize}rpx`,
        n: `${__props.nicknameMarginLeft}rpx`,
        o: `${__props.userInfoMarginTop}rpx`,
        p: `${__props.contentPadding}rpx`,
        q: __props.gap + "rpx",
        r: columnWidth.value,
        s: common_vendor.f(otherColumns.value, (column, index, i0) => {
          return {
            a: common_vendor.f(column, (item, k1, i1) => {
              var _a, _b;
              return common_vendor.e({
                a: item.imgUrl,
                b: item.title,
                c: common_vendor.o(($event) => handleImageLoad($event, item, index + 1), item.id),
                d: common_vendor.o(($event) => handleImageError(item), item.id),
                e: item.tags && item.tags.length > 0
              }, item.tags && item.tags.length > 0 ? {
                f: common_vendor.f(item.tags, (tag, index2, i2) => {
                  return {
                    a: "d5a45521-1-" + i0 + "-" + i1 + "-" + i2,
                    b: common_vendor.p({
                      size: "mini",
                      text: tag,
                      type: getTagType(tag)
                    }),
                    c: index2
                  };
                })
              } : {}, {
                g: common_vendor.t(item.title),
                h: common_vendor.t(item.type === "出物" ? "￥" : "￥"),
                i: common_vendor.t(item.price),
                j: (_a = item.user) == null ? void 0 : _a.avatar,
                k: common_vendor.t(((_b = item.user) == null ? void 0 : _b.nickname) || "未知用户"),
                l: item.id,
                m: common_vendor.o(($event) => goToDetail(item.id, item.type), item.id)
              });
            }),
            b: index + 1
          };
        }),
        t: `${__props.borderRadius}rpx ${__props.borderRadius}rpx 0 0`,
        v: `${__props.titleSize}rpx`,
        w: `${__props.titleMarginTop}rpx`,
        x: `${__props.priceSize}rpx`,
        y: `${__props.priceMarginTop}rpx`,
        z: __props.priceColor,
        A: `${__props.avatarSize}rpx`,
        B: `${__props.avatarSize}rpx`,
        C: `${__props.avatarSize / 2}rpx`,
        D: `${__props.nicknameSize}rpx`,
        E: `${__props.nicknameMarginLeft}rpx`,
        F: `${__props.userInfoMarginTop}rpx`,
        G: `${__props.contentPadding}rpx`,
        H: __props.gap + "rpx",
        I: columnWidth.value
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d5a45521"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/Waterfall-one.js.map
