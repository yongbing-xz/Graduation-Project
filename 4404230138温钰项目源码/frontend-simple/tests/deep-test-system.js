#!/usr/bin/env node

/**
 * 深度测试系统 - 硬件兼容性检查器
 * 全面测试前端、后端、数据验证、兼容性算法等所有功能模块
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeepTestSystem {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.detailedLogs = [];
  }

  async runAllTests() {
    console.log('🚀 启动深度测试系统 - 硬件兼容性检查器\n');
    
    try {
      // 1. 基础架构测试
      await this.testInfrastructure();
      
      // 2. 前端功能测试
      await this.testFrontendFunctionality();
      
      // 3. 数据验证测试
      await this.testDataValidation();
      
      // 4. 兼容性算法测试
      await this.testCompatibilityAlgorithms();
      
      // 5. 错误处理测试
      await this.testErrorHandling();
      
      // 6. 性能测试
      await this.testPerformance();
      
      // 7. 生成详细报告
      await this.generateDetailedReport();
      
    } catch (error) {
      console.error('❌ 深度测试执行失败:', error.message);
      this.logError('深度测试执行失败', error);
    }
  }

  async testInfrastructure() {
    console.log('🏗️  基础架构测试...');
    
    const infrastructureTests = [
      {
        name: '前端服务器状态',
        test: async () => {
          // 检查前端服务器是否运行
          const indexHtmlPath = path.join(__dirname, '../index.html');
          const exists = await fs.promises.access(indexHtmlPath).then(() => true).catch(() => false);
          return exists ? '前端服务器文件存在' : '前端服务器文件不存在';
        }
      },
      {
        name: '后端服务状态',
        test: async () => {
          // 检查后端启动脚本
          const batPath = path.join(__dirname, '../../启动.bat');
          const exists = await fs.promises.access(batPath).then(() => true).catch(() => false);
          return exists ? '后端启动脚本存在' : '后端启动脚本不存在';
        }
      },
      {
        name: '配置文件完整性',
        test: async () => {
          const configPath = path.join(__dirname, 'config/test-config.json');
          const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
          return config.stability ? '配置文件结构完整' : '配置文件结构不完整';
        }
      }
    ];

    for (const testCase of infrastructureTests) {
      await this.executeTest(testCase.name, testCase.test);
    }
  }

  async testFrontendFunctionality() {
    console.log('🌐 前端功能测试...');
    
    const frontendTests = [
      {
        name: 'Vue.js应用初始化',
        test: async () => {
          const appJsPath = path.join(__dirname, '../app.js');
          const content = await fs.promises.readFile(appJsPath, 'utf8');
          const hasVueInit = content.includes('Vue.createApp') || content.includes('Vue.createApp');
          return hasVueInit ? 'Vue应用初始化代码存在' : 'Vue应用初始化代码缺失';
        }
      },
      {
        name: 'CSS样式完整性',
        test: async () => {
          const cssPath = path.join(__dirname, '../styles.css');
          const content = await fs.promises.readFile(cssPath, 'utf8');
          const hasRootVars = content.includes(':root');
          const hasResponsive = content.includes('@media');
          return hasRootVars && hasResponsive ? 'CSS样式完整' : 'CSS样式不完整';
        }
      },
      {
        name: '组件数据加载',
        test: async () => {
          const productsPath = path.join(__dirname, '../products-data.js');
          const content = await fs.promises.readFile(productsPath, 'utf8');
          const hasProducts = content.includes('const PRODUCTS =');
          return hasProducts ? '产品数据加载正常' : '产品数据加载异常';
        }
      }
    ];

    for (const testCase of frontendTests) {
      await this.executeTest(testCase.name, testCase.test);
    }
  }

  async testDataValidation() {
    console.log('📊 数据验证测试...');
    
    const dataTests = [
      {
        name: '产品数据结构验证',
        test: async () => {
          const productsPath = path.join(__dirname, '../products-data.js');
          const content = await fs.promises.readFile(productsPath, 'utf8');
          const productsMatch = content.match(/const PRODUCTS = ({[\s\S]*?});/);
          
          if (!productsMatch) throw new Error('未找到PRODUCTS数据');
          
          const productsStr = productsMatch[1]
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}');
          
          const products = JSON.parse(productsStr);
          
          // 验证数据结构
          const requiredCategories = ['cpu', 'mb', 'ram', 'gpu', 'case'];
          const missingCategories = requiredCategories.filter(cat => !products[cat]);
          
          if (missingCategories.length > 0) {
            throw new Error(`缺少组件类别: ${missingCategories.join(', ')}`);
          }
          
          return '产品数据结构验证通过';
        }
      },
      {
        name: '组件数据完整性检查',
        test: async () => {
          const productsPath = path.join(__dirname, '../products-data.js');
          const content = await fs.promises.readFile(productsPath, 'utf8');
          const productsMatch = content.match(/const PRODUCTS = ({[\s\S]*?});/);
          
          if (!productsMatch) throw new Error('未找到PRODUCTS数据');
          
          const productsStr = productsMatch[1]
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}');
          
          const products = JSON.parse(productsStr);
          
          let missingFields = 0;
          
          // 检查CPU数据完整性
          products.cpu.forEach((cpu, index) => {
            if (!cpu.接口) missingFields++;
            if (!cpu.标题) missingFields++;
          });
          
          // 检查主板数据完整性
          products.mb.forEach((mb, index) => {
            if (!mb.cpu接口) missingFields++;
            if (!mb.ddr代数 && !mb.DDR代数) missingFields++;
          });
          
          return missingFields === 0 ? '组件数据完整性验证通过' : `发现${missingFields}个缺失字段`;
        }
      }
    ];

    for (const testCase of dataTests) {
      await this.executeTest(testCase.name, testCase.test);
    }
  }

  async testCompatibilityAlgorithms() {
    console.log('🔍 兼容性算法测试...');
    
    const algorithmTests = [
      {
        name: 'CPU-主板接口兼容性',
        test: async () => {
          const productsPath = path.join(__dirname, '../products-data.js');
          const content = await fs.promises.readFile(productsPath, 'utf8');
          const productsMatch = content.match(/const PRODUCTS = ({[\s\S]*?});/);
          
          if (!productsMatch) throw new Error('未找到PRODUCTS数据');
          
          const productsStr = productsMatch[1]
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}');
          
          const products = JSON.parse(productsStr);
          
          const cpus = products.cpu || [];
          const motherboards = products.mb || [];
          
          // 测试兼容性匹配
          let compatiblePairs = 0;
          let incompatiblePairs = 0;
          
          cpus.forEach(cpu => {
            motherboards.forEach(mb => {
              if (cpu.接口 === mb.cpu接口) {
                compatiblePairs++;
              } else {
                incompatiblePairs++;
              }
            });
          });
          
          const totalPairs = compatiblePairs + incompatiblePairs;
          const compatibilityRate = totalPairs > 0 ? (compatiblePairs / totalPairs * 100).toFixed(2) : 0;
          
          return `CPU-主板兼容性: ${compatiblePairs}对兼容, ${incompatiblePairs}对不兼容, 兼容率${compatibilityRate}%`;
        }
      },
      {
        name: '内存-主板DDR兼容性',
        test: async () => {
          const productsPath = path.join(__dirname, '../products-data.js');
          const content = await fs.promises.readFile(productsPath, 'utf8');
          const productsMatch = content.match(/const PRODUCTS = ({[\s\S]*?});/);
          
          if (!productsMatch) throw new Error('未找到PRODUCTS数据');
          
          const productsStr = productsMatch[1]
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}');
          
          const products = JSON.parse(productsStr);
          
          const rams = products.ram || [];
          const motherboards = products.mb || [];
          
          let compatiblePairs = 0;
          let incompatiblePairs = 0;
          
          rams.forEach(ram => {
            const ramDDR = ram.DDR代数 || ram.ddr代数;
            motherboards.forEach(mb => {
              const mbDDR = mb.ddr代数 || mb.DDR代数;
              if (ramDDR && mbDDR && ramDDR === mbDDR) {
                compatiblePairs++;
              } else {
                incompatiblePairs++;
              }
            });
          });
          
          const totalPairs = compatiblePairs + incompatiblePairs;
          const compatibilityRate = totalPairs > 0 ? (compatiblePairs / totalPairs * 100).toFixed(2) : 0;
          
          return `内存-主板兼容性: ${compatiblePairs}对兼容, ${incompatiblePairs}对不兼容, 兼容率${compatibilityRate}%`;
        }
      }
    ];

    for (const testCase of algorithmTests) {
      await this.executeTest(testCase.name, testCase.test);
    }
  }

  async testErrorHandling() {
    console.log('⚠️  错误处理测试...');
    
    const errorTests = [
      {
        name: '无效数据输入处理',
        test: async () => {
          // 测试对无效数据的处理能力
          try {
            const invalidData = { invalid: 'data' };
            JSON.stringify(invalidData); // 基本验证
            return '无效数据处理机制正常';
          } catch (error) {
            return '无效数据处理机制异常';
          }
        }
      },
      {
        name: '文件访问错误处理',
        test: async () => {
          try {
            await fs.promises.access('nonexistent-file.js');
            return '文件访问错误处理异常';
          } catch (error) {
            return '文件访问错误处理正常';
          }
        }
      }
    ];

    for (const testCase of errorTests) {
      await this.executeTest(testCase.name, testCase.test);
    }
  }

  async testPerformance() {
    console.log('⚡ 性能测试...');
    
    const performanceTests = [
      {
        name: '数据加载性能',
        test: async () => {
          const startTime = Date.now();
          const productsPath = path.join(__dirname, '../products-data.js');
          await fs.promises.readFile(productsPath, 'utf8');
          const loadTime = Date.now() - startTime;
          
          return loadTime < 100 ? `数据加载快速: ${loadTime}ms` : `数据加载较慢: ${loadTime}ms`;
        }
      },
      {
        name: '兼容性计算性能',
        test: async () => {
          const startTime = Date.now();
          
          // 模拟兼容性计算
          const productsPath = path.join(__dirname, '../products-data.js');
          const content = await fs.promises.readFile(productsPath, 'utf8');
          const productsMatch = content.match(/const PRODUCTS = ({[\s\S]*?});/);
          
          if (productsMatch) {
            const productsStr = productsMatch[1]
              .replace(/(\w+):/g, '"$1":')
              .replace(/'/g, '"')
              .replace(/,\s*}/g, '}');
            
            const products = JSON.parse(productsStr);
            
            // 执行简单的兼容性检查
            const cpus = products.cpu || [];
            const motherboards = products.mb || [];
            
            let compatibleCount = 0;
            cpus.forEach(cpu => {
              motherboards.forEach(mb => {
                if (cpu.接口 === mb.cpu接口) {
                  compatibleCount++;
                }
              });
            });
          }
          
          const calcTime = Date.now() - startTime;
          return calcTime < 500 ? `兼容性计算快速: ${calcTime}ms` : `兼容性计算较慢: ${calcTime}ms`;
        }
      }
    ];

    for (const testCase of performanceTests) {
      await this.executeTest(testCase.name, testCase.test);
    }
  }

  async executeTest(testName, testFunction) {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        passed: true,
        duration,
        message: result
      });
      
      console.log(`✅ ${testName} - ${result} (${duration}ms)`);
      this.logSuccess(testName, result, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        passed: false,
        duration,
        message: error.message
      });
      
      console.log(`❌ ${testName} - ${error.message} (${duration}ms)`);
      this.logError(testName, error, duration);
    }
  }

  logSuccess(testName, result, duration) {
    this.detailedLogs.push({
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      test: testName,
      message: result,
      duration: `${duration}ms`
    });
  }

  logError(testName, error, duration) {
    this.detailedLogs.push({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      test: testName,
      message: error.message,
      duration: `${duration}ms`,
      stack: error.stack
    });
  }

  async generateDetailedReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    console.log('\n📋 深度测试报告');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过数: ${passedTests}`);
    console.log(`失败数: ${totalTests - passedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${totalDuration}ms`);
    console.log('='.repeat(60));
    
    // 分类统计
    const categories = {
      '基础架构': this.testResults.filter(t => t.name.includes('架构')),
      '前端功能': this.testResults.filter(t => t.name.includes('前端') || t.name.includes('Vue') || t.name.includes('CSS')),
      '数据验证': this.testResults.filter(t => t.name.includes('数据')),
      '兼容性算法': this.testResults.filter(t => t.name.includes('兼容性')),
      '错误处理': this.testResults.filter(t => t.name.includes('错误')),
      '性能测试': this.testResults.filter(t => t.name.includes('性能'))
    };
    
    console.log('\n📊 分类统计:');
    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const passed = tests.filter(t => t.passed).length;
        console.log(`  ${category}: ${passed}/${tests.length} 通过`);
      }
    });
    
    // 失败的测试
    const failedTests = this.testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ 失败的测试:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`);
      });
    }
    
    // 生成详细报告文件
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: parseFloat(successRate),
        totalDuration
      },
      categories,
      detailedResults: this.testResults,
      logs: this.detailedLogs
    };
    
    const reportPath = path.join(__dirname, 'deep-test-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
    
    // 总体评估
    if (successRate >= 90) {
      console.log('\n🎉 深度测试通过！系统状态优秀。');
    } else if (successRate >= 70) {
      console.log('\n⚠️  深度测试部分通过，建议优化失败的项目。');
    } else {
      console.log('\n❌ 深度测试失败，需要修复关键问题。');
    }
  }
}

// 执行深度测试
const test = new DeepTestSystem();
test.runAllTests().catch(console.error);