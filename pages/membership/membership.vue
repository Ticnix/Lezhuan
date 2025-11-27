<template>
  <view class="member-buy-page">
    <!-- 会员卡展示区 -->
    <view class="card-container">
      <view class="card" v-if="memberType === 'normal'">
        <view class="card-top">
		  <uni-icons type="vip" size="25" color="#fff"></uni-icons>
          <text class="card-title">普通会员权益卡</text>
          <text class="user-name">尊贵的普通会员</text>
        </view>
        <view class="card-middle">
          <text class="expire">会员有效期：<text class="lifetime">终身有效</text></text>
          <text class="tips">（学生认证可享专属优惠）</text>
        </view>
        <!-- 会员进度条 -->
        <view class="member-progress">
          <text class="progress-title">会员等级进度</text>
          <view class="progress-bar">
            <view class="progress-track" :style="{ width: progressWidth }"></view>
            <!-- 进度节点 -->
            <view class="progress-node游客" :class="{ 'active': memberType !== 'none' }">
              <text class="node-text">游客</text>
            </view>
            <view class="progress-node普通" :class="{ 'active': memberType === 'normal' || memberType === 'platinum' }">
              <text class="node-text">普通</text>
            </view>
            <view class="progress-node白金" :class="{ 'active': memberType === 'platinum' }">
              <text class="node-text">白金</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="card" v-else-if="memberType === 'platinum'">
        <view class="card-top">
		  <uni-icons type="vip" size="25" color="#fff"></uni-icons>
          <text class="card-title">白金会员权益卡</text>
          <text class="user-name">尊贵的白金会员</text>
        </view>
        <view class="card-middle">
          <text class="expire">会员有效期：<text class="lifetime">终身有效</text></text>
          <text class="tips">（学生认证可享专属优惠）</text>
        </view>
        <!-- 会员进度条 -->
        <view class="member-progress">
          <text class="progress-title">会员等级进度</text>
          <view class="progress-bar">
            <view class="progress-track" :style="{ width: progressWidth }"></view>
            <!-- 进度节点 -->
            <view class="progress-node游客" :class="{ 'active': memberType !== 'none' }">
              <text class="node-text">游客</text>
            </view>
            <view class="progress-node普通" :class="{ 'active': memberType === 'normal' || memberType === 'platinum' }">
              <text class="node-text">普通</text>
            </view>
            <view class="progress-node白金" :class="{ 'active': memberType === 'platinum' }">
              <text class="node-text">白金</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="non-member-card" v-else>
        <view class="card-top">
          <text class="card-title">未开通会员</text>
          <text class="user-name">立即开通会员，解锁更多权益</text>
        </view>
        <view class="card-middle">
          <text class="tips">游客模式原价解锁权限，学生认证立享优惠</text>
        </view>
        <!-- 会员进度条 -->
        <view class="member-progress non-member">
          <text class="progress-title">会员等级进度</text>
          <view class="progress-bar">
            <view class="progress-track" :style="{ width: progressWidth }"></view>
            <!-- 进度节点 -->
            <view class="progress-node-tourist" :class="{ 'active': memberType !== 'none' }">
              <text class="node-text">游客</text>
            </view>
            <view class="progress-node-normal" :class="{ 'active': memberType === 'normal' || memberType === 'platinum' }">
              <text class="node-text">普通</text>
            </view>
            <view class="progress-node-platinum" :class="{ 'active': memberType === 'platinum' }">
              <text class="node-text">白金</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员特权说明 -->
    <view class="privilege-title">升级为会员，享更多特权</view>
    <view class="privilege-list">
      <view class="privilege-item">
        <uni-icons type="chat" size="24" color="#7c89ff"></uni-icons>
        <text>聊一聊功能</text>
      </view>
      <view class="privilege-item">
        <uni-icons type="cart" size="24" color="#7c89ff"></uni-icons>
        <text>购物功能</text>
      </view>
      <view class="privilege-item">
        <uni-icons type="compose" size="24" color="#7c89ff"></uni-icons>
        <text>发布闲置功能</text>
      </view>
      <view class="privilege-item">
        <uni-icons type="upload" size="24" color="#7c89ff"></uni-icons>
        <text>发布需求功能</text>
      </view>
    </view>

    <!-- 会员套餐选择 -->
    <view class="package-title">会员套餐</view>
    <view class="package-list">
      <!-- 普通会员 -->
      <view 
        class="package-item" 
        :class="{ 'active': currentPackage === 'normal' }"
        @click="currentPackage='normal'">
		<view class="package-header">
          <text class="package-name">普通会员</text>
          <text class="package-price">¥<text class="current-price">2</text>
            <text class="original-price">（原价¥88）</text>
          </text>
        </view>
        <view class="package-desc">
          <text class="highlight">• 终身使用聊一聊、购物、发布闲置功能</text>
          <text>• 可同时发布5件闲置，交易无手续费</text>
          <text>• 无限制购买和发布闲置物品</text>
        </view>
        <button class="buy-btn" @click="buyMember('normal')" v-if="memberType === 'none'">立即购买</button>
        <button class="buy-btn disabled" disabled v-else>已开通</button>
      </view>

      <!-- 白金会员 -->
      <view 
        class="package-item" 
        :class="{ 'active': currentPackage === 'platinum' }"
        @click="currentPackage = 'platinum'"
      >
        <view class="package-header">
          <text class="package-name">白金会员</text>
          <text class="package-price">¥<text class="current-price">{{ memberType === 'normal' ? '3' : '5' }}</text>
            <text class="original-price">（原价¥188）</text>
          </text>
          <text class="upgrade-tip" v-if="memberType === 'normal'">普通会员升级仅需¥3</text>
        </view>
        <view class="package-desc">
          <text class="highlight">• 终身使用聊一聊、购物、发布闲置、发布需求功能</text>
          <text>• 普通会员升级仅需¥3</text>
          <text>• 可同时发布15件闲置，交易无手续费</text>
          <text>• 无限制购买和发布闲置物品</text>
        </view>
        <button class="buy-btn" @click="buyMember('platinum')" v-if="memberType !== 'platinum'">
          {{ memberType === 'normal' ? '立即升级' : '立即购买' }}
        </button>
        <button class="buy-btn disabled" disabled v-else>已开通</button>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="student-tip">
      <text>会员特权解释权归趣乐转负责人所有</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed,onMounted } from 'vue';
