<template>
  <view class="my-collection-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="nav-title">我的收藏</text>
    </view>
    
    <!-- 搜索和筛选区域 -->
    <view class="filter-container">
      <view class="search-box">
        <uni-icons type="search" size="24" color="#999" class="search-icon"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索收藏的商品..." 
          v-model="searchKeyword"
          @input="handleSearch"
          class="search-input"
        />
      </view>
      
      <view class="picker-container">
        <!-- 功能筛选 -->
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
              {{ functionRange[functionIndex].text }} <!-- 显示文本 -->
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
        
        <!-- 分类筛选 -->
        <view class="picker-item">
          <text class="picker-label">分类:</text>
          <picker 
            mode="selector"
            :range="categoryRange"
            :value="categoryIndex"
			:range-key="'text'"
            @change="handleCategoryChange"
            class="custom-picker"
          >
            <view class="picker-display">
               {{ categoryRange[categoryIndex].text }}  <!-- 显示text字段 -->
              <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
            </view>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 筛选加载状态 -->
    <view v-if="isFiltering" class="filter-loading">
      <uni-icons type="loading" size="24" color="#fff" spin></uni-icons>
      <text class="loading-text">筛选中...</text>
    </view>
    
    <!-- 筛选空状态 -->
    <view 
      v-if="!isEmpty && filteredCollections.length === 0 && !isFiltering" 
      class="filter-empty"
    >
      <uni-icons type="empty" size="60" color="#ccc"></uni-icons>
      <text class="empty-text">没有找到匹配的收藏商品</text>
      <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
    </view>
    
    <!-- 商品列表组件 -->
    <CommonGoodsList 
      v-if="!isFiltering"
      :goodsList="filteredCollections" 
      :showPrice="true"
      :showStatus="true"
      :emptyText="isEmpty ? '暂无收藏商品' : ''"
      :isBatchMode="false"
    />
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick,watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import CommonGoodsList from '@/components/CommonGoodsList.vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import userApi from '@/api/user.js';
import productApi from '@/api/product.js';
import { sanitizeImageUrl, ensureLoggedIn } from '@/utils/uniHelper';

// 基础状态管理
const searchKeyword = ref('');
const collections = ref([]);
const isEmpty = ref(false);
const isFiltering = ref(false);

// 筛选器配置
const functionRange = ref([
  { text: '全部', value: '' },   // 空值代表“不筛选”
  { text: '宝贝', value: '宝贝' },
  { text: '需求', value: '需求' }
]);
const categoryRange = ref([
  { text: '全部', value: '' } // 初始值，后续动态填充
]);

// 筛选器选中索引（新增：用ref单独存储筛选值，避免依赖range数组）
const selectedFunction = ref(''); // 存储选中的功能（空=全部）
const selectedCategory = ref(''); // 存储选中的分类（空=全部）
const functionIndex = ref(0); // 仅用于picker显示
const categoryIndex = ref(0); // 仅用于picker显示

// 页面初始化加载数据
onMounted(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看收藏', redirectTo: '/pages/mine/mine' })) return;
  loadCollectionData();
});

// 页面显示时刷新数据
onShow(() => {
  if (!ensureLoggedIn({ content: '登录后才能查看收藏', redirectTo: '/pages/mine/mine' })) return;
  loadCollectionData();
});

// 加载收藏数据（优化：确保分类range生成正确）
const loadCollectionData = async () => {
  uni.showLoading({ title: '加载中...', mask: true });
  try {
    const res = await userApi.getFavoriteList();
    if (res.code !== 200) {
      uni.showToast({ title: res.msg || '获取收藏失败', icon: 'none' });
      return;
    }

    // 拉取商品详情并统一格式
    const fullCollections = [];
    for (const item of res.data) {
      try {
        let detailData;
        if (item.itemType === 'product') {
          detailData = (await productApi.getProductDetail(item.itemId)).data;
        } else if (item.itemType === 'demand') {
          detailData = (await productApi.getDemandDetail(item.itemId)).data;
        } else continue;

        // 统一分类格式（避免空值）
        const itemCategory = (detailData.categoryName || '其他').trim() || '其他'; // 确保始终有值
        fullCollections.push({
          id: item.itemId.toString(),
          type: item.itemType,
          title: detailData.title || '未知标题',
          imgUrl: sanitizeImageUrl(
            detailData.mainImageUrl,
            item.itemType === 'product' ? 'product' : 'demand'
          ),
          price: item.itemType === 'product' ? (detailData.price || 0) : (detailData.budget || 0),
          function: item.itemType === 'product' ? '宝贝' : '需求',
          status: detailData.status || 'normal',
          category: itemCategory,
          description: detailData.description || ''
        });
      } catch (err) {
        console.error(`获取${item.itemType}(${item.itemId})详情失败:`, err);
      }
    }

    collections.value = fullCollections;
    isEmpty.value = collections.value.length === 0;

    // 生成分类下拉框（去重+排序）
    const uniqueCategories = [...new Set(
      collections.value.map(item => item.category).filter(cate => cate && cate.trim()) // 过滤空值和undefined
    )]
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
      .map(cate => ({ text: cate, value: cate }));
    categoryRange.value = [{ text: '全部', value: '' }, ...uniqueCategories];

    // 重置筛选状态（避免刷新数据后筛选残留）
    resetFilters(false); // false=不显示加载态

  } catch (err) {
    console.error('收藏加载失败:', err);
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
  } finally {
    uni.hideLoading();
  }
};

