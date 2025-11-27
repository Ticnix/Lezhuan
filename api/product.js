import request from '../utils/request'

export default { 
  // 发布商品接口
  postProduct: (productData) => {
    return request({
      url: '/products',
      method: 'POST',
      data: productData,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  // 发布需求接口
  postDemand: (demandData) => {
    return request({
      url: '/demands/publish',
      method: 'POST',
      data: demandData,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  // 获取商品分类列表接口
  getCategorie: (data) => {
    return request({
      url: `/products`, // 用模板字符串拼接路径参数
      method: 'GET',
	  data,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  // 获取需求分类列表接口
  getDemandList: (demandData) => {
    return request({
      url: `/demands`, 
      method: 'GET',
	  data: demandData,
      header: {
        'Content-Type': 'application/json',
      }
    })
  },
  
  // 获取首页推荐商品接口
  getAllGoods: () => {
    return request({
      url: `/products/homepage-featured`, 
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      }
    })
  },  
  
  // 获取首页推荐需求接口
  getAllDemands: () => {
    return request({
      url: `/demands/homepage-featured`, 
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      }
    })
  },

  // 更新商品价格信息
 updateGoodsPrice: (productId, priceData) => { // 第一个参数是路径中的商品ID，第二个是请求体数据
  return request({
    url: `/products/${productId}`,
    method: 'PUT',
	data: priceData,
    header: {
      'Content-Type': 'application/json',
    }
  })
 },
 
 // 商品置顶接口
 setGoodsTop: (productId, data) => {
   return request({
     url: `/products/${productId}/apply-urgent-push`, // 路径参数：商品ID
     method: 'POST',
     header: {
       'Content-Type': 'application/json'
     },
   })
 },
 
 // 需求置顶接口
 setDemandTop: (demandId, data) => {
   return request({
     url: `/demands/${demandId}/urgent-push`, // 路径参数：商品ID
     method: 'POST',
     header: {
       'Content-Type': 'application/json'
     },
   })
 },

 // // 商品顶置接口
 // setGoodsTop: (productId, data) => {
 //   return request({
 //     url: `/products/${productId}`, // 路径参数：商品ID
 //     method: 'PUT',
 //     header: {
 //       'Content-Type': 'application/json'
 //     },
 //     data: data // 请求体：{ isAdminPinned: true/false }
 //   })
 // },
 
 // 商品申请推荐接口
 setGoodsToHome: (productId) => {
   return request({
     url: `/products/${productId}/apply-homepage-featured`, // 路径参数：商品ID
     method: 'POST',
     header: {
       'Content-Type': 'application/json'
     },
   })
 },
 
 // 需求申请推荐接口
 setDemandTohome: (demandId) => {
   return request({
     url: `/demands/${demandId}/apply-homepage-featured`, // 路径参数：商品ID
     method: 'POST',
     header: {
       'Content-Type': 'application/json'
     },
   })
 },
 
 // 删除商品接口
 deleteGoods: (productId) => {
   return request({
     url: `/products/${productId}`, // 路径参数：商品ID
     method: 'DELETE',
     header: {
       'Content-Type': 'application/json'
     },
   })
 },
 
 // 删除需求接口
 deleteDemand: (demandId) => {
   return request({
     url: `/demands/${demandId}`, // 路径参数：商品ID
     method: 'DELETE',
     header: {
       'Content-Type': 'application/json'
     },
   })
 },
 
 // 获取我发布的商品列表接口
 getMyGoods: (myData) => {
   return request({
     url: `/products/my-products`, 
     method: 'GET',
	 data: myData,
	 cache: false, 
     header: {
       'Content-Type': 'application/json',
     }
   })
 },  
 
 // 获取完成的商品列表接口
 getSoldGoods: (soldData) => {
   return request({
     url: `/demands/my-demands`, 
     method: 'GET',
 	 data: soldData,
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 //获取自己的学院列表
 getxy: (userId) => {
   return request({
     url: '/student-verifications/colleges',
     method: 'GET',
     header: {
       'Content-Type': 'application/json',
     }
   })
 },
 
 // 获取我发布的需求列表接口
 getMyDemands: (myData) => {
   return request({
     url: `/demands/my-demands`, 
     method: 'GET',
 	 data: myData,
	 cache: false,
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 // 更新需求价格信息
 updateDemandBudget: (demandId, priceData) => { // 第一个参数是路径中的商品ID，第二个是请求体数据
  return request({
    url: `/demands/${demandId}`,
    method: 'PUT',
 	data: priceData,          
    header: {
      'Content-Type': 'application/json',
    }
  })
 },
 
 //更新商品状态
 updateGoodsStatus: (productId, statusData) => { // 第一个参数是路径中的商品ID，第二个是请求体数据
  return request({
    url: `/products/${productId}`,
    method: 'PUT',
 	data: statusData,
    header: {
      'Content-Type': 'application/json',
    }
  })
 },
 
 //更新需求状态
 updateDemandStatus: (productId, statusData) => { // 第一个参数是路径中的商品ID，第二个是请求体数据
  return request({
    url: `/demands/${productId}`,
    method: 'PUT',
 	data: statusData,
    header: {
      'Content-Type': 'application/json',
    }
  })
 },
 
// 调用需求详情接口
 getDemandDetail: (demandId) => {
   return request({
     url: `/demands/${demandId}`, 
     method: 'GET',
     header: {
       'Content-Type': 'application/json',
     }
   })
 }, 
 
 // 调用商品详情接口
  getProductDetail: (productId) => {
    return request({
      url: `/products/${productId}`, 
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      }
    })
  }, 
 
 // 获取商家发布的需求列表
  getSellerItem: (userId) => {
    return request({
      url: `/api/user-items/${userId}`, 
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      }
    })
  }, 
 
}