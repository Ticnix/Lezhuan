<template>
  <view class="chat-page">
    <!-- 弹窗：优先显示，关闭后展示页面内容 -->
    <view class="popup-overlay" v-if="showPopup">
      <view class="popup-container">
        <view class="popup-content">请勿发送辱骂、歧视内容，共建友好交流环境，违者将限制聊天功能，本平台仅作为信息交流平台，如遇心仪物品请加微信自行交易，由此产生的纠纷，平台不承担责任，交易风险请自行承担。</view>
        <button class="popup-close-btn" @click="showPopup = false">我知道了</button>
      </view>
    </view>

    <!-- 主内容区：弹窗关闭后显示 -->
    <view class="main-content" v-if="!showPopup">
      <!-- 参数信息展示：卡片式设计 -->
      <view class="params-card" v-if="isProductChat && showParams">
        <!-- 卡片头部：标题+关闭按钮 -->
        <view class="params-card__header">
          <view class="params-card__user">
            <image :src="sellerInfo.avatar || '/static/avatars/avatar1.jpeg'" class="user-avatar" mode="aspectFill"></image>
            <text class="params-card__title">{{ sellerInfo.name || '未设置' }}</text>
          </view>
          <view class="params-card__close" @click="showParams = false" hover-class="params-card__close--active">
            <uni-icons type="closeempty" size="12"></uni-icons>
          </view>
        </view>

        <!-- 卡片内容：商品/需求信息展示 -->
        <view class="params-card__content">
          <!-- 图片区域 -->
          <image :src="itemInfo.image || '/static/products/p1.jpeg'" class="product-image" mode="aspectFill"></image>
          <!-- 信息区域 -->
          <view class="product-info">
            <text class="product-title">{{ itemInfo.name || '未知' }}</text>
            <text class="product-price" v-if="itemInfo.price !== undefined">¥{{ (itemInfo.price || 0).toFixed(2) }}</text>
            <text class="product-price" v-else>预算: ¥{{ Number(itemInfo.budget || 0).toFixed(2) }}</text>
            
            <view class="tags" v-if="itemInfo.tags && itemInfo.tags.length > 0">
              <view class="tag-view" v-for="(tag, index) in itemInfo.tags" :key="index">
                <uni-tag 
                  size="mini"
                  :text="tag" 
                  :type="getTagType(tag)" 
                />
              </view>
            </view>
          </view>
        </view>
        <!-- 卡片底部：收起提示 -->
        <view class="params-card__footer" @click="showParams = false" hover-class="params-card__footer--active">
          <text class="params-card__footer-text">收起信息</text>
          <uni-icons type="down" size="12"></uni-icons>
        </view>
      </view>

      <view class="params-expand-btn" v-if="isProductChat && !showParams" @click="showParams = true" hover-class="params-expand-btn--active">
        <text class="params-expand-btn__text">展开物品/需求信息</text>
        <uni-icons type="up" size="12" class="params-expand-btn__icon"></uni-icons>
      </view>

      <!-- 聊天内容区 -->
      <scroll-view 
        class="chat-container" 
        scroll-y 
        :scroll-with-animation="true"
        :scroll-top="scrollTop"
        @scroll="onScroll"
        @scrolltolower="loadMoreHistory"
        ref="scrollViewRef"
      >
        <!-- 加载更多提示 -->
        <view class="loading-more" v-if="isLoadingMore">
          加载更多历史消息...
        </view>
        
        <view class="message-list">
          <!-- 系统提示 -->
          <view class="system-message" v-if="showSystemTip && sellerInfo.name" >
            正在与 {{ sellerInfo.name }} 沟通中...
          </view>

          <!-- 消息列表：支持文本、图片消息 -->
          <view 
            class="message-item" 
            :class="{ 'self-message1': msg.isSelf }" 
            v-for="(msg, index) in messageList" 
            :key="msg.id"
          >
            <!-- 时间 -->
            <text class="message-time" v-if="shouldShowTime(index)">{{ formatTime(msg.timestamp) }}</text>
            
            <!-- 消息内容与头像横向布局 -->
            <view :class="{ 'self-message': msg.isSelf }" class="message-content-wrap">
              <image 
                :src="msg.avatar" 
                mode="widthFix" 
                class="avatar"
              ></image>
              <!-- 气泡信息 -->
              <view class="message-bubble">
                <!-- 发送者昵称（非自己发送的消息才显示） -->
                <text class="sender-nickname" v-if="!msg.isSelf && msg.senderNickname">{{ msg.senderNickname }}</text>
                <!-- 文本消息 -->
                <text class="message-content" v-if="msg.type === 'text'">{{ msg.content }}</text>
                <!-- 图片消息 -->
                <image 
                  v-else-if="msg.type === 'image'" 
                  :src="msg.content" 
                  mode="widthFix" 
                  class="message-image"
                  @click="previewImage(msg.content)"
                ></image>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 输入及表情面板区域 -->
      <view class="input-panel">
        <!-- 功能工具栏：表情、图片 -->
        <view class="tool-bar">
          <view class="tool-btn" @click="toggleEmojiPanel">
            <uni-icons v-if="!showEmojiPanel" type="heart" size="24"></uni-icons>
            <uni-icons v-else type="chat" size="24"></uni-icons>
          </view>
          <view class="tool-btn" @click="chooseImage">
            <uni-icons type="image" size="24"></uni-icons>
          </view>
        </view>
      
        <!-- 输入区域 -->
        <view class="input-container">
          <input 
            type="text" 
            v-model="inputContent" 
            placeholder="请输入消息..." 
            class="message-input"
            @confirm="sendMessage"
            maxlength="200"
          />
          <button 
            class="send-button" 
            @click="sendMessage"
            :disabled="!inputContent.trim() && !waitSendImage"
          >
            发送
          </button>
        </view>
        <!-- 表情面板：切换显示 -->
        <view class="emoji-panel" v-if="showEmojiPanel">
          <view class="emoji-list">
            <view 
              class="emoji-item" 
              v-for="(emoji, index) in emojiList" 
              :key="index"
              @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance, nextTick } from 'vue';
import { onLoad,onUnload } from '@dcloudio/uni-app';
import chatApi from '@/api/chat.js'; // 假设的聊天API
import productApi from '@/api/product.js'; // 假设的商品API
import userApi from '@/api/user.js'; // 假设的聊天API
import { ensureLoggedIn, sanitizeImageUrl } from '@/utils/uniHelper';

// WebSocket相关变量
const timer = ref(null); 
const socketTask = ref(null); // uni Socket任务实例
const socketUrl = ref('wss://api.shaolezhuan.cn/native-ws'); // 修改为原生WebSocket端点
const isSocketConnected = ref(false);
const reconnectCount = ref(0); // 重连次数计数
const maxReconnectCount = ref(5); // 最大重连次数
const heartbeatTimer = ref(null);
const heartbeatInterval = 30000; // 心跳间隔30秒
const connectionTimer = ref(null); // 连接超时检测定时器
const connectionTimeout = 10000; // 连接超时时间5秒

// 获取当前用户信息（从API获取真实用户信息）
const currentUser = ref({
  id: null, // 将从API获取
  avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
  nickname: ''
});

