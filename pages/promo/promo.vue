<template>
  <view class="promo-container">
    <image
      class="promo-img"
      :src="promoImageUrl"
      mode="widthFix"
      alt="会员推广图"
      show-menu-by-longpress="true"
      @longpress="handleLongPress"
      @click="previewImage"
    ></image>
  </view>
  
</template>

<script setup>
// 推广图地址
const promoImageUrl = 'https://api.shaolezhuan.cn/lzphoto/membership/tuiguang.jpg';

// 长按或点击均进入预览，大图里微信原生支持识别二维码
const previewImage = () => {
  uni.previewImage({
    urls: [promoImageUrl],
    current: 0
  });
};

const handleLongPress = () => {
  previewImage();
};
</script>

<style scoped>
.promo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  min-height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
}

.promo-img {
  width: 100%;
  border-radius: 12rpx;
  user-select: none;
}
</style>