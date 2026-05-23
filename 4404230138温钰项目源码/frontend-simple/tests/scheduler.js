import fs from 'fs-extra';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestScheduler {
  constructor(config) {
    this.config = config || {};
    this.scheduledJobs = new Map();
    this.executionHistory = [];
    this.maxHistorySize = 100;
  }

  async initialize() {
    console.log('⏰ 初始化测试调度器...');
    
    // 加载执行历史
    await this.loadExecutionHistory();
    
    // 配置默认调度任务
    this.configureDefaultSchedules();
    
    console.log('✅ 测试调度器初始化完成');
  }

  configureDefaultSchedules() {
    // 每日凌晨2点执行完整测试套件
    this.scheduleTest('daily-full-suite', {
      name: '每日完整测试',
      description: '每日凌晨执行完整测试套件',
      schedule: '0 2 * * *', // 每天凌晨2点
      testTypes: ['core', 'compatibility', 'performance', 'integration'],
      environment: 'testing',
      notifyOn: ['failure', 'warning']
    });

    // 每小时执行核心功能测试
    this.scheduleTest('hourly-core-tests', {
      name: '每小时核心测试',
      description: '每小时执行核心功能测试',
      schedule: '0 * * * *', // 每小时
      testTypes: ['core'],
      environment: 'testing',
      notifyOn: ['failure']
    });

    // 每周一上午9点执行性能基准测试
    this.scheduleTest('weekly-performance', {
      name: '每周性能测试',
      description: '每周一执行性能基准测试',
      schedule: '0 9 * * 1', // 每周一上午9点
      testTypes: ['performance'],
      environment: 'production',
      notifyOn: ['failure', 'warning']
    });

    // 每月1号凌晨3点执行环境一致性验证
    this.scheduleTest('monthly-environment-check', {
      name: '每月环境验证',
      description: '每月执行环境一致性验证',
      schedule: '0 3 1 * *', // 每月1号凌晨3点
      testTypes: ['environment'],
      environment: 'all',
      notifyOn: ['failure', 'warning']
    });
  }

  scheduleTest(jobId, jobConfig) {
    if (this.scheduledJobs.has(jobId)) {
      console.warn(`⚠️ 任务 ${jobId} 已存在，将重新调度`);
      this.unscheduleTest(jobId);
    }

    try {
      const task = cron.schedule(jobConfig.schedule, async () => {
        await this.executeScheduledTest(jobId, jobConfig);
      }, {
        scheduled: false,
        timezone: 'Asia/Shanghai'
      });

      this.scheduledJobs.set(jobId, {
        task,
        config: jobConfig,
        lastExecution: null,
        nextExecution: this.calculateNextExecution(jobConfig.schedule)
      });

      task.start();
      
      console.log(`✅ 已调度任务: ${jobConfig.name}`);
      console.log(`   调度表达式: ${jobConfig.schedule}`);
      console.log(`   下次执行: ${this.scheduledJobs.get(jobId).nextExecution}`);
      
    } catch (error) {
      console.error(`❌ 调度任务失败 ${jobId}:`, error.message);
    }
  }

  unscheduleTest(jobId) {
    const job = this.scheduledJobs.get(jobId);
    if (job) {
      job.task.stop();
      this.scheduledJobs.delete(jobId);
      console.log(`🗑️ 已取消调度任务: ${jobId}`);
    }
  }

  async executeScheduledTest(jobId, jobConfig) {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    const executionRecord = {
      id: executionId,
      jobId,
      jobName: jobConfig.name,
      startTime: new Date(startTime).toISOString(),
      status: 'running',
      testTypes: jobConfig.testTypes,
      environment: jobConfig.environment
    };

    console.log(`\n🚀 开始执行调度任务: ${jobConfig.name}`);
    console.log(`执行ID: ${executionId}`);
    console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);

    try {
      // 更新任务状态
      const job = this.scheduledJobs.get(jobId);
      if (job) {
        job.lastExecution = new Date().toISOString();
        job.nextExecution = this.calculateNextExecution(jobConfig.schedule);
      }

      // 执行测试
      const testResults = await this.runTests(jobConfig);
      
      const endTime = Date.now();
      executionRecord.endTime = new Date(endTime).toISOString();
      executionRecord.duration = endTime - startTime;
      executionRecord.results = testResults;
      
      // 分析结果
      const analysis = this.analyzeTestResults(testResults);
      executionRecord.analysis = analysis;
      executionRecord.status = analysis.overallStatus;

      // 发送通知
      if (jobConfig.notifyOn.includes(analysis.overallStatus)) {
        await this.sendNotifications(jobConfig, executionRecord);
      }

      console.log(`✅ 任务执行完成: ${jobConfig.name}`);
      console.log(`   状态: ${executionRecord.status}`);
      console.log(`   耗时: ${executionRecord.duration}ms`);
      console.log(`   通过率: ${analysis.passRate}%`);

    } catch (error) {
      const endTime = Date.now();
      executionRecord.endTime = new Date(endTime).toISOString();
      executionRecord.duration = endTime - startTime;
      executionRecord.status = 'error';
      executionRecord.error = error.message;

      console.error(`❌ 任务执行失败: ${jobConfig.name}`, error.message);
      
      // 错误时发送通知
      await this.sendErrorNotification(jobConfig, executionRecord);
    }

    // 保存执行记录
    this.addToExecutionHistory(executionRecord);
    await this.saveExecutionHistory();

    return executionRecord;
  }

  async runTests(jobConfig) {
    const results = [];
    const TestRunner = (await import('./test-runner.js')).default;
    const testRunner = new TestRunner();

    // 根据测试类型执行相应的测试
    for (const testType of jobConfig.testTypes) {
      try {
        let testResult;
        
        switch (testType) {
          case 'core':
            testResult = await testRunner.runCoreFunctionalityTests();
            break;
          case 'compatibility':
            testResult = await testRunner.runCompatibilityTests();
            break;
          case 'performance':
            testResult = await testRunner.runPerformanceTests();
            break;
          case 'integration':
            testResult = await testRunner.runIntegrationTests();
            break;
          case 'environment':
            const EnvironmentValidator = (await import('./environment-validator.js')).default;
            const validator = new EnvironmentValidator();
            testResult = await validator.validateAllEnvironments();
            break;
          default:
            console.warn(`⚠️ 未知的测试类型: ${testType}`);
            continue;
        }

        results.push({
          testType,
          result: testResult,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error(`❌ ${testType} 测试执行失败:`, error.message);
        results.push({
          testType,
          error: error.message,
          timestamp: new Date().toISOString(),
          status: 'error'
        });
      }
    }

    return results;
  }

  analyzeTestResults(testResults) {
    const analysis = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      errorTests: 0,
      passRate: 0,
      overallStatus: 'pass'
    };

    for (const result of testResults) {
      if (result.error) {
        analysis.errorTests++;
        analysis.overallStatus = 'error';
        continue;
      }

      // 处理不同类型的测试结果
      if (result.testType === 'environment') {
        const envResults = result.result;
        analysis.totalTests += Object.keys(envResults).length;
        
        for (const [env, envResult] of Object.entries(envResults)) {
          if (envResult.overallStatus === 'pass') {
            analysis.passedTests++;
          } else if (envResult.overallStatus === 'fail') {
            analysis.failedTests++;
            analysis.overallStatus = 'fail';
          } else if (envResult.overallStatus === 'warning') {
            analysis.failedTests++;
            if (analysis.overallStatus === 'pass') {
              analysis.overallStatus = 'warning';
            }
          }
        }
      } else {
        // 处理常规测试结果
        const testResult = result.result;
        if (Array.isArray(testResult)) {
          analysis.totalTests += testResult.length;
          analysis.passedTests += testResult.filter(r => r.passed).length;
          analysis.failedTests += testResult.filter(r => !r.passed).length;
          
          if (testResult.some(r => !r.passed)) {
            analysis.overallStatus = analysis.failedTests > 0 ? 'fail' : 'warning';
          }
        }
      }
    }

    // 计算通过率
    if (analysis.totalTests > 0) {
      analysis.passRate = ((analysis.passedTests / analysis.totalTests) * 100).toFixed(2);
    }

    // 确定整体状态
    if (analysis.errorTests > 0) {
      analysis.overallStatus = 'error';
    } else if (analysis.failedTests > 0) {
      analysis.overallStatus = analysis.passRate >= 95 ? 'warning' : 'fail';
    }

    return analysis;
  }

  async sendNotifications(jobConfig, executionRecord) {
    const AlertSystem = (await import('./alert-system.js')).default;
    const alertSystem = new AlertSystem(this.config.alert || {});

    const alertLevel = executionRecord.status === 'error' ? 'critical' : 
                     executionRecord.status === 'fail' ? 'critical' : 'warning';

    await alertSystem.sendAlert({
      level: alertLevel,
      title: `调度任务 ${executionRecord.status === 'error' ? '执行失败' : '检测到问题'}: ${jobConfig.name}`,
      message: `测试通过率: ${executionRecord.analysis.passRate}%\n执行耗时: ${executionRecord.duration}ms`,
      testName: jobConfig.name,
      testResult: executionRecord
    });
  }

  async sendErrorNotification(jobConfig, executionRecord) {
    const AlertSystem = (await import('./alert-system.js')).default;
    const alertSystem = new AlertSystem(this.config.alert || {});

    await alertSystem.sendAlert({
      level: 'critical',
      title: `调度任务执行错误: ${jobConfig.name}`,
      message: `错误信息: ${executionRecord.error}`,
      testName: jobConfig.name,
      testResult: executionRecord
    });
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  calculateNextExecution(cronExpression) {
    try {
      const schedule = cron.parse(cronExpression);
      const nextDate = schedule.next();
      return nextDate.toISOString();
    } catch (error) {
      console.warn('⚠️ 计算下次执行时间失败:', error.message);
      return '未知';
    }
  }

  addToExecutionHistory(executionRecord) {
    this.executionHistory.unshift(executionRecord);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  async saveExecutionHistory() {
    try {
      const historyFile = path.join(__dirname, 'data', 'execution-history.json');
      await fs.ensureDir(path.dirname(historyFile));
      
      const historyData = {
        lastUpdated: new Date().toISOString(),
        executions: this.executionHistory
      };
      
      await fs.writeJson(historyFile, historyData, { spaces: 2 });
      
    } catch (error) {
      console.error('❌ 执行历史保存失败:', error.message);
    }
  }

  async loadExecutionHistory() {
    try {
      const historyFile = path.join(__dirname, 'data', 'execution-history.json');
      
      if (await fs.pathExists(historyFile)) {
        const historyData = await fs.readJson(historyFile);
        this.executionHistory = historyData.executions || [];
        console.log(`📚 加载了 ${this.executionHistory.length} 条执行历史记录`);
      }
      
    } catch (error) {
      console.warn('⚠️ 执行历史加载失败，将使用空历史记录');
      this.executionHistory = [];
    }
  }

  getScheduledJobs() {
    return Array.from(this.scheduledJobs.entries()).map(([jobId, job]) => ({
      jobId,
      ...job.config,
      lastExecution: job.lastExecution,
      nextExecution: job.nextExecution
    }));
  }

  getExecutionHistory(limit = 10) {
    return this.executionHistory.slice(0, limit);
  }

  getJobStatistics(jobId) {
    const jobExecutions = this.executionHistory.filter(exec => exec.jobId === jobId);
    
    if (jobExecutions.length === 0) {
      return null;
    }

    const stats = {
      totalExecutions: jobExecutions.length,
      successfulExecutions: jobExecutions.filter(exec => exec.status === 'pass').length,
      failedExecutions: jobExecutions.filter(exec => exec.status === 'fail').length,
      errorExecutions: jobExecutions.filter(exec => exec.status === 'error').length,
      averageDuration: 0,
      successRate: 0
    };

    const durations = jobExecutions
      .filter(exec => exec.duration)
      .map(exec => exec.duration);
    
    if (durations.length > 0) {
      stats.averageDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
    }

    if (stats.totalExecutions > 0) {
      stats.successRate = (stats.successfulExecutions / stats.totalExecutions) * 100;
    }

    return stats;
  }

  // 手动触发测试执行
  async triggerManualExecution(jobId, options = {}) {
    const job = this.scheduledJobs.get(jobId);
    if (!job) {
      throw new Error(`任务 ${jobId} 不存在`);
    }

    console.log(`🔧 手动触发任务执行: ${job.config.name}`);
    
    const executionConfig = {
      ...job.config,
      ...options
    };

    return await this.executeScheduledTest(jobId, executionConfig);
  }

  // 停止所有调度任务
  stopAllSchedules() {
    console.log('🛑 停止所有调度任务...');
    
    for (const [jobId, job] of this.scheduledJobs.entries()) {
      job.task.stop();
      console.log(`  已停止: ${job.config.name}`);
    }
    
    this.scheduledJobs.clear();
    console.log('✅ 所有调度任务已停止');
  }

  // 重启调度器
  async restart() {
    console.log('🔄 重启测试调度器...');
    
    this.stopAllSchedules();
    await this.initialize();
    
    console.log('✅ 测试调度器重启完成');
  }
}

export default TestScheduler;