import userApi from '@/api/user.js';
import payApi from '@/api/pay.js';
import { useStorage } from '@/hooks/useStorage'; 

let outTradeNo = ''; 
// 会员类型：'none'（非会员）、'normal'（普通会员）、'platinum'（白金会员）
const memberType = ref('none'); 
// 当前选择的套餐
const currentPackage = ref('normal');

onMounted(async () => {
  // 页面加载时查询当前会员状态
  memberType.value = uni.getStorageSync('membershipType');;
});

// 根据会员类型计算进度条宽度
const progressWidth = computed(() => {
  switch(memberType.value) {
    case 'none':
      return '0%';
    case 'normal':
      return '50%';
    case 'platinum':
      return '100%';
    default:
      return '0%';
  }
});

// 购买会员
const buyMember = async (type) => {
  let wechatOrderRes = null;
  try {
    const actionText = type === 'platinum' && memberType.value === 'normal' ? '升级' : '购买';
    uni.showLoading({ title: `${actionText}中...` });

    // 确定套餐信息（packageId、金额、商品描述等）
    const packageInfo = {
      normal: {
        packageId: 3,
        amount: 200, // 2元，单位：分
        body: '乐转-普通会员',
        detail: '普通会员套餐，享聊一聊、购物等功能'
      },
      platinum: {
        packageId: 4,
        amount: memberType.value === 'normal' ? 300 : 500, // 升级3元/新购5元，单位：分
        body: '乐转-白金会员',
        detail: '白金会员套餐，享发布需求等全部功能'
      }
    }[type];

    //获取用户openid
    const openid = uni.getStorageSync('openid');

    //调用后端创建业务订单接口
    const businessOrderRes = await payApi.postMembership({
      packageId: packageInfo.packageId,
      isUpgrade: type === 'platinum' && memberType.value === 'normal'
    });
	console.log('调用后端创建业务订单接口返回情况：',businessOrderRes)
	if (businessOrderRes.code !== 200 || !businessOrderRes.data?.id) {
	  throw new Error('创建业务订单失败，原因：' + (businessOrderRes.data?.msg || '接口异常'));
	}
    const businessOrderId = businessOrderRes.data.id;


    //调用后端创建微信支付订单接口
    const wechatOrderRes = await payApi.postWeChatpay({
        attach: 'membership_order',
        body: packageInfo.body,
        businessOrderId,
        businessType: 'membership',
        detail: packageInfo.detail,
        openid: openid,
        totalAmount: packageInfo.amount
    });
	console.log('调用后端创建微信支付订单返回情况：',wechatOrderRes)
	outTradeNo = wechatOrderRes.data.outTradeNo; // 存储商户订单号
    if (wechatOrderRes.code !== 200 ) {
      throw new Error('创建微信支付订单失败，原因：' + (wechatOrderRes?.msg || '接口异常'));
    }

    const { appId, nonceStr, packageValue, paySign, timeStamp, prepayId } = wechatOrderRes.data;

    // 调用微信支付
    const paymentResult = await uni.requestPayment({
      provider: 'weixin',
      timeStamp,
      nonceStr,
      package: packageValue, 
      signType: 'RSA', // 需与后端签名类型一致，若后端用RSA则调整/MD5
      paySign,
      appId: appId
    });
    console.log('调用微信支付返回情况：',paymentResult)

    if (paymentResult.errMsg === 'requestPayment:ok') {
      uni.showToast({ title: `${actionText}会员成功`, icon: 'success' });
      memberType.value = type;
	  //更新本地
	  uni.setStorageSync('membershipType', type);
      
      // 主动查询订单状态确保一致性
      await queryOrderStatus(wechatOrderRes.data.outTradeNo);
    }

  } catch (error) {
  if (error.errMsg?.includes('cancel')) {
    // 用户主动取消支付，尝试关闭订单
    if (wechatOrderRes?.data?.outTradeNo) {
      await uni.request({
        url: `/api/wechat-pay/close-order/${outTradeNo}`,
        method: 'POST'
      });
    }
    uni.showToast({ title: '支付已取消', icon: 'none' });
  } else {
    uni.showToast({ title: '支付失败，请重试', icon: 'none' });
  }
} finally {
    uni.hideLoading();
  }
};

