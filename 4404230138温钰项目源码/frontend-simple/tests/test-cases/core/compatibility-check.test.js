import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompatibilityCheckTest {
  constructor() {
    this.name = '兼容性检测功能测试';
    this.description = '测试硬件组件兼容性检测算法的正确性';
  }

  async run() {
    const startTime = Date.now();
    let passed = true;
    let error = null;

    try {
      console.log('🔧 开始兼容性检测功能测试...');
      
      // 1. 加载HTML文件
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      // 2. 等待Vue应用初始化
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. 测试兼容性检测算法
      passed = passed && await this.testCompatibilityAlgorithm(dom);
      
      // 4. 测试智能筛选功能
      passed = passed && await this.testSmartFilter(dom);
      
      // 5. 测试检测结果生成
      passed = passed && await this.testResultGeneration(dom);
      
      // 6. 测试错误处理
      passed = passed && await this.testErrorHandling(dom);

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

  async testCompatibilityAlgorithm(dom) {
    console.log('⚙️ 测试兼容性检测算法...');
    
    try {
      const window = dom.window;
      
      // 测试CPU和主板兼容性
      const amdCPU = window.app.products.cpu.find(cpu => 
        cpu.specs && cpu.specs.socket && cpu.specs.socket.includes('AM5')
      );
      const amdMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('AM5')
      );
      
      if (!amdCPU || !amdMB) {
        throw new Error('找不到AM5平台的测试数据');
      }
      
      // 测试兼容组合
      const compatible = window.app.isComponentCompatible('cpu', amdCPU, amdMB);
      if (!compatible) {
        throw new Error('AM5 CPU和主板应该兼容');
      }
      
      // 测试不兼容组合
      const intelMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('LGA 1700')
      );
      
      if (intelMB) {
        const incompatible = window.app.isComponentCompatible('cpu', amdCPU, intelMB);
        if (incompatible) {
          throw new Error('AMD CPU和Intel主板应该不兼容');
        }
      }
      
      // 测试内存兼容性
      const ddr5RAM = window.app.products.ram.find(ram => 
        ram.specs && ram.specs.ddrGen && ram.specs.ddrGen.includes('DDR5')
      );
      
      if (ddr5RAM && amdMB) {
        const ramCompatible = window.app.isComponentCompatible('ram', ddr5RAM, amdMB);
        if (!ramCompatible) {
          throw new Error('DDR5内存和AM5主板应该兼容');
        }
      }
      
      console.log('✅ 兼容性检测算法测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 兼容性检测算法测试失败:', error.message);
      return false;
    }
  }

  async testSmartFilter(dom) {
    console.log('🧠 测试智能筛选功能...');
    
    try {
      const window = dom.window;
      
      // 启用智能筛选
      window.app.smartFilterEnabled = true;
      
      // 选择兼容的CPU和主板
      const amdCPU = window.app.products.cpu.find(cpu => 
        cpu.specs && cpu.specs.socket && cpu.specs.socket.includes('AM5')
      );
      const amdMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('AM5')
      );
      
      window.app.selected.cpu = amdCPU;
      window.app.selected.mb = amdMB;
      
      // 验证智能筛选状态
      const cpuCard = dom.window.document.querySelector('.card:nth-child(1)');
      if (cpuCard && cpuCard.classList.contains('disabled')) {
        throw new Error('兼容的CPU不应该被禁用');
      }
      
      // 测试不兼容情况
      const intelMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('LGA 1700')
      );
      
      if (intelMB) {
        window.app.selected.mb = intelMB;
        
        // 等待Vue更新DOM
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const disabledCPUCard = dom.window.document.querySelector('.card:nth-child(1)');
        if (disabledCPUCard && !disabledCPUCard.classList.contains('disabled')) {
          throw new Error('不兼容的CPU应该被禁用');
        }
      }
      
      // 禁用智能筛选
      window.app.smartFilterEnabled = false;
      
      console.log('✅ 智能筛选功能测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 智能筛选功能测试失败:', error.message);
      return false;
    }
  }

  async testResultGeneration(dom) {
    console.log('📋 测试检测结果生成...');
    
    try {
      const window = dom.window;
      
      // 清空选择
      window.app.clearAll();
      
      // 测试空选择的结果
      const emptyResults = window.app.results;
      if (!Array.isArray(emptyResults) || emptyResults.length === 0) {
        throw new Error('空选择应该生成提示信息');
      }
      
      // 选择兼容的组合
      const amdCPU = window.app.products.cpu.find(cpu => 
        cpu.specs && cpu.specs.socket && cpu.specs.socket.includes('AM5')
      );
      const amdMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('AM5')
      );
      const ddr5RAM = window.app.products.ram.find(ram => 
        ram.specs && ram.specs.ddrGen && ram.specs.ddrGen.includes('DDR5')
      );
      
      window.app.selected.cpu = amdCPU;
      window.app.selected.mb = amdMB;
      window.app.selected.ram = ddr5RAM;
      
      // 验证检测结果
      const results = window.app.results;
      if (!Array.isArray(results)) {
        throw new Error('检测结果应该是数组');
      }
      
      // 检查是否有错误级别的结果
      const hasErrors = results.some(result => result.level === 'err');
      if (hasErrors) {
        throw new Error('兼容的组合不应该有错误级别的检测结果');
      }
      
      // 检查是否有成功提示
      const hasSuccess = results.some(result => 
        result.level === 'ok' && result.title.includes('可行')
      );
      
      if (!hasSuccess && results.length > 0) {
        throw new Error('兼容的组合应该生成成功提示');
      }
      
      console.log('✅ 检测结果生成测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 检测结果生成测试失败:', error.message);
      return false;
    }
  }

  async testErrorHandling(dom) {
    console.log('🚨 测试错误处理...');
    
    try {
      const window = dom.window;
      
      // 测试无效数据
      window.app.selected.cpu = { invalid: 'data' };
      
      // 验证错误处理
      const results = window.app.results;
      if (!Array.isArray(results)) {
        throw new Error('错误处理应该返回有效的结果数组');
      }
      
      // 测试边界情况
      window.app.selected.cpu = null;
      window.app.selected.mb = window.app.products.mb[0];
      
      const partialResults = window.app.results;
      const hasWarnings = partialResults.some(result => result.level === 'warn');
      
      if (!hasWarnings && partialResults.length > 0) {
        throw new Error('部分选择应该生成警告信息');
      }
      
      // 恢复正常状态
      window.app.clearAll();
      
      console.log('✅ 错误处理测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 错误处理测试失败:', error.message);
      return false;
    }
  }
}

export default CompatibilityCheckTest;