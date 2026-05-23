import { defineStore } from 'pinia'
import { ref } from 'vue'
import { compatibilityApi } from '@/api/compatibility'

export const useCompatibilityStore = defineStore('compatibility', () => {
  const selectedComponents = ref([])
  const compatibilityResult = ref(null)
  const isLoading = ref(false)
  const history = ref([])
  
  const checkCompatibility = async (components) => {
    isLoading.value = true
    try {
      const result = await compatibilityApi.checkCompatibility(components)
      compatibilityResult.value = result
      
      // 添加到历史记录
      history.value.unshift({
        id: Date.now(),
        timestamp: new Date(),
        components: [...components],
        result: { ...result }
      })
      
      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value = history.value.slice(0, 10)
      }
      
      return result
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const getRules = async () => {
    try {
      return await compatibilityApi.getRules()
    } catch (error) {
      throw error
    }
  }
  
  const createRule = async (ruleData) => {
    try {
      return await compatibilityApi.createRule(ruleData)
    } catch (error) {
      throw error
    }
  }
  
  const updateRule = async (ruleId, ruleData) => {
    try {
      return await compatibilityApi.updateRule(ruleId, ruleData)
    } catch (error) {
      throw error
    }
  }
  
  const deleteRule = async (ruleId) => {
    try {
      return await compatibilityApi.deleteRule(ruleId)
    } catch (error) {
      throw error
    }
  }
  
  const clearResult = () => {
    compatibilityResult.value = null
  }
  
  const clearHistory = () => {
    history.value = []
  }
  
  return {
    selectedComponents,
    compatibilityResult,
    isLoading,
    history,
    checkCompatibility,
    getRules,
    createRule,
    updateRule,
    deleteRule,
    clearResult,
    clearHistory
  }
})