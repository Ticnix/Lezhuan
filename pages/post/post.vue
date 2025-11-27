<template>
<view class="post-page">
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
	  <!-- 状态栏占位 -->
	  <view class="statusBar" :style="{ height: statusBarHeight + 'px' }"></view>
	  <!-- 自定义导航栏 -->
	  <view class="custom-nav">
	    <view class="back-btn" @click="handleBack">
	      <uni-icons type="left" size="24"></uni-icons>
	    </view>
	    <view class="nav-title">发宝贝</view>
	  </view>
	  <!-- 内容区域 -->
	  <view class="content">
	    <!-- 图片上传区域 -->
	    <view class="upload-area">
	      <view class="upload-title">添加图片（最多9张）</view>
	      <view class="upload-grid">
	        <!-- 上传按钮 -->
	        <view class="upload-item add-btn" @click="chooseImage">
	          <uni-icons type="plus" size="30" color="#999"></uni-icons>
	        </view>
	        
	        <!-- 已上传图片 -->
	        <view class="upload-item image-item" v-for="(img, index) in images" :key="index">
	          <image :src="img" mode="aspectFill" class="upload-img"></image>
	          <view class="delete-btn" @click.stop="deleteImage(index)">
	            <uni-icons type="close" size="18" color="#fff"></uni-icons>
	          </view>
	        </view>
	      </view>
	    </view>
		  <view class="input-area1">
			<textarea 
				placeholder="填写商品名称" 
				v-model="title"
				class="desc-input1"
				maxlength="50"
				auto-height
			></textarea>
			<view class="word-count">{{ title.length }}/50</view>
		  </view>
	    <!-- 商品描述 -->
	    <view class="input-area">
	      <textarea 
	        placeholder="描述一下宝贝的品牌型号、成色、使用情况等信息以及您所在的宿舍区域能更好找到买家哦~" 
	        v-model="description"
	        class="desc-input"
	        maxlength="500"
	        auto-height
	      ></textarea>
	      <view class="word-count">{{ description.length }}/500</view>
	    </view>
		<view class="category-selectors">
		  <!-- 选择器容器 - 一排显示三个 -->
		  <view class="select-row">
		    <!-- 第一级：物品种类 -->
		    <view class="select-item" @click="toggleSelector(1)">
		      <view class="select-value">{{ selectedCategory || '物品种类' }}</view>
		      <uni-icons 
		        type="down" 
		        size="18" 
		        color="#999"
		        :class="{ 'rotate-icon': activeSelector === 1 }"
		      ></uni-icons>
		    </view>
		
		    <!-- 第二级：子分类 -->
		    <view class="select-item" @click="toggleSelector(2)" :class="{ 'disabled': !selectedCategory }">
		      <view class="select-value">{{ selectedSubcategory || '子分类' }}</view>
		      <uni-icons 
		        type="down" 
		        size="18" 
		        color="#999"
		        :class="{ 'rotate-icon': activeSelector === 2 }"
		      ></uni-icons>
		    </view>
		
		    <!-- 第三级：成色 -->
		    <view class="select-item" @click="toggleSelector(3)">
		      <view class="select-value">{{ selectedCondition || '成色' }}</view>
		      <uni-icons 
		        type="down" 
		        size="18" 
		        color="#999"
		        :class="{ 'rotate-icon': activeSelector === 3 }"
		      ></uni-icons>
		    </view>
		  </view>
		
		  <!-- 下拉面板 -->
		  <view class="select-panel" v-if="activeSelector">
		    <view class="panel-content">
		      <!-- 物品种类列表 -->
		      <view v-if="activeSelector === 1" class="option-list">
		        <view 
		          class="option-item" 
		          v-for="category in Object.keys(categoryMap)" 
		          :key="category"
		          @click="selectCategory(category)"
		        >
		          {{ category }}
		        </view>
		      </view>
		
		      <!-- 子分类列表 -->
		      <view v-if="activeSelector === 2" class="option-list">
		        <view 
		          class="option-item" 
		          v-for="subcategory in categoryMap[selectedCategory]" 
		          :key="subcategory"
		          @click="selectSubcategory(subcategory)"
		        >
		          {{ subcategory }}
		        </view>
		      </view>
		
		      <!-- 成色列表 -->
		      <view v-if="activeSelector === 3" class="option-list">
		        <view 
		          class="option-item2" 
		          v-for="condition in conditions" 
		          :key="condition"
		          @click="selectCondition(condition)"
		        >
		          {{ condition }}
		        </view>
		      </view>
		    </view>
		  </view>
		
		  <!-- 遮罩层 -->
		 <!-- <view 
		    class="mask" 
		    v-if="activeSelector"
		    @click="closeAllSelectors"
		  ></view> -->
		</view>
	    <!-- 选项区域 -->
	    <view class="options-list">
	      <!-- 价格 -->
	      <view class="option-item" @click="handleOpenPricePopup">
	        <view class="option-label">价格</view>
	        <view class="option-value">{{ price ? '¥' + price : '请填写' }}</view>
	        <uni-icons type="right" size="18" color="#999"></uni-icons>
	      </view>
	      
	      <!-- 交易方式 -->
	      <view class="option-item" @click="handleOpenTradePopup">
	        <view class="option-label">交易方式</view>
	        <view class="option-value">{{ tradeMethod || '请选择' }}</view>
	        <uni-icons type="right" size="18" color="#999"></uni-icons>
	      </view>
	      
	      <!-- 是否可砍价 -->
	      <view class="option-item" @click="handleOpenNegotiable">
	        <view class="option-label">是否可小刀</view>
	        <view class="option-value">{{ negotiable || '请选择' }}</view>
			  <uni-icons type="right" size="18" color="#999"></uni-icons>
	      </view>
	    </view>
		  <view @click="onPublish">
		    <button class="publish-btn">发布</button>
		  </view>
	  </view>
	
	  <!-- 价格输入弹窗 -->
	  <uni-popup 
	    ref="pricePopup"
	    type="bottom"
	    background-color="#fff"
	    :mask="true"
	    :mask-click="true"
	    class="custom-popup"
	  >
	   <view class="popup-content">
	      <view class="popup-title">设置价格</view>
			<!-- 服务费说明 -->
			<view class="service-fee-desc">
			  <text class="fee-text">基础软件服务费</text>
			  <text class="fee-rate">免费</text>
			</view>
	      <view class="price-input-container">
	        <text class="rmb-sign">¥</text>
	        <input 
	          type="number" 
	          v-model="price" 
	          placeholder="请输入价格"
	          class="price-input"
	          keyboard-type="number-pad"
	        >
	        </input>
	      </view>
		    <!-- 原价输入区域 -->
			<view class="price-item">
			  <text class="price-label">原价</text>
			  <view class="price-input-wrapper">
				<text class="rmb-sign">¥</text>
				<input 
				  type="number" 
				  v-model="originalPrice" 
				  placeholder="0.00"
				  class="price-input"
				  keyboard-type="number-pad"
				  maxlength="8"
				>
				</input>
			  </view>
			</view>
	      <view class="popup-buttons">
	        <button class="cancel-btn" @click="PriceModalCancel">取消</button>
	        <button class="confirm-btn" @click="PriceModalConfirm">确定</button>
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
		
		<!-- 是否可刀弹窗 -->
		<uni-popup
		  ref="negotiablePopup"
		  type="bottom"
		  background-color="#fff"
		  :mask="true"
		  :mask-click="true"
		  class="custom-popup"
		>
		  <view class="popup-content">
			<view class="popup-title">是否开启可刀？</view>
			<view class="options">
			  <button class="option-btn" @click="handleOptionSelect(true)">是</button>
			  <button class="option-btn" @click="handleOptionSelect(false)">否</button>
			</view>
	
			<!-- 可刀价格输入区域（默认隐藏，选择“是”后显示） -->
			<view class="price-input-area" v-if="showPriceInput">
			  <text>最多可刀价格：</text>
			  <input 
				type="number" 
				v-model="negotiablePrice" 
				placeholder="请输入可刀价格"
				class="price-input"
			  >
			  <button class="confirm-price-btn" @click="confirmNegotiablePrice">确认</button>
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
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue';
import { onBackPress } from '@dcloudio/uni-app';
import productApi from '@/api/product.js';
import { useStorage } from '@/hooks/useStorage'
import { 
  getStatusBarHeight, 
  getTitleBarHeight,
  getNavBarHeight,
} from '@/utils/system.js';
import { ensureLoggedIn, ensureStudentCertified, ensureMembership } from '@/utils/uniHelper';

