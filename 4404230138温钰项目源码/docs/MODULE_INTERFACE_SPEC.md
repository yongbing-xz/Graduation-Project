# 模块接口规范

## 概述

本文档详细定义了硬件兼容性检测平台各模块之间的接口规范，包括数据格式、方法调用、事件通信等。

## 1. 数据管理模块接口

### 1.1 数据存储接口

#### localStorage 存储规范
```javascript
// 存储键名规范
const STORAGE_KEYS = {
  COMPONENT_DATA: 'hardware_component_data',
  USER_CONFIG: 'user_configuration',
  SELECTED_COMPONENTS: 'selected_components',
  SEARCH_HISTORY: 'search_history',
  IMPORT_HISTORY: 'import_history'
};

// 数据格式规范
interface StorageData {
  version: string;
  timestamp: number;
  data: any;
}
```

#### 数据操作方法
```javascript
class DataManager {
  // 保存数据
  saveData(key: string, data: any): boolean;
  
  // 加载数据
  loadData(key: string): any;
  
  // 删除数据
  removeData(key: string): boolean;
  
  // 清空所有数据
  clearAll(): boolean;
  
  // 检查数据是否存在
  hasData(key: string): boolean;
}
```

### 1.2 数据导入/导出接口

#### 导入方法
```javascript
interface ImportInterface {
  // 从文件导入
  importFromFile(file: File): Promise<ImportResult>;
  
  // 从URL导入
  importFromURL(url: string): Promise<ImportResult>;
  
  // 从文本导入
  importFromText(text: string): Promise<ImportResult>;
}

interface ImportResult {
  success: boolean;
  data?: ComponentData[];
  errors?: ImportError[];
  warnings?: ImportWarning[];
  summary: {
    total: number;
    imported: number;
    skipped: number;
  };
}
```

#### 导出方法
```javascript
interface ExportInterface {
  // 导出为JSON文件
  exportToJSON(filename?: string): Promise<ExportResult>;
  
  // 导出为文本
  exportToText(): string;
  
  // 导出当前配置
  exportConfiguration(): ConfigurationData;
}

interface ExportResult {
  success: boolean;
  filename?: string;
  data?: string;
}
```

## 2. 组件验证模块接口

### 2.1 验证规则接口

#### 验证方法定义
```javascript
interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'suggestion';
  
  // 验证逻辑
  validate(components: SelectedComponents): ValidationResult;
  
  // 获取修复建议
  getFixSuggestions(components: SelectedComponents): FixSuggestion[];
}

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: ValidationDetail[];
}
```

#### 具体验证规则实现
```javascript
// CPU与主板插槽匹配规则
class SocketCompatibilityRule implements ValidationRule {
  validate(components: SelectedComponents): ValidationResult {
    const cpu = components.cpu;
    const motherboard = components.motherboard;
    
    if (!cpu || !motherboard) {
      return { passed: true, message: '缺少必要组件' };
    }
    
    const cpuSocket = cpu.接口 || cpu.socket;
    const mbSocket = motherboard.接口 || motherboard.socket;
    
    return {
      passed: cpuSocket === mbSocket,
      message: cpuSocket === mbSocket ? '插槽匹配' : '插槽不匹配',
      details: [{
        component: 'CPU',
        value: cpuSocket,
        expected: mbSocket
      }]
    };
  }
}
```

### 2.2 验证引擎接口

```javascript
class ValidationEngine {
  // 注册验证规则
  registerRule(rule: ValidationRule): void;
  
  // 执行验证
  validateAll(components: SelectedComponents): ValidationReport;
  
  // 获取特定规则验证结果
  validateRule(ruleId: string, components: SelectedComponents): ValidationResult;
  
  // 获取所有可用规则
  getAvailableRules(): ValidationRule[];
}

interface ValidationReport {
  timestamp: number;
  components: SelectedComponents;
  results: RuleValidationResult[];
  summary: {
    total: number;
    passed: number;
    critical: number;
    warning: number;
    suggestion: number;
  };
}
```

## 3. 用户界面模块接口

### 3.1 组件选择器接口

#### 选择器配置
```javascript
interface SelectorConfig {
  // 选择器类型
  type: 'modal' | 'dropdown' | 'inline';
  
  // 筛选选项
  filters: {
    category?: string;
    brand?: string;
    priceRange?: [number, number];
    compatibility?: boolean;
  };
  
  // 显示选项
  display: {
    showImages: boolean;
    showPrices: boolean;
    showSpecs: boolean;
    itemsPerPage: number;
  };
}
```

#### 选择器事件
```javascript
interface SelectorEvents {
  // 组件选择事件
  onComponentSelected: (component: ComponentData) => void;
  
  // 组件取消选择事件
  onComponentDeselected: (componentType: string) => void;
  
  // 筛选条件变化事件
  onFilterChanged: (filters: FilterOptions) => void;
  
  // 搜索事件
  onSearch: (query: string) => void;
}
```

### 3.2 结果展示接口

#### 结果展示配置
```javascript
interface ResultDisplayConfig {
  // 显示模式
  mode: 'list' | 'grid' | 'detailed';
  
  // 排序选项
  sortBy: 'name' | 'price' | 'brand' | 'compatibility';
  sortOrder: 'asc' | 'desc';
  
  // 分组选项
  groupBy: 'category' | 'brand' | 'compatibility';
}
```

#### 兼容性结果显示
```javascript
interface CompatibilityDisplay {
  // 显示兼容性结果
  showCompatibilityResults(results: ValidationReport): void;
  
  // 高亮不兼容组件
  highlightIncompatibleComponents(components: string[]): void;
  
  // 显示修复建议
  showFixSuggestions(suggestions: FixSuggestion[]): void;
}
```

