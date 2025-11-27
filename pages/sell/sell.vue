<template>
  <view class="my-sold-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="nav-title">我卖出的商品</text>
    </view>
    
    <!-- 搜索和筛选区域 -->
    <view class="filter-container">
      <view class="search-box">
        <uni-icons type="search" size="24" color="#999" class="search-icon"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索卖出的商品..." 
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
          <text class="picker-label">时间:</text>
          <picker 
            mode="selector"
            :range="timeRange"
            :value="timeIndex"
            @change="handleTimeChange"
            class="custom-picker"
          >
            <view class="picker-display">
              {{ timeRange[timeIndex] }}
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 商品列表组件 -->
    <view v-if="isLoading" class="loading-state">
      <uni-icons type="loading" size="40" color="#7c89ff" spin></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
    
    <CommonGoodsList 
      v-else-if="filteredSoldGoods.length > 0"
      :goodsList="filteredSoldGoods" 
      :showPrice="true"
      :showStatus="true"
      :disableNavigation="true"
    />
    
    <view class="empty-state" v-else>
      <uni-icons type="empty" size="60" color="#ccc"></uni-icons>
      <text class="empty-text">暂无卖出的商品</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import CommonGoodsList from '@/components/CommonGoodsList.vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
// 导入接口封装
import productApi from '@/api/product.js';
import { sanitizeImageUrl, ensureLoggedIn } from '@/utils/uniHelper';

// 基础状态
const searchKeyword = ref('');
const soldGoods = ref([]);
const isLoading = ref(false); // 加载状态

// 筛选器配置
const categoryRange = ref(['全部分类']);
const timeRange = ref(['全部时间', '近一周', '近一个月', '近三个月', '更早']);

// 筛选器选中索引
const categoryIndex = ref(0);
const timeIndex = ref(0);

// 页面加载时获取数据
onMounted(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看我卖出的商品', redirectTo: '/pages/mine/mine' })) return;
  fetchSoldGoods();
  // 监听页面显示事件，重新获取数据
  uni.$on('pageShow', fetchSoldGoods);
});

// 获取已卖出商品列表（调用后端接口）
const fetchSoldGoods = async () => {
  try {
    isLoading.value = true;
    // 构造筛选参数（根据后端接口要求调整）
    const soldData = {
      current: 1,
      size: 1000,
      status: 'sold', 
    };
    
    // 调用后端接口
    const res = await productApi.getMyGoods(soldData);
    const rawGoodsList = res.data.records || [];
    
    console.log('后端返回的已卖出商品数据:', rawGoodsList);
    
    // 数据映射：将后端返回格式转换为前端所需格式
    soldGoods.value = rawGoodsList.map(raw => ({
      id: raw.id, // 商品ID
      title: raw.title || '未命名商品', // 商品标题
      desc: raw.description || '', // 商品描述
      imgUrl: sanitizeImageUrl(raw.mainImageUrl, 'product'), // 商品主图（加默认图）
      price: raw.price || 0, // 交易价格
      category: raw.categoryName || '其他', // 分类名称
      attributes: raw.attributes ? JSON.parse(raw.attributes) : [], // 商品属性（若为JSON字符串需解析）
      status: raw.status || '已完成', // 交易状态
      transactionTime: raw.transactionTime || '', // 交易时间
      publishTime: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(), // 发布时间戳
    }));
    
    // 动态生成种类筛选选项
    const categories = [...new Set(soldGoods.value.map(item => item.category))];
    categoryRange.value = ['全部分类', ...categories];
    
  } catch (error) {
    console.error('获取已卖出商品列表失败:', error);
    uni.showToast({
      title: '加载失败，请稍后重试',
      icon: 'none',
      duration: 2000
    });
    soldGoods.value = []; // 异常时清空数据
  } finally {
    isLoading.value = false; // 无论成功失败都关闭加载
  }
};

// 综合筛选逻辑
const filteredSoldGoods = computed(() => {
  return soldGoods.value.filter(goods => {
    // 搜索筛选（不区分大小写）
    const matchesSearch = searchKeyword.value === '' 
      ? true 
      : goods.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) 
        || goods.desc.toLowerCase().includes(searchKeyword.value.toLowerCase());
    
    // 种类筛选
    const selectedCategory = categoryRange.value[categoryIndex.value];
    const matchesCategory = selectedCategory === '全部分类' 
      ? true 
      : goods.category === selectedCategory;
    
    // 时间筛选
    const matchesTime = filterByTime(goods.publishTime);
    
    return matchesSearch && matchesCategory && matchesTime;
  });
});

// 按时间筛选逻辑
const filterByTime = (publishTime) => {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 3600 * 1000;
  const oneMonthAgo = now - 30 * 24 * 3600 * 1000;
  const threeMonthsAgo = now - 90 * 24 * 3600 * 1000;
  
  switch (timeIndex.value) {
    case 0: // 全部时间
      return true;
    case 1: // 近一周
      return publishTime >= oneWeekAgo;
    case 2: // 近一个月
      return publishTime >= oneMonthAgo;
    case 3: // 近三个月
      return publishTime >= threeMonthsAgo;
    case 4: // 更早
      return publishTime < threeMonthsAgo;
    default:
      return true;
  }
};

// 筛选器事件处理
const handleSearch = () => {
  // 搜索由computed自动触发本地筛选
};

const handleCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
  // 种类变化时重新请求接口（若需要服务端筛选）
  fetchSoldGoods();
};

const handleTimeChange = (e) => {
  timeIndex.value = e.detail.value;
  // 时间变化时仅本地筛选（也可根据需求改为重新请求接口）
};

// 页面卸载时移除监听
onUnmounted(() => {
  uni.$off('pageShow', fetchSoldGoods);
});
</script>

<style scoped>
.my-sold-page {
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

/* 加载状态样式 */
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

/* 空状态样式 */
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
  font-size: 28rpx;
}
</style>