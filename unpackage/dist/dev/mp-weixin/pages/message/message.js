"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chat = require("../../api/chat.js");
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
  __name: "message",
  setup(__props) {
    const userId = common_vendor.index.getStorageSync("userId") || "";
    const searchQuery = common_vendor.ref("");
    const chats = common_vendor.ref([]);
    const isFirstLoad = common_vendor.ref(true);
    const goToNoticePage = () => {
      common_vendor.index.navigateTo({
        url: `/pages/notice/notice`
      });
    };
    const replaceImageUrl = (text) => {
      const imageUrlRegex = /https?:\/\/\S+\.(png|jpg|jpeg|gif|webp)/gi;
      return text.replace(imageUrlRegex, "[图片]");
    };
    common_vendor.onPullDownRefresh(() => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看消息", redirectTo: "/pages/mine/mine" })) {
        common_vendor.index.stopPullDownRefresh();
        return;
      }
      Promise.all([fetchChats(), fetchUnreadCount()]).then(() => {
        common_vendor.index.stopPullDownRefresh();
      }).catch((error) => {
        common_vendor.index.__f__("error", "at pages/message/message.vue:129", "下拉刷新失败：", error);
        common_vendor.index.stopPullDownRefresh();
      });
    });
    const unreadCount = common_vendor.ref(0);
    const fetchUnreadCount = async () => {
      try {
        const res = await api_notice.noticeApi.getUnreadCount();
        if (res.code === 200 && res.data) {
          unreadCount.value = res.data.totalUnreadCount || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/message.vue:145", "获取未读通知数量失败:", error);
      }
    };
    common_vendor.onShow(async () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看消息", redirectTo: "/pages/mine/mine" }))
        return;
      const pages = getCurrentPages();
      if (pages.length > 1) {
        await fetchChats();
        await fetchUnreadCount();
      }
      isFirstLoad.value = false;
      fetchUnreadCount();
    });
    const filteredChats = common_vendor.computed(() => {
      if (!searchQuery.value) {
        return chats.value;
      }
      const query = searchQuery.value.toLowerCase();
      return chats.value.filter(
        (chat) => chat.name.toLowerCase().includes(query) || chat.lastMessage.toLowerCase().includes(query)
      );
    });
    const handleSearch = () => {
    };
    const clearSearch = () => {
      searchQuery.value = "";
    };
    const handleChatClick = (chat) => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看并进入聊天", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.navigateTo({
        url: `/pages/chat/chat?sellerId=${chat.senderId}`
      });
    };
    common_vendor.onMounted(async () => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能查看消息", redirectTo: "/pages/mine/mine" }))
        return;
      common_vendor.index.onNavigationBarButtonTap((res) => {
        if (res.type === "back") {
          fetchChats();
          fetchUnreadCount();
        }
      });
    });
    const fetchChats = async () => {
      try {
        const res = await api_chat.chatApi.getChatConversations();
        common_vendor.index.__f__("log", "at pages/message/message.vue:223", "后端返回的消息列表为：", res);
        if (res.code === 200) {
          const chatData = res.data.map((item) => {
            const name = item.senderId === userId ? item.receiverNickname : item.senderNickname;
            const senderId = item.senderId === userId ? item.receiverId : item.senderId;
            const avatar = item.senderId === userId ? item.receiverAvatar : item.senderAvatar;
            const lastMessage = replaceImageUrl(item.lastMessageContent || "");
            return {
              name,
              // 使用条件判断后的name
              avatar,
              lastMessage,
              time: item.lastMessageTime || "",
              unread: item.unreadCount || 0,
              senderId
            };
          });
          chats.value = chatData;
          await fetchUnreadCount();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取聊天列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "接口请求异常",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/message/message.vue:262", "获取聊天列表失败：", error);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        b: common_vendor.o([($event) => searchQuery.value = $event.detail.value, handleSearch]),
        c: searchQuery.value,
        d: searchQuery.value
      }, searchQuery.value ? {
        e: common_vendor.o(clearSearch),
        f: common_vendor.p({
          type: "clear",
          size: "16",
          color: "#999"
        })
      } : {}, {
        g: common_vendor.p({
          type: "notification",
          size: "24",
          color: "#007aff"
        }),
        h: common_vendor.t(unreadCount.value),
        i: common_vendor.t(unreadCount.value > 1 ? "未读通知" : "未读通知"),
        j: unreadCount.value > 0
      }, unreadCount.value > 0 ? {
        k: common_vendor.t(unreadCount.value)
      } : {}, {
        l: common_vendor.p({
          type: "right",
          size: "20",
          color: "#999"
        }),
        m: common_vendor.o(goToNoticePage),
        n: common_vendor.f(filteredChats.value, (chat, index, i0) => {
          return common_vendor.e({
            a: chat.avatar,
            b: chat.name,
            c: chat.unread > 0
          }, chat.unread > 0 ? {
            d: common_vendor.t(chat.unread > 99 ? "99+" : chat.unread)
          } : {}, {
            e: common_vendor.t(chat.name),
            f: common_vendor.t(chat.time),
            g: common_vendor.t(chat.lastMessage),
            h: chat.unread > 0 ? 1 : "",
            i: index,
            j: common_vendor.o(($event) => handleChatClick(chat), index)
          });
        }),
        o: filteredChats.value.length === 0
      }, filteredChats.value.length === 0 ? {
        p: common_vendor.p({
          type: "chat",
          size: "48",
          color: "#ccc"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c1b26cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
