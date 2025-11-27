<template>
  <view class="waterfall-container">
    <!-- 第一列：固定显示一张无文字图片 -->
    <view class="waterfall-column" :style="{ width: columnWidth }">
      <view class="waterfall-item fixed-first-item" :style="{ marginBottom: gap + 'rpx' }">
        <image
          class="waterfall-img"
          src="https://api.shaolezhuan.cn/lzphoto/command.jpg"  
          mode="widthFix"
          alt="固定推荐图片"
          :style="{ borderRadius: `${borderRadius}rpx` }"
        />
      </view>
      
      <!-- 第一列的其他瀑布流项目 -->
      <view
        class="waterfall-item"
        v-for="item in firstColumnItems"
        :key="item.id"
        :style="{ marginBottom: gap + 'rpx' }"
        @click="goToDetail(item.id,item.type)"
      >
        <image
          class="waterfall-img"
          :src="item.imgUrl"
          mode="widthFix"
          :alt="item.title"
          @load="handleImageLoad($event, item, 0)"
          @error="handleImageError(item)"
          :style="{ borderRadius: `${borderRadius}rpx ${borderRadius}rpx 0 0` }"
        />
        
        <view class="waterfall-content" :style="{ padding: `${contentPadding}rpx` }">
          <!-- 标签区域 -->
          <view class="tags" v-if="item.tags && item.tags.length > 0">
            <view class="tag-view" v-for="(tag, index) in item.tags" :key="index">
              <uni-tag 
                size="mini"
                :text="tag" 
                :type="getTagType(tag)" 
              />
            </view>
          </view>
          
          <text 
            class="waterfall-title" 
            :style="{ fontSize: `${titleSize}rpx`, marginTop: `${titleMarginTop}rpx` }"
          >
            {{ item.title }}
          </text>
          
          <!-- 价格信息 -->
          <text 
            class="price-text"
            :style="{ 
              fontSize: `${priceSize}rpx`, 
              marginTop: `${priceMarginTop}rpx`,
              color: priceColor
            }"
          >
            {{ item.type === '出物' ? '￥' : '￥' }}{{ item.price }}
          </text>
          
          <!-- 用户信息区域 -->
          <view class="user-info" :style="{ marginTop: `${userInfoMarginTop}rpx` }">
            <image 
              class="user-avatar" 
              :src="item.user?.avatar" 
              :style="{ 
                width: `${avatarSize}rpx`, 
                height: `${avatarSize}rpx`, 
                borderRadius: `${avatarSize / 2}rpx` 
              }"
              mode="widthFix"
            />
            <text 
              class="user-nickname" 
              :style="{ 
                fontSize: `${nicknameSize}rpx`, 
                marginLeft: `${nicknameMarginLeft}rpx` 
              }"
            >
              {{ item.user?.nickname || '未知用户' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他列：正常瀑布流排版 -->
    <view
      class="waterfall-column"
      v-for="(column, index) in otherColumns"
      :key="index + 1" 
      :style="{ width: columnWidth }"
    >
      <view
        class="waterfall-item"
        v-for="item in column"
        :key="item.id"
        :style="{ marginBottom: gap + 'rpx' }"
        @click="goToDetail(item.id, item.type)"
      >
        <image
          class="waterfall-img"
          :src="item.imgUrl"
          mode="widthFix"
          :alt="item.title"
          @load="handleImageLoad($event, item, index + 1)"
          @error="handleImageError(item)"
          :style="{ borderRadius: `${borderRadius}rpx ${borderRadius}rpx 0 0` }"
        />
        
        <view class="waterfall-content" :style="{ padding: `${contentPadding}rpx` }">
          <!-- 标签区域 -->
          <view class="tags" v-if="item.tags && item.tags.length > 0">
            <view class="tag-view" v-for="(tag, index) in item.tags" :key="index">
              <uni-tag 
                size="mini"
                :text="tag" 
                :type="getTagType(tag)" 
              />
            </view>
          </view>
          
          <text 
            class="waterfall-title" 
            :style="{ fontSize: `${titleSize}rpx`, marginTop: `${titleMarginTop}rpx` }"
          >
            {{ item.title }}
          </text>
          
          <!-- 价格信息 -->
          <text 
            class="price-text"
            :style="{ 
              fontSize: `${priceSize}rpx`, 
              marginTop: `${priceMarginTop}rpx`,
              color: priceColor
            }"
          >
            {{ item.type === '出物' ? '￥' : '￥' }}{{ item.price }}
          </text>
          
          <!-- 用户信息区域 -->
          <view class="user-info" :style="{ marginTop: `${userInfoMarginTop}rpx` }">
            <image 
              class="user-avatar" 
              :src="item.user?.avatar" 
              :style="{ 
                width: `${avatarSize}rpx`, 
                height: `${avatarSize}rpx`, 
                borderRadius: `${avatarSize / 2}rpx` 
              }"
              mode="widthFix"
            />
            <text 
              class="user-nickname" 
              :style="{ 
                fontSize: `${nicknameSize}rpx`, 
                marginLeft: `${nicknameMarginLeft}rpx` 
              }"
            >
              {{ item.user?.nickname || '未知用户' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import UniTag from '@dcloudio/uni-ui/lib/uni-tag/uni-tag.vue'; // 显式引入uni-tag

// 组件属性定义
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
    required: true
  },
  columnCount: {
    type: Number,
    default: 2,
    validator: (val) => val >= 1 && val <= 5
  },
  gap: {
    type: Number,
    default: 20
  },
  borderRadius: {
    type: Number,
    default: 10
  },
  contentPadding: {
    type: Number,
    default: 16
  },
  titleSize: {
    type: Number,
    default: 28
  },
  titleMarginTop: {
    type: Number,
    default: 8
  },
  // 价格相关属性
  priceSize: {
    type: Number,
    default: 26
  },
  priceMarginTop: {
    type: Number,
    default: 8
  },
  priceColor: {
    type: String,
    default: '#ff4d4f'
  },
  // 用户信息相关属性
  userInfoMarginTop: {
    type: Number,
    default: 12
  },
  avatarSize: {
    type: Number,
    default: 40
  },
  nicknameSize: {
    type: Number,
    default: 24
  },
  nicknameMarginLeft: {
    type: Number,
    default: 8
  }
});