// 卖家/对方信息
const sellerInfo = ref({
  name: '', 
  avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar2.jpeg',
  type: 'buyer'
});

// 商品/需求信息
const itemInfo = ref({
  name: '',
  price: 0,
  image: 'https://api.shaolezhuan.cn/lzphoto/productDefault.jpg',
  tags: [],
  budget: 0
});

// 1. 弹窗状态
const showPopup = ref(true); // 初始显示弹窗

// 2. 接收路由参数
const sellerId = ref('');
const itemId = ref(''); // 商品或需求ID
const itemType = ref(''); // product或demand

// 3. 页面状态
const showParams = ref(true); // 是否显示参数信息
const showSystemTip = ref(true); // 是否显示系统提示
const inputContent = ref(''); // 输入框内容
const messageList = ref([]); // 消息列表
const scrollTop = ref(0); // 滚动位置
const isAutoScroll = ref(true); // 是否自动滚动到底部
const scrollViewRef = ref(null); // 滚动视图引用

// 分页相关
const page = ref(1); // 当前页码
const pageSize = ref(100); // 每页条数

const hasMore = ref(true); // 是否还有更多数据
const isLoadingMore = ref(false); // 是否正在加载更多
const totalPages = ref(0); // 总页数（最大页码，即最新消息所在页）
const loadedPages = ref([]); // 已加载的页码集合（用于避免重复加载）

// 缓存相关
const isLoadingFromCache = ref(true); // 是否正在从缓存加载
const cacheKey = ref(''); // 缓存键名

const receiverId = ref(''); // 接收方id
const senderId = ref(''); // 发送方id
const isProductChat = ref(false); // 是否为商品/需求相关聊天

// 4. 表情功能相关
const showEmojiPanel = ref(false); // 表情面板显示状态
const emojiList = ref([
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
  '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖'
]);

// 获取当前用户信息
const fetchCurrentUserInfo = async () => {
  try {
    // 首先尝试从本地存储获取用户信息作为备用
    const storedUserInfo = uni.getStorageSync('userInfo');
    const storedUserId = uni.getStorageSync('studentIdNumber');
    const storedNickname = uni.getStorageSync('nickname');
    const storedAvatarUrl = uni.getStorageSync('avatarUrl');
    
    // 如果有本地存储的用户信息，先使用它
    if (storedUserInfo || storedUserId) {
      currentUser.value = {
        id: storedUserId || storedUserInfo?.studentIdNumber || storedUserInfo?.id || 1,
        avatar: storedAvatarUrl || storedUserInfo?.avatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
        nickname: storedNickname || storedUserInfo?.nickName || storedUserInfo?.nickname || '用户'
      };
      console.log('从本地存储获取用户信息:', currentUser.value);
    }
    
    // 然后尝试从服务器获取最新信息
    const res = await userApi.getCurrentUser();
    if (res.code === 200 && res.data) {
      currentUser.value = {
        id: res.data.id,
        avatar: res.data.avatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
        nickname: res.data.nickname || '用户'
      };
      console.log('从服务器获取当前用户信息成功:', currentUser.value);
    } else if (!currentUser.value.id) {
      // 如果服务器请求失败且没有本地存储，使用默认值
      throw new Error('服务器返回数据无效');
    }
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
    
    // 如果还没有设置用户信息，尝试从本地存储再次获取
    if (!currentUser.value.id) {
      const storedUserInfo = uni.getStorageSync('userInfo');
      const storedUserId = uni.getStorageSync('studentIdNumber');
      const storedNickname = uni.getStorageSync('nickname');
      const storedAvatarUrl = uni.getStorageSync('avatarUrl');
      
      if (storedUserInfo || storedUserId) {
        currentUser.value = {
          id: storedUserId || storedUserInfo?.studentIdNumber || storedUserInfo?.id || 1,
          avatar: storedAvatarUrl || storedUserInfo?.avatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
          nickname: storedNickname || storedUserInfo?.nickName || storedUserInfo?.nickname || '用户'
        };
        console.log('使用本地存储的备用用户信息:', currentUser.value);
      } else {
        // 最后的默认值
        currentUser.value = {
          id: 1, // 默认ID，实际应该从本地存储获取
          avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
          nickname: '用户'
        };
        console.log('使用默认用户信息:', currentUser.value);
      }
    }
  }
};

// 缓存相关函数
const generateCacheKey = (otherUserId) => {
  return `chat_messages_${currentUser.value.id}_${otherUserId}`;
};

const loadMessagesFromCache = (otherUserId) => {
  try {
    const key = generateCacheKey(otherUserId);
    const cachedData = uni.getStorageSync(key);
    if (cachedData && cachedData.messages && cachedData.messages.length > 0) {
      console.log('从缓存加载消息:', cachedData.messages.length, '条');
      messageList.value = cachedData.messages;
      // 自动滚动到底部
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      return true;
    }
  } catch (error) {
    console.error('从缓存加载消息失败:', error);
  }
  return false;
};

const saveMessagesToCache = (otherUserId, messages) => {
  try {
    const key = generateCacheKey(otherUserId);
    const cacheData = {
      messages: messages,
      timestamp: Date.now(),
      otherUserId: otherUserId
    };
    uni.setStorageSync(key, cacheData);
    console.log('消息已保存到缓存:', messages.length, '条');
  } catch (error) {
    console.error('保存消息到缓存失败:', error);
  }
};

// 立即添加消息到本地列表
const addMessageToLocal = (messageData) => {
  try {
	// 生成唯一临时ID（结合消息内容+时间戳，避免重复）
	const tempId = `temp_${messageData.messageType}_${Date.now()}_${messageData.content.slice(0, 10)}`;
    // 创建本地消息对象
    const localMessage = {
      id: 'temp_' + Date.now(), // 临时ID，后续会被服务器返回的真实ID替换
      isSelf: true, // 发送的消息都是自己的
      type: messageData.messageType || 'text',
      avatar: currentUser.value.avatar || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
      senderNickname: currentUser.value.nickname || currentUser.value.username,
      receiverNickname: '', // 接收者昵称暂时为空
      senderId: currentUser.value.id,
      receiverId: messageData.receiverId,
      content: messageData.content,
      timestamp: Date.now(),
      isRead: false,
      isLocal: true // 标记为本地消息，用于区分
    };
	
    // 去重：判断该临时消息是否已存在
    const isExist = messageList.value.some(msg => msg.id === tempId);
    if (!isExist) {
      messageList.value.push(localMessage);
      setTimeout(() => scrollToBottom(), 50);
      console.log('本地添加消息:', localMessage.id);
      return localMessage;
    } else {
      console.log('消息已存在，跳过添加:', tempId);
      return null;
    }
  } catch (error) {
    console.error('添加消息到本地列表失败:', error);
    return null;
  }
};

