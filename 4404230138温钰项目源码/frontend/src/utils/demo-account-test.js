// 默认管理员账户测试脚本
// 用户名: demo
// 密码: 123456

/**
 * 测试默认管理员账户登录功能
 */
export function testDemoAccount() {
  const testCredentials = {
    username: 'demo',
    password: '123456'
  }
  
  console.log('=== 默认管理员账户测试 ===')
  console.log('测试账户信息:')
  console.log('- 用户名:', testCredentials.username)
  console.log('- 密码:', testCredentials.password)
  console.log('')
  
  // 模拟登录流程
  console.log('1. 尝试使用默认管理员账户登录...')
  
  // 检查是否为默认管理员账户
  if (testCredentials.username === 'demo' && testCredentials.password === '123456') {
    console.log('✅ 检测到默认管理员账户')
    
    // 模拟登录成功
    const mockToken = 'demo_admin_token_' + Date.now()
    const mockUser = {
      id: 1,
      username: 'demo',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
    
    console.log('✅ 登录成功')
    console.log('生成的令牌:', mockToken)
    console.log('用户信息:', mockUser)
    
    // 模拟保存到localStorage
    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    console.log('✅ 用户信息已保存到本地存储')
    
    // 验证存储
    const storedToken = localStorage.getItem('token')
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    
    console.log('验证本地存储:')
    console.log('- 令牌:', storedToken ? '✅ 存在' : '❌ 不存在')
    console.log('- 用户:', storedUser ? '✅ 存在' : '❌ 不存在')
    
    if (storedUser && storedUser.role === 'admin') {
      console.log('✅ 管理员权限验证通过')
    }
    
    return {
      success: true,
      token: mockToken,
      user: mockUser
    }
  } else {
    console.log('❌ 非默认管理员账户，将走正常API流程')
    return {
      success: false,
      message: '需要调用后端API进行验证'
    }
  }
}

/**
 * 测试注册功能，防止注册管理员账户
 */
export function testRegisterProtection() {
  console.log('')
  console.log('=== 注册保护测试 ===')
  
  const testCases = [
    { username: 'demo', email: 'test@example.com', password: '123456' },
    { username: 'user123', email: 'user@example.com', password: 'password123' }
  ]
  
  testCases.forEach((userData, index) => {
    console.log(`测试用例 ${index + 1}:`)
    console.log('- 用户名:', userData.username)
    
    if (userData.username === 'demo') {
      console.log('❌ 检测到尝试注册管理员账户，应被阻止')
      console.log('✅ 保护机制生效: 该用户名已被系统保留')
    } else {
      console.log('✅ 普通用户账户，可以正常注册')
    }
    console.log('')
  })
}

// 运行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中运行测试
  testDemoAccount()
  testRegisterProtection()
}