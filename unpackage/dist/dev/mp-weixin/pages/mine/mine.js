"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const api_chat = require("../../api/chat.js");
const hooks_useStorage = require("../../hooks/useStorage.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const DEFAULT_AVATAR_URL = "https://api.shaolezhuan.cn/lzphoto/avatars/avatar3.jpg";
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const { getStorage, setStorage } = hooks_useStorage.useStorage();
    const userId = common_vendor.computed(() => getStorage("userId"));
    const token = common_vendor.computed(() => getStorage("token"));
    const userInfo = common_vendor.ref(null);
    const studentInfo = common_vendor.ref(null);
    const studentAuthenticated = common_vendor.ref(false);
    const studentStatus = common_vendor.ref(null);
    const needRelogin = common_vendor.ref(false);
    const studentIdNumber = common_vendor.ref(null);
    const RANDOM_AVATARS = [
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar3.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar4.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar5.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar6.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar7.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar8.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar9.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar10.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar11.jpg",
      "https://api.shaolezhuan.cn/lzphoto/avatars/avatar12.jpg"
    ];
    const pickRandomAvatar = () => {
      const idx = Math.floor(Math.random() * RANDOM_AVATARS.length);
      return RANDOM_AVATARS[idx] || DEFAULT_AVATAR_URL;
    };
    const isDefaultNickname = (name) => {
      if (!name)
        return true;
      const normalized = String(name).trim();
      return normalized === "微信用户" || normalized === "用户" || normalized === "未知用户" || normalized === "点击头像登录";
    };
    const isInvalidAvatar = (url) => {
      if (!url)
        return true;
      const u = String(url).trim();
      return u === "" || /default|placeholder/i.test(u);
    };
    const generateRandomNickname = () => {
      const suffix = Math.floor(1e3 + Math.random() * 9e3);
      return `乐转用户${suffix}`;
    };
    const bannerList = common_vendor.ref([
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/membership/m1.jpg" },
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/membership/m2.jpg" },
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/membership/m3.jpg" },
      { imageUrl: "https://api.shaolezhuan.cn/lzphoto/membership/m4.jpg", link: "/pages/promo/promo" }
    ]);
    const unreadCount = common_vendor.ref(0);
    const unreadTimer = common_vendor.ref(null);
    common_vendor.onShow(() => {
      if (token.value && userId.value) {
        fetchUserInfo();
        fetchStudentInfo();
        fetchUnreadMessages();
        if (!unreadTimer.value)
          startUnreadTimer();
      }
    });
    common_vendor.onMounted(() => {
      if (token.value && userId.value) {
        fetchUserInfo();
        fetchStudentInfo();
        fetchUnreadMessages();
        startUnreadTimer();
      }
    });
    const startUnreadTimer = () => {
      unreadTimer.value = setInterval(() => {
        fetchUnreadMessages();
      }, 3e3);
    };
    const fetchUnreadMessages = async () => {
      try {
        const userId2 = getStorage("userId");
        if (!userId2)
          return;
        const res = await api_chat.chatApi.unreadMessages(userId2);
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:248", "获取用户所有未读消息返回信息:", res);
        if (res.code === 200) {
          unreadCount.value = res.data.totalUnreadCount || 0;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:254", "获取未读消息失败:", err);
      }
    };
    const fetchUserInfo = async () => {
      try {
        const res = await api_user.userApi.getCurrentUser();
        if (res.code === 200) {
          const serverData = res.data || {};
          const cachedNickname = common_vendor.index.getStorageSync("nickname");
          const cachedAvatar = common_vendor.index.getStorageSync("avatarUrl");
          const serverAvatar = serverData.avatarUrl;
          const finalAvatarUrl = isInvalidAvatar(serverAvatar) ? cachedAvatar || DEFAULT_AVATAR_URL : serverAvatar;
          const normalizeMembershipType = (raw) => {
            const val = String(raw ?? "").trim();
            const lower = val.toLowerCase();
            if (!val)
              return "none";
            if (/白金/.test(val) || lower.includes("platinum") || val === "2" || lower.includes("vip_platinum") || lower.includes("platinum_member")) {
              return "platinum";
            }
            if (/普通/.test(val) || lower === "normal" || val === "1" || lower.includes("vip") || lower.includes("member")) {
              return "normal";
            }
            return lower === "platinum" || lower === "normal" ? lower : "none";
          };
          userInfo.value = {
            ...serverData,
            nickname: isDefaultNickname(serverData.nickname) ? cachedNickname || serverData.nickname : serverData.nickname,
            avatarUrl: finalAvatarUrl
          };
          common_vendor.index.setStorageSync("membershipType", normalizeMembershipType(userInfo.value.membershipType));
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:295", "获取当前用户信息：", userInfo.value);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:298", "获取用户信息失败:", err);
      }
    };
    const fetchStudentInfo = async () => {
      try {
        const res = await api_user.userApi.studentInfoStatus();
        if (res.code === 200) {
          studentInfo.value = res.data;
          studentStatus.value = res.data.status;
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:311", "获取当前用户学生认证状态：", studentInfo.value);
          if (studentStatus.value === "approved") {
            studentAuthenticated.value = true;
            studentIdNumber.value = studentInfo.value.studentIdNumber;
            setStorage("studentIdNumber", studentIdNumber.value);
            common_vendor.index.__f__("log", "at pages/mine/mine.vue:317", studentIdNumber.value);
          }
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:321", "获取学生认证失败:", err);
      }
    };
    const handleLogin = async () => {
      var _a, _b;
      if (token.value && userId.value) {
        common_vendor.index.showModal({ title: "提示", content: "您已登录，无需重复登录", showCancel: false });
        return;
      }
      try {
        const userProfileRes = await new Promise((resolve, reject) => {
          common_vendor.index.getUserProfile({
            desc: "用于完善用户资料",
            success: resolve,
            fail: reject
          });
        });
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            success: resolve,
            fail: reject
          });
        });
        if (!loginRes.code) {
          throw new Error("无法获取登录凭证");
        }
        const storedNickname = common_vendor.index.getStorageSync("nickname");
        const nicknameCandidate = storedNickname || (isDefaultNickname((_a = userProfileRes == null ? void 0 : userProfileRes.userInfo) == null ? void 0 : _a.nickName) ? generateRandomNickname() : (_b = userProfileRes == null ? void 0 : userProfileRes.userInfo) == null ? void 0 : _b.nickName);
        const avatarCandidate = pickRandomAvatar();
        const loginData = {
          code: loginRes.code,
          nickname: nicknameCandidate,
          avatarUrl: avatarCandidate
        };
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:373", "code：", loginData.code);
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:374", "nickname（提交后端）：", loginData.nickname);
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:375", "avatarUrl（提交后端）：", loginData.avatarUrl);
        const res = await api_user.userApi.wxLogin(loginData);
        if (res.code === 200) {
          const userData = res.data;
          const finalNickname = isDefaultNickname(userData == null ? void 0 : userData.nickname) ? loginData.nickname : userData.nickname;
          const finalAvatarUrl = !isInvalidAvatar(userData == null ? void 0 : userData.avatarUrl) ? userData.avatarUrl : loginData.avatarUrl;
          setStorage("token", userData.token);
          setStorage("nickname", finalNickname);
          setStorage("avatarUrl", finalAvatarUrl);
          setStorage("userId", userData.userId);
          setStorage("openid", userData.openid);
          const normalizeMembershipType = (raw) => {
            const val = String(raw ?? "").trim();
            const lower = val.toLowerCase();
            if (!val)
              return "none";
            if (/白金/.test(val) || lower.includes("platinum") || val === "2" || lower.includes("vip_platinum") || lower.includes("platinum_member")) {
              return "platinum";
            }
            if (/普通/.test(val) || lower === "normal" || val === "1" || lower.includes("vip") || lower.includes("member")) {
              return "normal";
            }
            return lower === "platinum" || lower === "normal" ? lower : "none";
          };
          common_vendor.index.setStorageSync("membershipType", normalizeMembershipType(userData.membershipType));
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:409", "后端返回的数据：", userData);
          userInfo.value = {
            nickname: finalNickname,
            avatarUrl: finalAvatarUrl
          };
          fetchStudentInfo();
          fetchUnreadMessages();
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        } else if (res.code === 400 && res.msg.includes("code无效")) {
          needRelogin.value = true;
          throw new Error("登录凭证已过期，请重新登录");
        } else {
          throw new Error(res.msg || "登录失败");
        }
      } catch (err) {
        common_vendor.index.showToast({ title: err.message, icon: "none" });
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:430", "登录过程出错:", err);
      }
    };
    const handleRelogin = () => {
      needRelogin.value = false;
      handleLogin();
    };
    const handleSetting = () => common_vendor.index.navigateTo({ url: "/pages/setting/setting" });
    const handleAuth = () => common_vendor.index.navigateTo({ url: "/pages/student/student" });
    const handlePublish = () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看我发布的商品", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({ url: "/pages/publish/publish" });
    };
    const handleSell = () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看我卖出的商品", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({ url: "/pages/sell/sell" });
    };
    const handleHistory = () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看历史浏览", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({ url: "/pages/history/history" });
    };
    const handleDemand = () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看我的需求", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({ url: "/pages/demand/demand" });
    };
    const handleCollect = () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看收藏", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({ url: "/pages/collect/collect" });
    };
    const handleMessage = () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看消息", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({ url: "/pages/message/message" });
    };
    const handleGuide = () => common_vendor.index.navigateTo({ url: "/pages/guide/guide" });
    const navigateToMembership = () => common_vendor.index.navigateTo({ url: "/pages/membership/membership" });
    const handleBannerClick = (item) => {
      if (item && item.link) {
        common_vendor.index.navigateTo({ url: item.link });
      } else {
        navigateToMembership();
      }
    };
    const handleWant = () => {
      common_vendor.index.showToast({
        title: "其他功能正在维护中",
        icon: "none",
        duration: 2e3,
        mask: true
      });
    };
    common_vendor.onUnmounted(() => {
      if (unreadTimer.value) {
        clearInterval(unreadTimer.value);
        unreadTimer.value = null;
      }
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: (_a = userInfo.value) == null ? void 0 : _a.avatarUrl,
        b: common_vendor.o(handleLogin),
        c: common_vendor.t(((_b = userInfo.value) == null ? void 0 : _b.nickname) || "点击头像登录"),
        d: common_vendor.t(studentIdNumber.value || "请完成学生认证"),
        e: common_vendor.p({
          type: "gear",
          size: "30"
        }),
        f: common_vendor.o(handleSetting),
        g: studentAuthenticated.value
      }, studentAuthenticated.value ? {
        h: common_vendor.f(bannerList.value, (item, index, i0) => {
          return {
            a: item.imageUrl,
            b: common_vendor.o(($event) => handleBannerClick(item), index),
            c: index
          };
        })
      } : {
        i: common_vendor.o(handleAuth)
      }, {
        j: common_vendor.o(handlePublish),
        k: common_vendor.o(handleSell),
        l: unreadCount.value > 0
      }, unreadCount.value > 0 ? {
        m: common_vendor.t(unreadCount.value)
      } : {}, {
        n: common_vendor.o(handleMessage),
        o: common_vendor.o(handleHistory),
        p: common_vendor.o(handleDemand),
        q: common_vendor.o(handleCollect),
        r: common_vendor.o(handleGuide),
        s: common_vendor.o(handleWant),
        t: common_vendor.o((...args) => _ctx.handleContact && _ctx.handleContact(...args)),
        v: common_vendor.o((...args) => _ctx.handleContactService && _ctx.handleContactService(...args)),
        w: needRelogin.value
      }, needRelogin.value ? {
        x: common_vendor.o(handleRelogin)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