// 立即添加接收到的消息到本地列表
const addReceivedMessageToLocal = (messageData) => {
  try {
    // 创建接收消息对象
    const receivedMessage = {
      id: messageData.id || 'temp_received_' + Date.now(),
      isSelf: false, // 接收的消息不是自己的
      type: messageData.messageType || 'text',
      avatar: messageData.senderAvatar || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar2.jpeg',
      senderNickname: messageData.senderNickname || '对方',
      receiverNickname: currentUser.value.nickname || currentUser.value.username,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      timestamp: messageData.timestamp || Date.now(),
      isRead: false,
      isReceived: true // 标记为接收的消息
    };
    
    // 检查是否已存在相同的消息（避免重复）
    const existingMessage = messageList.value.find(msg => 
      msg.id === receivedMessage.id || 
      (msg.content === receivedMessage.content && 
       msg.senderId === receivedMessage.senderId && 
       Math.abs(msg.timestamp - receivedMessage.timestamp) < 5000) // 5秒内的相同消息认为是重复
    );
    
    if (!existingMessage) {
      // 添加到消息列表末尾
      messageList.value.push(receivedMessage);
      
      // 滚动到底部
      setTimeout(() => {
        scrollToBottom();
      }, 50);
      
      console.log('接收消息已立即添加到本地列表');
    } else {
      console.log('消息已存在，跳过添加');
    }
    
    return receivedMessage;
  } catch (error) {
    console.error('添加接收消息到本地列表失败:', error);
    return null;
  }
};

// 监听页面加载，获取参数并初始化历史消息
onLoad(async (options) => {
  // 未登录弹窗提醒并终止初始化
  if (!ensureLoggedIn({ content: '登录后才能使用聊天功能', redirectTo: '/pages/mine/mine' })) {
    return;
  }
  // 1. 第一步：先获取当前用户信息）
  await fetchCurrentUserInfo();
  if (!currentUser.value.id) {
    console.error('获取用户信息失败，无法初始化聊天');
    uni.showToast({ title: '用户信息获取失败，请重试', icon: 'none' });
    return;
  }

  // 2. 第二步：获取路由参数（sellerId/receiverId等，消息加载需要）
  sellerId.value = options.sellerId || '';
  itemId.value = options.itemId || '';
  itemType.value = options.type || '';
  receiverId.value = options.receiverId || '';
  senderId.value = options.senderId || currentUser.value.id;

  // 判断是否为商品聊天
  isProductChat.value = !!itemId.value && (itemType.value === 'product' || itemType.value === 'demand');
  showParams.value = isProductChat.value;

  // 3. 第三步：加载商品/需求详情和对方信息（可选，不影响消息加载）
  const otherUserId = sellerId.value || receiverId.value;
  if (isProductChat.value) {
    if (itemType.value === 'product') fetchProductDetail(itemId.value);
    else if (itemType.value === 'demand') fetchDemandDetail(itemId.value);
  }
  if (otherUserId) fetchSellerInfo(otherUserId);

  //判断已读
  const readRes= await chatApi.readMessages({
	  read: true,
	  senderId: otherUserId,
	  receiverId: currentUser.value.id
  })
  console.log('已读返回的响应信息:',readRes)

  // 4. 第四步：先尝试从缓存加载（可选），再从服务器加载最新消息
  let hasCache = false;
  if (otherUserId) {
    hasCache = loadMessagesFromCache(otherUserId);
    if (hasCache) console.log('已从缓存加载消息，后台同步最新数据');
  }

  // 5. 第五步：从服务器加载最新消息（核心，必须在参数都获取后调用）
  page.value = 1;
  await initMessageList();
  
    // // 调用设置消息已读接口（仅接收方触发）
    // if (otherUserId && currentUser.value.id === receiverId.value) {
    //   await callReadStatusApi({
    //     read: true,
    //     senderId: otherUserId,
    //     receiverId: currentUser.value.id
    //   });
    // }

  // 6. 第六步：初始化WebSocket（最后，避免重复加载消息）
  console.log('准备初始化WebSocket连接，用户ID:', currentUser.value.id);
  initWebSocket();

  // 延迟重连检查（可选）
  setTimeout(() => {
    if (!isSocketConnected.value) {
      console.log('首次连接未成功，尝试重新建立连接');
      initWebSocket();
    }
  }, 1000);
  
  // 页面加载时的定时器逻辑优化
	timer.value = setInterval(async () => {
	  if (isSocketConnected.value && totalPages.value > 0) {
		const res = await fetchMessageList(totalPages.value);
		if (res.records && res.records.length > 0) {
		  const serverMessages = formatMessageList(res.records);
		  const updatedMessages = [...messageList.value];

		  // 仅添加本地没有的消息（按ID去重）
		  serverMessages.forEach(serverMsg => {
			const isExist = updatedMessages.some(msg => msg.id === serverMsg.id);
			if (!isExist) updatedMessages.push(serverMsg);
		  });

		  // 只有消息数量变化时才更新（避免无意义重渲染）
		  if (updatedMessages.length !== messageList.value.length) {
			messageList.value = updatedMessages;
			saveMessagesToCache(sellerId.value || receiverId.value, updatedMessages);
			scrollToBottom();
		  }
		}
	  }
	}, 3000);
});

// 初始化WebSocket连接
const initWebSocket = () => {
  // 验证用户ID是否有效
  if (!currentUser.value.id) {
    console.error('用户ID无效，无法建立WebSocket连接');
    uni.showToast({ title: '用户信息无效，请重新进入', icon: 'none' });
    return;
  }
  
  console.log('开始建立WebSocket连接，用户ID:', currentUser.value.id);
  
  // 清除之前的连接超时定时器
  if (connectionTimer.value) {
    clearTimeout(connectionTimer.value);
    connectionTimer.value = null;
  }
  
  // 先关闭已有连接（避免重复连接）
  if (socketTask.value) {
    // 仅在已连接时关闭，并显式使用合法关闭码
    if (isSocketConnected.value) {
      uni.closeSocket({
        code: 1000,
        reason: 'reconnect',
        success: () => {
          console.log('已关闭旧的Socket连接');
        },
        fail: (err) => {
          console.error('关闭旧Socket失败:', err);
        }
      });
    }
  }

  // 设置连接超时检测
  connectionTimer.value = setTimeout(() => {
    if (!isSocketConnected.value) {
      console.log('连接超时，尝试重新连接');
      handleReconnect();
    }
  }, connectionTimeout);

  socketTask.value = uni.connectSocket({
    url: `${socketUrl.value}?userId=${currentUser.value.id}`, // 带用户ID参数
    header: {
      'content-type': 'application/json' // 可选：添加请求头
    },
    method: 'GET', // 固定为GET
    success: (res) => {
      console.log('Socket连接请求已发送', res);
    },
    fail: (err) => {
      console.error('Socket连接请求失败', err);
      // 清除连接超时定时器
      if (connectionTimer.value) {
        clearTimeout(connectionTimer.value);
        connectionTimer.value = null;
      }
      handleReconnect(); // 连接失败直接触发重连
    }
  });

  // 监听连接成功（替代原socket.onopen）
  uni.onSocketOpen((res) => {
    console.log('Socket连接成功！', res);
    isSocketConnected.value = true; // 标记连接成功
    reconnectCount.value = 0; // 重置重连次数
    
    // 清除连接超时定时器
    if (connectionTimer.value) {
      clearTimeout(connectionTimer.value);
      connectionTimer.value = null;
    }
    
    // 启动心跳机制
    startHeartbeat();
    
    // 发送用户上线消息
    const onlineMessage = {
      type: 'USER_ONLINE'
    };
    uni.sendSocketMessage({
      data: JSON.stringify(onlineMessage),
      success: () => {
        console.log('用户上线消息发送成功');
      },
      fail: (err) => {
        console.error('用户上线消息发送失败:', err);
      }
    });
    
    // initMessageList(); // 连接成功后加载历史消息
  });

  // 监听消息接收
  uni.onSocketMessage((event) => {
    try {
      const message = JSON.parse(event.data); // 解析收到的消息
      handleReceivedMessage(message); // 处理消息
    } catch (error) {
      console.error('解析消息失败:', error);
    }
  });

  // 监听连接关闭
  uni.onSocketClose((event) => {
    console.log('Socket连接关闭，错误码:', event.code);
    isSocketConnected.value = false; // 标记连接断开
    
    // 停止心跳
    stopHeartbeat();

    // 非主动关闭（code!==1000）且未超过最大重连次数，自动重连
    if (event.code !== 1000 && reconnectCount.value < maxReconnectCount.value) {
      handleReconnect(); // 触发重连
    } else if (reconnectCount.value >= maxReconnectCount.value) {

      uni.showToast({ title: '重连次数已达上限，请检查网络', icon: 'none' });
    }
  });

  // 监听连接错误
  uni.onSocketError((error) => {
    console.error('Socket连接出错:', error);
    isSocketConnected.value = false;
    
    // 停止心跳
    stopHeartbeat();
    
    handleReconnect(); // 出错时触发重连
  });
};

