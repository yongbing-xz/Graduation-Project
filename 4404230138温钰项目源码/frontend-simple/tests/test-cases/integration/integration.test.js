import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntegrationTest {
  constructor() {
    this.name = '集成测试';
    this.description = '测试应用各模块间的集成功能和端到端流程';
  }

  async run() {
    const startTime = Date.now();
    let passed = true;
    let error = null;

    try {
      console.log('🔗 开始集成测试...');
      
      // 1. 测试完整硬件配置流程
      passed = passed && await this.testCompleteHardwareConfiguration();
      
      // 2. 测试数据持久化流程
      passed = passed && await this.testDataPersistenceWorkflow();
      
      // 3. 测试用户交互流程
      passed = passed && await this.testUserInteractionWorkflow();
      
      // 4. 测试错误恢复流程
      passed = passed && await this.testErrorRecoveryWorkflow();
      
      // 5. 测试多环境一致性
      passed = passed && await this.testMultiEnvironmentConsistency();

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

  async testCompleteHardwareConfiguration() {
    console.log('💻 测试完整硬件配置流程...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 1. 清空当前选择
      window.app.clearAll();
      
      // 2. 选择兼容的硬件组件
      const amdCPU = window.app.products.cpu.find(cpu => 
        cpu.specs && cpu.specs.socket && cpu.specs.socket.includes('AM5')
      );
      const amdMB = window.app.products.mb.find(mb => 
        mb.specs && mb.specs.cpuSocket && mb.specs.cpuSocket.includes('AM5')
      );
      const ddr5RAM = window.app.products.ram.find(ram => 
        ram.specs && ram.specs.ddrGen && ram.specs.ddrGen.includes('DDR5')
      );
      const nvmeSSD = window.app.products.ssd.find(ssd => 
        ssd.specs && ssd.specs.interface && ssd.specs.interface.includes('NVMe')
      );
      
      if (!amdCPU || !amdMB || !ddr5RAM || !nvmeSSD) {
        throw new Error('找不到完整的测试硬件组件');
      }
      
      // 3. 按顺序选择组件（模拟真实用户操作）
      window.app.selected.cpu = amdCPU;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.app.selected.mb = amdMB;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.app.selected.ram = ddr5RAM;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.app.selected.ssd = nvmeSSD;
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 4. 验证兼容性检测结果
      const results = window.app.results;
      if (!Array.isArray(results)) {
        throw new Error('兼容性检测结果应该是数组');
      }
      
      // 检查是否有错误
      const errors = results.filter(result => result.level === 'err');
      if (errors.length > 0) {
        throw new Error(`兼容的硬件配置不应该有错误: ${errors.map(e => e.title).join(', ')}`);
      }
      
      // 5. 验证配置信息
      const configInfo = window.app.getConfigurationInfo();
      if (!configInfo || !configInfo.totalPrice || !configInfo.compatibility) {
        throw new Error('配置信息不完整');
      }
      
      // 6. 验证智能筛选状态
      if (window.app.smartFilterEnabled) {
        const incompatibleComponents = window.app.getIncompatibleComponents();
        if (incompatibleComponents && incompatibleComponents.length > 0) {
          console.warn('⚠️ 智能筛选检测到不兼容组件:', incompatibleComponents);
        }
      }
      
      console.log('✅ 完整硬件配置流程测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 完整硬件配置流程测试失败:', error.message);
      return false;
    }
  }

  async testDataPersistenceWorkflow() {
    console.log('💾 测试数据持久化流程...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 1. 创建测试配置
      const testConfig = {
        name: '集成测试配置',
        description: '数据持久化流程测试',
        components: {
          cpu: [window.app.products.cpu[0]],
          mb: [window.app.products.mb[0]],
          ram: [window.app.products.ram[0]]
        }
      };
      
      // 2. 导入配置
      const importResult = window.app.importDataset(testConfig);
      if (!importResult) {
        throw new Error('数据导入失败');
      }
      
      // 3. 验证导入后的数据
      if (window.app.dataset.name !== testConfig.name) {
        throw new Error('导入的数据集名称不正确');
      }
      
      // 4. 导出配置
      const exportResult = window.app.exportDataset();
      if (!exportResult) {
        throw new Error('数据导出失败');
      }
      
      // 5. 验证导出的数据
      if (exportResult.name !== testConfig.name) {
        throw new Error('导出的数据集名称不正确');
      }
      
      if (!exportResult.components.cpu || !Array.isArray(exportResult.components.cpu)) {
        throw new Error('导出的CPU数据格式错误');
      }
      
      // 6. 测试本地存储（模拟）
      const localStorageKey = 'hardware-config-test';
      const testData = { timestamp: Date.now(), config: exportResult };
      
      // 模拟localStorage.setItem
      if (window.localStorage) {
        window.localStorage.setItem(localStorageKey, JSON.stringify(testData));
      }
      
      // 模拟localStorage.getItem
      if (window.localStorage) {
        const storedData = window.localStorage.getItem(localStorageKey);
        if (!storedData) {
          throw new Error('数据存储失败');
        }
        
        const parsedData = JSON.parse(storedData);
        if (parsedData.config.name !== testConfig.name) {
          throw new Error('存储的数据不正确');
        }
      }
      
      console.log('✅ 数据持久化流程测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 数据持久化流程测试失败:', error.message);
      return false;
    }
  }

  async testUserInteractionWorkflow() {
    console.log('👤 测试用户交互流程...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      const document = dom.window.document;
      
      // 1. 测试组件选择模态框
      const cpuCard = document.querySelector('.card:nth-child(1)');
      if (cpuCard) {
        // 模拟点击事件
        const clickEvent = new window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        cpuCard.dispatchEvent(clickEvent);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 检查模态框是否打开
        const modal = document.querySelector('.modal');
        if (!modal || modal.style.display === 'none') {
          throw new Error('组件选择模态框未正确打开');
        }
      }
      
      // 2. 测试搜索功能
      const searchInput = document.querySelector('input[type="text"]');
      if (searchInput) {
        // 模拟输入事件
        searchInput.value = 'Intel';
        const inputEvent = new window.Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 检查搜索结果
        const searchResults = window.app.getSearchResults ? window.app.getSearchResults() : [];
        if (searchResults.length === 0) {
          console.warn('⚠️ 搜索功能可能未正确实现');
        }
      }
      
      // 3. 测试智能筛选切换
      const smartFilterToggle = document.querySelector('input[type="checkbox"]');
      if (smartFilterToggle) {
        // 模拟切换事件
        smartFilterToggle.checked = !smartFilterToggle.checked;
        const changeEvent = new window.Event('change', { bubbles: true });
        smartFilterToggle.dispatchEvent(changeEvent);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 验证智能筛选状态
        if (window.app.smartFilterEnabled !== smartFilterToggle.checked) {
          throw new Error('智能筛选状态未正确更新');
        }
      }
      
      // 4. 测试清空功能
      const clearButton = document.querySelector('button');
      if (clearButton && clearButton.textContent.includes('清空')) {
        // 先选择一些组件
        window.app.selected.cpu = window.app.products.cpu[0];
        window.app.selected.mb = window.app.products.mb[0];
        
        // 模拟点击清空按钮
        const clickEvent = new window.MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        clearButton.dispatchEvent(clickEvent);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 验证清空结果
        if (window.app.selected.cpu || window.app.selected.mb) {
          throw new Error('清空功能未正确工作');
        }
      }
      
      console.log('✅ 用户交互流程测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 用户交互流程测试失败:', error.message);
      return false;
    }
  }

  async testErrorRecoveryWorkflow() {
    console.log('🔄 测试错误恢复流程...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 1. 测试无效数据导入的恢复
      const invalidDataset = {
        name: '无效数据',
        description: '测试错误恢复',
        components: 'invalid format'
      };
      
      let importError = false;
      try {
        window.app.importDataset(invalidDataset);
      } catch (error) {
        importError = true;
        // 验证错误处理
        if (!error.message) {
          throw new Error('错误处理未提供有效消息');
        }
      }
      
      if (!importError) {
        throw new Error('无效数据导入应该抛出错误');
      }
      
      // 2. 验证应用状态未受影响
      const currentResults = window.app.results;
      if (!Array.isArray(currentResults)) {
        throw new Error('错误恢复后应用状态异常');
      }
      
      // 3. 测试部分数据损坏的恢复
      const corruptedDataset = {
        name: '损坏数据',
        description: '测试部分数据损坏恢复',
        components: {
          cpu: [
            {
              id: 'corrupted-cpu',
              category: 'cpu',
              brand: 'Intel',
              title: 'Corrupted CPU',
              specs: null // 损坏的规格数据
            }
          ]
        }
      };
      
      try {
        window.app.importDataset(corruptedDataset);
        
        // 验证应用能够处理损坏数据
        const resultsAfterCorruption = window.app.results;
        if (!Array.isArray(resultsAfterCorruption)) {
          throw new Error('损坏数据处理后应用状态异常');
        }
        
        // 检查是否有适当的错误提示
        const hasWarnings = resultsAfterCorruption.some(result => 
          result.level === 'warn' || result.level === 'err'
        );
        
        if (!hasWarnings && resultsAfterCorruption.length > 0) {
          console.warn('⚠️ 损坏数据处理可能未生成适当的警告');
        }
        
      } catch (error) {
        // 损坏数据可能被正确处理或抛出错误
        console.log('损坏数据处理结果:', error.message);
      }
      
      // 4. 测试应用重置功能
      window.app.clearAll();
      
      const resetResults = window.app.results;
      if (!Array.isArray(resetResults)) {
        throw new Error('重置后应用状态异常');
      }
      
      // 验证重置后的默认状态
      const hasDefaultMessage = resetResults.some(result => 
        result.title && result.title.includes('选择')
      );
      
      if (!hasDefaultMessage && resetResults.length === 0) {
        throw new Error('重置后未显示默认提示信息');
      }
      
      console.log('✅ 错误恢复流程测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 错误恢复流程测试失败:', error.message);
      return false;
    }
  }

  async testMultiEnvironmentConsistency() {
    console.log('🌐 测试多环境一致性...');
    
    try {
      // 模拟不同环境的测试
      const environments = ['development', 'testing', 'production'];
      const results = {};
      
      for (const env of environments) {
        console.log(`测试环境: ${env}`);
        
        const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
        const dom = new JSDOM(htmlContent, {
          runScripts: 'dangerously',
          resources: 'usable'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const window = dom.window;
        
        // 在不同环境中执行相同的测试用例
        const testConfig = {
          name: `一致性测试-${env}`,
          description: '多环境一致性测试',
          components: {
            cpu: [window.app.products.cpu[0]],
            mb: [window.app.products.mb[0]]
          }
        };
        
        // 导入配置
        const importResult = window.app.importDataset(testConfig);
        
        // 导出配置
        const exportResult = window.app.exportDataset();
        
        // 验证兼容性检测
        const compatibilityResults = window.app.results;
        
        results[env] = {
          importSuccess: !!importResult,
          exportSuccess: !!exportResult,
          compatibilityResults: Array.isArray(compatibilityResults),
          datasetName: window.app.dataset ? window.app.dataset.name : null
        };
      }
      
      // 验证环境间的一致性
      const envKeys = Object.keys(results);
      const firstEnv = results[envKeys[0]];
      
      for (let i = 1; i < envKeys.length; i++) {
        const currentEnv = results[envKeys[i]];
        
        // 检查关键功能的一致性
        if (firstEnv.importSuccess !== currentEnv.importSuccess) {
          throw new Error(`导入功能在不同环境不一致: ${envKeys[0]} vs ${envKeys[i]}`);
        }
        
        if (firstEnv.exportSuccess !== currentEnv.exportSuccess) {
          throw new Error(`导出功能在不同环境不一致: ${envKeys[0]} vs ${envKeys[i]}`);
        }
        
        if (firstEnv.compatibilityResults !== currentEnv.compatibilityResults) {
          throw new Error(`兼容性检测在不同环境不一致: ${envKeys[0]} vs ${envKeys[i]}`);
        }
      }
      
      console.log('✅ 多环境一致性测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 多环境一致性测试失败:', error.message);
      return false;
    }
  }
}

export default IntegrationTest;