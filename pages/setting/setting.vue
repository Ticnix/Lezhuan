<template>
  <view class="personal-info-page">
    <!-- 顶部背景装饰 -->
    <view class="top-bg"></view>
    
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="chooseAvatar">
        <image 
          :src="userInfo.avatarUrl || 'https://api.shaolezhuan.cn/lzphoto/avatars/avatar1.jpeg'" 
          class="avatar"
          mode="aspectFill"
        ></image>
      </view>
      <text class="nickname">{{ userInfo.nickName || '未设置昵称' }}</text>
      <text class="user-id">ID: {{ userInfo.studentIdNumber || '请完成学生认证' }}</text>
    </view>
    
    <!-- 信息表单区域 -->
    <view class="info-form">
      <!-- 性别选择 -->
      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="form-content">
          <picker 
            :range="genderOptions" 
            :value="genderIndex" 
            @change="onGenderChange"
            class="form-picker"
          >
            <text>{{ genderOptions[genderIndex] || '请选择' }}</text>
          </picker>
        </view>
      </view>
      
      <!-- 校区 -->
      <view class="form-item">
        <text class="form-label">校区</text>
        <view class="form-content">
          <picker 
            :range="campusOptions" 
            :value="campusIndex" 
            @change="onCampusChange"
            class="form-picker"
          >
            <text>{{ campusOptions[campusIndex] || '请选择' }}</text>
          </picker>
        </view>
      </view>
      
      <!-- 宿舍 -->
      <view class="form-item">
        <text class="form-label">宿舍</text>
        <view class="form-content">
          <picker 
            :range="dormitoryOptions" 
            :value="dormitoryIndex" 
            @change="onDormitoryChange"
            class="form-picker"
          >
            <text>{{ dormitoryOptions[dormitoryIndex] || '请选择' }}</text>
          </picker>
        </view>
      </view>
      
      <!-- 专业 -->
      <view class="form-item">
        <text class="form-label">专业</text>
        <view class="form-content">
          <input 
            v-model="userInfo.major" 
            type="text" 
            placeholder="请输入专业" 
            class="form-input"
          />
        </view>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <button class="save-btn" @click="saveInfo">保存信息</button>
    <!-- 退出登录按钮 -->
    <button class="logout-btn" @click="logout">退出登录</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 性别选项
const genderOptions = ref(['男', '女']);
const genderIndex = ref(0);

// 校区选项
const campusOptions = ref(['韶乐园校区', '黄田坝校区', '十里亭校区']);
const campusIndex = ref(0);

// 宿舍选项
const dormitoryOptions = ref([
  '紫竹苑', '紫薇苑', '紫荆苑', '银杏苑', '丹竹苑',
  '红枫苑', '丹枫苑', '红棉苑', '碧桂苑', '芙蓉苑',
  '蔷薇苑', '秋枫苑', '海棠苑', '丁香苑', '樱花苑',
  '梧桐苑', '金竹苑', '景行苑', '文杏苑', '丹桂苑',
  '碧桃苑', '紫藤苑'
]);
const dormitoryIndex = ref(0);

// 用户信息
const userInfo = ref({
  avatarUrl: '',
  nickName: '',
  studentIdNumber: '',
  campus: '',
  dormitory: '',
  major: ''
});

// 页面加载时获取已保存的用户信息
onMounted(() => {
  // 1. 先读取登录时单独存储的核心信息（优先级更高，避免信息不一致）
  const storedUserId = uni.getStorageSync('studentIdNumber');
  const storedNickname = uni.getStorageSync('nickname');
  const storedAvatarUrl = uni.getStorageSync('avatarUrl');
  // 2. 再读取之前保存的完整用户信息（如性别、校区等）
  const storedUser = uni.getStorageSync('userInfo');
  
  // 3. 合并信息：核心信息优先，补充其他配置信息
  userInfo.value = {
    // 登录时存储的核心字段
    studentIdNumber: storedUserId || storedUser.studentIdNumber || '',
    nickName: storedNickname || storedUser.nickName || '',
    avatarUrl: storedAvatarUrl || storedUser.avatarUrl || '',
    // 其他配置字段（从userInfo读取）
    gender: storedUser.gender || '',
    campus: storedUser.campus || '',
    dormitory: storedUser.dormitory || '',
    major: storedUser.major || ''
  };
  
  // 4. 同步选择器状态（保持原逻辑，确保下拉框显示正确）
  // 同步性别
  if (userInfo.value.gender) {
    const genderIdx = genderOptions.value.indexOf(userInfo.value.gender);
    if (genderIdx!== -1) genderIndex.value = genderIdx;
  }
  // 同步校区
  if (userInfo.value.campus) {
    const campusIdx = campusOptions.value.indexOf(userInfo.value.campus);
    if (campusIdx!== -1) campusIndex.value = campusIdx;
  }
  // 同步宿舍
  if (userInfo.value.dormitory) {
    const dormIdx = dormitoryOptions.value.indexOf(userInfo.value.dormitory);
    if (dormIdx!== -1) dormitoryIndex.value = dormIdx;
  }
});