// 根据标签内容获取类型
const getTagType = (tagText) => {
  if (tagText === '需求') {
    return 'warning';
  } else if (tagText === '可刀' || tagText === '不可刀') {
    return 'error';
  }
  return 'primary';
};

// 状态管理
const firstColumnItems = ref([]);
const otherColumns = ref([]);
const columnHeights = ref([]);
const imageSizes = ref({});

// 计算列宽度
const columnWidth = computed(() => {
  return `calc( (100% - ${(props.columnCount - 1) * props.gap}rpx) / ${props.columnCount} )`;
});

// 初始化列
const initColumns = () => {
  columnHeights.value = Array(props.columnCount).fill(0);
  columnHeights.value[0] = 300; // 第一列固定图片初始高度
  otherColumns.value = Array.from({ length: props.columnCount - 1 }, () => []);
  firstColumnItems.value = [];
  distributeItems();
};

// 分配数据到各列
const distributeItems = () => {
  // 过滤掉无效数据
  const validItems = props.list.filter(item => item && item.id);
  
  validItems.forEach(item => {
    const minIndex = columnHeights.value.indexOf(Math.min(...columnHeights.value));
    
    if (minIndex === 0) {
      firstColumnItems.value.push(item);
    } else {
      otherColumns.value[minIndex - 1].push(item);
    }
    
    // 更精准的高度预估
    const tagAdjustment = item.tags?.length > 1 ? (item.tags.length - 1) * 20 : 0;
    const baseHeight = item.type === '出物' ? 320 : 300;
    columnHeights.value[minIndex] += baseHeight + tagAdjustment;
  });
};

// 处理图片加载
const handleImageLoad = (e, item, columnIndex) => {
  const { width, height } = (e && e.detail) || {};
  if (width && height) {
    imageSizes.value[item.id] = { width, height };
    const imageRatio = height / width;
    const estimatedHeight = 300 * imageRatio; // 基于300rpx宽度计算
    const tagHeightAdjustment = item.tags?.length > 1 ? 20 : 0;
    const contentHeight = 120 + tagHeightAdjustment; // 内容区基础高度
    const totalHeight = estimatedHeight + contentHeight;
    columnHeights.value[columnIndex] = totalHeight;
  } else {
    // 无法获取尺寸时采用保守估计，不替换图片
    const tagHeightAdjustment = item.tags?.length > 1 ? 20 : 0;
    const contentHeight = 120 + tagHeightAdjustment;
    columnHeights.value[columnIndex] = 300 + contentHeight;
  }
};

const handleImageError = (item) => {
  // 加载失败时才使用默认图
  item.imgUrl = 'https://api.shaolezhuan.cn/lzphoto/productDefault.jpg';
};

// 点击商品跳转到详情页
const goToDetail = (id, type) => {
  const targetType = type || 'product';
  uni.navigateTo({
    url: `/pages/ProductDetail/ProductDetail?id=${id}&type=${targetType}`,
  });
};

// 监听属性变化
watch(
  () => [props.list, props.columnCount, props.gap],
  () => initColumns(),
  { deep: true, immediate: true }
);

// 组件挂载时初始化
onMounted(() => {
  initColumns();
});
</script>

<style scoped>
.waterfall-container {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 30rpx; /* 与父组件保持一致的左右边距 */
}

.waterfall-column {
  display: flex;
  flex-direction: column;
}

.waterfall-item {
  background-color: #ffffff;
  border-radius: 10rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

/* 固定的第一张图片样式 */
.fixed-first-item {
  background-color: transparent;
  box-shadow: none;
}

.fixed-first-item:hover {
  transform: none;
}

.waterfall-item:hover {
  transform: translateY(-2rpx);
}

.waterfall-img {
  width: 100%;
  display: block;
}

.waterfall-content {
  background-color: #ffffff;
}

/* 标签容器支持自动换行 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  padding-bottom: 4rpx;
}

.tag-view {
  margin: 0;
}

.waterfall-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
  color: #333333;
  line-height: 1.4;
}

.price-text {
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: block;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

.user-nickname {
  color: #666;
  font-size: 22rpx;
}
</style>