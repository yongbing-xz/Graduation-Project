/**
 * 全局错误处理器
 * 负责捕获和处理前端所有类型的错误
 */

import { ElMessage, ElNotification } from 'element-plus'

// 错误类型枚举
export const ErrorType = {
  NETWORK: 'network',
  JAVASCRIPT: 'javascript', 
  HTTP: 'http',
  VUE: 'vue',
  PROMISE: 'promise',
  BUSINESS: 'business'
}

// 错误严重级别
export const ErrorLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

class GlobalErrorHandler {
  constructor() {
    this.errorHistory = []
    this.maxHistorySize = 100
    this.errorReportAPI = '/api/errors/report'
    this.isDevelopment = import.meta.env.DEV
    this.init()
  }

  /**
   * 初始化错误处理
   */
  init() {
    this.setupGlobalErrorHandler()
    this.setupPromiseErrorHandler()
    this.setupNetworkErrorHandler()
    this.setupVueErrorHandler()
  }

  /**
   * 设置全局JavaScript错误处理
   */
  setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      const error = {
        type: ErrorType.JAVASCRIPT,
        level: ErrorLevel.HIGH,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }

      this.handleError(error)
      this.reportError(error)
    })
  }

  /**
   * 设置Promise错误处理
   */
  setupPromiseErrorHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        type: ErrorType.PROMISE,
        level: ErrorLevel.MEDIUM,
        message: event.reason?.message || '未处理的Promise rejection',
        stack: event.reason?.stack,
        reason: event.reason,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }

      this.handleError(error)
      this.reportError(error)
    })
  }

  /**
   * 设置网络错误处理
   */
  setupNetworkErrorHandler() {
    window.addEventListener('online', () => {
      ElNotification({
        title: '网络连接恢复',
        message: '网络连接已恢复正常',
        type: 'success'
      })
    })

    window.addEventListener('offline', () => {
      const error = {
        type: ErrorType.NETWORK,
        level: ErrorLevel.HIGH,
        message: '网络连接已断开',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }

      this.handleError(error)
      ElNotification({
        title: '网络连接断开',
        message: '请检查您的网络连接',
        type: 'warning',
        duration: 0
      })
    })
  }

  /**
   * 设置Vue错误处理
   */
  setupVueErrorHandler() {
    // 这将在Vue应用创建后调用
    window.VueErrorHandler = (error, instance, info) => {
      const vueError = {
        type: ErrorType.VUE,
        level: ErrorLevel.HIGH,
        message: error.message,
        stack: error.stack,
        componentInfo: info,
        componentName: instance?.$options?.name || 'Unknown',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }

      this.handleError(vueError)
      this.reportError(vueError)
    }
  }

  /**
   * 处理HTTP错误
   */
  handleHttpError(error) {
    const httpError = {
      type: ErrorType.HTTP,
      level: this.getHttpErrorLevel(error.status),
      message: error.message || `HTTP ${error.status} Error`,
      status: error.status,
      statusText: error.statusText,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
      responseData: error.response?.data,
      timestamp: new Date().toISOString()
    }

    this.handleError(httpError)
    this.reportError(httpError)
    
    return Promise.reject(error)
  }

  /**
   * 处理业务逻辑错误
   */
  handleBusinessError(message, level = ErrorLevel.LOW, extraData = {}) {
    const businessError = {
      type: ErrorType.BUSINESS,
      level,
      message,
      ...extraData,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    this.handleError(businessError)
    
    // 业务错误通常不需要上报到服务器
    if (level === ErrorLevel.HIGH || level === ErrorLevel.CRITICAL) {
      this.reportError(businessError)
    }
  }

  /**
   * 获取HTTP错误级别
   */
  getHttpErrorLevel(status) {
    if (status >= 500) return ErrorLevel.CRITICAL
    if (status >= 400) return ErrorLevel.HIGH
    if (status >= 300) return ErrorLevel.MEDIUM
    return ErrorLevel.LOW
  }

  /**
   * 统一处理错误
   */
  handleError(error) {
    // 保存到历史记录
    this.saveToHistory(error)
    
    // 显示用户友好的错误消息
    this.showErrorMessage(error)
    
    // 开发环境下打印详细错误信息
    if (this.isDevelopment) {
      console.group('🚨 错误详情')
      console.error('错误类型:', error.type)
      console.error('错误级别:', error.level)
      console.error('错误信息:', error.message)
      if (error.stack) console.error('错误堆栈:', error.stack)
      console.groupEnd()
    }
  }

  /**
   * 显示错误消息
   */
  showErrorMessage(error) {
    let message = this.getDisplayMessage(error)
    let type = 'error'
    
    switch (error.level) {
      case ErrorLevel.LOW:
        type = 'info'
        break
      case ErrorLevel.MEDIUM:
        type = 'warning'
        break
      case ErrorLevel.HIGH:
        type = 'error'
        break
      case ErrorLevel.CRITICAL:
        type = 'error'
        message = '系统出现严重错误，请联系管理员'
        break
    }

    if (error.type === ErrorType.NETWORK) {
      ElNotification({
        title: '网络错误',
        message,
        type,
        duration: error.level === ErrorLevel.CRITICAL ? 0 : 4500
      })
    } else {
      ElMessage({
        message,
        type,
        duration: error.level === ErrorLevel.CRITICAL ? 0 : 3000
      })
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  getDisplayMessage(error) {
    // 根据错误类型和级别返回用户友好的消息
    const messages = {
      [ErrorType.NETWORK]: {
        [ErrorLevel.HIGH]: '网络连接出现问题，请检查您的网络设置',
        [ErrorLevel.CRITICAL]: '无法连接到服务器，请稍后重试'
      },
      [ErrorType.HTTP]: {
        [ErrorLevel.HIGH]: '服务器请求失败，请稍后重试',
        [ErrorLevel.CRITICAL]: '服务器内部错误，请联系管理员'
      },
      [ErrorType.JAVASCRIPT]: {
        [ErrorLevel.HIGH]: '程序执行出现错误',
        [ErrorLevel.CRITICAL]: '程序出现严重错误'
      }
    }

    return messages[error.type]?.[error.level] || error.message || '操作失败，请重试'
  }

  /**
   * 保存错误到历史记录
   */
  saveToHistory(error) {
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
    
    // 保存到localStorage用于调试
    if (this.isDevelopment) {
      try {
        localStorage.setItem('error_history', JSON.stringify(this.errorHistory))
      } catch (e) {
        console.warn('无法保存错误历史到localStorage')
      }
    }
  }

  /**
   * 上报错误到服务器
   */
  async reportError(error) {
    if (!navigator.onLine) {
      console.warn('网络断开，跳过错误上报')
      return
    }

    try {
      // 过滤敏感信息
      const reportData = this.sanitizeErrorData(error)
      
      await fetch(this.errorReportAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })
    } catch (e) {
      console.warn('错误上报失败:', e)
      // 上报失败时保存到本地，待网络恢复后重试
      this.saveForRetry(error)
    }
  }

  /**
   * 清理错误数据中的敏感信息
   */
  sanitizeErrorData(error) {
    const sensitiveKeys = ['password', 'token', 'authorization', 'cookie']
    const sanitized = { ...error }

    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj
      
      const result = {}
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          result[key] = '[REDACTED]'
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value)
        } else {
          result[key] = value
        }
      }
      return result
    }

    return sanitizeObject(sanitized)
  }

  /**
   * 保存失败的上报请求，用于重试
   */
  saveForRetry(error) {
    try {
      const retryQueue = JSON.parse(localStorage.getItem('error_retry_queue') || '[]')
      retryQueue.push({
        error: this.sanitizeErrorData(error),
        timestamp: Date.now()
      })
      localStorage.setItem('error_retry_queue', JSON.stringify(retryQueue))
    } catch (e) {
      console.warn('无法保存重试队列')
    }
  }

  /**
   * 重试失败的上报
   */
  retryFailedReports() {
    try {
      const retryQueue = JSON.parse(localStorage.getItem('error_retry_queue') || '[]')
      if (retryQueue.length === 0) return

      const promises = retryQueue.map(item => 
        fetch(this.errorReportAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item.error)
        })
      )

      Promise.allSettled(promises).then(() => {
        // 清空重试队列
        localStorage.removeItem('error_retry_queue')
      })
    } catch (e) {
      console.warn('重试失败的上报时出错')
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory() {
    return [...this.errorHistory]
  }

  /**
   * 清空错误历史
   */
  clearErrorHistory() {
    this.errorHistory = []
    if (this.isDevelopment) {
      localStorage.removeItem('error_history')
    }
  }

  /**
   * 导出错误报告
   */
  exportErrorReport() {
    const report = {
      exportTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorCount: this.errorHistory.length,
      errors: this.errorHistory
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// 创建全局实例
export const globalErrorHandler = new GlobalErrorHandler()

// 网络恢复时重试失败的上报
window.addEventListener('online', () => {
  globalErrorHandler.retryFailedReports()
})

// 导出便捷方法
export const handleBusinessError = (message, level, extraData) => {
  globalErrorHandler.handleBusinessError(message, level, extraData)
}

export const handleHttpError = (error) => {
  return globalErrorHandler.handleHttpError(error)
}

export const getErrorHistory = () => {
  return globalErrorHandler.getErrorHistory()
}

export const exportErrorReport = () => {
  return globalErrorHandler.exportErrorReport()
}