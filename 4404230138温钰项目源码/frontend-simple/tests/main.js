#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入所有模块
import TestRunner from './test-runner.js';
import AlertSystem from './alert-system.js';
import EnvironmentValidator from './environment-validator.js';
import TestScheduler from './scheduler.js';
import StabilityMetrics from './stability-metrics.js';
import TestManager from './test-manager.js';

class StabilityCheckSystem {
  constructor() {
    this.config = {};
    this.modules = {};
    this.isInitialized = false;
  }

  async initialize(configPath = null) {
    console.log('🚀 初始化项目稳定性查验系统...\n');

    try {
      // 加载配置
      await this.loadConfiguration(configPath);
      
      // 初始化数据目录
      await this.initializeDataDirectories();
      
      // 初始化所有模块
      await this.initializeModules();
      
      this.isInitialized = true;
      
      console.log('✅ 项目稳定性查验系统初始化完成！');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ 系统初始化失败:', error.message);
      
      // 记录详细的错误信息
      await this.logError('initialize', error, { configPath });
      
      // 根据错误类型提供更具体的错误信息
      if (error.code === 'ENOENT') {
        throw new Error(`文件或目录不存在: ${error.path}`);
      } else if (error.code === 'EACCES') {
        throw new Error(`权限不足: ${error.path}`);
      } else if (error.message.includes('不安全')) {
        throw new Error(`安全验证失败: ${error.message}`);
      }
      
      throw error;
    }
  }

  async loadConfiguration(configPath) {
    const defaultConfigPath = path.join(__dirname, 'config', 'test-config.json');
    const configFile = configPath || defaultConfigPath;
    
    // 安全验证：确保配置文件路径在项目目录内
    const safeConfigPath = path.resolve(configFile);
    if (!safeConfigPath.startsWith(__dirname)) {
      throw new Error(`配置文件路径不安全: ${configFile}`);
    }
    
    // 验证文件扩展名
    if (!safeConfigPath.endsWith('.json')) {
      throw new Error(`配置文件必须是JSON格式: ${configFile}`);
    }
    
    if (await fs.pathExists(safeConfigPath)) {
      this.config = await fs.readJson(safeConfigPath);
      console.log(`📋 加载配置文件: ${safeConfigPath}`);
    } else {
      console.warn('⚠️ 配置文件不存在，使用默认配置');
      this.config = this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      stability: {
        testPassRate: 99.5,
        maxResponseTime: 3000,
        errorThreshold: 1
      },
      environments: {
        development: { baseUrl: 'http://localhost:8000', timeout: 30000 },
        testing: { baseUrl: 'http://localhost:8000', timeout: 30000 },
        production: { baseUrl: 'http://localhost:8000', timeout: 30000 }
      },
      notifications: {
        email: { enabled: false },
        slack: { enabled: false }
      },
      reports: {
        generateHtml: true,
        generateJson: true,
        saveScreenshots: false
      }
    };
  }

  async initializeDataDirectories() {
    const directories = [
      'data',
      'logs', 
      'reports',
      'screenshots'
    ];

    for (const dir of directories) {
      const dirPath = path.join(__dirname, dir);
      await fs.ensureDir(dirPath);
      console.log(`   创建目录: ${dir}`);
    }
  }

  async initializeModules() {
    console.log('\n🔧 初始化系统模块...');

    // 初始化警报系统
    this.modules.alertSystem = new AlertSystem(this.config.notifications);
    console.log('   ✅ 警报系统初始化完成');

    // 初始化环境验证器
    this.modules.environmentValidator = new EnvironmentValidator();
    console.log('   ✅ 环境验证器初始化完成');

    // 初始化稳定性指标
    this.modules.stabilityMetrics = new StabilityMetrics(this.config.stability);
    await this.modules.stabilityMetrics.loadMetricsHistory();
    console.log('   ✅ 稳定性指标初始化完成');

    // 初始化测试管理器
    this.modules.testManager = new TestManager();
    await this.modules.testManager.initialize();
    console.log('   ✅ 测试管理器初始化完成');

    // 初始化测试运行器
    this.modules.testRunner = new TestRunner();
    console.log('   ✅ 测试运行器初始化完成');

    // 初始化调度器
    this.modules.scheduler = new TestScheduler({
      alert: this.config.notifications
    });
    await this.modules.scheduler.initialize();
    console.log('   ✅ 调度器初始化完成');
  }

