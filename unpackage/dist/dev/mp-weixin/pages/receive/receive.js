"use strict";
const common_vendor = require("../../common/vendor.js");
const hooks_useStorage = require("../../hooks/useStorage.js");
const api_product = require("../../api/product.js");
const utils_system = require("../../utils/system.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "receive",
  setup(__props) {
    const { getStorage, setStorage } = hooks_useStorage.useStorage();
    const statusBarHeight = common_vendor.ref(0);
    const showPopup = common_vendor.ref(true);
    const countdown = common_vendor.ref(3);
    let timer = null;
    const startCountdown = () => {
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(timer);
        }
      }, 1e3);
    };
    const loadDraftFromStorage = () => {
      try {
        const draft = getStorage("demandDraft");
        common_vendor.index.__f__("log", "at pages/receive/receive.vue:221", "草稿内容为:", draft);
        if (draft && typeof draft === "object") {
          title.value = draft.title || "";
          description.value = draft.description || "";
          contactInfo.value = draft.contactInfo || "";
          budget.value = draft.budget || "";
          tradeMethod.value = draft.tradeMethod || "";
          selectedCategory.value = draft.selectedCategory || "";
          selectedCategoryId.value = draft.categoryId || null;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/receive/receive.vue:233", "加载草稿失败:", error);
      }
    };
    const categories = [
      { id: 1, name: "电子数码" },
      { id: 2, name: "其他" },
      { id: 3, name: "生活用品" },
      { id: 4, name: "虚拟物品" },
      { id: 5, name: "自行车" },
      { id: 6, name: "体育用品" },
      { id: 7, name: "电器" },
      { id: 8, name: "二手书" }
    ];
    const selectedCategory = common_vendor.ref("");
    const selectedCategoryId = common_vendor.ref(null);
    const onCategoryPicked = (e) => {
      var _a;
      const index = (_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.value;
      const category = categories[index];
      if (!category)
        return;
      selectedCategory.value = category.name;
      selectedCategoryId.value = category.id;
    };
    const title = common_vendor.ref("");
    const description = common_vendor.ref("");
    const contactInfo = common_vendor.ref("");
    const budget = common_vendor.ref("");
    const tradeMethod = common_vendor.ref("");
    const isPhone = common_vendor.computed(() => {
      return /^1[3-9]\d{9}$/.test(contactInfo.value);
    });
    const tradeMethods = [
      { label: "线下自行交易", value: "线下自行交易" }
    ];
    const budgetPopup = common_vendor.ref(null);
    const handleOpenBudgetPopup = async () => {
      var _a;
      try {
        await common_vendor.nextTick$1();
        (_a = budgetPopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/receive/receive.vue:287", "打开预算弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开预算弹窗失败", icon: "none" });
      }
    };
    const BudgetModalCancel = () => {
      var _a;
      (_a = budgetPopup.value) == null ? void 0 : _a.close();
      budget.value = "";
    };
    const BudgetModalConfirm = () => {
      var _a;
      if (!budget.value) {
        common_vendor.index.showToast({ title: "请输入预算", icon: "none" });
        return;
      }
      (_a = budgetPopup.value) == null ? void 0 : _a.close();
    };
    const tradePopup = common_vendor.ref(null);
    const handleOpenTradePopup = async () => {
      var _a;
      try {
        await common_vendor.nextTick$1();
        (_a = tradePopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/receive/receive.vue:312", "打开交易方式弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开交易方式弹窗失败", icon: "none" });
      }
    };
    const selectTradeMethod = (value) => {
      tradeMethod.value = value;
      tradePopup.value.close();
    };
    const onPublish = async () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能发布需求", redirectTo: "/pages/mine/mine" }))
        return;
      if (!utils_uniHelper.ensureStudentCertified({ content: "发布需求需先完成学生认证" }))
        return;
      if (!utils_uniHelper.ensureMembership("platinum", { content: "发布需求需白金会员" }))
        return;
      if (!selectedCategoryId.value) {
        common_vendor.index.showToast({ title: "请选择需求分类", icon: "none" });
        return;
      }
      if (!title.value.trim()) {
        common_vendor.index.showToast({ title: "请填写需求标题", icon: "none" });
        return;
      }
      if (!description.value.trim()) {
        common_vendor.index.showToast({ title: "请填写需求描述", icon: "none" });
        return;
      }
      if (!contactInfo.value.trim()) {
        common_vendor.index.showToast({ title: "请填写联系方式", icon: "none" });
        return;
      }
      if (!budget.value) {
        common_vendor.index.showToast({ title: "请填写预算", icon: "none" });
        handleOpenBudgetPopup();
        return;
      }
      if (!tradeMethod.value) {
        common_vendor.index.showToast({ title: "请选择交易方式", icon: "none" });
        handleOpenTradePopup();
        return;
      }
      const requesterId = getStorage("userId");
      const demandData = {
        title: title.value,
        description: description.value.trim(),
        budget: Number(budget.value),
        requesterId,
        categoryName: selectedCategory.value,
        categoryId: selectedCategoryId.value,
        // 直接使用选择的分类id
        contactInfo: contactInfo.value.trim(),
        tradeMethod: tradeMethod.value
      };
      common_vendor.index.__f__("log", "at pages/receive/receive.vue:374", "发布需求数据:", demandData);
      try {
        const createDemandRes = await api_product.productApi.postDemand(demandData);
        common_vendor.index.__f__("log", "at pages/receive/receive.vue:379", "发布结果:", createDemandRes);
        if (createDemandRes.code === 200 || createDemandRes.code === 201) {
          common_vendor.index.showToast({ title: "发布成功", icon: "success" });
          resetForm();
          common_vendor.index.removeStorageSync("demandDraft");
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/wait/wait" });
          }, 500);
        } else if (createDemandRes.code === 403) {
          const msg = createDemandRes.msg || createDemandRes.message || "发布受限，请稍后再试";
          common_vendor.index.showModal({
            title: "发布提醒",
            content: msg,
            confirmText: "知道了",
            showCancel: false
          });
        } else {
          common_vendor.index.showToast({ title: createDemandRes.msg || createDemandRes.message || "发布失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/receive/receive.vue:400", "发布失败:", error);
        common_vendor.index.showToast({ title: "网络异常，发布失败", icon: "none" });
      }
    };
    const draftPopup = common_vendor.ref(null);
    const draftData = common_vendor.ref({});
    const handleDraftCancel = () => {
      var _a;
      (_a = draftPopup.value) == null ? void 0 : _a.close();
      setTimeout(() => {
        common_vendor.index.navigateBack({ delta: 1 });
      }, 300);
    };
    const handleSaveDraft = () => {
      var _a;
      draftData.value = {
        title: title.value,
        description: description.value,
        contactInfo: contactInfo.value,
        budget: budget.value,
        tradeMethod: tradeMethod.value,
        categoryId: selectedCategoryId.value,
        selectedCategory: selectedCategory.value,
        saveTime: (/* @__PURE__ */ new Date()).getTime()
      };
      setStorage("demandDraft", draftData.value);
      common_vendor.index.__f__("log", "at pages/receive/receive.vue:430", "需求草稿内容为：", draftData.value);
      common_vendor.index.showToast({ title: "草稿保存成功", icon: "success" });
      (_a = draftPopup.value) == null ? void 0 : _a.close();
      setTimeout(() => {
        common_vendor.index.navigateBack({ delta: 1 });
      }, 1500);
    };
    const handleBack = () => {
      var _a;
      if (title.value || description.value || contactInfo.value || budget.value || tradeMethod.value || selectedCategoryId.value) {
        (_a = draftPopup.value) == null ? void 0 : _a.open("center");
        return true;
      } else {
        common_vendor.index.navigateBack({ delta: 1 });
        return false;
      }
    };
    common_vendor.onBackPress((options) => {
      if (options.from === "backbutton") {
        return handleBack();
      }
      return false;
    });
    const resetForm = () => {
      var _a, _b, _c;
      title.value = "";
      description.value = "";
      contactInfo.value = "";
      budget.value = "";
      tradeMethod.value = "";
      selectedCategory.value = "";
      selectedCategoryId.value = null;
      (_a = budgetPopup.value) == null ? void 0 : _a.close();
      (_b = tradePopup.value) == null ? void 0 : _b.close();
      (_c = draftPopup.value) == null ? void 0 : _c.close();
    };
    common_vendor.onMounted(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能发布需求", redirectTo: "/pages/mine/mine" })) {
        startCountdown();
        return;
      }
      if (!utils_uniHelper.ensureStudentCertified({ content: "发布需求需先完成学生认证" })) {
        startCountdown();
        return;
      }
      if (!utils_uniHelper.ensureMembership("platinum", { content: "发布需求需白金会员" })) {
        startCountdown();
        return;
      }
      statusBarHeight.value = utils_system.getStatusBarHeight();
      loadDraftFromStorage();
      startCountdown();
    });
    common_vendor.onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showPopup.value
      }, showPopup.value ? {
        b: common_vendor.t(countdown.value > 0 ? `请等待 ${countdown.value} 秒` : "我知道了"),
        c: common_vendor.o(($event) => showPopup.value = false),
        d: countdown.value > 0
      } : {}, {
        e: !showPopup.value
      }, !showPopup.value ? common_vendor.e({
        f: statusBarHeight.value + "px",
        g: common_vendor.p({
          type: "left",
          size: "24"
        }),
        h: common_vendor.o(handleBack),
        i: title.value,
        j: common_vendor.o(($event) => title.value = $event.detail.value),
        k: common_vendor.t(title.value.length),
        l: description.value,
        m: common_vendor.o(($event) => description.value = $event.detail.value),
        n: common_vendor.t(description.value.length),
        o: contactInfo.value,
        p: common_vendor.o(($event) => contactInfo.value = $event.detail.value),
        q: contactInfo.value
      }, contactInfo.value ? {
        r: common_vendor.t(isPhone.value ? "手机号格式" : "微信号格式")
      } : {}, {
        s: common_vendor.t(selectedCategory.value || "请选择"),
        t: common_vendor.p({
          type: "right",
          size: "18",
          color: "#999"
        }),
        v: categories,
        w: common_vendor.o(onCategoryPicked),
        x: common_vendor.t(budget.value ? "¥" + budget.value : "请填写"),
        y: common_vendor.p({
          type: "right",
          size: "18",
          color: "#999"
        }),
        z: common_vendor.o(handleOpenBudgetPopup),
        A: common_vendor.t(tradeMethod.value || "请选择"),
        B: common_vendor.p({
          type: "right",
          size: "18",
          color: "#999"
        }),
        C: common_vendor.o(handleOpenTradePopup),
        D: common_vendor.o(onPublish),
        E: budget.value,
        F: common_vendor.o(($event) => budget.value = $event.detail.value),
        G: common_vendor.o(BudgetModalCancel),
        H: common_vendor.o(BudgetModalConfirm),
        I: common_vendor.sr(budgetPopup, "22495fe6-4", {
          "k": "budgetPopup"
        }),
        J: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff",
          mask: true,
          ["mask-click"]: true
        }),
        K: common_vendor.f(tradeMethods, (method, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(method.label),
            b: tradeMethod.value === method.value
          }, tradeMethod.value === method.value ? {
            c: "22495fe6-6-" + i0 + ",22495fe6-5",
            d: common_vendor.p({
              type: "checkmark",
              size: "20",
              color: "#FFCC00"
            })
          } : {}, {
            e: method.value,
            f: common_vendor.o(($event) => selectTradeMethod(method.value), method.value)
          });
        }),
        L: common_vendor.sr(tradePopup, "22495fe6-5", {
          "k": "tradePopup"
        }),
        M: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        N: common_vendor.o(handleDraftCancel),
        O: common_vendor.o(handleSaveDraft),
        P: common_vendor.sr(draftPopup, "22495fe6-7", {
          "k": "draftPopup"
        }),
        Q: common_vendor.p({
          type: "center",
          ["background-color"]: "#fff",
          mask: true,
          ["mask-click"]: false
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-22495fe6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/receive/receive.js.map
