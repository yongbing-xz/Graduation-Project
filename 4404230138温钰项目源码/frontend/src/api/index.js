import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { handleHttpError } from '@/utils/errorHandler'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const authStore = useAuthStore()
    
    // 处理HTTP错误
    handleHttpError(error)
    
    if (error.response?.status === 401) {
      // 令牌过期，尝试刷新
      try {
        await authStore.refreshToken()
        // 重新发送原始请求
        const originalRequest = error.config
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`
        return api(originalRequest)
      } catch (refreshError) {
        authStore.logout()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error.response?.data || error)
  }
)

export default api