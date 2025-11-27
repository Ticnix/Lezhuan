<template>
  <view class="user-page">
    <!-- 带有光斑效果的头部区域 -->
    <view class="header-container">
      <!-- 顶部留白区域 -->
      <view class="top-space"></view>
      <!-- 顶部用户信息区域 -->
      <view class="user-info">
        <view class="avatar" @click="handleLogin">
          <image
            :src="userInfo?.avatarUrl "
            mode="aspectFill"
          ></image>
        </view>
        <view class="nickname-id">
          <text class="nickname">{{ userInfo?.nickname || '点击头像登录' }}</text>
          <text class="id">
            用户ID: {{ studentIdNumber || '请完成学生认证' }}
          </text>
        </view>
        <view class="setting-btn" @click="handleSetting">
          <uni-icons type="gear" size="30"></uni-icons>
        </view>
      </view>

      <!-- 权益/轮播图区域 -->
      <view class="benefit-banner">
        <template v-if="studentAuthenticated">
          <swiper class="banner-swiper" autoplay interval="3000" circular>
            <swiper-item v-for="(item, index) in bannerList" :key="index">
              <image :src="item.imageUrl" mode="widthFix" class="banner-img" @click="handleBannerClick(item)"></image>
            </swiper-item>
          </swiper>
        </template>
        <template v-else>
          <view class="auth-card" @click="handleAuth">
            <view class="auth-content">
              <text class="auth-text">完成学生认证可解锁更多功能，上传学生证、饭卡或学信网证明均可</text>
              <button class="auth-button">立即认证</button>
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- 功能按钮区域 -->
	<view class="function-buttons">
	  <view class="button-group">
		<!-- 我发布的 -->
		<button class="function-btn" @click="handlePublish">
		  <view class="icon-wrapper publish">
			<image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/publish-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>我发布的</text>
		</button>
		<!-- 我卖出的 -->
		<button class="function-btn" @click="handleSell">
		  <view class="icon-wrapper sell">
			<image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/sell-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>我卖出的</text>
		</button>
		<!-- 消息 -->
		<button class="function-btn" @click="handleMessage">
		  <view class="icon-wrapper message">
		    <image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/message-icon.png" mode="aspectFit" class="btn-icon"></image>
		    <!-- 未读消息徽章 -->
		    <view class="unread-badge" v-if="unreadCount > 0">
		      <text class="badge-text">{{ unreadCount }}</text>
		    </view>
		  </view>
		  <text>消息</text>
		</button>				
		<!-- 历史浏览 -->
		<button class="function-btn" @click="handleHistory">
		  <view class="icon-wrapper history">
			<image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/history-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>历史浏览</text>
		</button>
	  </view>
	  <view class="button-group">
		<!-- 我的需求 -->
		<button class="function-btn" @click="handleDemand">
		  <view class="icon-wrapper demand">
			<image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/demand-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>我的需求</text>
		</button>
		<!-- 收藏 -->
		<button class="function-btn" @click="handleCollect">
		  <view class="icon-wrapper collect">
			<image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/collect-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>收藏</text>
		</button>
		<!-- 用户指南 -->
		<button class="function-btn" @click="handleGuide">
		  <view class="icon-wrapper guide">
			<image src="https://api.shaolezhuan.cn/lzphoto/mine-icons/guide-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>用户指南</text>
		</button>
		<!-- 其他 -->
		<button class="function-btn" @click="handleWant">
		  <view class="icon-wrapper want">
			<image src="https://api.shaolezhuan.cn/lzphoto//mine-icons/want-icon.png" mode="aspectFit" class="btn-icon"></image>
		  </view>
		  <text>...</text>
		</button>
	  </view>
	</view>

   <!-- 客服按钮容器 -->
   <view class="contact-btn-container">
     <!-- 原微信客服按钮：使用小程序原生事件写法 -->
     <button 
       open-type="contact" 
       @contact="handleContact" 
       session-from="sessionFrom"
       class="original-contact-btn"
     >
       联系客服
     </button>
   
     <!-- 自定义客服按钮：点击触发自定义逻辑 -->
     <button 
       class="contact-service-btn" 
       @click="handleContactService"
     >
       联系客服
     </button>
   </view>
    
	<!-- 重新登录提示（当code无效时显示） -->
    <view v-if="needRelogin" class="relogin-tip">
      <button @click="handleRelogin">重新登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed ,onUnmounted} from 'vue';