// 核心：筛选逻辑（直接依赖selectedXXX，空值即全部）
const filteredCollections = computed(() => {
  const result = collections.value.filter(item => {
    const matchFunc = !selectedFunction.value || item.function === selectedFunction.value;
    const matchCate = !selectedCategory.value || item.category === selectedCategory.value;
    const matchSearch = !searchKeyword.value.trim() || 
      item.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) || 
      item.description.toLowerCase().includes(searchKeyword.value.toLowerCase());
    
    // 新增：打印关键值，验证逻辑
    console.log('匹配逻辑：', {
      selectedFunction: selectedFunction.value,
      itemFunction: item.function,
      matchFunc: matchFunc
    });

    return matchFunc && matchCate && matchSearch;
  });
  console.log('筛选条件：', {
    selectedFunction: selectedFunction.value,
    selectedCategory: selectedCategory.value,
    searchKeyword: searchKeyword.value
  });
  console.log('筛选结果数量：', result.length);
  return result;
});

// 功能筛选切换
const handleFunctionChange = (e) => {
  isFiltering.value = true;
  const newIndex = e.detail.value;
  functionIndex.value = newIndex; 

  // 从对象中获取筛选值（空值代表“全部”）
  selectedFunction.value = functionRange.value[newIndex].value;

  nextTick(() => {
    setTimeout(() => isFiltering.value = false, 300);
  });
};

// 分类筛选切换
const handleCategoryChange = (e) => {
  isFiltering.value = true;
  const newIndex = e.detail.value;
  categoryIndex.value = newIndex; 

  // 从对象中获取筛选值（空值代表“全部”）
  selectedCategory.value = categoryRange.value[newIndex].value;

  nextTick(() => {
    setTimeout(() => isFiltering.value = false, 300);
  });
};

// 监听筛选条件变化，动态更新分类范围
watch([selectedFunction, selectedCategory, searchKeyword], () => {
  const uniqueCategories = [...new Set(collections.value.map(item => item.category))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map(cate => ({ text: cate, value: cate })); // 转换为对象格式
  categoryRange.value = [{ text: '全部', value: '' }, ...uniqueCategories];
}, { deep: true });

// 搜索筛选
const handleSearch = () => {
  isFiltering.value = true;
  nextTick(() => {
    setTimeout(() => isFiltering.value = false, 300);
  });
};

// 重置所有筛选条件（可控制是否显示加载态）
const resetFilters = (showLoading = true) => {
  if (showLoading) isFiltering.value = true;
  searchKeyword.value = '';
  functionIndex.value = 0;
  categoryIndex.value = 0;
  selectedFunction.value = ''; 
  selectedCategory.value = ''; 

  // 强制刷新分类范围
  const uniqueCategories = [...new Set(collections.value.map(item => item.category))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map(cate => ({ text: cate, value: cate }));
  categoryRange.value = [{ text: '全部', value: '' }, ...uniqueCategories];

  if (showLoading) {
    nextTick(() => {
      setTimeout(() => isFiltering.value = false, 300);
    });
  }
};

onUnmounted(() => {});
</script>

<style scoped>
.my-collection-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
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
  scrollbar-width: none;
}

.picker-container::-webkit-scrollbar {
  display: none;
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

.filter-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.filter-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #ccc;
}

.empty-text {
  margin: 20rpx 0 30rpx;
  font-size: 28rpx;
  text-align: center;
}

.reset-btn {
  background-color: #f5f5f5;
  color: #666;
  font-size: 26rpx;
  padding: 0 30rpx;
  height: 60rpx;
  border-radius: 30rpx;
}
</style>