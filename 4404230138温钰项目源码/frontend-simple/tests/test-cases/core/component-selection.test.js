import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComponentSelectionTest {
  constructor() {
    this.name = '组件选择功能测试';
    this.description = '测试硬件组件的选择、显示和交互功能';
  }

  async run() {
    const startTime = Date.now();
    let passed = true;
    let error = null;

    try {
      console.log('🔍 开始组件选择功能测试...');
      
      // 1. 加载HTML文件
      const htmlContent = await fs.readFile(path.join(__dirname, '../../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      // 2. 等待Vue应用初始化
      await new Promise(resolve => {
        // Wait for app to be initialized
        const checkApp = () => {
          if (dom.window.app) {
            console.log('✅ Vue应用已初始化');
            resolve();
          } else {
            console.log('⏰ 等待Vue应用初始化...');
            setTimeout(checkApp, 500);
          }
        };
        checkApp();
        
        // Timeout after 5 seconds
        setTimeout(() => {
          console.log('⚠️  Vue应用初始化超时');
          resolve(); // 继续执行，让后续测试处理错误
        }, 5000);
      });

      // 3. 测试组件数据加载
      passed = passed && await this.testDataLoading(dom);
      
      // 4. 测试组件选择功能
      passed = passed && await this.testSelectionFunctionality(dom);
      
      // 5. 测试模态框显示
      passed = passed && await this.testModalDisplay(dom);
      
      // 6. 测试搜索功能
      passed = passed && await this.testSearchFunctionality(dom);
      
      // 7. 测试清空功能
      passed = passed && await this.testClearFunctionality(dom);

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

  async testDataLoading(dom) {
    console.log('📊 测试数据加载...');
    
    try {
      const window = dom.window;
      const document = window.document;
      
      // 检查Vue实例是否创建
      if (!window.app) {
        throw new Error('Vue应用未正确初始化');
      }
      
      // 检查产品数据是否加载
      const products = window.app.products;
      if (!products || Object.keys(products).length === 0) {
        throw new Error('产品数据未正确加载');
      }
      
      // 验证各组件类别是否存在数据
      const requiredCategories = ['cpu', 'mb', 'gpu', 'ram', 'nvme', 'case'];
      for (const category of requiredCategories) {
        if (!products[category] || !Array.isArray(products[category])) {
          throw new Error(`缺少${category}组件数据`);
        }
        if (products[category].length === 0) {
          throw new Error(`${category}组件数据为空`);
        }
      }
      
      console.log('✅ 数据加载测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 数据加载测试失败:', error.message);
      return false;
    }
  }

  async testSelectionFunctionality(dom) {
    console.log('🎯 测试组件选择功能...');
    
    try {
      const window = dom.window;
      const document = window.document;
      
      // 模拟选择CPU组件
      const cpuData = window.app.products.cpu[0];
      window.app.selected.cpu = cpuData;
      
      // 验证选择是否正确应用
      if (window.app.selected.cpu !== cpuData) {
        throw new Error('CPU选择功能异常');
      }
      
      // 测试选择状态显示
      const cpuCard = document.querySelector('.card:nth-child(1) .status');
      if (!cpuCard || !cpuCard.textContent.includes(cpuData.title)) {
        throw new Error('CPU选择状态显示异常');
      }
      
      // 测试多个组件选择
      const mbData = window.app.products.mb[0];
      window.app.selected.mb = mbData;
      
      if (window.app.selected.mb !== mbData) {
        throw new Error('主板选择功能异常');
      }
      
      console.log('✅ 组件选择功能测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 组件选择功能测试失败:', error.message);
      return false;
    }
  }

  async testModalDisplay(dom) {
    console.log('📱 测试模态框显示...');
    
    try {
      const window = dom.window;
      const document = window.document;
      
      // 模拟打开CPU选择器
      window.app.openPicker('cpu');
      
      // 验证模态框状态
      if (!window.app.showModal) {
        throw new Error('模态框未正确打开');
      }
      
      if (window.app.activePicker !== 'cpu') {
        throw new Error('激活的选择器类型不正确');
      }
      
      // 验证模态框标题
      const modalTitle = document.querySelector('.modal h3');
      if (!modalTitle || !modalTitle.textContent.includes('CPU')) {
        throw new Error('模态框标题显示异常');
      }
      
      // 测试关闭模态框
      window.app.closeModal();
      
      if (window.app.showModal) {
        throw new Error('模态框未正确关闭');
      }
      
      console.log('✅ 模态框显示测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 模态框显示测试失败:', error.message);
      return false;
    }
  }

  async testSearchFunctionality(dom) {
    console.log('🔍 测试搜索功能...');
    
    try {
      const window = dom.window;
      
      // 打开CPU选择器
      window.app.openPicker('cpu');
      
      // 设置搜索关键词
      window.app.modalFilters.query = 'AMD';
      window.app.modalFilters.category = 'cpu';
      
      // 验证搜索结果
      const filteredList = window.app.filteredListForModal;
      if (!Array.isArray(filteredList)) {
        throw new Error('搜索结果不是数组');
      }
      
      // 验证搜索过滤
      const hasAMD = filteredList.some(item => 
        item.title && item.title.includes('AMD') ||
        item.brand && item.brand.includes('AMD')
      );
      
      if (!hasAMD && filteredList.length > 0) {
        throw new Error('搜索过滤功能异常');
      }
      
      // 测试清空搜索
      window.app.modalFilters.query = '';
      const allList = window.app.filteredListForModal;
      
      if (allList.length <= filteredList.length && filteredList.length > 0) {
        throw new Error('清空搜索功能异常');
      }
      
      window.app.closeModal();
      
      console.log('✅ 搜索功能测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 搜索功能测试失败:', error.message);
      return false;
    }
  }

  async testClearFunctionality(dom) {
    console.log('🗑️ 测试清空功能...');
    
    try {
      const window = dom.window;
      
      // 先选择一些组件
      window.app.selected.cpu = window.app.products.cpu[0];
      window.app.selected.mb = window.app.products.mb[0];
      window.app.selected.ram = window.app.products.ram[0];
      
      // 验证选择状态
      const selectedCount = Object.values(window.app.selected).filter(Boolean).length;
      if (selectedCount !== 3) {
        throw new Error('组件选择状态异常');
      }
      
      // 执行清空操作
      window.app.clearAll();
      
      // 验证清空结果
      const clearedCount = Object.values(window.app.selected).filter(Boolean).length;
      if (clearedCount !== 0) {
        throw new Error('清空功能异常');
      }
      
      console.log('✅ 清空功能测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 清空功能测试失败:', error.message);
      return false;
    }
  }
}

export default ComponentSelectionTest;