// 启动心跳机制
const startHeartbeat = () => {
  // 清除已有的心跳定时器
  stopHeartbeat();
  
  heartbeatTimer.value = setInterval(() => {
    if (isSocketConnected.value) {
      const pingMessage = {
        type: 'PING',
        timestamp: Date.now()
      };
      
      uni.sendSocketMessage({
        data: JSON.stringify(pingMessage),
        success: () => {
          console.log('心跳消息发送成功');
        },
        fail: (err) => {
          console.error('心跳消息发送失败:', err);
          // 心跳失败，可能连接已断开
          isSocketConnected.value = false;
          handleReconnect();
        }
      });
    }
  }, heartbeatInterval);
  
  console.log('心跳机制已启动，间隔:', heartbeatInterval, 'ms');
};

// 停止心跳机制
const stopHeartbeat = () => {
  if (heartbeatTimer.value) {
    clearInterval(heartbeatTimer.value);
    heartbeatTimer.value = null;
    console.log('心跳机制已停止');
  }
  
  // 同时清除连接超时定时器
  if (connectionTimer.value) {
    clearTimeout(connectionTimer.value);
    connectionTimer.value = null;
    console.log('连接超时定时器已清除');
  }
};

const sendReadConfirmation = (messageId) => {
  if (!isSocketConnected.value || !messageId) return;
  
  const data = {
    type: 'read_confirmation',
    messageId: messageId,
    receiverId: sellerId.value || receiverId.value
  };
  
  uni.sendSocketMessage({
    data: JSON.stringify(data),
    fail: (err) => {
      console.error('已读确认发送失败:', err);
    }
  });
};

// 处理收到的消息
const handleReceivedMessage = async (message) => {
  console.log('收到WebSocket消息:', message);

  // 1. 处理系统消息
  if (message.type === 'SYSTEM_MESSAGE') {
    console.log('收到系统消息:', message.content, '类型:', message.messageType);
    
    switch (message.messageType) {
      case 'CONNECT_SUCCESS':
        console.log('WebSocket连接成功确认');
        isSocketConnected.value = true;
        break;
      case 'USER_ONLINE_SUCCESS':
        console.log('用户上线成功确认');
        break;
      case 'ERROR':
        console.error('服务器错误:', message.content);
        uni.showToast({ title: message.content, icon: 'none' });
        break;
      case 'PING_RESPONSE':
        console.log('心跳响应');
        break;
      default:
        console.log('未知系统消息类型:', message.messageType);
    }
    
    // 系统消息无需滚动（非聊天内容）
    return;
  }

  // 2. 处理消息发送确认（仅日志记录，无需更新UI）
  if (message.type === 'MESSAGE_SENT' && message.data) {
    console.log('消息发送确认:', message.data);
    return;
  }

  // 3. 提取消息主体（兼容新/旧格式）
  const messageData = message.type === 'PRIVATE_MESSAGE' ? message.data : message;
  const otherUserId = sellerId.value || receiverId.value;

  // 4. 过滤无关消息（仅处理当前聊天对象的消息）
  if (!messageData || !otherUserId || 
      messageData.senderId !== otherUserId && messageData.receiverId !== otherUserId) {
    console.log('过滤无关消息:', messageData?.id);
    return;
  }

  // 5. 立即添加到本地列表（带去重逻辑）
  addReceivedMessageToLocal(messageData);

  // 6. 延迟同步服务器数据（避免频繁请求，增量合并去重）
  setTimeout(async () => {
    try {
      const targetPage = totalPages.value || 1;
      const res = await fetchMessageList(targetPage);
      
      if (res.records && res.records.length > 0) {
        const serverMessages = formatMessageList(res.records);
        const updatedMessages = [...messageList.value];

        // 仅添加本地没有的新消息（按ID去重）
        serverMessages.forEach(serverMsg => {
          const isExist = updatedMessages.some(msg => msg.id === serverMsg.id);
          if (!isExist) {
            updatedMessages.push(serverMsg);
          }
        });

        // 只有消息有变化时才更新列表（避免无效渲染）
        if (updatedMessages.length !== messageList.value.length) {
          messageList.value = updatedMessages;
          saveMessagesToCache(otherUserId, updatedMessages);
          scrollToBottom(); // 新消息到达时滚动到底部
        }
      }
    } catch (error) {
      console.error('同步服务器消息失败:', error);
      // 可添加轻量提示，避免干扰用户
      // uni.showToast({ title: '消息同步中...', icon: 'none', duration: 1000 });
    }
  }, 1200); // 缩短延迟至1.2秒，提升实时性
};

const handleReconnect = () => {
  if(reconnectCount.value >= maxReconnectCount.value)return;
  reconnectCount.value++; // 重连次数+1
  const delay = reconnectCount.value * 1000; // 重连延迟：1s、2s、3s...（逐渐变长）
  console.log(`第${reconnectCount.value}次重连，延迟${delay}毫秒`);

  // 延迟后重新初始化连接
  setTimeout(() => {
    initWebSocket();
  }, delay);
};

// 加载商品详情
const fetchProductDetail = async (id) => {
  if (!id) return;
  try {
    const res = await productApi.getProductDetail(id);
    if (res.code === 200) {
      // 兼容后端字段：商品标题为 title；旧字段可能为 name
      itemInfo.value = {
        name: res.data.title || res.data.name || '未知商品',
        price: res.data.price || 0,
        image: sanitizeImageUrl(res.data.mainImageUrl || res.data.imageUrl, 'product'),
        tags: res.data.tags || [],
      };
    } else {
      uni.showToast({ title: '商品信息加载失败', icon: 'none' });
    }
  } catch (error) {
    console.error('商品详情请求失败：', error);
    uni.showToast({ title: '网络错误', icon: 'none' });
  }
};

