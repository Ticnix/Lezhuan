"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + CommonGoodsList)();
}
const CommonGoodsList = () => "../../components/CommonGoodsList.js";
const _sfc_main = {
  __name: "history",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const historyGoods = common_vendor.ref([]);
    const isEmpty = common_vendor.ref(false);
    const total = common_vendor.ref(0);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(200);
    const loading = common_vendor.ref(false);
    const loadingMore = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const functionRange = common_vendor.ref([
      { text: "全部", value: "" },
      { text: "宝贝", value: "宝贝" },
      { text: "需求", value: "需求" }
    ]);
    const categoryRange = common_vendor.ref([{ text: "全部", value: "" }]);
    const functionIndex = common_vendor.ref(0);
    const categoryIndex = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看历史浏览", redirectTo: "/pages/mine/mine" }))
        return;
      resetAndLoad();
    });
    common_vendor.onShow(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看历史浏览", redirectTo: "/pages/mine/mine" }))
        return;
      resetAndLoad();
    });
    const resetAndLoad = () => {
      currentPage.value = 1;
      historyGoods.value = [];
      noMore.value = false;
      loadHistoryData();
    };
    const loadHistoryData = async () => {
      if (loading.value || loadingMore.value)
        return;
      if (currentPage.value === 1) {
        loading.value = true;
        common_vendor.index.showLoading({ title: "加载中...", mask: true });
      } else {
        loadingMore.value = true;
      }
      const userId = common_vendor.index.getStorageSync("userId");
      try {
        const params = {
          userId,
          current: currentPage.value,
          size: pageSize.value
        };
        common_vendor.index.__f__("log", "at pages/history/history.vue:155", "历史浏览请求参数：", params);
        const res = await api_user.userApi.getBrowseHistoryList(params);
        if (res.code === 200) {
          const pageData = res.data;
          common_vendor.index.__f__("log", "at pages/history/history.vue:161", "后端返回的浏览记录数据：", pageData);
          total.value = pageData.total;
          const formattedData = pageData.records.map((record) => ({
            id: record.itemId.toString(),
            title: record.itemTitle || "未知标题",
            desc: "",
            // 后端未返回描述，可留空或补充
            imgUrl: record.itemImageUrl || "https://api.shaolezhuan.cn/lzphoto/demandpic.png",
            price: record.itemPrice || 0,
            category: record.itemCategory || "未知分类",
            // 需后端补充分类字段
            function: record.itemType === "product" ? "宝贝" : "需求",
            type: record.itemType === "demand" ? "demand" : "product",
            status: record.itemStatus || "normal",
            browseTime: new Date(record.browseTime).getTime(),
            // 转换为时间戳
            publisher: {
              nickname: record.sellerNickname || "未知用户",
              avatar: ""
              // 后端未返回头像，可留空
            },
            isFavorited: record.isFavorited || false
            // 是否收藏
          }));
          if (currentPage.value === 1) {
            historyGoods.value = formattedData;
          } else {
            historyGoods.value = [...historyGoods.value, ...formattedData];
          }
          noMore.value = historyGoods.value.length >= total.value;
          const validCategories = historyGoods.value.map((item) => item.category).filter((cate) => cate && cate.trim());
          const uniqueCategories = [...new Set(validCategories)].sort((a, b) => a.localeCompare(b, "zh-CN")).map((cate) => ({ text: cate, value: cate }));
          categoryRange.value = [{ text: "全部", value: "" }, ...uniqueCategories];
        } else {
          common_vendor.index.showToast({ title: res.msg || "获取浏览记录失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/history/history.vue:203", "加载浏览历史失败:", error);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      } finally {
        loading.value = false;
        loadingMore.value = false;
        common_vendor.index.hideLoading();
        isEmpty.value = historyGoods.value.length === 0;
      }
    };
    common_vendor.onReachBottom(() => {
      if (!noMore.value && !loadingMore.value) {
        currentPage.value++;
        loadHistoryData();
      }
    });
    const filteredHistoryGoods = common_vendor.computed(() => {
      const filtered = historyGoods.value.filter((goods) => {
        const matchesSearch = searchKeyword.value === "" ? true : goods.title.toLowerCase().includes(searchKeyword.value.toLowerCase());
        const selectedFunction = functionRange.value[functionIndex.value].value;
        const matchesFunction = !selectedFunction ? true : goods.function === selectedFunction;
        const selectedCategory = categoryRange.value[categoryIndex.value].value;
        const matchesCategory = !selectedCategory ? true : goods.category === selectedCategory;
        const status = (goods.status || "").toString();
        const statusLower = status.toLowerCase();
        const hiddenZh = status === "已卖出" || status === "已删除";
        const hiddenEn = statusLower === "sold" || statusLower === "delisted";
        const visibleStatus = !(hiddenZh || hiddenEn);
        return matchesSearch && matchesFunction && matchesCategory && visibleStatus;
      });
      isEmpty.value = filtered.length === 0 && historyGoods.value.length > 0;
      return filtered;
    });
    const clearHistory = () => {
      common_vendor.index.showModal({
        title: "确认清空",
        content: "确定要清空所有浏览记录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await api_user.userApi.clearBrowseHistory();
              if (res2.code === 200) {
                historyGoods.value = [];
                isEmpty.value = true;
                common_vendor.index.showToast({ title: "已清空浏览记录", icon: "none" });
              } else {
                common_vendor.index.showToast({ title: res2.msg || "清空失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/history/history.vue:275", "清空浏览记录失败:", error);
              common_vendor.index.showToast({ title: "网络错误", icon: "none" });
            }
          }
        }
      });
    };
    const handleFunctionChange = (e) => {
      functionIndex.value = e.detail.value;
      resetAndLoad();
    };
    const handleCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
    };
    const handleSearch = () => {
    };
    common_vendor.onUnmounted(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(clearHistory),
        b: common_vendor.p({
          type: "search",
          size: "24",
          color: "#999"
        }),
        c: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, handleSearch]),
        d: searchKeyword.value,
        e: common_vendor.t(functionRange.value[functionIndex.value].text),
        f: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        g: functionRange.value,
        h: functionIndex.value,
        i: common_vendor.o(handleFunctionChange),
        j: common_vendor.t(categoryRange.value[categoryIndex.value].text),
        k: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        l: categoryRange.value,
        m: categoryIndex.value,
        n: common_vendor.o(handleCategoryChange),
        o: common_vendor.p({
          goodsList: filteredHistoryGoods.value,
          showPrice: true,
          showStatus: true,
          emptyText: isEmpty.value ? "暂无浏览记录" : ""
        }),
        p: loadingMore.value
      }, loadingMore.value ? {
        q: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#666"
        })
      } : {}, {
        r: noMore.value && !isEmpty.value
      }, noMore.value && !isEmpty.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b2d018fa"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/history.js.map