//查询订单状态接口
const queryOrderStatus = async (outTradeNo) => {
  const res = await payApi.queryOrderStatus(outTradeNo)
  if (res.statusCode === 200 && res.data?.tradeState === 'SUCCESS') {
    console.log('订单支付状态已确认：成功');
  }
};
</script>

<style scoped>
.member-buy-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 会员卡通用样式 */
.card-container {
  padding: 30rpx;
  margin-top: 20rpx;
  margin-bottom: 15rpx;
}

.card, .non-member-card {
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

/* 卡片装饰元素 */
.card::before, .non-member-card::before {
  content: '';
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  opacity: 0.1;
}

.card::before {
  background-color: #ffffff;
}

.non-member-card::before {
  background-color: #999;
}

.card {
  background: linear-gradient(135deg, #d1b8ff, #a594ff);
}

.non-member-card {
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
}

.card-top, .non-member-card .card-top {
  margin-bottom: 20rpx;
}

.card-title, .non-member-card .card-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  margin-left: 10rpx;
}

.non-member-card .card-title {
  color: #666;
}

.user-name, .non-member-card .user-name {
  font-size: 28rpx;
  color: #fff;
  opacity: 0.9;
  margin-left: 30rpx;
}

.non-member-card .user-name {
  color: #666;
  opacity: 0.8;
}

.card-middle, .non-member-card .card-middle {
  margin-bottom: 20rpx;
}

.expire, .non-member-card .tips {
  font-size: 26rpx;
  color: #fff;
}

.non-member-card .tips {
  color: #666;
}

.lifetime {
  color: #ff4500;
  font-weight: bold;
}

.tips {
  font-size: 22rpx;
  color: #fff;
  opacity: 0.8;
}

/* 会员进度条样式 */
.member-progress {
  margin-top: 20rpx;
  padding-top: 10rpx;
}

.progress-title {
  font-size: 24rpx;
  color: #fff;
  margin-bottom: 15rpx;
  display: block;
}

.non-member .progress-title {
  color: #666;
}

.progress-bar {
  position: relative;
  height:12rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
}

.non-member .progress-bar {
  background-color: #ddd;
}

.progress-track {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffA500);
  transition: width 0.5s ease;
  border-radius: 6rpx;
}

