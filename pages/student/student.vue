<template>
  <view class="student-auth-page">
    <!-- 顶部装饰背景 -->
    <view class="top-decor"></view>

    <!-- 标题区域 -->
    <view class="page-header">
      <text class="title">学生认证</text>
      <text class="subtitle">完成认证可解锁校园专属功能</text>
    </view>

    <!-- 认证表单区域 -->
    <view class="auth-form">
      <!-- 学校输入 -->
      <view class="form-item">
        <text class="form-label">所在学校</text>
        <view class="form-control">
          <input 
            v-model="studentInfo.university" 
            type="text" 
            placeholder="请输入学校全称" 
            class="input-control"
            @input="handleUniversityInput"
          />
        </view>
      </view>

      <!-- 学院选择 -->
      <view class="form-item">
        <text class="form-label">所属学院</text>
        <view class="form-control">
          <picker 
            :range="collegeOptions" 
            :value="collegeIndex" 
            @change="handleCollegeChange"
            class="picker-control"
          >
          <text class="picker-text">{{ collegeOptions[collegeIndex] || '请选择学院' }}</text>
          </picker>
        </view>
      </view>

      <!-- 专业输入 -->
      <view class="form-item">
        <text class="form-label">所学专业</text>
        <view class="form-control">
          <input 
            v-model="studentInfo.major" 
            type="text" 
            placeholder="请输入专业全称" 
            class="input-control"
            @input="handleMajorInput"
          />
        </view>
      </view>

      <!-- 学号输入 -->
      <view class="form-item">
        <text class="form-label">学号</text>
        <view class="form-control">
          <input 
            v-model="studentInfo.studentIdNumber" 
            type="text" 
            placeholder="请输入你的学号" 
            class="input-control"
            @input="handleStudentIdInput"
          />
        </view>
      </view>

      <!-- 学生证上传 -->
      <view class="form-item upload-item">
        <text class="form-label">学生证照片</text>
        <button 
          class="upload-container" 
          @click.stop="chooseStudentCard"
          hover-class="upload-hover"
        >
          <!-- 上传预览区 -->
          <view class="upload-preview">
            <image 
              :src="studentInfo.idCardUrl " 
              class="preview-img"
              mode="aspectFill"
            ></image>
            <!-- 上传提示图标 -->
            <view class="upload-tip" v-if="!studentInfo.idCardUrl">
              <uni-icons type="plus" size="36" color="#666"></uni-icons>
              <text class="tip-text">点击上传</text>
            </view>
            <!-- 已上传状态标识 -->
            <view class="uploaded-tag" v-if="studentInfo.idCardUrl">
              <uni-icons type="success" size="20" color="#fff"></uni-icons>
              <text class="tag-text">已上传</text>
            </view>
          </view>
          <text class="upload-hint">支持学生证封面/内页，清晰展示姓名、学号信息</text>
        </button>
      </view>
    </view>

    <!-- 提交按钮 -->
    <button 
      class="submit-btn" 
      @click="submitAuth"
      :disabled="!isFormValid || isSubmitting"
    >
      <!-- 提交中状态显示加载图标 -->
      <uni-icons type="loading" size="24" color="#fff" v-if="isSubmitting"></uni-icons>
      <text v-if="isSubmitting">提交中...</text>
      <text v-else>提交认证</text>
    </button>

    <!-- 认证说明 -->
    <view class="auth-note">
      <text class="note-text">• 认证信息将严格保密，仅用于校园身份核验</text>
      <text class="note-text">• 提交后将在1-2个工作日内审核完成</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import userApi from '@/api/user.js'; // 假设该API文件存在提交认证的接口
import { useStorage } from '@/hooks/useStorage';
import { ensureLoggedIn } from '@/utils/uniHelper';

// 存储相关
const { getStorage } = useStorage();

// 学院选项（修复原数组中的空值）
const collegeOptions = ref([
  '请选择学院', 
  '文学与传媒学院', 
  '外国语学院',
  '旅游与地理学院',
  '生物与农业学院',
  '数学与统计学院', 
  '智能工程学院', 
  '化学与土木工程学院', 
  '教育科学学院', 
  '信息工程学院', 
  '商学院', 
  '政法学院', 
  '音乐与舞蹈学院', 
  '美术与设计学院', 
  '体育学院',
  '医学院',
  '食品学院',
  '马克思主义学院'
]);

const collegeIndex = ref(0); // 初始化为0（默认显示“请选择学院”）
const isSubmitting = ref(false); // 提交中状态（防止重复提交）

// 学生认证信息
const studentInfo = ref({
  university: '',      // 学校
  college: '',         // 所属学院
  major: '',           // 专业
  studentIdNumber: '', // 学号
  idCardUrl: '',       // 学生证照片临时路径
  // idCardServerUrl: ''  // 服务器返回的图片永久URL（用于提交）
});

// 1. 学院选择处理（修复：仅选择有效学院时才赋值）
const handleCollegeChange = (e) => {
  collegeIndex.value = e.detail.value;
  // 排除“请选择学院”（索引0），仅赋值有效学院
  if (collegeIndex.value > 0) {
    studentInfo.value.college = collegeOptions.value[collegeIndex.value];
  } else {
    studentInfo.value.college = '';
  }
};

// 2. 输入框处理（保持原逻辑，确保去空格）
const handleUniversityInput = (e) => {
  studentInfo.value.university = e.detail.value.trim();
};

const handleMajorInput = (e) => {
  studentInfo.value.major = e.detail.value.trim();
};

