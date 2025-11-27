<template>
  <view class="my-published-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="nav-title">我发布的需求</text>
      <button class="add-demand-btn" @click="goToPublish">
        <uni-icons type="plus" size="24" color="#fff"></uni-icons>
        <text class="add-text">发需求</text>
      </button>
    </view>
    
    <!-- 搜索和筛选区域 -->
    <view class="filter-container">
      <view class="search-box">
        <uni-icons type="search" size="24" color="#999" class="search-icon"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索我的需求..." 
          v-model="searchKeyword"
          @input="handleSearch"
          class="search-input"
        />
      </view>
      
      <view class="picker-container">
        <view class="picker-item">
          <text class="picker-label">分类:</text>
          <picker 
            mode="selector"
            :range="categoryRange"
            :value="categoryIndex"
            @change="handleCategoryChange"
            class="custom-picker"
          >
            <view class="picker-display">
              {{ categoryRange[categoryIndex] }}
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
        
        <view class="picker-item">
          <text class="picker-label">状态:</text>
          <picker 
            mode="selector"
            :range="statusRange"
            :value="statusIndex"
            @change="handleStatusChange"
            class="custom-picker"
          >
            <view class="picker-display">
              {{ statusRange[statusIndex] }}
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 需求列表说明 -->
    <view class="list-note">
      <uni-icons type="info" size="24" color="#7c89ff" class="note-icon"></uni-icons>
      <text class="note-text">注：已完成的需求无法编辑和删除，相关按钮将自动隐藏</text>
    </view>
    
    <!-- 需求列表 -->
    <view class="demand-list">
      <view v-if="isLoading" class="loading-state">
        <uni-icons type="loading" size="40" color="#7c89ff" spin></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view 
        class="demand-row" 
        v-else-if="filteredDemands.length > 0"
        v-for="demand in filteredDemands" 
        :key="demand.id"
      >
        <view class="demand-info" @click="navigateToDetail(demand.id)">
          <image :src="demand.imgUrl || 'https://api.shaolezhuan.cn/lzphoto/demandpic.png'" mode="widthFix" class="demand-img"></image>
          
          <view class="demand-text-content">
            <view class="demand-title">{{ demand.title }}</view>
            
            <view class="demand-meta">
              <text class="demand-budget">¥{{ demand.budget.toFixed(2) }}</text>
              <text class="publish-time">{{ formatTime(demand.publishTime) }}</text>
              <text class="demand-location">
                <uni-icons type="map-pin" size="18" color="#999"></uni-icons>
                {{ demand.location }}
              </text>
            </view>
            
            <view class="demand-status">
              <view class="status-badge" :class="getStatusClass(demand.status)">
                {{ convertStatusToChinese(demand.status) }}
              </view>
              <view class="tags-container">
                <uni-tag 
                  v-if="demand.isTop === 1"
                  size="mini"
                  text="已置顶"
                  type="primary"
                ></uni-tag>
                <uni-tag 
                  v-if="demand.isOnHome"
                  size="mini"
                  text="首页展示"
                  type="success"
                ></uni-tag>
              </view>
            </view>
          </view>
        </view>
        
        <view class="demand-actions" v-if="convertStatusToChinese(demand.status) !== '已完成'">
          <button 
            class="action-btn edit-btn" 
            @click.stop="handleOpenEditPopup(demand)"
          >
            <uni-icons type="compose" size="20" color="#409EFF"></uni-icons>
          </button>
          <button 
            class="action-btn delete-btn" 
            @click.stop="deleteDemand(demand.id)"
          >
            <uni-icons type="trash" size="20" color="#F56C6C"></uni-icons>
          </button>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <uni-icons type="empty" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无符合条件的需求</text>
        <button class="publish-btn" @click="goToPublish">发布新需求</button>
      </view>
    </view>
  
    <uni-popup 
      ref="editPopup"
      type="bottom"
      :mask="true"
      :mask-click="false"
      class="edit-popup"
    >
      <view class="edit-dialog">
        <!-- 调整预算输入区域 -->
        <view class="budget-edit-container">
          <text class="budget-label">调整预算:</text>
          <input 
            type="number" 
            v-model="newBudget"
            step="0.01"
            min="0.01"
            class="budget-input"
            placeholder="输入新预算"
          />
        </view>
        
        <!-- 操作按钮区域 -->
        <view class="action-buttons">
          <button 
            class="operation-btn top-btn" 
            @click="setDemandTop"
            :disabled="currentDemand?.isTop"
            v-if="currentDemand?.status !== 'resolved' && !currentDemand?.isTop"
          >
            置顶
          </button>
          <button 
            class="operation-btn home-btn" 
            @click="setDemandToHome"
            :disabled="currentDemand?.isOnHome"
            v-if="currentDemand?.status !== 'resolved' && !currentDemand?.isOnHome"
          >
            上首页
          </button>
          <!-- 确认完成交易按钮 -->
          <button 
            class="operation-btn complete-btn" 
            @click="confirmCompleteTransaction"
            v-if="!currentDemand?.isDraft && currentDemand?.status !== 'resolved'"
          >
            确认完成交易
          </button>
        </view>
        
        <!-- 确认调整预算按钮 -->
        <button class="confirm-budget-btn" @click="confirmBudgetAdjustment">
          确认调整
        </button>
        
        <!-- 取消按钮 -->
        <button class="dialog-cancel" @click="CancelEdit">
          取消
        </button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
