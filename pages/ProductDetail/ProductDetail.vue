<template>
  <view class="product-detail-page">
    <!-- 用户信息 -->
    <view class="seller-info-container">
      <image 
        :src="detail?.requester?.avatar || detail?.sellerAvatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg'" 
        mode="widthFix" 
        class="seller-avatar"
      ></image>
      <text class="seller-name">
	   {{ detail?.requester?.nickname || detail?.sellerNickname || '未知用户' }}
	  </text>
      <view class="credit-tag">
	  {{ detailType === 'demand' 
	  		? (detail?.requester?.credittag || '买家信用优秀') 
	  		: (detail?.user?.credittag || '卖家信用优秀') 
	  }}
	  </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <!-- 价格 -->
      <view class="price-container">
		<text v-if="type==='demand'" class="name">预算:</text>
        <text class="price-symbol">¥</text>
        <text class="price">
		   {{ detailType === 'demand' ? (detail?.budget || '0.00') : (detail?.price || '0.00') }}
		</text>
        <text class="original-price" v-if="detailType === 'product' && detail?.originalPrice">
            ¥{{ detail?.originalPrice }}
        </text>
      </view>
      
	  <!-- 可刀展示 -->
	  <div class="discount-tag" v-if="detailType === 'product' && detail?.isNegotiable">
	    <span class="bold-text">小刀优惠</span> 
		最高可刀 ¥{{ detail?.maxNegotiableAmount || 0 }}
	  </div>
	  
      <!-- 标题 -->
      <text class="product-title" >{{ detail?.title || '商品标题' }}</text>
    </view>

    <!-- 商品详情 -->
    <view class="product-detail-section">
      <view class="section-title">
		  {{ detailType === 'demand' ? '需求详情' : '商品详情' }}
	  </view>
      <view class="detail-content">
        <text class="product-desc">{{ detail?.description || detail?.desc || '暂无描述' }}</text>
        
        <!-- 详情图片 -->
        <view class="detail-images" v-if="detailType !== 'demand' && allProductImages.length">
           <image 
             v-for="(img, index) in allProductImages" 
             :key="index"
             :src="img" 
             mode="widthFix" 
             class="detail-image"
             @click="previewImages(index)"
           ></image>
        </view>
      </view>
    </view>

    <!-- 商家信息及在售商品 -->
    <view class="seller-section">
      <view class="section-title">
		  {{ detailType === 'demand' ? '发布者信息' : '商家信息' }}
	  </view>
      
      <!-- 商家信息 -->
      <view class="seller-info">
        <image 
          :src="detail?.requester?.avatar || detail?.sellerAvatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg'" 
          mode="widthFix" 
          class="seller-avatar-large"
        ></image>
        <view class="seller-details">
          <text class="seller-name">{{ detail?.requester?.nickname || detail?.sellerNickname || '未知用户' }}</text>
          <text class="seller-goods-count">
			  {{ detailType === 'demand' 
				? `发布 ${sellerDemands.length} 条需求` 
				: `在售 ${sellerProducts.length} 件商品` 
			  }}
		  </text>
        </view>
		  <view class="action-buttons">
		    <button class="report-btn" @click="showReportDialog = true" >
		      举报
		    </button>
		    <button class="contact-seller" @click="goToChat()" >聊一聊</button>
		  </view>
      </view>
      
	    <!-- 举报弹窗 -->
	    <view class="report-dialog" v-if="showReportDialog">
	      <view class="dialog-mask" @click="showReportDialog = false"></view>
	      <view class="dialog-content">
	        <view class="dialog-title">提交举报</view>
	        <view class="dialog-form">
	          <text class="form-label">举报原因</text>
	          <textarea 
	            v-model="reportReason" 
	            class="form-input" 
	            placeholder="请输入举报原因（必填）"
	            auto-height
	          ></textarea>
	        </view>
	        <view class="dialog-footer">
	          <button class="cancel-btn" @click="showReportDialog = false">取消</button>
	          <button class="confirm-btn" @click="submitReport">提交</button>
	        </view>
	      </view>
	    </view>
	  
      <!-- 商家在售商品 -->
      <view class="seller-goods">
        <view class="seller-goods-title">
			{{ detailType === 'demand' ? '该发布者其他需求' : '该商家其他商品' }}
		</view>
        
        <view class="goods-scroll-container">
          <scroll-view class="goods-scroll" scroll-x>
            <view class="goods-list" v-if="Array.isArray(getCurrentRelatedList())">
              <navigator
                v-for="(item, index) in getCurrentRelatedList()" 
                :key="item.id"
                :url="`/pages/ProductDetail/ProductDetail?id=${item.id}&type=${detailType}`"
                class="goods-item"
				@click="goToDetail(item.id, detailType)"
              >
                <image 
                  :src="item.imgUrl || 'https://api.shaolezhuan.cn/lzphoto/productDefault.jpg'" 
                  mode="aspectFill" 
                  class="goods-image"
                ></image>
                <text class="goods-price">
					¥{{ detailType === 'demand' ? item.budget : item.price }}
				</text>
              </navigator>
              
              <view class="no-more-seller-goods" v-if="getCurrentRelatedList().length === 0">
                 {{ detailType === 'demand' ? '该发布者暂无其他需求' : '该商家暂无其他商品' }}
              </view>         
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 逛了又逛 -->
    <view class="recommendation-section">
      <view class="section-title">逛了又逛</view>
      <Waterfall
        :list="detailType === 'demand' ? demandRecommendations : goodsRecommendations"
        :columnCount="2"
        :gap="20"
      />
	  <!-- 滚动到底提醒 -->
	  <view v-if="hasReachedBottom" class="bottom-reminder">
	    已经到底啦~ 没有更多推荐商品了
	  </view>
    </view>
	
	<!-- 状态栏占位 -->
	<view class="statusBar" ></view>

	<!-- 底部操作栏 -->
	<view class="bottom-bar">
	  <!-- 收藏按钮容器 -->
	  <view class="collect-btn-container">
		<!-- uni-fav 组件使用 -->
		<uni-fav 
		  :checked="isCollected"  
		  class="favBtn" 
		  circle="true"  
		  bgColor="#f5f5f5"  
		  bgColorChecked="#ff4d4f" 
		  color="#666"  
		  colorChecked="#fff" 
		  size="24"  
		  @click="toggleCollect" 
		/>
	  </view>
	  <!-- 聊一聊按钮 -->
	  <button class="chat-btn" @click="goToChat()" >
		<text>聊一聊</text>
	  </button>
	</view>
	
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { onReachBottom, onLoad } from '@dcloudio/uni-app';
import Waterfall from '@/components/Waterfall.vue';
import productApi from '@/api/product.js';
import userApi from '@/api/user.js';
import { sanitizeImageUrl, ensureLoggedIn, ensureStudentCertified, ensureMembership } from '@/utils/uniHelper';