  // 主要功能方法
  async runFullTestSuite(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('\n🎯 开始执行完整测试套件...');
    console.log('='.repeat(60));

    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    const executionInfo = {
      id: executionId,
      startTime: new Date().toISOString(),
      type: 'full_suite',
      environment: options.environment || 'testing'
    };

    try {
      // 1. 环境验证
      console.log('\n🔍 步骤 1/5: 环境验证');
      const envResults = await this.modules.environmentValidator.validateAllEnvironments();
      
      // 2. 执行核心功能测试
      console.log('\n🧪 步骤 2/5: 核心功能测试');
      const coreResults = await this.modules.testRunner.runCoreFunctionalityTests();
      
      // 3. 执行兼容性测试
      console.log('\n🔧 步骤 3/5: 兼容性测试');
      const compatibilityResults = await this.modules.testRunner.runCompatibilityTests();
      
      // 4. 执行性能测试
      console.log('\n⚡ 步骤 4/5: 性能测试');
      const performanceResults = await this.modules.testRunner.runPerformanceTests();
      
      // 5. 执行集成测试
      console.log('\n🔄 步骤 5/5: 集成测试');
      const integrationResults = await this.modules.testRunner.runIntegrationTests();

      const endTime = Date.now();
      executionInfo.endTime = new Date().toISOString();
      executionInfo.duration = endTime - startTime;

      // 合并测试结果
      const allResults = [
        ...coreResults,
        ...compatibilityResults,
        ...performanceResults,
        ...integrationResults
      ];

      // 计算稳定性指标
      console.log('\n📊 计算稳定性指标...');
      const metrics = await this.modules.stabilityMetrics.calculateMetrics(allResults, executionInfo);

      // 发送警报（如果需要）
      if (metrics.compliance.overall !== 'pass') {
        await this.modules.alertSystem.sendBatchAlerts(allResults);
      }

      // 生成报告
      console.log('\n📋 生成测试报告...');
      await this.generateComprehensiveReport(executionInfo, metrics, allResults);

      console.log('\n✅ 完整测试套件执行完成！');
      console.log(`   执行ID: ${executionId}`);
      console.log(`   总耗时: ${executionInfo.duration}ms`);
      console.log(`   稳定性评分: ${metrics.stabilityScore}`);
      console.log(`   测试通过率: ${metrics.testMetrics.passRate}%`);
      console.log(`   整体合规性: ${metrics.compliance.overall}`);

      return {
        executionInfo,
        metrics,
        results: allResults
      };

    } catch (error) {
      console.error('❌ 测试套件执行失败:', error.message);
      
      // 发送错误警报
      await this.modules.alertSystem.sendAlert({
        level: 'critical',
        title: '完整测试套件执行失败',
        message: error.message,
        testName: 'full_suite',
        testResult: { error: error.message }
      });

      throw error;
    }
  }

  async runQuickTest(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('\n⚡ 开始执行快速测试...');

    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    const executionInfo = {
      id: executionId,
      startTime: new Date().toISOString(),
      type: 'quick_test',
      environment: options.environment || 'testing'
    };

    try {
      // 只执行核心功能测试
      const coreResults = await this.modules.testRunner.runCoreFunctionalityTests();
      
      const endTime = Date.now();
      executionInfo.endTime = new Date().toISOString();
      executionInfo.duration = endTime - startTime;

      // 计算指标
      const metrics = await this.modules.stabilityMetrics.calculateMetrics(coreResults, executionInfo);

      console.log('✅ 快速测试执行完成！');
      console.log(`   执行ID: ${executionId}`);
      console.log(`   耗时: ${executionInfo.duration}ms`);
      console.log(`   通过率: ${metrics.testMetrics.passRate}%`);

      return {
        executionInfo,
        metrics,
        results: coreResults
      };

    } catch (error) {
      console.error('❌ 快速测试执行失败:', error.message);
      throw error;
    }
  }

