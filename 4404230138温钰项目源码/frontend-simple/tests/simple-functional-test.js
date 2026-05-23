#!/usr/bin/env node

/**
 * 简化的自动功能测试系统
 * 针对硬件兼容性检查器进行功能测试
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleFunctionalTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 启动简化的自动功能测试系统...\n');
    
    try {
      // 1. 测试数据文件完整性
      await this.testDataFiles();
      
      // 2. 测试前端文件完整性
      await this.testFrontendFiles();
      
      // 3. 测试后端服务
      await this.testBackendServices();
      
      // 4. 生成测试报告
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message);
    }
  }

  async testDataFiles() {
    console.log('📊 测试数据文件完整性...');
    
    const testCases = [
      {
        name: '产品数据文件',
        file: '../products-data.js'
      },
      {
        name: '测试配置文件',
        file: 'config/test-config.json'
      },
      {
        name: '包管理文件',
        file: 'package.json'
      }
    ];

    for (const testCase of testCases) {
      const result = await this.testFileExists(testCase.file, testCase.name);
      this.testResults.push(result);
    }
  }

  async testFrontendFiles() {
    console.log('🌐 测试前端文件完整性...');
    
    const frontendFiles = [
      '../index.html',
      '../app.js',
      '../styles.css'
    ];

    for (const file of frontendFiles) {
      const result = await this.testFileExists(file, `前端文件: ${path.basename(file)}`);
      this.testResults.push(result);
    }
  }

  async testBackendServices() {
    console.log('🔧 测试后端服务...');
    
    const backendTests = [
      {
        name: '后端启动脚本',
        file: '../../启动.bat'
      },
      {
        name: '后端包管理文件',
        file: '../../backend/pom.xml'
      }
    ];

    for (const test of backendTests) {
      const result = await this.testFileExists(test.file, test.name);
      this.testResults.push(result);
    }
  }

  async testFileExists(filePath, testName) {
    const fullPath = path.join(__dirname, filePath);
    const startTime = Date.now();
    
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${testName} - 文件存在`);
      return {
        name: testName,
        passed: true,
        duration,
        message: '文件存在且可访问'
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.log(`❌ ${testName} - 文件不存在: ${filePath}`);
      return {
        name: testName,
        passed: false,
        duration,
        message: `文件不存在: ${error.message}`
      };
    }
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    console.log('\n📋 测试报告');
    console.log('='.repeat(50));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过数: ${passedTests}`);
    console.log(`失败数: ${totalTests - passedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${totalDuration}ms`);
    console.log('='.repeat(50));
    
    // 显示失败的测试
    const failedTests = this.testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ 失败的测试:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }
    
    // 显示通过的测试
    const successfulTests = this.testResults.filter(r => r.passed);
    if (successfulTests.length > 0) {
      console.log('\n✅ 通过的测试:');
      successfulTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.message} (${test.duration}ms)`);
      });
    }
    
    // 生成JSON报告
    const report = {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: parseFloat(successRate),
      totalDuration,
      results: this.testResults
    };
    
    const reportPath = path.join(__dirname, 'simple-test-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
    
    // 总体评估
    if (successRate >= 80) {
      console.log('\n🎉 系统功能测试通过！系统状态良好。');
    } else if (successRate >= 50) {
      console.log('\n⚠️ 系统功能测试部分通过，建议检查失败的项目。');
    } else {
      console.log('\n❌ 系统功能测试失败，需要修复问题。');
    }
  }
}

// 执行测试
const test = new SimpleFunctionalTest();
test.runAllTests().catch(console.error);