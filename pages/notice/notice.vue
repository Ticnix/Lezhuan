<template>
  <view class="notification-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="title">消息通知</text>
      <view class="filter-btn" @click="showFilter = !showFilter">
        <uni-icons type="filter" size="24"></uni-icons>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view class="filter-panel" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">通知类型:</text>
        <picker @change="handleTypeChange" :value="typeIndex" :range="typeOptions">
          <view class="picker-view">{{ typeOptions[typeIndex] }}</view>
        </picker>
      </view>
      <view class="filter-item">
        <text class="filter-label">阅读状态:</text>
        <picker @change="handleReadChange" :value="readIndex" :range="readOptions">
          <view class="picker-view">{{ readOptions[readIndex] }}</view>
        </picker>
      </view>
      <view class="filter-actions">
        <button class="reset-btn" @click="resetFilter">重置</button>
        <button class="confirm-btn" @click="confirmFilter">确认</button>
      </view>
    </view>

    <!-- 通知列表 -->
    <scroll-view
      class="notification-list"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      @refresherrefresh="onRefresh"
      refresher-threshold="80"
    >
      <!-- 通知项：每条独立控制滑动 -->
      <view 
        class="notification-item" 
        v-for="(item, index) in notificationList" 
        :key="item.id"
        :class="{ 'unread': !item.isRead }"
      >
        <!-- 滑动容器：控制通知内容左滑 -->
        <view 
          class="slide-content" 
          :style="{ transform: `translateX(${getSwipeOffset(item.id)}px)` }"
          @touchstart="handleTouchStart($event, item.id)"
          @touchmove="handleTouchMove($event, item.id)"
          @touchend="handleTouchEnd(item.id)"
        >
          <!-- 未读标识 -->
          <view class="unread-dot" v-if="!item.isRead"></view>
          
          <!-- 通知内容：点击展开详情 -->
          <view class="notification-content" @click="handleNotificationClick(item)">
            <view class="notification-header">
              <text class="notification-type">{{ getTypeName(item.type) }}</text>
              <text class="notification-time">{{ formatTime(item.createTime) }}</text>
            </view>
            <view class="notification-body">
              <text class="notification-message">{{ item.content }}</text>
            </view>
            <!-- 展开详情区域 -->
            <view class="notification-detail" v-if="expandedId === item.id">
              <view class="detail-line">
                <text class="detail-label">通知ID：</text>
                <text class="detail-value">{{ item.id }}</text>
              </view>
              <view class="detail-line">
                <text class="detail-label">完整内容：</text>
                <text class="detail-value">{{ item.content }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 删除按钮：仅当前滑动的通知显示 -->
        <view 
          class="delete-btn" 
          v-if="isItemSwiped(item.id)"
          @click.stop="handleDelete(item.id)"
        >
          删除
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="notificationList.length === 0 && !isLoading">
        <uni-icons type="notification" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无通知</text>
      </view>

      <!-- 加载提示 -->
      <view class="loading-more" v-if="isLoading">
        <uni-icons type="loading" size="24" color="#777" spin></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="!hasMore && notificationList.length > 0">
        <text>没有更多通知了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import noticeApi from '@/api/notice.js';
import { ensureLoggedIn, ensureMembership } from '@/utils/uniHelper';

// 页面状态
const notificationList = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const pageSize = ref(10);

// 筛选条件
const showFilter = ref(false);
const typeOptions = ['全部类型', '系统通知', '交易提醒', '消息互动'];
const readOptions = ['全部状态', '未读', '已读'];
const typeIndex = ref(0);
const readIndex = ref(0);
const expandedId = ref(null); 
const filterParams = ref({ type: '', isRead: null });

// 关键：每条通知独立存储滑动状态（id: 偏移量）
const swipeOffsets = ref({}); // 格式：{ "通知id1": -80, "通知id2": 0 }
const startXMap = ref({}); // 存储每条通知的触摸起始X坐标

// 页面加载初始化
onLoad(() => {
  // 需登录后查看通知
  if (!ensureLoggedIn({ content: '登录后才能查看系统通知', redirectTo: '/pages/mine/mine' })) return;
  fetchNotifications(true);
});

// 获取通知列表
const fetchNotifications = async (isRefresh = false) => {
  if (isLoading.value && !isRefresh) return;
  isLoading.value = true;

  try {
    if (isRefresh) {
      page.value = 1;
      hasMore.value = true;
      swipeOffsets.value = {}; // 刷新时重置所有滑动状态
    }

    const params = {
      page: page.value,
      size: pageSize.value,
      ...(filterParams.value.type && { type: filterParams.value.type }),
      ...(filterParams.value.isRead !== null && { isRead: filterParams.value.isRead })
    };

    const res = await noticeApi.getNotificationList(params);
    if (res.code === 403) {
      // 非会员权限不足：引导开通会员
      ensureMembership('normal', {
        title: '系统通知权限不足',
        content: '开通会员后可查看系统通知的具体内容',
        confirmText: '去开通'
      });
    } else if (res.code === 200 && res.data) {
      const rawRecords = res.data.notifications || [];
      const records = rawRecords.map(item => ({
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
      // 其他错误状态统一提示
      uni.showToast({ title: '获取通知失败', icon: 'none' });
    }
  } catch (error) {
    console.error('获取通知失败:', error);
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
  } finally {
    isLoading.value = false;
    if (isRefresh) uni.stopPullDownRefresh();
  }
};

// 触摸开始：记录当前通知的起始位置
const handleTouchStart = (e, itemId) => {
  startXMap.value[itemId] = e.touches[0].clientX;
  // 其他通知复位（可选：避免多条同时滑动）
  Object.keys(swipeOffsets.value).forEach(id => {
    if (id !== itemId) swipeOffsets.value[id] = 0;
  });
};

// 触摸移动：计算当前通知的偏移量（仅左滑，最大-80px）
const handleTouchMove = (e, itemId) => {
  const startX = startXMap.value[itemId];
  const moveX = e.touches[0].clientX;
  const offset = startX - moveX; // 左滑偏移量为正
  // 限制偏移量：0（不滑）到-80（完全露出删除按钮）
  swipeOffsets.value[itemId] = Math.max(-80, Math.min(0, -offset));
};

// 触摸结束：不足30px复位，否则固定-80px
const handleTouchEnd = (itemId) => {
  if (Math.abs(swipeOffsets.value[itemId]) < 30) {
    swipeOffsets.value[itemId] = 0;
  } else {
    swipeOffsets.value[itemId] = -80;
  }
};

// 获取当前通知的滑动偏移量
const getSwipeOffset = (itemId) => {
  return swipeOffsets.value[itemId] || 0;
};

// 判断当前通知是否处于滑动状态（是否显示删除按钮）
const isItemSwiped = (itemId) => {
  return Math.abs(swipeOffsets.value[itemId] || 0) >= 30;
};

// 删除通知：调用接口并更新列表
const handleDelete = async (itemId) => {
  try {
    const res = await noticeApi.deleteNotification(itemId);
    // 从列表中移除
    notificationList.value = notificationList.value.filter(item => item.id !== itemId);
    // 清除该通知的滑动状态
    delete swipeOffsets.value[itemId];
	if(res.code===200){
	  uni.showToast({ title: '删除成功', icon: 'success' });
	}else{
	  uni.showToast({ title: '删除失败', icon: 'none' });
	}
  } catch (error) {
    console.error('删除通知失败:', error);
    uni.showToast({ title: '删除失败，请重试', icon: 'none' });
  }
};

// 其他原有方法（下拉刷新、加载更多、点击展开等）
const onRefresh = () => fetchNotifications(true);
const loadMore = () => {
  if (!hasMore.value || isLoading.value) return;
  fetchNotifications();
};

const handleNotificationClick = async (item) => {
  // 展开内容不限制，但尝试标记为已读时处理权限
  if (!item.isRead) {
    try {
      const markRes = await noticeApi.markAsRead(item.id);
      if (markRes && markRes.code === 200) {
        item.isRead = true;
        uni.showToast({ title: '已标记为已读', icon: 'none' });
      } else if (markRes && markRes.code === 403) {
        ensureMembership('normal', {
          title: '会员权限不足',
          content: '标记已读与查看完整内容需会员权限',
          confirmText: '去开通'
        });
      } else {
        uni.showToast({ title: '标记失败', icon: 'none' });
      }
    } catch (error) {
      uni.showToast({ title: '标记失败', icon: 'none' });
    }
  }
  expandedId.value = expandedId.value === item.id ? null : item.id;
};

const handleTypeChange = (e) => { typeIndex.value = e.detail.value; };
const handleReadChange = (e) => { readIndex.value = e.detail.value; };
const resetFilter = () => {
  typeIndex.value = 0;
  readIndex.value = 0;
  filterParams.value = { type: '', isRead: null };
};
const confirmFilter = () => {
  filterParams.value = {
    type: typeIndex.value === 0 ? '' : 
           typeIndex.value === 1 ? 'system' :
           typeIndex.value === 2 ? 'trade' : 'message',
    isRead: readIndex.value === 0 ? null : readIndex.value === 1 ? false : true
  };
  fetchNotifications(true);
  showFilter.value = false;
};

// 时间格式化
const formatTime = (timestamp, format = 'short') => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  if (format === 'full') return `${year}-${month}-${day} ${hour}:${minute}`;
  
  const diff = new Date() - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}天前` : `${year}-${month}-${day}`;
};

// 通知类型名称
const getTypeName = (type) => {
  switch (type) {
    case 'system': return '系统通知';
    case 'trade': return '交易提醒';
    case 'message': return '消息互动';
    default: return '通知';
  }
};
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background-color: #f5f7f7;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.filter-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 筛选面板 */
.filter-panel {
  background-color: #fff;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.filter-label {
  width: 80px;
  font-size: 14px;
  color: #666;
}

.picker-view {
  flex: 1;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #333;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.reset-btn, .confirm-btn {
  width: 80px;
  height: 36px;
  line-height: 36px;
  padding: 0;
  font-size: 14px;
}

.reset-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #007aff;
  color: #fff;
}

/* 通知列表 */
.notification-list {
  flex: 1;
  height: calc(100vh - 44px);
}

/* 通知项：相对定位，承载滑动内容和删除按钮 */
.notification-item {
  position: relative;
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  overflow: hidden; /* 隐藏超出的删除按钮 */
}

.notification-item.unread {
  background-color: #f9f9ff;
}

/* 滑动内容：左滑主体 */
.slide-content {
  display: flex;
  width: 100%;
  padding: 16px;
  transition: transform 0.3s ease; /* 滑动动画 */
}

/* 未读标识 */
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #007aff;
  margin-top: 8px;
  margin-right: 12px;
}

/* 通知内容区 */
.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.notification-type {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-body {
  overflow: hidden;
}

.notification-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 详情展开区域 */
.notification-detail {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #eee;
  background-color: #fafafa;
  border-radius: 8rpx;
  padding: 16rpx;
}

.detail-line {
  display: flex;
  margin-bottom: 12rpx;
  font-size: 24rpx;
}

.detail-label {
  width: 140rpx;
  color: #999;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #666;
  word-break: break-all; /* 防止长文本溢出 */
}

/* 删除按钮：固定在右侧，默认隐藏 */
.delete-btn {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 180rpx;
  background-color: #ff4d4f;
  color:#fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* 确保在内容上方 */
}

/* 点击反馈优化 */
.slide-content {
  cursor: pointer;
  transition: background-color 0.2s;
}

.slide-content:active {
  background-color: #f0f0f0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
  color: #ccc;
}

.empty-text {
  margin-top: 16px;
  font-size: 14px;
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: #777;
}

.loading-text {
  margin-left: 8px;
  font-size: 14px;
}

/* 没有更多 */
.no-more {
  text-align: center;
  padding: 20px 0;
  font-size: 14px;
  color: #999;
}
</style>