  async validateEnvironment(environment = 'testing') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`\n🔍 验证 ${environment} 环境...`);
    
    const results = await this.modules.environmentValidator.validateEnvironment(environment);
    
    console.log(`✅ 环境验证完成: ${results.overallStatus}`);
    
    return results;
  }

  async startScheduler() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('\n⏰ 启动测试调度器...');
    
    // 调度器已经在初始化时启动了默认任务
    // 这里可以添加额外的调度任务或状态检查
    
    const scheduledJobs = this.modules.scheduler.getScheduledJobs();
    console.log(`   已调度任务数: ${scheduledJobs.length}`);
    
    scheduledJobs.forEach(job => {
      console.log(`   - ${job.name}: ${job.schedule}`);
    });

    console.log('✅ 测试调度器已启动');
    
    return scheduledJobs;
  }

  async stopScheduler() {
    if (this.modules.scheduler) {
      this.modules.scheduler.stopAllSchedules();
      console.log('✅ 测试调度器已停止');
    }
  }

  async generateReport() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('\n📊 生成稳定性报告...');
    
    const metricsReport = this.modules.stabilityMetrics.generateReport();
    const maintenanceReport = this.modules.testManager.generateMaintenanceReport();
    
    const comprehensiveReport = {
      generatedAt: new Date().toISOString(),
      metrics: metricsReport,
      maintenance: maintenanceReport,
      recommendations: this.generateOverallRecommendations(metricsReport, maintenanceReport)
    };

    // 保存报告
    const reportFile = path.join(__dirname, 'reports', `comprehensive-report-${Date.now()}.json`);
    await fs.writeJson(reportFile, comprehensiveReport, { spaces: 2 });
    
    console.log(`✅ 报告已生成: ${reportFile}`);
    
    return comprehensiveReport;
  }

  generateOverallRecommendations(metricsReport, maintenanceReport) {
    const recommendations = [];

    // 基于指标的建议
    if (metricsReport.summary.stabilityScore < 90) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        message: '系统稳定性评分较低，建议优先处理关键问题'
      });
    }

    if (metricsReport.summary.testPassRate < 95) {
      recommendations.push({
        type: 'test_quality',
        priority: 'medium',
        message: '测试通过率低于95%，建议优化测试用例'
      });
    }

    // 基于维护报告的建议
    if (maintenanceReport.maintenanceRecommendations.length > 0) {
      recommendations.push(...maintenanceReport.maintenanceRecommendations);
    }

    return recommendations;
  }

  async generateComprehensiveReport(executionInfo, metrics, results) {
    const report = {
      executionInfo,
      metrics,
      results,
      environmentInfo: await this.modules.environmentValidator.getValidationResults(),
      maintenanceInfo: this.modules.testManager.generateMaintenanceReport(),
      generatedAt: new Date().toISOString()
    };

    // 保存JSON报告
    const jsonReportFile = path.join(__dirname, 'reports', `test-report-${executionInfo.id}.json`);
    await fs.writeJson(jsonReportFile, report, { spaces: 2 });

    // 生成HTML报告（简化版）
    const htmlReport = this.generateHtmlReport(report);
    const htmlReportFile = path.join(__dirname, 'reports', `test-report-${executionInfo.id}.html`);
    await fs.writeFile(htmlReportFile, htmlReport);

    console.log(`   报告文件:`);
    console.log(`     JSON: ${jsonReportFile}`);
    console.log(`     HTML: ${htmlReportFile}`);

    return report;
  }

  generateHtmlReport(report) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目稳定性测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #007acc; }
        .pass { border-color: #28a745; }
        .warning { border-color: #ffc107; }
        .fail { border-color: #dc3545; }
        .recommendation { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 项目稳定性测试报告</h1>
        <p>生成时间: ${new Date(report.generatedAt).toLocaleString('zh-CN')}</p>
        <p>执行ID: ${report.executionInfo.id}</p>
    </div>
    
    <div class="metric ${report.metrics.compliance.overall}">
        <h2>稳定性评分: ${report.metrics.stabilityScore}</h2>
        <p>测试通过率: ${report.metrics.testMetrics.passRate}%</p>
        <p>整体合规性: ${report.metrics.compliance.overall}</p>
    </div>
    
    <h2>建议</h2>
    ${report.metrics.recommendations.map(rec => 
        `<div class="recommendation">
            <strong>${rec.type}</strong>: ${rec.message}
        </div>`
    ).join('')}
</body>
</html>`;
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // 错误日志记录
  async logError(operation, error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      operation,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    try {
      const logDir = path.join(__dirname, 'logs');
      await fs.ensureDir(logDir);
      
      const logFile = path.join(logDir, `error-log-${Date.now()}.json`);
      await fs.writeJson(logFile, errorLog, { spaces: 2 });
      
      console.log(`📝 错误日志已记录: ${logFile}`);
    } catch (logError) {
      console.error('❌ 记录错误日志失败:', logError.message);
    }
  }

  // 命令行界面方法
  async showStatus() {
    if (!this.isInitialized) {
      console.log('系统未初始化');
      return;
    }

    const metricsSummary = this.modules.stabilityMetrics.getMetricsSummary();
    const scheduledJobs = this.modules.scheduler.getScheduledJobs();
    const testCoverage = this.modules.testManager.analyzeTestCoverage();

    console.log('\n📈 系统状态概览');
    console.log('='.repeat(40));
    console.log(`稳定性评分: ${metricsSummary.stabilityScore || 'N/A'}`);
    console.log(`测试通过率: ${metricsSummary.testPassRate || 'N/A'}%`);
    console.log(`已调度任务: ${scheduledJobs.length}`);
    console.log(`测试用例数: ${testCoverage.totalTestCases}`);
    console.log(`预估总时长: ${Math.round(testCoverage.estimatedTotalDuration / 1000)}秒`);
  }
}

// 命令行接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const system = new StabilityCheckSystem();
  
  const command = process.argv[2];
  
  async function main() {
    try {
      switch (command) {
        case 'init':
          await system.initialize();
          break;
          
        case 'full-test':
          await system.initialize();
          await system.runFullTestSuite();
          break;
          
        case 'quick-test':
          await system.initialize();
          await system.runQuickTest();
          break;
          
        case 'validate-env':
          await system.initialize();
          await system.validateEnvironment(process.argv[3] || 'testing');
          break;
          
        case 'start-scheduler':
          await system.initialize();
          await system.startScheduler();
          break;
          
        case 'stop-scheduler':
          await system.stopScheduler();
          break;
          
        case 'generate-report':
          await system.initialize();
          await system.generateReport();
          break;
          
        case 'status':
          await system.initialize();
          await system.showStatus();
          break;
          
        default:
          console.log(`
🚀 项目稳定性查验系统

使用方法:
  node main.js init                   初始化系统
  node main.js full-test             执行完整测试套件
  node main.js quick-test           执行快速测试
  node main.js validate-env [env]   验证指定环境
  node main.js start-scheduler      启动测试调度器
  node main.js stop-scheduler       停止测试调度器
  node main.js generate-report      生成综合报告
  node main.js status               显示系统状态

示例:
  node main.js init
  node main.js full-test
  node main.js validate-env production
          `);
      }
    } catch (error) {
      console.error('❌ 命令执行失败:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

export default StabilityCheckSystem;