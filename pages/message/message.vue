<template>
  <view class="chat-list-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <uni-icons type="search" size="18" color="#999" class="search-icon" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索聊天..." 
          class="search-input"
          @input="handleSearch"
        />
        <uni-icons 
          type="clear" 
          size="16" 
          color="#999" 
          class="clear-icon" 
          v-if="searchQuery"
          @click="clearSearch"
        />
      </view>
    </view>
	
	<!-- 系统通知区域 -->
	<view class="system-notice" @click="goToNoticePage">
	  <uni-icons type="notification" size="24" color="#007aff" class="notice-icon" />
	  <view class="notice-content">
	    <text class="notice-title">系统通知</text>
	    <!-- 动态显示未读数量，根据数量调整文案 -->
	    <text class="notice-desc">
	      您有{{ unreadCount }}条{{ unreadCount > 1 ? '未读通知' : '未读通知' }}，点击查看详情
	    </text>
	  </view>
	  <!-- 未读数量徽章 -->
	  <view class="system-notice-badge" v-if="unreadCount > 0">
	    {{ unreadCount }}
	  </view>
	  <uni-icons type="right" size="20" color="#999" class="arrow-icon" />
	</view>

    <!-- 聊天列表 -->
    <view class="chat-list">
      <view 
        v-for="(chat, index) in filteredChats" 
        :key="index" 
        class="chat-item"
        @click="handleChatClick(chat)"
      >
        <!-- 头像 -->
        <view class="avatar-wrapper">
          <image 
            :src="chat.avatar" 
            mode="widthFix" 
            class="avatar"
            :alt="chat.name"
          ></image>
          <view class="unread-badge" v-if="chat.unread > 0">
            {{ chat.unread > 99 ? '99+' : chat.unread }}
          </view>
        </view>
        
        <!-- 聊天信息 -->
        <view class="chat-info">
          <view class="chat-header">
            <text class="chat-name">{{ chat.name }}</text>
            <text class="chat-time">{{ chat.time }}</text>
          </view>
          <view class="chat-last-message">
            <text 
              class="message-content" 
              :class="{ 'unread-message': chat.unread > 0 }"
            >
              {{ chat.lastMessage }}
            </text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredChats.length === 0">
        <uni-icons type="chat" size="48" color="#ccc" />
        <text class="empty-text">没有找到匹配的聊天</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import chatApi from '@/api/chat.js'; 
import noticeApi from '@/api/notice.js';
import { ensureLoggedIn, ensureStudentCertified, ensureMembership } from '@/utils/uniHelper';

const userId = uni.getStorageSync('userId') || '';
// 搜索查询
const searchQuery = ref('');
// 聊天数据
const chats = ref([]);
const isFirstLoad = ref(true); // 标记是否为首次加载

const goToNoticePage = () => {
  uni.navigateTo({
    url: `/pages/notice/notice`
  });
};

// 识别图片链接并替换为[图片]
const replaceImageUrl = (text) => {
  // 匹配常见图片格式的URL（png/jpg/jpeg/gif/webp）
  const imageUrlRegex = /https?:\/\/\S+\.(png|jpg|jpeg|gif|webp)/gi;
  return text.replace(imageUrlRegex, '[图片]');
};

// 下拉刷新回调
onPullDownRefresh(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看消息', redirectTo: '/pages/mine/mine' })) {
    uni.stopPullDownRefresh();
    return;
  }
  // 执行刷新逻辑：重新请求聊天列表和未读通知
  Promise.all([fetchChats(), fetchUnreadCount()])
    .then(() => {
      // 刷新完成后，停止下拉刷新动画
      uni.stopPullDownRefresh();
    })
    .catch((error) => {
      console.error('下拉刷新失败：', error);
      uni.stopPullDownRefresh();
    });
});

//未读通知数量变量
const unreadCount = ref(0);

