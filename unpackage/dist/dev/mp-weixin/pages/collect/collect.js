"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const api_product = require("../../api/product.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Math) {
  (uniIcons + CommonGoodsList)();
}
const CommonGoodsList = () => "../../components/CommonGoodsList.js";
const uniIcons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _sfc_main = {
  __name: "collect",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const collections = common_vendor.ref([]);
    const isEmpty = common_vendor.ref(false);
    const isFiltering = common_vendor.ref(false);
    const functionRange = common_vendor.ref([
      { text: "全部", value: "" },
      // 空值代表“不筛选”
      { text: "宝贝", value: "宝贝" },
      { text: "需求", value: "需求" }
    ]);
    const categoryRange = common_vendor.ref([
      { text: "全部", value: "" }
      // 初始值，后续动态填充
    ]);
    const selectedFunction = common_vendor.ref("");
    const selectedCategory = common_vendor.ref("");
    const functionIndex = common_vendor.ref(0);
    const categoryIndex = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看收藏", redirectTo: "/pages/mine/mine" }))
        return;
      loadCollectionData();
    });
    common_vendor.onShow(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看收藏", redirectTo: "/pages/mine/mine" }))
        return;
      loadCollectionData();
    });
    const loadCollectionData = async () => {
      common_vendor.index.showLoading({ title: "加载中...", mask: true });
      try {
        const res = await api_user.userApi.getFavoriteList();
        if (res.code !== 200) {
          common_vendor.index.showToast({ title: res.msg || "获取收藏失败", icon: "none" });
          return;
        }
        const fullCollections = [];
        for (const item of res.data) {
          try {
            let detailData;
            if (item.itemType === "product") {
              detailData = (await api_product.productApi.getProductDetail(item.itemId)).data;
            } else if (item.itemType === "demand") {
              detailData = (await api_product.productApi.getDemandDetail(item.itemId)).data;
            } else
              continue;
            const itemCategory = (detailData.categoryName || "其他").trim() || "其他";
            fullCollections.push({
              id: item.itemId.toString(),
              type: item.itemType,
              title: detailData.title || "未知标题",
              imgUrl: utils_uniHelper.sanitizeImageUrl(
                detailData.mainImageUrl,
                item.itemType === "product" ? "product" : "demand"
              ),
              price: item.itemType === "product" ? detailData.price || 0 : detailData.budget || 0,
              function: item.itemType === "product" ? "宝贝" : "需求",
              status: detailData.status || "normal",
              category: itemCategory,
              description: detailData.description || ""
            });
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/collect/collect.vue:169", `获取${item.itemType}(${item.itemId})详情失败:`, err);
          }
        }
        collections.value = fullCollections;
        isEmpty.value = collections.value.length === 0;
        const uniqueCategories = [...new Set(
          collections.value.map((item) => item.category).filter((cate) => cate && cate.trim())
          // 过滤空值和undefined
        )].sort((a, b) => a.localeCompare(b, "zh-CN")).map((cate) => ({ text: cate, value: cate }));
        categoryRange.value = [{ text: "全部", value: "" }, ...uniqueCategories];
        resetFilters(false);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/collect/collect.vue:188", "收藏加载失败:", err);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const filteredCollections = common_vendor.computed(() => {
      const result = collections.value.filter((item) => {
        const matchFunc = !selectedFunction.value || item.function === selectedFunction.value;
        const matchCate = !selectedCategory.value || item.category === selectedCategory.value;
        const matchSearch = !searchKeyword.value.trim() || item.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) || item.description.toLowerCase().includes(searchKeyword.value.toLowerCase());
        common_vendor.index.__f__("log", "at pages/collect/collect.vue:205", "匹配逻辑：", {
          selectedFunction: selectedFunction.value,
          itemFunction: item.function,
          matchFunc
        });
        return matchFunc && matchCate && matchSearch;
      });
      common_vendor.index.__f__("log", "at pages/collect/collect.vue:213", "筛选条件：", {
        selectedFunction: selectedFunction.value,
        selectedCategory: selectedCategory.value,
        searchKeyword: searchKeyword.value
      });
      common_vendor.index.__f__("log", "at pages/collect/collect.vue:218", "筛选结果数量：", result.length);
      return result;
    });
    const handleFunctionChange = (e) => {
      isFiltering.value = true;
      const newIndex = e.detail.value;
      functionIndex.value = newIndex;
      selectedFunction.value = functionRange.value[newIndex].value;
      common_vendor.nextTick$1(() => {
        setTimeout(() => isFiltering.value = false, 300);
      });
    };
    const handleCategoryChange = (e) => {
      isFiltering.value = true;
      const newIndex = e.detail.value;
      categoryIndex.value = newIndex;
      selectedCategory.value = categoryRange.value[newIndex].value;
      common_vendor.nextTick$1(() => {
        setTimeout(() => isFiltering.value = false, 300);
      });
    };
    common_vendor.watch([selectedFunction, selectedCategory, searchKeyword], () => {
      const uniqueCategories = [...new Set(collections.value.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "zh-CN")).map((cate) => ({ text: cate, value: cate }));
      categoryRange.value = [{ text: "全部", value: "" }, ...uniqueCategories];
    }, { deep: true });
    const handleSearch = () => {
      isFiltering.value = true;
      common_vendor.nextTick$1(() => {
        setTimeout(() => isFiltering.value = false, 300);
      });
    };
    const resetFilters = (showLoading = true) => {
      if (showLoading)
        isFiltering.value = true;
      searchKeyword.value = "";
      functionIndex.value = 0;
      categoryIndex.value = 0;
      selectedFunction.value = "";
      selectedCategory.value = "";
      const uniqueCategories = [...new Set(collections.value.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "zh-CN")).map((cate) => ({ text: cate, value: cate }));
      categoryRange.value = [{ text: "全部", value: "" }, ...uniqueCategories];
      if (showLoading) {
        common_vendor.nextTick$1(() => {
          setTimeout(() => isFiltering.value = false, 300);
        });
      }
    };
    common_vendor.onUnmounted(() => {
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
        d: common_vendor.t(functionRange.value[functionIndex.value].text),
        e: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        f: functionRange.value,
        g: functionIndex.value,
        h: common_vendor.o(handleFunctionChange),
        i: common_vendor.t(categoryRange.value[categoryIndex.value].text),
        j: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        k: categoryRange.value,
        l: categoryIndex.value,
        m: common_vendor.o(handleCategoryChange),
        n: isFiltering.value
      }, isFiltering.value ? {
        o: common_vendor.p({
          type: "loading",
          size: "24",
          color: "#fff",
          spin: true
        })
      } : {}, {
        p: !isEmpty.value && filteredCollections.value.length === 0 && !isFiltering.value
      }, !isEmpty.value && filteredCollections.value.length === 0 && !isFiltering.value ? {
        q: common_vendor.p({
          type: "empty",
          size: "60",
          color: "#ccc"
        }),
        r: common_vendor.o(resetFilters)
      } : {}, {
        s: !isFiltering.value
      }, !isFiltering.value ? {
        t: common_vendor.p({
          goodsList: filteredCollections.value,
          showPrice: true,
          showStatus: true,
          emptyText: isEmpty.value ? "暂无收藏商品" : "",
          isBatchMode: false
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b24c290b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/collect/collect.js.map
