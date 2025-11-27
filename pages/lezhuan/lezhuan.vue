<template>
  <view class="container">
    <!-- 背景装饰元素 -->
    <view class="bg-decoration top-left"></view>
    <view class="bg-decoration bottom-right"></view>
    
    <!-- 主标题区域 -->
    <view class="title-container">
      <text class="main-title">来乐转</text>
      <text class="sub-title">闲置变现</text>
    </view>
    
    <!-- 图标装饰 -->
    <view class="icon-decoration">
      <image src="https://api.shaolezhuan.cn/lzphoto/coin.png" mode="widthFix" class="icon" alt="金币装饰"></image>
    </view>
    
    <!-- 按钮区域 -->
    <view class="button-group">
      <button class="action-button" @click="navigateTo('post')">
        <text class="button-text">发宝贝</text>
        <icon type="arrowright" size="24" color="#fff"></icon>
      </button>
      <button class="action-button receive" @click="navigateTo('receive')">
        <text class="button-text">发需求</text>
        <icon type="arrowright" size="24" color="#fff"></icon>
      </button>
    </view>
    
    <!-- 底部说明 -->
    <view class="footer-note">
      <text>轻松处理闲置 · 环保又赚钱</text>
    </view>
  </view>
</template>

<script setup>
// 导航跳转方法（小程序环境使用 uni.navigateTo）
const navigateTo = (page) => {
  uni.navigateTo({
    url: `/pages/${page}/${page}`
  })
}
</script>

<style scoped>
/* 主容器样式 - 实现全屏居中 */
.parent-container ::v-deep .target-view {
  padding-top: 50rpx;
}
.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff8e6;
  position: relative;
  padding: 0 30rpx;
  box-sizing: border-box;
  overflow: hidden; /* 防止背景装饰元素超出容器 */
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd70033, #ffb80022);
  z-index: 0;
}

.top-left {
  top: -100rpx;
  left: -100rpx;
  animation: floatTopLeft 20s infinite alternate ease-in-out; /* 左上角圆圈动画 */
}

.bottom-right {
  bottom: -100rpx;
  right: -100rpx;
  animation: floatBottomRight 18s infinite alternate ease-in-out; /* 右下角圆圈动画 */
}

/* 左上角圆圈游动动画 */
@keyframes floatTopLeft {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translate(100rpx, 100rpx) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: translate(200rpx, 50rpx) scale(0.9);
    opacity: 0.75;
  }
  75% {
    transform: translate(150rpx, 150rpx) scale(1.05);
    opacity: 0.85;
  }
  100% {
    transform: translate(250rpx, 100rpx) scale(1);
    opacity: 0.7;
  }
}

/* 右下角圆圈游动动画 */
@keyframes floatBottomRight {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translate(-150rpx, -50rpx) scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: translate(-100rpx, -150rpx) scale(1.1);
    opacity: 0.75;
  }
  75% {
    transform: translate(-200rpx, -100rpx) scale(0.9);
    opacity: 0.85;
  }
  100% {
    transform: translate(-150rpx, -50rpx) scale(1);
    opacity: 0.7;
  }
}

/* 标题容器 */
.title-container {
  margin-top: 200rpx;
  text-align: center;
  margin-bottom: 80rpx;
  z-index: 1;
}

/* 主标题样式 - 黄色渐变效果 */
.main-title {
  display: block;
  font-size: 100rpx;
  font-weight: 800;
  background: linear-gradient(45deg, #ff9d00, #ffd700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 4rpx 8rpx rgba(255, 157, 0, 0.3);
  margin-bottom: 10rpx;
}

/* 副标题样式 - 黄色渐变效果 */
.sub-title {
  display: block;
  font-size: 60rpx;
  font-weight: 600;
  background: linear-gradient(45deg, #ffb800, #ffdf80);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2rpx 4rpx rgba(255, 184, 0, 0.2);
}

/* 图标装饰 */
.icon-decoration {
  margin-bottom: 100rpx;
  z-index: 1;
}

.icon {
  width: 160rpx;
  opacity: 0.8;
  animation: floatIcon 3s ease-in-out infinite;
}

/* 按钮组样式 */
.button-group {
  width: 100%;
  max-width: 500rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  z-index: 1;
}

/* 按钮样式 */
.action-button {
  width: 100%;
  height: 120rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15rpx;
  font-size: 36rpx;
  font-weight: 600;
  background: linear-gradient(90deg, #ff9d00, #ffb800);
  color: #ffffff;
  border-radius: 60rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(255, 157, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

/* 收宝贝按钮样式 - 稍深色调 */
.action-button.receive {
  background: linear-gradient(90deg, #e68a00, #ff9d00);
  box-shadow: 0 8rpx 20rpx rgba(230, 138, 0, 0.3);
}

/* 按钮文本样式 */
.button-text {
  line-height: 1;
}

/* 按钮点击效果 */
.action-button:active {
  transform: scale(0.97);
  box-shadow: 0 4rpx 10rpx rgba(255, 157, 0, 0.2);
}

/* 底部说明文字 */
.footer-note {
  margin-top: 120rpx;
  font-size: 26rpx;
  color: #ff9d0088;
  z-index: 1;
}

/* 图标浮动动画 */
@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}
</style>