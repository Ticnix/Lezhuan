"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Math) {
  (uniIcons + CommonGoodsList)();
}
const CommonGoodsList = () => "../../components/CommonGoodsList.js";
const uniIcons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _sfc_main = {
  __name: "sell",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const soldGoods = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const categoryRange = common_vendor.ref(["全部分类"]);
    const timeRange = common_vendor.ref(["全部时间", "近一周", "近一个月", "近三个月", "更早"]);
    const categoryIndex = common_vendor.ref(0);
    const timeIndex = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看我卖出的商品", redirectTo: "/pages/mine/mine" }))
        return;
      fetchSoldGoods();
      common_vendor.index.$on("pageShow", fetchSoldGoods);
    });
    const fetchSoldGoods = async () => {
      try {
        isLoading.value = true;
        const soldData = {
          current: 1,
          size: 1e3,
          status: "sold"
        };
        const res = await api_product.productApi.getMyGoods(soldData);
        const rawGoodsList = res.data.records || [];
        common_vendor.index.__f__("log", "at pages/sell/sell.vue:121", "后端返回的已卖出商品数据:", rawGoodsList);
        soldGoods.value = rawGoodsList.map((raw) => ({
          id: raw.id,
          // 商品ID
          title: raw.title || "未命名商品",
          // 商品标题
          desc: raw.description || "",
          // 商品描述
          imgUrl: utils_uniHelper.sanitizeImageUrl(raw.mainImageUrl, "product"),
          // 商品主图（加默认图）
          price: raw.price || 0,
          // 交易价格
          category: raw.categoryName || "其他",
          // 分类名称
          attributes: raw.attributes ? JSON.parse(raw.attributes) : [],
          // 商品属性（若为JSON字符串需解析）
          status: raw.status || "已完成",
          // 交易状态
          transactionTime: raw.transactionTime || "",
          // 交易时间
          publishTime: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now()
          // 发布时间戳
        }));
        const categories = [...new Set(soldGoods.value.map((item) => item.category))];
        categoryRange.value = ["全部分类", ...categories];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/sell/sell.vue:142", "获取已卖出商品列表失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none",
          duration: 2e3
        });
        soldGoods.value = [];
      } finally {
        isLoading.value = false;
      }
    };
    const filteredSoldGoods = common_vendor.computed(() => {
      return soldGoods.value.filter((goods) => {
        const matchesSearch = searchKeyword.value === "" ? true : goods.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) || goods.desc.toLowerCase().includes(searchKeyword.value.toLowerCase());
        const selectedCategory = categoryRange.value[categoryIndex.value];
        const matchesCategory = selectedCategory === "全部分类" ? true : goods.category === selectedCategory;
        const matchesTime = filterByTime(goods.publishTime);
        return matchesSearch && matchesCategory && matchesTime;
      });
    });
    const filterByTime = (publishTime) => {
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 3600 * 1e3;
      const oneMonthAgo = now - 30 * 24 * 3600 * 1e3;
      const threeMonthsAgo = now - 90 * 24 * 3600 * 1e3;
      switch (timeIndex.value) {
        case 0:
          return true;
        case 1:
          return publishTime >= oneWeekAgo;
        case 2:
          return publishTime >= oneMonthAgo;
        case 3:
          return publishTime >= threeMonthsAgo;
        case 4:
          return publishTime < threeMonthsAgo;
        default:
          return true;
      }
    };
    const handleSearch = () => {
    };
    const handleCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      fetchSoldGoods();
    };
    const handleTimeChange = (e) => {
      timeIndex.value = e.detail.value;
    };
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("pageShow", fetchSoldGoods);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "24",
          color: "#999"
        }),
        b: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, handleSearch]),
        c: searchKeyword.value,
        d: common_vendor.t(categoryRange.value[categoryIndex.value]),
        e: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        f: categoryRange.value,
        g: categoryIndex.value,
        h: common_vendor.o(handleCategoryChange),
        i: common_vendor.t(timeRange.value[timeIndex.value]),
        j: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        k: timeRange.value,
        l: timeIndex.value,
        m: common_vendor.o(handleTimeChange),
        n: isLoading.value
      }, isLoading.value ? {
        o: common_vendor.p({
          type: "loading",
          size: "40",
          color: "#7c89ff",
          spin: true
        })
      } : filteredSoldGoods.value.length > 0 ? {
        q: common_vendor.p({
          goodsList: filteredSoldGoods.value,
          showPrice: true,
          showStatus: true,
          disableNavigation: true
        })
      } : {
        r: common_vendor.p({
          type: "empty",
          size: "60",
          color: "#ccc"
        })
      }, {
        p: filteredSoldGoods.value.length > 0
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a81cc82e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sell/sell.js.map