// 加载需求详情
const fetchDemandDetail = async (id) => {
  if (!id) return;
  try {
    const res = await productApi.getDemandDetail(id);
    if (res.code === 200) {
      // 处理需求属性标签
      let tags = [];
      if (res.data.attributes) {
        try {
          const attributesObj = JSON.parse(res.data.attributes);
          tags = Object.values(attributesObj);
        } catch (err) {
          console.error('解析attributes失败:', err);
        }
      }
      // 添加可议价标签
      tags.unshift(res.data.isNegotiable ? '可刀' : '不可刀');
      
      // 统一使用单值预算；兼容旧字段回退
      const unifiedBudget = (res.data.budget !== undefined && res.data.budget !== null)
        ? res.data.budget
        : (res.data.budgetMin || res.data.budgetMax || 0);

      itemInfo.value = {
        name: res.data.title || '未知需求',
        budget: unifiedBudget,
        image: sanitizeImageUrl(res.data.mainImageUrl || res.data.imageUrl, 'demand'),
        tags: tags
      };
      
      // 设置需求发布者信息
      if (res.data.requester) {
        sellerInfo.value.name = res.data.requester.nickname || '未知用户';
        sellerInfo.value.avatar = sanitizeImageUrl(res.data.requester.avatar, 'avatar');
      }
    } else {
      uni.showToast({ title: '需求信息加载失败', icon: 'none' });
    }
  } catch (error) {
    console.error('需求详情请求失败：', error);
    uni.showToast({ title: '网络错误', icon: 'none' });
  }
};

// 加载卖家信息
const fetchSellerInfo = async (id) => {
  if (!id) return;
  try {
    // 这里替换为实际获取用户信息的接口
    const res = await userApi.getUserInfo(id);
    if (res.code === 200) {
      sellerInfo.value = {
        name: res.data.nickname || '未知用户',
        avatar: res.data.avatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar2.jpeg',
        type: res.data.type || 'seller'
      };
      console.log('获取对方用户信息成功:', sellerInfo.value);
    }
  } catch (error) {
    console.error('获取卖家信息失败：', error);
  }
};

// 初始化消息列表（加载最新两页消息）
const initMessageList = async () => {
  try {
    const otherUserId = sellerId.value || receiverId.value;
    if (!otherUserId) {
      console.error('otherUserId为空，无法加载消息');
      isLoadingFromCache.value = false;
      return;
    }

    // 1. 先获取总页数（必须先调用接口拿到total，才能确定最后一页）
    const firstPageRes = await fetchMessageList(1); // 仅用于获取total，不使用其消息
    const totalCount = firstPageRes.total || 0;
    if (pageSize.value <= 0) pageSize.value = 10;
    totalPages.value = totalCount > 0 ? Math.ceil(totalCount / pageSize.value) : 0;
    if (totalCount === 0) {
      isLoadingFromCache.value = false;
      return;
    }

    // 2. 确定要加载的“最后两页”（最新消息所在页）
    const latestPages = [];
    // 例如：totalPages=5 → 加载第4页（次新）、第5页（最新）
    if (totalPages.value >= 2) latestPages.push(totalPages.value - 1); 
    latestPages.push(totalPages.value); // 无论总页数多少，必加最后一页
    loadedPages.value = [...latestPages]; // 记录已加载的是“最后两页”

    // 3. 加载这两页（最新消息）
    const pagePromises = latestPages.map(page => fetchMessageList(page));
    const pagesData = await Promise.all(pagePromises);

    // 4. 合并消息：次新页 + 最新页（确保消息顺序是“旧→新”，最新消息在末尾）
    let allRecords = [];
    pagesData.forEach(data => {
      allRecords = [...allRecords, ...data.records];
    });

    // 5. 格式化并更新列表（此时列表是最新的两页消息）
    const formattedMessages = formatMessageList(allRecords);
    messageList.value = formattedMessages;

    // 6. 判断是否还有更早的消息（只要最后两页不是第1、2页，就还有历史）
    hasMore.value = totalPages.value > 2; 
    saveMessagesToCache(otherUserId, formattedMessages);
    setTimeout(() => scrollToBottom(), 100);
    isLoadingFromCache.value = false;
  } catch (error) {
    console.error('初始化消息列表失败：', error);
    isLoadingFromCache.value = false;
  }
};

// 加载更多历史消息（上滑加载更早的页）
const loadMoreHistory = async () => {
  if (isLoadingMore.value || !hasMore.value) return;
  
  try {
    isLoadingMore.value = true;
    
    // 1. 找到当前已加载的“最早页码”（例如已加载4、5页 → 最早是4）
    const minLoadedPage = Math.min(...loadedPages.value);
    // 2. 下一个要加载的是“比最早页更旧的页”（4→3→2→1）
    const nextPage = minLoadedPage - 1;
    
    // 3. 已加载到第1页，没有更多历史
    if (nextPage < 1) {
      hasMore.value = false;
      uni.showToast({ title: '已加载全部历史消息', icon: 'none', duration: 1500 });
      isLoadingMore.value = false;
      return;
    }
    
    // 4. 加载更早的页（旧消息）
    const res = await fetchMessageList(nextPage);
    if (res.records && res.records.length > 0) {
      const newMessages = formatMessageList(res.records);
      // 旧消息添加到列表最前面（上滑时旧消息从顶部出现）
      messageList.value = [...newMessages, ...messageList.value];
      
      loadedPages.value.push(nextPage); // 记录已加载的旧页码
      saveMessagesToCache(sellerId.value || receiverId.value, messageList.value);
      hasMore.value = nextPage > 1; // 还有更早的页吗？
    } else {
      hasMore.value = false;
      uni.showToast({ title: '已加载全部历史消息', icon: 'none', duration: 1500 });
    }
  } catch (error) {
    console.error('加载更多消息失败：', error);
  } finally {
    isLoadingMore.value = false;
  }
};

const fetchMessageList = async (currentPage) => {
  // 强制校验页码（避免传错）
  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages.value) {
    currentPage = Math.min(Math.max(currentPage, 1), totalPages.value || 1);
    console.warn(`页码${currentPage}无效，已修正为${currentPage}`);
  }	
  const otherUserId = sellerId.value || receiverId.value;
  const params = { otherUserId, current: currentPage, size: pageSize.value };

  console.log('请求分页：', `第${currentPage}页（共${totalPages.value}页）`, params);

  try {
    const res = await chatApi.getMessages(params);
    console.log(`第${currentPage}页返回消息数：`, res.data?.records?.length || 0);
    if (res.code !== 200) {
      uni.showToast({ title: res.msg, icon: 'none' });
    }
    return res.data || { records: [], total: 0 };
  } catch (error) {
    console.error(`获取第${currentPage}页消息失败：`, error);
    uni.showToast({ title: '加载消息失败，请稍后重试', icon: 'none' });
    return { records: [], total: 0 };
  }
};

