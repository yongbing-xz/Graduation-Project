# 测试与验证指南

## 概述

本文档提供硬件兼容性检测平台的完整测试策略和验证流程，确保软件质量和功能稳定性。

## 1. 测试策略

### 1.1 测试层级

#### 单元测试 (Unit Testing)
- **目标**: 验证单个函数和模块的正确性
- **范围**: 数据管理、验证规则、工具函数
- **工具**: Jest, Mocha, 或原生测试框架

#### 集成测试 (Integration Testing)
- **目标**: 验证模块间交互的正确性
- **范围**: 组件选择器与验证引擎的集成
- **工具**: 自定义测试框架

#### 端到端测试 (E2E Testing)
- **目标**: 验证完整用户流程
- **范围**: 从组件选择到兼容性检测的完整流程
- **工具**: Cypress, Playwright, Selenium

#### 兼容性测试 (Compatibility Testing)
- **目标**: 验证不同浏览器和设备上的表现
- **范围**: 主流浏览器和移动设备
- **工具**: BrowserStack, Sauce Labs

### 1.2 测试自动化

#### 持续集成流程
```yaml
# GitHub Actions 示例
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

## 2. 单元测试

### 2.1 数据管理模块测试

#### 测试用例设计
```javascript
// tests/data-manager.test.js
describe('DataManager', () => {
  let dataManager;
  
  beforeEach(() => {
    dataManager = new DataManager();
    // 清空测试数据
    localStorage.clear();
  });
  
  test('should save and load data correctly', () => {
    const testData = { components: [], config: {} };
    
    // 保存数据
    const saveResult = dataManager.saveData('test', testData);
    expect(saveResult).toBe(true);
    
    // 加载数据
    const loadedData = dataManager.loadData('test');
    expect(loadedData).toEqual(testData);
  });
  
  test('should handle missing data gracefully', () => {
    const loadedData = dataManager.loadData('nonexistent');
    expect(loadedData).toBeNull();
  });
  
  test('should validate data format', () => {
    const invalidData = 'invalid';
    const saveResult = dataManager.saveData('test', invalidData);
    expect(saveResult).toBe(false);
  });
});
```

### 2.2 验证规则测试

#### 验证规则测试用例
```javascript
// tests/validation-rules.test.js
describe('Validation Rules', () => {
  describe('SocketCompatibilityRule', () => {
    let rule;
    
    beforeEach(() => {
      rule = new SocketCompatibilityRule();
    });
    
    test('should pass when CPU and motherboard sockets match', () => {
      const components = {
        cpu: { 接口: 'LGA1700' },
        motherboard: { 接口: 'LGA1700' }
      };
      
      const result = rule.validate(components);
      expect(result.passed).toBe(true);
    });
    
    test('should fail when sockets do not match', () => {
      const components = {
        cpu: { 接口: 'LGA1700' },
        motherboard: { 接口: 'AM4' }
      };
      
      const result = rule.validate(components);
      expect(result.passed).toBe(false);
      expect(result.message).toContain('不匹配');
    });
    
    test('should handle missing components gracefully', () => {
      const components = { cpu: { 接口: 'LGA1700' } };
      
      const result = rule.validate(components);
      expect(result.passed).toBe(true);
      expect(result.message).toContain('缺少必要组件');
    });
  });
});
```

### 2.3 工具函数测试

#### 工具函数测试用例
```javascript
// tests/utils.test.js
describe('Utility Functions', () => {
  describe('toNumber function', () => {
    test('should convert string numbers to numbers', () => {
      expect(toNumber('123')).toBe(123);
      expect(toNumber('3.14')).toBe(3.14);
    });
    
    test('should handle invalid inputs', () => {
      expect(toNumber('abc')).toBe(0);
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
    });
    
    test('should return number as is', () => {
      expect(toNumber(456)).toBe(456);
    });
  });
  
  describe('shortMeta function', () => {
    test('should extract CPU specifications correctly', () => {
      const cpu = {
        标题: 'Intel Core i7-12700K',
        核心: '12',
        线程: '20',
        主频: '3.6GHz',
        加速频率: '5.0GHz'
      };
      
      const result = shortMeta(cpu, 'cpu');
      expect(result).toContain('12核20线程');
      expect(result).toContain('3.6GHz');
    });
    
    test('should handle alternative field names', () => {
      const cpu = {
        title: 'AMD Ryzen 7 5800X',
        cores: '8',
        threads: '16',
        baseClock: '3.8GHz',
        boostClock: '4.7GHz'
      };
      
      const result = shortMeta(cpu, 'cpu');
      expect(result).toContain('8核16线程');
    });
  });
});
```

## 3. 集成测试

### 3.1 组件选择器集成测试

#### 测试场景设计
```javascript
// tests/integration/component-selector.test.js
describe('Component Selector Integration', () => {
  let selector;
  let validationEngine;
  
  beforeEach(() => {
    validationEngine = new ValidationEngine();
    selector = new ComponentSelector({
      validationEngine: validationEngine,
      onComponentSelected: jest.fn(),
      onCompatibilityCheck: jest.fn()
    });
    
    // 注册验证规则
    validationEngine.registerRule(new SocketCompatibilityRule());
    validationEngine.registerRule(new MemoryCompatibilityRule());
  });
  
  test('should trigger compatibility check on component selection', async () => {
    const cpu = { 接口: 'LGA1700', 标题: 'Test CPU' };
    const motherboard = { 接口: 'LGA1700', 标题: 'Test Motherboard' };
    
    // 选择 CPU
    await selector.selectComponent('cpu', cpu);
    
    // 选择主板
    await selector.selectComponent('motherboard', motherboard);
    
    // 验证兼容性检查被触发
    expect(validationEngine.validateAll).toHaveBeenCalled();
  });
  
  test('should handle incompatible components', async () => {
    const cpu = { 接口: 'LGA1700' };
    const motherboard = { 接口: 'AM4' };
    
    await selector.selectComponent('cpu', cpu);
    await selector.selectComponent('motherboard', motherboard);
    
    // 验证错误处理
    expect(selector.onCompatibilityCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        results: expect.arrayContaining([
          expect.objectContaining({ passed: false })
        ])
      })
    );
  });
});
```

### 3.2 数据导入导出集成测试

```javascript
// tests/integration/data-import-export.test.js
describe('Data Import/Export Integration', () => {
  let dataManager;
  let importExport;
  
  beforeEach(() => {
    dataManager = new DataManager();
    importExport = new ImportExportManager({ dataManager });
  });
  
  test('should import data and update component list', async () => {
    const testData = {
      components: {
        cpu: [
          { 标题: 'Test CPU 1', 接口: 'LGA1700' },
          { 标题: 'Test CPU 2', 接口: 'AM4' }
        ]
      }
    };
    
    const importResult = await importExport.importFromJSON(JSON.stringify(testData));
    
    expect(importResult.success).toBe(true);
    expect(importResult.summary.imported).toBe(2);
    
    // 验证数据已保存
    const savedData = dataManager.loadData('hardware_component_data');
    expect(savedData.cpu).toHaveLength(2);
  });
  
  test('should export current configuration', async () => {
    // 设置测试数据
    const testConfig = { theme: 'dark', language: 'zh-CN' };
    dataManager.saveData('user_configuration', testConfig);
    
    const exportResult = await importExport.exportConfiguration();
    
    expect(exportResult.config).toEqual(testConfig);
    expect(exportResult.timestamp).toBeDefined();
  });
});
```

## 4. 端到端测试

### 4.1 用户流程测试

#### Cypress 测试示例
```javascript
// cypress/e2e/user-workflow.cy.js
describe('Hardware Compatibility User Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000');
  });
  
  it('should complete component selection and compatibility check', () => {
    // 1. 选择 CPU
    cy.get('[data-testid="cpu-selector"]').click();
    cy.get('[data-testid="component-list"]').should('be.visible');
    cy.contains('Intel Core i7-12700K').click();
    
    // 2. 选择主板
    cy.get('[data-testid="motherboard-selector"]').click();
    cy.contains('ASUS ROG STRIX Z690-E').click();
    
    // 3. 验证兼容性结果
    cy.get('[data-testid="compatibility-results"]').should('be.visible');
    cy.get('[data-testid="compatibility-status"]').should('contain', '兼容');
    
    // 4. 导出配置
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="export-dialog"]').should('be.visible');
  });
  
  it('should handle incompatible components', () => {
    // 选择不兼容的组件
    cy.get('[data-testid="cpu-selector"]').click();
    cy.contains('AMD Ryzen 7 5800X').click();
    
    cy.get('[data-testid="motherboard-selector"]').click();
    cy.contains('ASUS ROG STRIX Z690-E').click();
    
    // 验证显示不兼容警告
    cy.get('[data-testid="compatibility-warning"]').should('be.visible');
    cy.get('[data-testid="compatibility-status"]').should('contain', '不兼容');
  });
});
```

### 4.2 数据导入测试

```javascript
// cypress/e2e/data-import.cy.js
describe('Data Import Functionality', () => {
  it('should import component data from file', () => {
    cy.visit('http://localhost:8000');
    
    // 触发数据导入
    cy.get('[data-testid="import-button"]').click();
    
    // 选择测试数据文件
    cy.get('[data-testid="file-input"]').attachFile('test-components.json');
    
    // 验证导入成功
    cy.get('[data-testid="import-success"]').should('be.visible');
    cy.get('[data-testid="component-count"]').should('contain', '50');
  });
  
  it('should handle import errors gracefully', () => {
    cy.visit('http://localhost:8000');
    
    cy.get('[data-testid="import-button"]').click();
    
    // 上传无效文件
    cy.get('[data-testid="file-input"]').attachFile('invalid-data.txt');
    
    // 验证错误处理
    cy.get('[data-testid="import-error"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', '格式错误');
  });
});
```

## 5. 性能测试

### 5.1 加载性能测试

#### 性能基准测试
```javascript
// tests/performance/loading.test.js
describe('Performance Benchmarks', () => {
  test('should load page within 3 seconds', async () => {
    const startTime = performance.now();
    
    // 模拟页面加载
    await page.goto('http://localhost:8000');
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成
  });
  
  test('should handle large datasets efficiently', async () => {
    // 导入大量数据
    const largeDataset = generateLargeDataset(10000); // 10000个组件
    
    const startTime = performance.now();
    await importLargeDataset(largeDataset);
    const importTime = performance.now() - startTime;
    
    expect(importTime).toBeLessThan(5000); // 5秒内导入完成
    
    // 测试搜索性能
    const searchStart = performance.now();
    await performSearch('Intel');
    const searchTime = performance.now() - searchStart;
    
    expect(searchTime).toBeLessThan(500); // 500ms内完成搜索
  });
});
```

### 5.2 内存使用测试

```javascript
// tests/performance/memory.test.js
describe('Memory Usage', () => {
  test('should not leak memory during component operations', async () => {
    const initialMemory = await getMemoryUsage();
    
    // 执行一系列操作
    for (let i = 0; i < 100; i++) {
      await selectRandomComponent();
      await performCompatibilityCheck();
      await clearSelection();
    }
    
    const finalMemory = await getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 增加不超过10MB
  });
});
```

## 6. 兼容性测试

### 6.1 浏览器兼容性测试

#### 测试矩阵
```javascript
// 支持的浏览器列表
const SUPPORTED_BROWSERS = [
  { name: 'Chrome', versions: ['60', '70', '80', '90', '100'] },
  { name: 'Firefox', versions: ['55', '60', '70', '80', '90'] },
  { name: 'Safari', versions: ['12', '13', '14', '15'] },
  { name: 'Edge', versions: ['79', '80', '90', '100'] }
];

