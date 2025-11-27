import request from '../utils/request'

export default {
	//获取聊天列表
	getChatConversations: () => {
	  return request({
	    url: `/chat-messages/conversations`, // 用模板字符串拼接路径参数
	    method: 'GET',
	    header: {
	      'Content-Type': 'application/json',
	    }
	  })
	},
	
	//获取聊天记录
	getMessages: (data) => {
	  return request({
	    url: `/chat-messages`, // 用模板字符串拼接路径参数
	    method: 'GET',
		data,
	    header: {
	      'Content-Type': 'application/json',
	    }
	  })
	},
	
	//发送信息
	postMessages: (data) => {
	  return request({
	    url: `/chat-messages/send`, // 用模板字符串拼接路径参数
	    method: 'POST',
		data,
	    header: {
	      'Content-Type': 'application/json',
	    }
	  })
	},
	
	//查看用户所有未读信息
	unreadMessages: (userId) => {
	  return request({
	    url: `/api/unread-messages/${userId}`, // 用模板字符串拼接路径参数
	    method: 'GET',
	    header: {
	      'Content-Type': 'application/json',
	    }
	  })
	},
	
	//设置已读
	readMessages: (data) => {
	  return request({
	    url: `/chat-messages/read-status`, // 用模板字符串拼接路径参数
	    method: 'POST',
		data,
	    header: {
	      'Content-Type': 'application/json',
	    }
	  })
	},
	
}