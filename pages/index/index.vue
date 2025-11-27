<template>
    <!-- 遮罩层 -->
    <view class="modal-mask" v-if="showNoticeModal"></view>
    <!-- 弹窗容器 -->
    <view class="modal-container" v-if="showNoticeModal">
      <view class="modal-title">公告</view>
      <view class="modal-content">
        商品/需求发布审核工作时间为8:00-22:00，为保障用户的使用体验和交易安全，我们会进行严格审核，非工作时段发布的商品审核将有所延缓，请谅解！
      </view>
      <view class="modal-buttons">
        <button class="modal-btn" @click="close">关闭</button>
        <button class="modal-btn modal-btn-primary" @click="goTo">前往</button>
      </view>
    </view>
  <view class="container">
    <!-- 背景容器 -->
    <view class="background-container" :style="{ 
      backgroundImage: `url('https://api.shaolezhuan.cn/lzphoto/indextop.jpg')`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      position: 'relative' 
    }">

      <!-- 状态栏占位 -->
      <view class="statusBar" :style="{ height: statusBarHeight + 'px' }"></view>
        
      <!-- 顶部导航栏 -->
      <view 
        class="top-bar" 
        :style="{ 
          top: statusBarHeight + 'px', 
          height: titleBarHeight + 'px' 
        }"
      >
        <image class="logo" src="https://api.shaolezhuan.cn/lzphoto/logo.jpg" mode="widthFix" alt="应用logo"></image>
        <text class="app-name">趣乐转</text>
      </view>

      <!-- 通知区 -->
      <view class="notice">
        <!-- 通知按钮 -->
        <view class="notice-btn" @click="handleNotice">
          <view class="notice-icon-wrapper">
            <uni-icons type="notification" size="24" color="#007aff" class="notice-icon"></uni-icons>
			<text class="notice-text">通知</text>
          </view>
          
          <!-- 滚动通知内容（水平跑马灯） -->
            <view class="center">
              <view class="marquee">
                <navigator url="/pages/notice/detail" class="marquee-content" hover-class="notice-link-hover">
                  {{ marqueeText }}
                </navigator>
              </view>
            </view>
          
          <!-- 右侧箭头 -->
          <view class="right">
            <uni-icons type="right" size="16" color="#333"></uni-icons>
          </view>
        </view>
      </view>
    </view>

	<!-- 分类区域：加载中显示骨架，加载后显示真实分类 -->
	<view class="categories-section">
	  <template v-if="!isLoading">
	    <view class="categories-row">
		  <view class="category-item" v-for="(item, index) in categoriesTop" :key="index" @click="handleCategoryClick(item.name)">
		    <image class="category-icon" :src="item.icon" mode="aspectFit" alt="分类图标"></image>
		    <text class="category-name">{{ item.name }}</text>
		  </view>
	    </view>
	    <view class="categories-row">
		  <view class="category-item" v-for="(item, index) in categoriesBottom" :key="index" @click="handleCategoryClick(item.name)">
		    <image class="category-icon" :src="item.icon" mode="aspectFit" alt="分类图标"></image>
		    <text class="category-name">{{ item.name }}</text>
		  </view>
	    </view>
	  </template>
	  <view v-else class="categories-skeleton">
	    <view class="category-skeleton-item" v-for="n in 8" :key="n">
	      <view class="skeleton-icon"></view>
	      <view class="skeleton-label"></view>
	    </view>
	  </view>
	</view>
 
    <!-- 轮播图 -->
    <view class="swiper-wrapper">
      <swiper 
        class="home-swiper" 
        indicator-dots 
        indicator-color="#ffffff"
        indicator-active-color="#007aff"
        autoplay 
        circular
        interval="3000"
      >
        <swiper-item v-for="(slide, index) in swiperList" :key="index">
          <image 
            :src="slide.imageUrl" 
            mode="widthFix" 
            class="swiper-image"
            :alt="`轮播图${index + 1}`"
            @click="handleSlideClick(slide)"
          ></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 推荐板块 -->
    <view class="recommend-content">
      <!-- 骨架屏：数据加载时显示 -->
      <view v-if="isLoading" class="skeleton-grid">
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

      <!-- 瀑布流展示：仅在加载完成且有数据时显示 -->
      <Waterfall 
        v-else-if="filteredRecommendList.length > 0"
        :list="filteredRecommendList" 
        :columnCount="2" 
        :gap="16"
        :borderRadius="8"
      />

      <!-- 空状态提醒：加载完成但无数据 -->
      <view v-else class="empty-reminder">
        暂无推荐商品，敬请期待~
      </view>
      
      <!-- 滚动到底提醒：加载完成后才展示 -->
      <view v-if="!isLoading && hasReachedBottom" class="bottom-reminder">
        已经到底啦~ 没有更多推荐商品了
      </view>
    </view>
    
    <!-- 底部占位 -->
    <view class="statusBar" :style="{ height: statusBarHeight*6 + 'px' }"></view>
    
  </view>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue';