// 格式化消息列表
const formatMessageList = (records) => {
  return records.map(record => {
    // 使用后端返回的 isSelf 字段，这个字段已经在后端正确计算了
    const isSelf = record.isSelf;
    
    return {
      id: record.id,
      isSelf: isSelf,
      type: record.messageType || 'text',
      // 根据是否为自己发送的消息选择正确的头像
      avatar: record.senderAvatar || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg',
      
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

// const loadMoreHistory = async () => {
//   if (isLoadingMore.value || !hasMore.value) return;
  
//   try {
//     isLoadingMore.value = true;
    
//     // 1. 找到当前已加载的最小页码（最早的消息所在页）
//     const minLoadedPage = Math.min(...loadedPages.value);
//     // 2. 下一个要加载的页码（比当前最早页更旧一页）
//     const nextPage = minLoadedPage - 1;
    
//     // 3. 如果已到第1页，说明没有更多历史
//     if (nextPage < 1) {
//       hasMore.value = false;
//       uni.showToast({ title: '已加载全部历史消息', icon: 'none', duration: 1500 });
//       isLoadingMore.value = false;
//       return;
//     }
    
//     // 4. 加载更早的一页消息
//     const res = await fetchMessageList(nextPage);
//     if (res.records && res.records.length > 0) {
//       // 格式化新消息（单页内是“旧→新”）
//       const newMessages = formatMessageList(res.records);
//       // 将更早的消息添加到列表最前面（用户上滑时，旧消息从顶部出现）
//       messageList.value = [...newMessages, ...messageList.value];
      
//       // 更新已加载页码记录
//       loadedPages.value.push(nextPage);
      
//       // 更新缓存
//       const otherUserId = sellerId.value || receiverId.value;
//       if (otherUserId) {
//         saveMessagesToCache(otherUserId, messageList.value);
//       }
      
//       // 判断是否还有更早的消息
//       hasMore.value = nextPage > 1;
//     } else {
//       hasMore.value = false;
//       uni.showToast({ title: '已加载全部历史消息', icon: 'none', duration: 1500 });
//     }
//   } catch (error) {
//     console.error('加载更多消息失败：', error);
//   } finally {
//     isLoadingMore.value = false;
//   }
// };

// 判断当前消息是否需要显示时间（间隔5分钟）
const shouldShowTime = (index) => {
  if (index === 0) return true;
  
  const currentTime = messageList.value[index].timestamp;
  const prevTime = messageList.value[index - 1].timestamp;
  
  return currentTime - prevTime > 300000; // 5分钟 = 300000毫秒
};

// 格式化时间（兼容iOS）
const formatTime = (timestamp) => {
  let date;
  // 处理字符串格式的时间（如果后端返回的是字符串）
  if (typeof timestamp === 'string') {
    // 将 "yyyy-MM-ddTHH:mm:ss" 转换为 "yyyy/MM/dd HH:mm:ss"
    timestamp = timestamp.replace(/T/, ' ').replace(/\.\d+/, ''); 
    date = new Date(timestamp);
  } else {
    // 处理时间戳格式
    date = new Date(timestamp);
  }
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDateForIOS = (dateStr) => {
  if (!dateStr) return new Date().getTime();
  // 处理 "yyyy-MM-ddTHH:mm:ss" 或 "yyyy-MM-dd HH:mm:ss" 格式
  const normalized = dateStr.replace(/T/, ' ').replace(/\.\d+/, ''); 
  // 进一步替换 "-" 为 "/"（iOS 对 "/" 分隔的日期兼容性更好）
  const iosFriendly = normalized.replace(/-/g, '/'); 
  return new Date(iosFriendly).getTime();
};

// 图片发送相关
const waitSendImage = ref('');
// 上传图片到服务器
const uploadImage = (tempFilePath, senderId, receiverId) => {
	console.log('上传参数：', { senderId, receiverId, tempFilePath });
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://api.shaolezhuan.cn/api/chat/media/upload', // 接口地址
      filePath: tempFilePath,
      name: 'file', // 与接口约定的文件字段名
      formData: {
        senderId: senderId.toString(), // 强制转字符串
        receiverId: receiverId.toString()
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200 && data.data && data.data.mediaUrl) {
            resolve(data.data.mediaUrl); // 返回后端的图片URL
          } else {
            uni.showToast({ title: data.msg || '图片上传失败', icon: 'none' });
            reject(new Error(data.msg || '上传失败'));
          }
        } catch (e) {
          uni.showToast({ title: '接口响应格式错误', icon: 'none' });
          reject(e);
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误，请重试', icon: 'none' });
        reject(err);
      }
    });
  });
};

// 添加发送锁定状态，防止重复触发
const isSending = ref(false);
// 发送消息
const sendMessage = async () => {
  if (isSending.value) return; // 正在发送时阻止再次调用
  if (!isSocketConnected.value) {
    uni.showToast({ title: '连接未建立，请稍候', icon: 'none' });
    return;
  }
  isSending.value = true; // 锁定发送状态
  try {
    // 文本消息处理
    if (inputContent.value.trim()) {
      const message = {
        type: 'PRIVATE_MESSAGE',
        receiverId: sellerId.value || receiverId.value,
        content: inputContent.value.trim(),
        messageType: 'text',
        senderId: currentUser.value.id
      };
      console.log('发送消息参数:', message);

      // 1. 本地临时显示（立即反馈用户）
      const localMessage = addMessageToLocal(message); // 标记 isLocal: true
      inputContent.value = ''; // 清空输入框

      // 2. 通过WebSocket发送消息
      uni.sendSocketMessage({
        data: JSON.stringify(message),
        success: async () => {
          console.log('消息发送成功，等待服务器确认');

          setTimeout(async () => {
            try {
              // 🔴 关键：请求最后一页（totalPages.value），而非第1页
              const res = await fetchMessageList(totalPages.value || 1);
              if (res.records && res.records.length > 0) {
                const serverMessages = formatMessageList(res.records);
                const updatedMessages = [...messageList.value];
              
                // 替换临时消息+增量添加新消息（原有逻辑不变）
                const localMsgIndex = updatedMessages.findIndex(msg => msg.id === localMessage.id);
                const realMessage = serverMessages.find(
                  msg => msg.content === localMessage.content && 
                         msg.senderId === currentUser.value.id && 
                         Math.abs(msg.timestamp - localMessage.timestamp) < 5000
                );
                if (localMsgIndex > -1 && realMessage) {
                  updatedMessages.splice(localMsgIndex, 1, realMessage);
                }
              
                serverMessages.forEach(serverMsg => {
                  const isExist = updatedMessages.some(msg => msg.id === serverMsg.id);
                  if (!isExist) updatedMessages.push(serverMsg);
                });
              
                messageList.value = updatedMessages;
                await nextTick();
                scrollToBottom();
                saveMessagesToCache(otherUserId, updatedMessages);
              }
            } catch (error) {
              console.error('同步服务器消息失败:', error);
            }
          }, 800);
        },
        fail: (err) => {
          console.error('消息发送失败:', err);
          uni.showToast({ title: '发送失败，请重试', icon: 'none' });
          // 失败时移除本地临时消息（可选）
          messageList.value = messageList.value.filter(
            msg => msg.id !== localMessage.id
          );
        }
      });
    }

    // 图片消息处理
    if (waitSendImage.value) {
      await sendImageMessage();
    }
  } catch (error) {
    console.error('消息处理异常:', error);
    uni.showToast({ title: '发送失败，请重试', icon: 'none' });
  } finally {
    // 释放锁定（500ms防抖，防止快速点击）
    setTimeout(() => {
      isSending.value = false;
    }, 500);
  }
};

