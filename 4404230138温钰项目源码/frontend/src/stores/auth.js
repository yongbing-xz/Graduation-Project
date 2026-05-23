import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

// 默认管理员账户
const DEFAULT_ADMIN_ACCOUNT = {
  username: 'demo',
  password: '123456',
  role: 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('accessToken'))
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value.role === 'ADMIN' || user.value.role === 'SUPER_ADMIN')
  
  const login = async (credentials) => {
    try {
      // 检查是否为默认管理员账户
      if (credentials.username === DEFAULT_ADMIN_ACCOUNT.username && 
          credentials.password === DEFAULT_ADMIN_ACCOUNT.password) {
        
        // 模拟登录成功
        token.value = 'demo_admin_token_' + Date.now()
        user.value = {
          id: 1,
          username: DEFAULT_ADMIN_ACCOUNT.username,
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: new Date().toISOString()
        }
        
        // 保存到localStorage
        localStorage.setItem('accessToken', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        
        ElMessage.success('管理员登录成功')
        return { success: true }
      }
      
      const response = await authApi.login(credentials)
      
      token.value = response.accessToken
      user.value = response.userInfo
      
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.userInfo))
      
      ElMessage.success('登录成功')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      ElMessage.error('登录失败，请检查网络连接')
      return { success: false }
    }
  }
  
  const register = async (userData) => {
    try {
      // 检查是否尝试注册管理员账户
      if (userData.username === DEFAULT_ADMIN_ACCOUNT.username) {
        ElMessage.error('该用户名已被系统保留')
        return { success: false }
      }
      
      const response = await authApi.register(userData)
      
      token.value = response.accessToken
      user.value = response.userInfo
      
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.userInfo))
      
      ElMessage.success('注册成功，请登录')
      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      ElMessage.error('注册失败，请检查网络连接')
      return { success: false }
    }
  }
  
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = {}
      
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      ElMessage.success('已退出登录')
    }
  }
  
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('没有刷新令牌')
      }
      
      const response = await authApi.refreshToken(refreshToken)
      
      token.value = response.accessToken
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      return response
    } catch (error) {
      logout()
      throw error
    }
  }
  
  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshToken
  }
})