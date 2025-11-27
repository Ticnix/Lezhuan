"use strict";
const utils_request = require("../utils/request.js");
const payApi = {
  // 创建会员订单接口
  postMembership: (membershipData) => {
    return utils_request.request({
      url: "/membership/orders",
      method: "POST",
      data: membershipData,
      header: {
        "Content-Type": "application/json"
      }
    });
  },
  // 创建微信支付订单接口
  postWeChatpay: (data) => {
    return utils_request.request({
      url: "/api/wechat-pay/create-order",
      method: "POST",
      data,
      header: {
        "Content-Type": "application/json"
      }
    });
  },
  // 查询订单状态接口
  queryOrderStatus: (outTradeNo) => {
    return utils_request.request({
      url: `/api/wechat-pay/query-order/${outTradeNo}`,
      method: "GET",
      header: {
        "Content-Type": "application/json"
      }
    });
  }
};
exports.payApi = payApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/pay.js.map
