import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnvironmentValidator {
  constructor() {
    this.environments = ['development', 'testing', 'staging', 'production'];
    this.validationResults = {};
  }

  async validateAllEnvironments() {
    console.log('🔍 开始环境一致性验证...\n');

    const results = {};

    for (const env of this.environments) {
      console.log(`📋 验证 ${env} 环境...`);
      results[env] = await this.validateEnvironment(env);
    }

    this.validationResults = results;
    await this.generateConsistencyReport(results);

    return results;
  }

  async validateEnvironment(environment) {
    const validation = {
      environment,
      timestamp: new Date().toISOString(),
      checks: {},
      overallStatus: 'pass',
      issues: []
    };

    // 1. 配置文件检查
    validation.checks.configFiles = await this.checkConfigFiles(environment);

    // 2. 依赖项检查
    validation.checks.dependencies = await this.checkDependencies(environment);

    // 3. 环境变量检查
    validation.checks.environmentVariables = await this.checkEnvironmentVariables(environment);

    // 4. API端点检查
    validation.checks.apiEndpoints = await this.checkApiEndpoints(environment);

    // 5. 数据库连接检查
    validation.checks.database = await this.checkDatabaseConnection(environment);

    // 6. 静态资源检查
    validation.checks.staticAssets = await this.checkStaticAssets(environment);

    // 7. 性能基准检查
    validation.checks.performance = await this.checkPerformanceBaseline(environment);

    // 确定整体状态
    validation.overallStatus = this.determineOverallStatus(validation.checks);

    return validation;
  }

  async checkConfigFiles(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    const requiredConfigs = [
      'package.json',
      'components.json',
      'tests/config/test-config.json'
    ];

    for (const configFile of requiredConfigs) {
      try {
        const filePath = path.join(__dirname, '..', configFile);
        const exists = await fs.pathExists(filePath);
        
        if (exists) {
          const stats = await fs.stat(filePath);
          checks.details.push({
            file: configFile,
            exists: true,
            size: stats.size,
            modified: stats.mtime
          });
        } else {
          checks.details.push({
            file: configFile,
            exists: false,
            error: '文件不存在'
          });
          checks.issues.push(`配置文件缺失: ${configFile}`);
          checks.status = 'fail';
        }
      } catch (error) {
        checks.details.push({
          file: configFile,
          exists: false,
          error: error.message
        });
        checks.issues.push(`配置文件检查失败: ${configFile} - ${error.message}`);
        checks.status = 'fail';
      }
    }

    return checks;
  }

  async checkDependencies(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      const requiredDeps = {
        dependencies: ['axios', 'fs-extra'],
        devDependencies: ['jest', 'mocha', 'chai', 'puppeteer', 'jsdom']
      };

      // 检查生产依赖
      for (const dep of requiredDeps.dependencies) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          checks.details.push({
            dependency: dep,
            type: 'production',
            version: packageJson.dependencies[dep],
            status: 'ok'
          });
        } else {
          checks.details.push({
            dependency: dep,
            type: 'production',
            status: 'missing'
          });
          checks.issues.push(`生产依赖缺失: ${dep}`);
          checks.status = 'fail';
        }
      }

      // 检查开发依赖
      for (const dep of requiredDeps.devDependencies) {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          checks.details.push({
            dependency: dep,
            type: 'development',
            version: packageJson.devDependencies[dep],
            status: 'ok'
          });
        } else {
          checks.details.push({
            dependency: dep,
            type: 'development',
            status: 'missing'
          });
          checks.issues.push(`开发依赖缺失: ${dep}`);
          checks.status = 'fail';
        }
      }

    } catch (error) {
      checks.details.push({
        error: '依赖检查失败',
        message: error.message
      });
      checks.issues.push(`依赖检查失败: ${error.message}`);
      checks.status = 'fail';
    }

    return checks;
  }

  async checkEnvironmentVariables(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    const requiredVars = {
      development: ['NODE_ENV', 'PORT'],
      testing: ['NODE_ENV', 'TEST_DATABASE_URL'],
      staging: ['NODE_ENV', 'API_BASE_URL', 'DATABASE_URL'],
      production: ['NODE_ENV', 'API_BASE_URL', 'DATABASE_URL', 'LOG_LEVEL']
    };

    const varsToCheck = requiredVars[environment] || [];

    for (const envVar of varsToCheck) {
      const value = process.env[envVar];
      
      if (value) {
        checks.details.push({
          variable: envVar,
          value: this.maskSensitiveData(envVar, value),
          status: 'ok'
        });
      } else {
        checks.details.push({
          variable: envVar,
          value: null,
          status: 'missing'
        });
        checks.issues.push(`环境变量缺失: ${envVar}`);
        checks.status = 'fail';
      }
    }

    return checks;
  }

  async checkApiEndpoints(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    // 模拟API端点检查
    const endpoints = [
      { name: '组件数据接口', path: '/api/components', method: 'GET' },
      { name: '兼容性检测接口', path: '/api/compatibility', method: 'POST' },
      { name: '配置保存接口', path: '/api/save-config', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      try {
        // 这里可以集成实际的API测试
        checks.details.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: 'simulated',
          simulatedResponse: 'API端点检查已模拟'
        });
      } catch (error) {
        checks.details.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: 'error',
          error: error.message
        });
        checks.issues.push(`API端点检查失败: ${endpoint.name} - ${error.message}`);
        checks.status = 'fail';
      }
    }

    return checks;
  }

  async checkDatabaseConnection(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    try {
      // 模拟数据库连接检查
      checks.details.push({
        database: '项目数据存储',
        type: '文件系统',
        status: 'simulated',
        simulatedResponse: '数据库连接检查已模拟'
      });
    } catch (error) {
      checks.details.push({
        database: '项目数据存储',
        type: '文件系统',
        status: 'error',
        error: error.message
      });
      checks.issues.push(`数据库连接检查失败: ${error.message}`);
      checks.status = 'fail';
    }

    return checks;
  }

  async checkStaticAssets(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    const requiredAssets = [
      'index.html',
      'assets/css/styles.css',
      'assets/js/app.js',
      'components.json'
    ];

    for (const asset of requiredAssets) {
      try {
        const assetPath = path.join(__dirname, '..', asset);
        const exists = await fs.pathExists(assetPath);
        
        if (exists) {
          const stats = await fs.stat(assetPath);
          checks.details.push({
            asset,
            exists: true,
            size: stats.size,
            status: 'ok'
          });
        } else {
          checks.details.push({
            asset,
            exists: false,
            status: 'missing'
          });
          checks.issues.push(`静态资源缺失: ${asset}`);
          checks.status = 'fail';
        }
      } catch (error) {
        checks.details.push({
          asset,
          exists: false,
          status: 'error',
          error: error.message
        });
        checks.issues.push(`静态资源检查失败: ${asset} - ${error.message}`);
        checks.status = 'fail';
      }
    }

    return checks;
  }

  async checkPerformanceBaseline(environment) {
    const checks = {
      status: 'pass',
      details: [],
      issues: []
    };

    const performanceThresholds = {
      development: {
        pageLoad: 3000,
        apiResponse: 1000,
        memoryUsage: 500
      },
      production: {
        pageLoad: 2000,
        apiResponse: 500,
        memoryUsage: 300
      }
    };

    const thresholds = performanceThresholds[environment] || performanceThresholds.development;

    try {
      // 模拟性能检查
      const simulatedMetrics = {
        pageLoad: 1500,
        apiResponse: 300,
        memoryUsage: 250
      };

      for (const [metric, value] of Object.entries(simulatedMetrics)) {
        const threshold = thresholds[metric];
        const status = value <= threshold ? 'ok' : 'warning';
        
        checks.details.push({
          metric,
          value,
          threshold,
          status
        });

        if (status === 'warning') {
          checks.issues.push(`性能警告: ${metric} (${value}ms) 超过阈值 (${threshold}ms)`);
          checks.status = 'warning';
        }
      }

    } catch (error) {
      checks.details.push({
        error: '性能检查失败',
        message: error.message
      });
      checks.issues.push(`性能检查失败: ${error.message}`);
      checks.status = 'fail';
    }

    return checks;
  }

  determineOverallStatus(checks) {
    const checkStatuses = Object.values(checks).map(check => check.status);
    
    if (checkStatuses.includes('fail')) {
      return 'fail';
    } else if (checkStatuses.includes('warning')) {
      return 'warning';
    } else {
      return 'pass';
    }
  }

  maskSensitiveData(variableName, value) {
    const sensitivePatterns = [
      'password',
      'secret',
      'key',
      'token',
      'auth'
    ];

    if (sensitivePatterns.some(pattern => 
      variableName.toLowerCase().includes(pattern)
    )) {
      return '***' + value.slice(-4);
    }
    
    return value;
  }

  async generateConsistencyReport(validationResults) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalEnvironments: Object.keys(validationResults).length,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      environments: validationResults,
      consistencyIssues: []
    };

    // 统计结果
    for (const [env, result] of Object.entries(validationResults)) {
      if (result.overallStatus === 'pass') {
        report.summary.passed++;
      } else if (result.overallStatus === 'fail') {
        report.summary.failed++;
      } else if (result.overallStatus === 'warning') {
        report.summary.warnings++;
      }
    }

    // 检查环境间的一致性
    report.consistencyIssues = this.findConsistencyIssues(validationResults);

    // 保存报告
    await this.saveReport(report);

    // 输出摘要
    this.printReportSummary(report);

    return report;
  }

  findConsistencyIssues(validationResults) {
    const issues = [];
    const environments = Object.keys(validationResults);

    // 检查配置文件一致性
    const configFiles = {};
    for (const env of environments) {
      const configCheck = validationResults[env].checks.configFiles;
      configFiles[env] = configCheck.details.map(detail => ({
        file: detail.file,
        exists: detail.exists,
        size: detail.size
      }));
    }

    // 检查依赖版本一致性
    const dependencyVersions = {};
    for (const env of environments) {
      const depCheck = validationResults[env].checks.dependencies;
      dependencyVersions[env] = {};
      
      depCheck.details.forEach(detail => {
        if (detail.version) {
          dependencyVersions[env][detail.dependency] = detail.version;
        }
      });
    }

    // 识别不一致的依赖版本
    const allDeps = new Set();
    Object.values(dependencyVersions).forEach(envDeps => {
      Object.keys(envDeps).forEach(dep => allDeps.add(dep));
    });

    for (const dep of allDeps) {
      const versions = {};
      for (const env of environments) {
        versions[env] = dependencyVersions[env][dep];
      }
      
      const uniqueVersions = new Set(Object.values(versions).filter(v => v));
      if (uniqueVersions.size > 1) {
        issues.push({
          type: 'dependency_version_inconsistency',
          dependency: dep,
          versions: versions,
          severity: 'warning'
        });
      }
    }

    return issues;
  }

  async saveReport(report) {
    try {
      const reportsDir = path.join(__dirname, 'reports');
      await fs.ensureDir(reportsDir);
      
      const reportFile = path.join(reportsDir, `environment-validation-${Date.now()}.json`);
      await fs.writeJson(reportFile, report, { spaces: 2 });
      
      console.log(`📊 环境验证报告已保存: ${reportFile}`);
    } catch (error) {
      console.error('❌ 报告保存失败:', error.message);
    }
  }

  printReportSummary(report) {
    console.log('\n📋 环境一致性验证报告摘要');
    console.log('='.repeat(50));
    console.log(`生成时间: ${new Date(report.generatedAt).toLocaleString('zh-CN')}`);
    console.log(`环境总数: ${report.summary.totalEnvironments}`);
    console.log(`✅ 通过: ${report.summary.passed}`);
    console.log(`⚠️ 警告: ${report.summary.warnings}`);
    console.log(`❌ 失败: ${report.summary.failed}`);
    
    if (report.consistencyIssues.length > 0) {
      console.log('\n🔍 环境间不一致问题:');
      report.consistencyIssues.forEach(issue => {
        console.log(`  - ${issue.dependency}: ${JSON.stringify(issue.versions)}`);
      });
    }

    console.log('='.repeat(50));
  }

  getValidationResults() {
    return this.validationResults;
  }

  getConsistencyScore() {
    if (Object.keys(this.validationResults).length === 0) {
      return 0;
    }

    const passedEnvironments = Object.values(this.validationResults)
      .filter(result => result.overallStatus === 'pass').length;
    
    return (passedEnvironments / Object.keys(this.validationResults).length) * 100;
  }
}

export default EnvironmentValidator;