/**
 * 硬件兼容性检测引擎
 * 负责执行组件兼容性检测和规则匹配
 */

class CompatibilityEngine {
  constructor() {
    this.rules = this.loadDefaultRules();
    this.cache = new Map();
  }

  loadDefaultRules() {
    return {
      // CPU与主板兼容性规则
      cpu_mb_socket: {
        name: 'CPU与主板插槽匹配',
        type: 'critical',
        description: 'CPU和主板的物理接口必须匹配',
        check: (cpu, mb) => {
          const cpuSocket = (cpu.接口 || cpu.接口类型 || '').trim().toUpperCase();
          const mbSocket = (mb['cpu接口'] || mb['CPU插槽'] || '').trim().toUpperCase();
          
          if (!cpuSocket || !mbSocket) return { compatible: null, reason: '插槽信息不完整' };
          
          const compatible = cpuSocket === mbSocket;
          return {
            compatible,
            reason: compatible ? '插槽匹配' : `CPU插槽(${cpuSocket})与主板插槽(${mbSocket})不匹配`
          };
        }
      },

      // 内存与主板兼容性规则
      ram_mb_ddr: {
        name: '内存与主板DDR代数匹配',
        type: 'critical',
        description: '内存的DDR代数必须与主板支持的DDR代数匹配',
        check: (ram, mb) => {
          const ramDDR = (ram['DDR代数'] || '').toUpperCase().replace(/[^DDR0-9]/g, '');
          const mbDDR = (mb['ddr代数'] || mb['内存类型'] || '').toUpperCase().replace(/[^DDR0-9]/g, '');
          
          if (!ramDDR || !mbDDR) return { compatible: null, reason: 'DDR代数信息不完整' };
          
          const compatible = ramDDR === mbDDR;
          return {
            compatible,
            reason: compatible ? 'DDR代数匹配' : `内存DDR(${ramDDR})与主板DDR(${mbDDR})不兼容`
          };
        }
      },

      // 机箱与主板尺寸兼容性规则
      case_mb_formfactor: {
        name: '机箱与主板尺寸兼容',
        type: 'critical',
        description: '机箱必须支持主板的物理尺寸',
        check: (pcCase, mb) => {
          const mbForm = (mb['板型'] || mb['尺寸'] || '').toUpperCase();
          const caseSupport = (pcCase['主板支持'] || '').toUpperCase();
          
          if (!mbForm || !caseSupport) return { compatible: null, reason: '尺寸信息不完整' };
          
          const supportedFormFactors = caseSupport.split(',').map(s => s.trim());
          const compatible = supportedFormFactors.includes(mbForm);
          
          return {
            compatible,
            reason: compatible ? '尺寸兼容' : `机箱不支持${mbForm}主板`
          };
        }
      },

      // 显卡与机箱长度兼容性规则
      gpu_case_length: {
        name: '显卡与机箱长度兼容',
        type: 'critical',
        description: '显卡长度不能超过机箱的显卡限长',
        check: (gpu, pcCase) => {
          const gpuLength = this.extractNumber(gpu['显卡长度']);
          const caseMaxLength = this.extractNumber(pcCase['显卡限长']);
          
          if (!gpuLength || !caseMaxLength) return { compatible: null, reason: '长度信息不完整' };
          
          const compatible = gpuLength <= caseMaxLength;
          return {
            compatible,
            reason: compatible ? '长度兼容' : `显卡长度(${gpuLength}cm)超过机箱限长(${caseMaxLength}cm)`
          };
        }
      },

      // CPU散热器与机箱高度兼容性规则
      cpu_case_height: {
        name: 'CPU散热器与机箱高度兼容',
        type: 'warning',
        description: 'CPU散热器高度不能超过机箱的CPU散热限高',
        check: (cpu, pcCase) => {
          const caseHeight = this.extractNumber(pcCase['cpu散热限高']);
          const hasStockCooler = !(cpu['是否自带风扇'] || '').includes('不带');
          
          if (!caseHeight) return { compatible: null, reason: '散热限高信息不完整' };
          
          // 如果有原装散热器，默认兼容
          if (hasStockCooler) {
            return { compatible: true, reason: '使用原装散热器，高度兼容' };
          }
          
          return { compatible: null, reason: '需要选择合适的风冷散热器' };
        }
      },

      // M.2插槽数量检查
      mb_nvme_slots: {
        name: '主板M.2插槽数量检查',
        type: 'warning',
        description: '检查主板是否有足够的M.2插槽',
        check: (mb, nvme) => {
          const m2Slots = this.extractNumber(mb['M2数量']);
          
          if (!m2Slots) return { compatible: null, reason: 'M.2插槽数量未知' };
          
          const compatible = m2Slots >= 1; // 假设至少需要1个插槽
          return {
            compatible,
            reason: compatible ? '有可用M.2插槽' : '主板无M.2插槽'
          };
        }
      },

      // 电源功率建议
      power_supply: {
        name: '电源功率建议',
        type: 'recommendation',
        description: '根据组件估算所需的电源功率',
        check: (components) => {
          const { cpu, gpu, mb, ram, nvme } = components;
          
          let estimatedPower = 0;
          
          // CPU功耗估算
          if (cpu) {
            const series = (cpu.系列 || '').toLowerCase();
            if (series.includes('i9') || series.includes('ryzen 9')) estimatedPower += 250;
            else if (series.includes('i7') || series.includes('ryzen 7')) estimatedPower += 150;
            else if (series.includes('i5') || series.includes('ryzen 5')) estimatedPower += 100;
            else estimatedPower += 80;
          }
          
          // GPU功耗估算
          if (gpu) {
            const model = (gpu.型号 || '').toLowerCase();
            if (model.includes('rtx 4090') || model.includes('rx 7900')) estimatedPower += 450;
            else if (model.includes('rtx 4080') || model.includes('rx 7800')) estimatedPower += 320;
            else if (model.includes('rtx 4070') || model.includes('rx 7700')) estimatedPower += 200;
            else if (model.includes('rtx 4060') || model.includes('rx 7600')) estimatedPower += 160;
            else if (model.includes('rtx 30')) estimatedPower += 220;
            else estimatedPower += 150;
          }
          
          // 基础组件功耗
          estimatedPower += 50; // 主板、内存、存储等
          
          // 安全余量
          estimatedPower = Math.round(estimatedPower * 1.2);
          
          return {
            compatible: true,
            reason: `建议电源功率: ${estimatedPower}W`,
            recommendation: `推荐使用${estimatedPower}W或更高功率的电源`
          };
        }
      }
    };
  }

