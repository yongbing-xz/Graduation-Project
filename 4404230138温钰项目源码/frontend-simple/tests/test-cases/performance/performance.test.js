import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceTest {
  constructor() {
    this.name = '性能测试';
    this.description = '测试应用性能指标，包括加载时间、响应时间和内存使用';
  }

  async run() {
    const startTime = Date.now();
    let passed = true;
    let error = null;
    const performanceMetrics = {};

    try {
      console.log('⚡ 开始性能测试...');
      
      // 1. 测试页面加载性能
      performanceMetrics.pageLoad = await this.testPageLoadPerformance();
      
      // 2. 测试组件选择性能
      performanceMetrics.componentSelection = await this.testComponentSelectionPerformance();
      
      // 3. 测试兼容性检测性能
      performanceMetrics.compatibilityCheck = await this.testCompatibilityCheckPerformance();
      
      // 4. 测试数据导入导出性能
      performanceMetrics.dataImportExport = await this.testDataImportExportPerformance();
      
      // 5. 测试内存使用情况
      performanceMetrics.memoryUsage = await this.testMemoryUsage();
      
      // 6. 验证性能指标
      passed = this.validatePerformanceMetrics(performanceMetrics);

    } catch (err) {
      passed = false;
      error = err.message;
    }

    const duration = Date.now() - startTime;
    
    return {
      passed,
      error,
      duration,
      name: this.name,
      description: this.description,
      performanceMetrics
    };
  }

  async testPageLoadPerformance() {
    console.log('📄 测试页面加载性能...');
    
    const metrics = {
      domLoadTime: 0,
      fullLoadTime: 0,
      resourceLoadTime: 0
    };

    try {
      const startTime = Date.now();
      
      // 加载HTML文件
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      
      const domLoadStart = Date.now();
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });
      metrics.domLoadTime = Date.now() - domLoadStart;
      
      // 等待资源加载完成
      await new Promise(resolve => setTimeout(resolve, 2000));
      metrics.fullLoadTime = Date.now() - startTime;
      
      // 测试资源加载时间
      const resourceLoadStart = Date.now();
      await this.loadExternalResources(dom);
      metrics.resourceLoadTime = Date.now() - resourceLoadStart;
      
      console.log(`✅ 页面加载性能测试完成:
        - DOM加载时间: ${metrics.domLoadTime}ms
        - 完整加载时间: ${metrics.fullLoadTime}ms
        - 资源加载时间: ${metrics.resourceLoadTime}ms`);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ 页面加载性能测试失败:', error.message);
      throw error;
    }
  }

  async testComponentSelectionPerformance() {
    console.log('🎯 测试组件选择性能...');
    
    const metrics = {
      singleSelectionTime: 0,
      multipleSelectionTime: 0,
      searchFilterTime: 0
    };

    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 测试单个组件选择性能
      const singleStart = Date.now();
      const cpu = window.app.products.cpu[0];
      window.app.selected.cpu = cpu;
      metrics.singleSelectionTime = Date.now() - singleStart;
      
      // 测试多个组件选择性能
      const multipleStart = Date.now();
      const mb = window.app.products.mb[0];
      const ram = window.app.products.ram[0];
      const ssd = window.app.products.ssd[0];
      
      window.app.selected.mb = mb;
      window.app.selected.ram = ram;
      window.app.selected.ssd = ssd;
      metrics.multipleSelectionTime = Date.now() - multipleStart;
      
      // 测试搜索筛选性能
      const searchStart = Date.now();
      const searchTerm = 'Intel';
      const filteredCPUs = window.app.products.cpu.filter(cpu => 
        cpu.brand.includes(searchTerm) || cpu.title.includes(searchTerm)
      );
      metrics.searchFilterTime = Date.now() - searchStart;
      
      console.log(`✅ 组件选择性能测试完成:
        - 单个选择时间: ${metrics.singleSelectionTime}ms
        - 多个选择时间: ${metrics.multipleSelectionTime}ms
        - 搜索筛选时间: ${metrics.searchFilterTime}ms`);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ 组件选择性能测试失败:', error.message);
      throw error;
    }
  }

  async testCompatibilityCheckPerformance() {
    console.log('🔧 测试兼容性检测性能...');
    
    const metrics = {
      singleCheckTime: 0,
      multipleCheckTime: 0,
      fullSystemCheckTime: 0
    };

    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 测试单个兼容性检查
      const singleStart = Date.now();
      const cpu = window.app.products.cpu[0];
      const mb = window.app.products.mb[0];
      const compatible = window.app.isComponentCompatible('cpu', cpu, mb);
      metrics.singleCheckTime = Date.now() - singleStart;
      
      // 测试多个兼容性检查
      const multipleStart = Date.now();
      const components = [
        { type: 'cpu', component: cpu },
        { type: 'mb', component: mb },
        { type: 'ram', component: window.app.products.ram[0] }
      ];
      
      let allCompatible = true;
      for (let i = 0; i < components.length - 1; i++) {
        for (let j = i + 1; j < components.length; j++) {
          const result = window.app.isComponentCompatible(
            components[i].type, 
            components[i].component, 
            components[j].component
          );
          allCompatible = allCompatible && result;
        }
      }
      metrics.multipleCheckTime = Date.now() - multipleStart;
      
      // 测试完整系统检查
      const fullStart = Date.now();
      const results = window.app.results;
      metrics.fullSystemCheckTime = Date.now() - fullStart;
      
      console.log(`✅ 兼容性检测性能测试完成:
        - 单个检查时间: ${metrics.singleCheckTime}ms
        - 多个检查时间: ${metrics.multipleCheckTime}ms
        - 完整系统检查时间: ${metrics.fullSystemCheckTime}ms`);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ 兼容性检测性能测试失败:', error.message);
      throw error;
    }
  }

  async testDataImportExportPerformance() {
    console.log('📊 测试数据导入导出性能...');
    
    const metrics = {
      smallImportTime: 0,
      largeImportTime: 0,
      exportTime: 0
    };

    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 测试小数据导入性能
      const smallDataset = {
        name: '小型测试数据',
        description: '性能测试',
        components: {
          cpu: [window.app.products.cpu[0]],
          mb: [window.app.products.mb[0]]
        }
      };
      
      const smallStart = Date.now();
      window.app.importDataset(smallDataset);
      metrics.smallImportTime = Date.now() - smallStart;
      
      // 测试大数据导入性能
      const largeDataset = {
        name: '大型测试数据',
        description: '性能测试',
        components: {
          cpu: window.app.products.cpu.slice(0, 50),
          mb: window.app.products.mb.slice(0, 50),
          ram: window.app.products.ram.slice(0, 50)
        }
      };
      
      const largeStart = Date.now();
      window.app.importDataset(largeDataset);
      metrics.largeImportTime = Date.now() - largeStart;
      
      // 测试导出性能
      const exportStart = Date.now();
      window.app.exportDataset();
      metrics.exportTime = Date.now() - exportStart;
      
      console.log(`✅ 数据导入导出性能测试完成:
        - 小数据导入时间: ${metrics.smallImportTime}ms
        - 大数据导入时间: ${metrics.largeImportTime}ms
        - 数据导出时间: ${metrics.exportTime}ms`);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ 数据导入导出性能测试失败:', error.message);
      throw error;
    }
  }

  async testMemoryUsage() {
    console.log('💾 测试内存使用情况...');
    
    const metrics = {
      initialMemory: 0,
      afterLoadMemory: 0,
      afterOperationsMemory: 0,
      memoryIncrease: 0
    };

    try {
      // 获取初始内存使用情况
      if (global.gc) {
        global.gc();
      }
      metrics.initialMemory = process.memoryUsage().heapUsed;
      
      // 加载应用后测试内存
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (global.gc) {
        global.gc();
      }
      metrics.afterLoadMemory = process.memoryUsage().heapUsed;
      
      // 执行操作后测试内存
      const window = dom.window;
      
      // 执行一些操作
      for (let i = 0; i < 10; i++) {
        window.app.selected.cpu = window.app.products.cpu[i % window.app.products.cpu.length];
        window.app.selected.mb = window.app.products.mb[i % window.app.products.mb.length];
        window.app.results;
      }
      
      if (global.gc) {
        global.gc();
      }
      metrics.afterOperationsMemory = process.memoryUsage().heapUsed;
      
      metrics.memoryIncrease = metrics.afterOperationsMemory - metrics.initialMemory;
      
      console.log(`✅ 内存使用情况测试完成:
        - 初始内存: ${(metrics.initialMemory / 1024 / 1024).toFixed(2)}MB
        - 加载后内存: ${(metrics.afterLoadMemory / 1024 / 1024).toFixed(2)}MB
        - 操作后内存: ${(metrics.afterOperationsMemory / 1024 / 1024).toFixed(2)}MB
        - 内存增长: ${(metrics.memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      return metrics;
      
    } catch (error) {
      console.error('❌ 内存使用情况测试失败:', error.message);
      throw error;
    }
  }

  validatePerformanceMetrics(metrics) {
    console.log('📈 验证性能指标...');
    
    const thresholds = {
      pageLoad: {
        domLoadTime: 1000, // 1秒
        fullLoadTime: 3000, // 3秒
        resourceLoadTime: 2000 // 2秒
      },
      componentSelection: {
        singleSelectionTime: 100, // 100ms
        multipleSelectionTime: 300, // 300ms
        searchFilterTime: 200 // 200ms
      },
      compatibilityCheck: {
        singleCheckTime: 50, // 50ms
        multipleCheckTime: 200, // 200ms
        fullSystemCheckTime: 500 // 500ms
      },
      dataImportExport: {
        smallImportTime: 500, // 500ms
        largeImportTime: 2000, // 2秒
        exportTime: 1000 // 1秒
      },
      memoryUsage: {
        memoryIncrease: 50 * 1024 * 1024 // 50MB
      }
    };
    
    let allPassed = true;
    
    // 验证页面加载性能
    if (metrics.pageLoad.domLoadTime > thresholds.pageLoad.domLoadTime) {
      console.warn(`⚠️ DOM加载时间过长: ${metrics.pageLoad.domLoadTime}ms > ${thresholds.pageLoad.domLoadTime}ms`);
      allPassed = false;
    }
    
    if (metrics.pageLoad.fullLoadTime > thresholds.pageLoad.fullLoadTime) {
      console.warn(`⚠️ 完整加载时间过长: ${metrics.pageLoad.fullLoadTime}ms > ${thresholds.pageLoad.fullLoadTime}ms`);
      allPassed = false;
    }
    
    // 验证组件选择性能
    if (metrics.componentSelection.singleSelectionTime > thresholds.componentSelection.singleSelectionTime) {
      console.warn(`⚠️ 单个选择时间过长: ${metrics.componentSelection.singleSelectionTime}ms > ${thresholds.componentSelection.singleSelectionTime}ms`);
      allPassed = false;
    }
    
    // 验证兼容性检测性能
    if (metrics.compatibilityCheck.singleCheckTime > thresholds.compatibilityCheck.singleCheckTime) {
      console.warn(`⚠️ 单个兼容性检查时间过长: ${metrics.compatibilityCheck.singleCheckTime}ms > ${thresholds.compatibilityCheck.singleCheckTime}ms`);
      allPassed = false;
    }
    
    // 验证数据导入导出性能
    if (metrics.dataImportExport.smallImportTime > thresholds.dataImportExport.smallImportTime) {
      console.warn(`⚠️ 小数据导入时间过长: ${metrics.dataImportExport.smallImportTime}ms > ${thresholds.dataImportExport.smallImportTime}ms`);
      allPassed = false;
    }
    
    // 验证内存使用
    if (metrics.memoryUsage.memoryIncrease > thresholds.memoryUsage.memoryIncrease) {
      console.warn(`⚠️ 内存增长过大: ${(metrics.memoryUsage.memoryIncrease / 1024 / 1024).toFixed(2)}MB > ${(thresholds.memoryUsage.memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      allPassed = false;
    }
    
    if (allPassed) {
      console.log('✅ 所有性能指标均符合要求');
    } else {
      console.log('⚠️ 部分性能指标超出阈值，需要优化');
    }
    
    return allPassed;
  }

  async loadExternalResources(dom) {
    // 模拟外部资源加载
    return new Promise(resolve => {
      setTimeout(resolve, 500);
    });
  }
}

export default PerformanceTest;