/* 进度节点样式 */
/* 修改后 */
.progress-node-tourist { left: 0%; }
.progress-node-normal { left: 50%; }
.progress-node-platinum { left: 100%; }

.progress-node-tourist {
  left: 0%;
}

.progress-node-normal {
  left: 50%;
}

.progress-node-platinum {
  left: 100%;
}

/* 激活状态的节点 */
.progress-node-tourist.active,
.progress-node-normal.active,
.progress-node-platinum.active {
  background-color: #ffd700;
  box-shadow: 0 0 0 8rpx rgba(255, 215, 0, 0.2);
  width: 28rpx;
  height: 28rpx;
}

/* 节点文字 */
.node-text {
  position: absolute;
  top: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20rpx;
  color: #fff;
  white-space: nowrap;
}

.non-member .node-text {
  color: #666;
}

/* 特权说明 */
.privilege-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin: 0 30rpx 35rpx;
}

.privilege-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 0 30rpx 5rpx;
}

.privilege-item {
  display: flex;
  align-items: center;
  width: 45%;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.privilege-item text {
  font-size: 26rpx;
  color: #666;
  margin-left: 10rpx;
}

/* 套餐选择 */
.package-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin: 0 30rpx 20rpx;
}

.package-list {
  margin: 0 30rpx;
}

.package-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.package-item:hover {
  transform: translateY(-5rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}

.package-item.active {
  border: 2rpx solid #7c89ff;
  position: relative;
}

.package-item.active::before {
  content: '';
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 30rpx;
  height: 30rpx;
  background-color: #7c89ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.package-item.active::after {
  content: '✓';
  position: absolute;
  top: 22rpx;
  right: 25rpx;
  color: white;
  font-size: 20rpx;
  font-weight: bold;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.package-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.package-price {
	margin-right: 20rpx;
  font-size: 28rpx;
  color: #ff4500;
}

.current-price {
  font-size: 32rpx;
  font-weight: bold;
}

.original-price {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 6rpx;
}

.upgrade-tip {
  font-size: 22rpx;
  color: #7c89ff;
  margin-top: 8rpx;
}

.package-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.package-desc text {
  display: block;
  margin-bottom: 10rpx;
}

.highlight {
  color: #7c89ff;
  font-weight: 500;
}

.buy-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(90deg, #7c89ff, #a594ff);
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, transform 0.2s ease;
}

.buy-btn:hover {
  background: linear-gradient(90deg, #6b79e6, #9484e3);
  transform: translateY(-2rpx);
}

.buy-btn.disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.buy-btn.disabled:hover {
  transform: none;
  background: #e0e0e0;
}

/* 版权信息 */
.student-tip {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-top: 30rpx;
  padding: 20rpx;
}

.auth-link {
  color: #7c89ff;
  text-decoration: underline;
}
</style>