//获取未读通知数量
const fetchUnreadCount = async () => {
  try {
    const res = await noticeApi.getUnreadCount();
    if (res.code === 200 && res.data) {
      unreadCount.value = res.data.totalUnreadCount || 0;
    }
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
};

// 页面显示时触发（包括返回场景）
onShow(async () => {
  if (!ensureLoggedIn({ content: '登录后才能查看消息', redirectTo: '/pages/mine/mine' })) return;
  // if (isFirstLoad.value) {
  //   // 首次加载：请求接口并初始化数据
  //   await fetchChats();
  //   await fetchUnreadCount();
  //   isFirstLoad.value = false;
  // } else {
  //   // 非首次加载（返回场景）：仅刷新未读数量，聊天列表复用已有数据
  //   await fetchUnreadCount();
  // }
    const pages = getCurrentPages();
    if (pages.length > 1) { // 说明是从其他页面返回
      await fetchChats();
      await fetchUnreadCount();
    }
    isFirstLoad.value = false;

    fetchUnreadCount();
});

// 过滤后的聊天列表
const filteredChats = computed(() => {
  if (!searchQuery.value) {
    return chats.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return chats.value.filter(chat => 
    chat.name.toLowerCase().includes(query) || 
    chat.lastMessage.toLowerCase().includes(query)
  );
});

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑由computed自动处理
};

// 清空搜索
const clearSearch = () => {
  searchQuery.value = '';
};

// 点击聊天项跳转到聊天详情页（仅要求登录即可查看）
const handleChatClick = (chat) => {
  if (!ensureLoggedIn({ content: '登录后才能查看并进入聊天', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({
    url: `/pages/chat/chat?sellerId=${chat.senderId}`
  });
};

// 组件挂载时获取聊天列表数据
onMounted(async () => {
  if (!ensureLoggedIn({ content: '登录后才能查看消息', redirectTo: '/pages/mine/mine' })) return;
	  // 监听返回按钮点击
	  uni.onNavigationBarButtonTap((res) => {
	    if (res.type === 'back') {
	      fetchChats();
	      fetchUnreadCount();
	    }
	  });
	 //  if (isFirstLoad.value) {
		// await fetchChats();
		// await fetchUnreadCount();
		// isFirstLoad.value = false;
	 //  }
	 //  fetchChats ();
});

const fetchChats = async () => {
	try {
	  const res = await chatApi.getChatConversations();
		console.log('后端返回的消息列表为：',res)
	  if (res.code === 200) {
	    const chatData = res.data.map(item => {
	      // 条件判断：senderId等于userId时，用receiverNickname；否则用senderNickname
	      const name = item.senderId === userId 
	        ? item.receiverNickname 
	        : item.senderNickname;
	      const senderId = item.senderId === userId
	        ? item.receiverId 
	        : item.senderId;
			const avatar = item.senderId === userId
			  ? item.receiverAvatar 
			  : item.senderAvatar;
			
			 // 处理lastMessage：替换图片链接为[图片]
			const lastMessage = replaceImageUrl(item.lastMessageContent || '');
			
	      return {
	        name, // 使用条件判断后的name
	        avatar,
	        lastMessage,
	        time: item.lastMessageTime || '',
	        unread: item.unreadCount || 0,
	        senderId,
	      };
	    });
	    chats.value = chatData;
	    await fetchUnreadCount();
	  } else {
	    uni.showToast({
	      title: res.msg || '获取聊天列表失败',
	      icon: 'none'
	    });
	  }
	} catch (error) {
	  uni.showToast({
	    title: '接口请求异常',
	    icon: 'none'
	  });
	  console.error('获取聊天列表失败：', error);
	}
}


</script>

<style scoped>
.chat-list-container {
  flex: 1;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 搜索栏样式 */
.search-bar {
  padding: 12rpx 24rpx;
  background-color: #fff;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 60rpx;
  padding: 14rpx 24rpx;
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  height: 40rpx;
  line-height: 40rpx;
}

.search-input::placeholder {
  color: #999;
}

.clear-icon {
  margin-left: 16rpx;
}

/* 聊天列表样式 */
.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 20rpx 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background-color 0.2s;
}

.chat-item:active {
  background-color: #f9f9f9;
}

.avatar-wrapper {
  position: relative;
  margin-right: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
}

.unread-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #ff3b30;
  color: #fff;
  font-size: 24rpx;
  height: 40rpx;
  border-radius: 20rpx; /* 椭圆更适配多位数 */
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40rpx;
  padding: 0 8rpx; /* 关键：增加左右留白，适配1-3位数字 */
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100rpx;
  position: relative;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.chat-name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  max-width: 400rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 24rpx;
  color: #999;
}

.chat-last-message {
  display: flex;
  align-items: center;
}

.message-content {
  font-size: 28rpx;
  color: #666;
  max-width: 500rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-message {
  color: #333;
  font-weight: 500;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-top: 30rpx;
}

/* 系统通知样式 */
.system-notice {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  margin-bottom: 10rpx; /* 与下方聊天列表分隔 */
}

.notice-icon {
  margin-right: 20rpx;
  background-color: #e8f3ff;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 4rpx;
}

.notice-desc {
  font-size: 26rpx;
  color: #666;
}

.arrow-icon {
  margin-left: 10rpx;
}
</style>