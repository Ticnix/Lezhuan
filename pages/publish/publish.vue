<template>
  <view class="my-published-page">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="nav-title">我发布的商品</text>
      <button class="add-goods-btn" @click="goToPublish">
        <uni-icons type="plus" size="24" color="#fff"></uni-icons>
        <text class="add-text">发布商品</text>
      </button>
    </view>
    
    <!-- 搜索和筛选区域 -->
    <view class="filter-container">
      <view class="search-box">
        <uni-icons type="search" size="24" color="#999" class="search-icon"></uni-icons>
        <input 
          type="text" 
          placeholder="搜索我的商品..." 
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
    
    <!-- 商品列表说明 -->
    <view class="list-note">
      <uni-icons type="info" size="24" color="#7c89ff" class="note-icon"></uni-icons>
      <text class="note-text">注：已完成的商品无法编辑和删除，相关按钮将自动隐藏</text>
    </view>
    
    <!-- 商品列表 -->
    <view class="goods-list">
      <view v-if="isLoading" class="loading-state">
        <uni-icons type="loading" size="40" color="#7c89ff" spin></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view 
        class="goods-row" 
        v-else-if="filteredGoods.length > 0"
        v-for="goods in filteredGoods" 
        :key="goods.id"
      >
        <view class="goods-info" @click="navigateToDetail(goods.id)">
          <image 
            :src="goods.imgUrl || 'https://api.shaolezhuan.cn/lzphoto/productDefault.jpg'" 
            mode="widthFix" 
            class="goods-img"
          ></image>
          
          <view class="goods-text-content">
            <view class="goods-title">{{ goods.title }}</view>
            
            <view class="goods-meta">
              <text class="goods-price">¥{{ goods.price.toFixed(2) }}</text>
              <text class="publish-time">{{ formatTime(goods.publishTime) }}</text>
            </view>
            
            <view class="goods-status">
              <view class="status-badge" :class="getStatusClass(goods.status)">
                {{ convertStatusToChinese(goods.status) }}
              </view>
              <view class="tags-container">
                <uni-tag 
                  v-if="goods.isTop === 1"
                  size="mini"
                  text="已置顶"
                  type="primary"
                ></uni-tag>
                <uni-tag 
                  v-if="goods.isOnHome"
                  size="mini"
                  text="首页展示"
                  type="success"
                ></uni-tag>
              </view>
            </view>
          </view>
        </view>
        
        <view class="goods-actions" v-if="convertStatusToChinese(goods.status) !== '已完成'">
          <button 
            class="action-btn edit-btn" 
            @click.stop="handleOpenEditPopup(goods)"
          >
            <uni-icons type="compose" size="20" color="#409EFF"></uni-icons>
          </button>
          <button 
            class="action-btn delete-btn" 
            @click.stop="deleteGoods(goods.id)"
          >
            <uni-icons type="trash" size="20" color="#F56C6C"></uni-icons>
          </button>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <uni-icons type="empty" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无符合条件的商品</text>
        <button class="publish-btn" @click="goToPublish">发布新商品</button>
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
        <!-- 降价输入区域 -->
        <view class="price-edit-container">
          <text class="price-label">降价为:</text>
          <input 
            type="number" 
            v-model="newPrice"
            step="0.01"
            min="0.01"
            class="price-input"
            placeholder="输入定价"
          />
        </view>
        
        <!-- 操作按钮区域 -->
        <view class="action-buttons">
          <button 
            class="operation-btn top-btn" 
            @click="setGoodsTop"
			:disabled="currentGoods?.isTop"
			v-if="currentGoods?.status !== '已完成' && !currentGoods?.isTop" 
          >
            置顶
          </button>
          <button 
            class="operation-btn home-btn" 
            @click="setGoodsToHome"
			:disabled="currentGoods?.isOnHome"
			v-if="currentGoods?.status !== '已完成' && !currentGoods?.isOnHome"
          >
            上首页
          </button>
          <!-- 确认售出按钮 -->
          <button 
            class="operation-btn sell-btn" 
            @click="confirmGoodsSold"
			v-if="currentGoods?.status !== '已完成'"
          >
            确认完成交易
          </button>
        </view>
        
        <!-- 确认降价按钮 -->
        <button class="confirm-price-btn" @click="confirmPriceReduction">
          确认降价
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
// 导入你的接口封装（根据实际路径调整）
import productApi from '@/api/product.js';

