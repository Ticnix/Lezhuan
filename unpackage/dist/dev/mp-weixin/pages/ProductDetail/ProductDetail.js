"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
const api_user = require("../../api/user.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_fav2 = common_vendor.resolveComponent("uni-fav");
  _easycom_uni_fav2();
}
const _easycom_uni_fav = () => "../../uni_modules/uni-fav/components/uni-fav/uni-fav.js";
if (!Math) {
  (Waterfall + _easycom_uni_fav)();
}
const Waterfall = () => "../../components/Waterfall.js";
const _sfc_main = {
  __name: "ProductDetail",
  setup(__props) {
    const detail = common_vendor.ref({});
    const isCollected = common_vendor.ref(false);
    const hasReachedBottom = common_vendor.ref(false);
    const uglyDemandList = common_vendor.ref([]);
    const uglyGoodsList = common_vendor.ref([]);
    const demandRecommendations = common_vendor.ref([]);
    const goodsRecommendations = common_vendor.ref([]);
    const sellerDemands = common_vendor.ref([]);
    const sellerProducts = common_vendor.ref([]);
    const showReportDialog = common_vendor.ref(false);
    const reportReason = common_vendor.ref("");
    const hasReported = common_vendor.ref(false);
    let detailId = "";
    let detailType = "";
    const getCurrentRelatedList = () => {
      if (detailType === "demand") {
        return sellerDemands.value;
      } else {
        return sellerProducts.value;
      }
    };
    const type = common_vendor.ref();
    common_vendor.onLoad((options) => {
      detailId = options.id || "";
      detailType = options.type || "product";
      type.value = detailType;
      fetchFavoriteStatus();
    });
    common_vendor.onMounted(() => {
      reportBrowseHistory();
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:249", "商品ID:", detailId);
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:250", "商品类型：", detailType);
      if (!detailId) {
        common_vendor.index.showToast({ title: "参数错误", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 1500);
        return;
      }
      if (detailType === "demand") {
        fetchDemandDetail(detailId);
        fetchDemandRecommendations();
      } else {
        fetchProductDetail(detailId);
        fetchProductRecommendations();
      }
    });
    const reportBrowseHistory = async () => {
      if (hasReported.value || !detailId)
        return;
      const params = {
        itemId: Number(detailId),
        itemType: detailType
        // 'product'或'demand'
      };
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:275", "浏览记录提交的数据：", params);
      try {
        const res = await api_user.userApi.recordBrowseHistory(params);
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:280", "浏览记录提交成功", res.data);
        } else {
          common_vendor.index.__f__("warn", "at pages/ProductDetail/ProductDetail.vue:282", "浏览记录提交失败", res.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:285", "浏览记录接口调用失败", error);
      } finally {
        hasReported.value = true;
      }
    };
    const fetchDemandDetail = async (detailId2) => {
      var _a, _b, _c;
      try {
        const res = await api_product.productApi.getDemandDetail(detailId2);
        if (res.code === 200) {
          const raw = res.data;
          const parseDetailImages = (imgs, type2) => {
            let arr = [];
            if (Array.isArray(imgs))
              arr = imgs;
            else if (typeof imgs === "string") {
              arr = imgs.split(",").map((s) => s.trim()).filter(Boolean);
            }
            return arr.map((u) => utils_uniHelper.sanitizeImageUrl(u, type2));
          };
          detail.value = {
            ...raw,
            imgUrl: utils_uniHelper.sanitizeImageUrl(raw == null ? void 0 : raw.mainImageUrl, "demand"),
            requester: {
              ...(raw == null ? void 0 : raw.requester) || {},
              avatar: utils_uniHelper.sanitizeImageUrl((_a = raw == null ? void 0 : raw.requester) == null ? void 0 : _a.avatar, "avatar"),
              nickname: ((_b = raw == null ? void 0 : raw.requester) == null ? void 0 : _b.nickname) || "未知用户"
            },
            sellerAvatarUrl: utils_uniHelper.sanitizeImageUrl(raw == null ? void 0 : raw.sellerAvatarUrl, "avatar"),
            detailImages: parseDetailImages(raw == null ? void 0 : raw.detailImages, "demand")
          };
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:323", "得到详细的需求数据是：", detail.value);
          await fetchSellerDemands((_c = raw == null ? void 0 : raw.requester) == null ? void 0 : _c.id);
        } else {
          common_vendor.index.showToast({ title: res.msg || "获取需求失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:330", "需求加载失败:", error);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      }
    };
    const fetchProductDetail = async (id) => {
      try {
        const res = await api_product.productApi.getProductDetail(id);
        if (res.code === 200) {
          const raw = res.data;
          const parseDetailImages = (imgs, type2) => {
            let arr = [];
            if (Array.isArray(imgs))
              arr = imgs;
            else if (typeof imgs === "string") {
              arr = imgs.split(",").map((s) => s.trim()).filter(Boolean);
            }
            return arr.map((u) => utils_uniHelper.sanitizeImageUrl(u, type2));
          };
          detail.value = {
            ...raw,
            imgUrl: utils_uniHelper.sanitizeImageUrl(raw == null ? void 0 : raw.mainImageUrl, "product"),
            sellerAvatarUrl: utils_uniHelper.sanitizeImageUrl(raw == null ? void 0 : raw.sellerAvatarUrl, "avatar"),
            detailImages: parseDetailImages(raw == null ? void 0 : raw.detailImages, "product")
          };
          await fetchSellerProducts(raw == null ? void 0 : raw.sellerId);
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:358", "得到详细的商品数据是：", detail.value);
        } else {
          common_vendor.index.showToast({ title: res.msg || "获取商品失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:364", "商品加载失败:", error);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      }
    };
    const fetchSellerDemands = async (requesterId) => {
      try {
        const res = await api_product.productApi.getSellerItem(requesterId);
        common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:372", "接口返回的发布者其他需求：", res.data.demands);
        if (res.code === 200) {
          sellerDemands.value = res.data.demands.filter((item) => item.id !== detail.value.id).map((item) => ({
            ...item,
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl || item.imgUrl, "demand"),
            budget: item.budget || "0.00"
          }));
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:382", "当前 detailType：", detailType);
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:383", "sellerDemands 长度：", sellerDemands.value.length);
          common_vendor.index.__f__(
            "log",
            "at pages/ProductDetail/ProductDetail.vue:384",
            "getCurrentRelatedList() 实际值：",
            detailType === "demand" ? "来自 sellerDemands" : "来自 sellerProducts"
          );
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:387", "currentRelatedList为", getCurrentRelatedList());
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:390", "获取发布者其他需求失败:", error);
      }
    };
    const fetchSellerProducts = async (requesterId) => {
      try {
        const res = await api_product.productApi.getSellerItem(requesterId);
        common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:398", "接口返回的发布者其他商品：", res.data.demands);
        if (res.code === 200) {
          sellerProducts.value = res.data.products.filter((item) => item.id !== detail.value.id).map((item) => ({
            ...item,
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl || item.imgUrl, "product"),
            price: item.price || 0
          }));
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:407", "后端返回给获取该商家的所有商品数据：", sellerProducts.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:410", "获取发布者其他需求失败:", error);
      }
    };
    const fetchDemandRecommendations = async () => {
      try {
        const demandRes = await api_product.productApi.getAllDemands();
        common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:419", "接口获取的所有需求推荐数据", demandRes.data);
        if (demandRes.code === 200) {
          uglyDemandList.value = demandRes.data || [];
          await cleanDemandList();
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:425", "获取推荐需求的脏数据：", uglyDemandList.value);
        } else {
          common_vendor.index.showToast("获取需求数据失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:430", "获取推荐数据失败：", error);
        common_vendor.index.showToast("网络异常，获取推荐数据失败");
      }
    };
    const fetchProductRecommendations = async () => {
      try {
        const productRes = await api_product.productApi.getAllGoods();
        if (productRes.code === 200) {
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:440", "后端返回的对应分类推荐商品为：", productRes.data);
          uglyGoodsList.value = productRes.data || [];
          cleanGoodsList();
        } else {
          common_vendor.index.showToast({
            title: productRes.message || "获取商品列表失败",
            icon: "none"
          });
          goodsRecommendations.value = [];
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络异常，获取商品列表失败",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:455", "获取商品列表失败：", error);
        goodsList.value = [];
      }
    };
    const cleanDemandList = async () => {
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:462", "清洗前的需求数据：", uglyDemandList.value);
      const tempDemandList = await Promise.all(
        uglyDemandList.value.map(async (item) => {
          var _a, _b;
          let tags = [];
          try {
            const attributesObj = JSON.parse(item.attributes || "{}");
            tags = Object.values(attributesObj);
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:470", "解析 attributes 失败:", err);
            tags = [];
          }
          return {
            id: item.id,
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl, "demand"),
            tags: ["需求"],
            title: item.title || "未知需求",
            desc: item.description || "",
            categoryName: "需求分类",
            user: {
              avatar: utils_uniHelper.sanitizeImageUrl((_a = item == null ? void 0 : item.requester) == null ? void 0 : _a.avatar, "avatar"),
              nickname: ((_b = item == null ? void 0 : item.requester) == null ? void 0 : _b.nickname) || "未知用户"
            },
            category: "全部",
            type: "demand",
            price: item.budget || 0,
            status: item.status,
            sortPriority: item.adminPinScore || 0,
            isAdminPinned: item.isAdminPinned || false
          };
        })
      );
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:493", "清洗后的需求数据：", tempDemandList);
      const activeDemandList = tempDemandList.filter((item) => item.status === "active");
      demandRecommendations.value = activeDemandList;
    };
    const cleanGoodsList = async () => {
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:502", "清洗前的商品数据：", uglyGoodsList.value);
      const tempGoodsList = await Promise.all(
        uglyGoodsList.value.map(async (item) => {
          let tags = [];
          try {
            const attributesObj = JSON.parse(item.attributes || "{}");
            tags = Object.values(attributesObj);
            tags.unshift(item.isNegotiable ? "可刀" : "不可刀");
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:511", "解析 attributes 失败:", err);
            tags = [];
          }
          return {
            id: item.id,
            imgUrl: utils_uniHelper.sanitizeImageUrl(item.mainImageUrl, "product"),
            tags,
            title: item.title || "未知商品",
            desc: item.description || "",
            categoryName: item.categoryName,
            user: {
              avatar: utils_uniHelper.sanitizeImageUrl(item == null ? void 0 : item.sellerAvatarUrl, "avatar"),
              nickname: (item == null ? void 0 : item.sellerNickname) || "未知用户"
            },
            category: tags[1] || "其他",
            type: "product",
            price: item.price || 0,
            status: item.status,
            sortPriority: item.adminPinScore || 0,
            isAdminPinned: item.isAdminPinned || false
          };
        })
      );
      const activeGoodsList = tempGoodsList.filter((item) => item.status === "active");
      common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:536", "清洗并筛选后的商品数据：", activeGoodsList);
      goodsRecommendations.value = activeGoodsList;
    };
    const fetchFavoriteStatus = async () => {
      try {
        const res = await api_user.userApi.getFavoriteStatus(detailType, detailId);
        isCollected.value = res.data;
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:546", "查询用户的收藏状态为：", isCollected.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:549", "查询收藏状态失败:", error);
      }
    };
    const toggleCollect = async () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能收藏商品/需求", redirectTo: "/pages/mine/mine" }))
        return;
      try {
        if (isCollected.value) {
          const res = await api_user.userApi.cancelFavorite({
            itemId: detailId,
            itemType: detailType
          });
          if (res.code === 200) {
            common_vendor.index.showToast({ title: "取消收藏成功", icon: "success" });
            isCollected.value = !isCollected.value;
          }
        } else {
          const res = await api_user.userApi.addFavorite({
            itemId: detailId,
            itemType: detailType
          });
          if (res.code === 200) {
            common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
            isCollected.value = !isCollected.value;
          }
        }
        common_vendor.index.__f__("log", "at pages/ProductDetail/ProductDetail.vue:578", "操作后的收藏状态为：", isCollected.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:580", "收藏操作失败:", error);
        common_vendor.index.showToast({
          title: isCollected.value ? "取消收藏失败" : "收藏失败",
          icon: "none"
        });
        isCollected.value = !isCollected.value;
      }
    };
    const submitReport = async () => {
      var _a, _b, _c;
      if (!reportReason.value.trim()) {
        common_vendor.index.showToast({ title: "请输入举报原因", icon: "none" });
        return;
      }
      try {
        if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能提交举报", redirectTo: "/pages/mine/mine" }))
          return;
        const reportParams = {
          reason: reportReason.value,
          reportedProductId: detailType === "product" ? detailId : void 0,
          reportedDemandId: detailType === "demand" ? detailId : void 0,
          // 举报用户ID：商品举报指向卖家，需求举报指向发布者
          reportedUserId: detailType === "product" ? ((_a = detail.value) == null ? void 0 : _a.sellerId) || void 0 : ((_c = (_b = detail.value) == null ? void 0 : _b.requester) == null ? void 0 : _c.id) || void 0
        };
        const cleanedParams = Object.fromEntries(
          Object.entries(reportParams).filter(([_, v]) => v !== void 0 && v !== null)
        );
        const res = await api_user.userApi.submitReport(cleanedParams);
        if (res.code === 200 || res.code === 201) {
          common_vendor.index.showToast({ title: res.data, icon: "success" });
          showReportDialog.value = false;
        } else {
          common_vendor.index.showToast({ title: res.msg || "举报提交失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/ProductDetail/ProductDetail.vue:626", "举报接口调用失败:", error);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      }
    };
    common_vendor.onReachBottom(() => {
      hasReachedBottom.value = true;
      setTimeout(() => {
        hasReachedBottom.value = false;
      }, 5e3);
    });
    const allProductImages = common_vendor.computed(() => {
      if (!detail.value)
        return [];
      const images = [];
      if (detail.value.imgUrl) {
        images.push(detail.value.imgUrl);
      }
      if (detail.value.detailImages && Array.isArray(detail.value.detailImages) && detail.value.detailImages.length) {
        images.push(...detail.value.detailImages);
      }
      const type2 = detailType === "demand" ? "demand" : "product";
      if (images.length === 0) {
        return [utils_uniHelper.sanitizeImageUrl("", type2)];
      }
      return images.map((u) => utils_uniHelper.sanitizeImageUrl(u, type2));
    });
    const previewImages = (index) => {
      if (allProductImages.value.length === 0)
        return;
      common_vendor.index.previewImage({
        current: index,
        urls: allProductImages.value
      });
    };
    const goToChat = () => {
      var _a;
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能聊一聊", redirectTo: "/pages/mine/mine" }))
        return;
      if (!utils_uniHelper.ensureStudentCertified({ content: "请先完成学生认证后再进行聊天" }))
        return;
      if (!utils_uniHelper.ensureMembership("normal", { content: "聊天功能仅对普通会员及以上开放" }))
        return;
      let sellerId = "";
      if (detailType === "product") {
        sellerId = detail.value.sellerId || "";
      } else if (detailType === "demand") {
        sellerId = ((_a = detail.value.requester) == null ? void 0 : _a.id) || "";
      }
      const itemId = detailId;
      const itemType = detailType;
      if (!sellerId || !itemId) {
        common_vendor.index.showToast({ title: "无法获取聊天对象信息", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/chat/chat?sellerId=${sellerId}&itemId=${itemId}&type=${itemType}`
      });
    };
    const goToDetail = (id, type2) => {
      const targetType = type2 || detailType || "product";
      common_vendor.index.navigateTo({
        url: `/pages/ProductDetail/ProductDetail?id=${id}&type=${targetType}`
      });
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A;
      return common_vendor.e({
        a: ((_b = (_a = detail.value) == null ? void 0 : _a.requester) == null ? void 0 : _b.avatar) || ((_c = detail.value) == null ? void 0 : _c.sellerAvatarUrl) || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
        b: common_vendor.t(((_e = (_d = detail.value) == null ? void 0 : _d.requester) == null ? void 0 : _e.nickname) || ((_f = detail.value) == null ? void 0 : _f.sellerNickname) || "未知用户"),
        c: common_vendor.t(common_vendor.unref(detailType) === "demand" ? ((_h = (_g = detail.value) == null ? void 0 : _g.requester) == null ? void 0 : _h.credittag) || "买家信用优秀" : ((_j = (_i = detail.value) == null ? void 0 : _i.user) == null ? void 0 : _j.credittag) || "卖家信用优秀"),
        d: type.value === "demand"
      }, type.value === "demand" ? {} : {}, {
        e: common_vendor.t(common_vendor.unref(detailType) === "demand" ? ((_k = detail.value) == null ? void 0 : _k.budget) || "0.00" : ((_l = detail.value) == null ? void 0 : _l.price) || "0.00"),
        f: common_vendor.unref(detailType) === "product" && ((_m = detail.value) == null ? void 0 : _m.originalPrice)
      }, common_vendor.unref(detailType) === "product" && ((_n = detail.value) == null ? void 0 : _n.originalPrice) ? {
        g: common_vendor.t((_o = detail.value) == null ? void 0 : _o.originalPrice)
      } : {}, {
        h: common_vendor.unref(detailType) === "product" && ((_p = detail.value) == null ? void 0 : _p.isNegotiable)
      }, common_vendor.unref(detailType) === "product" && ((_q = detail.value) == null ? void 0 : _q.isNegotiable) ? {
        i: common_vendor.t(((_r = detail.value) == null ? void 0 : _r.maxNegotiableAmount) || 0)
      } : {}, {
        j: common_vendor.t(((_s = detail.value) == null ? void 0 : _s.title) || "商品标题"),
        k: common_vendor.t(common_vendor.unref(detailType) === "demand" ? "需求详情" : "商品详情"),
        l: common_vendor.t(((_t = detail.value) == null ? void 0 : _t.description) || ((_u = detail.value) == null ? void 0 : _u.desc) || "暂无描述"),
        m: common_vendor.unref(detailType) !== "demand" && allProductImages.value.length
      }, common_vendor.unref(detailType) !== "demand" && allProductImages.value.length ? {
        n: common_vendor.f(allProductImages.value, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImages(index), index)
          };
        })
      } : {}, {
        o: common_vendor.t(common_vendor.unref(detailType) === "demand" ? "发布者信息" : "商家信息"),
        p: ((_w = (_v = detail.value) == null ? void 0 : _v.requester) == null ? void 0 : _w.avatar) || ((_x = detail.value) == null ? void 0 : _x.sellerAvatarUrl) || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
        q: common_vendor.t(((_z = (_y = detail.value) == null ? void 0 : _y.requester) == null ? void 0 : _z.nickname) || ((_A = detail.value) == null ? void 0 : _A.sellerNickname) || "未知用户"),
        r: common_vendor.t(common_vendor.unref(detailType) === "demand" ? `发布 ${sellerDemands.value.length} 条需求` : `在售 ${sellerProducts.value.length} 件商品`),
        s: common_vendor.o(($event) => showReportDialog.value = true),
        t: common_vendor.o(($event) => goToChat()),
        v: showReportDialog.value
      }, showReportDialog.value ? {
        w: common_vendor.o(($event) => showReportDialog.value = false),
        x: reportReason.value,
        y: common_vendor.o(($event) => reportReason.value = $event.detail.value),
        z: common_vendor.o(($event) => showReportDialog.value = false),
        A: common_vendor.o(submitReport)
      } : {}, {
        B: common_vendor.t(common_vendor.unref(detailType) === "demand" ? "该发布者其他需求" : "该商家其他商品"),
        C: Array.isArray(getCurrentRelatedList())
      }, Array.isArray(getCurrentRelatedList()) ? common_vendor.e({
        D: common_vendor.f(getCurrentRelatedList(), (item, index, i0) => {
          return {
            a: item.imgUrl || "https://api.shaolezhuan.cn/lzphoto/productDefault.jpg",
            b: common_vendor.t(common_vendor.unref(detailType) === "demand" ? item.budget : item.price),
            c: item.id,
            d: `/pages/ProductDetail/ProductDetail?id=${item.id}&type=${common_vendor.unref(detailType)}`,
            e: common_vendor.o(($event) => goToDetail(item.id, common_vendor.unref(detailType)), item.id)
          };
        }),
        E: getCurrentRelatedList().length === 0
      }, getCurrentRelatedList().length === 0 ? {
        F: common_vendor.t(common_vendor.unref(detailType) === "demand" ? "该发布者暂无其他需求" : "该商家暂无其他商品")
      } : {}) : {}, {
        G: common_vendor.p({
          list: common_vendor.unref(detailType) === "demand" ? demandRecommendations.value : goodsRecommendations.value,
          columnCount: 2,
          gap: 20
        }),
        H: hasReachedBottom.value
      }, hasReachedBottom.value ? {} : {}, {
        I: common_vendor.o(toggleCollect),
        J: common_vendor.p({
          checked: isCollected.value,
          circle: "true",
          bgColor: "#f5f5f5",
          bgColorChecked: "#ff4d4f",
          color: "#666",
          colorChecked: "#fff",
          size: "24"
        }),
        K: common_vendor.o(($event) => goToChat())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-219c4b86"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ProductDetail/ProductDetail.js.map
