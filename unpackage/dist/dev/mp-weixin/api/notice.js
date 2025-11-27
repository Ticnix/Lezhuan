"use strict";
const utils_request = require("../utils/request.js");
const noticeApi = {
  //标记已读
  markAsRead: (notificationId) => {
    return utils_request.request({
      url: `/notifications/${notificationId}/mark-read`,
      // 用模板字符串拼接路径参数
      method: "POST",
      header: {
        "Content-Type": "application/json"
      }
    });
  },
  //获取通知列表
  getNotificationList: (data) => {
    return utils_request.request({
      url: `/notifications/list`,
      // 用模板字符串拼接路径参数
      method: "GET",
      data,
      header: {
        // 接口文档为 application/x-www-form-urlencoded，GET 使用查询参数
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  },
  //获取未读通知数量
  getUnreadCount: () => {
    return utils_request.request({
      url: `/notifications/unread-count`,
      // 用模板字符串拼接路径参数
      method: "GET",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  },
  //删除通知接口
  deleteNotification: (notificationId) => {
    return utils_request.request({
      url: `/notifications/${notificationId}`,
      // 正确的删除接口路径
      method: "DELETE",
      header: {
        "Content-Type": "application/json"
      }
    });
  }
};
exports.noticeApi = noticeApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/notice.js.map
