"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
const utils_system = require("../../utils/system.js");
const api_user = require("../../api/user.js");
const api_product = require("../../api/product.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + Waterfall)();
}
const Waterfall = () => "../../components/Waterfall-one.js";
const _sfc_main = {
  __name: "index",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close", "goTo"],
  setup(__props, { emit: __emit }) {
    const statusBarHeight = common_vendor.ref(0);
    const titleBarHeight = common_vendor.ref(0);
    const navBarHeight = common_vendor.ref(0);
    common_vendor.ref({});
    const categoriesTop = common_vendor.ref([
      { name: "电子数码", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/digital.png" },
      { name: "自行车", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/bicycle.png" },
      { name: "电器", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/appliance.png" },
      { name: "体育用品", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/sports.png" }
    ]);
    const categoriesBottom = common_vendor.ref([
      { name: "二手书", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/books.png" },
      { name: "生活用品", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/life.png" },
      { name: "虚拟物品", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/virtualgoods.png" },
      { name: "其他", icon: "https://api.shaolezhuan.cn/lzphoto/category-icons/others.png" }
    ]);
    const swiperList = common_vendor.ref([
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/banners/b1.jpg" },
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/banners/b2.jpg" },
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/banners/b3.jpg" },
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/membership/m4.jpg", link: "/pages/promo/promo" }
    ]);
    const notices = common_vendor.ref([
      { content: "限时活动：加客服微信免费领会员：qlzkf1 " }
    ]);
    const marqueeText = common_vendor.computed(() => notices.value.map((n) => n.content).join("    "));
    const uglyGoodsList = common_vendor.ref([]);
    const uglyDemandList = common_vendor.ref([]);
    const cleanedGoodsList = common_vendor.ref([]);
    const cleanedDemandList = common_vendor.ref([]);
    const allRecommendList = common_vendor.ref([]);
    const hasReachedBottom = common_vendor.ref(false);
    const showNoticeModal = common_vendor.ref(false);
    const isLoading = common_vendor.ref(true);
    common_vendor.onMounted(() => {
      statusBarHeight.value = utils_system.getStatusBarHeight();
      titleBarHeight.value = utils_system.getTitleBarHeight();
      navBarHeight.value = utils_system.getNavBarHeight();
    });
    common_vendor.onShow(() => {
      fetchRecommendData();
    });
    common_vendor.onShareAppMessage(() => ({
      title: "趣乐转｜校园闲置好物",
      path: "/pages/index/index",
      imageUrl: "https://api.shaolezhuan.cn/lzphoto/logo.jpg"
    }));
    common_vendor.onShareTimeline(() => ({
      title: "趣乐转｜发现闲置好物",
      query: "",
      imageUrl: "https://api.shaolezhuan.cn/lzphoto/logo.jpg"
    }));
    const handleNotice = () => {
      showNoticeModal.value = true;
    };
    const handleCategoryClick = (category) => {
      utils_uniHelper.showToast(`点击了${category}分类`);
      common_vendor.index.navigateTo({ url: `/pages/category/category?type=${category}` });
    };
    const handleSlideClick = (slide) => {
      if (slide && slide.link) {
        common_vendor.index.navigateTo({ url: slide.link });
      }
    };
    common_vendor.onReachBottom(() => {
      hasReachedBottom.value = true;
      setTimeout(() => {
        hasReachedBottom.value = false;
      }, 5e3);
    });
    const close = () => {
      showNoticeModal.value = false;
    };
    const goTo = () => {
      showNoticeModal.value = false;
      common_vendor.index.navigateTo({ url: "/pages/promo/promo" });
    };
    const fetchRecommendData = async () => {
      try {
        isLoading.value = true;
        const [goodsRes, demandRes] = await Promise.all([
          api_product.productApi.getAllGoods(),
          // 假设该接口获取所有商品
          api_product.productApi.getAllDemands()
          // 假设该接口获取所有需求
        ]);
        common_vendor.index.__f__("log", "at pages/index/index.vue:309", "接口获取的所有商品数据", goodsRes);
        common_vendor.index.__f__("log", "at pages/index/index.vue:310", "接口获取的所有需求数据", demandRes);
        if (goodsRes.code === 200) {
          uglyGoodsList.value = goodsRes.data || [];
          await cleanGoodsList();
          common_vendor.index.__f__("log", "at pages/index/index.vue:316", "脏的商品数据：", uglyGoodsList.value);
        } else {
          utils_uniHelper.showToast("获取商品数据失败");
        }
        if (demandRes.code === 200) {
          uglyDemandList.value = demandRes.data || [];
          await cleanDemandList();
          common_vendor.index.__f__("log", "at pages/index/index.vue:325", "脏的需求数据：", uglyDemandList.value);
        } else {
          utils_uniHelper.showToast("获取需求数据失败");
        }
        mergeAllLists();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:332", "获取推荐数据失败：", error);
        utils_uniHelper.showToast("网络异常，获取推荐数据失败");
      } finally {
        isLoading.value = false;
      }
    };
    const cleanGoodsList = async () => {
      const tempGoodsList = await Promise.all(
        uglyGoodsList.value.map(async (item) => {
          let tags = [];
          try {
            const attributesObj = JSON.parse(item.attributes || "{}");
            tags = Object.values(attributesObj);
            tags.unshift(item.isNegotiable ? "可刀" : "不可刀");
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/index/index.vue:350", "解析商品属性失败:", err);
            tags = [];
          }
          const user = await getUserInfoByUserId(item.sellerId);
          return {
            id: item.id,
            // 兼容后端可能返回 imgUrl 或 mainImageUrl 两种命名
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl || item.imgUrl, "product"),
            tags,
            title: item.title || "未知商品",
            desc: item.description || "",
            categoryName: item.categoryName || "其他",
            user: user || { avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg", nickname: "未知用户" },
            type: "product",
            price: item.price || 0,
            isRecommended: item.isHomepageFeatured,
            // 是否推荐（核心字段）
            recommendPriority: item.adminPinScore || 0
            // 推荐权重（核心字段）
          };
        })
      );
      common_vendor.index.__f__("log", "at pages/index/index.vue:373", "未筛选推荐的商品数据：", tempGoodsList);
      cleanedGoodsList.value = tempGoodsList.filter((item) => item.isRecommended);
      common_vendor.index.__f__("log", "at pages/index/index.vue:376", "干净的商品数据：", cleanedGoodsList.value);
    };
    const cleanDemandList = async () => {
      const tempDemandList = await Promise.all(
        uglyDemandList.value.map(async (item) => {
          let tags = [];
          try {
            const attributesObj = JSON.parse(item.attributes || "{}");
            tags = Object.values(attributesObj);
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/index/index.vue:389", "解析需求属性失败:", err);
            tags = [];
          }
          return {
            id: item.id,
            // 兼容后端可能返回 imgUrl 或 mainImageUrl 两种命名
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl || item.imgUrl, "demand"),
            tags: ["需求", ...tags],
            title: item.title || "未知需求",
            desc: item.description || "",
            categoryName: item.categoryName || "其他",
            user: item.requester ? { avatar: utils_uniHelper.sanitizeImageUrl(item.requester.avatar, "avatar"), nickname: item.requester.nickname || "未知用户" } : { avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg", nickname: "未知用户" },
            type: "demand",
            price: item.budget || 0,
            isRecommended: item.isHomepageFeatured || true,
            // 是否推荐（核心字段）
            recommendPriority: item.adminPinScore || 0
            // 推荐权重（核心字段）
          };
        })
      );
      cleanedDemandList.value = tempDemandList.filter((item) => item.isRecommended);
      common_vendor.index.__f__("log", "at pages/index/index.vue:414", "干净的需求数据：", cleanedDemandList.value);
    };
    function shuffleMergeLists(list1, list2) {
      const merged = [...list1, ...list2];
      for (let i = merged.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [merged[i], merged[j]] = [merged[j], merged[i]];
      }
      return merged;
    }
    const mergeAllLists = () => {
      const mixedList = shuffleMergeLists(cleanedGoodsList.value, cleanedDemandList.value);
      allRecommendList.value = mixedList;
      common_vendor.index.__f__("log", "at pages/index/index.vue:435", "混合后的最终列表：", allRecommendList.value);
    };
    const filteredRecommendList = common_vendor.computed(() => {
      return allRecommendList.value.filter((item) => item.isRecommended);
    });
    const getUserInfoByUserId = async (userId) => {
      try {
        const res = await api_user.userApi.getUserInfo(userId);
        if (res.code === 200) {
          return {
            avatar: utils_uniHelper.sanitizeImageUrl(res.data.avatar, "avatar"),
            nickname: res.data.nickname || "未知用户"
          };
        }
        return null;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:456", "获取用户信息失败:", err);
        return null;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showNoticeModal.value
      }, showNoticeModal.value ? {} : {}, {
        b: showNoticeModal.value
      }, showNoticeModal.value ? {
        c: common_vendor.o(close),
        d: common_vendor.o(goTo)
      } : {}, {
        e: statusBarHeight.value + "px",
        f: statusBarHeight.value + "px",
        g: titleBarHeight.value + "px",
        h: common_vendor.p({
          type: "notification",
          size: "24",
          color: "#007aff"
        }),
        i: common_vendor.t(marqueeText.value),
        j: common_vendor.p({
          type: "right",
          size: "16",
          color: "#333"
        }),
        k: common_vendor.o(handleNotice),
        l: `url('https://api.shaolezhuan.cn/lzphoto/indextop.jpg')`,
        m: !isLoading.value
      }, !isLoading.value ? {
        n: common_vendor.f(categoriesTop.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: index,
            d: common_vendor.o(($event) => handleCategoryClick(item.name), index)
          };
        }),
        o: common_vendor.f(categoriesBottom.value, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: index,
            d: common_vendor.o(($event) => handleCategoryClick(item.name), index)
          };
        })
      } : {
        p: common_vendor.f(8, (n, k0, i0) => {
          return {
            a: n
          };
        })
      }, {
        q: common_vendor.f(swiperList.value, (slide, index, i0) => {
          return {
            a: slide.imageUrl,
            b: `轮播图${index + 1}`,
            c: common_vendor.o(($event) => handleSlideClick(slide), index),
            d: index
          };
        }),
        r: isLoading.value
      }, isLoading.value ? {
        s: common_vendor.f(6, (n, k0, i0) => {
          return {
            a: n % 3 === 0 ? "300rpx" : n % 3 === 1 ? "360rpx" : "330rpx",
            b: n
          };
        })
      } : filteredRecommendList.value.length > 0 ? {
        v: common_vendor.p({
          list: filteredRecommendList.value,
          columnCount: 2,
          gap: 16,
          borderRadius: 8
        })
      } : {}, {
        t: filteredRecommendList.value.length > 0,
        w: !isLoading.value && hasReachedBottom.value
      }, !isLoading.value && hasReachedBottom.value ? {} : {}, {
        x: statusBarHeight.value * 6 + "px"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
