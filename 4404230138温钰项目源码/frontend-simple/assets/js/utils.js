/**
 * 硬件兼容性检测平台 - 工具函数库
 * 提供通用的工具函数和辅助方法
 */

class Utils {
  /**
   * 防抖函数
   * @param {Function} func 要执行的函数
   * @param {number} delay 延迟时间(ms)
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 节流函数
   * @param {Function} func 要执行的函数
   * @param {number} delay 间隔时间(ms)
   * @returns {Function} 节流后的函数
   */
  static throttle(func, delay = 300) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * 深拷贝对象
   * @param {any} obj 要拷贝的对象
   * @returns {any} 深拷贝后的对象
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = this.deepClone(obj[key]);
    });
    
    return cloned;
  }

  /**
   * 格式化文件大小
   * @param {number} bytes 字节数
   * @returns {string} 格式化后的文件大小
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 生成唯一ID
   * @param {string} prefix 前缀
   * @returns {string} 唯一ID
   */
  static generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * 验证邮箱格式
   * @param {string} email 邮箱地址
   * @returns {boolean} 是否有效
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证URL格式
   * @param {string} url URL地址
   * @returns {boolean} 是否有效
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 安全地解析JSON
   * @param {string} jsonString JSON字符串
   * @param {any} defaultValue 默认值
   * @returns {any} 解析后的对象或默认值
   */
  static safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  /**
   * 数组去重
   * @param {Array} array 数组
   * @param {string} key 对象键名（可选）
   * @returns {Array} 去重后的数组
   */
  static unique(array, key = null) {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  }

  /**
   * 日期格式化
   * @param {Date} date 日期对象
   * @param {string} format 格式字符串
   * @returns {string} 格式化后的日期
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 数字格式化
   * @param {number} num 数字
   * @param {number} decimals 小数位数
   * @returns {string} 格式化后的数字
   */
  static formatNumber(num, decimals = 0) {
    if (isNaN(num)) return '0';
    
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
  }

  /**
   * 颜色亮度计算
   * @param {string} hex 十六进制颜色
   * @param {number} percent 亮度百分比
   * @returns {string} 调整后的颜色
   */
  static lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  /**
   * 下载文件
   * @param {string} content 文件内容
   * @param {string} filename 文件名
   * @param {string} type MIME类型
   */
  static downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  /**
   * 复制文本到剪贴板
   * @param {string} text 要复制的文本
   * @returns {Promise<boolean>} 是否成功
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // 回退方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch {
      return false;
    }
  }

  /**
   * 本地存储工具
   */
  static storage = {
    /**
     * 设置存储项
     * @param {string} key 键名
     * @param {any} value 值
     */
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    /**
     * 获取存储项
     * @param {string} key 键名
     * @param {any} defaultValue 默认值
     * @returns {any} 存储的值或默认值
     */
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    /**
     * 移除存储项
     * @param {string} key 键名
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },

    /**
     * 清空存储
     */
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch {
        return false;
      }
    }
  };

  /**
   * 事件总线
   */
  static eventBus = {
    events: new Map(),
    
    /**
     * 监听事件
     * @param {string} event 事件名
     * @param {Function} callback 回调函数
     */
    on(event, callback) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event).push(callback);
    },

    /**
     * 触发事件
     * @param {string} event 事件名
     * @param {any} data 事件数据
     */
    emit(event, data) {
      const callbacks = this.events.get(event);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`事件 ${event} 回调错误:`, error);
          }
        });
      }
    },

    /**
     * 移除事件监听
     * @param {string} event 事件名
     * @param {Function} callback 回调函数
     */
    off(event, callback) {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  };

  /**
   * 性能监控
   */
  static performance = {
    /**
     * 开始计时
     * @param {string} name 计时器名称
     */
    start(name) {
      if (!window.performance) return;
      performance.mark(`${name}-start`);
    },

    /**
     * 结束计时
     * @param {string} name 计时器名称
     * @returns {number} 耗时(ms)
     */
    end(name) {
      if (!window.performance) return 0;
      
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      const duration = measure ? measure.duration : 0;
      
      // 清理标记
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return duration;
    }
  };
}

// 创建全局实例
window.Utils = Utils;