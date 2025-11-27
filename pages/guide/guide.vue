<template>
  <view class="container">

    <!-- 指南内容区 -->
    <scroll-view class="guide-content" scroll-y>
      <!-- 介绍卡片 -->
      <view class="intro-card">
        <image 
          src="https://api.shaolezhuan.cn/lzphoto/banners/b1.jpg" 
          mode="widthFix" 
          class="intro-img"
          alt="校园二手平台介绍图"
        ></image>
        <view class="intro-text">
          <text class="intro-title">欢迎使用校园二手平台</text>
          <text class="intro-desc">轻松买卖二手物品，让资源得到更好利用</text>
        </view>
      </view>

      <!-- 步骤指南 -->
      <view class="steps-container">
        <!-- 注册登录步骤 -->
        <view class="step-card" :class="{ 'last-step': index === steps.length - 1 }" v-for="(step, index) in steps" :key="index">
          <view class="step-number">
            <text>{{ index + 1 }}</text>
          </view>
          <view class="step-content">
            <text class="step-title">{{ step.title }}</text>
            <view class="step-details">
              <image 
                :src="step.image" 
                mode="widthFix" 
                class="step-img"
                :alt="step.alt"
              ></image>
              <view class="step-texts">
                <text class="step-desc" v-for="(desc, i) in step.descriptions" :key="i">{{ desc }}</text>
              </view>
            </view>
          </view>
          <view class="step-divider" v-if="index !== steps.length - 1"></view>
        </view>
      </view>

      <!-- 常见问题 -->
      <view class="faq-section">
        <text class="section-title">常见问题</text>
        <view class="faq-list">
          <view class="faq-item" v-for="(faq, index) in faqs" :key="index">
            <view class="faq-question" @click="toggleFaq(index)">
              <text>{{ faq.question }}</text>
              <uni-icons 
                :type="faq.expanded ? 'up' : 'down'" 
                size="18" 
                color="#666"
              ></uni-icons>
            </view>
            <view class="faq-answer" v-if="faq.expanded">
              <text>{{ faq.answer }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="bottom-bar">
      <button class="start-btn" @click="onStartUsing">
        开始使用
        <uni-icons type="right" size="18" color="#fff" class="btn-icon"></uni-icons>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 返回上一页（小程序环境使用 uni.navigateBack）
const onBack = () => {
  uni.navigateBack();
};

// 跳转到首页（首页为 tabBar 页面，使用 switchTab）
const onStartUsing = () => {
  uni.switchTab({ url: '/pages/index/index' });
};

// 步骤数据
const steps = ref([
  {
    title: "注册与登录",
    image: "https://api.shaolezhuan.cn/lzphoto/banners/b1.jpg",
    alt: "注册登录界面示例",
    descriptions: [
      "点击头像使用微信快速登录，为保障交易安全和使用完整功能，请完成学生认证并完善个人信息"
    ]
  },
  {
    title: "浏览与搜索",
    image: "https://api.shaolezhuan.cn/lzphoto/banners/b2.jpg",
    alt: "浏览搜索界面示例",
    descriptions: [
      "首页推荐热门二手物品",
      "分类浏览不同类型商品",
      "使用搜索功能查找特定物品"
    ]
  },
  {
    title: "发布商品",
    image: "https://api.shaolezhuan.cn/lzphoto/banners/b3.jpg",
    alt: "发布商品界面示例",
    descriptions: [
      "开通会员，永久享受特权，上传物品图片，填写相应信息，设置合理的价格，审核通过即可上架"
    ]
  },
  {
    title: "沟通与交易",
    image: "https://api.shaolezhuan.cn/lzphoto/banners/b1.jpg",
    alt: "沟通交易界面示例",
    descriptions: [
      "内置聊一聊，不用加好友也可以了解物品信息，自行约定交易方式和校园内的安全地点。交易完成后可进行评价"
    ]
  }
]);

// 常见问题数据
const faqs = ref([
  {
    question: "如何保证交易安全？",
    answer: "我们建议在校园内的公共区域进行交易，最好选择有监控的地方。同时，交易时仔细检查商品状况，确认无误后再完成交易。平台也提供举报功能，如遇问题可及时反馈。",
    expanded: false
  },
  {
    question: "商品发布有什么限制？",
    answer: "禁止发布违法违规、假冒伪劣商品，禁止发布与校园生活无关的商业广告。发布时需如实描述商品状况，上传真实图片，否则可能被下架处理。",
    expanded: false
  },
  {
    question: "如何联系平台客服？",
    answer: "在我的页面中点击客服中心，可以发送消息与客服沟通。工作时间为周一至周五 9:00-18:00，我们会尽快回复您的问题。",
    expanded: false
  },
  {
    question: "交易出现纠纷怎么办？",
    answer: "本小程序只提供校园内闲置物品的相关买卖需求信息，如交易中出现纠纷，平台概不承担具体责任，小程序后台会保留相应的聊天记录，可向平台申请提供聊天记录证据，该决定权和解释权归小程序负责人所有",
    expanded: false
  }
]);

// 切换FAQ展开状态
const toggleFaq = (index) => {
  faqs.value[index].expanded = !faqs.value[index].expanded;
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
}

.nav-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.empty-btn {
  width: 36px;
  height: 36px;
}

/* 内容区样式 */
.guide-content {
  flex: 1;
  padding-bottom: 60px;
}

/* 介绍卡片 */
.intro-card {
  margin: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.intro-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 16px;
}

.intro-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.intro-desc {
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* 步骤指南 */
.steps-container {
  margin: 16px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.step-card {
  display: flex;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  background-color: #7c89ff;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 12px 16px 16px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  padding: 16px 16px 16px 0;
}

.step-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.step-details {
  display: flex;
  gap: 12px;
}

.step-img {
  width: 100px;
  height: auto;
  border-radius: 6px;
  flex-shrink: 0;
}

.step-texts {
  flex: 1;
}

.step-desc {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.step-divider {
  position: absolute;
  left: 35px;
  top: 56px;
  bottom: 0;
  width: 1px;
  background-color: #eee;
}

/* 常见问题 */
.faq-section {
  margin: 16px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 8px;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
  padding: 8px 0;
}

.faq-answer {
  font-size: 13px;
  color: #666;
  padding: 0 0 8px 0;
  line-height: 1.6;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 底部留白 */
.bottom-space {
  height: 20px;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  padding: 8px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.start-btn {
  width: 100%;
  height: 100%;
  background-color: #7c89ff;
  color: #fff;
  border-radius: 25px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-icon {
  margin-left: 8px;
}

/* 适配不同屏幕 */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
