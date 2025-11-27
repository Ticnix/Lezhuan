"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
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
  __name: "demand",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    const currentDemand = common_vendor.ref(null);
    const newBudget = common_vendor.ref("");
    const editPopup = common_vendor.ref(null);
    const categoryRange = common_vendor.ref(["全部分类"]);
    const statusRange = common_vendor.ref(["全部状态", "待审核", "已上架", "已拒绝", "已完成"]);
    const categoryIndex = common_vendor.ref(0);
    const statusIndex = common_vendor.ref(0);
    const publishedDemands = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看我的需求", redirectTo: "/pages/mine/mine" }))
        return;
      fetchMyDemands();
      common_vendor.index.$on("pageShow", fetchMyDemands);
    });
    const convertStatusToChinese = (englishStatus) => {
      const statusMap = {
        "pending_review": "待审核",
        "active": "已上架",
        "rejected": "已拒绝",
        "resolved": "已完成"
      };
      return statusMap[englishStatus] || englishStatus;
    };
    const fetchMyDemands = async () => {
      try {
        isLoading.value = true;
        const myData = { current: 1, size: 1e3 };
        const res = await api_product.productApi.getMyDemands(myData);
        const rawDemandsList = res.data.records || [];
        publishedDemands.value = rawDemandsList.filter((raw) => raw.status !== "delisted").map((raw) => ({
          id: raw.id,
          title: raw.title,
          desc: raw.description || "",
          imgUrl: raw.imageUrl || "https://api.shaolezhuan.cn/lzphoto/demandpic.png",
          budget: raw.budget || 0,
          publishTime: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
          status: raw.status || "pending_review",
          // 明确状态字段
          category: raw.categoryName || "其他",
          // 假设后端返回“categoryName”存储分类名称
          isTop: raw.urgentPush || false,
          isOnHome: raw.isHomepageFeatured || false
        }));
        const categories = [...new Set(publishedDemands.value.map((item) => item.category))];
        categoryRange.value = ["全部分类", ...categories];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demand/demand.vue:271", "获取需求列表失败:", error);
        common_vendor.index.showToast({ title: "加载需求失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const filteredDemands = common_vendor.computed(() => {
      return publishedDemands.value.filter((demand) => {
        const matchesSearch = searchKeyword.value === "" ? true : demand.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) || demand.desc && demand.desc.toLowerCase().includes(searchKeyword.value.toLowerCase());
        const selectedCategory = categoryRange.value[categoryIndex.value];
        const matchesCategory = selectedCategory === "全部分类" ? true : demand.category === selectedCategory;
        const selectedStatus = statusRange.value[statusIndex.value];
        const demandStatusCN = convertStatusToChinese(demand.status);
        const matchesStatus = selectedStatus === "全部状态" ? true : demandStatusCN === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      });
    });
    const handleCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      fetchMyDemands();
    };
    const handleStatusChange = (e) => {
      statusIndex.value = e.detail.value;
      fetchMyDemands();
    };
    const handleSearch = () => {
    };
    const getStatusClass = (status) => {
      const classMap = {
        "pending_review": "status-pending",
        // 待审核状态样式
        "active": "status-onsale",
        // 已上架/出售中样式
        "rejected": "status-rejected",
        // 已拒绝状态样式
        "resolved": "status-completed"
        // 已完成状态样式（如有需要）
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
        url: `/pages/demandDetail/demandDetail?id=${id}`
      });
    };
    const handleOpenEditPopup = async (demand) => {
      var _a;
      try {
        currentDemand.value = { ...demand };
        newBudget.value = demand.budget.toString();
        await common_vendor.nextTick$1();
        (_a = editPopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demand/demand.vue:359", "打开编辑弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开弹窗失败", icon: "none" });
      }
    };
    const CancelEdit = () => {
      var _a;
      (_a = editPopup.value) == null ? void 0 : _a.close();
    };
    const confirmBudgetAdjustment = async () => {
      var _a;
      if (!currentDemand.value)
        return;
      if (!newBudget.value || isNaN(newBudget.value) || parseFloat(newBudget.value) <= 0) {
        common_vendor.index.showToast({
          title: "请输入有效的预算金额",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      try {
        isLoading.value = true;
        const res = await api_product.productApi.updateDemandBudget(
          currentDemand.value.id,
          { budget: parseFloat(newBudget.value) }
        );
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "预算调整成功", icon: "success" });
          fetchMyDemands();
          const index = publishedDemands.value.findIndex((item) => item.id === currentDemand.value.id);
          if (index !== -1) {
            publishedDemands.value[index].budget = parseFloat(newBudget.value);
          }
        } else {
          common_vendor.index.showToast({
            title: `调整失败：${res.msg}`,
            icon: "none"
          });
        }
        (_a = editPopup.value) == null ? void 0 : _a.close();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demand/demand.vue:417", "调整预算失败:", error);
        common_vendor.index.showToast({ title: "调整失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const setDemandTop = async () => {
      var _a;
      if (!currentDemand.value || currentDemand.value.isTop)
        return;
      try {
        isLoading.value = true;
        const targetTopStatus = true;
        const demandId = currentDemand.value.id;
        const res = await api_product.productApi.setDemandTop(demandId);
        common_vendor.index.__f__("log", "at pages/demand/demand.vue:435", "置顶情况", res);
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "需求已申请置顶",
            icon: "success"
          });
          fetchMyDemands();
          const index = publishedDemands.value.findIndex((item) => item.id === currentDemand.value.id);
          if (index !== -1) {
            publishedDemands.value[index].isTop = true;
          }
        } else {
          common_vendor.index.showToast({
            title: `置顶失败：${res.msg}`,
            icon: "none"
          });
        }
        (_a = editPopup.value) == null ? void 0 : _a.close();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demand/demand.vue:457", "置顶操作失败:", error);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const setDemandToHome = async () => {
      var _a;
      if (!currentDemand.value || currentDemand.value.isOnHome)
        return;
      try {
        isLoading.value = true;
        const targetStatus = true;
        const demandId = currentDemand.value.id;
        const res = await api_product.productApi.setDemandTohome(demandId);
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "需求已申请上首页推荐",
            icon: "success"
          });
          fetchMyDemands();
          const index = publishedDemands.value.findIndex((item) => item.id === currentDemand.value.id);
          if (index !== -1) {
            publishedDemands.value[index].isOnHome = true;
          }
        } else {
          common_vendor.index.showToast({
            title: `推荐失败：${res.msg}`,
            icon: "none"
          });
        }
        (_a = editPopup.value) == null ? void 0 : _a.close();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/demand/demand.vue:495", "设置首页展示失败:", error);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      } finally {
        isLoading.value = false;
      }
    };
    const confirmCompleteTransaction = async () => {
      if (!currentDemand.value || currentDemand.value.status === "resolved") {
        common_vendor.index.showToast({ title: "该需求已完成交易", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认完成交易",
        content: "确定要将此需求标记为已完成吗？标记后将无法编辑",
        confirmText: "确认",
        cancelText: "取消",
        success: async (res) => {
          var _a;
          if (res.confirm) {
            try {
              isLoading.value = true;
              await api_product.productApi.updateDemandStatus(
                currentDemand.value.id,
                { status: "resolved" }
              );
              const index = publishedDemands.value.findIndex((item) => item.id === currentDemand.value.id);
              if (index !== -1) {
                publishedDemands.value[index].status = "resolved";
              }
              common_vendor.index.showToast({ title: "已标记为完成", icon: "success" });
              (_a = editPopup.value) == null ? void 0 : _a.close();
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/demand/demand.vue:534", "标记完成失败:", error);
              common_vendor.index.showToast({ title: "操作失败", icon: "none" });
            } finally {
              isLoading.value = false;
            }
          }
        }
      });
    };
    const deleteDemand = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除该需求吗？删除后不可恢复",
        confirmText: "删除",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              isLoading.value = true;
              const deleteRes = await api_product.productApi.deleteDemand(id);
              common_vendor.index.__f__("log", "at pages/demand/demand.vue:557", "删除需求ID", id);
              common_vendor.index.__f__("log", "at pages/demand/demand.vue:558", "删除需求反馈", deleteRes);
              if (deleteRes.code === 200) {
                fetchMyDemands();
                publishedDemands.value = publishedDemands.value.filter((item) => item.id !== id);
                common_vendor.index.showToast({ title: "需求已删除", icon: "success" });
              } else {
                common_vendor.index.showToast({ title: `删除失败：${deleteRes.msg}`, icon: "none" });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/demand/demand.vue:568", "删除需求失败:", error);
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
        url: `/pages/receive/receive`
      });
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
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
      } : filteredDemands.value.length > 0 ? {
        t: common_vendor.f(filteredDemands.value, (demand, k0, i0) => {
          return common_vendor.e({
            a: demand.imgUrl || "https://api.shaolezhuan.cn/lzphoto/demandpic.png",
            b: common_vendor.t(demand.title),
            c: common_vendor.t(demand.budget.toFixed(2)),
            d: common_vendor.t(formatTime(demand.publishTime)),
            e: "76430bf0-6-" + i0,
            f: common_vendor.t(demand.location),
            g: common_vendor.t(convertStatusToChinese(demand.status)),
            h: common_vendor.n(getStatusClass(demand.status)),
            i: demand.isTop === 1
          }, demand.isTop === 1 ? {
            j: "76430bf0-7-" + i0,
            k: common_vendor.p({
              size: "mini",
              text: "已置顶",
              type: "primary"
            })
          } : {}, {
            l: demand.isOnHome
          }, demand.isOnHome ? {
            m: "76430bf0-8-" + i0,
            n: common_vendor.p({
              size: "mini",
              text: "首页展示",
              type: "success"
            })
          } : {}, {
            o: common_vendor.o(($event) => navigateToDetail(demand.id), demand.id),
            p: convertStatusToChinese(demand.status) !== "已完成"
          }, convertStatusToChinese(demand.status) !== "已完成" ? {
            q: "76430bf0-9-" + i0,
            r: common_vendor.p({
              type: "compose",
              size: "20",
              color: "#409EFF"
            }),
            s: common_vendor.o(($event) => handleOpenEditPopup(demand), demand.id),
            t: "76430bf0-10-" + i0,
            v: common_vendor.p({
              type: "trash",
              size: "20",
              color: "#F56C6C"
            }),
            w: common_vendor.o(($event) => deleteDemand(demand.id), demand.id)
          } : {}, {
            x: demand.id
          });
        }),
        v: common_vendor.p({
          type: "map-pin",
          size: "18",
          color: "#999"
        })
      } : {
        w: common_vendor.p({
          type: "empty",
          size: "60",
          color: "#ccc"
        }),
        x: common_vendor.o(goToPublish)
      }, {
        s: filteredDemands.value.length > 0,
        y: newBudget.value,
        z: common_vendor.o(($event) => newBudget.value = $event.detail.value),
        A: ((_a = currentDemand.value) == null ? void 0 : _a.status) !== "resolved" && !((_b = currentDemand.value) == null ? void 0 : _b.isTop)
      }, ((_c = currentDemand.value) == null ? void 0 : _c.status) !== "resolved" && !((_d = currentDemand.value) == null ? void 0 : _d.isTop) ? {
        B: common_vendor.o(setDemandTop),
        C: (_e = currentDemand.value) == null ? void 0 : _e.isTop
      } : {}, {
        D: ((_f = currentDemand.value) == null ? void 0 : _f.status) !== "resolved" && !((_g = currentDemand.value) == null ? void 0 : _g.isOnHome)
      }, ((_h = currentDemand.value) == null ? void 0 : _h.status) !== "resolved" && !((_i = currentDemand.value) == null ? void 0 : _i.isOnHome) ? {
        E: common_vendor.o(setDemandToHome),
        F: (_j = currentDemand.value) == null ? void 0 : _j.isOnHome
      } : {}, {
        G: !((_k = currentDemand.value) == null ? void 0 : _k.isDraft) && ((_l = currentDemand.value) == null ? void 0 : _l.status) !== "resolved"
      }, !((_m = currentDemand.value) == null ? void 0 : _m.isDraft) && ((_n = currentDemand.value) == null ? void 0 : _n.status) !== "resolved" ? {
        H: common_vendor.o(confirmCompleteTransaction)
      } : {}, {
        I: common_vendor.o(confirmBudgetAdjustment),
        J: common_vendor.o(CancelEdit),
        K: common_vendor.sr(editPopup, "76430bf0-12", {
          "k": "editPopup"
        }),
        L: common_vendor.p({
          type: "bottom",
          mask: true,
          ["mask-click"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-76430bf0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/demand/demand.js.map
