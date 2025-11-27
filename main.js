import App from './App.vue'
import { createPinia } from 'pinia' // 状态管理
import request from './utils/request' // 自定义请求工具

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { installNavigationRefreshInterceptors } from './utils/navigationRefresh.js'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.config.globalProperties.$request = request // 挂载全局请求方法
  // 全局：安装导航拦截器，确保每次页面跳转都触发刷新
  installNavigationRefreshInterceptors()
  return {
    app
  }
}
// #endif