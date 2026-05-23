/**
 * 硬件组件验证器
 * 负责验证组件数据的完整性和有效性
 */

class ComponentValidator {
  constructor() {
    this.requiredFields = {
      cpu: ['标题', '品牌', '接口'],
      mb: ['标题', '品牌', 'cpu接口', 'ddr代数'],
      gpu: ['标题', '品牌', '显存'],
      ram: ['标题', '品牌', 'DDR代数', '容量'],
      nvme: ['标题', '品牌', 'NVMe协议', '容量'],
      case: ['标题', '品牌', '主板支持']
    };

    this.validationRules = {
      title: {
        pattern: /^[\w\s\-\u4e00-\u9fa5]+$/,
        maxLength: 100
      },
      brand: {
        pattern: /^[\w\s\-\u4e00-\u9fa5]+$/,
        maxLength: 30
      },
      socket: {
        pattern: /^[\w\s\-\u4e00-\u9fa5]+$/,
        maxLength: 20
      },
      capacity: {
        pattern: /^\d+(GB|TB|MB)?$/i,
        maxLength: 10
      },
      frequency: {
        pattern: /^\d+(MHz|GHz)?$/i,
        maxLength: 10
      },
      length: {
        pattern: /^\d+(\.\d+)?(cm|mm)?$/i,
        maxLength: 10
      }
    };
  }

  validateComponent(component, category) {
    const errors = [];
    const warnings = [];

    if (!component || typeof component !== 'object') {
      errors.push('组件数据格式无效');
      return { isValid: false, errors, warnings };
    }

    // 检查必需字段
    const required = this.requiredFields[category] || [];
    required.forEach(field => {
      if (!component[field] || String(component[field]).trim() === '') {
        errors.push(`缺少必需字段: ${field}`);
      }
    });

    // 验证字段格式
    this.validateFieldFormat(component, '标题', 'title', errors, warnings);
    this.validateFieldFormat(component, '品牌', 'brand', errors, warnings);
    
    // 类别特定验证
    this.validateCategorySpecific(component, category, errors, warnings);

    // 验证数值字段
    this.validateNumericFields(component, category, errors, warnings);

    // 验证兼容性相关字段
    this.validateCompatibilityFields(component, category, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateValidationScore(errors.length, warnings.length)
    };
  }

  validateFieldFormat(component, fieldName, ruleKey, errors, warnings) {
    const value = component[fieldName];
    if (!value) return;

    const rule = this.validationRules[ruleKey];
    if (!rule) return;

    const strValue = String(value);

    if (rule.maxLength && strValue.length > rule.maxLength) {
      warnings.push(`${fieldName} 长度超过 ${rule.maxLength} 个字符`);
    }

    if (rule.pattern && !rule.pattern.test(strValue)) {
      warnings.push(`${fieldName} 格式可能不正确`);
    }
  }

  validateCategorySpecific(component, category, errors, warnings) {
    switch (category) {
      case 'cpu':
        this.validateCPU(component, errors, warnings);
        break;
      case 'mb':
        this.validateMotherboard(component, errors, warnings);
        break;
      case 'gpu':
        this.validateGPU(component, errors, warnings);
        break;
      case 'ram':
        this.validateRAM(component, errors, warnings);
        break;
      case 'nvme':
        this.validateNVMe(component, errors, warnings);
        break;
      case 'case':
        this.validateCase(component, errors, warnings);
        break;
    }
  }

  validateCPU(component, errors, warnings) {
    const socket = component.接口 || component.接口类型;
    if (socket && !this.isValidSocket(socket)) {
      warnings.push('CPU接口格式可能不正确');
    }

    const cores = component.核心 || component.核心数量;
    if (cores && !/^\d+/.test(String(cores))) {
      warnings.push('核心数量格式可能不正确');
    }

    const threads = component.线程 || component.线程数量;
    if (threads && !/^\d+/.test(String(threads))) {
      warnings.push('线程数量格式可能不正确');
    }
  }

  validateMotherboard(component, errors, warnings) {
    const socket = component.cpu接口 || component['CPU插槽'];
    if (socket && !this.isValidSocket(socket)) {
      warnings.push('主板CPU插槽格式可能不正确');
    }

    const ddr = component.ddr代数 || component.内存类型;
    if (ddr && !/^DDR\d+$/i.test(String(ddr))) {
      warnings.push('内存代数格式可能不正确');
    }

    const formFactor = component.板型 || component.尺寸;
    if (formFactor && !/^(ATX|MATX|ITX|E-ATX)$/i.test(String(formFactor))) {
      warnings.push('主板板型格式可能不正确');
    }
  }

  validateGPU(component, errors, warnings) {
    const memory = component.显存;
    if (memory && !/^\d+(GB|MB)$/i.test(String(memory))) {
      warnings.push('显存格式可能不正确');
    }

    const power = component.电源建议;
    if (power && !/^\d+W$/i.test(String(power))) {
      warnings.push('电源建议格式可能不正确');
    }

    const length = component.显卡长度;
    if (length && !/^\d+(\.\d+)?cm$/i.test(String(length))) {
      warnings.push('显卡长度格式可能不正确');
    }
  }

  validateRAM(component, errors, warnings) {
    const ddr = component.DDR代数;
    if (ddr && !/^DDR\d+$/i.test(String(ddr))) {
      warnings.push('内存代数格式可能不正确');
    }

    const capacity = component.容量;
    if (capacity && !/^\d+(GB|MB)$/i.test(String(capacity))) {
      warnings.push('内存容量格式可能不正确');
    }

    const frequency = component.频率;
    if (frequency && !/^\d+(MHz)$/i.test(String(frequency))) {
      warnings.push('内存频率格式可能不正确');
    }
  }

