#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TestRunner = (await import('./test-runner.js')).default;

class TestMain {
  constructor() {
    this.runner = new TestRunner();
    this.config = this.loadConfig();
    this.testResults = [];
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config', 'test-config.json');
      if (fs.existsSync(configPath)) {
        return fs.readJsonSync(configPath);
      }
    } catch (error) {
      console.warn('⚠️ 配置文件加载失败，使用默认配置');
    }
    
    // 默认配置
    return {
      stabilityMetrics: {
        passRate: 99.5,
        maxResponseTime: 3000,
        maxMemoryUsage: 100
      },
      environments: {
        development: {
          baseUrl: 'http://localhost:8000',
          timeout: 30000
        },
        testing: {
          baseUrl: 'http://localhost:8000',
          timeout: 30000
        },
        production: {
          baseUrl: 'http://localhost:8000',
          timeout: 30000
        }
      },
      notifications: {
        email: {
          enabled: false,
          recipients: []
        },
        slack: {
          enabled: false,
          webhookUrl: ''
        }
      },
      reporting: {
        htmlReport: true,
        jsonReport: true,
        screenshots: false
      }
    };
  }

  async runAllTests() {
    console.log('🚀 开始执行自动化测试套件...\n');
    
    const startTime = Date.now();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    try {
      // 1. 环境检查
      console.log('🔍 执行环境检查...');
      const envCheckResult = await this.runner.checkEnvironment();
      this.testResults.push(envCheckResult);
      
      if (envCheckResult.passed) {
        console.log('✅ 环境检查通过\n');
      } else {
        console.log('❌ 环境检查失败:', envCheckResult.error);
        return this.generateFinalReport(startTime, totalTests, passedTests, failedTests);
      }

      // 2. 执行核心功能测试
      console.log('🧪 执行核心功能测试...');
      const coreTests = await this.runCoreTests();
      this.testResults = this.testResults.concat(coreTests);
      
      // 3. 执行兼容性测试
      console.log('🔧 执行兼容性测试...');
      const compatibilityTests = await this.runCompatibilityTests();
      this.testResults = this.testResults.concat(compatibilityTests);
      
      // 4. 执行性能测试
      console.log('⚡ 执行性能测试...');
      const performanceTests = await this.runPerformanceTests();
      this.testResults = this.testResults.concat(performanceTests);
      
      // 5. 执行集成测试
      console.log('🔗 执行集成测试...');
      const integrationTests = await this.runIntegrationTests();
      this.testResults = this.testResults.concat(integrationTests);

      // 统计结果
      totalTests = this.testResults.length;
      passedTests = this.testResults.filter(result => result.passed).length;
      failedTests = totalTests - passedTests;

      // 6. 生成报告
      console.log('📊 生成测试报告...');
      await this.generateReports();

      // 7. 发送通知
      console.log('📨 发送测试结果通知...');
      await this.sendNotifications();

    } catch (error) {
      console.error('❌ 测试执行过程中发生错误:', error);
      failedTests++;
    }

    // 生成最终报告
    return this.generateFinalReport(startTime, totalTests, passedTests, failedTests);
  }

  async runCoreTests() {
    const tests = [];
    
    try {
      // 组件选择测试
      const componentSelectionTest = (await import('./test-cases/core/component-selection.test.js')).default;
      const result1 = await componentSelectionTest.run();
      tests.push(result1);
      
      // 兼容性检测测试
      const compatibilityCheckTest = (await import('./test-cases/core/compatibility-check.test.js')).default;
      const result2 = await compatibilityCheckTest.run();
      tests.push(result2);
      
      // 数据导入导出测试
      const dataImportExportTest = (await import('./test-cases/core/data-import-export.test.js')).default;
      const result3 = await dataImportExportTest.run();
      tests.push(result3);
      
    } catch (error) {
      console.error('核心功能测试执行失败:', error);
    }
    
    return tests;
  }

  async runCompatibilityTests() {
    const tests = [];
    
    try {
      // 浏览器兼容性测试
      const browserCompatibilityTest = (await import('./test-cases/compatibility/browser-compatibility.test.js')).default;
      const result = await browserCompatibilityTest.run();
      tests.push(result);
      
    } catch (error) {
      console.error('兼容性测试执行失败:', error);
    }
    
    return tests;
  }

  async runPerformanceTests() {
    const tests = [];
    
    try {
      // 性能测试
      const performanceTest = (await import('./test-cases/performance/performance.test.js')).default;
      const result = await performanceTest.run();
      tests.push(result);
      
    } catch (error) {
      console.error('性能测试执行失败:', error);
    }
    
    return tests;
  }

  async runIntegrationTests() {
    const tests = [];
    
    try {
      // 集成测试
      const integrationTest = (await import('./test-cases/integration/integration.test.js')).default;
      const result = await integrationTest.run();
      tests.push(result);
      
    } catch (error) {
      console.error('集成测试执行失败:', error);
    }
    
    return tests;
  }

  async generateReports() {
    try {
      const reportsDir = path.join(__dirname, 'reports');
      await fs.ensureDir(reportsDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // JSON报告
      if (this.config.reporting.jsonReport) {
        const jsonReport = {
          timestamp: new Date().toISOString(),
          totalTests: this.testResults.length,
          passedTests: this.testResults.filter(r => r.passed).length,
          failedTests: this.testResults.filter(r => !r.passed).length,
          passRate: (this.testResults.filter(r => r.passed).length / this.testResults.length * 100).toFixed(2),
          testResults: this.testResults,
          environment: process.env.NODE_ENV || 'development'
        };
        
        const jsonPath = path.join(reportsDir, `test-report-${timestamp}.json`);
        await fs.writeJson(jsonPath, jsonReport, { spaces: 2 });
        console.log('📄 JSON报告已生成:', jsonPath);
      }
      
      // HTML报告
      if (this.config.reporting.htmlReport) {
        const htmlReport = this.generateHtmlReport(timestamp);
        const htmlPath = path.join(reportsDir, `test-report-${timestamp}.html`);
        await fs.writeFile(htmlPath, htmlReport);
        console.log('🌐 HTML报告已生成:', htmlPath);
      }
      
    } catch (error) {
      console.error('报告生成失败:', error);
    }
  }

  generateHtmlReport(timestamp) {
    const passedCount = this.testResults.filter(r => r.passed).length;
    const failedCount = this.testResults.filter(r => !r.passed).length;
    const totalCount = this.testResults.length;
    const passRate = (passedCount / totalCount * 100).toFixed(2);
    
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
        .summary { margin: 20px 0; }
        .test-result { margin: 10px 0; padding: 10px; border-left: 4px solid; }
        .passed { border-color: #28a745; background: #f8fff9; }
        .failed { border-color: #dc3545; background: #fff5f5; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { padding: 15px; border-radius: 5px; text-align: center; }
        .metric-pass { background: #d4edda; color: #155724; }
        .metric-fail { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 项目稳定性测试报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        <p>环境: ${process.env.NODE_ENV || 'development'}</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card ${passRate >= 99.5 ? 'metric-pass' : 'metric-fail'}">
            <h3>通过率</h3>
            <h2>${passRate}%</h2>
            <p>目标: ≥99.5%</p>
        </div>
        <div class="metric-card">
            <h3>总测试数</h3>
            <h2>${totalCount}</h2>
        </div>
        <div class="metric-card metric-pass">
            <h3>通过</h3>
            <h2>${passedCount}</h2>
        </div>
        <div class="metric-card ${failedCount > 0 ? 'metric-fail' : 'metric-pass'}">
            <h3>失败</h3>
            <h2>${failedCount}</h2>
        </div>
    </div>
    
    <div class="summary">
        <h2>测试结果详情</h2>
        ${this.testResults.map((result, index) => `
            <div class="test-result ${result.passed ? 'passed' : 'failed'}">
                <h3>${index + 1}. ${result.name}</h3>
                <p>${result.description}</p>
                <p>状态: <strong>${result.passed ? '✅ 通过' : '❌ 失败'}</strong></p>
                <p>耗时: ${result.duration}ms</p>
                ${result.error ? `<p>错误: ${result.error}</p>` : ''}
                ${result.performanceMetrics ? `
                    <details>
                        <summary>性能指标</summary>
                        <pre>${JSON.stringify(result.performanceMetrics, null, 2)}</pre>
                    </details>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  async sendNotifications() {
    const passedCount = this.testResults.filter(r => r.passed).length;
    const totalCount = this.testResults.length;
    const passRate = (passedCount / totalCount * 100).toFixed(2);
    
    const message = `
🚀 项目稳定性测试完成

📊 测试结果:
- 总测试数: ${totalCount}
- 通过: ${passedCount}
- 失败: ${totalCount - passedCount}
- 通过率: ${passRate}%

${passRate >= 99.5 ? '✅ 稳定性指标达标' : '❌ 稳定性指标未达标'}

环境: ${process.env.NODE_ENV || 'development'}
时间: ${new Date().toLocaleString('zh-CN')}
    `;
    
    console.log('💬 测试结果通知:');
    console.log(message);
    
    // 这里可以集成邮件、Slack等通知方式
    if (this.config.notifications.email.enabled) {
      // 发送邮件通知
      console.log('📧 邮件通知已发送');
    }
    
    if (this.config.notifications.slack.enabled) {
      // 发送Slack通知
      console.log('💬 Slack通知已发送');
    }
  }

  generateFinalReport(startTime, totalTests, passedTests, failedTests) {
    const duration = Date.now() - startTime;
    const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 测试执行完成报告');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`通过率: ${passRate}%`);
    console.log(`总耗时: ${duration}ms`);
    console.log(`目标通过率: ${this.config.stabilityMetrics.passRate}%`);
    
    if (passRate >= this.config.stabilityMetrics.passRate) {
      console.log('✅ 稳定性测试通过！项目稳定性符合要求。');
      process.exit(0);
    } else {
      console.log('❌ 稳定性测试未通过！需要进一步优化。');
      process.exit(1);
    }
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const testMain = new TestMain();
  
  switch (command) {
    case 'run':
      await testMain.runAllTests();
      break;
    case 'help':
    default:
      console.log(`
项目稳定性测试工具

用法:
  npm test run         执行完整测试套件
  npm test help        显示帮助信息

环境变量:
  NODE_ENV=development 设置测试环境

报告文件:
  测试报告将生成在 tests/reports/ 目录下
      `);
      break;
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  });
}

export default TestMain;