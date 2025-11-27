<template>
  <view class="goods-list">
    <!-- 加载状态 -->
    <view class="loading-state" v-if="isLoading">
      <uni-icons type="loading" size="40" color="#7c89ff" spin></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 商品列表 -->
<view 
      class="goods-row" 
      v-else-if="sanitizedGoodsList.length > 0"
      v-for="goods in sanitizedGoodsList" 
      :key="goods.id"
    >
      <!-- 商品信息区域（点击跳转详情） -->
      <view class="goods-info" @click="handleItemClick(goods.id, goods.type)">
        <image :src="goods.imgUrl" mode="widthFix" class="goods-img"></image>
        
        <view class="goods-text-content">
          <!-- 商品标题 -->
          <view class="goods-title">{{ goods.title }}</view>
          
          <!-- 商品价格 -->
          <view class="goods-price">¥{{ goods.price.toFixed(2) }}</view>
          
          <!-- 商品属性标签 -->
          <view class="attributes-container">
            <view 
              v-for="(attr, index) in goods.attributes" 
              :key="index"
              :class="['attribute-tag', attr === '可刀' ? 'negotiable' : 'normal']"
            >
              {{ attr }}
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <uni-icons type="empty" size="60" color="#ccc"></uni-icons>
      <text class="empty-text">{{ emptyText || '暂无符合条件的商品' }}</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import { sanitizeImageUrl } from '@/utils/uniHelper';

// 定义组件接收的Props
const props = defineProps({
  /** 商品列表数据 */
  goodsList: {
    type: Array,
    required: true,
    default: () => []
  },
  /** 是否加载中 */
  isLoading: {
    type: Boolean,
    default: false
  },
  /** 空状态文本（可选，自定义空提示） */
  emptyText: {
    type: String,
    default: ''
  },
  /** 商品详情页路径（可选，默认为'/pages/ProductDetail/ProductDetail'） */
  detailPath: {
    type: String,
    default: '/pages/ProductDetail/ProductDetail'
  },
  /** 是否禁用点击跳转到详情 */
  disableNavigation: {
    type: Boolean,
    default: false
  }
});

// 统一清洗图片域名，避免非法域名导致图片无法加载
const sanitizedGoodsList = computed(() => {
  return (props.goodsList || []).map(item => {
    const inferredType = item?.type
      ? (item.type === 'demand' ? 'demand' : 'product')
      : (item?.function === '需求' ? 'demand' : 'product');
    return {
      ...item,
      type: inferredType,
      imgUrl: sanitizeImageUrl(item.imgUrl, inferredType)
    };
  });
});

// 定义组件触发的事件
const emit = defineEmits([
  'go-to-detail',    // 跳转商品详情前触发
  'navigate-success', // 跳转成功后触发
  'navigate-fail'     // 跳转失败时触发
]);

/** 跳转到商品详情页 */
const navigateToDetail = (id, type) => {
  emit('go-to-detail', id);
  const targetType = type === 'demand' ? 'demand' : 'product';
  uni.navigateTo({
    url: `${props.detailPath}?id=${id}&type=${targetType}`,
    success: () => emit('navigate-success', id),
    fail: (err) => {
      emit('navigate-fail', { id, error: err });
      console.error('跳转详情失败:', err);
    }
  });
};

/** 处理商品点击：支持禁用跳转 */
const handleItemClick = (id, type) => {
  if (props.disableNavigation) return; // 禁用跳转时直接返回
  navigateToDetail(id, type);
};

defineExpose({
  navigateToDetail
});
</script>

<style scoped>
/* 商品列表容器 */
.goods-list {
  padding: 0 20rpx;
}

/* 加载状态 */
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

/* 商品项行 */
.goods-row {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx;
  margin-bottom: 15rpx;
  min-height: 180rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.goods-row:active {
  transform: scale(0.99);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
}

/* 商品信息区域 */
.goods-info {
  display: flex;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
}

/* 商品图片 */
.goods-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 15rpx;
}

/* 商品文本内容 */
.goods-text-content {
  flex: 1;
  overflow: hidden;
}

/* 商品标题 */
.goods-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 商品价格 */
.goods-price {
  color: #F56C6C;
  font-weight: 600;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

/* 属性标签容器 */
.attributes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

/* 属性标签样式 */
.attribute-tag {
  padding: 3rpx 10rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

/* 可刀标签（红色） */
.attribute-tag.negotiable {
  background-color: #fff1f0;
  color: #f5222d;
}

/* 其他标签（蓝色） */
.attribute-tag.normal {
  background-color: #e6f7ff;
  color: #1890ff;
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
  margin-bottom: 40rpx;
  font-size: 28rpx;
}
</style>