  validateNVMe(component, errors, warnings) {
    const protocol = component.NVMe协议;
    if (protocol && !/^PCIe\s*\d+\.\d+$/i.test(String(protocol))) {
      warnings.push('NVMe协议格式可能不正确');
    }

    const capacity = component.容量;
    if (capacity && !/^\d+(GB|TB)$/i.test(String(capacity))) {
      warnings.push('NVMe容量格式可能不正确');
    }

    const speed = component.NVMe读速;
    if (speed && !/^\d+(MB\/s)$/i.test(String(speed))) {
      warnings.push('读取速度格式可能不正确');
    }
  }

  validateCase(component, errors, warnings) {
    const support = component.主板支持;
    if (support && !/^(ATX|MATX|ITX|E-ATX)(,\s*(ATX|MATX|ITX|E-ATX))*$/i.test(String(support))) {
      warnings.push('主板支持格式可能不正确');
    }

    const maxLength = component.显卡限长;
    if (maxLength && !/^\d+(\.\d+)?cm$/i.test(String(maxLength))) {
      warnings.push('显卡限长格式可能不正确');
    }

    const coolerHeight = component.cpu散热限高;
    if (coolerHeight && !/^\d+(\.\d+)?mm$/i.test(String(coolerHeight))) {
      warnings.push('CPU散热限高格式可能不正确');
    }
  }

  validateNumericFields(component, category, errors, warnings) {
    const numericFields = this.getNumericFields(category);
    
    numericFields.forEach(field => {
      const value = component[field];
      if (value && !this.isNumeric(value)) {
        warnings.push(`${field} 应该包含数值`);
      }
    });
  }

  validateCompatibilityFields(component, category, errors, warnings) {
    const compatFields = this.getCompatibilityFields(category);
    
    compatFields.forEach(field => {
      const value = component[field];
      if (!value || String(value).trim() === '') {
        warnings.push(`兼容性相关字段 ${field} 为空，可能影响兼容性检测`);
      }
    });
  }

  getNumericFields(category) {
    const baseFields = ['频率', '容量', '显卡长度', 'cpu散热限高', 'TBW', '缓存'];
    const categoryFields = {
      cpu: ['核心', '线程', '主频', '加速频率', '二级缓存', '三级缓存'],
      mb: ['M2数量', 'SATA数量', '内存插槽', '内存最大容量'],
      gpu: ['显存', '显存位宽'],
      ram: ['容量', '频率'],
      nvme: ['容量', 'NVMe读速', '写入速度', 'TBW'],
      case: ['显卡限长', 'cpu散热限高']
    };

    return [...baseFields, ...(categoryFields[category] || [])];
  }

  getCompatibilityFields(category) {
    const fields = {
      cpu: ['接口', '接口类型'],
      mb: ['cpu接口', 'CPU插槽', 'ddr代数', '内存类型', '板型', '尺寸'],
      gpu: ['显卡长度', '电源建议'],
      ram: ['DDR代数'],
      nvme: ['NVMe协议'],
      case: ['主板支持', '显卡限长', 'cpu散热限高']
    };

    return fields[category] || [];
  }

  isValidSocket(socket) {
    const validSockets = [
      'Socket AM5', 'Socket AM4', 'LGA 1700', 'LGA 1200', 'LGA 1151',
      'Socket TR4', 'Socket sTRX4', 'LGA 2066', 'LGA 2011', 'Socket FM2+'
    ];
    
    return validSockets.some(valid => 
      String(socket).toLowerCase().includes(valid.toLowerCase())
    );
  }

  isNumeric(value) {
    const str = String(value);
    return /^\d+(\.\d+)?/.test(str) || /\d/.test(str);
  }

  calculateValidationScore(errorCount, warningCount) {
    const maxScore = 100;
    const errorPenalty = 20;
    const warningPenalty = 5;
    
    let score = maxScore;
    score -= errorCount * errorPenalty;
    score -= warningCount * warningPenalty;
    
    return Math.max(0, score);
  }

  // 批量验证组件
  validateBatch(components, category) {
    const results = {
      total: components.length,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: [],
      averageScore: 0
    };

    let totalScore = 0;

    components.forEach((component, index) => {
      const validation = this.validateComponent(component, category);
      
      if (validation.isValid) {
        results.valid++;
      } else {
        results.invalid++;
      }

      results.errors.push(...validation.errors.map(error => 
        `[${index}] ${component.标题 || '未知'}: ${error}`
      ));
      
      results.warnings.push(...validation.warnings.map(warning => 
        `[${index}] ${component.标题 || '未知'}: ${warning}`
      ));
      
      totalScore += validation.score;
    });

    results.averageScore = results.total > 0 ? Math.round(totalScore / results.total) : 0;

    return results;
  }

  // 生成验证报告
  generateReport(validationResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalComponents: validationResults.total,
        validComponents: validationResults.valid,
        validationScore: validationResults.averageScore,
        quality: this.getQualityLevel(validationResults.averageScore)
      },
      details: {
        errors: validationResults.errors,
        warnings: validationResults.warnings
      }
    };

    return report;
  }

  getQualityLevel(score) {
    if (score >= 90) return '优秀';
    if (score >= 75) return '良好';
    if (score >= 60) return '合格';
    return '需要改进';
  }
}

// 创建全局实例
window.ComponentValidator = new ComponentValidator();