// 1. 核心数据存储
const detail = ref({}); // 统一存储需求/商品数据
const isCollected = ref(false); // 通用：收藏状态
const hasReachedBottom = ref(false); // 通用：滚动到底标记
const uglyDemandList = ref([]);
const uglyGoodsList = ref([]);
const demandRecommendations = ref([]); // 单独存储需求推荐
const goodsRecommendations = ref([]);  // 单独存储商品推荐
const sellerDemands = ref([]);//需求专属：商家其他需求
const sellerProducts = ref([]); // 商品专属：商家其他商品
const showReportDialog = ref(false);// 举报弹窗状态
const reportReason = ref('');// 举报原因
// const currentRelatedList = computed(() => {
//   return detailType === 'demand' ? sellerDemands.value : sellerProducts.value;
// });
// const currentRelatedList= () => {
//   return getCurrentRelatedList();
// };
// 记录浏览开始时间和是否已提交
const hasReported = ref(false); // 避免重复提交

let detailId = '';
let detailType = '';

const getCurrentRelatedList = () => {
  // 实时判断类型，返回对应的列表
  if (detailType === 'demand') {
    return sellerDemands.value;
  } else {
    return sellerProducts.value;
  }
};

const type=ref()
onLoad((options) => {
  detailId = options.id || ''; 
  detailType = options.type || 'product';
  type.value=detailType
  // 页面加载时查询收藏状态
  fetchFavoriteStatus();
});

