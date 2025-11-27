<template>
  <view class="history-browse-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="nav-title">历史浏览</text>
      <button class="clear-btn" @click="clearHistory">
        清空
      </button>
    </view>
    
    <!-- 搜索和筛选区域 -->
    <view class="filter-container">
      <view class="search-box">
        <uni-icons type="search" size="24" color="#999" class="search-icon"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索浏览记录..." 
          v-model="searchKeyword"
          @input="handleSearch"
          class="search-input"
        />
      </view>
      
      <view class="picker-container">
        <!-- 功能筛选（对象数组 + range-key） -->
        <view class="picker-item">
          <text class="picker-label">功能:</text>
          <picker 
            mode="selector"
            :range="functionRange"
            :range-key="'text'"
            :value="functionIndex"
            @change="handleFunctionChange"
            class="custom-picker"
          >
            <view class="picker-display">
              {{ functionRange[functionIndex].text }}
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
        
        <!-- 分类筛选（对象数组 + range-key） -->
        <view class="picker-item">
          <text class="picker-label">分类:</text>
          <picker 
            mode="selector"
            :range="categoryRange"
            :range-key="'text'"
            :value="categoryIndex"
            @change="handleCategoryChange"
            class="custom-picker"
          >
            <view class="picker-display">
              {{ categoryRange[categoryIndex].text }}
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 商品列表组件 -->
    <CommonGoodsList 
      :goodsList="filteredHistoryGoods" 
      :showPrice="true"
      :showStatus="true"
      :emptyText="isEmpty ? '暂无浏览记录' : ''"
    />
    
    <!-- 加载更多提示 -->
    <view v-if="loadingMore" class="loading-more">
	  <uni-icons type="spinner-cycle" size="24" color="#666"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
    <view v-if="noMore && !isEmpty" class="no-more">
      已加载全部
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, onUpdated } from 'vue';
import { onReachBottom, onShow } from '@dcloudio/uni-app';
import CommonGoodsList from '@/components/CommonGoodsList.vue';
import userApi from '@/api/user.js'; // 引入用户相关接口
import { ensureLoggedIn } from '@/utils/uniHelper';

// 基础状态
const searchKeyword = ref('');
const historyGoods = ref([]); // 所有加载的历史记录（累加）
const isEmpty = ref(false);
const total = ref(0); // 总记录数
const currentPage = ref(1); // 当前页码
const pageSize = ref(200); // 每页条数
const loading = ref(false); // 初始加载状态
const loadingMore = ref(false); // 加载更多状态
const noMore = ref(false); // 是否没有更多数据

// 筛选器配置（对象数组，包含text和value）
const functionRange = ref([
  { text: '全部', value: '' },
  { text: '宝贝', value: '宝贝' },
  { text: '需求', value: '需求' }
]);
const categoryRange = ref([{ text: '全部', value: '' }]); // 初始值，后续动态填充

// 筛选器选中索引
const functionIndex = ref(0);
const categoryIndex = ref(0);

// 页面初始化加载第一页数据
onMounted(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看历史浏览', redirectTo: '/pages/mine/mine' })) return;
  resetAndLoad();
});

// 页面显示时刷新数据（重置为第一页）
onShow(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看历史浏览', redirectTo: '/pages/mine/mine' })) return;
  resetAndLoad();
});

// 重置分页并加载第一页数据（筛选条件变化时调用）
const resetAndLoad = () => {
  currentPage.value = 1;
  historyGoods.value = [];
  noMore.value = false;
  loadHistoryData();
};