// 基础状态
const searchKeyword = ref('');
const isLoading = ref(false);
const currentGoods = ref(null);
const newPrice = ref('');
const editPopup = ref(null);

// Picker筛选配置
const categoryRange = ref(['全部分类']);
const statusRange = ref(['全部状态', '待审核', '已上架','已拒绝','已完成']);
const categoryIndex = ref(0);
const statusIndex = ref(0);

// 商品数据
const publishedGoods = ref([]);

// 页面加载时获取商品列表
onMounted(() => {
  fetchMyGoods();
  // 监听页面显示事件，重新获取数据
  uni.$on('pageShow', fetchMyGoods);
});

//商品状态
const convertStatusToChinese = (englishStatus) => {
  // 状态映射关系
  const statusMap = {
    'pending_review': '待审核',
    'active': '已上架',
    'rejected': '已拒绝',
    'sold': '已完成'
  };
  // 如果有对应的中文状态则返回，否则返回原英文状态
  return statusMap[englishStatus] || englishStatus;
};

// 获取我的商品列表（调用你的接口封装）
const fetchMyGoods = async () => {
  try {
    isLoading.value = true;
    // 构造筛选参数
    const myData = {
	  current:1,
	  size:100,
	  timestamp: Date.now()
      // category: categoryRange.value[categoryIndex.value] === '全部种类' ? '' : categoryRange.value[categoryIndex.value],
      // status: statusRange.value[statusIndex.value] === '全部状态' ? '' : statusRange.value[statusIndex.value]
    };
    // 调用接口
    const res = await productApi.getMyGoods(myData);
    
    const rawGoodsList = res.data.records || [];
	
	console.log('后端返回的我发布的商品数据是：',rawGoodsList)
	
	// 筛选并映射为目标格式
	publishedGoods.value = rawGoodsList
	  .filter(raw => raw.status !== 'delisted') // 排除状态为 delisted 的商品
	  .map(raw => ({
	    id: raw.id,
	    title: raw.title,
	    desc: raw.description || '',
	    imgUrl: raw.mainImageUrl || '',
	    price: raw.price || 0,
	    category: raw.categoryName || '',
	    location: '',
	    publishTime: raw.createdAt ? new Date(raw.createdAt).getTime() : Date.now(),
	    status: convertStatusToChinese(raw.status) || '待审核',
	    isTop: raw.urgentPush || false,
	    isOnHome: raw.isHomepageFeatured || false
	  }));
    
	console.log('清洗完的数据：',publishedGoods.value)
	
    // 动态生成种类Picker选项
    const categories = [...new Set(publishedGoods.value.map(item => item.category))];
    categoryRange.value = ['全部分类', ...categories];
  } catch (error) {
    console.error('获取商品列表失败:', error);
    uni.showToast({
      title: '加载商品失败',
      icon: 'none',
      duration: 2000
    });
  } finally {
    isLoading.value = false;
  }
};