//页面挂载时校验类型，加载需求数据
onMounted(() => {
  reportBrowseHistory();
  console.log('商品ID:',detailId)
  console.log('商品类型：',detailType)
  if (!detailId) {
      uni.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1500);
      return;
    }
  // type=demand
  if (detailType === 'demand') {
    fetchDemandDetail(detailId); // 需求详情
	fetchDemandRecommendations();// 获取首页推荐需求
  } else {
    fetchProductDetail(detailId); // 商品详情
	fetchProductRecommendations();// 获取首页推荐商品
  }
});

// 提交浏览记录的函数
const reportBrowseHistory = async () => {
  if (hasReported.value || !detailId) return; // 避免重复提交或无ID时提交

  // 构造请求参数（符合接口要求）
  const params = {
      itemId: Number(detailId), 
      itemType: detailType, // 'product'或'demand'
  };
  console.log('浏览记录提交的数据：', params);

  try {
    const res = await userApi.recordBrowseHistory(params);
    if (res.code === 200) {
      console.log('浏览记录提交成功', res.data);
    } else {
      console.warn('浏览记录提交失败', res.msg);
    }
  } catch (error) {
    console.error('浏览记录接口调用失败', error);
  } finally {
    hasReported.value = true;
  }
};

// // 监听页面卸载
// onUnmounted(() => {
//   reportBrowseHistory();
// });

//需求数据加载（专属）
const fetchDemandDetail = async (detailId) => {
  try {
    // 调用后端接口，传入需求ID
    const res = await productApi.getDemandDetail(detailId);
    if (res.code === 200) {
      const raw = res.data;
      // 统一兼容 detailImages 为数组或逗号分隔字符串
      const parseDetailImages = (imgs, type) => {
        let arr = [];
        if (Array.isArray(imgs)) arr = imgs;
        else if (typeof imgs === 'string') {
          arr = imgs.split(',').map(s => s.trim()).filter(Boolean);
        }
        return arr.map(u => sanitizeImageUrl(u, type));
      };
      detail.value = {
        ...raw,
        imgUrl: sanitizeImageUrl(raw?.mainImageUrl, 'demand'),
        requester: {
          ...(raw?.requester || {}),
          avatar: sanitizeImageUrl(raw?.requester?.avatar, 'avatar'),
          nickname: raw?.requester?.nickname || '未知用户'
        },
        sellerAvatarUrl: sanitizeImageUrl(raw?.sellerAvatarUrl, 'avatar'),
        detailImages: parseDetailImages(raw?.detailImages, 'demand')
      };
	  console.log('得到详细的需求数据是：',detail.value)
	  await fetchSellerDemands(raw?.requester?.id)
    } else {
      uni.showToast({ title: res.msg || '获取需求失败', icon: 'none' });
    }
  } catch (error) {
    // 网络错误/代码异常
    console.error('需求加载失败:', error);
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
  }
};

