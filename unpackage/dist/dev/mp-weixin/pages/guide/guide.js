"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "guide",
  setup(__props) {
    const onStartUsing = () => {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    };
    const steps = common_vendor.ref([
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
    const faqs = common_vendor.ref([
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
    const toggleFaq = (index) => {
      faqs.value[index].expanded = !faqs.value[index].expanded;
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(steps.value, (step, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: common_vendor.t(step.title),
            c: step.image,
            d: step.alt,
            e: common_vendor.f(step.descriptions, (desc, i, i1) => {
              return {
                a: common_vendor.t(desc),
                b: i
              };
            }),
            f: index !== steps.value.length - 1
          }, index !== steps.value.length - 1 ? {} : {}, {
            g: index === steps.value.length - 1 ? 1 : "",
            h: index
          });
        }),
        b: common_vendor.f(faqs.value, (faq, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(faq.question),
            b: "04b95c5c-0-" + i0,
            c: common_vendor.p({
              type: faq.expanded ? "up" : "down",
              size: "18",
              color: "#666"
            }),
            d: common_vendor.o(($event) => toggleFaq(index), index),
            e: faq.expanded
          }, faq.expanded ? {
            f: common_vendor.t(faq.answer)
          } : {}, {
            g: index
          });
        }),
        c: common_vendor.p({
          type: "right",
          size: "18",
          color: "#fff"
        }),
        d: common_vendor.o(onStartUsing)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-04b95c5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/guide/guide.js.map
