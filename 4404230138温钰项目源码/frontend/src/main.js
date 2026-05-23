import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import '@/assets/css/global.css'
import { globalErrorHandler } from '@/utils/errorHandler'

const app = createApp(App)

// 配置Vue错误处理器
app.config.errorHandler = (error, instance, info) => {
  globalErrorHandler.handleError({
    type: 'vue',
    level: 'high',
    message: error.message,
    stack: error.stack,
    componentInfo: info,
    componentName: instance?.$options?.name || 'Unknown',
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
  globalErrorHandler.reportError({
    type: 'vue',
    level: 'high',
    message: error.message,
    stack: error.stack,
    componentInfo: info,
    componentName: instance?.$options?.name || 'Unknown',
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
}

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')