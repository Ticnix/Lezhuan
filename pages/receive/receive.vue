<template>
<view class="receive-page">	
 <!-- 弹窗：优先显示，关闭后展示页面内容 -->
   <view class="popup-overlay" v-if="showPopup">
     <view class="popup-container">
       <view class="popup-content">【发布提醒】单页限一件物品，勿多物品混发；遵守平台规则及相应法律法规，为保障交易安全和用户的使用体验，我们将对发布内容逐一审核，违规严惩至封号！</view>
       <button 
         class="popup-close-btn" 
         @click="showPopup = false"
         :disabled="countdown > 0"
       >
         {{ countdown > 0 ? `请等待 ${countdown} 秒` : '我知道了' }}
       </button>
     </view>
   </view>
  <view class="container" v-if="!showPopup">
    <!-- 内容区域 -->
    <!-- 状态栏占位 -->
    <view class="statusBar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="back-btn" @click="handleBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="nav-title">收宝贝</view>
    </view>
    <view class="content">
      

      

      <!-- 需求标题 -->
      <view class="input-area1">
        <textarea 
          placeholder="填写需求名称" 
          v-model="title"
          class="desc-input1"
          maxlength="50"
          auto-height
        ></textarea>
        <view class="word-count">{{ title.length }}/50</view>
      </view>

      <!-- 需求描述 -->
      <view class="input-area">
        <textarea 
          placeholder="描述一下你的需求以及写下您所在的宿舍区域能更好找到卖家哦~" 
          v-model="description"
          class="desc-input"
          maxlength="500"
          auto-height
        ></textarea>
        <view class="word-count">{{ description.length }}/500</view>
      </view>

      <!-- 联系方式输入 -->
      <view class="input-area">
        <view class="contact-label">联系方式</view>
        <input 
          placeholder="请输入手机号或微信号" 
          v-model="contactInfo"
          class="contact-input"
          maxlength="20"
          type="text"
          inputmode="tel"
        />
        <view class="contact-hint" v-if="contactInfo">
          {{ isPhone ? '手机号格式' : '微信号格式' }}
        </view>
      </view>

      <!-- 选项区域 -->
      <view class="options-list">
        <!-- 需求分类（picker选择器） -->
        <picker mode="selector" :range="categories" range-key="name" @change="onCategoryPicked">
          <view class="option-item">
            <view class="option-label">需求分类</view>
            <view class="option-value">{{ selectedCategory || '请选择' }}</view>
            <uni-icons type="right" size="18" color="#999"></uni-icons>
          </view>
        </picker>
        <!-- 预算 -->
        <view class="option-item" @click="handleOpenBudgetPopup">
          <view class="option-label">预算</view>
          <view class="option-value">{{ budget ? '¥' + budget : '请填写' }}</view>
          <uni-icons type="right" size="18" color="#999"></uni-icons>
        </view>
        
        <!-- 交易方式 -->
        <view class="option-item" @click="handleOpenTradePopup">
          <view class="option-label">交易方式</view>
          <view class="option-value">{{ tradeMethod || '请选择' }}</view>
          <uni-icons type="right" size="18" color="#999"></uni-icons>
        </view>
      </view>

      <view @click="onPublish">
        <button class="publish-btn">发布</button>
      </view>
    </view>

    <!-- 预算输入弹窗 -->
    <uni-popup 
      ref="budgetPopup"
      type="bottom"
      background-color="#fff"
      :mask="true"
      :mask-click="true"
      class="custom-popup"
    >
      <view class="popup-content">
        <view class="popup-title">设置预算</view>
        <view class="price-input-container">
          <text class="rmb-sign">¥</text>
          <input 
            type="number" 
            v-model="budget" 
            placeholder="请输入预算"
            class="price-input"
            keyboard-type="number-pad"
          >
          </input>
        </view>
        <view class="notice">
          <text>注：诚心的填写预算，若预算与商品实际价值差距太大，则该需求将不被平台推送</text>
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @click="BudgetModalCancel">取消</button>
          <button class="confirm-btn" @click="BudgetModalConfirm">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 交易方式弹窗 -->
    <uni-popup 
      ref="tradePopup"
      type="bottom"
      background-color="#fff"
      class="custom-popup"
    >
      <view class="popup-content">
        <view class="popup-title">选择交易方式</view>
        <view class="trade-methods">
          <view 
            class="trade-method"
            v-for="method in tradeMethods" 
            :key="method.value"
            @click="selectTradeMethod(method.value)"
          >
            {{ method.label }}
            <uni-icons 
              type="checkmark" 
              size="20" 
              color="#FFCC00"
              v-if="tradeMethod === method.value"
            ></uni-icons>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 草稿确认弹窗 -->
    <uni-popup 
      ref="draftPopup"
      type="center"
      background-color="#fff"
      :mask="true"
      :mask-click="false"
      class="custom-popup"
    >
      <view class="popup-content">
        <view class="popup-title">确认退出吗？</view>
        <view class="popup-desc" style="text-align:center; font-size:28rpx; color:#666; margin:32rpx 0;">
          已输入的内容可保存为草稿，下次继续编辑
        </view>
        <view class="popup-buttons" style="gap:24rpx;">
          <button class="cancel-btn" @click="handleDraftCancel">确认退出</button>
          <button class="confirm-btn" @click="handleSaveDraft">保存草稿</button>
        </view>
      </view>
    </uni-popup>
  </view>