// 导入需求相关接口
import productApi from '@/api/product.js';
import { ensureLoggedIn } from '@/utils/uniHelper';

// 基础状态
const searchKeyword = ref('');
const isLoading = ref(false);
const currentDemand = ref(null);
const newBudget = ref('');
const editPopup = ref(null);

// Picker筛选配置
const categoryRange = ref(['全部分类']);
const statusRange = ref(['全部状态', '待审核', '已上架','已拒绝','已完成']);
const categoryIndex = ref(0);
const statusIndex = ref(0);

// 需求数据
const publishedDemands = ref([]);

// 页面加载时获取需求列表
onMounted(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看我的需求', redirectTo: '/pages/mine/mine' })) return;
  fetchMyDemands();
  // 监听页面显示事件，重新获取数据
  uni.$on('pageShow', fetchMyDemands);
});

// 状态转换为中文
const convertStatusToChinese = (englishStatus) => {
  const statusMap = {
      'pending_review': '待审核',
      'active': '已上架',
      'rejected': '已拒绝',
      'resolved': '已完成'
    };
  return statusMap[englishStatus] || englishStatus;
};

// 获取我的需求列表
const fetchMyDemands = async () => {
  try {
    isLoading.value = true;
    const myData = { current: 1, size: 1000 };
    const res = await productApi.getMyDemands(myData);
    const rawDemandsList = res.data.records || [];

    // 处理需求数据（确保“category”字段存储分类名称）
    publishedDemands.value = rawDemandsList
      .filter(raw => raw.status !== 'delisted')
      .map(raw => ({
        id: raw.id,
        title: raw.title,
        desc: raw.description || '',
        imgUrl: raw.imageUrl || 'https://api.shaolezhuan.cn/lzphoto/demandpic.png',
        budget: raw.budget || 0,
        publishTime: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
        status: raw.status || 'pending_review', // 明确状态字段
        category: raw.categoryName || '其他', // 假设后端返回“categoryName”存储分类名称
        isTop: raw.urgentPush || false,
        isOnHome: raw.isHomepageFeatured || false
      }));

    // 动态生成分类选项（去重后添加“全部种类”）
    const categories = [...new Set(publishedDemands.value.map(item => item.category))];
    categoryRange.value = ['全部分类', ...categories];
  } catch (error) {
    console.error('获取需求列表失败:', error);
    uni.showToast({ title: '加载需求失败', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// 筛选逻辑（统一按中文状态比较，兼容后端返回英文或中文）
const filteredDemands = computed(() => {
  return publishedDemands.value.filter(demand => {
    // 1. 搜索筛选：标题/描述包含关键词
    const matchesSearch = searchKeyword.value === ''
      ? true
      : demand.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
        || (demand.desc && demand.desc.toLowerCase().includes(searchKeyword.value.toLowerCase()));

    // 2. 分类筛选：若选择“全部种类”则不筛选，否则匹配分类名称
    const selectedCategory = categoryRange.value[categoryIndex.value];
    const matchesCategory = selectedCategory === '全部分类'
      ? true
      : demand.category === selectedCategory;

    // 3. 状态筛选：若选择“全部状态”则不筛选；否则将需求状态转为中文再比较
    const selectedStatus = statusRange.value[statusIndex.value];
    const demandStatusCN = convertStatusToChinese(demand.status);
    const matchesStatus = selectedStatus === '全部状态'
      ? true
      : demandStatusCN === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

// Picker事件处理
const handleCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
  fetchMyDemands();
};

const handleStatusChange = (e) => {
  statusIndex.value = e.detail.value;
  fetchMyDemands();
};

const handleSearch = () => {
  // 搜索由computed自动触发本地筛选
};

// 状态样式映射
const getStatusClass = (status) => {
  const classMap = {
    'pending_review': 'status-pending',    // 待审核状态样式
    'active': 'status-onsale',     // 已上架/出售中样式
    'rejected': 'status-rejected',   // 已拒绝状态样式
    'resolved': 'status-completed'   // 已完成状态样式（如有需要）
  };
  return classMap[status] || 'status-default';
};

// 时间格式化
const formatTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 3600 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  } else if (diff < 24 * 3600 * 1000) {
    return `${Math.floor(diff / (3600 * 1000))}小时前`;
  } else {
    return `${Math.floor(diff / (24 * 3600 * 1000))}天前`;
  }
};

// 导航到需求详情
const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/demandDetail/demandDetail?id=${id}`
  });
};

// 打开编辑弹窗
const handleOpenEditPopup = async (demand) => {
  try {
    currentDemand.value = { ...demand };
    newBudget.value = demand.budget.toString();
    await nextTick();
    editPopup.value?.open('bottom');
  } catch (error) {
    console.error('打开编辑弹窗失败:', error);
    uni.showToast({ title: '打开弹窗失败', icon: 'none' });
  }
};

// 显示已完成提示
const showCompletedTip = () => {
  uni.showModal({
    title: '提示',
    content: '已完成的需求无法编辑',
    showCancel: false,
    confirmText: '知道了'
  });
};

const CancelEdit = () => {
  editPopup.value?.close();
};

// 确认调整预算
const confirmBudgetAdjustment = async () => {
  if (!currentDemand.value) return;
  
  // 校验预算
  if (!newBudget.value || isNaN(newBudget.value) || parseFloat(newBudget.value) <= 0) {
    uni.showToast({
      title: '请输入有效的预算金额',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  try {
    isLoading.value = true;
    // 调用调整预算接口
    const res = await productApi.updateDemandBudget(
      currentDemand.value.id,
      { budget: parseFloat(newBudget.value) }
    );
    
    if (res.code === 200) {
      uni.showToast({ title: '预算调整成功', icon: 'success' });
      fetchMyDemands();
	  // 更新本地数据
      const index = publishedDemands.value.findIndex(item => item.id === currentDemand.value.id);
      if (index !== -1) {
        publishedDemands.value[index].budget = parseFloat(newBudget.value);
      }
    } else {
      uni.showToast({
        title: `调整失败：${res.msg}`,
        icon: 'none'
      });
    }
    
    editPopup.value?.close();
  } catch (error) {
    console.error('调整预算失败:', error);
    uni.showToast({ title: '调整失败', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// 设置需求置顶
const setDemandTop = async () => {
  if (!currentDemand.value || currentDemand.value.isTop) return;

  try {
    isLoading.value = true;
	const targetTopStatus = true;	
    const demandId = currentDemand.value.id;
    // 调用置顶接口
    const res = await productApi.setDemandTop(demandId);
    
	console.log('置顶情况',res)
	
    if (res.code === 200) {
      uni.showToast({
        title: '需求已申请置顶',
        icon: 'success'
      });
	  fetchMyDemands();
      // 更新本地数据
      const index = publishedDemands.value.findIndex(item => item.id === currentDemand.value.id);
      if (index !== -1) {
        publishedDemands.value[index].isTop = true;
      }
    } else {
      uni.showToast({
        title: `置顶失败：${res.msg}`,
        icon: 'none'
      });
    }
    
    editPopup.value?.close();
  } catch (error) {
    console.error('置顶操作失败:', error);
    uni.showToast({ title: '操作失败', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// 设置需求上首页
const setDemandToHome = async () => {
  if (!currentDemand.value || currentDemand.value.isOnHome) return;

  try {
    isLoading.value = true;
	const targetStatus = true;
    const demandId = currentDemand.value.id;
    // 调用上首页接口
    const res = await productApi. setDemandTohome(demandId);
    
    if (res.code === 200) {
      uni.showToast({
        title: '需求已申请上首页推荐',
        icon: 'success'
      });
	  fetchMyDemands();
      // 更新本地数据
      const index = publishedDemands.value.findIndex(item => item.id === currentDemand.value.id);
      if (index !== -1) {
        publishedDemands.value[index].isOnHome = true;
      }
    } else {
      uni.showToast({
        title: `推荐失败：${res.msg}`,
        icon: 'none'
      });
    }
    
    editPopup.value?.close();
  } catch (error) {
    console.error('设置首页展示失败:', error);
    uni.showToast({ title: '操作失败', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// 确认完成交易
const confirmCompleteTransaction = async () => {
  if (!currentDemand.value || currentDemand.value.status === 'resolved') {
    uni.showToast({ title: '该需求已完成交易', icon: 'none' });
    return;
  }
  
  // 二次确认
  uni.showModal({
    title: '确认完成交易',
    content: '确定要将此需求标记为已完成吗？标记后将无法编辑',
    confirmText: '确认',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          isLoading.value = true;
          // 调用状态更新接口
          await productApi.updateDemandStatus(
            currentDemand.value.id,
            { status: 'resolved' }
          );
          
          // 更新本地数据
          const index = publishedDemands.value.findIndex(item => item.id === currentDemand.value.id);
          if (index !== -1) {
            publishedDemands.value[index].status = 'resolved';
          }
          
          uni.showToast({ title: '已标记为完成', icon: 'success' });
          editPopup.value?.close();
        } catch (error) {
          console.error('标记完成失败:', error);
          uni.showToast({ title: '操作失败', icon: 'none' });
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
};

// 删除需求
const deleteDemand = async (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该需求吗？删除后不可恢复',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          isLoading.value = true;
          // 调用删除接口
          const deleteRes = await productApi.deleteDemand(id);
          console.log('删除需求ID',id)
          console.log('删除需求反馈',deleteRes)
          if (deleteRes.code === 200) {
			fetchMyDemands();
            // 更新本地数据
            publishedDemands.value = publishedDemands.value.filter(item => item.id !== id);
            uni.showToast({ title: '需求已删除', icon: 'success' });
          } else {
            uni.showToast({ title: `删除失败：${deleteRes.msg}`, icon: 'none' });
          }
        } catch (error) {
          console.error('删除需求失败:', error);
          uni.showToast({ title: '删除失败', icon: 'none' });
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
};

// 跳转到发布需求页面
const goToPublish = () => {
  uni.navigateTo({
    url: `/pages/receive/receive`
  });
};
</script>

<style scoped>
/* 保持原有样式不变，仅补充状态相关样式 */
.my-published-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 列表说明样式 */
.list-note {
  padding: 15rpx 20rpx;
  background-color: #e6f7ff;
  margin: 0 20rpx 20rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #1890ff;
}

.note-icon {
  margin-right: 10rpx;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 999;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.add-demand-btn {
  display: flex;
  align-items: center;
  background-color: #7c89ff;
  color: #fff;
  font-size: 28rpx;
  padding: 0 25rpx;
  margin-right: 16rpx;
  height: 60rpx;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(124, 137, 255, 0.3);
  transition: all 0.2s ease;
}

.add-demand-btn:hover {
  background-color: #6a78e0;
  transform: translateY(-2rpx);
}

.add-text {
  margin-left: 8rpx;
}

/* 筛选区域样式 */
.filter-container {
  padding: 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.03);
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 60rpx;
  padding: 0 20rpx;
  height: 70rpx;
  margin-bottom: 20rpx;
}

.search-icon {
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.picker-container {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 40rpx;
  padding: 0 20rpx;
  height: 60rpx;
  flex-shrink: 0;
}

.picker-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 10rpx;
}

.custom-picker {
  width: auto;
}

.picker-display {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333;
  padding: 0 5rpx;
}

.picker-icon {
  margin-left: 8rpx;
}

/* 需求列表样式 */
.demand-list {
  padding: 0 20rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #7c89ff;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
}

.demand-row {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx;
  margin-bottom: 15rpx;
  min-height: 180rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.demand-info {
  display: flex;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
}

.demand-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 15rpx;
}

.demand-text-content {
  flex: 1;
  overflow: hidden;
}

.demand-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demand-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 10rpx;
  font-size: 24rpx;
}

.demand-budget {
  color: #F56C6C;
  font-weight: 600;
}

.publish-time, .demand-location {
  color: #999;
  display: flex;
  align-items: center;
}

.demand-status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.status-badge {
  padding: 3rpx 10rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

/* 状态标签样式补充 */
.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-onsale {
  background-color: #f0f9eb;
  color: #52c41a;
}

.status-rejected {
  background-color: #fff1f0;
  color: #f5222d;
}

.status-completed {
  background-color: #f6f6f6;
  color: #ffaa00;
}

.publish-badge {
  padding: 3rpx 10rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.publish-draft {
  background-color: #f0f2f5;
  color: #8c8c8c;
}

.publish-published {
  background-color: #e6f7ff;
  color: #1890ff;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.demand-actions {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  flex-shrink: 0;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.edit-btn {
  background-color: #ecf5ff;
}

.edit-btn.disabled {
  background-color: #f5f5f5;
}

.delete-btn {
  background-color: #fef0f0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #ccc;
}

.empty-text {
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  font-size: 28rpx;
}

.publish-btn {
  background-color: #7c89ff;
  color: #fff;
  font-size: 28rpx;
  padding: 0 40rpx;
  height: 70rpx;
  border-radius: 35rpx;
  box-shadow: 0 4rpx 12rpx rgba(124, 137, 255, 0.3);
}

/* 弹窗样式 */
.edit-popup {
  --uni-popup-height: auto;
}

.edit-dialog {
  background-color: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

/* 预算输入区域 */
.budget-edit-container {
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding: 10rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.budget-label {
  font-size: 40rpx;
  color: #333;
  width: 300rpx;
}

.budget-input {
  flex: 1;
  height: 80rpx;
  font-size: 40rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
}

/* 操作按钮区域 */
.action-buttons {
  padding: 10rpx 0;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.operation-btn {
  width: 100%;
  height: 80rpx;
  font-size: 30rpx;
  border-radius: 10rpx;
  background-color: #fff;
  color: #333;
}

/* 完成交易按钮样式 */
.complete-btn {
  background-color: #f0f9eb;
  color: #52c41a;
  border: 1px solid #e6f7e9;
}

/* 确认调整预算按钮 */
.confirm-budget-btn {
  width: 100%;
  height: 80rpx;
  background-color: #7c89ff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 10rpx;
}

/* 取消按钮 */
.dialog-cancel {
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  color: #333;
  font-size: 30rpx;
  border-radius: 10rpx;
  border: 1px solid #eee;
}
</style>