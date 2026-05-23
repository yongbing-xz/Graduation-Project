/**
 * 硬件兼容性检测平台 - 数据管理器
 * 负责本地数据存储、加载、同步等功能
 */

class DataManager {
  constructor() {
    this.storageKey = 'hardware_compatibility_data';
    this.version = '1.0.0';
    this.init();
  }

  init() {
    // 确保本地存储中有基础数据
    if (!this.getData()) {
      this.loadDefaultData();
    }
  }

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取数据失败:', error);
      return null;
    }
  }

  saveData(data) {
    try {
      const dataWithMeta = {
        ...data,
        _meta: {
          version: this.version,
          lastUpdated: new Date().toISOString(),
          count: this.countComponents(data.components)
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataWithMeta));
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  countComponents(components) {
    if (!components) return 0;
    return Object.values(components).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0);
    }, 0);
  }

  loadDefaultData() {
    const defaultData = {
      components: {
        cpu: [],
        mb: [],
        gpu: [],
        ram: [],
        nvme: [],
        case: []
      },
      compatibility: {},
      userConfigs: []
    };
    
    this.saveData(defaultData);
    return defaultData;
  }

  // 导入外部数据
  importData(data, source = 'user') {
    try {
      // 验证数据格式
      if (!this.validateData(data)) {
        throw new Error('数据格式无效');
      }

      const currentData = this.getData() || this.loadDefaultData();
      
      // 合并数据
      const mergedData = this.mergeData(currentData, data);
      
      // 保存合并后的数据
      if (this.saveData(mergedData)) {
        this.logImport(source, mergedData._meta.count);
        return mergedData;
      }
      
      throw new Error('保存失败');
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }

  validateData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.components || typeof data.components !== 'object') return false;
    
    // 检查必需组件类别
    const requiredCategories = ['cpu', 'mb', 'gpu', 'ram', 'nvme', 'case'];
    return requiredCategories.every(cat => {
      return Array.isArray(data.components[cat]);
    });
  }

  mergeData(currentData, newData) {
    const merged = { ...currentData };
    
    // 合并组件数据
    Object.keys(newData.components).forEach(category => {
      if (!merged.components[category]) {
        merged.components[category] = [];
      }
      
      newData.components[category].forEach(newComponent => {
        // 检查是否已存在（基于标题和品牌）
        const exists = merged.components[category].some(existing => 
          existing.标题 === newComponent.标题 && 
          existing.品牌 === newComponent.品牌
        );
        
        if (!exists) {
          merged.components[category].push(newComponent);
        }
      });
    });

    // 合并兼容性规则
    if (newData.compatibility) {
      merged.compatibility = { ...merged.compatibility, ...newData.compatibility };
    }

    return merged;
  }

  logImport(source, componentCount) {
    const importLog = {
      timestamp: new Date().toISOString(),
      source: source,
      componentCount: componentCount,
      user: localStorage.getItem('current_user') || 'anonymous'
    };
    
    const logs = JSON.parse(localStorage.getItem('import_logs') || '[]');
    logs.push(importLog);
    localStorage.setItem('import_logs', JSON.stringify(logs.slice(-50))); // 保留最近50条
  }

  // 导出数据
  exportData(format = 'json') {
    const data = this.getData();
    if (!data) return null;

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.toCSV(data);
      case 'compact':
        return JSON.stringify(data);
      default:
        return null;
    }
  }

  toCSV(data) {
    let csv = '类别,标题,品牌,关键参数\n';
    
    Object.keys(data.components).forEach(category => {
      data.components[category].forEach(component => {
        const title = `"${component.标题 || ''}"`;
        const brand = `"${component.品牌 || ''}"`;
        const keyParams = this.getKeyParams(component, category);
        
        csv += `${category},${title},${brand},"${keyParams}"\n`;
      });
    });
    
    return csv;
  }

  getKeyParams(component, category) {
    switch (category) {
      case 'cpu':
        return `接口:${component.接口 || ''},核心:${component.核心 || ''},线程:${component.线程 || ''}`;
      case 'mb':
        return `插槽:${component.cpu接口 || ''},内存:${component.ddr代数 || ''},板型:${component.板型 || ''}`;
      case 'gpu':
        return `显存:${component.显存 || ''},电源:${component.电源建议 || ''},长度:${component.显卡长度 || ''}`;
      case 'ram':
        return `DDR:${component.DDR代数 || ''},容量:${component.容量 || ''},频率:${component.频率 || ''}`;
      case 'nvme':
        return `协议:${component.NVMe协议 || ''},容量:${component.容量 || ''},读速:${component.NVMe读速 || ''}`;
      case 'case':
        return `支持:${component.主板支持 || ''},显卡限长:${component.显卡限长 || ''},散热限高:${component.cpu散热限高 || ''}`;
      default:
        return '';
    }
  }

  // 统计数据
  getStats() {
    const data = this.getData();
    if (!data) return null;

    const stats = {
      totalComponents: 0,
      byCategory: {},
      byBrand: {},
      lastUpdated: data._meta?.lastUpdated
    };

    Object.keys(data.components).forEach(category => {
      const categoryComponents = data.components[category];
      stats.byCategory[category] = categoryComponents.length;
      stats.totalComponents += categoryComponents.length;

      // 统计品牌分布
      categoryComponents.forEach(component => {
        const brand = component.品牌 || '未知';
        if (!stats.byBrand[brand]) {
          stats.byBrand[brand] = 0;
        }
        stats.byBrand[brand]++;
      });
    });

    return stats;
  }

  // 备份和恢复
  backup() {
    const data = this.getData();
    const backupKey = `backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    // 清理旧备份（保留最近5个）
    this.cleanupOldBackups();
    
    return backupKey;
  }

  restore(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('备份不存在');
      }

      const data = JSON.parse(backupData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('恢复备份失败:', error);
      return false;
    }
  }

  cleanupOldBackups() {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('backup_'))
      .sort((a, b) => {
        const timeA = parseInt(a.split('_')[1]);
        const timeB = parseInt(b.split('_')[1]);
        return timeB - timeA;
      });

    // 删除除前5个之外的所有备份
    backupKeys.slice(5).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // 清空数据
  clearData() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
}

// 创建全局实例
window.DataManager = new DataManager();