// 移动端浏览器
const MOBILE_BROWSERS = [
  { name: 'Chrome Mobile', versions: ['60+'] },
  { name: 'Safari Mobile', versions: ['12+'] }
];
```

### 6.2 响应式设计测试

```javascript
// tests/responsive/responsive.test.js
describe('Responsive Design', () => {
  const viewports = [
    { width: 320, height: 568, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop' },
    { width: 1440, height: 900, name: 'large' }
  ];
  
  viewports.forEach(viewport => {
    test(`should render correctly on ${viewport.name} screen`, async () => {
      await page.setViewport(viewport);
      await page.goto('http://localhost:8000');
      
      // 验证布局正确
      await expect(page).toMatchElement('[data-testid="main-content"]');
      
      // 验证组件选择器可见
      const selectorVisible = await page.isVisible('[data-testid="component-selector"]');
      expect(selectorVisible).toBe(true);
    });
  });
});
```

## 7. 测试数据管理

### 7.1 测试数据生成

#### 测试数据工厂
```javascript
// tests/factories/component-factory.js
class ComponentFactory {
  static createCPU(overrides = {}) {
    return {
      标题: overrides.标题 || `Test CPU ${Math.random().toString(36).substr(2, 5)}`,
      品牌: overrides.品牌 || 'Intel',
      接口: overrides.接口 || 'LGA1700',
      核心: overrides.核心 || '8',
      线程: overrides.线程 || '16',
      主频: overrides.主频 || '3.6GHz',
      ...overrides
    };
  }
  
  static createMotherboard(overrides = {}) {
    return {
      标题: overrides.标题 || `Test Motherboard ${Math.random().toString(36).substr(2, 5)}`,
      品牌: overrides.品牌 || 'ASUS',
      接口: overrides.接口 || 'LGA1700',
      内存插槽: overrides.内存插槽 || '4',
      ...overrides
    };
  }
}
```

### 7.2 测试数据清理

```javascript
// tests/setup/cleanup.js
beforeEach(() => {
  // 清理 localStorage
  localStorage.clear();
  
  // 重置测试数据
  resetTestData();
});

afterEach(() => {
  // 清理 DOM
  document.body.innerHTML = '';
  
  // 清理事件监听器
  removeAllEventListeners();
});
```

## 8. 测试报告

### 8.1 测试结果分析

#### 测试覆盖率报告
```json
{
  "statements": 85,
  "branches": 80,
  "functions": 90,
  "lines": 85,
  "files": [
    {
      "file": "src/data-manager.js",
      "coverage": 95
    },
    {
      "file": "src/validation-engine.js", 
      "coverage": 88
    }
  ]
}
```

### 8.2 质量指标

#### 质量门禁
- **单元测试覆盖率**: ≥ 80%
- **集成测试通过率**: 100%
- **端到端测试通过率**: ≥ 95%
- **性能基准**: 所有性能测试通过
- **浏览器兼容性**: 支持所有目标浏览器

---

## 附录

### A. 测试命令速查

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试  
npm run test:integration

# 运行端到端测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage

# 运行性能测试
npm run test:performance
```

### B. 测试环境设置

```bash
# 安装测试依赖
npm install --save-dev jest cypress

# 配置测试脚本
# 在 package.json 中添加测试脚本
```

---

*最后更新: 2024年11月14日*
*文档版本: v1.0.0*