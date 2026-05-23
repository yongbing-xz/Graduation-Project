# API 参考文档

## 概述

硬件兼容性检测平台提供完整的JavaScript API，支持二次开发和集成。

## 核心类

### DataManager - 数据管理器

负责数据的存储、加载、导入导出等操作。

```javascript
// 获取全局实例
const dataManager = window.DataManager;

// 主要方法
// 获取当前数据
dataManager.getData();

// 保存数据
dataManager.saveData(data);

// 导入数据
dataManager.importData(data, source);

// 导出数据
dataManager.exportData(format); // 'json', 'csv', 'compact'

// 获取统计数据
dataManager.getStats();

// 备份数据
const backupKey = dataManager.backup();

// 恢复备份
dataManager.restore(backupKey);
```

### ComponentValidator - 组件验证器

验证组件数据的完整性和有效性。

```javascript
const validator = window.ComponentValidator;

// 验证单个组件
const result = validator.validateComponent(component, 'cpu');

// 批量验证
const batchResult = validator.validateBatch(components, 'cpu');

// 生成验证报告
const report = validator.generateReport(batchResult);

// 结果结构
{
  isValid: boolean,
  errors: string[],
  warnings: string[],
  score: number
}
```

### CompatibilityEngine - 兼容性引擎

执行兼容性检测和规则匹配。

```javascript
const engine = window.CompatibilityEngine;

// 检查两个组件的兼容性
const result = engine.checkCompatibility(cpu, mb, 'cpu_mb_socket');

// 检查完整配置的兼容性
const configResults = engine.checkConfiguration({
  cpu: cpuComponent,
  mb: mbComponent,
  gpu: gpuComponent,
  ram: ramComponent,
  nvme: nvmeComponent,
  case: caseComponent
});

// 生成兼容性报告
const report = engine.generateReport(configResults);

// 添加自定义规则
engine.addRule('custom_rule', {
  name: '自定义规则',
  type: 'critical',
  description: '自定义兼容性检查',
  check: (componentA, componentB) => {
    // 自定义检查逻辑
    return { compatible: true, reason: '自定义原因' };
  }
});
```

## 数据格式

### 组件数据格式

```json
{
  "components": {
    "cpu": [
      {
        "标题": "AMD Ryzen5 9600X",
        "品牌": "AMD",
        "接口": "Socket AM5",
        "核心": "6核心",
        "线程": "12线程",
        "系列": "Ryzen 5",
        "制程工艺": "4纳米",
        "是否自带风扇": "不带风扇",
        "二级缓存": "6MB",
        "主频": "3.9GHz",
        "加速频率": "5.4GHz",
        "三级缓存": "32MB"
      }
    ],
    "mb": [
      {
        "标题": "华硕 TUF GAMING B850M-PLUS Wi-Fi 6E 重炮手",
        "品牌": "华硕",
        "cpu接口": "Socket AM5",
        "ddr代数": "DDR5",
        "板型": "MATX",
        "M2数量": "3个",
        "PCIe": "支持PCIE5.0",
        "芯片": "B850"
      }
    ]
    // 其他组件类别...
  },
  "compatibility": {
    "rules": {
      "cpu_mb_socket": {
        "description": "CPU和主板插槽必须匹配",
        "type": "critical"
      }
    }
  }
}
```

### 兼容性检测结果格式

```javascript
{
  critical: [
    {
      compatible: boolean,
      reason: string,
      type: 'critical'
    }
  ],
  warnings: [
    {
      compatible: boolean,
      reason: string,
      type: 'warning'
    }
  ],
  recommendations: [
    {
      compatible: boolean,
      reason: string,
      type: 'recommendation',
      recommendation: string
    }
  ],
  overall: 'excellent' | 'good' | 'fair' | 'warning' | 'incompatible',
  score: number
}
```

## 事件系统

### 自定义事件

系统会触发以下自定义事件：

```javascript
// 组件选择变化
document.addEventListener('componentSelected', (event) => {
  const { category, component } = event.detail;
  console.log(`选择了 ${category}: ${component.标题}`);
});

// 兼容性检测完成
document.addEventListener('compatibilityCheckComplete', (event) => {
  const { results } = event.detail;
  console.log('兼容性检测完成:', results);
});

// 数据导入完成
document.addEventListener('dataImportComplete', (event) => {
  const { success, data, message } = event.detail;
  console.log('数据导入完成:', success, message);
});
```

### 触发自定义事件

```javascript
// 触发组件选择事件
const event = new CustomEvent('componentSelected', {
  detail: {
    category: 'cpu',
    component: cpuComponent
  }
});
document.dispatchEvent(event);
```

## 配置选项

### 应用配置

系统支持通过配置文件进行定制：

```json
{
  "app": {
    "name": "硬件兼容性检测平台",
    "version": "1.0.0",
    "theme": "dark",
    "primaryColor": "#3b82f6"
  },
  "features": {
    "smartFilter": true,
    "dataImport": true,
    "userAuth": true
  }
}
```

## 扩展开发

### 添加新的组件类别

1. 在 `config/app-config.json` 中添加新的组件类别定义
2. 更新验证规则和兼容性规则
3. 在前端界面中添加对应的选择器

### 自定义验证规则

```javascript
// 添加新的验证规则
ComponentValidator.prototype.validateCustomField = function(component) {
  // 自定义验证逻辑
  return { isValid: true, message: '验证通过' };
};
```

### 集成外部数据源

```javascript
// 集成外部API
async function fetchExternalData() {
  const response = await fetch('https://api.example.com/hardware');
  const data = await response.json();
  
  // 转换为系统格式
  const convertedData = convertToSystemFormat(data);
  
  // 导入数据
  window.DataManager.importData(convertedData, 'external');
}
```

## 错误处理

所有API方法都会返回标准的错误处理格式：

```javascript
try {
  const result = dataManager.importData(invalidData);
} catch (error) {
  console.error('导入失败:', {
    message: error.message,
    code: error.code,
    details: error.details
  });
}
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 支持ES6+的现代浏览器

## 许可证

MIT License - 详见 LICENSE 文件