// 发送图片消息（包含上传逻辑）
const sendImageMessage = async () => {
  const targetReceiverId = sellerId.value || receiverId.value;
  if (!waitSendImage.value || !currentUser.value.id || !targetReceiverId) {
    uni.showToast({ title: '参数不完整', icon: 'none' });
    return;
  }

  try {
    isSending.value = true; // 锁定发送状态
    uni.showLoading({ title: '图片上传中...' });
    const imageUrl = await uploadImage(waitSendImage.value, currentUser.value.id, targetReceiverId);

    const message = {
      type: 'PRIVATE_MESSAGE',
      receiverId: targetReceiverId,
      content: imageUrl,
      messageType: 'image',
      senderId: currentUser.value.id
    };

    // 本地临时显示（去重后添加）
    const localMessage = addMessageToLocal(message);
    if (!localMessage) {
      uni.hideLoading();
      isSending.value = false;
      return;
    }
    waitSendImage.value = '';

    // 发送WebSocket消息
    uni.sendSocketMessage({
      data: JSON.stringify(message),
      success: async () => {
        setTimeout(async () => {
          const res = await fetchMessageList(totalPages.value || 1);
          if (res.records && res.records.length > 0) {
            const serverMessages = formatMessageList(res.records);
            const updatedMessages = [...messageList.value];

            // 替换本地临时消息
            const localMsgIndex = updatedMessages.findIndex(msg => msg.id === localMessage.id);
            const realMessage = serverMessages.find(
              msg => msg.content === imageUrl && msg.senderId === currentUser.value.id
            );
            if (localMsgIndex > -1) {
              realMessage ? updatedMessages.splice(localMsgIndex, 1, realMessage) : updatedMessages.splice(localMsgIndex, 1);
            }

            // 增量添加新消息（去重）
            serverMessages.forEach(serverMsg => {
              const isExist = updatedMessages.some(msg => msg.id === serverMsg.id);
              if (!isExist) updatedMessages.push(serverMsg);
            });

            messageList.value = updatedMessages;
            saveMessagesToCache(targetReceiverId, updatedMessages);
            scrollToBottom();
          }
        }, 1000);
      },
      fail: (err) => {
        console.error('图片发送失败:', err);
        uni.showToast({ title: '图片发送失败', icon: 'none' });
        // 失败时删除本地临时消息
        messageList.value = messageList.value.filter(msg => msg.id !== localMessage.id);
      },
      complete: () => {
        uni.hideLoading();
        // 释放锁定
        setTimeout(() => {
          isSending.value = false;
        }, 500);
      }
    });
  } catch (error) {
    console.error('图片上传失败:', error);
    uni.hideLoading();
    isSending.value = false;
    uni.showToast({ title: '图片上传失败', icon: 'none' });
  }
};

// 根据标签内容获取类型
const getTagType = (tagText) => {
  if (tagText === '需求') {
    return 'warning';
  } else if (tagText === '可刀' || tagText === '不可刀') {
    return 'error';
  }
  return 'primary';
};

// 根据用户类型获取信息
const getUserType = (userType) => {
  return userType === 'seller' ? '卖' : '买';
};

// 处理滚动事件：用户手动滚动时关闭自动滚动
const onScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.detail;
  // 当距离底部小于20rpx时，视为“在底部”，开启自动滚动
  const isAtBottom = scrollTop >= scrollHeight - clientHeight - 20;
  isAutoScroll.value = isAtBottom;
};

// 滚动到底部
const scrollToBottom = () => {
  uni.createSelectorQuery().select('.chat-container').boundingClientRect(container => {
    uni.createSelectorQuery().select('.message-list').boundingClientRect(list => {
      if (container && list) {
        // 直接滚动到列表总高度（即末尾）
        scrollTop.value = list.height;
        console.log('滚动到底部成功，滚动高度：', scrollTop.value);
      }
    }).exec();
  }).exec();
};

// 页面挂载完成后滚动到底部
onMounted(() => {
  // 监听消息列表变化，自动滚动到底部
  watch(messageList, () => {
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    });
  }, { deep: true });

  // 初始挂载时：如果弹窗已关闭，直接滚动
  if (!showPopup.value) {
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    });
  }
  
});

// 监听弹窗关闭，关闭后强制滚动到底部
watch(showPopup, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });
  }
});

// 切换表情面板
const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value;
};

// 插入emoji到输入框
const insertEmoji = (emoji) => {
  inputContent.value += emoji;
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      waitSendImage.value = res.tempFilePaths[0];
      uni.showToast({
        title: '图片已选择，点击发送',
        icon: 'none',
        duration: 1500
      });
    },
    fail: (err) => {
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
        duration: 1500
      });
      console.error('选择图片失败：', err);
    }
  });
};

// 预览图片
const previewImage = (currentImage) => {
  const imageUrls = messageList.value
    .filter(msg => msg.type === 'image')
    .map(msg => msg.content);
  
  uni.previewImage({
    current: currentImage,
    urls: imageUrls,
    loop: true
  });
};

// /**
//  * 调用设置消息已读/未读接口（仅接收方触发）
//  * @param {Object} params - 请求参数
//  * @param {boolean} params.read - 是否已读（true为已读，false为未读，默认true）
//  * @param {number} params.senderId - 发送方用户ID
//  * @param {number} params.receiverId - 接收方用户ID（当前用户ID）
//  */
// const callReadStatusApi = async (params) => {
//   console.log('currentUserId:',currentUser.value.id)
//   console.log('params.receiverId:',params.receiverId)
//   // 校验当前用户是否为接收方
//   const currentUserId = currentUser.value.id; // 需确保currentUser已正确获取当前用户ID
//   if (params.receiverId !== currentUserId) {
//     console.log('当前用户不是接收方，跳过接口调用');
//     return;
//   }

//   try {
//     // 发起POST请求
//     const res = await uni.request({
//       url: '/chat-messages/read-status', // 替换为实际接口地址
//       method: 'POST',
//       header: {
//         'content-type': 'application/json'
//       },
//       data: {
//         read: params.read !== undefined ? params.read : true,
//         senderId: params.senderId,
//         receiverId: params.receiverId
//       }
//     });

//     if (res[1].statusCode === 200) {
//       console.log('设置消息已读/未读成功，影响条数：', res[1].data.data);
//       return res[1].data;
//     } else {
//       console.error('设置消息已读/未读失败：', res[1].data.msg || '接口异常');
//       uni.showToast({ title: '操作失败，请稍后重试', icon: 'none' });
//       throw new Error(res[1].data.msg || '接口异常');
//     }
//   } catch (error) {
//     console.error('调用设置消息已读/未读接口异常：', error);
//     throw error;
//   }
// };

