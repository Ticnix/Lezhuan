<template>
  <view class="waterfall-container">
    <!-- 瀑布流列 -->
    <view
      class="waterfall-column"
      v-for="(column, colIndex) in sortedColumns"
      :key="colIndex"
      :style="{ width: columnWidth }"
    >
      <view
        class="waterfall-item"
        v-for="item in column"
        :key="item.id"
        :style="{ 
          marginBottom: gap + 'rpx',
          // 置顶商品添加特殊样式标记
          borderTop: Number(item.adminPinScore) > 0 ? '4rpx solid #ff4d4f' : 'none'
        }"
        @click="goToDetail(item.id,item.type)"
      >
        <!-- 置顶标签（仅置顶商品显示） -->
        <view v-if="Number(item.adminPinScore) > 0" class="pinned-tag">
          <uni-tag text="置顶" type="error" size="mini" />
        </view>
        
        <image
          class="waterfall-img"
		  lazy-load
          :src="item.imgUrl"
          mode="widthFix"
          :alt="item.title"
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
          
          <text class="waterfall-title">{{ item.title }}</text>
          <text 
            class="waterfall-desc" 
            :style="{ 
              fontSize: `${descSize}rpx`, 
              marginTop: `${descMarginTop}rpx`,
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': descLineCount,
              overflow: 'hidden'
            }"
          >
            {{ item.desc }}
          </text>
          
          <!-- 价格显示（新增） -->
          <text class="price" :style="{ marginTop: `${priceMarginTop}rpx` }">
            ¥{{ item.price.toFixed(2) }}
          </text>
          
          <view class="user-info" :style="{ marginTop: `${userInfoMarginTop}rpx` }">
            <image 
              class="user-avatar" 
              :src="item.user.avatar" 
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
              {{ item.user.nickname }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { sanitizeImageUrl } from '@/utils/uniHelper';

const props = defineProps({
  // 商品列表（需包含 isAdminPinned 和 adminPinScore 字段）
  list: {
    type: Array,
    default: () => []
  },
  columnCount: {
    type: Number,
    default: 2
  },
  gap: {
    type: Number,
    default: 20 // 单位 rpx
  },
  borderRadius: {
    type: Number,
    default: 10 // 单位 rpx
  },
  contentPadding: {
    type: Number,
    default: 16 // 单位 rpx
  },
  titleSize: {
    type: Number,
    default: 28 // 单位 rpx
  },
  descSize: {
    type: Number,
    default: 24 // 单位 rpx
  },
  descMarginTop: {
    type: Number,
    default: 8 // 单位 rpx
  },
  descLineCount: {
    type: Number,
    default: 2 // 商品简介显示行数
  },
  priceMarginTop: {
    type: Number,
    default: 8 // 单位 rpx
  },
  userInfoMarginTop: {
    type: Number,
    default: 12 // 单位 rpx
  },
  avatarSize: {
    type: Number,
    default: 40 // 单位 rpx
  },
  nicknameSize: {
    type: Number,
    default: 24 // 单位 rpx
  },
  nicknameMarginLeft: {
    type: Number,
    default: 8 // 单位 rpx
  }
});

// 计算每列宽度（减去列间距）
const columnWidth = computed(() => {
  return `calc((100% - ${(props.columnCount - 1) * props.gap}rpx) / ${props.columnCount})`;
});

// 对传入列表进行域名清洗（图片与头像）
const sanitizedList = computed(() => {
  return (props.list || []).map(item => {
    const type = item.type === 'demand' ? 'demand' : 'product';
    return {
      ...item,
      imgUrl: sanitizeImageUrl(item.imgUrl || item.mainImageUrl, type),
      user: {
        avatar: sanitizeImageUrl(item?.user?.avatar, 'avatar'),
        nickname: item?.user?.nickname || '未知用户'
      }
    };
  });
});

// 按「adminPinScore」非0置顶，并按权重降序分配到列
const sortedColumns = computed(() => {
  if (sanitizedList.value.length === 0) return []; // 空数据直接返回
  // 1. 分离置顶商品和普通商品
  const pinnedItems = sanitizedList.value.filter(item => Number(item.adminPinScore) > 0); // 管理员置顶（权重非0）
  const normalItems = sanitizedList.value.filter(item => !(Number(item.adminPinScore) > 0)); // 其他（权重为0或空）

  // 2. 分别按权重降序排序（权重越高越靠前）
  const sortedPinned = [...pinnedItems].sort((a, b) => b.adminPinScore - a.adminPinScore);
  const sortedNormal = [...normalItems].sort((a, b) => b.adminPinScore - a.adminPinScore);

  // 3. 合并列表（置顶商品在前，普通商品在后）
  const sortedList = [...sortedPinned, ...sortedNormal];

  // 4. 分配到瀑布流列（优化：优先分配到当前高度最低的列，避免列高差异过大）
  const columns = Array.from({ length: props.columnCount }, () => []);
  const columnHeights = new Array(props.columnCount).fill(0); // 记录每列当前总高度

  sortedList.forEach(item => {
      const minHeight = Math.min(...columnHeights);
      const minIndex = columnHeights.indexOf(minHeight);
      
      columns[minIndex].push(item);
      // 替换为“固定高度 + 内容行数”的预估方式
      const itemHeight = 400 + (item.desc.split(' ').length / 10) * 20; // 示例公式，可根据实际调整
      columnHeights[minIndex] += itemHeight;
    });

  return columns;
});

// 根据标签内容获取类型
const getTagType = (tagText) => {
  if (tagText === '需求') {
    return 'warning';
  } else if (tagText === '可刀' || tagText === '不可刀') {
    return 'error';
  }
  return 'primary'; // 默认类型
};

// 点击商品跳转到详情页（传递id和type参数）
const goToDetail = (id, type) => {
  const targetType = type || 'product';
  uni.navigateTo({
    url: `/pages/ProductDetail/ProductDetail?id=${id}&type=${targetType}`,
  });
};
</script>

<style scoped>
.waterfall-container {
  display: flex;
  display: -webkit-flex; /* 兼容旧版微信小程序 */
  justify-content: space-between;
  -webkit-justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20rpx; /* 与父组件保持一致的左右边距 */
}

.waterfall-column {
  display: flex;
  flex-direction: column;
}

.waterfall-item {
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  position: relative; /* 用于置顶标签定位 */
}

/* 置顶标签位置 */
.pinned-tag {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  z-index: 2;
}

.waterfall-img {
  width: 100%;
  display: block;
  aspect-ratio: 1/1; /* 正方形图片，可根据需求调整 */
  object-fit: cover;
}

.waterfall-content {
  padding: 16rpx;
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
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  line-height: 1.3;
}

.waterfall-desc {
  color: #666;
  line-height: 1.4;
  display: block;
}

/* 价格样式 */
.price {
  display: block;
  color: #ff4d4f;
  font-size: 28rpx;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.user-avatar {
  display: block;
  object-fit: cover;
  border: 1rpx solid #f0f0f0;
}

.user-nickname {
  color: #666;
  font-size: 24rpx;
}
</style>