const handleStudentIdInput = (e) => {
  studentInfo.value.studentIdNumber = e.detail.value.trim();
};

// 选择学生证照片：仅存储临时路径
const chooseStudentCard = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'], 
    sourceType: ['album', 'camera'],
    success: (res) => {
      studentInfo.value.idCardUrl = res.tempFilePaths[0]; // 存储本地临时路径
      uni.showToast({
        title: '图片选择成功',
        icon: 'success',
        duration: 1500
      });
    },
    fail: () => {
      uni.showToast({
        title: '图片选择失败，请重试',
        icon: 'none',
        duration: 1500
      });
    }
  });
};

// 页面进入拦截：未登录引导去登录
onMounted(() => {
  ensureLoggedIn({ content: '请先登录再进行学生认证', redirectTo: '/pages/mine/mine' });
});

const submitAuth = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    // 校验表单（确保所有必填项非空）
    if (!isFormValid.value) {
      uni.showToast({ title: '请完善所有必填信息', icon: 'none' });
      isSubmitting.value = false;
      return;
    }

    // 组装 formData 并提交（文本参数 + 文件）
    const userId = getStorage('userId');
    const token = getStorage('token');

    const uploadTask = uni.uploadFile({
      url: 'https://api.shaolezhuan.cn/student-verifications/submit', // 后端认证接口地址
      filePath: studentInfo.value.idCardUrl, // 本地临时文件路径
      name: 'cardPhoto', // 与后端参数名一致（formData 中的文件字段）
      formData: {
        university: studentInfo.value.university,
        college: studentInfo.value.college,
        major: studentInfo.value.major,
        studentIdNumber: studentInfo.value.studentIdNumber,
        userId: userId // 若后端需要用户ID，需传入
      },
      header: {
        'Authorization': token ? `Bearer ${token}` : '' // 携带Token（若需要）
      },
      success: (res) => {
        console.log('认证提交响应：', res);
        let data;
        try {
          data = JSON.parse(res.data);
        } catch (e) {
          uni.showToast({ title: '服务器响应格式错误', icon: 'none' });
          return;
        }
        if (data.code === 200) {
          uni.showToast({
            title: '认证提交成功，等待审核',
            icon: 'success',
            duration: 2000
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        } else {
          uni.showToast({
            title: data.msg || '认证提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('认证提交失败：', err);
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        isSubmitting.value = false;
      }
    });

  } catch (err) {
    console.error('认证提交异常：', err);
    uni.showToast({
      title: '提交异常，请稍后重试',
      icon: 'none'
    });
    isSubmitting.value = false;
  }
};

// 表单验证：校验本地临时文件路径是否存在
const isFormValid = computed(() => {
  return !!studentInfo.value.university && 
         !!studentInfo.value.college &&    
         !!studentInfo.value.major &&      
         !!studentInfo.value.studentIdNumber && 
         !!studentInfo.value.idCardUrl; // 校验本地临时文件路径
});
</script>

<style scoped>
/* 页面基础样式 */
.student-auth-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 0 30rpx;
  position: relative;
}

/* 顶部装饰背景 */
.top-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 480rpx;
  background: linear-gradient(135deg, #7c89ff, #a594ff, #d1b8ff);
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
  z-index: 0;
}

/* 标题区域 */
.page-header {
  padding-top: 90rpx;
  margin-bottom: 50rpx;
  position: relative;
  z-index: 1;
  text-align: center;
}

.title {
  font-size: 42rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12rpx;
  text-shadow: 0 3rpx 6rpx rgba(0, 0, 0, 0.1);
  display: block;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 认证表单区域 */
.auth-form {
  background-color: #fff;
  border-radius: 30rpx;
  padding: 45rpx 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 50rpx;
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, #ffffff, #fefeff);
}

/* 表单项基础样式 */
.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 45rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  border-bottom: 1rpx solid #f2f2f2;
  transition: border-color 0.3s ease;
}

.form-control:focus-within {
  border-color: #a594ff;
}

/* 学院选择器样式 */
.picker-control {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: 28rpx;
  color: #666;
}

/* 输入框样式 */
.input-control {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 100%;
  padding-right: 10rpx;
}

.input-control::placeholder {
  color: #ccc;
  font-size: 26rpx;
}

/* 学生证上传区域 */
.upload-item {
  margin-bottom: 0;
}

.upload-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 0;
  margin: 0;
  border: none;
}

.upload-preview {
  width: 100%;
  height: 260rpx;
  border-radius: 20rpx;
  overflow: hidden;
  border: 2rpx dashed #eee;
  position: relative;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
}

.upload-hover.upload-preview {
  border-color: #8c9aff;
  background-color: rgba(140, 154, 255, 0.05);
}

.preview-img {
  width: 100%;
  height: 100%;
}

/* 上传提示 */
.upload-tip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.tip-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 已上传标识 */
.uploaded-tag {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(67, 181, 72, 0.9);
  color: #fff;
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 上传提示文本 */
.upload-hint {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
  text-align: left;
  margin: 10rpx auto;
}

/* 提交按钮样式 */
.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(90deg, #7c89ff, #a594ff);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(124, 137, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 30rpx;
}

.submit-btn:disabled {
  background: #e5e5e5;
  color: #999;
  box-shadow: none;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-3rpx);
  box-shadow: 0 12rpx 30rpx rgba(124, 137, 255, 0.4);
}

/* 认证说明 */
.auth-note {
  margin-top: 0;
  padding-bottom: 50rpx;
  position: relative;
  z-index: 1;
}

.note-text {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 12rpx;
  line-height: 1.5;
}
</style>
    