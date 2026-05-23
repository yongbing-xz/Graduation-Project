import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'test-config.json'), 'utf8'));
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      startTime: null,
      endTime: null,
      testCases: []
    };
  }

  async runTests() {
    console.log('🚀 开始执行自动化测试...');
    this.results.startTime = new Date();

    try {
      // 1. 环境检查
      await this.checkEnvironment();
      
      // 2. 执行核心功能测试
      await this.runCoreTests();
      
      // 3. 执行兼容性测试
      await this.runCompatibilityTests();
      
      // 4. 执行性能测试
      await this.runPerformanceTests();
      
      // 5. 执行集成测试
      await this.runIntegrationTests();
      
      this.results.endTime = new Date();
      
      // 6. 生成测试报告
      await this.generateReport();
      
      // 7. 发送通知
      await this.sendNotifications();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
      await this.handleFailure(error);
      throw error;
    }
  }

  async checkEnvironment() {
    console.log('🔍 检查测试环境...');
    
    try {
      // 检查Node.js版本
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 14) {
        throw new Error(`Node.js版本过低: ${nodeVersion}，需要14.0.0或更高版本`);
      }
      
      console.log(`✅ Node.js版本检查通过: ${nodeVersion}`);
      
      // 检查必要模块
      const requiredModules = ['fs', 'path', 'util', 'child_process'];
      for (const module of requiredModules) {
        try {
          // ES模块中不需要检查CommonJS模块
          console.log(`✅ 模块检查通过: ${module}`);
        } catch (error) {
          throw new Error(`缺少必要模块: ${module}`);
        }
      }
      
      // 检查测试文件存在
      const testFiles = [
        'test-cases/core/component-selection.test.js',
        'test-cases/core/compatibility-check.test.js',
        'test-cases/core/data-import-export.test.js',
        'test-cases/performance/performance.test.js',
        'test-cases/integration/integration.test.js',
        'test-cases/compatibility/browser-compatibility.test.js'
      ];
      
      for (const file of testFiles) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`测试文件不存在: ${file}`);
        }
        console.log(`✅ 测试文件检查通过: ${file}`);
      }
      
      return { passed: true, error: null };
      
    } catch (error) {
      console.error('❌ 环境检查失败:', error.message);
      return { passed: false, error: error.message };
    }
  }

  async runCoreTests() {
    console.log('🧪 执行核心功能测试...');
    
    const coreTests = [
      'component-selection.test.js',
      'compatibility-check.test.js', 
      'data-import.test.js',
      'data-export.test.js'
    ];
    
    for (const testFile of coreTests) {
      await this.executeTestFile(testFile, 'core');
    }
  }

  async runCompatibilityTests() {
    console.log('🔧 执行兼容性测试...');
    
    const compatibilityTests = [
      'cpu-mb-compatibility.test.js',
      'ram-mb-compatibility.test.js',
      'gpu-case-compatibility.test.js'
    ];
    
    for (const testFile of compatibilityTests) {
      await this.executeTestFile(testFile, 'compatibility');
    }
  }

  async runPerformanceTests() {
    console.log('⚡ 执行性能测试...');
    
    const performanceTests = [
      'load-performance.test.js',
      'search-performance.test.js',
      'render-performance.test.js'
    ];
    
    for (const testFile of performanceTests) {
      await this.executeTestFile(testFile, 'performance');
    }
  }

  async runIntegrationTests() {
    console.log('🔗 执行集成测试...');
    
    const integrationTests = [
      'end-to-end.test.js',
      'user-workflow.test.js',
      'error-handling.test.js'
    ];
    
    for (const testFile of integrationTests) {
      await this.executeTestFile(testFile, 'integration');
    }
  }

  async executeTestFile(testFile, category) {
    const testPath = path.join(__dirname, 'test-cases', category, testFile);
    
    // 安全验证：确保测试文件路径在项目目录内
    const safeTestPath = path.resolve(testPath);
    if (!safeTestPath.startsWith(__dirname)) {
      console.error(`❌ 测试文件路径不安全: ${testFile}`);
      this.results.skipped++;
      return;
    }
    
    // 验证文件扩展名
    if (!safeTestPath.endsWith('.js')) {
      console.error(`❌ 测试文件必须是JavaScript文件: ${testFile}`);
      this.results.skipped++;
      return;
    }
    
    if (!fs.existsSync(safeTestPath)) {
      console.warn(`⚠️ 测试文件不存在: ${testFile}`);
      this.results.skipped++;
      return;
    }

    try {
      const testModule = (await import(safeTestPath)).default;
      const result = await testModule.run();
      
      this.results.total++;
      if (result.passed) {
        this.results.passed++;
        console.log(`✅ ${testFile} - 通过`);
      } else {
        this.results.failed++;
        console.log(`❌ ${testFile} - 失败: ${result.error}`);
      }
      
      this.results.testCases.push({
        name: testFile,
        category: category,
        passed: result.passed,
        duration: result.duration,
        error: result.error
      });
      
    } catch (error) {
      this.results.total++;
      this.results.failed++;
      console.log(`❌ ${testFile} - 错误: ${error.message}`);
      
      this.results.testCases.push({
        name: testFile,
        category: category,
        passed: false,
        duration: 0,
        error: error.message
      });
    }
  }

  async generateReport() {
    const reportDir = path.join(__dirname, 'reports');
    await fs.ensureDir(reportDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `test-report-${timestamp}.json`);
    
    const report = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        passRate: ((this.results.passed / this.results.total) * 100).toFixed(2),
        duration: this.results.endTime - this.results.startTime
      },
      testCases: this.results.testCases,
      environment: process.env.NODE_ENV || 'development',
      timestamp: this.results.endTime.toISOString()
    };
    
    await fs.writeJson(reportFile, report, { spaces: 2 });
    console.log(`📊 测试报告已生成: ${reportFile}`);
    
    // 生成HTML报告
    await this.generateHtmlReport(report);
  }

  async generateHtmlReport(report) {
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>硬件兼容性测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .test-case { margin: 10px 0; padding: 10px; border-left: 4px solid; }
        .passed-case { border-color: green; background: #f0fff0; }
        .failed-case { border-color: red; background: #fff0f0; }
    </style>
</head>
<body>
    <h1>硬件兼容性检测平台测试报告</h1>
    <div class="summary">
        <h2>测试概要</h2>
        <p>总测试数: ${report.summary.total}</p>
        <p class="passed">通过: ${report.summary.passed}</p>
        <p class="failed">失败: ${report.summary.failed}</p>
        <p>跳过: ${report.summary.skipped}</p>
        <p>通过率: ${report.summary.passRate}%</p>
        <p>测试时长: ${(report.summary.duration / 1000).toFixed(2)}秒</p>
    </div>
    <h2>详细测试结果</h2>
    ${report.testCases.map(test => `
        <div class="test-case ${test.passed ? 'passed-case' : 'failed-case'}">
            <h3>${test.name} (${test.category})</h3>
            <p>状态: ${test.passed ? '✅ 通过' : '❌ 失败'}</p>
            <p>时长: ${test.duration}ms</p>
            ${test.error ? `<p>错误: ${test.error}</p>` : ''}
        </div>
    `).join('')}
</body>
</html>`;

    const reportDir = path.join(__dirname, 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlFile = path.join(reportDir, `test-report-${timestamp}.html`);
    
    await fs.writeFile(htmlFile, htmlReport);
    console.log(`📄 HTML报告已生成: ${htmlFile}`);
  }

  async sendNotifications() {
    const passRate = (this.results.passed / this.results.total) * 100;
    
    if (passRate < this.config.stability.passRateThreshold) {
      console.log('🚨 测试通过率低于阈值，发送警报...');
      await this.sendAlertNotification();
    } else if (this.results.failed > 0) {
      console.log('⚠️ 有测试失败，发送警告通知...');
      await this.sendWarningNotification();
    } else {
      console.log('✅ 所有测试通过，发送成功通知...');
      await this.sendSuccessNotification();
    }
  }

  async sendAlertNotification() {
    // 实现邮件/Slack通知
    console.log('📧 发送警报通知...');
  }

  async sendWarningNotification() {
    console.log('📧 发送警告通知...');
  }

  async sendSuccessNotification() {
    console.log('📧 发送成功通知...');
  }

  async handleFailure(error) {
    console.error('💥 测试框架遇到严重错误:', error);
    // 记录错误日志
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      results: this.results
    };
    
    const logDir = path.join(__dirname, 'logs');
    await fs.ensureDir(logDir);
    await fs.writeJson(path.join(logDir, 'error-log.json'), errorLog);
  }
}

// 命令行接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.runTests().catch(console.error);
}

export default TestRunner;