</view>
</template>

<script setup>
import { ref, nextTick, onMounted, computed, onUnmounted } from 'vue';
import { onBackPress } from '@dcloudio/uni-app'; 
import { useStorage } from '@/hooks/useStorage';
import productApi from '@/api/product.js';
import { getStatusBarHeight } from '@/utils/system.js';
import { ensureLoggedIn, ensureStudentCertified, ensureMembership } from '@/utils/uniHelper';

const { getStorage, setStorage } = useStorage();

// 导航相关高度数据
const statusBarHeight = ref(0);

// 1. 弹窗状态
// 弹窗控制
const showPopup = ref(true);
// 倒计时秒数
const countdown = ref(3);
// 定时器标识
let timer = null;
// 启动倒计时函数
const startCountdown = () => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

// 从本地缓存加载草稿
const loadDraftFromStorage = () => {
  try {
    const draft = getStorage('demandDraft');
	console.log('草稿内容为:',draft)
    if (draft && typeof draft === 'object') {
      // 回显表单数据
      title.value = draft.title || '';
      description.value = draft.description || '';
      contactInfo.value = draft.contactInfo || '';
      budget.value = draft.budget || '';
      tradeMethod.value = draft.tradeMethod || '';
      selectedCategory.value = draft.selectedCategory || '';
      selectedCategoryId.value = draft.categoryId || null;
    }
  } catch (error) {
    console.error('加载草稿失败:', error);
  }
};

// 需求分类数据（与数据库 id 序列一致）
const categories = [
  { id: 1, name: '电子数码' },
  { id: 2, name: '其他' },
  { id: 3, name: '生活用品' },
  { id: 4, name: '虚拟物品' },
  { id: 5, name: '自行车' },
  { id: 6, name: '体育用品' },
  { id: 7, name: '电器' },
  { id: 8, name: '二手书' }
];

// 分类选择状态
const selectedCategory = ref('');
const selectedCategoryId = ref(null);

// picker 选择回调
const onCategoryPicked = (e) => {
  const index = e?.detail?.value;
  const category = categories[index];
  if (!category) return;
  selectedCategory.value = category.name;
  // 直接使用数据库中的分类 id
  selectedCategoryId.value = category.id;
};

// 表单数据
const title = ref('');
const description = ref('');
const contactInfo = ref('');
const budget = ref('');
const tradeMethod = ref('');

// 联系方式类型判断
const isPhone = computed(() => {
  return /^1[3-9]\d{9}$/.test(contactInfo.value);
});

// 交易方式数据
const tradeMethods = [
  { label: '线下自行交易', value: '线下自行交易' },
];

// 预算弹窗控制
const budgetPopup = ref(null);
const handleOpenBudgetPopup = async () => {
  try {
    await nextTick();
    budgetPopup.value?.open('bottom'); 
  } catch (error) {
    console.error('打开预算弹窗失败:', error);
    uni.showToast({ title: '打开预算弹窗失败', icon: 'none' });
  }
};

const BudgetModalCancel = () => {
  budgetPopup.value?.close();
  budget.value = '';
};

const BudgetModalConfirm = () => {
  if (!budget.value) {
    uni.showToast({ title: '请输入预算', icon: 'none' });
    return;
  }
  budgetPopup.value?.close();
};

// 交易方式弹窗控制
const tradePopup = ref(null);
const handleOpenTradePopup = async () => {
  try {
    await nextTick();
    tradePopup.value?.open('bottom');
  } catch (error) {
    console.error('打开交易方式弹窗失败:', error);
    uni.showToast({ title: '打开交易方式弹窗失败', icon: 'none' });
  }
};

const selectTradeMethod = (value) => {
  tradeMethod.value = value;
  tradePopup.value.close();
};

