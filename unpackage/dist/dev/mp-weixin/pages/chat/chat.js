"use strict";
const common_vendor = require("../../common/vendor.js");
const api_chat = require("../../api/chat.js");
const api_product = require("../../api/product.js");
const api_user = require("../../api/user.js");
const utils_uniHelper = require("../../utils/uniHelper.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  (_easycom_uni_icons2 + _easycom_uni_tag2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_tag)();
}
const heartbeatInterval = 3e4;
const connectionTimeout = 1e4;
const _sfc_main = {
  __name: "chat",
  setup(__props) {
    const timer = common_vendor.ref(null);
    const socketTask = common_vendor.ref(null);
    const socketUrl = common_vendor.ref("wss://api.shaolezhuan.cn/native-ws");
    const isSocketConnected = common_vendor.ref(false);
    const reconnectCount = common_vendor.ref(0);
    const maxReconnectCount = common_vendor.ref(5);
    const heartbeatTimer = common_vendor.ref(null);
    const connectionTimer = common_vendor.ref(null);
    const currentUser = common_vendor.ref({
      id: null,
      // 将从API获取
      avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
      nickname: ""
    });
    const sellerInfo = common_vendor.ref({
      name: "",
      avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar2.jpeg",
      type: "buyer"
    });
    const itemInfo = common_vendor.ref({
      name: "",
      price: 0,
      image: "https://api.shaolezhuan.cn/lzphoto/productDefault.jpg",
      tags: [],
      budget: 0
    });
    const showPopup = common_vendor.ref(true);
    const sellerId = common_vendor.ref("");
    const itemId = common_vendor.ref("");
    const itemType = common_vendor.ref("");
    const showParams = common_vendor.ref(true);
    const showSystemTip = common_vendor.ref(true);
    const inputContent = common_vendor.ref("");
    const messageList = common_vendor.ref([]);
    const scrollTop = common_vendor.ref(0);
    const isAutoScroll = common_vendor.ref(true);
    common_vendor.ref(null);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(100);
    const hasMore = common_vendor.ref(true);
    const isLoadingMore = common_vendor.ref(false);
    const totalPages = common_vendor.ref(0);
    const loadedPages = common_vendor.ref([]);
    const isLoadingFromCache = common_vendor.ref(true);
    common_vendor.ref("");
    const receiverId = common_vendor.ref("");
    const senderId = common_vendor.ref("");
    const isProductChat = common_vendor.ref(false);
    const showEmojiPanel = common_vendor.ref(false);
    const emojiList = common_vendor.ref([
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🥸",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖"
    ]);
    const fetchCurrentUserInfo = async () => {
      try {
        const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
        const storedUserId = common_vendor.index.getStorageSync("studentIdNumber");
        const storedNickname = common_vendor.index.getStorageSync("nickname");
        const storedAvatarUrl = common_vendor.index.getStorageSync("avatarUrl");
        if (storedUserInfo || storedUserId) {
          currentUser.value = {
            id: storedUserId || (storedUserInfo == null ? void 0 : storedUserInfo.studentIdNumber) || (storedUserInfo == null ? void 0 : storedUserInfo.id) || 1,
            avatar: storedAvatarUrl || (storedUserInfo == null ? void 0 : storedUserInfo.avatarUrl) || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
            nickname: storedNickname || (storedUserInfo == null ? void 0 : storedUserInfo.nickName) || (storedUserInfo == null ? void 0 : storedUserInfo.nickname) || "用户"
          };
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:268", "从本地存储获取用户信息:", currentUser.value);
        }
        const res = await api_user.userApi.getCurrentUser();
        if (res.code === 200 && res.data) {
          currentUser.value = {
            id: res.data.id,
            avatar: res.data.avatarUrl || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
            nickname: res.data.nickname || "用户"
          };
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:279", "从服务器获取当前用户信息成功:", currentUser.value);
        } else if (!currentUser.value.id) {
          throw new Error("服务器返回数据无效");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:285", "获取当前用户信息失败:", error);
        if (!currentUser.value.id) {
          const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
          const storedUserId = common_vendor.index.getStorageSync("studentIdNumber");
          const storedNickname = common_vendor.index.getStorageSync("nickname");
          const storedAvatarUrl = common_vendor.index.getStorageSync("avatarUrl");
          if (storedUserInfo || storedUserId) {
            currentUser.value = {
              id: storedUserId || (storedUserInfo == null ? void 0 : storedUserInfo.studentIdNumber) || (storedUserInfo == null ? void 0 : storedUserInfo.id) || 1,
              avatar: storedAvatarUrl || (storedUserInfo == null ? void 0 : storedUserInfo.avatarUrl) || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
              nickname: storedNickname || (storedUserInfo == null ? void 0 : storedUserInfo.nickName) || (storedUserInfo == null ? void 0 : storedUserInfo.nickname) || "用户"
            };
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:300", "使用本地存储的备用用户信息:", currentUser.value);
          } else {
            currentUser.value = {
              id: 1,
              // 默认ID，实际应该从本地存储获取
              avatar: "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
              nickname: "用户"
            };
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:308", "使用默认用户信息:", currentUser.value);
          }
        }
      }
    };
    const generateCacheKey = (otherUserId2) => {
      return `chat_messages_${currentUser.value.id}_${otherUserId2}`;
    };
    const loadMessagesFromCache = (otherUserId2) => {
      try {
        const key = generateCacheKey(otherUserId2);
        const cachedData = common_vendor.index.getStorageSync(key);
        if (cachedData && cachedData.messages && cachedData.messages.length > 0) {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:324", "从缓存加载消息:", cachedData.messages.length, "条");
          messageList.value = cachedData.messages;
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          return true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:333", "从缓存加载消息失败:", error);
      }
      return false;
    };
    const saveMessagesToCache = (otherUserId2, messages) => {
      try {
        const key = generateCacheKey(otherUserId2);
        const cacheData = {
          messages,
          timestamp: Date.now(),
          otherUserId: otherUserId2
        };
        common_vendor.index.setStorageSync(key, cacheData);
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:347", "消息已保存到缓存:", messages.length, "条");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:349", "保存消息到缓存失败:", error);
      }
    };
    const addMessageToLocal = (messageData) => {
      try {
        const tempId = `temp_${messageData.messageType}_${Date.now()}_${messageData.content.slice(0, 10)}`;
        const localMessage = {
          id: "temp_" + Date.now(),
          // 临时ID，后续会被服务器返回的真实ID替换
          isSelf: true,
          // 发送的消息都是自己的
          type: messageData.messageType || "text",
          avatar: currentUser.value.avatar || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
          senderNickname: currentUser.value.nickname || currentUser.value.username,
          receiverNickname: "",
          // 接收者昵称暂时为空
          senderId: currentUser.value.id,
          receiverId: messageData.receiverId,
          content: messageData.content,
          timestamp: Date.now(),
          isRead: false,
          isLocal: true
          // 标记为本地消息，用于区分
        };
        const isExist = messageList.value.some((msg) => msg.id === tempId);
        if (!isExist) {
          messageList.value.push(localMessage);
          setTimeout(() => scrollToBottom(), 50);
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:379", "本地添加消息:", localMessage.id);
          return localMessage;
        } else {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:382", "消息已存在，跳过添加:", tempId);
          return null;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:386", "添加消息到本地列表失败:", error);
        return null;
      }
    };
    const addReceivedMessageToLocal = (messageData) => {
      try {
        const receivedMessage = {
          id: messageData.id || "temp_received_" + Date.now(),
          isSelf: false,
          // 接收的消息不是自己的
          type: messageData.messageType || "text",
          avatar: messageData.senderAvatar || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar2.jpeg",
          senderNickname: messageData.senderNickname || "对方",
          receiverNickname: currentUser.value.nickname || currentUser.value.username,
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          content: messageData.content,
          timestamp: messageData.timestamp || Date.now(),
          isRead: false,
          isReceived: true
          // 标记为接收的消息
        };
        const existingMessage = messageList.value.find(
          (msg) => msg.id === receivedMessage.id || msg.content === receivedMessage.content && msg.senderId === receivedMessage.senderId && Math.abs(msg.timestamp - receivedMessage.timestamp) < 5e3
          // 5秒内的相同消息认为是重复
        );
        if (!existingMessage) {
          messageList.value.push(receivedMessage);
          setTimeout(() => {
            scrollToBottom();
          }, 50);
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:427", "接收消息已立即添加到本地列表");
        } else {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:429", "消息已存在，跳过添加");
        }
        return receivedMessage;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:434", "添加接收消息到本地列表失败:", error);
        return null;
      }
    };
    common_vendor.onLoad(async (options) => {
      if (!utils_uniHelper.ensureLoggedIn({ content: "登录后才能使用聊天功能", redirectTo: "/pages/mine/mine" })) {
        return;
      }
      await fetchCurrentUserInfo();
      if (!currentUser.value.id) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:448", "获取用户信息失败，无法初始化聊天");
        common_vendor.index.showToast({ title: "用户信息获取失败，请重试", icon: "none" });
        return;
      }
      sellerId.value = options.sellerId || "";
      itemId.value = options.itemId || "";
      itemType.value = options.type || "";
      receiverId.value = options.receiverId || "";
      senderId.value = options.senderId || currentUser.value.id;
      isProductChat.value = !!itemId.value && (itemType.value === "product" || itemType.value === "demand");
      showParams.value = isProductChat.value;
      const otherUserId2 = sellerId.value || receiverId.value;
      if (isProductChat.value) {
        if (itemType.value === "product")
          fetchProductDetail(itemId.value);
        else if (itemType.value === "demand")
          fetchDemandDetail(itemId.value);
      }
      if (otherUserId2)
        fetchSellerInfo(otherUserId2);
      const readRes = await api_chat.chatApi.readMessages({
        read: true,
        senderId: otherUserId2,
        receiverId: currentUser.value.id
      });
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:478", "已读返回的响应信息:", readRes);
      let hasCache = false;
      if (otherUserId2) {
        hasCache = loadMessagesFromCache(otherUserId2);
        if (hasCache)
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:484", "已从缓存加载消息，后台同步最新数据");
      }
      page.value = 1;
      await initMessageList();
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:501", "准备初始化WebSocket连接，用户ID:", currentUser.value.id);
      initWebSocket();
      setTimeout(() => {
        if (!isSocketConnected.value) {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:507", "首次连接未成功，尝试重新建立连接");
          initWebSocket();
        }
      }, 1e3);
      timer.value = setInterval(async () => {
        if (isSocketConnected.value && totalPages.value > 0) {
          const res = await fetchMessageList(totalPages.value);
          if (res.records && res.records.length > 0) {
            const serverMessages = formatMessageList(res.records);
            const updatedMessages = [...messageList.value];
            serverMessages.forEach((serverMsg) => {
              const isExist = updatedMessages.some((msg) => msg.id === serverMsg.id);
              if (!isExist)
                updatedMessages.push(serverMsg);
            });
            if (updatedMessages.length !== messageList.value.length) {
              messageList.value = updatedMessages;
              saveMessagesToCache(sellerId.value || receiverId.value, updatedMessages);
              scrollToBottom();
            }
          }
        }
      }, 3e3);
    });
    const initWebSocket = () => {
      if (!currentUser.value.id) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:541", "用户ID无效，无法建立WebSocket连接");
        common_vendor.index.showToast({ title: "用户信息无效，请重新进入", icon: "none" });
        return;
      }
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:546", "开始建立WebSocket连接，用户ID:", currentUser.value.id);
      if (connectionTimer.value) {
        clearTimeout(connectionTimer.value);
        connectionTimer.value = null;
      }
      if (socketTask.value) {
        if (isSocketConnected.value) {
          common_vendor.index.closeSocket({
            code: 1e3,
            reason: "reconnect",
            success: () => {
              common_vendor.index.__f__("log", "at pages/chat/chat.vue:562", "已关闭旧的Socket连接");
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:565", "关闭旧Socket失败:", err);
            }
          });
        }
      }
      connectionTimer.value = setTimeout(() => {
        if (!isSocketConnected.value) {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:574", "连接超时，尝试重新连接");
          handleReconnect();
        }
      }, connectionTimeout);
      socketTask.value = common_vendor.index.connectSocket({
        url: `${socketUrl.value}?userId=${currentUser.value.id}`,
        // 带用户ID参数
        header: {
          "content-type": "application/json"
          // 可选：添加请求头
        },
        method: "GET",
        // 固定为GET
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:586", "Socket连接请求已发送", res);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:589", "Socket连接请求失败", err);
          if (connectionTimer.value) {
            clearTimeout(connectionTimer.value);
            connectionTimer.value = null;
          }
          handleReconnect();
        }
      });
      common_vendor.index.onSocketOpen((res) => {
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:601", "Socket连接成功！", res);
        isSocketConnected.value = true;
        reconnectCount.value = 0;
        if (connectionTimer.value) {
          clearTimeout(connectionTimer.value);
          connectionTimer.value = null;
        }
        startHeartbeat();
        const onlineMessage = {
          type: "USER_ONLINE"
        };
        common_vendor.index.sendSocketMessage({
          data: JSON.stringify(onlineMessage),
          success: () => {
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:621", "用户上线消息发送成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/chat/chat.vue:624", "用户上线消息发送失败:", err);
          }
        });
      });
      common_vendor.index.onSocketMessage((event) => {
        try {
          const message = JSON.parse(event.data);
          handleReceivedMessage(message);
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:637", "解析消息失败:", error);
        }
      });
      common_vendor.index.onSocketClose((event) => {
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:643", "Socket连接关闭，错误码:", event.code);
        isSocketConnected.value = false;
        stopHeartbeat();
        if (event.code !== 1e3 && reconnectCount.value < maxReconnectCount.value) {
          handleReconnect();
        } else if (reconnectCount.value >= maxReconnectCount.value) {
          common_vendor.index.showToast({ title: "重连次数已达上限，请检查网络", icon: "none" });
        }
      });
      common_vendor.index.onSocketError((error) => {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:660", "Socket连接出错:", error);
        isSocketConnected.value = false;
        stopHeartbeat();
        handleReconnect();
      });
    };
    const startHeartbeat = () => {
      stopHeartbeat();
      heartbeatTimer.value = setInterval(() => {
        if (isSocketConnected.value) {
          const pingMessage = {
            type: "PING",
            timestamp: Date.now()
          };
          common_vendor.index.sendSocketMessage({
            data: JSON.stringify(pingMessage),
            success: () => {
              common_vendor.index.__f__("log", "at pages/chat/chat.vue:685", "心跳消息发送成功");
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:688", "心跳消息发送失败:", err);
              isSocketConnected.value = false;
              handleReconnect();
            }
          });
        }
      }, heartbeatInterval);
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:697", "心跳机制已启动，间隔:", heartbeatInterval, "ms");
    };
    const stopHeartbeat = () => {
      if (heartbeatTimer.value) {
        clearInterval(heartbeatTimer.value);
        heartbeatTimer.value = null;
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:705", "心跳机制已停止");
      }
      if (connectionTimer.value) {
        clearTimeout(connectionTimer.value);
        connectionTimer.value = null;
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:712", "连接超时定时器已清除");
      }
    };
    const handleReceivedMessage = async (message) => {
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:735", "收到WebSocket消息:", message);
      if (message.type === "SYSTEM_MESSAGE") {
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:739", "收到系统消息:", message.content, "类型:", message.messageType);
        switch (message.messageType) {
          case "CONNECT_SUCCESS":
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:743", "WebSocket连接成功确认");
            isSocketConnected.value = true;
            break;
          case "USER_ONLINE_SUCCESS":
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:747", "用户上线成功确认");
            break;
          case "ERROR":
            common_vendor.index.__f__("error", "at pages/chat/chat.vue:750", "服务器错误:", message.content);
            common_vendor.index.showToast({ title: message.content, icon: "none" });
            break;
          case "PING_RESPONSE":
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:754", "心跳响应");
            break;
          default:
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:757", "未知系统消息类型:", message.messageType);
        }
        return;
      }
      if (message.type === "MESSAGE_SENT" && message.data) {
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:766", "消息发送确认:", message.data);
        return;
      }
      const messageData = message.type === "PRIVATE_MESSAGE" ? message.data : message;
      const otherUserId2 = sellerId.value || receiverId.value;
      if (!messageData || !otherUserId2 || messageData.senderId !== otherUserId2 && messageData.receiverId !== otherUserId2) {
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:777", "过滤无关消息:", messageData == null ? void 0 : messageData.id);
        return;
      }
      addReceivedMessageToLocal(messageData);
      setTimeout(async () => {
        try {
          const targetPage = totalPages.value || 1;
          const res = await fetchMessageList(targetPage);
          if (res.records && res.records.length > 0) {
            const serverMessages = formatMessageList(res.records);
            const updatedMessages = [...messageList.value];
            serverMessages.forEach((serverMsg) => {
              const isExist = updatedMessages.some((msg) => msg.id === serverMsg.id);
              if (!isExist) {
                updatedMessages.push(serverMsg);
              }
            });
            if (updatedMessages.length !== messageList.value.length) {
              messageList.value = updatedMessages;
              saveMessagesToCache(otherUserId2, updatedMessages);
              scrollToBottom();
            }
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:810", "同步服务器消息失败:", error);
        }
      }, 1200);
    };
    const handleReconnect = () => {
      if (reconnectCount.value >= maxReconnectCount.value)
        return;
      reconnectCount.value++;
      const delay = reconnectCount.value * 1e3;
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:821", `第${reconnectCount.value}次重连，延迟${delay}毫秒`);
      setTimeout(() => {
        initWebSocket();
      }, delay);
    };
    const fetchProductDetail = async (id) => {
      if (!id)
        return;
      try {
        const res = await api_product.productApi.getProductDetail(id);
        if (res.code === 200) {
          itemInfo.value = {
            name: res.data.title || res.data.name || "未知商品",
            price: res.data.price || 0,
            image: utils_uniHelper.sanitizeImageUrl(res.data.mainImageUrl || res.data.imageUrl, "product"),
            tags: res.data.tags || []
          };
        } else {
          common_vendor.index.showToast({ title: "商品信息加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:846", "商品详情请求失败：", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      }
    };
    const fetchDemandDetail = async (id) => {
      if (!id)
        return;
      try {
        const res = await api_product.productApi.getDemandDetail(id);
        if (res.code === 200) {
          let tags = [];
          if (res.data.attributes) {
            try {
              const attributesObj = JSON.parse(res.data.attributes);
              tags = Object.values(attributesObj);
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:864", "解析attributes失败:", err);
            }
          }
          tags.unshift(res.data.isNegotiable ? "可刀" : "不可刀");
          const unifiedBudget = res.data.budget !== void 0 && res.data.budget !== null ? res.data.budget : res.data.budgetMin || res.data.budgetMax || 0;
          itemInfo.value = {
            name: res.data.title || "未知需求",
            budget: unifiedBudget,
            image: utils_uniHelper.sanitizeImageUrl(res.data.mainImageUrl || res.data.imageUrl, "demand"),
            tags
          };
          if (res.data.requester) {
            sellerInfo.value.name = res.data.requester.nickname || "未知用户";
            sellerInfo.value.avatar = utils_uniHelper.sanitizeImageUrl(res.data.requester.avatar, "avatar");
          }
        } else {
          common_vendor.index.showToast({ title: "需求信息加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:891", "需求详情请求失败：", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      }
    };
    const fetchSellerInfo = async (id) => {
      if (!id)
        return;
      try {
        const res = await api_user.userApi.getUserInfo(id);
        if (res.code === 200) {
          sellerInfo.value = {
            name: res.data.nickname || "未知用户",
            avatar: res.data.avatarUrl || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar2.jpeg",
            type: res.data.type || "seller"
          };
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:908", "获取对方用户信息成功:", sellerInfo.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:911", "获取卖家信息失败：", error);
      }
    };
    const initMessageList = async () => {
      try {
        const otherUserId2 = sellerId.value || receiverId.value;
        if (!otherUserId2) {
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:920", "otherUserId为空，无法加载消息");
          isLoadingFromCache.value = false;
          return;
        }
        const firstPageRes = await fetchMessageList(1);
        const totalCount = firstPageRes.total || 0;
        if (pageSize.value <= 0)
          pageSize.value = 10;
        totalPages.value = totalCount > 0 ? Math.ceil(totalCount / pageSize.value) : 0;
        if (totalCount === 0) {
          isLoadingFromCache.value = false;
          return;
        }
        const latestPages = [];
        if (totalPages.value >= 2)
          latestPages.push(totalPages.value - 1);
        latestPages.push(totalPages.value);
        loadedPages.value = [...latestPages];
        const pagePromises = latestPages.map((page2) => fetchMessageList(page2));
        const pagesData = await Promise.all(pagePromises);
        let allRecords = [];
        pagesData.forEach((data) => {
          allRecords = [...allRecords, ...data.records];
        });
        const formattedMessages = formatMessageList(allRecords);
        messageList.value = formattedMessages;
        hasMore.value = totalPages.value > 2;
        saveMessagesToCache(otherUserId2, formattedMessages);
        setTimeout(() => scrollToBottom(), 100);
        isLoadingFromCache.value = false;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:962", "初始化消息列表失败：", error);
        isLoadingFromCache.value = false;
      }
    };
    const loadMoreHistory = async () => {
      if (isLoadingMore.value || !hasMore.value)
        return;
      try {
        isLoadingMore.value = true;
        const minLoadedPage = Math.min(...loadedPages.value);
        const nextPage = minLoadedPage - 1;
        if (nextPage < 1) {
          hasMore.value = false;
          common_vendor.index.showToast({ title: "已加载全部历史消息", icon: "none", duration: 1500 });
          isLoadingMore.value = false;
          return;
        }
        const res = await fetchMessageList(nextPage);
        if (res.records && res.records.length > 0) {
          const newMessages = formatMessageList(res.records);
          messageList.value = [...newMessages, ...messageList.value];
          loadedPages.value.push(nextPage);
          saveMessagesToCache(sellerId.value || receiverId.value, messageList.value);
          hasMore.value = nextPage > 1;
        } else {
          hasMore.value = false;
          common_vendor.index.showToast({ title: "已加载全部历史消息", icon: "none", duration: 1500 });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:1002", "加载更多消息失败：", error);
      } finally {
        isLoadingMore.value = false;
      }
    };
    const fetchMessageList = async (currentPage) => {
      var _a, _b;
      if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages.value) {
        currentPage = Math.min(Math.max(currentPage, 1), totalPages.value || 1);
        common_vendor.index.__f__("warn", "at pages/chat/chat.vue:1012", `页码${currentPage}无效，已修正为${currentPage}`);
      }
      const otherUserId2 = sellerId.value || receiverId.value;
      const params = { otherUserId: otherUserId2, current: currentPage, size: pageSize.value };
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:1017", "请求分页：", `第${currentPage}页（共${totalPages.value}页）`, params);
      try {
        const res = await api_chat.chatApi.getMessages(params);
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:1021", `第${currentPage}页返回消息数：`, ((_b = (_a = res.data) == null ? void 0 : _a.records) == null ? void 0 : _b.length) || 0);
        if (res.code !== 200) {
          common_vendor.index.showToast({ title: res.msg, icon: "none" });
        }
        return res.data || { records: [], total: 0 };
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:1027", `获取第${currentPage}页消息失败：`, error);
        common_vendor.index.showToast({ title: "加载消息失败，请稍后重试", icon: "none" });
        return { records: [], total: 0 };
      }
    };
    const formatMessageList = (records) => {
      return records.map((record) => {
        const isSelf = record.isSelf;
        return {
          id: record.id,
          isSelf,
          type: record.messageType || "text",
          // 根据是否为自己发送的消息选择正确的头像
          avatar: record.senderAvatar || "https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg",
          // 添加发送者昵称信息
          senderNickname: record.senderNickname,
          receiverNickname: record.receiverNickname,
          senderId: record.senderId,
          receiverId: record.receiverId,
          content: record.content,
          timestamp: new Date(record.createdAt).getTime(),
          isRead: record.isRead
        };
      });
    };
    const shouldShowTime = (index) => {
      if (index === 0)
        return true;
      const currentTime = messageList.value[index].timestamp;
      const prevTime = messageList.value[index - 1].timestamp;
      return currentTime - prevTime > 3e5;
    };
    const formatTime = (timestamp) => {
      let date;
      if (typeof timestamp === "string") {
        timestamp = timestamp.replace(/T/, " ").replace(/\.\d+/, "");
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    const waitSendImage = common_vendor.ref("");
    const uploadImage = (tempFilePath, senderId2, receiverId2) => {
      common_vendor.index.__f__("log", "at pages/chat/chat.vue:1147", "上传参数：", { senderId: senderId2, receiverId: receiverId2, tempFilePath });
      return new Promise((resolve, reject) => {
        common_vendor.index.uploadFile({
          url: "https://api.shaolezhuan.cn/api/chat/media/upload",
          // 接口地址
          filePath: tempFilePath,
          name: "file",
          // 与接口约定的文件字段名
          formData: {
            senderId: senderId2.toString(),
            // 强制转字符串
            receiverId: receiverId2.toString()
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (data.code === 200 && data.data && data.data.mediaUrl) {
                resolve(data.data.mediaUrl);
              } else {
                common_vendor.index.showToast({ title: data.msg || "图片上传失败", icon: "none" });
                reject(new Error(data.msg || "上传失败"));
              }
            } catch (e) {
              common_vendor.index.showToast({ title: "接口响应格式错误", icon: "none" });
              reject(e);
            }
          },
          fail: (err) => {
            common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
            reject(err);
          }
        });
      });
    };
    const isSending = common_vendor.ref(false);
    const sendMessage = async () => {
      if (isSending.value)
        return;
      if (!isSocketConnected.value) {
        common_vendor.index.showToast({ title: "连接未建立，请稍候", icon: "none" });
        return;
      }
      isSending.value = true;
      try {
        if (inputContent.value.trim()) {
          const message = {
            type: "PRIVATE_MESSAGE",
            receiverId: sellerId.value || receiverId.value,
            content: inputContent.value.trim(),
            messageType: "text",
            senderId: currentUser.value.id
          };
          common_vendor.index.__f__("log", "at pages/chat/chat.vue:1199", "发送消息参数:", message);
          const localMessage = addMessageToLocal(message);
          inputContent.value = "";
          common_vendor.index.sendSocketMessage({
            data: JSON.stringify(message),
            success: async () => {
              common_vendor.index.__f__("log", "at pages/chat/chat.vue:1209", "消息发送成功，等待服务器确认");
              setTimeout(async () => {
                try {
                  const res = await fetchMessageList(totalPages.value || 1);
                  if (res.records && res.records.length > 0) {
                    const serverMessages = formatMessageList(res.records);
                    const updatedMessages = [...messageList.value];
                    const localMsgIndex = updatedMessages.findIndex((msg) => msg.id === localMessage.id);
                    const realMessage = serverMessages.find(
                      (msg) => msg.content === localMessage.content && msg.senderId === currentUser.value.id && Math.abs(msg.timestamp - localMessage.timestamp) < 5e3
                    );
                    if (localMsgIndex > -1 && realMessage) {
                      updatedMessages.splice(localMsgIndex, 1, realMessage);
                    }
                    serverMessages.forEach((serverMsg) => {
                      const isExist = updatedMessages.some((msg) => msg.id === serverMsg.id);
                      if (!isExist)
                        updatedMessages.push(serverMsg);
                    });
                    messageList.value = updatedMessages;
                    await common_vendor.nextTick$1();
                    scrollToBottom();
                    saveMessagesToCache(otherUserId, updatedMessages);
                  }
                } catch (error) {
                  common_vendor.index.__f__("error", "at pages/chat/chat.vue:1241", "同步服务器消息失败:", error);
                }
              }, 800);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:1246", "消息发送失败:", err);
              common_vendor.index.showToast({ title: "发送失败，请重试", icon: "none" });
              messageList.value = messageList.value.filter(
                (msg) => msg.id !== localMessage.id
              );
            }
          });
        }
        if (waitSendImage.value) {
          await sendImageMessage();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:1261", "消息处理异常:", error);
        common_vendor.index.showToast({ title: "发送失败，请重试", icon: "none" });
      } finally {
        setTimeout(() => {
          isSending.value = false;
        }, 500);
      }
    };
    const sendImageMessage = async () => {
      const targetReceiverId = sellerId.value || receiverId.value;
      if (!waitSendImage.value || !currentUser.value.id || !targetReceiverId) {
        common_vendor.index.showToast({ title: "参数不完整", icon: "none" });
        return;
      }
      try {
        isSending.value = true;
        common_vendor.index.showLoading({ title: "图片上传中..." });
        const imageUrl = await uploadImage(waitSendImage.value, currentUser.value.id, targetReceiverId);
        const message = {
          type: "PRIVATE_MESSAGE",
          receiverId: targetReceiverId,
          content: imageUrl,
          messageType: "image",
          senderId: currentUser.value.id
        };
        const localMessage = addMessageToLocal(message);
        if (!localMessage) {
          common_vendor.index.hideLoading();
          isSending.value = false;
          return;
        }
        waitSendImage.value = "";
        common_vendor.index.sendSocketMessage({
          data: JSON.stringify(message),
          success: async () => {
            setTimeout(async () => {
              const res = await fetchMessageList(totalPages.value || 1);
              if (res.records && res.records.length > 0) {
                const serverMessages = formatMessageList(res.records);
                const updatedMessages = [...messageList.value];
                const localMsgIndex = updatedMessages.findIndex((msg) => msg.id === localMessage.id);
                const realMessage = serverMessages.find(
                  (msg) => msg.content === imageUrl && msg.senderId === currentUser.value.id
                );
                if (localMsgIndex > -1) {
                  realMessage ? updatedMessages.splice(localMsgIndex, 1, realMessage) : updatedMessages.splice(localMsgIndex, 1);
                }
                serverMessages.forEach((serverMsg) => {
                  const isExist = updatedMessages.some((msg) => msg.id === serverMsg.id);
                  if (!isExist)
                    updatedMessages.push(serverMsg);
                });
                messageList.value = updatedMessages;
                saveMessagesToCache(targetReceiverId, updatedMessages);
                scrollToBottom();
              }
            }, 1e3);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/chat/chat.vue:1333", "图片发送失败:", err);
            common_vendor.index.showToast({ title: "图片发送失败", icon: "none" });
            messageList.value = messageList.value.filter((msg) => msg.id !== localMessage.id);
          },
          complete: () => {
            common_vendor.index.hideLoading();
            setTimeout(() => {
              isSending.value = false;
            }, 500);
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/chat/chat.vue:1347", "图片上传失败:", error);
        common_vendor.index.hideLoading();
        isSending.value = false;
        common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
      }
    };
    const getTagType = (tagText) => {
      if (tagText === "需求") {
        return "warning";
      } else if (tagText === "可刀" || tagText === "不可刀") {
        return "error";
      }
      return "primary";
    };
    const onScroll = (e) => {
      const { scrollTop: scrollTop2, scrollHeight, clientHeight } = e.detail;
      const isAtBottom = scrollTop2 >= scrollHeight - clientHeight - 20;
      isAutoScroll.value = isAtBottom;
    };
    const scrollToBottom = () => {
      common_vendor.index.createSelectorQuery().select(".chat-container").boundingClientRect((container) => {
        common_vendor.index.createSelectorQuery().select(".message-list").boundingClientRect((list) => {
          if (container && list) {
            scrollTop.value = list.height;
            common_vendor.index.__f__("log", "at pages/chat/chat.vue:1384", "滚动到底部成功，滚动高度：", scrollTop.value);
          }
        }).exec();
      }).exec();
    };
    common_vendor.onMounted(() => {
      common_vendor.watch(messageList, () => {
        common_vendor.nextTick$1(() => {
          setTimeout(() => {
            scrollToBottom();
          }, 50);
        });
      }, { deep: true });
      if (!showPopup.value) {
        common_vendor.nextTick$1(() => {
          setTimeout(() => {
            scrollToBottom();
          }, 200);
        });
      }
    });
    common_vendor.watch(showPopup, (newVal) => {
      if (!newVal) {
        common_vendor.nextTick$1(() => {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        });
      }
    });
    const toggleEmojiPanel = () => {
      showEmojiPanel.value = !showEmojiPanel.value;
    };
    const insertEmoji = (emoji) => {
      inputContent.value += emoji;
    };
    const chooseImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          waitSendImage.value = res.tempFilePaths[0];
          common_vendor.index.showToast({
            title: "图片已选择，点击发送",
            icon: "none",
            duration: 1500
          });
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none",
            duration: 1500
          });
          common_vendor.index.__f__("error", "at pages/chat/chat.vue:1453", "选择图片失败：", err);
        }
      });
    };
    const previewImage = (currentImage) => {
      const imageUrls = messageList.value.filter((msg) => msg.type === "image").map((msg) => msg.content);
      common_vendor.index.previewImage({
        current: currentImage,
        urls: imageUrls,
        loop: true
      });
    };
    common_vendor.onUnload(() => {
      stopHeartbeat();
      if (socketTask.value) {
        if (isSocketConnected.value) {
          common_vendor.index.closeSocket({
            code: 1e3,
            reason: "page unload",
            success: () => {
              common_vendor.index.__f__("log", "at pages/chat/chat.vue:1529", "页面卸载，关闭Socket连接");
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/chat/chat.vue:1532", "页面卸载关闭Socket失败:", err);
            }
          });
        }
        isSocketConnected.value = false;
        socketTask.value = null;
      }
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
        common_vendor.index.__f__("log", "at pages/chat/chat.vue:1543", "定时器已停止，不再获取消息");
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showPopup.value
      }, showPopup.value ? {
        b: common_vendor.o(($event) => showPopup.value = false)
      } : {}, {
        c: !showPopup.value
      }, !showPopup.value ? common_vendor.e({
        d: isProductChat.value && showParams.value
      }, isProductChat.value && showParams.value ? common_vendor.e({
        e: sellerInfo.value.avatar || "/static/avatars/avatar1.jpeg",
        f: common_vendor.t(sellerInfo.value.name || "未设置"),
        g: common_vendor.p({
          type: "closeempty",
          size: "12"
        }),
        h: common_vendor.o(($event) => showParams.value = false),
        i: itemInfo.value.image || "/static/products/p1.jpeg",
        j: common_vendor.t(itemInfo.value.name || "未知"),
        k: itemInfo.value.price !== void 0
      }, itemInfo.value.price !== void 0 ? {
        l: common_vendor.t((itemInfo.value.price || 0).toFixed(2))
      } : {
        m: common_vendor.t(Number(itemInfo.value.budget || 0).toFixed(2))
      }, {
        n: itemInfo.value.tags && itemInfo.value.tags.length > 0
      }, itemInfo.value.tags && itemInfo.value.tags.length > 0 ? {
        o: common_vendor.f(itemInfo.value.tags, (tag, index, i0) => {
          return {
            a: "0a633310-1-" + i0,
            b: common_vendor.p({
              size: "mini",
              text: tag,
              type: getTagType(tag)
            }),
            c: index
          };
        })
      } : {}, {
        p: common_vendor.p({
          type: "down",
          size: "12"
        }),
        q: common_vendor.o(($event) => showParams.value = false)
      }) : {}, {
        r: isProductChat.value && !showParams.value
      }, isProductChat.value && !showParams.value ? {
        s: common_vendor.p({
          type: "up",
          size: "12"
        }),
        t: common_vendor.o(($event) => showParams.value = true)
      } : {}, {
        v: isLoadingMore.value
      }, isLoadingMore.value ? {} : {}, {
        w: showSystemTip.value && sellerInfo.value.name
      }, showSystemTip.value && sellerInfo.value.name ? {
        x: common_vendor.t(sellerInfo.value.name)
      } : {}, {
        y: common_vendor.f(messageList.value, (msg, index, i0) => {
          return common_vendor.e({
            a: shouldShowTime(index)
          }, shouldShowTime(index) ? {
            b: common_vendor.t(formatTime(msg.timestamp))
          } : {}, {
            c: msg.avatar,
            d: !msg.isSelf && msg.senderNickname
          }, !msg.isSelf && msg.senderNickname ? {
            e: common_vendor.t(msg.senderNickname)
          } : {}, {
            f: msg.type === "text"
          }, msg.type === "text" ? {
            g: common_vendor.t(msg.content)
          } : msg.type === "image" ? {
            i: msg.content,
            j: common_vendor.o(($event) => previewImage(msg.content), msg.id)
          } : {}, {
            h: msg.type === "image",
            k: msg.isSelf ? 1 : "",
            l: msg.isSelf ? 1 : "",
            m: msg.id
          });
        }),
        z: scrollTop.value,
        A: common_vendor.o(onScroll),
        B: common_vendor.o(loadMoreHistory),
        C: !showEmojiPanel.value
      }, !showEmojiPanel.value ? {
        D: common_vendor.p({
          type: "heart",
          size: "24"
        })
      } : {
        E: common_vendor.p({
          type: "chat",
          size: "24"
        })
      }, {
        F: common_vendor.o(toggleEmojiPanel),
        G: common_vendor.p({
          type: "image",
          size: "24"
        }),
        H: common_vendor.o(chooseImage),
        I: common_vendor.o(sendMessage),
        J: inputContent.value,
        K: common_vendor.o(($event) => inputContent.value = $event.detail.value),
        L: common_vendor.o(sendMessage),
        M: !inputContent.value.trim() && !waitSendImage.value,
        N: showEmojiPanel.value
      }, showEmojiPanel.value ? {
        O: common_vendor.f(emojiList.value, (emoji, index, i0) => {
          return {
            a: common_vendor.t(emoji),
            b: index,
            c: common_vendor.o(($event) => insertEmoji(emoji), index)
          };
        })
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0a633310"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/chat.js.map
