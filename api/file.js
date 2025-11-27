import request from '../utils/request'

export default {
	//上传图片
	getChatConversations: () => {
	  return request({
	    url: `/api/upload/image`, // 用模板字符串拼接路径参数
	    method: 'POST',
	    header: {
	      'Content-Type': 'application/json',
	    }
	  })
	},

	
}