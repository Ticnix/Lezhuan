"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_tag2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_tag + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "publish",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const currentGoods = common_vendor.ref(null);
    const newPrice = common_vendor.ref("");
    const editPopup = common_vendor.ref(null);
    const categoryRange = common_vendor.ref(["全部分类"]);
    const statusRange = common_vendor.ref(["全部状态", "待审核", "已上架", "已拒绝", "已完成"]);
    const categoryIndex = common_vendor.ref(0);
    const statusIndex = common_vendor.ref(0);
    const publishedGoods = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      fetchMyGoods();
      common_vendor.index.$on("pageShow", fetchMyGoods);
    });
    const convertStatusToChinese = (englishStatus) => {
      const statusMap = {
        "pending_review": "待审核",
        "active": "已上架",
        "rejected": "已拒绝",
        "sold": "已完成"
      };
      return statusMap[englishStatus] || englishStatus;
    };
    const fetchMyGoods = async () => {
      try {
        isLoading.value = true;
        const myData = {
          current: 1,
          size: 100,
          timestamp: Date.now()
          // category: categoryRange.value[categoryIndex.value] === '全部种类' ? '' : categoryRange.value[categoryIndex.value],
          // status: statusRange.value[statusIndex.value] === '全部状态' ? '' : statusRange.value[statusIndex.value]
        };
        const res = await api_product.productApi.getMyGoods(myData);
        const rawGoodsList = res.data.records || [];
        common_vendor.index.__f__("log", "at pages/publish/publish.vue:260", "后端返回的我发布的商品数据是：", rawGoodsList);
        publishedGoods.value = rawGoodsList.filter((raw) => raw.status !== "delisted").map((raw) => ({
          id: raw.id,
          title: raw.title,
          desc: raw.description || "",
          imgUrl: raw.mainImageUrl || "",
          price: raw.price || 0,
          category: raw.categoryName || "",
          location: "",
          publishTime: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
          status: convertStatusToChinese(raw.status) || "待审核",
          isTop: raw.urgentPush || false,
          isOnHome: raw.isHomepageFeatured || false
        }));
        common_vendor.index.__f__("log", "at pages/publish/publish.vue:279", "清洗完的数据：", publishedGoods.value);
        const categories = [...new Set(publishedGoods.value.map((item) => item.category))];
        categoryRange.value = ["全部分类", ...categories];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/publish/publish.vue:285", "获取商品列表失败:", error);
        common_vendor.index.showToast({
          title: "加载商品失败",
          icon: "none",
          duration: 2e3
        });
      } finally {
        isLoading.value = false;
      }
    };
    const filteredGoods = common_vendor.computed(() => {
      return publishedGoods.value.filter((goods) => {
        const matchesSearch = searchKeyword.value === "" ? true : goods.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) || goods.desc && goods.desc.toLowerCase().includes(searchKeyword.value.toLowerCase());
        const selectedCategory = categoryRange.value[categoryIndex.value];
        const matchesCategory = selectedCategory === "全部分类" ? true : goods.category === selectedCategory;
        const selectedStatus = statusRange.value[statusIndex.value];
        const goodsStatusCN = convertStatusToChinese(goods.status);
        const matchesStatus = selectedStatus === "全部状态" ? true : goodsStatusCN === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      });
    });
    const handleCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      fetchMyGoods();
    };
    const handleStatusChange = (e) => {
      statusIndex.value = e.detail.value;
      fetchMyGoods();
    };
    const handleSearch = () => {
    };
    const getStatusClass = (status) => {
      const classMap = {
        "待审核": "status-pending",
        // 待审核状态样式
        "已上架": "status-onsale",
        // 已上架/出售中样式
        "已拒绝": "status-rejected",
        // 已拒绝状态样式
        "已完成": "status-completed"
        // 已完成状态样式
      };
      return classMap[status] || "status-default";
    };
    const formatTime = (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      if (diff < 3600 * 1e3) {
        return `${Math.floor(diff / (60 * 1e3))}分钟前`;
      } else if (diff < 24 * 3600 * 1e3) {
        return `${Math.floor(diff / (3600 * 1e3))}小时前`;
      } else {
        return `${Math.floor(diff / (24 * 3600 * 1e3))}天前`;
      }
    };
    const navigateToDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/goodsDetail/goodsDetail?id=${id}`
      });
    };
    const handleOpenEditPopup = async (goods) => {
      var _a;
      try {
        currentGoods.value = { ...goods };
        newPrice.value = goods.price.toString();
        await common_vendor.nextTick$1();
        await fetchMyGoods();
        (_a = editPopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/publish/publish.vue:376", "打开编辑弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开弹窗失败", icon: "none" });
      }
    };
    const CancelEdit = () => {
      var _a;
      (_a = editPopup.value) == null ? void 0 : _a.close();
    };
    const confirmPriceReduction = async () => {
      var _a;
      if (!currentGoods.value)
        return;
      if (!newPrice.value || isNaN(newPrice.value) || parseFloat(newPrice.value) >= currentGoods.value.price) {
        common_vendor.index.showToast({
          title: "请输入有效的新价格",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      try {
        isLoading.value = true;
        const res = await api_product.productApi.updateGoodsPrice(
          currentGoods.value.id,
          // 路径中的 productId
          { price: parseFloat(newPrice.value) }
          // 请求体中的新价格
        );
        common_vendor.index.__f__("log", "at pages/publish/publish.vue:417", "降价状态：", newPrice);
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "降价成功", icon: "success" });
          const index = publishedGoods.value.findIndex((item) => item.id === currentGoods.value.id);
          if (index !== -1) {
            publishedGoods.value[index].price = parseFloat(newPrice.value);
          }
        } else {
          common_vendor.index.showToast({
            title: `调整失败：${res.msg}`,
            icon: "none"
          });
        }
        (_a = editPopup.value) == null ? void 0 : _a.close();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/publish/publish.vue:435", "降价失败:", error);
        common_vendor.index.showToast({ title: "降价失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const setGoodsTop = async () => {
      var _a;
      if (!currentGoods.value || currentGoods.value.isTop)
        return;
      try {
        isLoading.value = true;
        const targetTopStatus = true;
        const productId = currentGoods.value.id;
        const res = await api_product.productApi.setGoodsTop(productId);
        common_vendor.index.__f__("log", "at pages/publish/publish.vue:455", "置顶情况", res);
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "商品已申请置顶",
            icon: "success"
          });
          fetchMyGoods();
          const index = publishedGoods.value.findIndex((item) => item.id === currentGoods.value.id);
          if (index !== -1) {
            publishedGoods.value[index].isTop = targetTopStatus;
          }
        } else {
          common_vendor.index.showToast({
            title: `置顶失败：${res.msg}`,
            icon: "none"
          });
        }
        (_a = editPopup.value) == null ? void 0 : _a.close();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/publish/publish.vue:477", "置顶操作失败:", error);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const setGoodsToHome = async () => {
      var _a;
      if (!currentGoods.value || currentGoods.value.isOnHome)
        return;
      try {
        isLoading.value = true;
        const targetStatus = true;
        const productId = currentGoods.value.id;
        const res = await api_product.productApi.setGoodsToHome(productId);
        common_vendor.index.__f__("log", "at pages/publish/publish.vue:496", "商品推荐的结果：", res);
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "商品已申请上首页推荐",
            icon: "success"
          });
          await fetchMyGoods();
          const index = publishedGoods.value.findIndex((item) => item.id === currentGoods.value.id);
          if (index !== -1) {
            publishedGoods.value[index].isOnHome = targetStatus;
          }
        } else {
          common_vendor.index.showToast({
            title: `推荐失败：${res.msg}`,
            icon: "none"
          });
        }
        (_a = editPopup.value) == null ? void 0 : _a.close();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/publish/publish.vue:518", "设置首页展示失败:", error);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const confirmGoodsSold = async () => {
      if (!currentGoods.value || currentGoods.value.status === "已完成") {
        common_vendor.index.showToast({ title: "该商品已售出", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认售出",
        content: "确定要将此商品标记为已售出吗？标记后将无法编辑",
        confirmText: "确认",
        cancelText: "取消",
        success: async (res) => {
          var _a;
          if (res.confirm) {
            try {
              isLoading.value = true;
              await api_product.productApi.updateGoodsStatus(
                currentGoods.value.id,
                // 路径参数：商品ID
                { status: "sold" }
              );
              await fetchMyGoods();
              const index = publishedGoods.value.findIndex((item) => item.id === currentGoods.value.id);
              if (index !== -1) {
                publishedGoods.value[index].status = "已完成";
              }
              common_vendor.index.showToast({ title: "已标记为售出", icon: "success" });
              (_a = editPopup.value) == null ? void 0 : _a.close();
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/publish/publish.vue:557", "标记售出失败:", error);
              common_vendor.index.showToast({ title: "操作失败", icon: "none" });
            } finally {
              isLoading.value = false;
            }
          }
        }
      });
    };
    const deleteGoods = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除该商品吗？删除后不可恢复",
        confirmText: "删除",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              isLoading.value = true;
              const deleteRes = await api_product.productApi.deleteGoods(id);
              common_vendor.index.__f__("log", "at pages/publish/publish.vue:580", "删除商品ID", id);
              common_vendor.index.__f__("log", "at pages/publish/publish.vue:581", "删除商品反馈", deleteRes);
              if (deleteRes.code === 200) {
                common_vendor.index.showToast({ title: "商品已删除", icon: "success" });
                publishedGoods.value = publishedGoods.value.filter((item) => item.id !== id);
                await fetchMyGoods();
              } else {
                common_vendor.index.showToast({ title: `删除失败:${deleteRes.msg}`, icon: "none" });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/publish/publish.vue:593", "删除商品失败:", error);
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            } finally {
              isLoading.value = false;
            }
          }
        }
      });
    };
    const goToPublish = () => {
      common_vendor.index.navigateTo({
        url: `/pages/post/post`
      });
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      return common_vendor.e({
        a: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        b: common_vendor.o(goToPublish),
        c: common_vendor.p({
          type: "search",
          size: "24",
          color: "#999"
        }),
        d: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, handleSearch]),
        e: searchKeyword.value,
        f: common_vendor.t(categoryRange.value[categoryIndex.value]),
        g: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        h: categoryRange.value,
        i: categoryIndex.value,
        j: common_vendor.o(handleCategoryChange),
        k: common_vendor.t(statusRange.value[statusIndex.value]),
        l: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        m: statusRange.value,
        n: statusIndex.value,
        o: common_vendor.o(handleStatusChange),
        p: common_vendor.p({
          type: "info",
          size: "24",
          color: "#7c89ff"
        }),
        q: isLoading.value
      }, isLoading.value ? {
        r: common_vendor.p({
          type: "loading",
          size: "40",
          color: "#7c89ff",
          spin: true
        })
      } : filteredGoods.value.length > 0 ? {
        t: common_vendor.f(filteredGoods.value, (goods, k0, i0) => {
          return common_vendor.e({
            a: goods.imgUrl || "https://api.shaolezhuan.cn/lzphoto/productDefault.jpg",
            b: common_vendor.t(goods.title),
            c: common_vendor.t(goods.price.toFixed(2)),
            d: common_vendor.t(formatTime(goods.publishTime)),
            e: common_vendor.t(convertStatusToChinese(goods.status)),
            f: common_vendor.n(getStatusClass(goods.status)),
            g: goods.isTop === 1
          }, goods.isTop === 1 ? {
            h: "bfce3555-6-" + i0,
            i: common_vendor.p({
              size: "mini",
              text: "已置顶",
              type: "primary"
            })
          } : {}, {
            j: goods.isOnHome
          }, goods.isOnHome ? {
            k: "bfce3555-7-" + i0,
            l: common_vendor.p({
              size: "mini",
              text: "首页展示",
              type: "success"
            })
          } : {}, {
            m: common_vendor.o(($event) => navigateToDetail(goods.id), goods.id),
            n: convertStatusToChinese(goods.status) !== "已完成"
          }, convertStatusToChinese(goods.status) !== "已完成" ? {
            o: "bfce3555-8-" + i0,
            p: common_vendor.p({
              type: "compose",
              size: "20",
              color: "#409EFF"
            }),
            q: common_vendor.o(($event) => handleOpenEditPopup(goods), goods.id),
            r: "bfce3555-9-" + i0,
            s: common_vendor.p({
              type: "trash",
              size: "20",
              color: "#F56C6C"
            }),
            t: common_vendor.o(($event) => deleteGoods(goods.id), goods.id)
          } : {}, {
            v: goods.id
          });
        })
      } : {
        v: common_vendor.p({
          type: "empty",
          size: "60",
          color: "#ccc"
        }),
        w: common_vendor.o(goToPublish)
      }, {
        s: filteredGoods.value.length > 0,
        x: newPrice.value,
        y: common_vendor.o(($event) => newPrice.value = $event.detail.value),
        z: ((_a = currentGoods.value) == null ? void 0 : _a.status) !== "已完成" && !((_b = currentGoods.value) == null ? void 0 : _b.isTop)
      }, ((_c = currentGoods.value) == null ? void 0 : _c.status) !== "已完成" && !((_d = currentGoods.value) == null ? void 0 : _d.isTop) ? {
        A: common_vendor.o(setGoodsTop),
        B: (_e = currentGoods.value) == null ? void 0 : _e.isTop
      } : {}, {
        C: ((_f = currentGoods.value) == null ? void 0 : _f.status) !== "已完成" && !((_g = currentGoods.value) == null ? void 0 : _g.isOnHome)
      }, ((_h = currentGoods.value) == null ? void 0 : _h.status) !== "已完成" && !((_i = currentGoods.value) == null ? void 0 : _i.isOnHome) ? {
        D: common_vendor.o(setGoodsToHome),
        E: (_j = currentGoods.value) == null ? void 0 : _j.isOnHome
      } : {}, {
        F: ((_k = currentGoods.value) == null ? void 0 : _k.status) !== "已完成"
      }, ((_l = currentGoods.value) == null ? void 0 : _l.status) !== "已完成" ? {
        G: common_vendor.o(confirmGoodsSold)
      } : {}, {
        H: common_vendor.o(confirmPriceReduction),
        I: common_vendor.o(CancelEdit),
        J: common_vendor.sr(editPopup, "bfce3555-11", {
          "k": "editPopup"
        }),
        K: common_vendor.p({
          type: "bottom",
          mask: true,
          ["mask-click"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bfce3555"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/publish/publish.js.map