import { onShow } from '@dcloudio/uni-app';
import userApi from '@/api/user.js';
import chatApi from '@/api/chat.js';
import { useStorage } from '@/hooks/useStorage'; // 自定义存储hook
import { ensureLoggedIn } from '@/utils/uniHelper';

// 存储相关
const { getStorage, setStorage } = useStorage();
const userId = computed(() => getStorage('userId'));
const token = computed(() => getStorage('token'));

// 响应式数据
const userInfo = ref(null);
const studentInfo = ref(null);
const studentAuthenticated = ref(false);//学生认证是否认证通过
const studentStatus = ref(null);//学生认证状态（pending_review-待审核, approved-已通过, rejected-已拒绝, not_verified-未申请认证）
const needRelogin = ref(false);
const studentIdNumber = ref(null);

// 头像与昵称回退相关：当基础库统一返回默认头像/昵称时，为用户分配更好看的随机头像与随机昵称
const DEFAULT_AVATAR_URL = 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar3.jpg';
const RANDOM_AVATARS = [
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar3.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar4.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar5.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar6.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar7.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar8.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar9.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar10.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar11.jpg',
  'https://api.shaolezhuan.cn/lzphoto/avatars/avatar12.jpg',
];
const pickRandomAvatar = () => {
  const idx = Math.floor(Math.random() * RANDOM_AVATARS.length);
  return RANDOM_AVATARS[idx] || DEFAULT_AVATAR_URL;
};
const isDefaultNickname = (name) => {
  if (!name) return true;
  const normalized = String(name).trim();
  return (
    normalized === '微信用户' ||
    normalized === '用户' ||
    normalized === '未知用户' ||
    normalized === '点击头像登录'
  );
};
const isInvalidAvatar = (url) => {
  if (!url) return true;
  const u = String(url).trim();
  // 基础库可能返回统一头像或空值，统一按无效处理
  return u === '' || /default|placeholder/i.test(u);
};
const generateRandomNickname = () => {
  // 简洁好看的随机昵称：乐赚用户 + 4位数字
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `乐转用户${suffix}`;
};
const bannerList = ref([
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/membership/m1.jpg' },
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/membership/m2.jpg' },
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/membership/m3.jpg' },
  { imageUrl: 'https://api.shaolezhuan.cn/lzphoto/membership/m4.jpg', link: '/pages/promo/promo' }
]);

const unreadCount = ref(0); // 未读消息总数
// 定时器实例（用于页面卸载时清除）
const unreadTimer = ref(null);
// 页面显示时触发（包括从其他页面返回）：刷新用户信息与未读消息
onShow(() => {
  if (token.value && userId.value) {
    fetchUserInfo();
    fetchStudentInfo();
    fetchUnreadMessages();
    // 保证定时器仅启动一次
    if (!unreadTimer.value) startUnreadTimer();
  }
});

// 页面挂载时初始化
onMounted(() => {
  if (token.value && userId.value) {
    fetchUserInfo();
	fetchStudentInfo();
	fetchUnreadMessages(); 
	// 启动3秒刷新定时器
	startUnreadTimer();
  }
});

// 启动定时器：每3秒调用一次fetchUnreadMessages
const startUnreadTimer = () => {
  unreadTimer.value = setInterval(() => {
    fetchUnreadMessages();
  }, 3000); // 3000毫秒 = 3秒
};

// 调用“获取用户所有未读消息”接口
const fetchUnreadMessages = async () => {
  try {
    const userId = getStorage('userId');
    if (!userId) return; // 未登录则跳过

    const res = await chatApi.unreadMessages(userId);
	console.log('获取用户所有未读消息返回信息:',res)

    if (res.code === 200) {
      unreadCount.value = res.data.totalUnreadCount || 0;
    }
  } catch (err) {
    console.error('获取未读消息失败:', err);
  }
};


