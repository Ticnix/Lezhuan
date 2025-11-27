<template>
  <view class="container">
    <!-- 装饰元素 -->
    <view class="decor top"></view>
    <view class="decor bottom"></view>
    
    <view class="content">
      <!-- 状态图标 -->
      <view class="status-icon">
        <uni-icons type="paperplane" size="60" color="#3498db"></uni-icons>
      </view>
      
      <!-- 文字信息 -->
      <view class="text-content">
        <text class="title">等待审核</text>
        <text class="description">
          您的商品信息已提交成功，我们将在24小时内完成审核。审核通过后会通过系统消息通知您，请耐心等待。
        </text>
      </view>
      
      <!-- 返回首页按钮 -->
      <button class="action-button" @click="goToHomePage">
        我知道了
      </button>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';

// 页面加载时的动画效果
onLoad(() => {
  // 可以在这里添加页面进入动画逻辑
});

// 返回首页
const goToHomePage = () => {
  // 跳转到首页，根据实际路由调整
  uni.navigateBack();
  
  // 如果需要返回上一级而不是特定页面，可以使用：
  // uni.navigateBack();
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7f9fc;
  position: relative;
  padding: 20rpx;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500rpx;
  width: 100%;
  padding: 40rpx 20rpx;
  z-index: 1;
}

/* 状态图标样式 */
.status-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background-color: #e8f4fd;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  position: relative;
  box-shadow: 0 10rpx 25rpx rgba(52, 152, 219, 0.1);
  animation: float 3s ease-in-out infinite;
}

.status-icon::after {
  content: '';
  position: absolute;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(52, 152, 219, 0.2);
  animation: ring 3s infinite;
}

/* 文字样式 */
.text-content {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 36rpx;
  color: #2c3e50;
  font-weight: 600;
  display: block;
  margin-bottom: 20rpx;
}

.description {
  font-size: 26rpx;
  color: #7f8c8d;
  line-height: 1.6;
}

/* 按钮样式 */
.action-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 24rpx 60rpx;
  font-size: 28rpx;
  border-radius: 60rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 6rpx 16rpx rgba(52, 152, 219, 0.3);
}

.action-button:hover {
  background-color: #2980b9;
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 20rpx rgba(52, 152, 219, 0.4);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 4rpx 10rpx rgba(52, 152, 219, 0.3);
}

/* 装饰元素 */
.decor {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  z-index: 0;
}

.decor.top {
  top: -150rpx;
  right: -150rpx;
  background: linear-gradient(135deg, rgba(255, 204, 0, 0.1), transparent 70%);
}

.decor.bottom {
  bottom: -150rpx;
  left: -150rpx;
  background: linear-gradient(225deg, rgba(52, 152, 219, 0.1), transparent 70%);
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
  100% { transform: translateY(0); }
}
</style>