//商品数据加载（专属）
const fetchProductDetail = async (id) => {
  try {
    // 调用后端接口，传入商品ID
    const res = await productApi.getProductDetail(id);
    if (res.code === 200) {
      const raw = res.data;
      // 统一兼容 detailImages 为数组或逗号分隔字符串
      const parseDetailImages = (imgs, type) => {
        let arr = [];
        if (Array.isArray(imgs)) arr = imgs;
        else if (typeof imgs === 'string') {
          arr = imgs.split(',').map(s => s.trim()).filter(Boolean);
        }
        return arr.map(u => sanitizeImageUrl(u, type));
      };
      detail.value = {
        ...raw,
        imgUrl: sanitizeImageUrl(raw?.mainImageUrl, 'product'),
        sellerAvatarUrl: sanitizeImageUrl(raw?.sellerAvatarUrl, 'avatar'),
        detailImages: parseDetailImages(raw?.detailImages, 'product')
      };
	  await fetchSellerProducts(raw?.sellerId)
	  console.log('得到详细的商品数据是：',detail.value)
    } else {
      uni.showToast({ title: res.msg || '获取商品失败', icon: 'none' });
    }
  } catch (error) {
    // 网络错误/代码异常
    console.error('商品加载失败:', error);
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
  }
};

const fetchSellerDemands = async (requesterId) => {
  try {
    const res = await productApi.getSellerItem(requesterId);
    console.log('接口返回的发布者其他需求：', res.data.demands);
    if (res.code === 200) {
      sellerDemands.value = res.data.demands
        .filter(item => item.id !== detail.value.id)
        .map(item => ({
          ...item,
          imgUrl: sanitizeImageUrl(item.mainImageUrl || item.imgUrl, 'demand'),
          budget: item.budget || '0.00',
        }));
      // 关键：打印 detailType 和 currentRelatedList 的来源
      console.log('当前 detailType：', detailType); 
      console.log('sellerDemands 长度：', sellerDemands.value.length);
      console.log('getCurrentRelatedList() 实际值：', 
        detailType === 'demand' ? '来自 sellerDemands' : '来自 sellerProducts'
      );
	   console.log('currentRelatedList为',getCurrentRelatedList())
    }
  } catch (error) {
    console.error('获取发布者其他需求失败:', error);
  }
};

// 获取该用户发布的所有商品
const fetchSellerProducts = async (requesterId) => {
  try {
    const res = await productApi.getSellerItem(requesterId);
	console.log('接口返回的发布者其他商品：', res.data.demands);
    if (res.code === 200) {
      sellerProducts.value = res.data.products
        .filter(item => item.id !== detail.value.id) // 排除当前商品
        .map(item => ({
          ...item,
          imgUrl: sanitizeImageUrl(item.mainImageUrl || item.imgUrl, 'product'),
          price: item.price || 0
        }));
	  console.log('后端返回给获取该商家的所有商品数据：',sellerProducts.value)
    }
  } catch (error) {
    console.error('获取发布者其他需求失败:', error);
  }
};

//获取推荐需求接口
const fetchDemandRecommendations = async () => {
	try {
	  // 请求需求数据
	  const demandRes = await productApi.getAllDemands();
		console.log('接口获取的所有需求推荐数据',demandRes.data)
	  
	  // 处理需求数据
	  if (demandRes.code === 200) {
	    uglyDemandList.value = demandRes.data || [];
		await cleanDemandList();
		console.log('获取推荐需求的脏数据：',uglyDemandList.value)
	  } else {
	    uni.showToast('获取需求数据失败');
	  }
	} catch (error) {
	  console.error('获取推荐数据失败：', error);
	  uni.showToast('网络异常，获取推荐数据失败');
	}
};

//获取推荐商品接口
const fetchProductRecommendations = async () => {
  try {
      const productRes = await productApi.getAllGoods();
  	if (productRes.code === 200) {
        console.log('后端返回的对应分类推荐商品为：', productRes.data)
  	  uglyGoodsList.value = productRes.data || [];
  	  cleanGoodsList();
      } else {
        uni.showToast({
          title: productRes.message || '获取商品列表失败',
          icon: 'none'
        });
        goodsRecommendations.value = [];
      }
    } catch (error) {
      uni.showToast({
        title: '网络异常，获取商品列表失败',
        icon: 'none'
      });
      console.error('获取商品列表失败：', error);
      goodsList.value = [];
    }
};