## 4. 事件通信接口

### 4.1 自定义事件系统

#### 事件定义
```javascript
// 核心事件类型
const EVENT_TYPES = {
  COMPONENT_SELECTED: 'componentSelected',
  COMPONENT_DESELECTED: 'componentDeselected',
  COMPATIBILITY_CHECK: 'compatibilityCheck',
  DATA_IMPORTED: 'dataImported',
  CONFIG_CHANGED: 'configChanged',
  ERROR_OCCURRED: 'errorOccurred'
};

// 事件数据接口
interface ComponentSelectedEvent {
  type: 'componentSelected';
  component: ComponentData;
  componentType: string;
  timestamp: number;
}

interface CompatibilityCheckEvent {
  type: 'compatibilityCheck';
  results: ValidationReport;
  timestamp: number;
}
```

#### 事件总线接口
```javascript
class EventBus {
  // 注册事件监听器
  on(eventType: string, callback: Function): void;
  
  // 取消事件监听
  off(eventType: string, callback: Function): void;
  
  // 触发事件
  emit(eventType: string, data?: any): void;
  
  // 一次性事件监听
  once(eventType: string, callback: Function): void;
}
```

### 4.2 模块间通信协议

#### 请求-响应模式
```javascript
interface ModuleRequest {
  requestId: string;
  module: string;
  action: string;
  parameters?: any;
  timestamp: number;
}

interface ModuleResponse {
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}
```

#### 消息队列接口
```javascript
class MessageQueue {
  // 发送消息
  sendMessage(target: string, message: any): Promise<boolean>;
  
  // 接收消息
  receiveMessage(callback: (message: any) => void): void;
  
  // 广播消息
  broadcast(message: any): void;
  
  // 获取消息统计
  getStats(): MessageStats;
}
```

## 5. 配置管理接口

### 5.1 应用配置接口

#### 配置数据结构
```javascript
interface AppConfig {
  // 界面配置
  ui: {
    theme: 'dark' | 'light';
    language: string;
    fontSize: number;
    animations: boolean;
  };
  
  // 功能配置
  features: {
    autoSave: boolean;
    autoCheck: boolean;
    showPrices: boolean;
    advancedMode: boolean;
  };
  
  // 数据配置
  data: {
    maxHistory: number;
    backupInterval: number;
    exportFormat: 'json' | 'csv';
  };
}
```

#### 配置管理方法
```javascript
class ConfigManager {
  // 加载配置
  loadConfig(): AppConfig;
  
  // 保存配置
  saveConfig(config: AppConfig): boolean;
  
  // 重置为默认配置
  resetToDefault(): boolean;
  
  // 获取配置版本
  getConfigVersion(): string;
  
  // 验证配置有效性
  validateConfig(config: AppConfig): ValidationResult;
}
```

### 5.2 用户偏好接口

```javascript
interface UserPreferences {
  // 界面偏好
  layout: {
    sidebarPosition: 'left' | 'right';
    componentOrder: string[];
    defaultView: 'builder' | 'compatibility';
  };
  
  // 搜索偏好
  search: {
    defaultCategory: string;
    rememberFilters: boolean;
    autoSuggest: boolean;
  };
  
  // 通知偏好
  notifications: {
    compatibilityAlerts: boolean;
    updateNotifications: boolean;
    errorReports: boolean;
  };
}
```

## 6. 错误处理接口

### 6.1 错误类型定义

```javascript
// 错误代码枚举
const ERROR_CODES = {
  // 数据错误
  DATA_INVALID: 'DATA_001',
  DATA_CORRUPTED: 'DATA_002',
  DATA_MISSING: 'DATA_003',
  
  // 验证错误
  VALIDATION_FAILED: 'VALID_001',
  RULE_NOT_FOUND: 'VALID_002',
  
  // 界面错误
  UI_RENDER_ERROR: 'UI_001',
  COMPONENT_NOT_FOUND: 'UI_002',
  
  // 系统错误
  STORAGE_FULL: 'SYS_001',
  NETWORK_ERROR: 'SYS_002'
};

// 错误信息接口
interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  stackTrace?: string;
}
```

### 6.2 错误处理接口

```javascript
class ErrorHandler {
  // 记录错误
  logError(error: AppError): void;
  
  // 显示错误给用户
  showError(error: AppError): void;
  
  // 处理致命错误
  handleFatalError(error: AppError): void;
  
  // 获取错误统计
  getErrorStats(): ErrorStats;
  
  // 清除错误日志
  clearErrorLog(): boolean;
}
```

## 7. 性能监控接口

### 7.1 性能指标接口

```javascript
interface PerformanceMetrics {
  // 加载时间
  loadTime: number;
  
  // 响应时间
  responseTimes: {
    componentSelection: number;
    compatibilityCheck: number;
    dataImport: number;
    search: number;
  };
  
  // 内存使用
  memoryUsage: {
    total: number;
    used: number;
    components: number;
    ui: number;
  };
  
  // 用户交互
  userInteractions: {
    clicks: number;
    searches: number;
    imports: number;
    exports: number;
  };
}
```

### 7.2 监控接口

```javascript
class PerformanceMonitor {
  // 开始性能监控
  startMonitoring(): void;
  
  // 停止性能监控
  stopMonitoring(): void;
  
  // 获取性能报告
  getPerformanceReport(): PerformanceReport;
  
  // 设置性能阈值
  setThresholds(thresholds: PerformanceThresholds): void;
  
  // 性能警报
  onPerformanceAlert(callback: (alert: PerformanceAlert) => void): void;
}
```

---

*最后更新: 2024年11月14日*
*文档版本: v1.0.0*