// 获取用户信息（当服务端返回默认头像/昵称时，优先使用本地缓存或默认头像做展示）
const fetchUserInfo = async () => {
  try {
    const res = await userApi.getCurrentUser();
    if (res.code === 200) {
      const serverData = res.data || {};
      const cachedNickname = uni.getStorageSync('nickname');
      const cachedAvatar = uni.getStorageSync('avatarUrl');
      const serverAvatar = serverData.avatarUrl;
      const finalAvatarUrl = isInvalidAvatar(serverAvatar)
        ? (cachedAvatar || DEFAULT_AVATAR_URL)
        : serverAvatar;
      // 统一规范 membershipType：将后端可能返回的中文/大小写/数字统一映射
      const normalizeMembershipType = (raw) => {
        const val = String(raw ?? '').trim();
        const lower = val.toLowerCase();
        if (!val) return 'none';
        // 中文与常见别名映射
        if (/白金/.test(val) || lower.includes('platinum') || val === '2' || lower.includes('vip_platinum') || lower.includes('platinum_member')) {
          return 'platinum';
        }
        if (/普通/.test(val) || lower === 'normal' || val === '1' || lower.includes('vip') || lower.includes('member')) {
          return 'normal';
        }
        // 已是标准值或其它未知
        return lower === 'platinum' || lower === 'normal' ? lower : 'none';
      };

      userInfo.value = {
        ...serverData,
        nickname: isDefaultNickname(serverData.nickname)
          ? (cachedNickname || serverData.nickname)
          : serverData.nickname,
        avatarUrl: finalAvatarUrl,
      };
	  uni.setStorageSync('membershipType', normalizeMembershipType(userInfo.value.membershipType));
      console.log('获取当前用户信息：', userInfo.value);
	}
  } catch (err) {
    console.error('获取用户信息失败:', err);
  }
};

// 获取用户学生认证状态信息
const fetchStudentInfo = async () => {
  try {
    const res = await userApi.studentInfoStatus();
    if (res.code === 200) {
      studentInfo.value = res.data;
      studentStatus.value = res.data.status;
	  
	  // console.log('认证状态：',studentStatus.value)
      console.log('获取当前用户学生认证状态：',studentInfo.value)
	  if (studentStatus.value === 'approved' ){
		studentAuthenticated.value = true;
		studentIdNumber.value = studentInfo.value.studentIdNumber
		//储存学号方便设置那里调用
		setStorage('studentIdNumber', studentIdNumber.value)
		console.log(studentIdNumber.value)
	  }
	}
  } catch (err) {
    console.error('获取学生认证失败:', err);
  }
};

// 处理登录流程
const handleLogin = async () => {
  // 已登录则给出提示弹窗并不再发起登录流程
  if (token.value && userId.value) {
    uni.showModal({ title: '提示', content: '您已登录，无需重复登录', showCancel: false });
    return;
  }
  try {
    // 获取用户头像和昵称
    const userProfileRes = await new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      });
    });
 
    // 获取登录凭证code
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        success: resolve,
        fail: reject
      });
    });

    if (!loginRes.code) {
      throw new Error('无法获取登录凭证');
    }

    // 读取本地已分配的昵称（头像在每次登录时随机分配）
    const storedNickname = uni.getStorageSync('nickname');

    // 计算用于提交给后端的头像与昵称（在基础库返回默认值时回退到更好看的固定头像与随机昵称）
    const nicknameCandidate = storedNickname || (
      isDefaultNickname(userProfileRes?.userInfo?.nickName)
        ? generateRandomNickname()
        : userProfileRes?.userInfo?.nickName
    );
    // 登录时为用户随机分配一个头像（参考提供的图片路径）
    const avatarCandidate = pickRandomAvatar();

    // 调用登录API
    const loginData = {
      code: loginRes.code,
      nickname: nicknameCandidate,
      avatarUrl: avatarCandidate,
    };
	
	console.log('code：',loginData.code)
	console.log('nickname（提交后端）：',loginData.nickname)
	console.log('avatarUrl（提交后端）：',loginData.avatarUrl)
    
    const res = await userApi.wxLogin(loginData);     
	 
    if (res.code === 200) {
      const userData = res.data;
      // 存储用户信息：若服务端仍返回默认值，则沿用我们提交的回退值，保证展示与存储一致
      const finalNickname = isDefaultNickname(userData?.nickname)
        ? loginData.nickname
        : userData.nickname;
      // 优先使用服务端返回的头像；如无效则使用本次随机分配的头像
      const finalAvatarUrl = !isInvalidAvatar(userData?.avatarUrl)
        ? userData.avatarUrl
        : loginData.avatarUrl;

      setStorage('token', userData.token);
      setStorage('nickname', finalNickname);
      setStorage('avatarUrl', finalAvatarUrl);
	  setStorage('userId', userData.userId);
	  setStorage('openid', userData.openid);
	  // 规范化 membershipType 后再写入本地
	  const normalizeMembershipType = (raw) => {
		const val = String(raw ?? '').trim();
		const lower = val.toLowerCase();
		if (!val) return 'none';
		if (/白金/.test(val) || lower.includes('platinum') || val === '2' || lower.includes('vip_platinum') || lower.includes('platinum_member')) {
		  return 'platinum';
		}
		if (/普通/.test(val) || lower === 'normal' || val === '1' || lower.includes('vip') || lower.includes('member')) {
		  return 'normal';
		}
		return lower === 'platinum' || lower === 'normal' ? lower : 'none';
	  };
	  uni.setStorageSync('membershipType', normalizeMembershipType(userData.membershipType));
	  console.log('后端返回的数据：',userData)
      
      // 更新页面数据
      userInfo.value = {
        nickname: finalNickname,
        avatarUrl: finalAvatarUrl,
      };
	  
	  //登录后马上获取学生认证信息
	  fetchStudentInfo();
	  fetchUnreadMessages();
      
      uni.showToast({ title: '登录成功', icon: 'success' });
    } else if (res.code === 400 && res.msg.includes('code无效')) {
      needRelogin.value = true;
      throw new Error('登录凭证已过期，请重新登录');
    } else {
      throw new Error(res.msg || '登录失败');
    }
  } catch (err) {
    uni.showToast({ title: err.message, icon: 'none' });
    console.error('登录过程出错:', err);
  }
};