  extractNumber(str) {
    if (!str) return null;
    const match = String(str).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  // 检查两个组件之间的兼容性
  checkCompatibility(componentA, componentB, ruleName) {
    const cacheKey = `${componentA.标题}_${componentB.标题}_${ruleName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const rule = this.rules[ruleName];
    if (!rule) {
      const result = { compatible: null, reason: '未知的兼容性规则' };
      this.cache.set(cacheKey, result);
      return result;
    }

    let result;
    try {
      result = rule.check(componentA, componentB);
    } catch (error) {
      result = { compatible: null, reason: '兼容性检查出错' };
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  // 检查完整配置的兼容性
  checkConfiguration(configuration) {
    const results = {
      critical: [],
      warnings: [],
      recommendations: [],
      overall: 'unknown',
      score: 0
    };

    const { cpu, mb, gpu, ram, nvme, case: pcCase } = configuration;

    // CPU与主板兼容性检查
    if (cpu && mb) {
      const result = this.checkCompatibility(cpu, mb, 'cpu_mb_socket');
      this.addResult(results, result, 'critical');
    }

    // 内存与主板兼容性检查
    if (ram && mb) {
      const result = this.checkCompatibility(ram, mb, 'ram_mb_ddr');
      this.addResult(results, result, 'critical');
    }

    // 机箱与主板兼容性检查
    if (pcCase && mb) {
      const result = this.checkCompatibility(pcCase, mb, 'case_mb_formfactor');
      this.addResult(results, result, 'critical');
    }

    // 显卡与机箱兼容性检查
    if (gpu && pcCase) {
      const result = this.checkCompatibility(gpu, pcCase, 'gpu_case_length');
      this.addResult(results, result, 'critical');
    }

    // CPU散热器与机箱兼容性检查
    if (cpu && pcCase) {
      const result = this.checkCompatibility(cpu, pcCase, 'cpu_case_height');
      this.addResult(results, result, 'warning');
    }

    // M.2插槽检查
    if (mb && nvme) {
      const result = this.checkCompatibility(mb, nvme, 'mb_nvme_slots');
      this.addResult(results, result, 'warning');
    }

    // 电源功率建议
    if (cpu || gpu) {
      const result = this.rules.power_supply.check(configuration);
      this.addResult(results, result, 'recommendation');
    }

    // 计算总体兼容性评分
    results.score = this.calculateScore(results);
    results.overall = this.getOverallStatus(results);

    return results;
  }

  addResult(results, result, type) {
    if (result.compatible === null) return; // 跳过无法判断的结果

    const resultWithType = {
      ...result,
      type: type
    };

    switch (type) {
      case 'critical':
        results.critical.push(resultWithType);
        break;
      case 'warning':
        results.warnings.push(resultWithType);
        break;
      case 'recommendation':
        results.recommendations.push(resultWithType);
        break;
    }
  }

  calculateScore(results) {
    let score = 100;

    // 关键问题扣分
    results.critical.forEach(result => {
      if (!result.compatible) score -= 30;
    });

    // 警告问题扣分
    results.warnings.forEach(result => {
      if (!result.compatible) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  getOverallStatus(results) {
    const hasCriticalError = results.critical.some(result => !result.compatible);
    const hasWarning = results.warnings.some(result => !result.compatible);

    if (hasCriticalError) return 'incompatible';
    if (hasWarning) return 'warning';
    if (results.score >= 80) return 'excellent';
    if (results.score >= 60) return 'good';
    return 'fair';
  }

  // 获取兼容性报告
  generateReport(compatibilityResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallStatus: compatibilityResults.overall,
        compatibilityScore: compatibilityResults.score,
        criticalIssues: compatibilityResults.critical.length,
        warnings: compatibilityResults.warnings.length,
        recommendations: compatibilityResults.recommendations.length
      },
      details: {
        critical: compatibilityResults.critical,
        warnings: compatibilityResults.warnings,
        recommendations: compatibilityResults.recommendations
      }
    };

    return report;
  }

  // 添加自定义规则
  addRule(name, rule) {
    if (this.rules[name]) {
      console.warn(`规则 ${name} 已存在，将被覆盖`);
    }
    this.rules[name] = rule;
    this.clearCache();
  }

  // 清空缓存
  clearCache() {
    this.cache.clear();
  }

  // 获取所有规则
  getRules() {
    return { ...this.rules };
  }
}

// 创建全局实例
window.CompatibilityEngine = new CompatibilityEngine();