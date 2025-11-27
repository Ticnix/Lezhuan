import request from '../utils/request'

export default {
  // 创建会员订单接口
  postMembership: (membershipData) => {
    return request({
      url: '/membership/orders',
      method: 'POST',
      data: membershipData,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },

  // 创建微信支付订单接口
  postWeChatpay: (data) => {
    return request({
      url: '/api/wechat-pay/create-order',
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  // 查询订单状态接口
  queryOrderStatus: (outTradeNo) => {
    return request({
      url: `/api/wechat-pay/query-order/${outTradeNo}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
}