//清洗函数（需求）
const cleanDemandList = async () => {
  console.log('清洗前的需求数据：', uglyDemandList.value);
  const tempDemandList = await Promise.all(
    uglyDemandList.value.map(async (item) => {
      let tags = [];
      try {
        const attributesObj = JSON.parse(item.attributes || '{}');
        tags = Object.values(attributesObj);
      } catch (err) {
        console.error('解析 attributes 失败:', err);
        tags = [];
      }
      return {
        id: item.id,
        imgUrl: sanitizeImageUrl(item.mainImageUrl, 'demand'),
        tags: ['需求'],
        title: item.title || '未知需求',
        desc: item.description || '',
        categoryName: '需求分类', 
        user: {
          avatar: sanitizeImageUrl(item?.requester?.avatar, 'avatar'),
          nickname: item?.requester?.nickname || '未知用户'
        },
        category: '全部',
        type: 'demand',
        price: item.budget || 0,
        status: item.status,
        sortPriority: item.adminPinScore || 0,
        isAdminPinned: item.isAdminPinned || false
      };
    })
  );
  console.log('清洗后的需求数据：', tempDemandList);
  // 筛选需求数据
  const activeDemandList = tempDemandList.filter(item => item.status === 'active');
  // 更严谨的方式是用两个响应式变量分别存储清洗后的商品和需求数据
  demandRecommendations.value = activeDemandList;
};

//清洗函数（商品）
const cleanGoodsList = async () => {
  console.log('清洗前的商品数据：', uglyGoodsList.value);
  const tempGoodsList = await Promise.all(
    uglyGoodsList.value.map(async (item) => {
      let tags = [];
      try {
        const attributesObj = JSON.parse(item.attributes || '{}');
        tags = Object.values(attributesObj);
        tags.unshift(item.isNegotiable ? '可刀' : '不可刀');
      } catch (err) {
        console.error('解析 attributes 失败:', err);
        tags = [];
      }
      return {
        id: item.id,
        imgUrl: sanitizeImageUrl(item.mainImageUrl, 'product'),
        tags,
        title: item.title || '未知商品',
        desc: item.description || '',
        categoryName: item.categoryName,
        user:{
          avatar: sanitizeImageUrl(item?.sellerAvatarUrl, 'avatar'),
          nickname: item?.sellerNickname || '未知用户'
        },
        category: tags[1] || '其他', 
        type: 'product',
        price: item.price || 0,
        status: item.status,
        sortPriority: item.adminPinScore || 0,
        isAdminPinned: item.isAdminPinned || false
      };
    })
  );
  // 筛选 active 状态的数据
  const activeGoodsList = tempGoodsList.filter(item => item.status === 'active');
  console.log('清洗并筛选后的商品数据：', activeGoodsList);
  goodsRecommendations.value = activeGoodsList;
};

// 查询当前商品/需求的收藏状态
const fetchFavoriteStatus = async () => {
  try {
    const res = await userApi.getFavoriteStatus(detailType,detailId)
    isCollected.value = res.data;
	if(res.code === 200){
		console.log('查询用户的收藏状态为：',isCollected.value)
	}
  } catch (error) {
    console.error('查询收藏状态失败:', error);
  }
};

// 切换收藏状态（收藏/取消收藏）
const toggleCollect = async () => {
  // 未登录则弹窗提示并阻止收藏操作
  if (!ensureLoggedIn({ content: '登录后才能收藏商品/需求', redirectTo: '/pages/mine/mine' })) return;
  try {
    if (isCollected.value) {
      // 取消收藏
      const res = await userApi.cancelFavorite({
		 itemId:detailId, 
		 itemType:detailType
	  })
	  if(res.code === 200){
		uni.showToast({ title: '取消收藏成功', icon: 'success' }); 
		isCollected.value = !isCollected.value;
	  }
    } else {      
      const res = await userApi.addFavorite({
		 itemId:detailId, 
		 itemType:detailType
	  });
	  if(res.code === 200){
	  	uni.showToast({ title: '收藏成功', icon: 'success' }); 
	    isCollected.value = !isCollected.value;
	  }
    }
	console.log('操作后的收藏状态为：',isCollected.value)
  } catch (error) {
    console.error('收藏操作失败:', error);
    uni.showToast({ 
      title: isCollected.value ? '取消收藏失败' : '收藏失败', 
      icon: 'none' 
    });
    // 恢复状态（接口失败时不改变UI）
    isCollected.value = !isCollected.value;
  }
};