import { showToast, sanitizeImageUrl } from '@/utils/uniHelper';
import { onLoad, onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app';
import Waterfall from '@/components/Waterfall-one.vue'; 
import { 
  getStatusBarHeight, 
  getTitleBarHeight,
  getNavBarHeight,
} from '@/utils/system.js';
import userApi from '@/api/user.js';
import productApi from '@/api/product.js';
import noticeApi from '@/api/notice.js';

// 导航相关高度数据
const statusBarHeight = ref(0); 
const titleBarHeight = ref(0); 
const navBarHeight = ref(0); 

//清洗数据
const okGoodsList = ref({}); 

// 分类数据（含图标路径）
const categoriesTop = ref([
  { name: '电子数码', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/digital.png' },
  { name: '自行车', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/bicycle.png' },
  { name: '电器', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/appliance.png' },
  { name: '体育用品', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/sports.png' }
]);

const categoriesBottom = ref([
  { name: '二手书', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/books.png' },
  { name: '生活用品', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/life.png' },
  { name: '虚拟物品', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/virtualgoods.png' },
  { name: '其他', icon: 'https://api.shaolezhuan.cn/lzphoto/category-icons/others.png' }
]);
// 轮播图数据
const swiperList = ref([
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/banners/b1.jpg' },
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/banners/b2.jpg' },
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/banners/b3.jpg' },
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/membership/m4.jpg', link: '/pages/promo/promo' }
]);

// 通知数据
const notices = ref([
  { content: '限时活动：加客服微信免费领会员：qlzkf1 ' },
]);

// 跑马灯文本：将所有通知拼接为一行
const marqueeText = computed(() => notices.value.map(n => n.content).join('    '));

// 原始数据存储
const uglyGoodsList = ref([]); // 未清洗的商品数据
const uglyDemandList = ref([]); // 未清洗的需求数据
const cleanedGoodsList = ref([]); // 清洗后的商品数据
const cleanedDemandList = ref([]); // 清洗后的需求数据
const allRecommendList = ref([]); // 合并后的所有数据（含商品+需求）

// 是否滚动到底部
const hasReachedBottom = ref(false);

const showNoticeModal = ref(false);
// 首页加载骨架屏状态
const isLoading = ref(true);


// 生命周期钩子
onMounted(() => {
  statusBarHeight.value = getStatusBarHeight();
  titleBarHeight.value = getTitleBarHeight();
  navBarHeight.value = getNavBarHeight();
  // 高度计算完成，进入页面由 onShow 触发一次数据刷新
});

// 进入首页页面时刷新推荐数据（每次显示都会执行一次）
onShow(() => {
  fetchRecommendData();
});

// 配置转发到好友的分享内容
onShareAppMessage(() => ({
  title: '趣乐转｜校园闲置好物',
  path: '/pages/index/index',
  imageUrl: 'https://api.shaolezhuan.cn/lzphoto/logo.jpg'
}));

// 配置分享到朋友圈的内容
onShareTimeline(() => ({
  title: '趣乐转｜发现闲置好物',
  query: '',
  imageUrl: 'https://api.shaolezhuan.cn/lzphoto/logo.jpg'
}));

const handleNotice = () => {
  showNoticeModal.value = true; // 点击通知时显示弹窗
};

// 点击分类跳转
const handleCategoryClick = (category) => {
  showToast(`点击了${category}分类`);
  uni.navigateTo({ url: `/pages/category/category?type=${category}` });
};

// 点击轮播图：仅当配置了 link 时进行跳转
const handleSlideClick = (slide) => {
  if (slide && slide.link) {
    uni.navigateTo({ url: slide.link });
  }
};

// 监听页面滚动到底部
onReachBottom(() => {
  hasReachedBottom.value = true;
  // 5秒后自动隐藏底部提示
  setTimeout(() => {
    hasReachedBottom.value = false;
  }, 5000);
});

// 接收父组件的显示控制
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 向父组件发射事件
const emit = defineEmits(['close', 'goTo'])

// 关闭弹窗
const close = () => {
 showNoticeModal.value = false;
}

// 前往操作
const goTo = () => {
  showNoticeModal.value = false;
  // 使用绝对路径，避免在 H5/小程序相对路径解析异常
  uni.navigateTo({ url: '/pages/promo/promo' });
}

// 1. 请求推荐数据（商品+需求）
const fetchRecommendData = async () => {
  try {
    isLoading.value = true; // 开始加载，显示骨架屏
    // 并行请求商品和需求数据
    const [goodsRes, demandRes] = await Promise.all([
      productApi.getAllGoods(), // 假设该接口获取所有商品
      productApi.getAllDemands() // 假设该接口获取所有需求
    ]);
	
	console.log('接口获取的所有商品数据',goodsRes)
	console.log('接口获取的所有需求数据',demandRes)
    
    // 处理商品数据
    if (goodsRes.code === 200) {
      uglyGoodsList.value = goodsRes.data || [];
	  await cleanGoodsList();
	  console.log('脏的商品数据：',uglyGoodsList.value)
    } else {
      showToast('获取商品数据失败');
    }
    
    // 处理需求数据
    if (demandRes.code === 200) {
      uglyDemandList.value = demandRes.data|| [];
      await cleanDemandList(); // 清洗需求数据
	  console.log('脏的需求数据：',uglyDemandList.value)
    } else {
      showToast('获取需求数据失败');
    }
    
	mergeAllLists();
  } catch (error) {
    console.error('获取推荐数据失败：', error);
    showToast('网络异常，获取推荐数据失败');
  } finally {
    isLoading.value = false; // 加载结束，隐藏骨架屏
  }
};

// 2. 清洗商品数据
const cleanGoodsList = async () => {
  const tempGoodsList = await Promise.all(
    uglyGoodsList.value.map(async (item) => {
      // 处理标签
      let tags = [];
      try {
        const attributesObj = JSON.parse(item.attributes || '{}');
        tags = Object.values(attributesObj);
        tags.unshift(item.isNegotiable ? '可刀' : '不可刀');
      } catch (err) {
        console.error('解析商品属性失败:', err);
        tags = [];
      }
      
      // 获取用户信息
      const user = await getUserInfoByUserId(item.sellerId);
      
      return {
        id: item.id,
        // 兼容后端可能返回 imgUrl 或 mainImageUrl 两种命名
        imgUrl: sanitizeImageUrl(item.mainImageUrl || item.imgUrl, 'product'),
        tags,
        title: item.title || '未知商品',
        desc: item.description || '',
        categoryName: item.categoryName || '其他',
        user: user || { avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg', nickname: '未知用户' },
        type: 'product',
        price: item.price || 0,
        isRecommended: item.isHomepageFeatured , // 是否推荐（核心字段）
        recommendPriority: item.adminPinScore || 0 // 推荐权重（核心字段）
      };
    })
  );
  console.log('未筛选推荐的商品数据：',tempGoodsList)
  // 筛选出推荐的商品
  cleanedGoodsList.value = tempGoodsList.filter(item => item.isRecommended);
  console.log('干净的商品数据：',cleanedGoodsList.value)
};

// 3. 清洗需求数据
const cleanDemandList = async () => {
  const tempDemandList = await Promise.all(
    uglyDemandList.value.map(async (item) => {
      // 处理标签
      let tags = [];
      try {
        const attributesObj = JSON.parse(item.attributes || '{}');
        tags = Object.values(attributesObj);
      } catch (err) {
        console.error('解析需求属性失败:', err);
        tags = [];
      }
	  
      return {
        id: item.id,
        // 兼容后端可能返回 imgUrl 或 mainImageUrl 两种命名
        imgUrl: sanitizeImageUrl(item.mainImageUrl || item.imgUrl, 'demand'),
        tags: ['需求', ...tags],
        title: item.title || '未知需求',
        desc: item.description || '',
        categoryName: item.categoryName || '其他',
        user: item.requester
          ? { avatar: sanitizeImageUrl(item.requester.avatar, 'avatar'), nickname: item.requester.nickname || '未知用户' }
          : { avatar: 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg', nickname: '未知用户' },
        type: 'demand',
        price: item.budget || 0,
        isRecommended: item.isHomepageFeatured || true, // 是否推荐（核心字段）
        recommendPriority: item.adminPinScore || 0 // 推荐权重（核心字段）
      };
    })
  );
  
  // 筛选出推荐的需求
  cleanedDemandList.value = tempDemandList.filter(item => item.isRecommended);
  console.log('干净的需求数据：',cleanedDemandList.value)
};

//随机混合函数（把两种干净数据打乱）
function shuffleMergeLists(list1, list2) {
  // 先合并两个列表
  const merged = [...list1, ...list2];
  
  // 随机打乱顺序（Fisher-Yates 洗牌算法）
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]]; // 交换元素
  }
  
  return merged;
}

const mergeAllLists = () => {
  const mixedList = shuffleMergeLists(cleanedGoodsList.value, cleanedDemandList.value);
  allRecommendList.value = mixedList; // 此时赋值给外部的响应式变量
  // 移除权重排序，保持随机顺序，避免序列号靠前的长期在前
  console.log('混合后的最终列表：', allRecommendList.value);
};

// 5. 计算属性：仅展示推荐的商品/需求（这里主要用于空状态判断，实际已在清洗时筛选）
const filteredRecommendList = computed(() => {
  // 双重保险：再次筛选推荐商品，避免遗漏
  return allRecommendList.value.filter(item => item.isRecommended);
});

// 辅助函数：获取用户信息
const getUserInfoByUserId = async (userId) => {
  try {
    const res = await userApi.getUserInfo(userId);
    if (res.code === 200) {
      return {
        avatar: sanitizeImageUrl(res.data.avatar, 'avatar'),
        nickname: res.data.nickname || '未知用户'
      };
    }
    return null;
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return null;
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.statusBar {
  width: 100%;
  z-index: 99;
}

/* 顶部导航栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  z-index: 10;
  align-items: center;
  padding: 0 20rpx;
  background-color: transparent; 
}

.logo {
  width: 60rpx;
  height: 60rpx;
  margin-right: 15rpx;
  border-radius: 50%;
}

.picBar{
  height: 70px;
  background-color: pink;
}

.notice {
  margin-top: 350rpx;
  margin-bottom: 20rpx;
}

.notice-btn {
  display: flex;
  flex: 1;
  align-items: center;
  background-color: transparent; 
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-icon-wrapper {
  display: flex;
  align-items: center;
  min-width: 120rpx;
}

.notice-text {
  color: #007aff;
  font-size: 28rpx;
  margin-left: 8rpx;
}

.center {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 40rpx;
}

.notice-swiper {
  height: 100%;
}

.notice-link {
  color: #333333;
  font-size: 26rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  height: 100%;
  line-height: 40rpx;
}

.notice-link-hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.right {
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
}

.app-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.more-btn {
  font-size: 28rpx;
  color: #666666;
  margin-right: 20rpx;
}

.notice-btn {
  display: flex;
  margin: 20rpx 30rpx;
  padding: 20rpx;
  margin-top: 15rpx;
  background-color: #e8f3ff;
  border-radius: 10rpx;
  text-align: center;
  color: #007aff;
  font-size: 28rpx;
  border-radius: 10rpx;
  gap: 10rpx;
}

/* 跑马灯样式 */
.marquee {
  width: 100%;
  overflow: hidden;
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%;
  animation: marquee 16s linear infinite;
  color: #333333;
  font-size: 26rpx;
  line-height: 40rpx;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* 分类区域 */
.categories-section {
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  margin-bottom: 10rpx;
}

.categories-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.categories-row:last-child {
  margin-bottom: 0;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10%; /* 保持圆形风格，可根据需求调整 */
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 26rpx;
  color: #333333;
}

/* 分类骨架屏 */
.categories-skeleton {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.category-skeleton-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  margin-bottom: 30rpx;
}

.skeleton-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10%;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-label {
  width: 72rpx;
  height: 26rpx;
  margin-top: 10rpx;
  border-radius: 6rpx;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

/* 轮播图 */
.swiper-wrapper {
  padding: 0 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 1rpx 2rpx 3rpx rgba(0, 0, 0, 0.05);
}

.home-swiper {
  width: 100%;
  height: 300rpx;
  border-radius: 15rpx;
  overflow: hidden;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.arrow-icon {
  width: 30rpx;
  height: 30rpx;
}

.recommend-more {
  font-size: 26rpx;
  color: #007aff;
}

/* 推荐内容 */
.recommend-content {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 骨架屏样式 */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 0 16rpx 16rpx 16rpx;
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

/* 未读数量标记 */
.unread-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 调整通知图标容器的定位，使未读标记显示正常 */
.notice-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 120rpx;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 500rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  z-index: 1000;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}

.modal-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30rpx;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
}

.modal-btn {
  width: 45%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.modal-btn-primary {
  background: #ff6b6b;
  color: #fff;
}
</style>