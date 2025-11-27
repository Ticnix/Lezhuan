import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: uni.getStorageSync('userInfo') || null
  }),
  actions: {
    // 保存用户信息
    setUserInfo(info) {
      this.userInfo = info
      uni.setStorageSync('userInfo', info)
    },
    // 退出登录
    logout() {
      this.userInfo = null
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('token')
    }
  }
})