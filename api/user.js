import request from '../utils/request'

export default {
  // 微信登录接口
  wxLogin: (data) => {
    return request({
      url: '/users/wx-login',
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json'
      }
    })
  },

  // 获取当前用户信息接口
  getCurrentUser: () => {
    return request({
      url: '/users/info',
      method: 'GET'
    })
  },
  
  // 提交学生认证接口
  studentInfo: (submitData) => {
    return request({
      url: '/student-verifications/submit',
      method: 'POST',
      data: submitData,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  //获取当前用户的认证状态
  studentInfoStatus: () => {
    return request({
      url: '/student-verifications/my-status',
      method: 'GET'
    })
  },
  
  //根据用户ID获取用户信息
  getUserInfo: (userId) => {
    return request({
      url: `/users/${userId}`,
      method: 'GET',
      data: userId,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  // 查询收藏状态
  getFavoriteStatus:(itemType,itemId) => {
    return request({
      url: `/favorites/status/${itemType}/${itemId}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      }
    })
  },  
 
 // 取消收藏
 cancelFavorite: ({ itemId, itemType }) => {
   return request({
     url: `/favorites/remove?itemId=${itemId}&itemType=${itemType}`,
     method: 'DELETE',
     header: {
       'Content-Type': 'application/json',
     }
   })
 },  
 
 //添加收藏
 addFavorite: ({ itemId, itemType }) => {
   return request({
     url: `/favorites/add?itemId=${itemId}&itemType=${itemType}`,
     method: 'POST',
     header: {
       'Content-Type': 'application/json',
     }
   })
 },  
 
 //举报
 submitReport: (data) => {
   return request({
     url: `/reports`,
     method: 'POST',
	 data,
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 //获取收藏列表
 getFavoriteList: () => {
   return request({
     url: `/favorites`,
     method: 'GET',
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 //获取历史浏览列表
 getBrowseHistoryList: (params) => {
   return request({
     url: `/user/browse-history/list`,
     method: 'GET',
	 data: params,
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 //清空历史浏览列表
 clearBrowseHistory: () => {
   return request({
     url: `/user/browse-history/all`,
     method: 'DELETE',
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 //记录用户浏览行为
recordBrowseHistory: (params) => {
   return request({
     url: `/user/browse-history/record`,
     method: 'POST',
	 data:params,
     header: {
       'Content-Type': 'application/json',
     }
   })
 },  
 
}