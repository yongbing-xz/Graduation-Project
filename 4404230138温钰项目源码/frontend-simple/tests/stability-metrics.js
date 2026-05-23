import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StabilityMetrics {
  constructor(config) {
    this.config = config || this.getDefaultConfig();
    this.metricsHistory = [];
    this.maxHistorySize = 1000; // 保存更多历史数据用于趋势分析
  }

  getDefaultConfig() {
    return {
      // 测试通过率指标
      testPassRate: {
        target: 99.5, // 目标通过率 99.5%
        warningThreshold: 98.0, // 警告阈值 98%
        criticalThreshold: 95.0 // 关键阈值 95%
      },
      
      // 性能指标
      performance: {
        pageLoadTime: {
          target: 2000, // 目标页面加载时间 2秒
          warningThreshold: 3000, // 警告阈值 3秒
          criticalThreshold: 5000 // 关键阈值 5秒
        },
        apiResponseTime: {
          target: 500, // 目标API响应时间 500ms
          warningThreshold: 1000, // 警告阈值 1秒
          criticalThreshold: 3000 // 关键阈值 3秒
        },
        memoryUsage: {
          target: 300, // 目标内存使用 300MB
          warningThreshold: 500, // 警告阈值 500MB
          criticalThreshold: 1000 // 关键阈值 1GB
        }
      },
      
      // 可用性指标
      availability: {
        uptimeTarget: 99.9, // 目标可用性 99.9%
        mttrTarget: 60, // 目标平均修复时间 60分钟
        mtbfTarget: 720 // 目标平均无故障时间 720小时（30天）
      },
      
      // 错误率指标
      errorRates: {
        criticalErrors: {
          target: 0, // 目标关键错误数
          warningThreshold: 1, // 警告阈值
          criticalThreshold: 5 // 关键阈值
        },
        warningErrors: {
          target: 0, // 目标警告错误数
          warningThreshold: 5, // 警告阈值
          criticalThreshold: 10 // 关键阈值
        }
      }
    };
  }

  async calculateMetrics(testResults, executionInfo = {}) {
    const metrics = {
      timestamp: new Date().toISOString(),
      executionId: executionInfo.id || this.generateId(),
      environment: executionInfo.environment || 'unknown',
      testType: executionInfo.testType || 'unknown',
      
      // 测试相关指标
      testMetrics: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        passRate: 0,
        executionTime: 0
      },
      
      // 性能指标
      performanceMetrics: {},
      
      // 错误指标
      errorMetrics: {
        criticalErrors: 0,
        warningErrors: 0,
        totalErrors: 0,
        errorRate: 0
      },
      
      // 稳定性评分
      stabilityScore: 0,
      
      // 合规性状态
      compliance: {
        testPassRate: 'pass',
        performance: 'pass',
        errorRates: 'pass',
        overall: 'pass'
      },
      
      // 趋势分析
      trends: {},
      
      // 详细数据
      details: {}
    };

    // 计算测试指标
    this.calculateTestMetrics(metrics, testResults);
    
    // 计算性能指标
    this.calculatePerformanceMetrics(metrics, testResults);
    
    // 计算错误指标
    this.calculateErrorMetrics(metrics, testResults);
    
    // 计算稳定性评分
    this.calculateStabilityScore(metrics);
    
    // 检查合规性
    this.checkCompliance(metrics);
    
    // 分析趋势
    await this.analyzeTrends(metrics);
    
    // 保存指标数据
    this.addToMetricsHistory(metrics);
    await this.saveMetricsHistory();
    
    return metrics;
  }

  calculateTestMetrics(metrics, testResults) {
    if (Array.isArray(testResults)) {
      metrics.testMetrics.totalTests = testResults.length;
      metrics.testMetrics.passedTests = testResults.filter(r => r.passed).length;
      metrics.testMetrics.failedTests = testResults.filter(r => !r.passed).length;
      metrics.testMetrics.skippedTests = testResults.filter(r => r.skipped).length || 0;
      
      if (metrics.testMetrics.totalTests > 0) {
        metrics.testMetrics.passRate = 
          (metrics.testMetrics.passedTests / metrics.testMetrics.totalTests) * 100;
      }
      
      // 计算执行时间
      const durations = testResults
        .filter(r => r.duration)
        .map(r => r.duration);
      
      if (durations.length > 0) {
        metrics.testMetrics.executionTime = durations.reduce((sum, dur) => sum + dur, 0);
      }
    }
    
    metrics.details.testResults = testResults;
  }

  calculatePerformanceMetrics(metrics, testResults) {
    const performanceData = [];
    
    if (Array.isArray(testResults)) {
      testResults.forEach(result => {
        if (result.performanceMetrics) {
          performanceData.push(result.performanceMetrics);
        }
      });
    }
    
    if (performanceData.length > 0) {
      metrics.performanceMetrics = this.aggregatePerformanceData(performanceData);
    }
    
    metrics.details.performanceData = performanceData;
  }

  aggregatePerformanceData(performanceData) {
    const aggregated = {
      pageLoadTime: { values: [], average: 0, max: 0, min: Infinity },
      apiResponseTime: { values: [], average: 0, max: 0, min: Infinity },
      memoryUsage: { values: [], average: 0, max: 0, min: Infinity }
    };
    
    performanceData.forEach(data => {
      if (data.pageLoadTime) {
        aggregated.pageLoadTime.values.push(data.pageLoadTime);
      }
      if (data.apiResponseTime) {
        aggregated.apiResponseTime.values.push(data.apiResponseTime);
      }
      if (data.memoryUsage) {
        aggregated.memoryUsage.values.push(data.memoryUsage);
      }
    });
    
    // 计算统计值
    Object.keys(aggregated).forEach(key => {
      const metric = aggregated[key];
      if (metric.values.length > 0) {
        metric.average = metric.values.reduce((sum, val) => sum + val, 0) / metric.values.length;
        metric.max = Math.max(...metric.values);
        metric.min = Math.min(...metric.values);
        metric.standardDeviation = this.calculateStandardDeviation(metric.values);
      }
    });
    
    return aggregated;
  }

  calculateErrorMetrics(metrics, testResults) {
    const errors = [];
    
    if (Array.isArray(testResults)) {
      testResults.forEach(result => {
        if (!result.passed && result.error) {
          errors.push({
            testName: result.name,
            error: result.error,
            level: this.classifyErrorLevel(result.error)
          });
        }
      });
    }
    
    metrics.errorMetrics.criticalErrors = errors.filter(e => e.level === 'critical').length;
    metrics.errorMetrics.warningErrors = errors.filter(e => e.level === 'warning').length;
    metrics.errorMetrics.totalErrors = errors.length;
    
    if (metrics.testMetrics.totalTests > 0) {
      metrics.errorMetrics.errorRate = 
        (metrics.errorMetrics.totalErrors / metrics.testMetrics.totalTests) * 100;
    }
    
    metrics.details.errors = errors;
  }

  classifyErrorLevel(error) {
    const errorString = error.toString().toLowerCase();
    
    const criticalPatterns = [
      '未定义',
      '语法错误',
      '引用错误',
      '类型错误',
      '无法读取属性',
      '无法调用方法',
      'timeout',
      '内存泄漏'
    ];
    
    const warningPatterns = [
      '警告',
      'deprecated',
      '性能问题',
      '兼容性问题'
    ];
    
    if (criticalPatterns.some(pattern => errorString.includes(pattern))) {
      return 'critical';
    } else if (warningPatterns.some(pattern => errorString.includes(pattern))) {
      return 'warning';
    }
    
    return 'info';
  }

  calculateStabilityScore(metrics) {
    let score = 100; // 起始分数
    
    // 测试通过率权重: 40%
    const passRateWeight = 0.4;
    const passRateScore = Math.min(metrics.testMetrics.passRate, 100);
    score *= (passRateScore / 100) * passRateWeight;
    
    // 性能指标权重: 30%
    const performanceWeight = 0.3;
    const performanceScore = this.calculatePerformanceScore(metrics.performanceMetrics);
    score *= (performanceScore / 100) * performanceWeight;
    
    // 错误率权重: 30%
    const errorWeight = 0.3;
    const errorScore = this.calculateErrorScore(metrics.errorMetrics);
    score *= (errorScore / 100) * errorWeight;
    
    metrics.stabilityScore = Math.round(score * 100) / 100;
  }

  calculatePerformanceScore(performanceMetrics) {
    if (!performanceMetrics || Object.keys(performanceMetrics).length === 0) {
      return 100; // 无性能数据时给满分
    }
    
    let score = 100;
    
    // 页面加载时间评分
    if (performanceMetrics.pageLoadTime?.average) {
      const loadTime = performanceMetrics.pageLoadTime.average;
      const target = this.config.performance.pageLoadTime.target;
      const critical = this.config.performance.pageLoadTime.criticalThreshold;
      
      if (loadTime > critical) {
        score -= 30;
      } else if (loadTime > target) {
        score -= (loadTime - target) / target * 20;
      }
    }
    
    // API响应时间评分
    if (performanceMetrics.apiResponseTime?.average) {
      const responseTime = performanceMetrics.apiResponseTime.average;
      const target = this.config.performance.apiResponseTime.target;
      const critical = this.config.performance.apiResponseTime.criticalThreshold;
      
      if (responseTime > critical) {
        score -= 30;
      } else if (responseTime > target) {
        score -= (responseTime - target) / target * 20;
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  calculateErrorScore(errorMetrics) {
    let score = 100;
    
    // 关键错误扣分
    const criticalErrors = errorMetrics.criticalErrors;
    const criticalTarget = this.config.errorRates.criticalErrors.target;
    const criticalThreshold = this.config.errorRates.criticalErrors.criticalThreshold;
    
    if (criticalErrors > criticalThreshold) {
      score -= 50;
    } else if (criticalErrors > criticalTarget) {
      score -= criticalErrors * 10;
    }
    
    // 警告错误扣分
    const warningErrors = errorMetrics.warningErrors;
    const warningTarget = this.config.errorRates.warningErrors.target;
    const warningThreshold = this.config.errorRates.warningErrors.criticalThreshold;
    
    if (warningErrors > warningThreshold) {
      score -= 30;
    } else if (warningErrors > warningTarget) {
      score -= warningErrors * 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  checkCompliance(metrics) {
    // 检查测试通过率合规性
    const passRate = metrics.testMetrics.passRate;
    if (passRate >= this.config.testPassRate.target) {
      metrics.compliance.testPassRate = 'pass';
    } else if (passRate >= this.config.testPassRate.warningThreshold) {
      metrics.compliance.testPassRate = 'warning';
    } else {
      metrics.compliance.testPassRate = 'fail';
    }
    
    // 检查性能合规性
    metrics.compliance.performance = this.checkPerformanceCompliance(metrics.performanceMetrics);
    
    // 检查错误率合规性
    metrics.compliance.errorRates = this.checkErrorRateCompliance(metrics.errorMetrics);
    
    // 确定整体合规性
    const complianceValues = Object.values(metrics.compliance).filter(v => v !== 'overall');
    if (complianceValues.includes('fail')) {
      metrics.compliance.overall = 'fail';
    } else if (complianceValues.includes('warning')) {
      metrics.compliance.overall = 'warning';
    } else {
      metrics.compliance.overall = 'pass';
    }
  }

  checkPerformanceCompliance(performanceMetrics) {
    if (!performanceMetrics || Object.keys(performanceMetrics).length === 0) {
      return 'pass'; // 无性能数据时视为通过
    }
    
    let hasWarning = false;
    let hasFail = false;
    
    // 检查页面加载时间
    if (performanceMetrics.pageLoadTime?.average) {
      const loadTime = performanceMetrics.pageLoadTime.average;
      if (loadTime > this.config.performance.pageLoadTime.criticalThreshold) {
        hasFail = true;
      } else if (loadTime > this.config.performance.pageLoadTime.warningThreshold) {
        hasWarning = true;
      }
    }
    
    // 检查API响应时间
    if (performanceMetrics.apiResponseTime?.average) {
      const responseTime = performanceMetrics.apiResponseTime.average;
      if (responseTime > this.config.performance.apiResponseTime.criticalThreshold) {
        hasFail = true;
      } else if (responseTime > this.config.performance.apiResponseTime.warningThreshold) {
        hasWarning = true;
      }
    }
    
    if (hasFail) return 'fail';
    if (hasWarning) return 'warning';
    return 'pass';
  }

  checkErrorRateCompliance(errorMetrics) {
    if (errorMetrics.criticalErrors > this.config.errorRates.criticalErrors.criticalThreshold) {
      return 'fail';
    } else if (errorMetrics.criticalErrors > this.config.errorRates.criticalErrors.warningThreshold) {
      return 'warning';
    }
    
    if (errorMetrics.warningErrors > this.config.errorRates.warningErrors.criticalThreshold) {
      return 'fail';
    } else if (errorMetrics.warningErrors > this.config.errorRates.warningErrors.warningThreshold) {
      return 'warning';
    }
    
    return 'pass';
  }

  async analyzeTrends(metrics) {
    if (this.metricsHistory.length < 2) {
      metrics.trends = { message: '数据不足，无法进行趋势分析' };
      return;
    }
    
    const recentMetrics = this.metricsHistory.slice(0, 10); // 最近10次指标
    
    metrics.trends = {
      stabilityScore: this.calculateTrend(recentMetrics, 'stabilityScore'),
      testPassRate: this.calculateTrend(recentMetrics, 'testMetrics.passRate'),
      performance: this.calculatePerformanceTrend(recentMetrics),
      errorRates: this.calculateErrorTrend(recentMetrics)
    };
  }

  calculateTrend(metricsArray, metricPath) {
    const values = metricsArray.map(m => {
      const pathParts = metricPath.split('.');
      let value = m;
      for (const part of pathParts) {
        value = value[part];
      }
      return value;
    }).filter(v => v !== undefined);
    
    if (values.length < 2) return 'stable';
    
    const firstValue = values[values.length - 1];
    const lastValue = values[0];
    
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'improving' : 'declining';
  }

  calculatePerformanceTrend(metricsArray) {
    // 简化的性能趋势分析
    return 'stable'; // 实际实现需要更复杂的分析
  }

  calculateErrorTrend(metricsArray) {
    // 简化的错误趋势分析
    return 'stable'; // 实际实现需要更复杂的分析
  }

  calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  generateId() {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addToMetricsHistory(metrics) {
    this.metricsHistory.unshift(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(0, this.maxHistorySize);
    }
  }

  async saveMetricsHistory() {
    try {
      const historyFile = path.join(__dirname, 'data', 'metrics-history.json');
      await fs.ensureDir(path.dirname(historyFile));
      
      const historyData = {
        lastUpdated: new Date().toISOString(),
        metrics: this.metricsHistory
      };
      
      await fs.writeJson(historyFile, historyData, { spaces: 2 });
      
    } catch (error) {
      console.error('❌ 指标历史保存失败:', error.message);
    }
  }

  async loadMetricsHistory() {
    try {
      const historyFile = path.join(__dirname, 'data', 'metrics-history.json');
      
      if (await fs.pathExists(historyFile)) {
        const historyData = await fs.readJson(historyFile);
        this.metricsHistory = historyData.metrics || [];
        console.log(`📊 加载了 ${this.metricsHistory.length} 条指标历史记录`);
      }
      
    } catch (error) {
      console.warn('⚠️ 指标历史加载失败，将使用空历史记录');
      this.metricsHistory = [];
    }
  }

  getMetricsSummary() {
    if (this.metricsHistory.length === 0) {
      return { message: '暂无指标数据' };
    }
    
    const recentMetrics = this.metricsHistory[0];
    
    return {
      timestamp: recentMetrics.timestamp,
      stabilityScore: recentMetrics.stabilityScore,
      testPassRate: recentMetrics.testMetrics.passRate,
      overallCompliance: recentMetrics.compliance.overall,
      trends: recentMetrics.trends
    };
  }

  generateReport() {
    if (this.metricsHistory.length === 0) {
      return { message: '暂无数据可生成报告' };
    }
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: this.getMetricsSummary(),
      detailedAnalysis: this.metricsHistory.slice(0, 10), // 最近10次详细数据
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metricsHistory.length === 0) {
      return recommendations;
    }
    
    const recentMetrics = this.metricsHistory[0];
    
    // 测试通过率建议
    if (recentMetrics.testMetrics.passRate < this.config.testPassRate.target) {
      recommendations.push({
        type: 'test_quality',
        priority: recentMetrics.testMetrics.passRate < 95 ? 'high' : 'medium',
        message: `测试通过率 ${recentMetrics.testMetrics.passRate}% 低于目标值 ${this.config.testPassRate.target}%，建议优化测试用例和修复缺陷`
      });
    }
    
    // 性能建议
    if (recentMetrics.compliance.performance === 'warning' || 
        recentMetrics.compliance.performance === 'fail') {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: '检测到性能问题，建议进行性能优化和监控'
      });
    }
    
    // 错误率建议
    if (recentMetrics.errorMetrics.totalErrors > 0) {
      recommendations.push({
        type: 'error_handling',
        priority: recentMetrics.errorMetrics.criticalErrors > 0 ? 'high' : 'medium',
        message: `发现 ${recentMetrics.errorMetrics.totalErrors} 个错误，建议加强错误处理和测试覆盖`
      });
    }
    
    return recommendations;
  }
}

export default StabilityMetrics;