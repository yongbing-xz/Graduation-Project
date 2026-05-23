import api from './index'

export const compatibilityApi = {
  // 检测兼容性
  checkCompatibility: (components) => {
    return api.post('/compatibility/check', components)
  },
  
  // 获取所有规则
  getRules: () => {
    return api.get('/compatibility/rules')
  },
  
  // 根据名称获取规则
  getRuleByName: (ruleName) => {
    return api.get(`/compatibility/rules/${ruleName}`)
  },
  
  // 创建规则
  createRule: (ruleData) => {
    return api.post('/compatibility/rules', ruleData)
  },
  
  // 更新规则
  updateRule: (ruleId, ruleData) => {
    return api.put(`/compatibility/rules/${ruleId}`, ruleData)
  },
  
  // 删除规则
  deleteRule: (ruleId) => {
    return api.delete(`/compatibility/rules/${ruleId}`)
  }
}