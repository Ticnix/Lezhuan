"use strict";
const common_vendor = require("../common/vendor.js");
const utils_uniHelper = require("../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  _easycom_uni_tag2();
}
const _easycom_uni_tag = () => "../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
if (!Math) {
  _easycom_uni_tag();
}
const _sfc_main = {
  __name: "Waterfall",
  props: {
    // 商品列表（需包含 isAdminPinned 和 adminPinScore 字段）
    list: {
      type: Array,
      default: () => []
    },
    columnCount: {
      type: Number,
      default: 2
    },
    gap: {
      type: Number,
      default: 20
      // 单位 rpx
    },
    borderRadius: {
      type: Number,
      default: 10
      // 单位 rpx
    },
    contentPadding: {
      type: Number,
      default: 16
      // 单位 rpx
    },
    titleSize: {
      type: Number,
      default: 28
      // 单位 rpx
    },
    descSize: {
      type: Number,
      default: 24
      // 单位 rpx
    },
    descMarginTop: {
      type: Number,
      default: 8
      // 单位 rpx
    },
    descLineCount: {
      type: Number,
      default: 2
      // 商品简介显示行数
    },
    priceMarginTop: {
      type: Number,
      default: 8
      // 单位 rpx
    },
    userInfoMarginTop: {
      type: Number,
      default: 12
      // 单位 rpx
    },
    avatarSize: {
      type: Number,
      default: 40
      // 单位 rpx
    },
    nicknameSize: {
      type: Number,
      default: 24
      // 单位 rpx
    },
    nicknameMarginLeft: {
      type: Number,
      default: 8
      // 单位 rpx
    }
  },
  setup(__props) {
    const props = __props;
    const columnWidth = common_vendor.computed(() => {
      return `calc((100% - ${(props.columnCount - 1) * props.gap}rpx) / ${props.columnCount})`;
    });
    const sanitizedList = common_vendor.computed(() => {
      return (props.list || []).map((item) => {
        var _a, _b;
        const type = item.type === "demand" ? "demand" : "product";
        return {
          ...item,
          imgUrl: utils_uniHelper.sanitizeImageUrl(item.imgUrl || item.mainImageUrl, type),
          user: {
            avatar: utils_uniHelper.sanitizeImageUrl((_a = item == null ? void 0 : item.user) == null ? void 0 : _a.avatar, "avatar"),
            nickname: ((_b = item == null ? void 0 : item.user) == null ? void 0 : _b.nickname) || "未知用户"
          }
        };
      });
    });
    const sortedColumns = common_vendor.computed(() => {
      if (sanitizedList.value.length === 0)
        return [];
      const pinnedItems = sanitizedList.value.filter((item) => Number(item.adminPinScore) > 0);
      const normalItems = sanitizedList.value.filter((item) => !(Number(item.adminPinScore) > 0));
      const sortedPinned = [...pinnedItems].sort((a, b) => b.adminPinScore - a.adminPinScore);
      const sortedNormal = [...normalItems].sort((a, b) => b.adminPinScore - a.adminPinScore);
      const sortedList = [...sortedPinned, ...sortedNormal];
      const columns = Array.from({ length: props.columnCount }, () => []);
      const columnHeights = new Array(props.columnCount).fill(0);
      sortedList.forEach((item) => {
        const minHeight = Math.min(...columnHeights);
        const minIndex = columnHeights.indexOf(minHeight);
        columns[minIndex].push(item);
        const itemHeight = 400 + item.desc.split(" ").length / 10 * 20;
        columnHeights[minIndex] += itemHeight;
      });
      return columns;
    });
    const getTagType = (tagText) => {
      if (tagText === "需求") {
        return "warning";
      } else if (tagText === "可刀" || tagText === "不可刀") {
        return "error";
      }
      return "primary";
    };
    const goToDetail = (id, type) => {
      const targetType = type || "product";
      common_vendor.index.navigateTo({
        url: `/pages/ProductDetail/ProductDetail?id=${id}&type=${targetType}`
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(sortedColumns.value, (column, colIndex, i0) => {
          return {
            a: common_vendor.f(column, (item, k1, i1) => {
              return common_vendor.e({
                a: Number(item.adminPinScore) > 0
              }, Number(item.adminPinScore) > 0 ? {
                b: "8bffc3e4-0-" + i0 + "-" + i1,
                c: common_vendor.p({
                  text: "置顶",
                  type: "error",
                  size: "mini"
                })
              } : {}, {
                d: item.imgUrl,
                e: item.title,
                f: item.tags && item.tags.length > 0
              }, item.tags && item.tags.length > 0 ? {
                g: common_vendor.f(item.tags, (tag, index, i2) => {
                  return {
                    a: "8bffc3e4-1-" + i0 + "-" + i1 + "-" + i2,
                    b: common_vendor.p({
                      size: "mini",
                      text: tag,
                      type: getTagType(tag)
                    }),
                    c: index
                  };
                })
              } : {}, {
                h: common_vendor.t(item.title),
                i: common_vendor.t(item.desc),
                j: common_vendor.t(item.price.toFixed(2)),
                k: item.user.avatar,
                l: common_vendor.t(item.user.nickname),
                m: item.id,
                n: Number(item.adminPinScore) > 0 ? "4rpx solid #ff4d4f" : "none",
                o: common_vendor.o(($event) => goToDetail(item.id, item.type), item.id)
              });
            }),
            b: colIndex
          };
        }),
        b: `${__props.borderRadius}rpx ${__props.borderRadius}rpx 0 0`,
        c: `${__props.descSize}rpx`,
        d: `${__props.descMarginTop}rpx`,
        e: __props.descLineCount,
        f: `${__props.priceMarginTop}rpx`,
        g: `${__props.avatarSize}rpx`,
        h: `${__props.avatarSize}rpx`,
        i: `${__props.avatarSize / 2}rpx`,
        j: `${__props.nicknameSize}rpx`,
        k: `${__props.nicknameMarginLeft}rpx`,
        l: `${__props.userInfoMarginTop}rpx`,
        m: `${__props.contentPadding}rpx`,
        n: __props.gap + "rpx",
        o: columnWidth.value
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8bffc3e4"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/Waterfall.js.map
