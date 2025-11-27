"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
const hooks_useStorage = require("../../hooks/useStorage.js");
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
  __name: "post",
  setup(__props) {
    const { getStorage, setStorage } = hooks_useStorage.useStorage();
    const statusBarHeight = common_vendor.ref(0);
    const startCountdown = () => {
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(timer);
        }
      }, 1e3);
    };
    const images = common_vendor.ref([]);
    const normalizeImageUrl = (rawUrl) => {
      if (!rawUrl)
        return "";
      if (Array.isArray(rawUrl)) {
        const found = rawUrl.find((u) => !!u);
        return normalizeImageUrl(found);
      }
      if (typeof rawUrl === "object") {
        const candidate = rawUrl.url || rawUrl.fileUrl || rawUrl.path || rawUrl.src || rawUrl.link || rawUrl[0];
        return normalizeImageUrl(candidate);
      }
      if (typeof rawUrl === "string") {
        if (/^https?:\/\//i.test(rawUrl))
          return rawUrl;
        const trimmed = rawUrl.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
        if (/^https?:\/\//i.test(trimmed))
          return trimmed;
        if (trimmed.startsWith("/"))
          return `https://api.shaolezhuan.cn${trimmed}`;
        return `https://api.shaolezhuan.cn/${trimmed}`;
      }
      return "";
    };
    const loadDraftFromStorage = () => {
      try {
        const draft = getStorage("productDraft");
        common_vendor.index.__f__("log", "at pages/post/post.vue:372", "草稿内容为:", draft);
        if (draft && typeof draft === "object") {
          title.value = draft.title || "";
          description.value = draft.description || "";
          images.value = draft.images && Array.isArray(draft.images) ? draft.images : [];
          price.value = draft.price || "";
          originalPrice.value = draft.originalPrice || "";
          tradeMethod.value = draft.tradeMethod || "";
          selectedCategory.value = draft.category || "";
          selectedSubcategory.value = draft.subcategory || "";
          selectedCondition.value = draft.condition || "";
          negotiable.value = draft.negotiable || "不小刀";
          negotiablePrice.value = draft.negotiablePrice || "";
          showPriceInput.value = draft.negotiable && draft.negotiable.includes("可小刀") ? true : false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/post/post.vue:389", "加载草稿失败:", error);
      }
    };
    const chooseImage = async () => {
      if (images.value.length >= 9) {
        common_vendor.index.showToast({
          title: "最多只能上传9张图片",
          icon: "none"
        });
        return;
      }
      const chooseRes = await common_vendor.index.chooseImage({
        count: 9 - images.value.length,
        // 最多选择剩余可上传数量
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"]
      });
      common_vendor.index.showLoading({ title: "上传中...", mask: true });
      try {
        const uploadPromises = chooseRes.tempFilePaths.map(async (tempPath) => {
          var _a;
          const uploadRes = await common_vendor.index.uploadFile({
            url: "https://api.shaolezhuan.cn/api/upload/image",
            filePath: tempPath,
            // 临时路径作为上传源
            name: "file",
            // 后端接收文件的参数名（需与后端一致）
            header: {
              // 兼容后端两种写法：部分接口要求 Bearer，部分接口直接传 token
              "Authorization": ((_a = common_vendor.index.getStorageSync("token")) == null ? void 0 : _a.startsWith("Bearer")) ? common_vendor.index.getStorageSync("token") : `Bearer ${common_vendor.index.getStorageSync("token")}`
            },
            formData: {
              userId: common_vendor.index.getStorageSync("userId"),
              // 注意：formData需要是对象格式
              token: common_vendor.index.getStorageSync("token")
            }
          });
          let parsed = null;
          let urlCandidate = null;
          if (typeof uploadRes.data === "string") {
            try {
              parsed = JSON.parse(uploadRes.data);
            } catch (e) {
              urlCandidate = uploadRes.data;
            }
          } else {
            parsed = uploadRes.data;
          }
          if (!urlCandidate && parsed) {
            const d = parsed.data ?? parsed;
            if (Array.isArray(d)) {
              const first = d[0] ?? {};
              urlCandidate = first.url || first.fileUrl || first.path || null;
            } else {
              urlCandidate = d.url || d.fileUrl || d.path || d.src || d.link || null;
            }
          }
          const finalUrl = normalizeImageUrl(urlCandidate);
          common_vendor.index.__f__("log", "at pages/post/post.vue:464", "上传结果原始：", uploadRes.data, "解析：", parsed, "归一化URL：", finalUrl);
          const ok = uploadRes.statusCode === 200 || (parsed == null ? void 0 : parsed.code) === 200 || (parsed == null ? void 0 : parsed.status) === 200;
          if (!ok) {
            throw new Error(`图片上传失败: ${parsed && (parsed.msg || parsed.message) || uploadRes.errMsg || "未知错误"}`);
          }
          if (!finalUrl) {
            throw new Error("图片上传失败: 返回数据缺少URL");
          }
          return finalUrl;
        });
        const newUrls = await Promise.all(uploadPromises);
        images.value = [...images.value, ...newUrls];
        common_vendor.index.__f__("log", "at pages/post/post.vue:482", "所有图片上传完成，永久URL列表:", images.value);
        common_vendor.index.showToast({
          title: `成功上传${newUrls.length}张图片`,
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/post/post.vue:490", "上传失败:", error);
        common_vendor.index.showToast({
          title: error.message || "图片上传失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const deleteImage = async (index) => {
      const deleteUrl = images.value[index];
      common_vendor.index.__f__("log", "at pages/post/post.vue:505", "要删除的文件路径:", deleteUrl);
      if (!deleteUrl)
        return;
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这张图片吗？删除后不可恢复",
        cancelText: "取消",
        confirmText: "删除",
        async success(res) {
          if (res.confirm) {
            common_vendor.index.showLoading({ title: "删除中...", mask: true });
            try {
              const token = common_vendor.index.getStorageSync("token");
              const auth = (token == null ? void 0 : token.startsWith("Bearer")) ? token : `Bearer ${token}`;
              const url = `https://api.shaolezhuan.cn/api/upload/file?fileUrl=${encodeURIComponent(deleteUrl)}`;
              const deleteRes = await common_vendor.index.request({
                url,
                method: "DELETE",
                header: {
                  "Authorization": auth,
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              });
              const deleteData = deleteRes.data;
              if (deleteData.code === 200 || deleteRes.statusCode === 200 || deleteRes.statusCode === 204) {
                images.value.splice(index, 1);
                common_vendor.index.showToast({ title: "删除成功", icon: "success" });
              } else {
                images.value.splice(index, 1);
                common_vendor.index.showToast({
                  title: "图片已从列表移除，服务器删除失败",
                  icon: "none"
                });
                common_vendor.index.__f__("warn", "at pages/post/post.vue:545", "后端删除失败:", deleteData.msg);
              }
            } catch (error) {
              images.value.splice(index, 1);
              common_vendor.index.showToast({
                title: "网络异常，图片已从本地移除",
                icon: "none"
              });
              common_vendor.index.__f__("error", "at pages/post/post.vue:554", "删除异常:", error);
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
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
    const conditions = ["99新", "95新", "9成新", "8成新", "7成新", "6成新及以下"];
    const selectedCategory = common_vendor.ref("");
    const selectedSubcategory = common_vendor.ref("");
    const selectedCondition = common_vendor.ref("");
    const activeSelector = common_vendor.ref(0);
    const showPopup = common_vendor.ref(true);
    const countdown = common_vendor.ref(3);
    let timer = null;
    const toggleSelector = (type) => {
      if (activeSelector.value === type) {
        activeSelector.value = 0;
      } else {
        if (type === 2 && !selectedCategory.value)
          return;
        activeSelector.value = type;
      }
    };
    const selectCategory = (category) => {
      selectedCategory.value = category;
      selectedSubcategory.value = "";
      activeSelector.value = 0;
    };
    const selectSubcategory = (subcategory) => {
      selectedSubcategory.value = subcategory;
      activeSelector.value = 0;
    };
    const selectCondition = (condition) => {
      selectedCondition.value = condition;
      activeSelector.value = 0;
    };
    const description = common_vendor.ref("");
    const title = common_vendor.ref("");
    const price = common_vendor.ref("");
    const originalPrice = common_vendor.ref("");
    common_vendor.ref(false);
    const tradeMethods = [
      { label: "线下自行交易", value: "线下自行交易" }
    ];
    const tradeMethod = common_vendor.ref("");
    common_vendor.ref(false);
    const selectTradeMethod = (value) => {
      tradeMethod.value = value;
      tradePopup.value.close();
    };
    const pricePopup = common_vendor.ref(null);
    const handleOpenPricePopup = async () => {
      var _a;
      try {
        await common_vendor.nextTick$1();
        (_a = pricePopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/post/post.vue:661", "打开价格弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开价格弹窗失败", icon: "none" });
      }
    };
    const PriceModalCancel = () => {
      var _a;
      (_a = pricePopup.value) == null ? void 0 : _a.close();
      price.value = "";
    };
    const PriceModalConfirm = () => {
      var _a;
      if (!price.value) {
        common_vendor.index.showToast({ title: "请输入售价", icon: "none" });
        return;
      }
      if (originalPrice.value) {
        if (Number(originalPrice.value) <= 0) {
          common_vendor.index.showToast({ title: "原价必须大于0", icon: "none" });
          return;
        }
        if (Number(originalPrice.value) < Number(price.value)) {
          common_vendor.index.showToast({ title: "原价不能低于售价", icon: "none" });
          return;
        }
      }
      common_vendor.index.__f__("log", "at pages/post/post.vue:689", originalPrice.value);
      (_a = pricePopup.value) == null ? void 0 : _a.close();
    };
    const tradePopup = common_vendor.ref(null);
    const handleOpenTradePopup = async () => {
      var _a;
      try {
        await common_vendor.nextTick$1();
        (_a = tradePopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/post/post.vue:700", "打开交易方式弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开交易方式弹窗失败", icon: "none" });
      }
    };
    const showPriceInput = common_vendor.ref(false);
    const negotiable = common_vendor.ref();
    const negotiablePrice = common_vendor.ref("");
    const negotiablePopup = common_vendor.ref(null);
    const handleOpenNegotiable = async () => {
      var _a;
      try {
        await common_vendor.nextTick$1();
        (_a = negotiablePopup.value) == null ? void 0 : _a.open("bottom");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/post/post.vue:718", "打开小刀弹窗失败:", error);
        common_vendor.index.showToast({ title: "打开小刀弹窗失败", icon: "none" });
      }
    };
    const handleOptionSelect = (isNegotiable) => {
      var _a;
      if (isNegotiable) {
        showPriceInput.value = true;
      } else {
        negotiable.value = "不小刀";
        (_a = negotiablePopup.value) == null ? void 0 : _a.close();
      }
    };
    common_vendor.ref();
    const confirmNegotiablePrice = () => {
      var _a;
      if (negotiablePrice.value) {
        negotiable.value = "可小刀" + negotiablePrice.value + "元";
        (_a = negotiablePopup.value) == null ? void 0 : _a.close();
      } else {
        common_vendor.index.showToast({
          title: "请输入可刀价格",
          icon: "none"
        });
      }
    };
    const onPublish = async () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能发布商品", redirectTo: "/pages/mine/mine" }))
        return;
      if (!utils_uniHelper.ensureStudentCertified({ content: "发布商品需先完成学生认证" }))
        return;
      if (!utils_uniHelper.ensureMembership("normal", { content: "发布商品需普通会员或以上" }))
        return;
      const rawMembershipType = common_vendor.index.getStorageSync("membershipType");
      const membershipType = (() => {
        const val = String(rawMembershipType ?? "").trim();
        const lower = val.toLowerCase();
        if (!val)
          return "none";
        if (/白金/.test(val) || lower.includes("platinum") || val === "2" || lower.includes("vip_platinum") || lower.includes("platinum_member"))
          return "platinum";
        if (/普通/.test(val) || lower === "normal" || val === "1" || lower.includes("vip") || lower.includes("member"))
          return "normal";
        return lower === "platinum" || lower === "normal" ? lower : "none";
      })();
      if (images.value.length === 0) {
        common_vendor.index.showToast({
          title: "请至少上传一张图片",
          icon: "none"
        });
        return;
      }
      if (!description.value.trim()) {
        common_vendor.index.showToast({
          title: "请填写商品描述",
          icon: "none"
        });
        return;
      }
      if (!title.value.trim()) {
        common_vendor.index.showToast({
          title: "请填写商品标题",
          icon: "none"
        });
        return;
      }
      if (!price.value) {
        common_vendor.index.showToast({
          title: "请填写价格",
          icon: "none"
        });
        handleOpenPricePopup();
        return;
      }
      if (!tradeMethod.value) {
        common_vendor.index.showToast({
          title: "请选择交易方式",
          icon: "none"
        });
        handleOpenTradePopup();
        return;
      }
      if (!selectedCategory.value) {
        common_vendor.index.showToast({ title: "请选择物品种类", icon: "none" });
        return;
      }
      if (!selectedCondition.value) {
        common_vendor.index.showToast({ title: "请选择商品成色", icon: "none" });
        return;
      }
      const getCategoryId = () => {
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
        return categoryIdMap[selectedCategory.value] || 0;
      };
      const categoryId = getCategoryId();
      const attributesObj = {
        category: selectedCategory.value,
        subcategory: selectedSubcategory.value,
        condition: selectedCondition.value
      };
      const getSubmitData = () => {
        return {
          title: title.value,
          description: description.value.trim(),
          price: Number(price.value),
          originalPrice: originalPrice.value,
          categoryId,
          //分类ID
          attributes: JSON.stringify(attributesObj),
          //对象属性
          isNegotiable: !(negotiable.value === void 0 || negotiable.value === "不小刀"),
          maxNegotiableAmount: negotiablePrice.value,
          //砍价金额
          tradingMethod: tradeMethod.value,
          //交易方式
          mainImageUrl: images.value[0],
          //商品主图链接
          // 详情图提交为逗号分隔字符串（排除主图），以匹配后端 JSON 反序列化期望的 String 类型
          detailImages: images.value.slice(1).join(",")
        };
      };
      const productData = getSubmitData();
      common_vendor.index.__f__("log", "at pages/post/post.vue:869", "前端打包的发布商品数据:", productData);
      try {
        const createProductRes = await api_product.productApi.postProduct(productData);
        common_vendor.index.__f__("log", "at pages/post/post.vue:874", "后端订单返回的结果为：", createProductRes);
        if (createProductRes.code === 200 || createProductRes.code === 201) {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          resetForm();
          common_vendor.index.removeStorageSync("productDraft");
          setTimeout(() => {
            common_vendor.index.navigateTo({
              url: "/pages/wait/wait"
            });
          }, 500);
        } else if (createProductRes.code === 403) {
          const msg = createProductRes.msg || createProductRes.message || "发布受限，请稍后再试";
          common_vendor.index.showModal({
            title: "发布提醒",
            content: msg,
            cancelText: "去管理",
            confirmText: membershipType === "platinum" ? "我已知晓" : "去升级",
            success: (res) => {
              if (res.confirm) {
                if (membershipType === "platinum") {
                } else {
                  common_vendor.index.navigateTo({ url: "/pages/membership/membership" });
                }
              } else {
                common_vendor.index.navigateTo({ url: "/pages/publish/publish" });
              }
            }
          });
        } else {
          const msg = createProductRes.msg || createProductRes.message || "发布失败，请稍后再试";
          common_vendor.index.showModal({
            title: "发布提醒",
            content: msg,
            cancelText: "去管理",
            confirmText: membershipType === "platinum" ? "我已知晓" : "去升级",
            success: (res) => {
              if (res.confirm) {
                if (membershipType === "platinum") {
                } else {
                  common_vendor.index.navigateTo({ url: "/pages/membership/membership" });
                }
              } else {
                common_vendor.index.navigateTo({ url: "/pages/publish/publish" });
              }
            }
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/post/post.vue:935", "发布商品请求失败:", error);
        common_vendor.index.showToast({
          title: "发布商品请求失败，请检查网络或稍后再试",
          icon: "none"
        });
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
        description: description.value.trim(),
        images: [...images.value],
        // 深拷贝图片数组，避免引用问题
        price: price.value,
        originalPrice: originalPrice.value,
        tradeMethod: tradeMethod.value,
        category: selectedCategory.value,
        subcategory: selectedSubcategory.value,
        condition: selectedCondition.value,
        negotiable: negotiable.value || "不小刀",
        negotiablePrice: negotiablePrice.value,
        saveTime: (/* @__PURE__ */ new Date()).getTime()
        // 记录保存时间，便于后续管理
      };
      setStorage("productDraft", draftData.value);
      common_vendor.index.showToast({ title: "草稿保存成功", icon: "success" });
      common_vendor.index.__f__("log", "at pages/post/post.vue:981", "保存的草稿内容:", draftData.value);
      (_a = draftPopup.value) == null ? void 0 : _a.close();
      setTimeout(() => {
        common_vendor.index.navigateBack({ delta: 1 });
      }, 1500);
    };
    const handleBack = () => {
      if (description.value.trim() || images.value.length || price.value || tradeMethod.value) {
        if (draftPopup.value) {
          draftPopup.value.open("center");
        }
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
      var _a, _b, _c, _d;
      images.value = [];
      title.value = "";
      description.value = "";
      selectedCategory.value = "";
      selectedSubcategory.value = "";
      selectedCondition.value = "";
      activeSelector.value = 0;
      price.value = "";
      originalPrice.value = "";
      tradeMethod.value = "";
      negotiable.value = "";
      negotiablePrice.value = "";
      showPriceInput.value = false;
      (_a = pricePopup.value) == null ? void 0 : _a.close();
      (_b = tradePopup.value) == null ? void 0 : _b.close();
      (_c = negotiablePopup.value) == null ? void 0 : _c.close();
      (_d = draftPopup.value) == null ? void 0 : _d.close();
    };
    common_vendor.onMounted(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能发布商品", redirectTo: "/pages/mine/mine" })) {
        startCountdown();
        return;
      }
      if (!utils_uniHelper.ensureStudentCertified({ content: "发布商品需先完成学生认证" })) {
        startCountdown();
        return;
      }
      if (!utils_uniHelper.ensureMembership("normal", { content: "发布商品需普通会员或以上" })) {
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
        i: common_vendor.p({
          type: "plus",
          size: "30",
          color: "#999"
        }),
        j: common_vendor.o(chooseImage),
        k: common_vendor.f(images.value, (img, index, i0) => {
          return {
            a: img,
            b: "0832fc77-2-" + i0,
            c: common_vendor.o(($event) => deleteImage(index), index),
            d: index
          };
        }),
        l: common_vendor.p({
          type: "close",
          size: "18",
          color: "#fff"
        }),
        m: title.value,
        n: common_vendor.o(($event) => title.value = $event.detail.value),
        o: common_vendor.t(title.value.length),
        p: description.value,
        q: common_vendor.o(($event) => description.value = $event.detail.value),
        r: common_vendor.t(description.value.length),
        s: common_vendor.t(selectedCategory.value || "物品种类"),
        t: activeSelector.value === 1 ? 1 : "",
        v: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        w: common_vendor.o(($event) => toggleSelector(1)),
        x: common_vendor.t(selectedSubcategory.value || "子分类"),
        y: activeSelector.value === 2 ? 1 : "",
        z: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        A: common_vendor.o(($event) => toggleSelector(2)),
        B: !selectedCategory.value ? 1 : "",
        C: common_vendor.t(selectedCondition.value || "成色"),
        D: activeSelector.value === 3 ? 1 : "",
        E: common_vendor.p({
          type: "down",
          size: "18",
          color: "#999"
        }),
        F: common_vendor.o(($event) => toggleSelector(3)),
        G: activeSelector.value
      }, activeSelector.value ? common_vendor.e({
        H: activeSelector.value === 1
      }, activeSelector.value === 1 ? {
        I: common_vendor.f(Object.keys(categoryMap), (category, k0, i0) => {
          return {
            a: common_vendor.t(category),
            b: category,
            c: common_vendor.o(($event) => selectCategory(category), category)
          };
        })
      } : {}, {
        J: activeSelector.value === 2
      }, activeSelector.value === 2 ? {
        K: common_vendor.f(categoryMap[selectedCategory.value], (subcategory, k0, i0) => {
          return {
            a: common_vendor.t(subcategory),
            b: subcategory,
            c: common_vendor.o(($event) => selectSubcategory(subcategory), subcategory)
          };
        })
      } : {}, {
        L: activeSelector.value === 3
      }, activeSelector.value === 3 ? {
        M: common_vendor.f(conditions, (condition, k0, i0) => {
          return {
            a: common_vendor.t(condition),
            b: condition,
            c: common_vendor.o(($event) => selectCondition(condition), condition)
          };
        })
      } : {}) : {}, {
        N: common_vendor.t(price.value ? "¥" + price.value : "请填写"),
        O: common_vendor.p({
          type: "right",
          size: "18",
          color: "#999"
        }),
        P: common_vendor.o(handleOpenPricePopup),
        Q: common_vendor.t(tradeMethod.value || "请选择"),
        R: common_vendor.p({
          type: "right",
          size: "18",
          color: "#999"
        }),
        S: common_vendor.o(handleOpenTradePopup),
        T: common_vendor.t(negotiable.value || "请选择"),
        U: common_vendor.p({
          type: "right",
          size: "18",
          color: "#999"
        }),
        V: common_vendor.o(handleOpenNegotiable),
        W: common_vendor.o(onPublish),
        X: price.value,
        Y: common_vendor.o(($event) => price.value = $event.detail.value),
        Z: originalPrice.value,
        aa: common_vendor.o(($event) => originalPrice.value = $event.detail.value),
        ab: common_vendor.o(PriceModalCancel),
        ac: common_vendor.o(PriceModalConfirm),
        ad: common_vendor.sr(pricePopup, "0832fc77-9", {
          "k": "pricePopup"
        }),
        ae: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff",
          mask: true,
          ["mask-click"]: true
        }),
        af: common_vendor.f(tradeMethods, (method, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(method.label),
            b: tradeMethod.value === method.value
          }, tradeMethod.value === method.value ? {
            c: "0832fc77-11-" + i0 + ",0832fc77-10",
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
        ag: common_vendor.sr(tradePopup, "0832fc77-10", {
          "k": "tradePopup"
        }),
        ah: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff"
        }),
        ai: common_vendor.o(($event) => handleOptionSelect(true)),
        aj: common_vendor.o(($event) => handleOptionSelect(false)),
        ak: showPriceInput.value
      }, showPriceInput.value ? {
        al: negotiablePrice.value,
        am: common_vendor.o(($event) => negotiablePrice.value = $event.detail.value),
        an: common_vendor.o(confirmNegotiablePrice)
      } : {}, {
        ao: common_vendor.sr(negotiablePopup, "0832fc77-12", {
          "k": "negotiablePopup"
        }),
        ap: common_vendor.p({
          type: "bottom",
          ["background-color"]: "#fff",
          mask: true,
          ["mask-click"]: true
        }),
        aq: common_vendor.o(handleDraftCancel),
        ar: common_vendor.o(handleSaveDraft),
        as: common_vendor.sr(draftPopup, "0832fc77-13", {
          "k": "draftPopup"
        }),
        at: common_vendor.p({
          type: "center",
          ["background-color"]: "#fff",
          mask: true,
          ["mask-click"]: false
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0832fc77"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/post/post.js.map