// 发布需求
const onPublish = async () => {
  // 发布前再次拦截，防止绕过入口直接请求接口
  if (!ensureLoggedIn({ content: '登录后才能发布需求', redirectTo: '/pages/mine/mine' })) return;
  if (!ensureStudentCertified({ content: '发布需求需先完成学生认证' })) return;
  if (!ensureMembership('platinum', { content: '发布需求需白金会员' })) return;
  // 严格验证必填项
  if (!selectedCategoryId.value) {
    uni.showToast({ title: '请选择需求分类', icon: 'none' });
    return;
  }
  
  if (!title.value.trim()) {
    uni.showToast({ title: '请填写需求标题', icon: 'none' });
    return;
  }
  
  if (!description.value.trim()) {
    uni.showToast({ title: '请填写需求描述', icon: 'none' });
    return;
  }
  
  if (!contactInfo.value.trim()) {
    uni.showToast({ title: '请填写联系方式', icon: 'none' });
    return;
  }
  
  if (!budget.value) {
    uni.showToast({ title: '请填写预算', icon: 'none' });
    handleOpenBudgetPopup();
    return;
  }
  
  if (!tradeMethod.value) {
    uni.showToast({ title: '请选择交易方式', icon: 'none' });
    handleOpenTradePopup();
    return;
  }
  
  // 构建提交数据（确保categoryId与后端一致）
  const requesterId = getStorage('userId');
  const demandData = {
    title: title.value,
    description: description.value.trim(),
    budget: Number(budget.value),
    requesterId: requesterId,
    categoryName: selectedCategory.value,
    categoryId: selectedCategoryId.value, // 直接使用选择的分类id
    contactInfo: contactInfo.value.trim(),
    tradeMethod: tradeMethod.value,
  };
  
  console.log('发布需求数据:', demandData);
  
  // 提交发布（后续根据后端接口调整）
  try {
    const createDemandRes = await productApi.postDemand(demandData);
    console.log('发布结果:', createDemandRes);
    
    if (createDemandRes.code === 200 || createDemandRes.code === 201) {
      uni.showToast({ title: '发布成功', icon: 'success' });
      resetForm();
      uni.removeStorageSync('demandDraft');
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/wait/wait' });
      }, 500);
    } else if (createDemandRes.code === 403) {
      const msg = createDemandRes.msg || createDemandRes.message || '发布受限，请稍后再试';
      uni.showModal({
        title: '发布提醒',
        content: msg,
        confirmText: '知道了',
        showCancel: false
      });
    } else {
      uni.showToast({ title: createDemandRes.msg || createDemandRes.message || '发布失败', icon: 'none' });
    }
  } catch (error) {
    console.error('发布失败:', error);
    uni.showToast({ title: '网络异常，发布失败', icon: 'none' });
  }
};

// 草稿相关
const draftPopup = ref(null);
const draftData = ref({});

const handleDraftCancel = () => {
  draftPopup.value?.close();
  setTimeout(() => {
    uni.navigateBack({ delta: 1 });
  }, 300);
};

const handleSaveDraft = () => {
  draftData.value = {
      title: title.value,
      description: description.value,
      contactInfo: contactInfo.value,
      budget: budget.value,
      tradeMethod: tradeMethod.value,
      categoryId: selectedCategoryId.value,
      selectedCategory: selectedCategory.value,
      saveTime: new Date().getTime()
    };
  
  // 保存到本地存储
  setStorage('demandDraft', draftData.value);
  console.log('需求草稿内容为：',draftData.value)
  
  uni.showToast({ title: '草稿保存成功', icon: 'success' });
  draftPopup.value?.close();
  setTimeout(() => {
    uni.navigateBack({ delta: 1 });
  }, 1500);
};

// 返回处理
const handleBack = () => {
  if (title.value || description.value || contactInfo.value || 
      budget.value || tradeMethod.value || 
      selectedCategoryId.value) {
    draftPopup.value?.open('center');
    return true;
  } else {
    uni.navigateBack({ delta: 1 });
    return false;
  }
};

onBackPress((options) => {
  if (options.from === 'backbutton') {
    return handleBack();
  }
  return false;
});

// 重置表单
const resetForm = () => {
  title.value = '';
  description.value = '';
  contactInfo.value = '';
  budget.value = '';
  tradeMethod.value = '';
  selectedCategory.value = '';
  selectedCategoryId.value = null;
  
  // 关闭弹窗
  budgetPopup.value?.close();
  tradePopup.value?.close();
  draftPopup.value?.close();
};