// 筛选逻辑
const filteredGoods = computed(() => {
  return publishedGoods.value.filter(goods => {
    const matchesSearch = searchKeyword.value === ''
      ? true
      : goods.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
        || (goods.desc && goods.desc.toLowerCase().includes(searchKeyword.value.toLowerCase()));

    const selectedCategory = categoryRange.value[categoryIndex.value];
    const matchesCategory = selectedCategory === '全部分类'
      ? true
      : goods.category === selectedCategory;

    const selectedStatus = statusRange.value[statusIndex.value];
    // 统一按中文状态比较：无论 goods.status 是英文还是中文，都转成中文再比较
    const goodsStatusCN = convertStatusToChinese(goods.status);
    const matchesStatus = selectedStatus === '全部状态'
      ? true
      : goodsStatusCN === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

// Picker事件处理（筛选条件变化时重新请求）
const handleCategoryChange = (e) => {
  categoryIndex.value = e.detail.value;
  fetchMyGoods();
};

const handleStatusChange = (e) => {
  statusIndex.value = e.detail.value;
  fetchMyGoods();
};

const handleSearch = () => {
  // 搜索由computed自动触发本地筛选
};

const getStatusClass = (status) => {
  // 状态文本与样式类的映射（根据实际中文状态调整）
  const classMap = {
    '待审核': 'status-pending',    // 待审核状态样式
    '已上架': 'status-onsale',     // 已上架/出售中样式
    '已拒绝': 'status-rejected',   // 已拒绝状态样式
    '已完成': 'status-completed'   // 已完成状态样式
  };
  return classMap[status] || 'status-default'; // 默认样式（可选）
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

// 导航到商品详情
const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/goodsDetail/goodsDetail?id=${id}`
  });
};

// 打开编辑弹窗
const handleOpenEditPopup = async (goods) => {
  try {
    currentGoods.value = { ...goods };
    newPrice.value = goods.price.toString();
    await nextTick();
	await fetchMyGoods();
    editPopup.value?.open('bottom');
  } catch (error) {
    console.error('打开编辑弹窗失败:', error);
    uni.showToast({ title: '打开弹窗失败', icon: 'none' });
  }
};

// 显示已完成提示
const showSoldTip = () => {
  uni.showModal({
    title: '提示',
    content: '已完成的商品无法编辑',
    showCancel: false,
    confirmText: '知道了'
  });
};

const CancelEdit = () => {
  editPopup.value?.close();
};

// 确认降价
const confirmPriceReduction = async () => {
  if (!currentGoods.value) return;
  
  // 校验价格
  if (!newPrice.value || isNaN(newPrice.value) || parseFloat(newPrice.value) >= currentGoods.value.price) {
    uni.showToast({
      title: '请输入有效的新价格',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  try {
    isLoading.value = true;
    // 调用降价接口
    const res = await productApi.updateGoodsPrice(
      currentGoods.value.id, // 路径中的 productId
      { price: parseFloat(newPrice.value) } // 请求体中的新价格
    );
	
	console.log('降价状态：',newPrice)
	
	if(res.code === 200){
		uni.showToast({ title: '降价成功', icon: 'success' });
		// 更新本地数据
		const index = publishedGoods.value.findIndex(item => item.id === currentGoods.value.id);
		if (index !== -1) {
		  publishedGoods.value[index].price = parseFloat(newPrice.value);
		}
	}else{
		uni.showToast({
		  title: `调整失败：${res.msg}`, 
		  icon: 'none' 
		});
	}
    
    editPopup.value?.close();
  } catch (error) {
    console.error('降价失败:', error);
    uni.showToast({ title: '降价失败', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// 设置商品置顶
const setGoodsTop = async () => {
  if (!currentGoods.value || currentGoods.value.isTop) return;

  try {
    isLoading.value = true;

    const targetTopStatus = true;
    
	const productId = currentGoods.value.id
    // 调用接口：路径参数（商品ID）
    const res = await productApi.setGoodsTop(productId);
    
	console.log('置顶情况',res)
	
	if(res.code === 200){
		uni.showToast({
		  title: '商品已申请置顶', 
		  icon: 'success' 
		});
		fetchMyGoods();
		//更新本地数据
		const index = publishedGoods.value.findIndex(item => item.id === currentGoods.value.id);
		if (index !== -1) {
		  publishedGoods.value[index].isTop = targetTopStatus;
		}
	}else{
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

// 设置商品上推荐
const setGoodsToHome = async () => {
   if (!currentGoods.value || currentGoods.value.isOnHome) return;

  try {
    isLoading.value = true;
    const targetStatus = true;
	
	const productId = currentGoods.value.id
	
    //申请推荐
	const res = await productApi. setGoodsToHome(productId);
    console.log('商品推荐的结果：',res)
	
	if(res.code === 200){
		uni.showToast({
		  title: '商品已申请上首页推荐', 
		  icon: 'success' 
		});
		await fetchMyGoods();
		//更新本地数据
		const index = publishedGoods.value.findIndex(item => item.id === currentGoods.value.id);
		if (index !== -1) {
		  publishedGoods.value[index].isOnHome = targetStatus;
		}
	}else{
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

// 确认售出
const confirmGoodsSold = async () => {
  if (!currentGoods.value || currentGoods.value.status === '已完成') {
    uni.showToast({ title: '该商品已售出', icon: 'none' });
    return;
  }
  
  // 二次确认
  uni.showModal({
    title: '确认售出',
    content: '确定要将此商品标记为已售出吗？标记后将无法编辑',
    confirmText: '确认',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          isLoading.value = true;
          // 调用状态更新接口：第一个参数是路径参数（商品ID），第二个是请求体（状态）
          await productApi.updateGoodsStatus(
            currentGoods.value.id, // 路径参数：商品ID
            { status: 'sold' } 
          );
          await fetchMyGoods();
          //更新本地数据
          const index = publishedGoods.value.findIndex(item => item.id === currentGoods.value.id);
          if (index !== -1) {
            publishedGoods.value[index].status = '已完成';
          }
          
          uni.showToast({ title: '已标记为售出', icon: 'success' });
          editPopup.value?.close();
        } catch (error) {
          console.error('标记售出失败:', error);
          uni.showToast({ title: '操作失败', icon: 'none' });
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
};

// 删除商品（调用接口）
const deleteGoods = async (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该商品吗？删除后不可恢复',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          isLoading.value = true;
          // 调用删除接口
          const deleteRes = await productApi.deleteGoods(id);
		  console.log('删除商品ID',id)
          console.log('删除商品反馈',deleteRes)
		  
		  if(deleteRes.code===200){
			uni.showToast({ title: '商品已删除', icon: 'success' });  
			//更新本地数据
			publishedGoods.value = publishedGoods.value.filter(item => item.id !== id);
			await fetchMyGoods();
		  }else{
			uni.showToast({ title: `删除失败:${deleteRes.msg}`, icon: 'none' });  
		  }
		  
        } catch (error) {
          console.error('删除商品失败:', error);
          uni.showToast({ title: '删除失败', icon: 'none' });
        } finally {
          isLoading.value = false;
        }
      }
    }
  });
};

// 跳转到发布商品页面
const goToPublish = () => {
  uni.navigateTo({
    url: `/pages/post/post`
  });
};
</script>

<style scoped>
/* 样式部分保持不变 */
.my-published-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

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

.add-goods-btn {
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

.add-goods-btn:hover {
  background-color: #6a78e0;
  transform: translateY(-2rpx);
}

.add-text {
  margin-left: 8rpx;
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

.goods-list {
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

.goods-row {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 15rpx;
  margin-bottom: 15rpx;
  min-height: 180rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.goods-info {
  display: flex;
  flex: 1;
  margin-right: 20rpx;
  overflow: hidden;
}

.goods-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 15rpx;
}

.goods-text-content {
  flex: 1;
  overflow: hidden;
}

.goods-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 10rpx;
  font-size: 24rpx;
}

.goods-price {
  color: #F56C6C;
  font-weight: 600;
}

.publish-time, .goods-location {
  color: #999;
  display: flex;
  align-items: center;
}

.goods-status {
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

.status-default {
  background-color: #f6f6f6;
  color: #8c8c8c;
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

.goods-actions {
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

.price-edit-container {
  display: flex;
  align-items: center;
  gap: 15rpx;
  padding: 10rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.price-label {
  font-size: 40rpx;
  color: #333;
  width: 300rpx;
}

.price-input {
  flex: 1;
  height: 80rpx;
  font-size: 40rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
}

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

.sell-btn {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffe3e3;
}

.confirm-price-btn {
  width: 100%;
  height: 80rpx;
  background-color: #7c89ff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 10rpx;
}

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