// 页面卸载时关闭WebSocket连接
onUnload(() => {
  // 停止心跳机制
  stopHeartbeat();
  
  if (socketTask.value) {
    // 仅在已连接时关闭，并显式使用合法关闭码
    if (isSocketConnected.value) {
      uni.closeSocket({
        code: 1000,
        reason: 'page unload',
        success: () => {
          console.log('页面卸载，关闭Socket连接');
        },
        fail: (err) => {
          console.error('页面卸载关闭Socket失败:', err);
        }
      });
    }
    // 重置连接状态
    isSocketConnected.value = false;
    socketTask.value = null;
  }
  if (timer.value) { // 校验是否存在
    clearInterval(timer.value);
    timer.value = null;
    console.log("定时器已停止，不再获取消息");
  }
});
</script>

<style scoped>
/* 基础样式调整：更现代简洁的风格 */
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 弹窗样式：居中显示，半透明遮罩 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.popup-container {
  width: 60%;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}
.popup-content {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}
.popup-close-btn {
  width: 180rpx;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 35rpx;
  font-size: 28rpx;
  padding: 0;
}

/* 主内容区：弹窗关闭后显示 */
.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 参数信息卡片相关样式调整 */
.params-card {
  background-color: #fff;
  margin: 0 24rpx;
  border-radius: 12rpx;
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.05);
}
.params-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  border-bottom: 1px solid #f7f7f7;
  background-color: #fffab9;
}
.params-card__user{
  display: flex;
  align-items: center;
}
.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
.user-info {
  flex: 1;
}
.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}
.member-name {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}
.params-card__close {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #999;
}
.params-card__close--active {
  background-color: #eee;
  color: #666;
}
.params-card__content {
  padding: 16rpx 20rpx;
  display: flex;
  align-items: flex-start;
  gap: 25rpx;
}
.product-image {
  width: 135rpx;
  height: 135rpx;
  border-radius: 8rpx;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.product-price {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 600;
}
.product-freight {
  font-size: 24rpx;
  color: #666;
}
/* 标签容器支持自动换行 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx; /* 标签之间的间距 */
}

:deep(.tag-view) {
  margin-top: 0rpx !important
}

/* 收起状态：展开按钮样式（独立卡片，视觉统一） */
.params-expand-btn {
  background-color: #ffe76f;
  margin: 16rpx 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  padding: 18rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #333;
  font-size: 22rpx;
  cursor: pointer;
}
/* 点击反馈 */
.params-expand-btn--active {
  background-color: #f5f5f5;
}

/* 卡片分隔线 */
.params-card__divider {
  height: 1px;
  background-color: #f7f7f7;
  margin: 20rpx 0;
}

/* 卡片底部 */
.params-card__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 0;
  background-color: #ffe76f;
  color: #333;
  font-size: 22rpx;
  cursor: pointer;
}

.params-card__footer--active {
  background-color: #f5f5f5;
}

.params-card__footer-icon {
  font-size: 20rpx;
  transition: transform 0.2s ease;
}

/* 点击收起时图标旋转（可选动画效果） */
.params-card__footer:active .params-card__footer-icon {
  transform: rotate(180deg);
}
/* 聊天内容区：优化背景和间距 */
.chat-container {
  flex: 1;
  max-height: calc(100vh - 185rpx - 128rpx);
  padding: 24rpx;
  box-sizing: border-box;
  background-color: #f5f7fa;
  overflow-y: auto;
}
.message-list {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}
.system-message {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 10rpx 20rpx;
  background-color: #eef1f5;
  border-radius: 18rpx;
  margin: 0 auto;
}

/* 消息项：优化布局和气泡样式 */
.message-item {
  width: 100%;
  display: flex;
  flex-direction: column; 
  align-items: center;
  margin-bottom: 10rpx; 
}
.self-message {
  flex-direction: row-reverse;
}
.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin: 0 16rpx;
  flex-shrink: 0;
  border: 1px solid #f0f0f0;
  align-self: flex-start; /* 头像顶部对齐 */
}
.message-bubble {
  max-width: 68%;
  padding: 18rpx 24rpx;
  border-radius: 24rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  overflow-wrap: anywhere;
}
/* 对方消息气泡 */
.message-item:not(.self-message1) .message-bubble {
  background-color: #fff;
  border-top-left-radius: 8rpx;
}
/* 自己消息气泡 */
.self-message1 .message-bubble {
  background-color: #007aff;
  border-top-right-radius: 8rpx;
}

/* 消息内容：优化字体和行高 */
.message-content {
  font-size: 28rpx;
  line-height: 1.6;
  white-space: pre-wrap;
}
.self-message .message-content {
  color: #fff;
}

/* 发送者昵称样式 */
.sender-nickname {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
  font-weight: 500;
}
/* 图片消息样式 */
.message-image {
  width: auto;
  height: auto;
  max-width: 300rpx; 
  max-height: 400rpx;
  min-width: 130rpx; 
  min-height: 130rpx; 
  border-radius: 16rpx;
  object-fit: cover;
}

/* 消息时间：优化位置和颜色 */
.message-time {
  display: block;
  font-size: 20rpx;
  color: #999;
  text-align: center; 
  margin: 8rpx auto; 
  padding: 4rpx 12rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  width: fit-content; 
}
/* 消息内容与头像的横向布局容器 */
.message-content-wrap {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.message-item:not(.self-message) .message-time {
  color: #999;
}
.self-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 功能工具栏：表情、图片按钮 */
.input-panel {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  padding-bottom: 30px; 
}
.tool-bar {
  display: flex;
  padding: 12rpx 24rpx;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  gap: 24rpx;
}
.tool-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  cursor: pointer;
}
.icon-smile, .icon-image {
  font-size: 32rpx;
  color: #666;
}

/* 表情面板 */
.emoji-panel {
  background-color: #fff;
  padding: 20rpx;
  border-top: 1px solid #f0f0f0;
  max-height: 300rpx;
  overflow-y: auto;
  transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
}
/* 表情面板隐藏时的初始状态，可根据需要调整 */
.emoji-panel[style*="display: none"] {
  max-height: 0;
  padding: 0;
  overflow: hidden;
}
.emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.emoji-item {
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  cursor: pointer;
  border-radius: 8rpx;
}
.emoji-item:hover {
  background-color: #f5f5f5;
}

/* 输入区域：优化样式 */
.input-container {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
}
.message-input {
  flex: 1;
  height: 84rpx;
  background-color: #f5f5f5;
  border-radius: 42rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
  border: none;
}
.message-input:focus {
  outline: none;
  background-color: #eee;
}
.send-button {
  width: 128rpx;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  background-color: #007aff;
  color: #fff;
  border-radius: 42rpx;
  font-size: 28rpx;
  padding: 0;
  border: none;
}
.send-button:disabled {
  background-color: #e5e5e5;
  color: #999;
}

/* 修复scroll-view在H5中的高度问题 */
::-webkit-scrollbar {
  width: 4rpx;
  height: 4rpx;
}
::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 2rpx;
}


.loading-more {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 15rpx 0;
}

.product-title {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>