const { getStorage, setStorage } = useStorage();
// 导航相关高度数据
const statusBarHeight = ref(0);

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

// 图片相关
const images = ref([]);

// 解析并归一化后端返回的图片URL（支持多种键名与相对路径）
const normalizeImageUrl = (rawUrl) => {
  if (!rawUrl) return '';
  // 若是数组里取第一个有值的url
  if (Array.isArray(rawUrl)) {
    const found = rawUrl.find(u => !!u);
    return normalizeImageUrl(found);
  }
  // 对象场景：常见键名兼容
  if (typeof rawUrl === 'object') {
    const candidate = rawUrl.url || rawUrl.fileUrl || rawUrl.path || rawUrl.src || rawUrl.link || rawUrl[0];
    return normalizeImageUrl(candidate);
  }
  // 字符串场景：绝对/相对路径处理
  if (typeof rawUrl === 'string') {
    // 直接是完整URL
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    // 去除可能的包裹引号
    const trimmed = rawUrl.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // 可能是JSON字符串中抽出的相对地址，如 "/upload/xxx.jpg" 或 "upload/xxx.jpg"
    if (trimmed.startsWith('/')) return `https://api.shaolezhuan.cn${trimmed}`;
    return `https://api.shaolezhuan.cn/${trimmed}`;
  }
  return '';
};

