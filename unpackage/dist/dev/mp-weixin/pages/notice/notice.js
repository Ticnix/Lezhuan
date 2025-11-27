"use strict";
const common_vendor = require("../../common/vendor.js");
const api_notice = require("../../api/notice.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "notice",
  setup(__props) {
    const notificationList = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const showFilter = common_vendor.ref(false);
    const typeOptions = ["全部类型", "系统通知", "交易提醒", "消息互动"];
    const readOptions = ["全部状态", "未读", "已读"];
    const typeIndex = common_vendor.ref(0);
    const readIndex = common_vendor.ref(0);
    const expandedId = common_vendor.ref(null);
    const filterParams = common_vendor.ref({ type: "", isRead: null });
    const swipeOffsets = common_vendor.ref({});
    const startXMap = common_vendor.ref({});
    common_vendor.onLoad(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看系统通知", redirectTo: "/pages/mine/mine" }))
        return;
      fetchNotifications(true);
    });
    const fetchNotifications = async (isRefresh = false) => {
      if (isLoading.value && !isRefresh)
        return;
      isLoading.value = true;
      try {
        if (isRefresh) {
          page.value = 1;
          hasMore.value = true;
          swipeOffsets.value = {};
        }
        const params = {
          page: page.value,
          size: pageSize.value,
          ...filterParams.value.type && { type: filterParams.value.type },
          ...filterParams.value.isRead !== null && { isRead: filterParams.value.isRead }
        };
        const res = await api_notice.noticeApi.getNotificationList(params);
        if (res.code === 403) {
          utils_uniHelper.ensureMembership("normal", {
            title: "系统通知权限不足",
            content: "开通会员后可查看系统通知的具体内容",
            confirmText: "去开通"
          });
        } else if (res.code === 200 && res.data) {
          const rawRecords = res.data.notifications || [];
          const records = rawRecords.map((item) => ({
            id: item.id,
            type: item.notificationType,
            content: item.content,
            // 兼容后端字段差异：优先使用 createAt，其次 createTime / createdAt
            createTime: item.createAt || item.createTime || item.createdAt,
            isRead: item.isRead || false
          }));
          notificationList.value = isRefresh ? records : [...notificationList.value, ...records];
          hasMore.value = notificationList.value.length < res.data.total;
          page.value = res.data.current + 1;
        } else {
          common_vendor.index.showToast({ title: "获取通知失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notice/notice.vue:190", "获取通知失败:", error);
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      } finally {
        isLoading.value = false;
        if (isRefresh)
          common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleTouchStart = (e, itemId) => {
      startXMap.value[itemId] = e.touches[0].clientX;
      Object.keys(swipeOffsets.value).forEach((id) => {
        if (id !== itemId)
          swipeOffsets.value[id] = 0;
      });
    };
    const handleTouchMove = (e, itemId) => {
      const startX = startXMap.value[itemId];
      const moveX = e.touches[0].clientX;
      const offset = startX - moveX;
      swipeOffsets.value[itemId] = Math.max(-80, Math.min(0, -offset));
    };
    const handleTouchEnd = (itemId) => {
      if (Math.abs(swipeOffsets.value[itemId]) < 30) {
        swipeOffsets.value[itemId] = 0;
      } else {
        swipeOffsets.value[itemId] = -80;
      }
    };
    const getSwipeOffset = (itemId) => {
      return swipeOffsets.value[itemId] || 0;
    };
    const isItemSwiped = (itemId) => {
      return Math.abs(swipeOffsets.value[itemId] || 0) >= 30;
    };
    const handleDelete = async (itemId) => {
      try {
        const res = await api_notice.noticeApi.deleteNotification(itemId);
        notificationList.value = notificationList.value.filter((item) => item.id !== itemId);
        delete swipeOffsets.value[itemId];
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "删除成功", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: "删除失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notice/notice.vue:249", "删除通知失败:", error);
        common_vendor.index.showToast({ title: "删除失败，请重试", icon: "none" });
      }
    };
    const onRefresh = () => fetchNotifications(true);
    const loadMore = () => {
      if (!hasMore.value || isLoading.value)
        return;
      fetchNotifications();
    };
    const handleNotificationClick = async (item) => {
      if (!item.isRead) {
        try {
          const markRes = await api_notice.noticeApi.markAsRead(item.id);
          if (markRes && markRes.code === 200) {
            item.isRead = true;
            common_vendor.index.showToast({ title: "已标记为已读", icon: "none" });
          } else if (markRes && markRes.code === 403) {
            utils_uniHelper.ensureMembership("normal", {
              title: "会员权限不足",
              content: "标记已读与查看完整内容需会员权限",
              confirmText: "去开通"
            });
          } else {
            common_vendor.index.showToast({ title: "标记失败", icon: "none" });
          }
        } catch (error) {
          common_vendor.index.showToast({ title: "标记失败", icon: "none" });
        }
      }
      expandedId.value = expandedId.value === item.id ? null : item.id;
    };
    const handleTypeChange = (e) => {
      typeIndex.value = e.detail.value;
    };
    const handleReadChange = (e) => {
      readIndex.value = e.detail.value;
    };
    const resetFilter = () => {
      typeIndex.value = 0;
      readIndex.value = 0;
      filterParams.value = { type: "", isRead: null };
    };
    const confirmFilter = () => {
      filterParams.value = {
        type: typeIndex.value === 0 ? "" : typeIndex.value === 1 ? "system" : typeIndex.value === 2 ? "trade" : "message",
        isRead: readIndex.value === 0 ? null : readIndex.value === 1 ? false : true
      };
      fetchNotifications(true);
      showFilter.value = false;
    };
    const formatTime = (timestamp, format = "short") => {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      if (format === "full")
        return `${year}-${month}-${day} ${hour}:${minute}`;
      const diff = /* @__PURE__ */ new Date() - date;
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 60)
        return `${minutes}分钟前`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24)
        return `${hours}小时前`;
      const days = Math.floor(hours / 24);
      return days < 30 ? `${days}天前` : `${year}-${month}-${day}`;
    };
    const getTypeName = (type) => {
      switch (type) {
        case "system":
          return "系统通知";
        case "trade":
          return "交易提醒";
        case "message":
          return "消息互动";
        default:
          return "通知";
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "filter",
          size: "24"
        }),
        b: common_vendor.o(($event) => showFilter.value = !showFilter.value),
        c: showFilter.value
      }, showFilter.value ? {
        d: common_vendor.t(typeOptions[typeIndex.value]),
        e: common_vendor.o(handleTypeChange),
        f: typeIndex.value,
        g: typeOptions,
        h: common_vendor.t(readOptions[readIndex.value]),
        i: common_vendor.o(handleReadChange),
        j: readIndex.value,
        k: readOptions,
        l: common_vendor.o(resetFilter),
        m: common_vendor.o(confirmFilter)
      } : {}, {
        n: common_vendor.f(notificationList.value, (item, index, i0) => {
          return common_vendor.e({
            a: !item.isRead
          }, !item.isRead ? {} : {}, {
            b: common_vendor.t(getTypeName(item.type)),
            c: common_vendor.t(formatTime(item.createTime)),
            d: common_vendor.t(item.content),
            e: expandedId.value === item.id
          }, expandedId.value === item.id ? {
            f: common_vendor.t(item.id),
            g: common_vendor.t(item.content)
          } : {}, {
            h: common_vendor.o(($event) => handleNotificationClick(item), item.id),
            i: `translateX(${getSwipeOffset(item.id)}px)`,
            j: common_vendor.o(($event) => handleTouchStart($event, item.id), item.id),
            k: common_vendor.o(($event) => handleTouchMove($event, item.id), item.id),
            l: common_vendor.o(($event) => handleTouchEnd(item.id), item.id),
            m: isItemSwiped(item.id)
          }, isItemSwiped(item.id) ? {
            n: common_vendor.o(($event) => handleDelete(item.id), item.id)
          } : {}, {
            o: item.id,
            p: !item.isRead ? 1 : ""
          });
        }),
        o: notificationList.value.length === 0 && !isLoading.value
      }, notificationList.value.length === 0 && !isLoading.value ? {
        p: common_vendor.p({
          type: "notification",
          size: "60",
          color: "#ccc"
        })
      } : {}, {
        q: isLoading.value
      }, isLoading.value ? {
        r: common_vendor.p({
          type: "loading",
          size: "24",
          color: "#777",
          spin: true
        })
      } : {}, {
        s: !hasMore.value && notificationList.value.length > 0
      }, !hasMore.value && notificationList.value.length > 0 ? {} : {}, {
        t: common_vendor.o(loadMore),
        v: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1c2e4c1e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/notice.js.map
