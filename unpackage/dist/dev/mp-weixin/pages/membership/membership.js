"use strict";
const common_vendor = require("../../common/vendor.js");
const api_pay = require("../../api/pay.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "membership",
  setup(__props) {
    let outTradeNo = "";
    const memberType = common_vendor.ref("none");
    const currentPackage = common_vendor.ref("normal");
    common_vendor.onMounted(async () => {
      memberType.value = common_vendor.index.getStorageSync("membershipType");
    });
    const progressWidth = common_vendor.computed(() => {
      switch (memberType.value) {
        case "none":
          return "0%";
        case "normal":
          return "50%";
        case "platinum":
          return "100%";
        default:
          return "0%";
      }
    });
    const buyMember = async (type) => {
      var _a, _b, _c;
      try {
        const actionText = type === "platinum" && memberType.value === "normal" ? "升级" : "购买";
        common_vendor.index.showLoading({ title: `${actionText}中...` });
        const packageInfo = {
          normal: {
            packageId: 3,
            amount: 200,
            // 2元，单位：分
            body: "乐转-普通会员",
            detail: "普通会员套餐，享聊一聊、购物等功能"
          },
          platinum: {
            packageId: 4,
            amount: memberType.value === "normal" ? 300 : 500,
            // 升级3元/新购5元，单位：分
            body: "乐转-白金会员",
            detail: "白金会员套餐，享发布需求等全部功能"
          }
        }[type];
        const openid = common_vendor.index.getStorageSync("openid");
        const businessOrderRes = await api_pay.payApi.postMembership({
          packageId: packageInfo.packageId,
          isUpgrade: type === "platinum" && memberType.value === "normal"
        });
        common_vendor.index.__f__("log", "at pages/membership/membership.vue:230", "调用后端创建业务订单接口返回情况：", businessOrderRes);
        if (businessOrderRes.code !== 200 || !((_a = businessOrderRes.data) == null ? void 0 : _a.id)) {
          throw new Error("创建业务订单失败，原因：" + (((_b = businessOrderRes.data) == null ? void 0 : _b.msg) || "接口异常"));
        }
        const businessOrderId = businessOrderRes.data.id;
        const wechatOrderRes = await api_pay.payApi.postWeChatpay({
          attach: "membership_order",
          body: packageInfo.body,
          businessOrderId,
          businessType: "membership",
          detail: packageInfo.detail,
          openid,
          totalAmount: packageInfo.amount
        });
        common_vendor.index.__f__("log", "at pages/membership/membership.vue:247", "调用后端创建微信支付订单返回情况：", wechatOrderRes);
        outTradeNo = wechatOrderRes.data.outTradeNo;
        if (wechatOrderRes.code !== 200) {
          throw new Error("创建微信支付订单失败，原因：" + ((wechatOrderRes == null ? void 0 : wechatOrderRes.msg) || "接口异常"));
        }
        const { appId, nonceStr, packageValue, paySign, timeStamp, prepayId } = wechatOrderRes.data;
        const paymentResult = await common_vendor.index.requestPayment({
          provider: "weixin",
          timeStamp,
          nonceStr,
          package: packageValue,
          signType: "RSA",
          // 需与后端签名类型一致，若后端用RSA则调整/MD5
          paySign,
          appId
        });
        common_vendor.index.__f__("log", "at pages/membership/membership.vue:265", "调用微信支付返回情况：", paymentResult);
        if (paymentResult.errMsg === "requestPayment:ok") {
          common_vendor.index.showToast({ title: `${actionText}会员成功`, icon: "success" });
          memberType.value = type;
          common_vendor.index.setStorageSync("membershipType", type);
          await queryOrderStatus(wechatOrderRes.data.outTradeNo);
        }
      } catch (error) {
        if ((_c = error.errMsg) == null ? void 0 : _c.includes("cancel")) {
          common_vendor.index.showToast({ title: "支付已取消", icon: "none" });
        } else {
          common_vendor.index.showToast({ title: "支付失败，请重试", icon: "none" });
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const queryOrderStatus = async (outTradeNo2) => {
      var _a;
      const res = await api_pay.payApi.queryOrderStatus(outTradeNo2);
      if (res.statusCode === 200 && ((_a = res.data) == null ? void 0 : _a.tradeState) === "SUCCESS") {
        common_vendor.index.__f__("log", "at pages/membership/membership.vue:299", "订单支付状态已确认：成功");
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: memberType.value === "normal"
      }, memberType.value === "normal" ? {
        b: common_vendor.p({
          type: "vip",
          size: "25",
          color: "#fff"
        }),
        c: progressWidth.value,
        d: memberType.value !== "none" ? 1 : "",
        e: memberType.value === "normal" || memberType.value === "platinum" ? 1 : "",
        f: memberType.value === "platinum" ? 1 : ""
      } : memberType.value === "platinum" ? {
        h: common_vendor.p({
          type: "vip",
          size: "25",
          color: "#fff"
        }),
        i: progressWidth.value,
        j: memberType.value !== "none" ? 1 : "",
        k: memberType.value === "normal" || memberType.value === "platinum" ? 1 : "",
        l: memberType.value === "platinum" ? 1 : ""
      } : {
        m: progressWidth.value,
        n: memberType.value !== "none" ? 1 : "",
        o: memberType.value === "normal" || memberType.value === "platinum" ? 1 : "",
        p: memberType.value === "platinum" ? 1 : ""
      }, {
        g: memberType.value === "platinum",
        q: common_vendor.p({
          type: "chat",
          size: "24",
          color: "#7c89ff"
        }),
        r: common_vendor.p({
          type: "cart",
          size: "24",
          color: "#7c89ff"
        }),
        s: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#7c89ff"
        }),
        t: common_vendor.p({
          type: "upload",
          size: "24",
          color: "#7c89ff"
        }),
        v: memberType.value === "none"
      }, memberType.value === "none" ? {
        w: common_vendor.o(($event) => buyMember("normal"))
      } : {}, {
        x: currentPackage.value === "normal" ? 1 : "",
        y: common_vendor.o(($event) => currentPackage.value = "normal"),
        z: common_vendor.t(memberType.value === "normal" ? "3" : "5"),
        A: memberType.value === "normal"
      }, memberType.value === "normal" ? {} : {}, {
        B: memberType.value !== "platinum"
      }, memberType.value !== "platinum" ? {
        C: common_vendor.t(memberType.value === "normal" ? "立即升级" : "立即购买"),
        D: common_vendor.o(($event) => buyMember("platinum"))
      } : {}, {
        E: currentPackage.value === "platinum" ? 1 : "",
        F: common_vendor.o(($event) => currentPackage.value = "platinum")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-94171f33"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/membership/membership.js.map