// 从本地缓存加载草稿
const loadDraftFromStorage = () => {
  try {
    const draft = getStorage('productDraft');
	console.log('草稿内容为:',draft)
    if (draft && typeof draft === 'object') {
      // 回显表单数据
      title.value = draft.title || '';
      description.value = draft.description || '';
      images.value = draft.images && Array.isArray(draft.images) ? draft.images : [];
      price.value = draft.price || '';
      originalPrice.value = draft.originalPrice || '';
      tradeMethod.value = draft.tradeMethod || '';
      selectedCategory.value = draft.category || '';
      selectedSubcategory.value = draft.subcategory || '';
      selectedCondition.value = draft.condition || '';
      negotiable.value = draft.negotiable || '不小刀';
      negotiablePrice.value = draft.negotiablePrice || '';
      showPriceInput.value = draft.negotiable && draft.negotiable.includes('可小刀') ? true : false;
    }
  } catch (error) {
    console.error('加载草稿失败:', error);
  }
};

// 选择图片并上传
const chooseImage = async () => {
  if (images.value.length >= 9) {
    uni.showToast({
      title: '最多只能上传9张图片',
      icon: 'none'
    });
    return;
  }
  
  // 1. 选择图片，获取临时路径数组
  const chooseRes = await uni.chooseImage({
    count: 9 - images.value.length, // 最多选择剩余可上传数量
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera']
  });
  
  // 2. 显示全局加载中（避免多次弹窗）
  uni.showLoading({ title: '上传中...', mask: true });
  
  try {
    // 3. 循环上传图片（并行上传优化）
    const uploadPromises = chooseRes.tempFilePaths.map(async (tempPath) => {
      // 调用上传接口
      const uploadRes = await uni.uploadFile({
        url: 'https://api.shaolezhuan.cn/api/upload/image',
        filePath: tempPath, // 临时路径作为上传源
        name: 'file', // 后端接收文件的参数名（需与后端一致）
        header: {
          // 兼容后端两种写法：部分接口要求 Bearer，部分接口直接传 token
          'Authorization': uni.getStorageSync('token')?.startsWith('Bearer')
            ? uni.getStorageSync('token')
            : `Bearer ${uni.getStorageSync('token')}`
        },
        formData: { 
          userId: uni.getStorageSync('userId'), // 注意：formData需要是对象格式
          token: uni.getStorageSync('token')
        }
      });
      
      // 解析上传结果（兼容字符串/多种结构）
      let parsed = null;
      let urlCandidate = null;

      // 1) 尝试当作JSON解析
      if (typeof uploadRes.data === 'string') {
        try {
          parsed = JSON.parse(uploadRes.data);
        } catch (e) {
          // 非JSON字符串，可能就是URL
          urlCandidate = uploadRes.data;
        }
      } else {
        parsed = uploadRes.data;
      }

      // 2) 从常见结构提取URL（全面兼容后端返回）
      if (!urlCandidate && parsed) {
        // 普通对象或 data 包裹对象
        const d = parsed.data ?? parsed;
        // 数组场景（data是数组）
        if (Array.isArray(d)) {
          const first = d[0] ?? {};
          urlCandidate = first.url || first.fileUrl || first.path || null;
        } else {
          urlCandidate = d.url || d.fileUrl || d.path || d.src || d.link || null;
        }
      }

      // 3) 归一化为绝对URL
      const finalUrl = normalizeImageUrl(urlCandidate);
      console.log('上传结果原始：', uploadRes.data, '解析：', parsed, '归一化URL：', finalUrl);

      // 4) 校验返回码 + URL
      const ok = uploadRes.statusCode === 200 || parsed?.code === 200 || parsed?.status === 200;
      if (!ok) {
        throw new Error(`图片上传失败: ${(parsed && (parsed.msg || parsed.message)) || uploadRes.errMsg || '未知错误'}`);
      }
      if (!finalUrl) {
        throw new Error('图片上传失败: 返回数据缺少URL');
      }
      return finalUrl;
    });
    
    // 4. 等待所有图片上传完成，获取所有URL
    const newUrls = await Promise.all(uploadPromises);
    
    // 5. 将新上传的URL添加到数组中
    images.value = [...images.value, ...newUrls];
    console.log('所有图片上传完成，永久URL列表:', images.value);
    
    uni.showToast({
      title: `成功上传${newUrls.length}张图片`,
      icon: 'success'
    });
    
  } catch (error) {
    console.error('上传失败:', error);
    uni.showToast({
      title: error.message || '图片上传失败',
      icon: 'none'
    });
  } finally {
    // 无论成功失败，都关闭加载
    uni.hideLoading();
  }
};