// 加载浏览历史数据（对接后端分页接口）
const loadHistoryData = async () => {
  // 避免重复请求
  if (loading.value || loadingMore.value) return;

  // 初始加载/加载更多状态切换
  if (currentPage.value === 1) {
    loading.value = true;
    uni.showLoading({ title: '加载中...', mask: true });
  } else {
    loadingMore.value = true;
  }
  
  const userId = uni.getStorageSync('userId')

  try {
    // 构造请求参数（根据筛选条件）
    const params = {
	  userId: userId,
      current: currentPage.value,
      size: pageSize.value,
    };
	
	console.log('历史浏览请求参数：', params)

    // 调用后端分页接口
    const res = await userApi.getBrowseHistoryList(params);
    if (res.code === 200) {
      const pageData = res.data;
	  console.log('后端返回的浏览记录数据：', pageData)
      total.value = pageData.total; // 总记录数

      // 格式化后端返回的数据（适配前端组件字段）
      const formattedData = pageData.records.map(record => ({
        id: record.itemId.toString(),
        title: record.itemTitle || '未知标题',
        desc: '', // 后端未返回描述，可留空或补充
        imgUrl: record.itemImageUrl || 'https://api.shaolezhuan.cn/lzphoto/demandpic.png',
        price: record.itemPrice || 0,
        category: record.itemCategory || '未知分类', // 需后端补充分类字段
        function: record.itemType === 'product' ? '宝贝' : '需求',
        type: record.itemType === 'demand' ? 'demand' : 'product',
        status: record.itemStatus || 'normal',
        browseTime: new Date(record.browseTime).getTime(), // 转换为时间戳
        publisher: {
          nickname: record.sellerNickname || '未知用户',
          avatar: '' // 后端未返回头像，可留空
        },
        isFavorited: record.isFavorited || false // 是否收藏
      }));

      // 累加数据（第一页直接覆盖，后续页追加）
      if (currentPage.value === 1) {
        historyGoods.value = formattedData;
      } else {
        historyGoods.value = [...historyGoods.value, ...formattedData];
      }

      // 判断是否还有更多数据
      noMore.value = historyGoods.value.length >= total.value;

      // 生成分类下拉框（去重+排序，过滤无效值）
      const validCategories = historyGoods.value.map(item => item.category).filter(cate => cate && cate.trim());
      const uniqueCategories = [...new Set(validCategories)]
        .sort((a, b) => a.localeCompare(b, 'zh-CN'))
        .map(cate => ({ text: cate, value: cate }));
      categoryRange.value = [{ text: '全部', value: '' }, ...uniqueCategories];
    } else {
      uni.showToast({ title: res.msg || '获取浏览记录失败', icon: 'none' });
    }
  } catch (error) {
    console.error('加载浏览历史失败:', error);
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
  } finally {
    // 关闭加载状态
    loading.value = false;
    loadingMore.value = false;
    uni.hideLoading();
    isEmpty.value = historyGoods.value.length === 0;
  }
};

// 下拉加载更多（页面滚动到底部时触发）
onReachBottom(() => {
  if (!noMore.value && !loadingMore.value) {
    currentPage.value++; // 页码+1
    loadHistoryData(); // 加载下一页
  }
});

// 综合筛选逻辑（基于本地已加载数据筛选）
const filteredHistoryGoods = computed(() => {
  const filtered = historyGoods.value.filter(goods => {
    // 搜索筛选
    const matchesSearch = searchKeyword.value === '' 
      ? true 
      : goods.title.toLowerCase().includes(searchKeyword.value.toLowerCase());
    
    // 功能筛选（基于value匹配）
    const selectedFunction = functionRange.value[functionIndex.value].value;
    const matchesFunction = !selectedFunction 
      ? true 
      : goods.function === selectedFunction;
    
    // 分类筛选（基于value匹配）
    const selectedCategory = categoryRange.value[categoryIndex.value].value;
    const matchesCategory = !selectedCategory 
      ? true 
      : goods.category === selectedCategory;

    // 状态过滤：不显示已卖出(sold/已卖出)或已下架/删除(delisted/已删除)
    const status = (goods.status || '').toString();
    const statusLower = status.toLowerCase();
    const hiddenZh = status === '已卖出' || status === '已删除';
    const hiddenEn = statusLower === 'sold' || statusLower === 'delisted';
    const visibleStatus = !(hiddenZh || hiddenEn);

    return matchesSearch && matchesFunction && matchesCategory && visibleStatus;
  });
  
  // 更新空状态（筛选后无数据时显示）
  isEmpty.value = filtered.length === 0 && historyGoods.value.length > 0;
  return filtered;
});

// 清空历史记录（需对接后端清空接口，这里仅做前端示例）
const clearHistory = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有浏览记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用后端清空接口（假设存在）
          const res = await userApi.clearBrowseHistory();
          if (res.code === 200) {
            historyGoods.value = [];
            isEmpty.value = true;
            uni.showToast({ title: '已清空浏览记录', icon: 'none' });
          } else {
            uni.showToast({ title: res.msg || '清空失败', icon: 'none' });
          }
        } catch (error) {
          console.error('清空浏览记录失败:', error);
          uni.showToast({ title: '网络错误', icon: 'none' });
        }
      }
    }
  });
};

// 筛选器变化时重置分页并重新加载
const handleFunctionChange = (e) => {
  functionIndex.value = e.detail.value;
  resetAndLoad();
};

const handleCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
  // 分类筛选仅过滤本地数据，无需重新请求接口
};

const handleSearch = () => {
  // 搜索仅过滤本地数据，无需重新请求接口
};

onUnmounted(() => {
  // 清理工作
});
</script>

<style scoped>
.history-browse-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
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

/* 清空按钮 */
.clear-btn {
  background-color: transparent;
  color: #f5222d;
  font-size: 28rpx;
  padding: 0 20rpx;
  margin-right: 16rpx;
  height: 60rpx;
  line-height: 60rpx;
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
  scrollbar-width: none; /* 隐藏滚动条 */
}

.picker-container::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
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

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  color: #666;
  font-size: 28rpx;
}

.loading-text {
  margin-left: 10rpx;
}

.no-more {
  text-align: center;
  padding: 30rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>