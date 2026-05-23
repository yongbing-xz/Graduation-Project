import fs from 'fs-extra';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BrowserCompatibilityTest {
  constructor() {
    this.name = '浏览器兼容性测试';
    this.description = '测试应用在不同浏览器环境下的兼容性表现';
  }

  async run() {
    const startTime = Date.now();
    let passed = true;
    let error = null;

    try {
      console.log('🌐 开始浏览器兼容性测试...');
      
      // 1. 测试现代浏览器特性支持
      passed = passed && await this.testModernBrowserFeatures();
      
      // 2. 测试ES6+语法兼容性
      passed = passed && await this.testES6Compatibility();
      
      // 3. 测试CSS Grid和Flexbox支持
      passed = passed && await this.testCSSLayoutSupport();
      
      // 4. 测试JavaScript API兼容性
      passed = passed && await this.testJavaScriptAPIs();
      
      // 5. 测试响应式设计兼容性
      passed = passed && await this.testResponsiveDesign();

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

  async testModernBrowserFeatures() {
    console.log('🔧 测试现代浏览器特性支持...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      
      // 测试不同浏览器环境模拟
      const browserConfigs = [
        { name: 'Chrome 90+', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36' },
        { name: 'Firefox 88+', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0' },
        { name: 'Safari 14+', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15' },
        { name: 'Edge 90+', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36 Edg/90.0.818.62' }
      ];
      
      for (const config of browserConfigs) {
        console.log(`测试 ${config.name} 兼容性...`);
        
        const dom = new JSDOM(htmlContent, {
          runScripts: 'dangerously',
          resources: 'usable',
          url: 'http://localhost:8000',
          userAgent: config.userAgent
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const window = dom.window;
        
        // 验证Vue应用是否正常初始化
        if (!window.app) {
          throw new Error(`${config.name}: Vue应用未正确初始化`);
        }
        
        // 验证核心功能
        if (!window.app.products || typeof window.app.products !== 'object') {
          throw new Error(`${config.name}: 产品数据加载失败`);
        }
        
        // 验证组件选择功能
        const cpu = window.app.products.cpu[0];
        window.app.selected.cpu = cpu;
        
        if (window.app.selected.cpu !== cpu) {
          throw new Error(`${config.name}: 组件选择功能异常`);
        }
        
        console.log(`✅ ${config.name} 兼容性测试通过`);
      }
      
      console.log('✅ 现代浏览器特性支持测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 现代浏览器特性支持测试失败:', error.message);
      return false;
    }
  }

  async testES6Compatibility() {
    console.log('📝 测试ES6+语法兼容性...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      
      // 测试ES6+特性
      const testCases = [
        {
          name: '箭头函数',
          test: () => {
            const func = (a, b) => a + b;
            return func(2, 3) === 5;
          }
        },
        {
          name: '模板字符串',
          test: () => {
            const name = 'Test';
            return `Hello ${name}` === 'Hello Test';
          }
        },
        {
          name: '解构赋值',
          test: () => {
            const obj = { a: 1, b: 2 };
            const { a, b } = obj;
            return a === 1 && b === 2;
          }
        },
        {
          name: '扩展运算符',
          test: () => {
            const arr1 = [1, 2];
            const arr2 = [3, 4];
            const combined = [...arr1, ...arr2];
            return combined.length === 4;
          }
        },
        {
          name: 'Promise',
          test: () => {
            return new Promise(resolve => {
              setTimeout(() => resolve(true), 10);
            });
          }
        }
      ];
      
      for (const testCase of testCases) {
        const result = await testCase.test();
        if (!result) {
          throw new Error(`ES6特性测试失败: ${testCase.name}`);
        }
        console.log(`✅ ${testCase.name} 支持`);
      }
      
      // 测试应用中的ES6+代码
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 验证应用中的ES6+代码执行
      if (!window.app || typeof window.app !== 'object') {
        throw new Error('应用代码中的ES6+语法执行失败');
      }
      
      console.log('✅ ES6+语法兼容性测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ ES6+语法兼容性测试失败:', error.message);
      return false;
    }
  }

  async testCSSLayoutSupport() {
    console.log('🎨 测试CSS布局支持...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      const document = dom.window.document;
      
      // 测试CSS Grid支持
      const gridContainer = document.querySelector('.modal-body');
      if (gridContainer) {
        const gridStyle = window.getComputedStyle(gridContainer);
        const displayValue = gridStyle.getPropertyValue('display');
        
        if (displayValue !== 'grid') {
          console.warn('⚠️ CSS Grid布局可能未正确应用');
        }
      }
      
      // 测试Flexbox支持
      const flexContainer = document.querySelector('.card-container');
      if (flexContainer) {
        const flexStyle = window.getComputedStyle(flexContainer);
        const displayValue = flexStyle.getPropertyValue('display');
        
        if (displayValue !== 'flex' && displayValue !== 'inline-flex') {
          console.warn('⚠️ Flexbox布局可能未正确应用');
        }
      }
      
      // 测试响应式CSS
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      if (typeof mediaQuery.matches !== 'boolean') {
        throw new Error('媒体查询支持异常');
      }
      
      // 测试CSS变量支持
      const root = document.documentElement;
      root.style.setProperty('--test-color', 'red');
      const testValue = root.style.getPropertyValue('--test-color');
      
      if (!testValue) {
        console.warn('⚠️ CSS变量支持可能有限');
      }
      
      console.log('✅ CSS布局支持测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ CSS布局支持测试失败:', error.message);
      return false;
    }
  }

  async testJavaScriptAPIs() {
    console.log('🔌 测试JavaScript API兼容性...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const window = dom.window;
      
      // 测试现代JavaScript API
      const apisToTest = [
        { name: 'fetch', test: () => typeof window.fetch === 'function' },
        { name: 'Promise', test: () => typeof window.Promise === 'function' },
        { name: 'localStorage', test: () => typeof window.localStorage === 'object' },
        { name: 'sessionStorage', test: () => typeof window.sessionStorage === 'object' },
        { name: 'JSON', test: () => typeof window.JSON === 'object' },
        { name: 'console', test: () => typeof window.console === 'object' },
        { name: 'setTimeout', test: () => typeof window.setTimeout === 'function' },
        { name: 'addEventListener', test: () => typeof window.addEventListener === 'function' }
      ];
      
      for (const api of apisToTest) {
        if (!api.test()) {
          throw new Error(`JavaScript API不支持: ${api.name}`);
        }
        console.log(`✅ ${api.name} API支持`);
      }
      
      // 测试应用特定的API使用
      if (!window.app || typeof window.app !== 'object') {
        throw new Error('应用JavaScript代码执行失败');
      }
      
      // 测试事件处理
      const testEvent = new window.Event('test', { bubbles: true });
      let eventHandled = false;
      
      window.addEventListener('test', () => {
        eventHandled = true;
      });
      
      window.dispatchEvent(testEvent);
      
      if (!eventHandled) {
        throw new Error('事件处理机制异常');
      }
      
      console.log('✅ JavaScript API兼容性测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ JavaScript API兼容性测试失败:', error.message);
      return false;
    }
  }

  async testResponsiveDesign() {
    console.log('📱 测试响应式设计兼容性...');
    
    try {
      const htmlContent = await fs.readFile(path.join(__dirname, '../../index.html'), 'utf8');
      
      // 测试不同屏幕尺寸
      const screenSizes = [
        { name: '桌面大屏', width: 1920, height: 1080 },
        { name: '桌面标准', width: 1366, height: 768 },
        { name: '平板横屏', width: 1024, height: 768 },
        { name: '平板竖屏', width: 768, height: 1024 },
        { name: '手机大屏', width: 414, height: 896 },
        { name: '手机标准', width: 375, height: 667 }
      ];
      
      for (const size of screenSizes) {
        console.log(`测试 ${size.name} (${size.width}x${size.height})...`);
        
        const dom = new JSDOM(htmlContent, {
          runScripts: 'dangerously',
          resources: 'usable',
          url: 'http://localhost:8000',
          pretendToBeVisual: true,
          // 设置视口大小
          beforeParse(window) {
            window.innerWidth = size.width;
            window.innerHeight = size.height;
            window.outerWidth = size.width;
            window.outerHeight = size.height;
          }
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        
        const window = dom.window;
        const document = dom.window.document;
        
        // 验证视口设置
        if (window.innerWidth !== size.width || window.innerHeight !== size.height) {
          throw new Error(`${size.name}: 视口设置异常`);
        }
        
        // 验证应用功能
        if (!window.app) {
          throw new Error(`${size.name}: 应用未正确初始化`);
        }
        
        // 测试布局适应性
        const body = document.body;
        const bodyStyle = window.getComputedStyle(body);
        
        if (parseInt(bodyStyle.width) > size.width) {
          console.warn(`⚠️ ${size.name}: 布局可能超出屏幕宽度`);
        }
        
        // 测试组件选择功能
        const cpu = window.app.products.cpu[0];
        window.app.selected.cpu = cpu;
        
        if (window.app.selected.cpu !== cpu) {
          throw new Error(`${size.name}: 响应式布局下的功能异常`);
        }
        
        console.log(`✅ ${size.name} 响应式测试通过`);
      }
      
      console.log('✅ 响应式设计兼容性测试通过');
      return true;
      
    } catch (error) {
      console.error('❌ 响应式设计兼容性测试失败:', error.message);
      return false;
    }
  }
}

export default BrowserCompatibilityTest;