// 提交举报
const submitReport = async () => {
  if (!reportReason.value.trim()) {
    uni.showToast({ title: '请输入举报原因', icon: 'none' });
    return;
  }

  try {
    // 登录校验：未登录直接提示并拦截
    if (!ensureLoggedIn({ content: '登录后才能提交举报', redirectTo: '/pages/mine/mine' })) return;

    // 构造举报参数（根据类型传递对应的ID）
    const reportParams = {
      reason: reportReason.value,
      reportedProductId: detailType === 'product' ? detailId : undefined,
      reportedDemandId: detailType === 'demand' ? detailId : undefined,
      // 举报用户ID：商品举报指向卖家，需求举报指向发布者
      reportedUserId: detailType === 'product'
        ? (detail.value?.sellerId || undefined)
        : (detail.value?.requester?.id || undefined)
    };

    // 去除 undefined/null 字段，避免后端接收无效键
    const cleanedParams = Object.fromEntries(
      Object.entries(reportParams).filter(([_, v]) => v !== undefined && v !== null)
    );

    const res = await userApi.submitReport(cleanedParams);
    if (res.code === 200 || res.code === 201) {
      uni.showToast({ title: res.data, icon: 'success' });
      showReportDialog.value = false;
    } else {
      // 优先展示后端的具体原因
      uni.showToast({ title: res.msg || '举报提交失败', icon: 'none' });
    }
  } catch (error) {
    console.error('举报接口调用失败:', error);
    uni.showToast({ title: '网络错误，请重试', icon: 'none' });
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

// 计算所有商品图片（主图 + 详情图）
const allProductImages = computed(() => {
  if (!detail.value) return [];
  const images = [];
  if (detail.value.imgUrl) {
    images.push(detail.value.imgUrl);
  }
  if (detail.value.detailImages && Array.isArray(detail.value.detailImages) && detail.value.detailImages.length) {
    images.push(...detail.value.detailImages);
  }
  const type = detailType === 'demand' ? 'demand' : 'product';
  if (images.length === 0) {
    return [sanitizeImageUrl('', type)];
  }
  return images.map(u => sanitizeImageUrl(u, type));
});

// 格式化时间
const formatTime = (timeStamp) => {
  if (!timeStamp) return '';
  
  const now = Date.now();
  const diff = now - timeStamp;
  const dayMs = 86400000; // 一天的毫秒数
  
  if (diff < dayMs) {
    // 小于一天，显示小时前
    const hours = Math.floor(diff / 3600000);
    return hours > 0 ? `${hours}小时前` : '刚刚';
  } else if (diff < dayMs * 2) {
    return '1天前';
  } else if (diff < dayMs * 3) {
    return '2天前';
  } else {
    // 超过3天，显示具体日期
    const date = new Date(timeStamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 预览图片
const previewImages = (index) => {
  if (allProductImages.value.length === 0) return;
  uni.previewImage({
    current: index,
    urls: allProductImages.value,
  });
};

// 点击聊一聊跳转到聊天界面
const goToChat = () => {
  // 登录、学生认证、会员等级拦截
  if (!ensureLoggedIn({ content: '登录后才能聊一聊', redirectTo: '/pages/mine/mine' })) return;
  if (!ensureStudentCertified({ content: '请先完成学生认证后再进行聊天' })) return;
  if (!ensureMembership('normal', { content: '聊天功能仅对普通会员及以上开放' })) return;
  // 1. 提取聊天对象ID（区分商品/需求类型）
  let sellerId = '';
  if (detailType === 'product') {
    // 商品类型：聊天对象是卖家，ID从 detail.sellerId 获取
    sellerId = detail.value.sellerId || '';
  } else if (detailType === 'demand') {
    // 需求类型：聊天对象是需求发布者，ID从 detail.requester.id 获取
    sellerId = detail.value.requester?.id || '';
  }

  // 2. 提取当前商品/需求ID和类型（用于聊天页显示关联信息）
  const itemId = detailId; // detailId 是 onLoad 中接收的当前商品/需求ID
  const itemType = detailType; // 商品/需求类型（product/demand）

  // 3. 校验必要参数，避免跳转异常
  if (!sellerId || !itemId) {
    uni.showToast({ title: '无法获取聊天对象信息', icon: 'none' });
    return;
  }

  // 4. 跳转到聊天页，携带参数（与聊天页 onLoad 接收的参数键名保持一致）
  uni.navigateTo({
    url: `/pages/chat/chat?sellerId=${sellerId}&itemId=${itemId}&type=${itemType}`
  });
};

// 点击商品跳转到详情页
const goToDetail = (id, type) => {
  const targetType = type || detailType || 'product';
  uni.navigateTo({
    url: `/pages/ProductDetail/ProductDetail?id=${id}&type=${targetType}`,
  });
};

</script>

<style scoped>
/* 基础样式 */
.product-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-size: 28rpx;
}

/* 卖家信息 */
.seller-info-container {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #fff;
}

.seller-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.seller-name {
  font-size: 28rpx;
  font-weight: 500;
  flex-shrink: 0;
}

.credit-tag {
  background-color: #ffe100;
  color: #333;
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
}

/* 商品主图 */
.product-main-image {
  position: relative;
  background-color: #fff;
}

.main-image {
  width: 100%;
  height: auto;
}

.image-count {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24rpx;
  padding: 4rpx 10rpx;
  border-radius: 14rpx;
}

/* 商品信息 */
.product-info {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #eee;
}

.price-container {
  margin-bottom: 20rpx;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #ff4d4f;
  font-size: 30rpx;
}

.price {
  color: #ff4d4f;
  font-size: 40rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.original-price {
  color: #999;
  font-size: 26rpx;
  text-decoration: line-through;
}

.discount-tag {
  background-color: #ffe6e6; /* 浅红色背景，可根据喜好调整 */
  border-radius: 5px;
  color: #ff0000;
  padding: 8px 15px;
  font-size: 14px;
  display: block;
  margin-bottom: 15rpx;
}

.bold-text {
  margin-right: 15rpx;
  font-weight: bold;
}
.product-title {
  font-size: 34rpx;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
  word-break: break-all;
}

.product-stats-container {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 26rpx;
}

.stats-item {
  margin: 0 6rpx;
}

.divider {
  color: #ddd;
  margin: 0 6rpx;
}

.location {
  color: #999;
  font-size: 26rpx;
}

.location-sales {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 通用区块样式 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  padding: 25rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: relative;
  display: flex; /* 开启弹性布局，方便文字与伪元素对齐 */
  align-items: center; /* 垂直居中对齐 */
}

.section-title::after {
  content: '';
  position: absolute;
  left: 20rpx; 
  width: 6rpx;
  height: 32rpx;
  background-color: #ff4d4f;
  border-radius: 3rpx;
  margin-right: 15rpx;
}

/* 商品详情 */
.product-detail-section {
  margin-top: 20rpx;
  background-color: #fff;
}

.detail-content {
  padding: 20rpx;
}

.product-desc {
  line-height: 1.6;
  margin-bottom: 30rpx;
  display: block;
  font-size: 28rpx;
  color: #333;
}

.detail-images {
  width: 100%;
}

.detail-image {
  width: 100%;
  margin-bottom: 15rpx;
  border-radius: 10rpx;
}

/* 商家信息 */
.seller-section {
  margin-top: 20rpx;
  background-color: #fff;
}

.seller-info {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  border-bottom: 1px solid #eee;
}

.seller-avatar-large {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.seller-details {
  display: flex;
  gap: 25rpx;
  flex: 1;
}

.seller-goods-count {
  color: #999;
  font-size: 26rpx;
}

/* 聊一聊按钮：调整尺寸和样式 */
.contact-seller {
  width: 140rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  border-radius: 30rpx;
  font-size: 26rpx;
  background-color: transparent;
  margin-right: 0; /* 取消原有右边距 */
}

.seller-goods-title {
  font-size: 28rpx;
  padding: 20rpx;
  border-bottom: 1px solid #f5f5f5;
  color: #666;
}

/* 商品滚动区域样式 */
.goods-scroll-container {
  width: 100%;
  padding: 16rpx;
  box-sizing: border-box;
}

.goods-scroll {
  width: 100%;
  white-space: nowrap;
}

.goods-list {
  display: inline-flex;
  gap: 20rpx;
}

.goods-item {
  width: 200rpx;
  display: inline-block;
  text-align: center;
  position: relative;
}

.goods-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 10rpx;
  object-fit: cover;
}

.goods-price {
  position: absolute;
  bottom: 5rpx;
  left: 5rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
}

.no-more-seller-goods {
  width: 100%;
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 推荐商品 */
.recommendation-section {
  margin-top: 20rpx;
  background-color: #fff;
  margin-bottom: 120rpx; /* 留出底部操作栏空间 */
}

/* 底部操作栏整体 */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-around; /* 均匀分布按钮 */
  gap: 80rpx;
  background-color: #fff;
  border-top-left-radius: 20rpx; /* 顶部圆角 */
  border-top-right-radius: 20rpx;
  padding: 15rpx; 
  padding-bottom: 40rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1); /* 底部阴影，增强层次感 */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

/* 收藏文字 */
.collect-text {
  font-size: 24rpx;
  margin-top: 6rpx;
  color: #666;
}

.collect-btn-container {
  display: flex;
  flex-direction: column; 
  align-items: center;
}

/* 收藏按钮 */
.favBtn{
	margin-left: 16rpx;
}

/* 通用按钮样式 */
.bar-button {
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
  background-color: transparent;
  padding: 10rpx;
  font-size: 24rpx;
}

/* 聊天按钮容器 */
.chat-btn {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 75rpx;
  align-items: center;
  background-color: #ffe100; 
  color: #333;
  border-radius: 60rpx; 
  margin: 15rpx 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  outline: none;
  box-shadow: 0 4rpx 8rpx rgba(44, 140, 255, 0.3); /* 轻微阴影增强立体感 */
  transition: all 0.2s ease;
}

/* 按钮点击效果 */
.chat-btn:active {
  background-color: #e8b61e;
  transform: scale(0.98); /* 点击时轻微缩小 */
}

/* 图标容器 */
.icon-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  width: 44rpx;
  height: 44rpx;
}

/* 聊天图标 */
.chat-icon {
  width: 100%;
  height: 100%;
  object-fit: contain; 
  filter: brightness(0) invert(1); 
}

/* 文字样式 */
.chat-btn text {
  letter-spacing: 0.5rpx;
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

.statusBar {
  width: 100%;
  z-index: 99;
  height: 62.4rpx;
}

/* 举报按钮：调整尺寸和样式 */
.report-btn {
  width: 140rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  border-radius: 30rpx;
  font-size: 26rpx;
  background-color: transparent;
}

/* 举报弹窗样式 */
.report-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.dialog-mask {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.dialog-form {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
}

.form-input {
  width: 100%;
  min-height: 120rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  padding: 15rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.dialog-footer {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.cancel-btn {
  border: 1px solid #999;
  color: #999;
  background-color: transparent;
}

.confirm-btn {
  background-color: #ff4d4f;
  color: #fff;
  border: none;
}

.action-buttons {
  display: flex;
  gap: 16rpx; /* 按钮之间的间距 */
}

.name{
	margin-right: 20rpx;
}
</style>