// 重新登录
const handleRelogin = () => {
  needRelogin.value = false;
  handleLogin();
};

// 导航相关方法
const handleSetting = () => uni.navigateTo({ url: '/pages/setting/setting' });
const handleAuth = () => uni.navigateTo({ url: '/pages/student/student' });
const handlePublish = () => {
  if (!ensureLoggedIn({ content: '登录后才能查看我发布的商品', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({ url: '/pages/publish/publish' });
};
const handleSell = () => {
  if (!ensureLoggedIn({ content: '登录后才能查看我卖出的商品', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({ url: '/pages/sell/sell' });
};
const handleHistory = () => {
  if (!ensureLoggedIn({ content: '登录后才能查看历史浏览', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({ url: '/pages/history/history' });
};
const handleDemand = () => {
  if (!ensureLoggedIn({ content: '登录后才能查看我的需求', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({ url: '/pages/demand/demand' });
};
const handleCollect = () => {
  if (!ensureLoggedIn({ content: '登录后才能查看收藏', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({ url: '/pages/collect/collect' });
};
const handleMessage = () => {
  if (!ensureLoggedIn({ content: '登录后才能查看消息', redirectTo: '/pages/mine/mine' })) return;
  uni.navigateTo({ url: '/pages/message/message' });
};
const handleGuide = () => uni.navigateTo({ url: '/pages/guide/guide' });
const navigateToMembership = () => uni.navigateTo({ url: '/pages/membership/membership' });
// 点击轮播图：如果配置了 link 则跳转到对应页面，否则跳转到会员页
const handleBannerClick = (item) => {
  if (item && item.link) {
    uni.navigateTo({ url: item.link });
  } else {
    navigateToMembership();
  }
};

// 其他功能
const handleWant = () => {
  uni.showToast({
    title: '其他功能正在维护中',
    icon: 'none',
    duration: 2000,
    mask: true
  });
};

// 页面卸载时清除定时器（避免内存泄漏）
onUnmounted(() => {
  if (unreadTimer.value) {
    clearInterval(unreadTimer.value);
    unreadTimer.value = null;
  }
});

</script>

<style scoped>
/* 样式部分保持不变 */
.user-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 0 30rpx;
  overflow-x: hidden; /* 防止横向滚动偏移 */
}

.top-space {
  height: 180rpx;
}

.header-container {
  position: relative;
  margin-bottom: 30rpx;
}

.header-container::before {
  content: '';
  position: absolute;
  top: -200rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgba(255, 98, 253, 0.2) 0%, rgba(165, 8, 255, 0.0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.header-container::after {
  content: '';
  position: absolute;
  top: -400rpx;
  left: -300rpx;
  width: 850rpx;
  height: 850rpx;
  background: radial-gradient(circle, rgba(0, 85, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 25rpx;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.1);
  border: 4rpx solid #fff;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.nickname-id {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: block;
  color: #333;
}

.id {
  font-size: 28rpx;
  color: #666;
}

.setting-btn {
  padding: 10rpx;
  background-color: transparent;
  position: relative;
  z-index: 1;
}

.benefit-banner {
  position: relative;
  z-index: 1;
}

.banner-swiper {
  height: 220rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
}

.banner-img {
  width: 100%;
  height: 100%;
}

.auth-card {
  background: linear-gradient(245deg, 
    rgba(144, 70, 227, 0.6) 0%,   /* 带透明度的浅紫 */
    rgba(109, 7, 226, 0.3) 30%,  /* 带透明度的白色 */
    rgba(81, 90, 254, 0.6) 100%  /* 带透明度的粉紫 */
  );
  border-radius: 20rpx;
  box-shadow: 0 0 50rpx rgba(168, 142, 255, 0.2);
  overflow: hidden;
  position: relative;
}

.auth-content {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 24rpx;
  max-width: 500rpx;
}

.auth-button {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5ca8 100%);
  color: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 92, 168, 0.3);
}

.function-buttons {
  margin-bottom: 40rpx;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.function-btn {
  flex: 1;
  margin: 0 12rpx;
  padding: 28rpx 10rpx;
  padding-bottom: 0rpx;
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.function-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.03);
}

/* 1. 客服按钮容器：控制按钮位置和尺寸 */
.contact-btn-container {
  position: relative; /* 关键：让内部绝对定位按钮以容器为基准 */
  width: 100%;
  height: 80rpx; /* 与按钮高度一致，避免错位 */
  margin-bottom: 30rpx; /* 保持与其他元素的间距 */
}

/* 2. 原微信客服按钮（底层）：隐藏默认样式，与上层按钮对齐 */
.original-contact-btn {
  position: absolute; /* 绝对定位，与上层按钮重叠 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 底层：确保微信客服逻辑能触发 */
  /* 隐藏微信默认按钮样式，继承上层按钮的视觉效果 */
  background: transparent;
  color: transparent;
  border: none;
  padding: 0;
}

/* 3. 自定义客服按钮（上层）：保持原有样式，层级更高 */
.contact-service-btn {
  position: absolute; /* 绝对定位，覆盖底层按钮 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2; /* 上层：视觉上只显示这个按钮 */
  /* 保留原有样式，确保视觉统一 */
  font-size: 32rpx;
  background: linear-gradient(90deg, #87b5ff 0%, #7c89ff 100%);
  color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(51, 102, 255, 0.3);
  transition: all 0.2s ease;
  border: none; /* 清除默认边框 */
}

.contact-service-btn:active {
  transform: scale(0.99);
  box-shadow: 0 4rpx 12rpx rgba(51, 102, 255, 0.2);
}

.icon-wrapper {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;
}

.icon-wrapper.publish::before {
    content: '';
    position: absolute;
    width: 160rpx; 
    height: 160rpx;
    left: 50%;
    top: 50%;
    margin-left: -80rpx; 
    margin-top: -80rpx; 
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 165, 0, 0.2) 0%, transparent 70%);
    z-index: 0; 
}

.icon-wrapper.sell::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(23, 127, 255, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.icon-wrapper.want::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 200, 0, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.icon-wrapper.history::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 57, 43, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.icon-wrapper.demand::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.icon-wrapper.collect::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 106, 255, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.icon-wrapper.message::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 64, 255, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.icon-wrapper.guide::before {
  content: '';
  position: absolute;
  width: 160rpx; 
  height: 160rpx;
  left: 50%;
  top: 50%;
  margin-left: -80rpx; 
  margin-top: -80rpx; 
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 165, 0, 0.2) 0%, transparent 70%);
  z-index: 0;
}

.btn-icon {
  z-index: 1;
  width: 100%;
  height: 100%;
}
.original-contact-btn{
  z-index: 99;
}

.icon-wrapper.message {
  position: relative; /* 用于定位徽章 */
}

.unread-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #ff4500;
  color: #fff;
  font-size: 20rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.badge-text {
  font-size: 20rpx;
  font-weight: bold;
}
</style>
