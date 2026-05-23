import api from './index'

export const authApi = {
  // 用户登录
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  
  // 用户注册
  register: (userData) => {
    return api.post('/auth/register', userData)
  },
  
  // 刷新令牌
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh', { refreshToken })
  },
  
  // 用户登出
  logout: () => {
    return api.post('/auth/logout')
  },
  
  // 获取用户信息
  getProfile: () => {
    return api.get('/auth/profile')
  }
}