// 性别选择变化
const onGenderChange = (e) => {
  genderIndex.value = e.detail.value;
  userInfo.value.gender = genderOptions.value[genderIndex.value];
};

// 校区选择变化
const onCampusChange = (e) => {
  campusIndex.value = e.detail.value;
  userInfo.value.campus = campusOptions.value[campusIndex.value];
};

// 宿舍选择变化
const onDormitoryChange = (e) => {
  dormitoryIndex.value = e.detail.value;
  userInfo.value.dormitory = dormitoryOptions.value[dormitoryIndex.value];
};

// 保存信息
const saveInfo = () => {
  // 1. 保存完整用户信息到userInfo存储项
  uni.setStorageSync('userInfo', userInfo.value);
  
  // 2. 同步更新核心字段的单独存储（确保登录相关页面能获取最新值）
  if (userInfo.value.studentIdNumber) uni.setStorageSync('studentIdNumber', userInfo.value.studentIdNumber);
  if (userInfo.value.nickName) uni.setStorageSync('nickname', userInfo.value.nickName);
  if (userInfo.value.avatarUrl) uni.setStorageSync('avatarUrl', userInfo.value.avatarUrl);
  
  // 3. 提示与后续逻辑（保持原逻辑）
  uni.showToast({
    title: '信息保存成功',
    icon: 'success'
  });
};

// 退出登录
const logout = () => {
  // 显示确认弹窗
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空缓存
        uni.clearStorageSync();
        // 刷新页面（可通过跳转当前页面实现）
        uni.reLaunch({
          url: '/pages/setting/setting' // 假设当前页面路径为 /pages/personal/personal
        });
      }
    }
  });
};
</script>

<style scoped>
.personal-info-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 0 30rpx;
}

/* 顶部背景装饰 */
.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  /* 垂直方向渐变，从顶部的渐变颜色到底部透明 */
  background: linear-gradient(to bottom, #bcb0ff, #deb5ff, rgba(123, 97, 255, 0));
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  z-index: 0;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80rpx;
  position: relative;
  z-index: 99;
  margin-bottom: 50rpx;
}

.avatar-wrapper {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  overflow: hidden;
  /* 新增渐变背景 */
  background: linear-gradient(45deg, #cdc0ff, #9baaff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  z-index: 1;
  /* 新增悬浮动画 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
/* 鼠标悬浮效果（H5 环境下） */
.avatar-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20rpx rgba(123, 97, 255, 0.5);
}

.avatar {
  width: 95%;
  height: 95%;
  border-radius: 50%;
  z-index: 99;
  border: 4rpx solid #fff;
}

.edit-avatar {
  position: absolute;
  bottom: 6rpx;
  right: 6rpx;
  width: 50rpx;
  height: 50rpx;
  background: linear-gradient(90deg, #ff5ca8, #ff8c66);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #fff;
  z-index: 100;
  /* 新增动画 */
  animation: pulse 2s infinite;
}
/* 编辑图标呼吸动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 92, 168, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10rpx rgba(255, 92, 168, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 92, 168, 0);
  }
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  /* 新增文字阴影 */
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.user-id {
  font-size: 28rpx;
  color: #666;
}

/* 表单区域 */
.info-form {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  /* 新增轻微渐变和悬浮效果 */
  background: linear-gradient(180deg, #ffffff, #f9f9f9);
  transition: box-shadow 0.3s ease;
}
.info-form:hover {
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  display: flex;
  align-items: center;
  height: 120rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 140rpx;
  font-size: 30rpx;
  color: #333;
}

.form-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-input {
  width: 100%;
  font-size: 30rpx;
  color: #333;
  padding-right: 30rpx;
}

.form-picker {
  width: 100%;
  font-size: 30rpx;
  color: #333;
  padding-right: 30rpx;
}

/* 保存按钮 */
.save-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(90deg, #aca4ff 0%, #e1bdff 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 50rpx;
  margin-top: 60rpx;
  box-shadow: 0 6rpx 16rpx rgba(123, 97, 255, 0.3);
  /* 新增按钮悬浮效果 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20rpx;
}
.save-btn:hover {
  transform: translateY(-3rpx);
  box-shadow: 0 8rpx 20rpx rgba(123, 97, 255, 0.4);
}

/* 退出登录按钮 */
.logout-btn {
  width: 100%;
  height: 100rpx;
  background-color: #ff6b6b;
  color: #fff;
  font-size: 32rpx;
  border-radius: 50rpx;
  margin-top: 0;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.logout-btn:hover {
  transform: translateY(-3rpx);
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.4);
}
</style>