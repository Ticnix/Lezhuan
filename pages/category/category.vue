<template>
  <view class="category-page">
    <!-- 背景容器 -->
    <view
      class="background-container"
      :style="{
        backgroundImage: `url('/static/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        zIndex: 1
      }"
    >
      <!-- 状态栏占位 -->
      <view class="statusBar"></view>

      <!-- 搜索和筛选区域 -->
      <view class="search-filter-wrapper">
        <!-- 搜索区域 -->
        <view class="search-section">
          <view class="search-box">
            <uni-icons type="search" size="24" color="#999"></uni-icons>
            <input
              v-model="searchValue"
              class="search-input"
              placeholder="搜索任何商品..."
              @confirm="handleSearch"
            />
          </view>
        </view>

        <!-- 筛选区域 -->
        <view class="filter-section">
          <!-- 功能筛选 -->
          <view class="filter-item">
            <text class="filter-label">功能:</text>
            <picker
              mode="selector"
              :range="functionRange"
              :value="functionIndex"
              @change="handleFunctionChange"
              class="custom-picker"
            >
              <view class="picker-display">
                {{ functionRange[functionIndex] }}
                <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- 类型筛选 -->
          <view class="filter-item">
            <text class="filter-label">分类:</text>
            <picker
              mode="selector"
              :range="categoryOptions"
              :value="categoryIndex"
              @change="handleCategoryChange"
              class="custom-picker"
            >
              <view class="picker-display">
                {{ categoryOptions[categoryIndex] || '全部' }}
                <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- 价格筛选 -->
          <view class="filter-item">
            <text class="filter-label">价格:</text>
            <picker
              mode="selector"
              :range="priceOptions"
              :value="priceIndex"
              @change="handlePriceChange"
              class="custom-picker"
            >
              <view class="picker-display">
                {{ priceOptions[priceIndex] || '全部' }}
                <uni-icons type="down" size="18" color="#999" class="picker-icon"></uni-icons>
              </view>
            </picker>
          </view>
        </view>
      </view>
    </view>


    <!-- 初次加载骨架屏：首屏商品/需求任一列表在加载中时显示 -->
    <view v-if="isInitialLoading" class="skeleton-grid">
      <view v-for="n in 6" :key="n" class="skeleton-card">
        <view 
          class="skeleton-image"
          :style="{ height: (n % 3 === 0 ? '300rpx' : n % 3 === 1 ? '360rpx' : '330rpx') }"
        ></view>
        <view class="skeleton-title"></view>
        <view class="skeleton-price"></view>
        <view class="skeleton-user">
          <view class="skeleton-avatar"></view>
          <view class="skeleton-name"></view>
        </view>
      </view>
    </view>

    <!-- 空状态提醒：加载完成但无数据时显示 -->
    <view v-else-if="filteredGoods.length === 0" class="empty-reminder">
      暂无符合条件的商品，换个筛选条件试试吧~
    </view>

	<!-- 瀑布流商品展示 -->
	<view v-else>
	  <scroll-view
		class="scroll-container"
		ref="scrollRef"
		scroll-y
		@scroll="onScroll"
		:style="{ height: `calc(100vh - ${statusBarHeight + 300}rpx)` }"
	  >
		<Waterfall
		  :list="filteredGoods"
		  :columnCount="2"
		  :gap="20"
		  :virtual-scroll="true"
		  :visible-height="800"
		/>
		<!-- 加载更多骨架：在分页加载更多时显示 -->
		<view v-if="isLoadingMore" class="loading-skeleton">
		  <view class="skeleton-card">
		    <view class="skeleton-image" style="height: 320rpx;"></view>
		    <view class="skeleton-title"></view>
		    <view class="skeleton-price"></view>
		    <view class="skeleton-user">
		      <view class="skeleton-avatar"></view>
		      <view class="skeleton-name"></view>
		    </view>
		  </view>
		  <view class="skeleton-card">
		    <view class="skeleton-image" style="height: 340rpx;"></view>
		    <view class="skeleton-title"></view>
		    <view class="skeleton-price"></view>
		    <view class="skeleton-user">
		      <view class="skeleton-avatar"></view>
		      <view class="skeleton-name"></view>
		    </view>
		  </view>
		</view>
	  </scroll-view>

	  <!-- 真正拉到底的提醒 -->
	  <view v-if="!hasMoreGoods.value && !hasMoreDemand.value" class="bottom-reminder">
		已经到底啦~ 没有更多商品了
	  </view>
</view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import Waterfall from '@/components/Waterfall.vue';
import userApi from '@/api/user.js';
import productApi from '@/api/product.js';
import { sanitizeImageUrl } from '@/utils/uniHelper';

const userId = ref('');
const searchValue = ref('');
const functionRange = ref(['全部', '宝贝', '需求']); // 功能筛选范围
const functionIndex = ref(0); // 功能选中索引
const categoryOptions = ref([]); // 品类筛选选项
const categoryIndex = ref(0); // 品类选中索引
const currentType = ref(''); // 当前品类类型
const priceOptions = ref(['全部', '0-50元', '50-100元', '100-300元', '300-500元', '500元以上']); // 价格筛选范围
const priceIndex = ref(0); // 价格选中索引
const hasReachedBottom = ref(false); // 是否滚动到底部
const uglyGoodsList = ref([]);//直接在后端获取的没有清洗过的数据
const goodsList = ref([]);// 商品列表数据（已经清洗过的干净数据）
const uglyDemandList = ref([]);//没有清洗过的需求数据
//需求列表的请求体数据
const categoryId = ref(null); // 分类ID筛选
const status = ref(''); // 需求状态筛选
//清洗
const cleanedGoodsList = ref([]);
const cleanedDemandList = ref([]);
// 商品分页参数（独立）
const goodsPageNum = ref(1);
const goodsPageSize = ref(4);
const isLoadingGoods = ref(false);
const hasMoreGoods = ref(true);

// 需求分页参数（独立）
const demandPageNum = ref(1);
const demandPageSize = ref(4);
const isLoadingDemand = ref(false);
const hasMoreDemand = ref(true);

// 分层数据存储
const displayList = ref([]); // 最终展示数组（固定，仅增量拼接）
const goodsPageData = ref([]); // 商品已请求的所有分页数据（[[第1页], [第2页], ...]）
const demandPageData = ref([]); // 需求已请求的所有分页数据（[[第1页], [第2页], ...]）

// 预加载触发阈值（距离底部300rpx时触发）
const preloadThreshold = ref(300);
const scrollRef = ref(null); // 定义ref

// 价格区间映射
const priceRanges = {
  '0-50元': { min: 0, max: 50 },
  '50-100元': { min: 50, max: 100 },
  '100-300元': { min: 100, max: 300 },
  '300-500元': { min: 300, max: 500 },
  '500元以上': { min: 500, max: Infinity }
};

// 品类映射表（统一名称：虚拟物品；顺序不影响映射）
const categoryMap = {
  '电子数码': [ '电脑外设', '耳机音响', '手机平板', '智能设备', '其他'],
  '自行车': [ '普通自行车', '山地车', '公路自行车', '电动自行车', '其他'],
  '电器': ['吹风机', '干衣袋', '电灯风扇', '小厨具', '其他'],
  '体育用品': [ '各种球类', '各种球拍', '健身器材', '运动装备', '其他'],
  '二手书': ['大一教材', '大二教材', '大三教材', '小说漫画', '其他'],
  '生活用品': ['美容/护肤品', '服饰服装', '衣架/收纳', '椅子抱枕', '其他'],
  '虚拟物品': ['游戏账号', '陪玩代打', '数字会员', '线上课程', '其他'],
  '其他': ['学习用品', '手工制品', '宠物用品', '办公用品', '其他']
};

//动态获取状态栏高度（适配不同设备）
const statusBarHeight = ref(0);
const statusBarHeightRpx = ref(0);
onLoad((options) => {
  // 获取系统状态栏高度
  uni.getSystemInfo({
    success: (res) => {
      // 公式：px 值 * 750 / 屏幕宽度
      statusBarHeight.value = res.statusBarHeight * 750 / res.windowWidth;
    }
  });
  // 从路由参数获取当前品类类型
  if (options.type) {
    currentType.value = options.type;//当前品类类型
    generateCategoryOptions();
  }
});

// 分类名称 → 数据库ID 映射（与后台一致）
const categoryIdMap = {
  '电子数码': 1,
  '其他': 2,
  '生活用品': 3,
  '虚拟物品': 4,
  '自行车': 5,
  '体育用品': 6,
  '电器': 7,
  '二手书': 8
};

//获取商品/需求请求使用的分类ID
const getCategoryIdByType = () => {
  const id = categoryIdMap[currentType.value];
  return typeof id === 'number' ? id : -1;
};

onMounted(async () => {
  if (currentType.value) {
    fetchGoodsList(getCategoryIdByType(), false);
    fetchDemandList(false);
  }
  await nextTick(); // 确保 DOM 渲染完成
    // 验证 scroll-view 是否正确绑定
    if (scrollRef.value) {
      console.log('scroll-view 绑定成功');
	  console.log('scroll-view已渲染，元素：', scrollRef.value);
	  // 手动获取clientHeight（用于验证）
	  const query = uni.createSelectorQuery().in(scrollRef.value);
	  query.boundingClientRect((res) => {
		console.log('scroll-view实际高度：', res?.height); // 若有值，说明渲染正常
	  }).exec();
    } else {
      console.error('scroll-view ref 绑定失败，请检查拼写');
    }
	getClientHeight();
});

const getClientHeight = () => {
  // 延迟 300ms，确保动态高度渲染完成
  setTimeout(() => {
    uni.createSelectorQuery()
      .select('.scroll-container')
      .boundingClientRect(data => {
        if (data) {
          console.log('scroll-container clientHeight：', data.clientHeight);
        } else {
          console.error('未找到 .scroll-container 元素');
        }
      })
      .exec();
  }, 300);
};

watch([functionIndex, categoryIndex, priceIndex], () => {
  hasReachedBottom.value = false;
});

// 生成品类选项
const generateCategoryOptions = () => {
  // 从 categoryMap 中获取当前类型的子分类，作为筛选选项
  categoryOptions.value = ['全部', ...(categoryMap[currentType.value] || [])];
  categoryIndex.value = 0;
};

// 功能筛选变化回调
const handleFunctionChange = (e) => {
  functionIndex.value = e.detail.value;
  resetAndReload(); // 重置并重新加载
};

// 品类筛选变化回调
const handleCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
  resetAndReload();
};

// 价格筛选变化回调
const handlePriceChange = (e) => {
  priceIndex.value = e.detail.value;
  resetAndReload();
};

// 搜索回调
const handleSearch = () => {
  resetAndReload();
};

// 重置分页状态并重新加载第1页
const resetAndReload = () => {
  // 重置商品分页
  goodsPageNum.value = 1;
  goodsPageData.value = [];
  hasMoreGoods.value = true;
  // 重置需求分页
  demandPageNum.value = 1;
  demandPageData.value = [];
  hasMoreDemand.value = true;
  // 清空展示数组
  displayList.value = [];
  
  fetchGoodsList(getCategoryIdByType(), false);
  fetchDemandList(false);
};

// 监听滚动事件，实现预加载
const onScroll = (e) => {
  const clientHeight = 760;//这里直接写死了
  const { scrollTop, scrollHeight} = e.detail;
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;
 // console.log('距离底部：', distanceToBottom);
  
  //打印关键参数，确认滚动状态
  // console.log(
  //   '滚动参数：',
  //   'scrollTop:', scrollTop,
  //   'scrollHeight内容总高度:', scrollHeight,
  //   'clientHeight:', clientHeight,
  //   'distanceToBottom:', distanceToBottom
  // );
 
  // 调整触发条件：距离底部 < 阈值，且至少有一个列表还有更多数据
  if (
    distanceToBottom < preloadThreshold.value &&
    !isLoadingGoods.value &&
    !isLoadingDemand.value &&
    (hasMoreGoods.value || hasMoreDemand.value)
  ) {
    console.log('触发预加载');
    if (hasMoreGoods.value && !isLoadingGoods.value) {
      goodsPageNum.value += 1;
      fetchGoodsList(getCategoryIdByType(), true);
    }
    if (hasMoreDemand.value && !isLoadingDemand.value) {
      demandPageNum.value += 1;
      fetchDemandList(true);
    }
  }
};

// 封装请求商品列表的函数
const fetchGoodsList = async (categoryId, isLoadMore = false) => {
  if (isLoadingGoods.value || !hasMoreGoods.value) return;
  isLoadingGoods.value = true;

  try {
    const params = {
      categoryId,
      current: isLoadMore ? goodsPageNum.value : 1,
      size: goodsPageSize.value
    };
    console.log('商品列表请求参数：', params);
    const res = await productApi.getCategorie(params);
    
    if (res.code === 200) {
      const newPage = res.data.records || [];
      if (newPage.length === 0) {
        hasMoreGoods.value = false;
        return;
      }

      // 1. 存储原始分页数据（用于重置和复用）
      if (isLoadMore) {
        goodsPageData.value.push(newPage); // 加载更多：追加分页
      } else {
        goodsPageData.value = [newPage]; // 重新加载：重置为第1页
        goodsPageNum.value = 1;
      }

      // 2. 清洗新分页商品数据（复用已定义的 cleanGoodsSinglePage）
      const cleanedNewPage = await cleanGoodsSinglePage(newPage);

      // 3. 增量拼接：打乱新商品数据，拼到展示数组
      if (isLoadMore) {
        displayList.value = [...displayList.value, ...shuffleSingleList(cleanedNewPage)];
      } else {
        // 重新加载时，先放商品数据，再合并已有需求数据
        displayList.value = shuffleSingleList(cleanedNewPage);
        // 若需求已加载第1页，一起拼接（保证初始页面同时有商品和需求）
        if (demandPageData.value.length > 0) {
          const demandFirstPage = demandPageData.value[0];
          const cleanedDemandFirstPage = await cleanDemandSinglePage(demandFirstPage);
          displayList.value = [...displayList.value, ...shuffleSingleList(cleanedDemandFirstPage)];
        }
      }

      // 4. 判断是否还有更多商品
	  hasMoreGoods.value = newPage.length === goodsPageSize.value; 
    } else {
      uni.showToast({ title: res.message || '获取商品列表失败', icon: 'none' });
      hasMoreGoods.value = false;
    }
  } catch (error) {
    console.error('商品请求异常：', error);
    uni.showToast({ title: '网络异常', icon: 'none' });
    hasMoreGoods.value = false;
  } finally {
    isLoadingGoods.value = false;
  }
};

// 封装请求需求列表的函数
const fetchDemandList = async (isLoadMore = false) => {
  if (isLoadingDemand.value || !hasMoreDemand.value) return;
  isLoadingDemand.value = true;

  try {
    const params = {
      categoryId: getCategoryIdByType(),
      status: 'active',
      current: isLoadMore ? demandPageNum.value : 1,
      size: demandPageSize.value
    };
	console.log('需求列表请求参数：', params);
    const res = await productApi.getDemandList(params);
    
    if (res.code === 200) {
      const newPage = res.data.records || [];
      if (newPage.length === 0) {
        hasMoreDemand.value = false;
        return;
      }

      // 1. 存储原始分页数据
      if (isLoadMore) {
        demandPageData.value.push(newPage);
      } else {
        demandPageData.value = [newPage];
        demandPageNum.value = 1;
      }

      // 2. 清洗新分页数据
      const cleanedNewPage = await cleanDemandSinglePage(newPage);

      // 3. 增量拼接
      if (isLoadMore) {
        displayList.value = [...displayList.value, ...shuffleSingleList(cleanedNewPage)];
      } else {
        displayList.value = shuffleSingleList(cleanedNewPage);
        // 若商品已有第1页，一起拼接
        if (goodsPageData.value.length > 0) {
          const goodsFirstPage = goodsPageData.value[0];
          const cleanedGoodsFirstPage = await cleanGoodsSinglePage(goodsFirstPage);
          displayList.value = [...displayList.value, ...shuffleSingleList(cleanedGoodsFirstPage)];
        }
      }

      // hasMoreDemand.value = newPage.length >= demandPageSize.value;
	  hasMoreDemand.value = newPage.length === demandPageSize.value;
    } else {
      uni.showToast({ title: res.message || '获取需求列表失败', icon: 'none' });
      hasMoreDemand.value = false;
    }
  } catch (error) {
    console.error('需求请求异常：', error);
    uni.showToast({ title: '网络异常', icon: 'none' });
    hasMoreDemand.value = false;
  } finally {
    isLoadingDemand.value = false;
  }
};

// 单独清洗商品单个分页（复用逻辑）
const cleanGoodsSinglePage = async (pageData) => {
  const cleaned = await Promise.all(
    pageData.map(item => {
      let tags = [];
      let category = '其他';
      try {
        const attributesObj = JSON.parse(item.attributes || '{}');
        category = attributesObj.subcategory || attributesObj.category || '其他';
        tags = [
          item.isNegotiable ? '可刀' : '不可刀',
          attributesObj.category || '其他',
          attributesObj.subcategory || '其他',
          attributesObj.condition || '未知成色'
        ].filter(Boolean);
      } catch (err) {
        tags = [];
      }
      return {
        id: item.id,
        imgUrl: sanitizeImageUrl(item.mainImageUrl, 'product'),
        tags,
        title: item.title || '未知商品',
        desc: item.description || '',
        categoryName: item.categoryName,
        user:  { avatar: sanitizeImageUrl(item.sellerAvatarUrl, 'avatar'), nickname: item.sellerNickname }  || { avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg', nickname: '未知用户' },
        category: category,
        type: 'product',
        price: item.price || 0,
        status: item.status,
        adminPinScore: (Number(item.urgentPush) === 1 || item.urgentPush === true) ? 1 : 0,
        sortPriority: (Number(item.urgentPush) === 1 || item.urgentPush === true) ? 1 : 0,
        isAdminPinned: (Number(item.urgentPush) === 1 || item.urgentPush === true)
      };
    })
  );
  return cleaned.filter(item => item.status === 'active');
};

// 单独清洗需求单个分页（复用逻辑）
const cleanDemandSinglePage = async (pageData) => {
  const cleaned = await Promise.all(
    pageData.map(item => {
      return {
        id: item.id,
        imgUrl: sanitizeImageUrl(item.mainImageUrl, 'demand'),
        tags: ['需求'],
        title: item.title || '未知需求',
        desc: item.description || '',
        categoryName: currentType.value,
		user: item.requester || { avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg', nickname: '未知用户' },
        // user:  { avatar: sanitizeImageUrl(item.sellerAvatarUrl, 'avatar'), nickname: item.sellerNickname }  || { avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg', nickname: '未知用户' },
        category: currentType.value || '其他',
        type: 'demand',
        price: item.budget || 0,
        status: item.status,
        adminPinScore: (Number(item.urgentPush) === 1 || item.urgentPush === true) ? 1 : 0,
        sortPriority: (Number(item.urgentPush) === 1 || item.urgentPush === true) ? 1 : 0,
        isAdminPinned: (Number(item.urgentPush) === 1 || item.urgentPush === true)
      };
    })
  );
  return cleaned.filter(item => item.status === 'active');
};

// 单独打乱单个列表（仅打乱新数据）
const shuffleSingleList = (list) => {
  const newList = [...list];
  for (let i = newList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newList[i], newList[j]] = [newList[j], newList[i]];
  }
  return newList;
};

// 清洗商品数据时缓存attributes解析结果
const attributesCache = new Map(); // 缓存JSON解析结果

//筛选后的数据
const filteredGoods = computed(() => {
  let result = [...displayList.value];
  // 搜索筛选
  if (searchValue.value.trim()) {
    const keyword = searchValue.value.trim().toLowerCase();
    result = result.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(keyword);
      const descMatch = item.desc.toLowerCase().includes(keyword);
      return titleMatch || descMatch;
    });
  }

  // 功能筛选
  const selectedFunction = functionRange.value[functionIndex.value];
  if (selectedFunction && selectedFunction !== '全部') {
    const typeMap = { '宝贝': 'product', '需求': 'demand' };
    result = result.filter(item => item.type === typeMap[selectedFunction]);
  }

  // 品类筛选
  const selectedCategory = categoryOptions.value[categoryIndex.value];
  if (selectedCategory && selectedCategory !== '全部') {
    result = result.filter(item => {
      const itemTags = Array.isArray(item.tags) ? item.tags : [];
      return itemTags.includes(selectedCategory) || item.category === selectedCategory;
    });
  }

  // 价格筛选
  const selectedPrice = priceOptions.value[priceIndex.value];
  if (selectedPrice && selectedPrice !== '全部') {
    const range = priceRanges[selectedPrice];
    result = result.filter(item => {
      const itemPrice = Number(item.price) || 0;
      return itemPrice >= range.min && itemPrice < range.max;
    });
  }

  // 不再进行权重或价格排序，保留上游洗牌后的随机顺序
  return result;
});

// 计算：是否为首屏加载（任意一个列表正在加载第1页）
const isInitialLoading = computed(() => {
  return (goodsPageNum.value === 1 && isLoadingGoods.value) || (demandPageNum.value === 1 && isLoadingDemand.value);
});

// 计算：是否在加载更多（任意一个列表正在加载第2页及以上）
const isLoadingMore = computed(() => {
  return (goodsPageNum.value > 1 && isLoadingGoods.value) || (demandPageNum.value > 1 && isLoadingDemand.value);
});

</script>

<style scoped>
.category-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.background-container {
  min-height: 300rpx;
  position: relative;
  z-index: 1;
  padding: 16rpx;
  box-sizing: border-box;
}

.statusBar {
  height: 150rpx;
}

/* 搜索和筛选整体容器 */
.search-filter-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}

.search-section {
  flex: 1;
  min-width: 280rpx;
}

.search-box {
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  border: 1rpx solid #eee;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  margin-left: 10rpx;
  font-size: 28rpx;
}

/* 筛选区域 */
.filter-section {
  padding-left: 20rpx;
  display: flex;
  align-items: center;
  
  gap: 15rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  padding: 10rpx 16rpx;
  box-sizing: border-box;
}

.filter-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 8rpx;
}

.custom-picker {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #333;
}

.picker-icon {
  margin-left: 8rpx;
}

/* 空状态提醒样式 */
.empty-reminder {
  text-align: center;
  padding: 100rpx 20rpx;
  color: #999;
  font-size: 28rpx;
  background-color: #fff;
  margin: 20rpx 16rpx;
  border-radius: 10rpx;
}

/* 滚动到底提醒样式 */
.bottom-reminder {
  text-align: center;
  padding: 20rpx;
  color: #666;
  font-size: 26rpx;
  background-color: #f0f0f0;
  margin: 16rpx;
  border-radius: 8rpx;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 滚动容器样式 */
.scroll-container {
  width: 100%;
  overflow-y: auto;
}

/* 骨架屏样式 */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 0 16rpx 16rpx 16rpx;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 16rpx;
}

.skeleton-card {
  background-color: #ffffff;
  border-radius: 10rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
}

.skeleton-image,
.skeleton-title,
.skeleton-price,
.skeleton-avatar,
.skeleton-name {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-image {
  width: 100%;
}

.skeleton-title {
  height: 30rpx;
  margin: 20rpx 20rpx 12rpx 20rpx;
  border-radius: 8rpx;
}

.skeleton-price {
  height: 26rpx;
  margin: 0 20rpx 16rpx 20rpx;
  width: 40%;
  border-radius: 8rpx;
}

.skeleton-user {
  display: flex;
  align-items: center;
  padding: 0 20rpx 20rpx 20rpx;
  gap: 12rpx;
}

.skeleton-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
}

.skeleton-name {
  flex: 1;
  height: 24rpx;
  border-radius: 8rpx;
}

@keyframes skeleton-shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: 100% 0; }
}
</style>