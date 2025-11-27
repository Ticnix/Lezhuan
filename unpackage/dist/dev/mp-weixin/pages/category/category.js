"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + Waterfall)();
}
const Waterfall = () => "../../components/Waterfall.js";
const _sfc_main = {
  __name: "category",
  setup(__props) {
    common_vendor.ref("");
    const searchValue = common_vendor.ref("");
    const functionRange = common_vendor.ref(["全部", "宝贝", "需求"]);
    const functionIndex = common_vendor.ref(0);
    const categoryOptions = common_vendor.ref([]);
    const categoryIndex = common_vendor.ref(0);
    const currentType = common_vendor.ref("");
    const priceOptions = common_vendor.ref(["全部", "0-50元", "50-100元", "100-300元", "300-500元", "500元以上"]);
    const priceIndex = common_vendor.ref(0);
    const hasReachedBottom = common_vendor.ref(false);
    common_vendor.ref([]);
    common_vendor.ref([]);
    common_vendor.ref([]);
    common_vendor.ref(null);
    common_vendor.ref("");
    common_vendor.ref([]);
    common_vendor.ref([]);
    const goodsPageNum = common_vendor.ref(1);
    const goodsPageSize = common_vendor.ref(4);
    const isLoadingGoods = common_vendor.ref(false);
    const hasMoreGoods = common_vendor.ref(true);
    const demandPageNum = common_vendor.ref(1);
    const demandPageSize = common_vendor.ref(4);
    const isLoadingDemand = common_vendor.ref(false);
    const hasMoreDemand = common_vendor.ref(true);
    const displayList = common_vendor.ref([]);
    const goodsPageData = common_vendor.ref([]);
    const demandPageData = common_vendor.ref([]);
    const preloadThreshold = common_vendor.ref(300);
    const scrollRef = common_vendor.ref(null);
    const priceRanges = {
      "0-50元": { min: 0, max: 50 },
      "50-100元": { min: 50, max: 100 },
      "100-300元": { min: 100, max: 300 },
      "300-500元": { min: 300, max: 500 },
      "500元以上": { min: 500, max: Infinity }
    };
    const categoryMap = {
      "电子数码": ["电脑外设", "耳机音响", "手机平板", "智能设备", "其他"],
      "自行车": ["普通自行车", "山地车", "公路自行车", "电动自行车", "其他"],
      "电器": ["吹风机", "干衣袋", "电灯风扇", "小厨具", "其他"],
      "体育用品": ["各种球类", "各种球拍", "健身器材", "运动装备", "其他"],
      "二手书": ["大一教材", "大二教材", "大三教材", "小说漫画", "其他"],
      "生活用品": ["美容/护肤品", "服饰服装", "衣架/收纳", "椅子抱枕", "其他"],
      "虚拟物品": ["游戏账号", "陪玩代打", "数字会员", "线上课程", "其他"],
      "其他": ["学习用品", "手工制品", "宠物用品", "办公用品", "其他"]
    };
    const statusBarHeight = common_vendor.ref(0);
    common_vendor.ref(0);
    common_vendor.onLoad((options) => {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          statusBarHeight.value = res.statusBarHeight * 750 / res.windowWidth;
        }
      });
      if (options.type) {
        currentType.value = options.type;
        generateCategoryOptions();
      }
    });
    const categoryIdMap = {
      "电子数码": 1,
      "其他": 2,
      "生活用品": 3,
      "虚拟物品": 4,
      "自行车": 5,
      "体育用品": 6,
      "电器": 7,
      "二手书": 8
    };
    const getCategoryIdByType = () => {
      const id = categoryIdMap[currentType.value];
      return typeof id === "number" ? id : -1;
    };
    common_vendor.onMounted(async () => {
      if (currentType.value) {
        fetchGoodsList(getCategoryIdByType(), false);
        fetchDemandList(false);
      }
      await common_vendor.nextTick$1();
      if (scrollRef.value) {
        common_vendor.index.__f__("log", "at pages/category/category.vue:270", "scroll-view 绑定成功");
        common_vendor.index.__f__("log", "at pages/category/category.vue:271", "scroll-view已渲染，元素：", scrollRef.value);
        const query = common_vendor.index.createSelectorQuery().in(scrollRef.value);
        query.boundingClientRect((res) => {
          common_vendor.index.__f__("log", "at pages/category/category.vue:275", "scroll-view实际高度：", res == null ? void 0 : res.height);
        }).exec();
      } else {
        common_vendor.index.__f__("error", "at pages/category/category.vue:278", "scroll-view ref 绑定失败，请检查拼写");
      }
      getClientHeight();
    });
    const getClientHeight = () => {
      setTimeout(() => {
        common_vendor.index.createSelectorQuery().select(".scroll-container").boundingClientRect((data) => {
          if (data) {
            common_vendor.index.__f__("log", "at pages/category/category.vue:290", "scroll-container clientHeight：", data.clientHeight);
          } else {
            common_vendor.index.__f__("error", "at pages/category/category.vue:292", "未找到 .scroll-container 元素");
          }
        }).exec();
      }, 300);
    };
    common_vendor.watch([functionIndex, categoryIndex, priceIndex], () => {
      hasReachedBottom.value = false;
    });
    const generateCategoryOptions = () => {
      categoryOptions.value = ["全部", ...categoryMap[currentType.value] || []];
      categoryIndex.value = 0;
    };
    const handleFunctionChange = (e) => {
      functionIndex.value = e.detail.value;
      resetAndReload();
    };
    const handleCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      resetAndReload();
    };
    const handlePriceChange = (e) => {
      priceIndex.value = e.detail.value;
      resetAndReload();
    };
    const handleSearch = () => {
      resetAndReload();
    };
    const resetAndReload = () => {
      goodsPageNum.value = 1;
      goodsPageData.value = [];
      hasMoreGoods.value = true;
      demandPageNum.value = 1;
      demandPageData.value = [];
      hasMoreDemand.value = true;
      displayList.value = [];
      fetchGoodsList(getCategoryIdByType(), false);
      fetchDemandList(false);
    };
    const onScroll = (e) => {
      const clientHeight = 760;
      const { scrollTop, scrollHeight } = e.detail;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceToBottom < preloadThreshold.value && !isLoadingGoods.value && !isLoadingDemand.value && (hasMoreGoods.value || hasMoreDemand.value)) {
        common_vendor.index.__f__("log", "at pages/category/category.vue:373", "触发预加载");
        if (hasMoreGoods.value && !isLoadingGoods.value) {
          goodsPageNum.value += 1;
          fetchGoodsList(getCategoryIdByType(), true);
        }
        if (hasMoreDemand.value && !isLoadingDemand.value) {
          demandPageNum.value += 1;
          fetchDemandList(true);
        }
      }
    };
    const fetchGoodsList = async (categoryId, isLoadMore = false) => {
      if (isLoadingGoods.value || !hasMoreGoods.value)
        return;
      isLoadingGoods.value = true;
      try {
        const params = {
          categoryId,
          current: isLoadMore ? goodsPageNum.value : 1,
          size: goodsPageSize.value
        };
        common_vendor.index.__f__("log", "at pages/category/category.vue:396", "商品列表请求参数：", params);
        const res = await api_product.productApi.getCategorie(params);
        if (res.code === 200) {
          const newPage = res.data.records || [];
          if (newPage.length === 0) {
            hasMoreGoods.value = false;
            return;
          }
          if (isLoadMore) {
            goodsPageData.value.push(newPage);
          } else {
            goodsPageData.value = [newPage];
            goodsPageNum.value = 1;
          }
          const cleanedNewPage = await cleanGoodsSinglePage(newPage);
          if (isLoadMore) {
            displayList.value = [...displayList.value, ...shuffleSingleList(cleanedNewPage)];
          } else {
            displayList.value = shuffleSingleList(cleanedNewPage);
            if (demandPageData.value.length > 0) {
              const demandFirstPage = demandPageData.value[0];
              const cleanedDemandFirstPage = await cleanDemandSinglePage(demandFirstPage);
              displayList.value = [...displayList.value, ...shuffleSingleList(cleanedDemandFirstPage)];
            }
          }
          hasMoreGoods.value = newPage.length === goodsPageSize.value;
        } else {
          common_vendor.index.showToast({ title: res.message || "获取商品列表失败", icon: "none" });
          hasMoreGoods.value = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:438", "商品请求异常：", error);
        common_vendor.index.showToast({ title: "网络异常", icon: "none" });
        hasMoreGoods.value = false;
      } finally {
        isLoadingGoods.value = false;
      }
    };
    const fetchDemandList = async (isLoadMore = false) => {
      if (isLoadingDemand.value || !hasMoreDemand.value)
        return;
      isLoadingDemand.value = true;
      try {
        const params = {
          categoryId: getCategoryIdByType(),
          status: "active",
          current: isLoadMore ? demandPageNum.value : 1,
          size: demandPageSize.value
        };
        common_vendor.index.__f__("log", "at pages/category/category.vue:458", "需求列表请求参数：", params);
        const res = await api_product.productApi.getDemandList(params);
        if (res.code === 200) {
          const newPage = res.data.records || [];
          if (newPage.length === 0) {
            hasMoreDemand.value = false;
            return;
          }
          if (isLoadMore) {
            demandPageData.value.push(newPage);
          } else {
            demandPageData.value = [newPage];
            demandPageNum.value = 1;
          }
          const cleanedNewPage = await cleanDemandSinglePage(newPage);
          if (isLoadMore) {
            displayList.value = [...displayList.value, ...shuffleSingleList(cleanedNewPage)];
          } else {
            displayList.value = shuffleSingleList(cleanedNewPage);
            if (goodsPageData.value.length > 0) {
              const goodsFirstPage = goodsPageData.value[0];
              const cleanedGoodsFirstPage = await cleanGoodsSinglePage(goodsFirstPage);
              displayList.value = [...displayList.value, ...shuffleSingleList(cleanedGoodsFirstPage)];
            }
          }
          hasMoreDemand.value = newPage.length === demandPageSize.value;
        } else {
          common_vendor.index.showToast({ title: res.message || "获取需求列表失败", icon: "none" });
          hasMoreDemand.value = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:499", "需求请求异常：", error);
        common_vendor.index.showToast({ title: "网络异常", icon: "none" });
        hasMoreDemand.value = false;
      } finally {
        isLoadingDemand.value = false;
      }
    };
    const cleanGoodsSinglePage = async (pageData) => {
      const cleaned = await Promise.all(
        pageData.map((item) => {
          let tags = [];
          let category = "其他";
          try {
            const attributesObj = JSON.parse(item.attributes || "{}");
            category = attributesObj.subcategory || attributesObj.category || "其他";
            tags = [
              item.isNegotiable ? "可刀" : "不可刀",
              attributesObj.category || "其他",
              attributesObj.subcategory || "其他",
              attributesObj.condition || "未知成色"
            ].filter(Boolean);
          } catch (err) {
            tags = [];
          }
          return {
            id: item.id,
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl, "product"),
            tags,
            title: item.title || "未知商品",
            desc: item.description || "",
            categoryName: item.categoryName,
            user: { avatar: utils_uniHelper.sanitizeImageUrl(item.sellerAvatarUrl, "avatar"), nickname: item.sellerNickname },
            category,
            type: "product",
            price: item.price || 0,
            status: item.status,
            adminPinScore: Number(item.urgentPush) === 1 || item.urgentPush === true ? 1 : 0,
            sortPriority: Number(item.urgentPush) === 1 || item.urgentPush === true ? 1 : 0,
            isAdminPinned: Number(item.urgentPush) === 1 || item.urgentPush === true
          };
        })
      );
      return cleaned.filter((item) => item.status === "active");
    };
    const cleanDemandSinglePage = async (pageData) => {
      const cleaned = await Promise.all(
        pageData.map((item) => {
          return {
            id: item.id,
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl, "demand"),
            tags: ["需求"],
            title: item.title || "未知需求",
            desc: item.description || "",
            categoryName: currentType.value,
            user: item.requester || { avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg", nickname: "未知用户" },
            // user:  { avatar: sanitizeImageUrl(item.sellerAvatarUrl, 'avatar'), nickname: item.sellerNickname }  || { avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg', nickname: '未知用户' },
            category: currentType.value || "其他",
            type: "demand",
            price: item.budget || 0,
            status: item.status,
            adminPinScore: Number(item.urgentPush) === 1 || item.urgentPush === true ? 1 : 0,
            sortPriority: Number(item.urgentPush) === 1 || item.urgentPush === true ? 1 : 0,
            isAdminPinned: Number(item.urgentPush) === 1 || item.urgentPush === true
          };
        })
      );
      return cleaned.filter((item) => item.status === "active");
    };
    const shuffleSingleList = (list) => {
      const newList = [...list];
      for (let i = newList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newList[i], newList[j]] = [newList[j], newList[i]];
      }
      return newList;
    };
    const filteredGoods = common_vendor.computed(() => {
      let result = [...displayList.value];
      if (searchValue.value.trim()) {
        const keyword = searchValue.value.trim().toLowerCase();
        result = result.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(keyword);
          const descMatch = item.desc.toLowerCase().includes(keyword);
          return titleMatch || descMatch;
        });
      }
      const selectedFunction = functionRange.value[functionIndex.value];
      if (selectedFunction && selectedFunction !== "全部") {
        const typeMap = { "宝贝": "product", "需求": "demand" };
        result = result.filter((item) => item.type === typeMap[selectedFunction]);
      }
      const selectedCategory = categoryOptions.value[categoryIndex.value];
      if (selectedCategory && selectedCategory !== "全部") {
        result = result.filter((item) => {
          const itemTags = Array.isArray(item.tags) ? item.tags : [];
          return itemTags.includes(selectedCategory) || item.category === selectedCategory;
        });
      }
      const selectedPrice = priceOptions.value[priceIndex.value];
      if (selectedPrice && selectedPrice !== "全部") {
        const range = priceRanges[selectedPrice];
        result = result.filter((item) => {
          const itemPrice = Number(item.price) || 0;
          return itemPrice >= range.min && itemPrice < range.max;
        });
      }
      return result;
    });
    const isInitialLoading = common_vendor.computed(() => {
      return goodsPageNum.value === 1 && isLoadingGoods.value || demandPageNum.value === 1 && isLoadingDemand.value;
    });
    const isLoadingMore = common_vendor.computed(() => {
      return goodsPageNum.value > 1 && isLoadingGoods.value || demandPageNum.value > 1 && isLoadingDemand.value;
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "24",
          color: "#999"
        }),
        b: common_vendor.o(handleSearch),
        c: searchValue.value,
        d: common_vendor.o(($event) => searchValue.value = $event.detail.value),
        e: common_vendor.t(functionRange.value[functionIndex.value]),
        f: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        g: functionRange.value,
        h: functionIndex.value,
        i: common_vendor.o(handleFunctionChange),
        j: common_vendor.t(categoryOptions.value[categoryIndex.value] || "全部"),
        k: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        l: categoryOptions.value,
        m: categoryIndex.value,
        n: common_vendor.o(handleCategoryChange),
        o: common_vendor.t(priceOptions.value[priceIndex.value] || "全部"),
        p: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        q: priceOptions.value,
        r: priceIndex.value,
        s: common_vendor.o(handlePriceChange),
        t: `url('/static/bg.jpg')`,
        v: isInitialLoading.value
      }, isInitialLoading.value ? {
        w: common_vendor.f(6, (n, k0, i0) => {
          return {
            a: n % 3 === 0 ? "300rpx" : n % 3 === 1 ? "360rpx" : "330rpx",
            b: n
          };
        })
      } : filteredGoods.value.length === 0 ? {} : common_vendor.e({
        y: common_vendor.p({
          list: filteredGoods.value,
          columnCount: 2,
          gap: 20,
          ["virtual-scroll"]: true,
          ["visible-height"]: 800
        }),
        z: isLoadingMore.value
      }, isLoadingMore.value ? {} : {}, {
        A: common_vendor.o(onScroll),
        B: `calc(100vh - ${statusBarHeight.value + 300}rpx)`,
        C: !hasMoreGoods.value.value && !hasMoreDemand.value.value
      }, !hasMoreGoods.value.value && !hasMoreDemand.value.value ? {} : {}), {
        x: filteredGoods.value.length === 0
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8145b772"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/category/category.js.map
