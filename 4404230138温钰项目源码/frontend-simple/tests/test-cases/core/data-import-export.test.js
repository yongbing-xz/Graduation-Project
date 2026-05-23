import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataImportExportTest {
  constructor() {
    this.name = '数据导入导出功能测试';
    this.description = '测试数据导入导出功能的完整性和正确性';
  }

  async run() {
    const startTime = Date.now();
    let passed = true;
    let error = null;

    try {
      console.log('📊 开始数据导入导出功能测试...');
      
      // 1. 加载HTML文件
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      // 2. 等待Vue应用初始化
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. 测试数据导入功能
      passed = passed && await this.testImportFunction(dom);
      
      // 4. 测试数据导出功能
      passed = passed && await this.testExportFunction(dom);
      
      // 5. 测试数据格式验证
      passed = passed && await this.testDataValidation(dom);
      
      // 6. 测试错误处理
      passed = passed && await this.testImportExportErrorHandling(dom);

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
      description: this.description
    };
  }

  async testImportFunction(dom) {
    console.log('📥 测试数据导入功能...');
    
    try {
      const window = dom.window;
      
      // 创建测试数据
      const testDataset = {
        name: '测试配置',
        description: '测试数据导入功能',
        components: {
          cpu: [
            {
              id: 'test-cpu-1',
              category: 'cpu',
              brand: 'Intel',
              title: 'Intel Core i9-13900K',
              specs: {
                socket: 'LGA 1700',
                cores: 24,
                threads: 32,
                baseClock: 3.0,
                boostClock: 5.8
              }
            }
          ],
          mb: [
            {
              id: 'test-mb-1',
              category: 'mb',
              brand: 'ASUS',
              title: 'ASUS ROG MAXIMUS Z790 HERO',
              specs: {
                cpuSocket: 'LGA 1700',
                chipset: 'Z790',
                memorySlots: 4,
                maxMemory: 128
              }
            }
          ]
        }
      };
      
      // 测试导入功能
      const importResult = window.app.importDataset(testDataset);
      
      if (!importResult) {
        throw new Error('数据导入应该返回成功结果');
      }
      
      // 验证导入后的数据
      if (!window.app.dataset || window.app.dataset.name !== testDataset.name) {
        throw new Error('导入后数据集名称不正确');
      }
      
      // 验证组件数据
      const importedCPU = window.app.dataset.components.cpu.find(cpu => cpu.id === 'test-cpu-1');
      if (!importedCPU) {
        throw new Error('导入的CPU数据丢失');
      }
      
      const importedMB = window.app.dataset.components.mb.find(mb => mb.id === 'test-mb-1');
      if (!importedMB) {
        throw new Error('导入的主板数据丢失');
      }
      
      // 验证数据完整性
      if (importedCPU.title !== testDataset.components.cpu[0].title) {
        throw new Error('导入的CPU数据不完整');
      }
      
      console.log('✅ 数据导入功能测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 数据导入功能测试失败:', error.message);
      return false;
    }
  }

  async testExportFunction(dom) {
    console.log('📤 测试数据导出功能...');
    
    try {
      const window = dom.window;
      
      // 清空当前选择
      window.app.clearAll();
      
      // 选择一些组件
      const amdCPU = window.app.products.cpu.find(cpu => 
        cpu.specs && cpu.specs.socket && cpu.specs.socket.includes('AM5')
      );
      const amdMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('AM5')
      );
      
      if (!amdCPU || !amdMB) {
        throw new Error('找不到测试数据');
      }
      
      window.app.selected.cpu = amdCPU;
      window.app.selected.mb = amdMB;
      
      // 测试导出功能
      const exportResult = window.app.exportDataset();
      
      if (!exportResult) {
        throw new Error('数据导出应该返回有效结果');
      }
      
      // 验证导出数据的结构
      if (!exportResult.name || !exportResult.description || !exportResult.components) {
        throw new Error('导出的数据结构不完整');
      }
      
      // 验证导出的组件数据
      if (!exportResult.components.cpu || !Array.isArray(exportResult.components.cpu)) {
        throw new Error('导出的CPU数据格式错误');
      }
      
      if (!exportResult.components.mb || !Array.isArray(exportResult.components.mb)) {
        throw new Error('导出的主板数据格式错误');
      }
      
      // 验证导出的组件数量
      const exportedCPU = exportResult.components.cpu.find(cpu => cpu.id === amdCPU.id);
      if (!exportedCPU) {
        throw new Error('导出的CPU数据丢失');
      }
      
      const exportedMB = exportResult.components.mb.find(mb => mb.id === amdMB.id);
      if (!exportedMB) {
        throw new Error('导出的主板数据丢失');
      }
      
      // 验证数据完整性
      if (exportedCPU.title !== amdCPU.title) {
        throw new Error('导出的CPU数据不完整');
      }
      
      console.log('✅ 数据导出功能测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 数据导出功能测试失败:', error.message);
      return false;
    }
  }

  async testDataValidation(dom) {
    console.log('🔍 测试数据格式验证...');
    
    try {
      const window = dom.window;
      
      // 测试无效数据导入
      const invalidDataset = {
        name: '无效配置',
        description: '测试无效数据导入',
        components: 'invalid format'
      };
      
      try {
        window.app.importDataset(invalidDataset);
        throw new Error('无效数据应该抛出错误');
      } catch (error) {
        // 期望的错误处理
        if (!error.message.includes('无效') && !error.message.includes('Invalid')) {
          throw new Error('错误消息应该包含无效数据提示');
        }
      }
      
      // 测试部分缺失数据
      const partialDataset = {
        name: '部分数据',
        description: '测试部分缺失数据'
        // 缺少components字段
      };
      
      try {
        window.app.importDataset(partialDataset);
        throw new Error('部分缺失数据应该抛出错误');
      } catch (error) {
        // 期望的错误处理
        if (!error.message.includes('无效') && !error.message.includes('Invalid')) {
          throw new Error('错误消息应该包含数据缺失提示');
        }
      }
      
      // 测试空数据导入
      const emptyDataset = {
        name: '空配置',
        description: '测试空数据导入',
        components: {}
      };
      
      const emptyResult = window.app.importDataset(emptyDataset);
      if (!emptyResult) {
        throw new Error('空数据导入应该返回成功结果');
      }
      
      console.log('✅ 数据格式验证测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 数据格式验证测试失败:', error.message);
      return false;
    }
  }

  async testImportExportErrorHandling(dom) {
    console.log('🚨 测试导入导出错误处理...');
    
    try {
      const window = dom.window;
      
      // 测试大文件导入（模拟性能问题）
      const largeDataset = {
        name: '大型配置',
        description: '测试大文件导入',
        components: {
          cpu: Array(1000).fill().map((_, i) => ({
            id: `large-cpu-${i}`,
            category: 'cpu',
            brand: 'Test',
            title: `Test CPU ${i}`,
            specs: { socket: 'Test', cores: 4, threads: 8 }
          }))
        }
      };
      
      const largeResult = window.app.importDataset(largeDataset);
      if (!largeResult) {
        throw new Error('大文件导入应该返回成功结果');
      }
      
      // 验证大文件导入后的性能
      const startTime = Date.now();
      const exportResult = window.app.exportDataset();
      const exportTime = Date.now() - startTime;
      
      if (exportTime > 5000) {
        console.warn('⚠️ 大文件导出时间较长:', exportTime, 'ms');
      }
      
      // 测试特殊字符处理
      const specialCharsDataset = {
        name: '特殊字符测试',
        description: '测试特殊字符处理: <>&"\'\\n\\t',
        components: {
          cpu: [
            {
              id: 'special-cpu-1',
              category: 'cpu',
              brand: 'Intel<>&"\'',
              title: 'Intel Core i9-13900K <>&"\'',
              specs: {
                socket: 'LGA 1700<>&"\'',
                cores: 24,
                threads: 32
              }
            }
          ]
        }
      };
      
      const specialResult = window.app.importDataset(specialCharsDataset);
      if (!specialResult) {
        throw new Error('特殊字符数据导入应该返回成功结果');
      }
      
      // 验证特殊字符处理
      const exportedSpecial = window.app.exportDataset();
      if (exportedSpecial.description !== specialCharsDataset.description) {
        throw new Error('特殊字符处理不正确');
      }
      
      console.log('✅ 导入导出错误处理测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 导入导出错误处理测试失败:', error.message);
      return false;
    }
  }
}

export default DataImportExportTest;