// 删除商品图片（前端删除+后端同步删除）
const deleteImage = async (index) => {
  // 1. 获取要删除的图片永久URL
  const deleteUrl = images.value[index];
  console.log('要删除的文件路径:', deleteUrl);
  if (!deleteUrl) return;

  // 2. 弹出确认弹窗
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？删除后不可恢复',
    cancelText: '取消',
    confirmText: '删除',
    async success(res) {
      if (res.confirm) { 
        uni.showLoading({ title: '删除中...', mask: true });

        try {
          // 3. 调用后端删除接口（DELETE 请求，fileUrl 通过 Query 传参）
          const token = uni.getStorageSync('token');
          const auth = token?.startsWith('Bearer') ? token : `Bearer ${token}`;
          const url = `https://api.shaolezhuan.cn/api/upload/file?fileUrl=${encodeURIComponent(deleteUrl)}`;
          const deleteRes = await uni.request({
            url,
            method: 'DELETE',
            header: {
              'Authorization': auth,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          // 4. 解析响应
          const deleteData = deleteRes.data;
          if (deleteData.code === 200 || deleteRes.statusCode === 200 || deleteRes.statusCode === 204) {
            // 5. 前端数组同步删除
            images.value.splice(index, 1);
            uni.showToast({ title: '删除成功', icon: 'success' });
          } else {
            // 后端删除失败仍前端删除（可选逻辑）
            images.value.splice(index, 1);
            uni.showToast({ 
              title: '图片已从列表移除，服务器删除失败', 
              icon: 'none' 
            });
            console.warn('后端删除失败:', deleteData.msg);
          }
        } catch (error) {
          // 网络异常等情况处理
          images.value.splice(index, 1);
          uni.showToast({ 
            title: '网络异常，图片已从本地移除', 
            icon: 'none' 
          });
          console.error('删除异常:', error);
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

// 分类数据
const categoryMap = {
  '电子数码': ['电脑外设', '耳机音响', '手机平板', '智能设备', '其他'],
  '自行车': ['普通自行车', '山地车', '公路自行车', '电动自行车', '其他'],
  '电器': ['吹风机', '干衣袋', '电灯风扇', '小厨具', '其他'],
  '体育用品': [ '各种球类', '各种球拍', '健身器材', '运动装备', '其他'],
  '二手书': [ '大一教材', '大二教材', '大三教材', '小说漫画', '其他'],
  '生活用品': ['美容/护肤品', '服饰服装', '衣架/收纳', '椅子抱枕', '其他'],
  '虚拟物品': ['游戏账号', '陪玩代打', '数字会员', '线上课程', '其他'],
  '其他': ['学习用品', '手工制品', '宠物用品', '办公用品', '其他']
};

// 成色选项
const conditions = ['99新', '95新', '9成新', '8成新', '7成新', '6成新及以下'];

// 选中的值
const selectedCategory = ref('');
const selectedSubcategory = ref('');
const selectedCondition = ref('');

// 下拉面板控制
const activeSelector = ref(0); // 0: 关闭, 1: 物品种类, 2: 子分类, 3: 成色

// 1. 弹窗状态
// 弹窗控制
const showPopup = ref(true);
// 倒计时秒数
const countdown = ref(3);
// 定时器标识
let timer = null;

// 切换下拉面板
const toggleSelector = (type) => {
  // 如果点击的是已激活的面板，则关闭
  if (activeSelector.value === type) {
    activeSelector.value = 0;
  } else {
    // 子分类需要先选择主分类
    if (type === 2 && !selectedCategory.value) return;
    activeSelector.value = type;
  }
};

// 关闭所有下拉面板
const closeAllSelectors = () => {
  activeSelector.value = 0;
};

// 选择物品种类
const selectCategory = (category) => {
  selectedCategory.value = category;
  // 重置子分类
  selectedSubcategory.value = '';
  activeSelector.value = 0;
};

// 选择子分类
const selectSubcategory = (subcategory) => {
  selectedSubcategory.value = subcategory;
  activeSelector.value = 0;
};

// 选择成色
const selectCondition = (condition) => {
  selectedCondition.value = condition;
  activeSelector.value = 0;
};

// 商品描述
const description = ref('');
const title = ref('');

// 价格相关
const price = ref('');
// 原价
const originalPrice = ref(''); 
const showPriceModal = ref(false);

// 交易方式相关
const tradeMethods = [
  { label: '线下自行交易', value: '线下自行交易' },
];
const tradeMethod = ref('');
const showTradeModal = ref(false);

// 选择交易方式
const selectTradeMethod = (value) => {
  tradeMethod.value = value;
  tradePopup.value.close();
};

const pricePopup= ref(null);
// 打开价格弹窗
const handleOpenPricePopup = async () => {
  try {
    await nextTick();
	pricePopup.value?.open('bottom'); 
  } catch (error) {
    console.error('打开价格弹窗失败:', error);
    uni.showToast({ title: '打开价格弹窗失败', icon: 'none' });
  }
};

//取消
const PriceModalCancel=()=>{
	pricePopup.value?.close();
	price.value=''
}
//确认
const PriceModalConfirm = () => {
  // 验证售价
  if (!price.value) {
    uni.showToast({ title: '请输入售价', icon: 'none' });
    return;
  }
  // 验证原价
  if (originalPrice.value) {
    if (Number(originalPrice.value) <= 0) {
      uni.showToast({ title: '原价必须大于0', icon: 'none' });
      return;
    }
    if (Number(originalPrice.value) < Number(price.value)) {
      uni.showToast({ title: '原价不能低于售价', icon: 'none' });
      return;
    }
  }
  console.log(originalPrice.value)
  pricePopup.value?.close();
};

const tradePopup= ref(null);
// 打开交易方式弹窗
const handleOpenTradePopup = async () => {
  try {
    await nextTick();
	tradePopup.value?.open('bottom');
  } catch (error) {
    console.error('打开交易方式弹窗失败:', error);
    uni.showToast({ title: '打开交易方式弹窗失败', icon: 'none' });
  }
};

// 控制是否显示可刀价格输入区域
const showPriceInput = ref(false);
const negotiable =ref();
// 可刀价格
const negotiablePrice = ref('');
const negotiablePopup = ref(null);
// 打开小刀弹窗
const handleOpenNegotiable = async () => {
  try {
    await nextTick();
	negotiablePopup.value?.open('bottom'); 
	// console.log(negotiable.value)
  } catch (error) {
    console.error('打开小刀弹窗失败:', error);
    uni.showToast({ title: '打开小刀弹窗失败', icon: 'none' });
  }
};
// 处理“是/否”选择
const handleOptionSelect = (isNegotiable) => {
  if (isNegotiable) {
    // 选择“是”，显示可刀价格输入区域
    showPriceInput.value = true;
  } else {
    // 选择“否”，关闭弹窗
	negotiable.value = '不小刀'
    negotiablePopup.value?.close()
  }
};

const negotiablemoney = ref()
// 确认可刀价格
const confirmNegotiablePrice = () => {
  if (negotiablePrice.value) {
	negotiable.value = '可小刀'+ negotiablePrice.value + '元'
	negotiablePopup.value?.close()
  } else {
    uni.showToast({
      title: '请输入可刀价格',
      icon: 'none'
    });
  }
};

// 取消发布
const onCancel = () => {
  uni.navigateBack();
};

// 发布商品
const onPublish = async () => {
  // 发布前拦截：登录 → 学生认证 → 会员等级
  if (!ensureLoggedIn({ content: '登录后才能发布商品', redirectTo: '/pages/mine/mine' })) return;
  if (!ensureStudentCertified({ content: '发布商品需先完成学生认证' })) return;
  if (!ensureMembership('normal', { content: '发布商品需普通会员或以上' })) return;
  // 会员数量限制：交由后端统一校验并返回提示文案
  // 仅在前端读取会员类型，用于后续弹框按钮文案（去升级/我已知晓）
  // 为兼容后端返回中文/数字等格式，对 membershipType 进行归一化
  const rawMembershipType = uni.getStorageSync('membershipType');
  const membershipType = (() => {
    const val = String(rawMembershipType ?? '').trim();
    const lower = val.toLowerCase();
    if (!val) return 'none';
    if (/白金/.test(val) || lower.includes('platinum') || val === '2' || lower.includes('vip_platinum') || lower.includes('platinum_member')) return 'platinum';
    if (/普通/.test(val) || lower === 'normal' || val === '1' || lower.includes('vip') || lower.includes('member')) return 'normal';
    return lower === 'platinum' || lower === 'normal' ? lower : 'none';
  })();
  // 简单验证
  if (images.value.length === 0) {
    uni.showToast({
      title: '请至少上传一张图片',
      icon: 'none'
    });
    return;
  }
  
  if (!description.value.trim()) {
    uni.showToast({
      title: '请填写商品描述',
      icon: 'none'
    });
    return;
  }
  
  if (!title.value.trim()) {
    uni.showToast({
      title: '请填写商品标题',
      icon: 'none'
    });
    return;
  }
  
  if (!price.value) {
    uni.showToast({
      title: '请填写价格',
      icon: 'none'
    });
    handleOpenPricePopup();
    return;
  }
  
  if (!tradeMethod.value) {
    uni.showToast({
      title: '请选择交易方式',
      icon: 'none'
    });
    handleOpenTradePopup();
    return;
  }
  
  if (!selectedCategory.value) {
    uni.showToast({ title: '请选择物品种类', icon: 'none' });
    return;
  }
  if (!selectedCondition.value) {
    uni.showToast({ title: '请选择商品成色', icon: 'none' });
    return;
  }
  
  // 获取分类ID
  const getCategoryId = () => {
    // 定义分类与ID的映射关系
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
    
    // 根据选中的分类名返回对应的ID，默认返回0表示未找到
    return categoryIdMap[selectedCategory.value] || 0;
  };
  //获取对应的商品ID（对象）
  const categoryId = getCategoryId();
  
  // 将属性对象转换为JSON字符串
   const attributesObj = {
      category: selectedCategory.value,
      subcategory: selectedSubcategory.value,
      condition: selectedCondition.value
   };
  
  const getSubmitData = () => {
    return {
	  title: title.value,
	  description: description.value.trim(),
	  price: Number(price.value),
	  originalPrice: originalPrice.value,
	  categoryId: categoryId,//分类ID
	  attributes: JSON.stringify(attributesObj),//对象属性
	  isNegotiable: !(negotiable.value === undefined || negotiable.value === '不小刀'),
	  maxNegotiableAmount: negotiablePrice.value, //砍价金额
	  tradingMethod: tradeMethod.value,//交易方式
	  mainImageUrl: images.value[0],//商品主图链接
	  // 详情图提交为逗号分隔字符串（排除主图），以匹配后端 JSON 反序列化期望的 String 类型
	  detailImages: images.value.slice(1).join(','),
    };
  };
  
  // 构建表单数据
  const productData = getSubmitData() 
  console.log('前端打包的发布商品数据:', productData);
  
   try {
      // 提交发布商品
      const createProductRes = await productApi.postProduct(productData);
      console.log('后端订单返回的结果为：', createProductRes)
      
      // 发布成功后跳转（兼容201 Created）
      if (createProductRes.code === 200 || createProductRes.code === 201) {
        uni.showToast({
          title: '发布成功',
          icon: 'success'
        });
        
        // 先重置表单再跳转
        resetForm();
        uni.removeStorageSync('productDraft');
		
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/wait/wait' 
          });
        }, 500)
      } else if (createProductRes.code === 403) {
        // 后端返回限制（比如达到发布次数/数量上限），弹窗提示用户
        const msg = createProductRes.msg || createProductRes.message || '发布受限，请稍后再试';
        uni.showModal({
          title: '发布提醒',
          content: msg,
          cancelText: '去管理',
          confirmText: membershipType === 'platinum' ? '我已知晓' : '去升级',
          success: (res) => {
            if (res.confirm) {
              if (membershipType === 'platinum') {
                // 白金会员：只关闭弹窗
              } else {
                uni.navigateTo({ url: '/pages/membership/membership' });
              }
            } else {
              uni.navigateTo({ url: '/pages/publish/publish' });
            }
          }
        });
      } else {
        // 其他业务失败：同样使用微信原生弹框样式，并沿用后端 msg
        const msg = createProductRes.msg || createProductRes.message || '发布失败，请稍后再试';
        uni.showModal({
          title: '发布提醒',
          content: msg,
          cancelText: '去管理',
          confirmText: membershipType === 'platinum' ? '我已知晓' : '去升级',
          success: (res) => {
            if (res.confirm) {
              if (membershipType === 'platinum') {
                // 白金会员：仅关闭弹框
              } else {
                uni.navigateTo({ url: '/pages/membership/membership' });
              }
            } else {
              uni.navigateTo({ url: '/pages/publish/publish' });
            }
          }
        });
      }
    } catch (error) {
      // 请求失败（如网络错误、服务器异常等）
      console.error('发布商品请求失败:', error);
      uni.showToast({
        title: '发布商品请求失败，请检查网络或稍后再试',
        icon: 'none'
      });
    }
};

// 草稿弹窗引用
const draftPopup = ref(null);

const draftData = ref({});

// 取消草稿：直接退出页面
const handleDraftCancel = () => {
  draftPopup.value?.close();
  setTimeout(() => {
    // 返回上一页
    uni.navigateBack({ delta: 1 });  
    }, 300);
};

// 保存草稿并退出
const handleSaveDraft = () => {
  // 构建完整的草稿数据（与回显字段对应）
  draftData.value = {
    title: title.value,
    description: description.value.trim(),
    images: [...images.value], // 深拷贝图片数组，避免引用问题
    price: price.value,
    originalPrice: originalPrice.value,
    tradeMethod: tradeMethod.value,
    category: selectedCategory.value,
    subcategory: selectedSubcategory.value,
    condition: selectedCondition.value,
    negotiable: negotiable.value || '不小刀',
    negotiablePrice: negotiablePrice.value,
    saveTime: new Date().getTime() // 记录保存时间，便于后续管理
  };

  // 存入本地缓存（使用自定义的setStorage或原生API均可）
  setStorage('productDraft', draftData.value);
  // 若自定义setStorage有问题，可替换为原生API：
  // uni.setStorageSync('productDraft', draft);

  uni.showToast({ title: '草稿保存成功', icon: 'success' });
  console.log('保存的草稿内容:', draftData.value);
  
  draftPopup.value?.close();
  // 延迟退出，确保提示可见
  setTimeout(() => {
    uni.navigateBack({ delta: 1 });
  }, 1500);
};

const handleBack = () => {
  // 检查是否有表单内容
  if (description.value.trim() || images.value.length || price.value || tradeMethod.value) {
    // 显示草稿保存弹窗
    if (draftPopup.value) {
      draftPopup.value.open('center');
    }
    return true; // 拦截返回
  } else {
    // 无内容时直接返回
    uni.navigateBack({ delta: 1 });
    return false;
  }
};
// 监听页面返回，使用onBackPress生命周期钩子
onBackPress((options) => {
  if (options.from === 'backbutton') {
    return handleBack(); // 调用统一处理函数
  }
  return false;
});

// 新增表单重置函数
const resetForm = () => {
  // 清空图片
  images.value = [];
  
  //清空标题
  title.value = '';
  // 清空文本描述
  description.value = '';
  
  // 重置分类选择
  selectedCategory.value = '';
  selectedSubcategory.value = '';
  selectedCondition.value = '';
  activeSelector.value = 0;
  
  // 清空价格相关
  price.value = '';
  originalPrice.value = '';
  
  // 重置交易方式
  tradeMethod.value = '';
  
  // 重置可刀设置
  negotiable.value = '';
  negotiablePrice.value = '';
  showPriceInput.value = false;
  
  // 关闭所有弹窗
  pricePopup.value?.close();
  tradePopup.value?.close();
  negotiablePopup.value?.close();
  draftPopup.value?.close();
};

// 生命周期钩子
onMounted(() => {
  // 未登录弹窗提醒；仍启动倒计时，避免弹窗卡住
  if (!ensureLoggedIn({ content: '登录后才能发布商品', redirectTo: '/pages/mine/mine' })) {
    startCountdown();
    return;
  }
  // 学生认证与普通会员拦截
  if (!ensureStudentCertified({ content: '发布商品需先完成学生认证' })) {
    startCountdown();
    return;
  }
  if (!ensureMembership('normal', { content: '发布商品需普通会员或以上' })) {
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

/* 导航栏样式 */
.nav-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.publish-btn {
  color: #fff;
  background-color: #FFCC00;
  border-radius: 30rpx;
  font-size: 36rpx;
  width: 100%;
  margin-top: 15rpx;
}

/* 图片上传区域 */
.upload-area {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.upload-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-btn {
  border: 2rpx dashed #ddd;
  background-color: #fafafa;
}

.image-item {
  position: relative;
  overflow: hidden;
}

.upload-img {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 输入区域 */
.input-area1 {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
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
  text-align: left; /* 新增：文字左对齐 */
}

.desc-input {
  width: 100%;
  min-height: 180rpx;
  font-size: 32rpx;
  line-height: 1.5;
  text-align: left; /* 新增：文字左对齐 */
}

.word-count {
  text-align: right;
  font-size: 28rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 选项列表 */
.options-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
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

/* 价格弹窗 */
.price-input-container {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 1px solid #eee;
  border-radius: 12rpx;
  margin-bottom: 40rpx;
}

/* 价格标签（售价/原价） */
.price-label {
  width: 120rpx;
  font-size: 32rpx;
  color: #333;
}

/* 输入框容器 */
.price-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #eee;
  padding-bottom: 40rpx;
}

.rmb-sign {
  font-size: 40rpx;
  color: #333;
  margin-right: 16rpx;
}

/* 服务费说明 */
.service-fee-desc {
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.fee-rate{
	color:#00c41d;
	margin-left: 20rpx;
	font-size: 32rpx
}

.fee-text {
  font-size: 26rpx;
  color: #999;
}


.price-input {
  flex: 1;
  font-size: 28rpx;
  height: 80rpx;
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

.options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.option-btn {
  width: 200rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.option-btn:active {
  background-color: #cccccc;
}

.price-input-area {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.price-input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 8rpx;
  padding: 10rpx;
}

.confirm-price-btn {
/*  padding: 10rpx 20rpx; */
  width: 150rpx;
  text-align: center;
  background-color: #007aff;
  color: #fff;
  border-radius: 8rpx;
}

/* 选择器容器 */
.category-selectors {
  position: relative;
  width: 100%;
}

/* 三个选择器一排显示 */
.select-row {
  margin: 15rpx ;
  display: flex;
  border: 1px solid #eee;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #fff;
}
/* 单个选择器样式 */
.select-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  font-size: 30rpx;
  position: relative;
}
/* 选择器之间的分隔线 */
.select-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10rpx;
  height: 60rpx;
  width: 1px;
  background-color: #eee;
}
/* 选择器值的样式 */
.select-value {
  color: #333;
}
.select-item:not(.disabled) .select-value {
  color: #666;
}
/* 禁用状态 */
.disabled {
  color: #ccc;
  pointer-events: none;
}
/* 箭头旋转动画 */
.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
/* 下拉面板 */
.select-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  max-height: 500rpx;
  overflow-y: auto;
}
.panel-content {
  background-color: #fff;
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 8rpx 8rpx;
}
/* 选项列表 */
.option-list {
  display: flex;
  flex-wrap: wrap;
}
/* 选项项 */
.option-item2 {
  width: 33.333%;
  padding: 28rpx 0;
  text-align: center;
  font-size: 30rpx;
  color: #333;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  box-sizing: border-box;
}
/* 去除最后一列的右边框 */
.option-item2:nth-child(3n) {
  border-right: none;
}
/* 选项点击效果 */
.option-item2:active {
  background-color: #f5f5f5;
}
/* 遮罩层 */
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 98;
}

/* 自定义导航栏样式 */
.custom-nav {
  /* 状态栏高度 + 导航栏本身高度 */
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

.nav-right {
  position: absolute;
  right: 16px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  text-align: left; /* 新增：文字左对齐 */
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