// 生命周期钩子
onMounted(() => {
  // 未登录弹窗提醒；仍启动倒计时，避免弹窗卡住
  if (!ensureLoggedIn({ content: '登录后才能发布需求', redirectTo: '/pages/mine/mine' })) {
    startCountdown();
    return;
  }
  // 进入页面进行权限与认证拦截
  if (!ensureStudentCertified({ content: '发布需求需先完成学生认证' })) {
    startCountdown();
    return;
  }
  if (!ensureMembership('platinum', { content: '发布需求需白金会员' })) {
    startCountdown();
    return;
  }
  statusBarHeight.value = getStatusBarHeight();
  loadDraftFromStorage(); 
  // 启动倒计时
  startCountdown();
});

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.container {
  flex: 1;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.publish-btn {
  color: #fff;
  background-color: #FFCC00;
  border-radius: 30rpx;
  font-size: 36rpx;
  width: 100%;
  margin-top: 15rpx;
}

/* 分类选择器样式 */
.category-selectors {
  position: relative;
  width: 100%;
  margin-bottom: 24rpx;
}

.select-row {
  border: 1px solid #eee;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #fff;
}

.select-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  font-size: 30rpx;
}

.select-value {
  color: #666;
}

.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.select-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  max-height: 800rpx;
  overflow-y: auto;
}

.category-selector-group {
  position: relative;
}

.panel-content {
  background-color: #fff;
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 8rpx 8rpx;
}

/* 选项列表 */
.options-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.option-item {
  display: flex;
  justify-content: space-between; /* 确保标签居左，内容居右 */
  align-items: center;
  padding: 28rpx 30rpx; /* 增加左右内边距，让内容更舒展 */
  border-bottom: 1px solid #eee;
  font-size: 32rpx;
}

.option-item:nth-child(2n) {
  border-right: none;
}

.option-item:active {
  background-color: #f5f5f5;
}

.option-label {
  color: #333;
  min-width: 120rpx; /* 给标签固定最小宽度，避免内容挤压 */
}

.option-value {
  color: #999;
  margin-right: 10rpx; /* 减少与箭头的距离，避免内容过右 */
  flex: 1; /* 让内容区域自适应宽度 */
  text-align: right; /* 确保内容靠右对齐 */
}

/* 输入区域 */
.input-area1 {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 83rpx;
  margin-bottom: 20rpx;
}

.input-area {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.desc-input1 {
  width: 100%;
  min-height: 40rpx;
  font-size: 32rpx;
  line-height: 1.5;
}

.desc-input {
  width: 100%;
  min-height: 140rpx;
  font-size: 32rpx;
  line-height: 1.5;
}

.word-count {
  text-align: right;
  font-size: 28rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 联系方式样式 */
.contact-label {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  font-size: 32rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.contact-hint {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #007aff;
}

/* 选项列表 */
.options-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1px solid #eee;
  font-size: 32rpx;
}

.option-item:last-child {
  border-bottom: none;
}

.option-label {
  color: #333;
}

.option-value {
  color: #999;
  margin-right: 20rpx;
}

/* 弹窗样式 */
.custom-popup {
  width: 100%;
}

.popup-content {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 500;
  text-align: center;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #eee;
}

/* 预算弹窗 */
.price-input-container {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 1px solid #eee;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.rmb-sign {
  font-size: 40rpx;
  color: #333;
  margin-right: 16rpx;
}

.price-input {
  flex: 1;
  font-size: 28rpx;
  height: 80rpx;
}

.notice {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.popup-buttons {
  display: flex;
  gap: 24rpx;
}

.popup-buttons button {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  border-radius: 12rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.confirm-btn {
  background-color: #FFCC00;
  color: #fff;
}

/* 交易方式弹窗 */
.trade-methods {
  padding-top: 16rpx;
}

.trade-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  font-size: 32rpx;
  border-bottom: 1px solid #eee;
}

.trade-method:last-child {
  border-bottom: none;
}

/* 自定义导航栏样式 */
.custom-nav {
  height: calc(var(--status-bar-height) + 44px);
  padding-top: var(--status-bar-height);
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  border-bottom: 1px solid #eee;
}

.back-btn {
  position: absolute;
  left: 16px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 17px;
  font-weight: 500;
  color: #333;
}

.content {
  padding-top: calc(var(--status-bar-height) + 32px);
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  box-sizing: border-box;
}

.statusBar {
  background-color: #fff;
  width: 100%;
}

/* 弹窗样式：居中显示，半透明遮罩 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.popup-container {
  width: 60%;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}
.popup-content {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}
.popup-close-btn {
  width: 180rpx;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 35rpx;
  font-size: 28rpx;
  padding: 0;
}
.popup-close-btn:disabled {
  opacity: 0.7;
  background-color: #ccc;
  cursor: not-allowed;
}
</style>