# 开发文档

## 项目结构

```
硬件兼容性检测平台/
├── index.html              # 主应用页面
├── login.html              # 登录页面
├── 启动.bat                 # Windows启动脚本
├── package.json            # 项目配置文件
├── README.md               # 项目说明文档
├── config/                  # 配置文件目录
│   └── app-config.json     # 应用配置
├── assets/                 # 静态资源目录
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── data/              # 数据文件
├── docs/                   # 文档目录
│   ├── USER_GUIDE.md       # 用户指南
│   ├── API_REFERENCE.md    # API参考
│   └── DEVELOPMENT.md      # 开发文档
└── components.json         # 组件数据文件
```

## 技术栈

- **前端框架**: Vue.js 3.x (CDN方式)
- **样式**: 原生CSS + CSS变量
- **数据存储**: localStorage
- **构建工具**: 无需构建，直接使用
- **部署**: 静态文件部署

## 核心模块

### 1. 数据管理层 (DataManager)

负责所有数据相关的操作：
- 数据的持久化存储
- 导入导出功能
- 数据验证和清洗
- 备份恢复机制

### 2. 组件验证层 (ComponentValidator)

验证硬件数据的完整性和有效性：
- 字段格式验证
- 必需字段检查
- 数据质量评估
- 批量验证支持

### 3. 兼容性引擎 (CompatibilityEngine)

执行兼容性检测逻辑：
- 规则匹配
- 兼容性评分
- 检测报告生成
- 自定义规则支持

## 开发环境设置

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd hardware-compatibility-checker
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   # 或直接打开 index.html
   ```

3. **访问应用**
   - 打开浏览器访问 `http://localhost:3000`
   - 或直接双击 `index.html`

### 代码规范

#### JavaScript 规范

- 使用 ES6+ 语法
- 变量命名采用 camelCase
- 类名采用 PascalCase
- 常量使用 UPPER_CASE
- 函数要有明确的返回值类型

```javascript
// 好的示例
class DataManager {
  static STORAGE_KEY = 'hardware_data';
  
  getComponentCount() {
    return this.components.length;
  }
}

// 不好的示例
function get_data() {
  return data_length;
}
```

#### CSS 规范

- 使用 CSS 变量定义主题色
- 采用 BEM 命名规范
- 响应式设计优先
- 移动端优先设计

```css
/* 好的示例 */
.component-card {
  background: var(--card-bg);
}

.component-card--selected {
  border-color: var(--accent-color);
}

/* 不好的示例 */
.card {
  background: #fff;
}

.selectedCard {
  border: 2px solid blue;
}
```

### 界面样式修改说明

**重要提示：请勿随意修改界面样式！**

当前界面设计是经过精心设计和测试的，具有良好的用户体验和视觉效果。为了保持平台的一致性和专业性，我们强烈建议：

1. 不要修改现有的CSS样式和主题颜色
2. 不要调整组件的布局结构
3. 不要更改交互元素的尺寸和位置
4. 不要修改字体和颜色方案

如果您确实需要进行样式调整，请先与项目负责人或设计团队沟通，获得批准后再进行修改。任何未经授权的样式修改都可能影响平台的整体一致性和用户体验。

## 功能开发指南

### 添加新的硬件类别

1. **更新配置**
   ```json
   // config/app-config.json
   {
     "components": {
       "new_category": {
         "requiredFields": ["标题", "品牌", "关键参数"],
         "compatibilityFields": ["关键参数"]
       }
     }
   }
   ```

2. **更新验证规则**
   ```javascript
   // 在 ComponentValidator 中添加
   validateNewCategory(component, errors, warnings) {
     // 自定义验证逻辑
   }
   ```

3. **更新兼容性规则**
   ```javascript
   // 在 CompatibilityEngine 中添加
   const newRule = {
     name: '新类别规则',
     check: (componentA, componentB) => {
       // 规则逻辑
     }
   };
   ```

4. **更新界面**
   - 在 `index.html` 中添加对应的选择器
   - 更新样式和交互逻辑

### 自定义兼容性规则

```javascript
// 1. 定义规则
const customRule = {
  name: '自定义兼容性检查',
  type: 'critical', // critical, warning, recommendation
  description: '检查特定条件的兼容性',
  check: (componentA, componentB) => {
    // 返回兼容性结果
    return {
      compatible: true, // 或 false
      reason: '兼容性原因说明'
    };
  }
};

// 2. 注册规则
window.CompatibilityEngine.addRule('custom_rule', customRule);

// 3. 使用规则
const result = window.CompatibilityEngine.checkCompatibility(
  componentA, 
  componentB, 
  'custom_rule'
);
```

### 数据导入导出

#### 导入数据格式

```javascript
// 标准导入格式
const importData = {
  components: {
    cpu: [
      {
        标题: "型号名称",
        品牌: "品牌名称",
        // 其他字段...
      }
    ],
    // 其他类别...
  },
  compatibility: {
    // 可选：兼容性规则
  }
};

// 导入数据
window.DataManager.importData(importData, 'user');
```

#### 导出数据格式

```javascript
// 导出JSON格式
const jsonData = window.DataManager.exportData('json');

// 导出CSV格式
const csvData = window.DataManager.exportData('csv');
```

## 测试指南

### 单元测试

由于项目采用纯前端技术栈，测试主要在浏览器中进行：

```javascript
// 简单的功能测试示例
function testDataManager() {
  const dm = window.DataManager;
  
  // 测试数据保存
  const testData = { components: { cpu: [] } };
  const saved = dm.saveData(testData);
  console.assert(saved === true, '数据保存失败');
  
  // 测试数据读取
  const loaded = dm.getData();
  console.assert(loaded !== null, '数据读取失败');
}
```

### 兼容性测试

测试不同浏览器的兼容性：

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 性能测试

测试大数据量下的性能表现：

```javascript
// 性能测试示例
function testPerformance() {
  const startTime = performance.now();
  
  // 执行大量数据操作
  for (let i = 0; i < 1000; i++) {
    // 测试操作
  }
  
  const endTime = performance.now();
  console.log(`执行时间: ${endTime - startTime}ms`);
}
```

## 部署指南

### 静态文件部署

1. **准备文件**
   ```
   上传所有文件到服务器:
   - index.html
   - login.html
   - assets/ 目录
   - config/ 目录
   - docs/ 目录 (可选)
   ```

2. **配置服务器**
   - 确保支持 HTML5 History API
   - 配置 MIME 类型
   - 启用 Gzip 压缩

3. **HTTPS 配置** (推荐)
   - 获取 SSL 证书
   - 配置 HTTPS 重定向

### CDN 部署

可以将静态资源部署到 CDN：

```html
<!-- 使用 CDN 的示例 -->
<script src="https://cdn.example.com/vue@3/dist/vue.global.prod.js"></script>
<link rel="stylesheet" href="https://cdn.example.com/styles.css">
```

## 故障排除

### 常见问题

1. **数据无法保存**
   - 检查浏览器是否支持 localStorage
   - 检查存储空间是否充足

2. **兼容性检测不准确**
   - 验证数据格式是否正确
   - 检查规则配置是否完整

3. **界面显示异常**
   - 检查 CSS 文件是否加载
   - 验证浏览器兼容性

### 调试技巧

```javascript
// 启用调试模式
localStorage.setItem('debug', 'true');

// 在控制台查看详细日志
console.log('当前数据:', window.DataManager.getData());
console.log('验证结果:', window.ComponentValidator.validateBatch(components));
```

## 贡献指南

### 代码提交规范

- 提交信息使用英文
- 描述具体的修改内容
- 关联相关 issue

```bash
git commit -m "feat: 添加新的硬件类别支持"
git commit -m "fix: 修复数据导入错误"
git commit -m "docs: 更新API文档"
```

### Pull Request 流程

1. Fork 项目
2. 创建功能分支
3. 开发并测试功能
4. 提交 Pull Request
5. 代码审查
6. 合并到主分支

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: dev@hardware-checker.com

## 废弃功能说明

### 搜索关键词生成功能（已移除）

**状态**: 已废弃并移除

**移除原因**:
- 该功能与智能筛选功能存在功能重叠
- 用户体验不佳，需要多次操作才能完成组件筛选
- 依赖外部工具（豆包网站），增加了使用复杂性
- 维护成本较高，代码结构冗余

**移除内容**:
- 所有UI界面元素（生成关键词按钮、关键词对话框等）
- Vue实例中的相关数据字段（showKeywordDialog、generatedKeywords、keywordStatus等）
- 相关方法（generateKeywords、createKeywordTemplate、copyKeywords、openDoubaoSearch等）
- 豆包网站查询结果相关的数据验证和转换功能

**替代方案**:
- 使用智能筛选按钮功能，直接在系统内完成组件兼容性过滤
- 智能筛选提供更直观、更高效的组件选择体验

## 智能筛选功能开发文档

### 功能概述

智能筛选功能是一个可开启/关闭的特性，当功能开启时，系统会自动识别并过滤掉与当前已选择组件存在兼容性冲突的硬件选项，仅保留兼容的硬件供用户选择。

### 核心设计思路

1. **状态管理**
   - 使用`smartFilterEnabled`布尔值控制筛选功能的开启和关闭
   - 通过用户界面的按钮进行状态切换

2. **兼容性判断机制**
   - 利用现有的兼容性检测引擎（CompatibilityEngine）
   - 基于预定义的兼容性规则，实时计算每个组件的兼容性状态
   - 支持多种硬件类别之间的交叉兼容性检查

3. **过滤逻辑**
   - 当智能筛选开启时，在组件列表渲染前进行过滤
   - 根据已选择的组件和当前正在浏览的组件类别，动态计算兼容性
   - 仅显示通过兼容性检查的组件选项

### 实现逻辑

1. **状态控制**
```javascript
// 开启智能筛选
enableSmartFilter() {
  this.smartFilterEnabled = true;
  this.showNotification('智能筛选已开启', 'success');
  
  // 保存到本地存储
  localStorage.setItem('smartFilterEnabled', 'true');
},

// 关闭智能筛选
disableSmartFilter() {
  this.smartFilterEnabled = false;
  this.showNotification('智能筛选已关闭', 'info');
  
  // 保存到本地存储
  localStorage.setItem('smartFilterEnabled', 'false');
}
```

2. **组件过滤实现**
```javascript
// 在组件渲染前应用过滤逻辑
filteredProducts(category) {
  let products = this.products[category] || [];
  
  // 如果智能筛选已开启，应用兼容性过滤
  if (this.smartFilterEnabled) {
    products = products.filter(product => {
      return this.isCompatibleWithSelected(product, category);
    });
  }
  
  return products;
}

// 检查组件是否与已选组件兼容
isCompatibleWithSelected(component, category) {
  // 获取当前已选择的其他组件
  const currentSelection = { ...this.selected };
  currentSelection[category] = component; // 临时设置当前组件进行兼容性检查
  
  // 执行兼容性检查
  const compatibilityResult = this.checkCompatibility(currentSelection);
  
  // 只保留没有严重冲突的组件
  return !compatibilityResult.hasCriticalConflicts;
}
```

3. **兼容性规则**

系统实现了以下关键的兼容性判断规则：

- **CPU与主板兼容性**
  - 检查CPU接口与主板CPU插槽是否匹配
  - 验证主板芯片组是否支持CPU
  
- **主板与内存兼容性**
  - 检查内存类型（DDR4/DDR5）与主板支持的内存类型是否匹配
  - 验证内存插槽数量和最大容量限制
  
- **机箱与主板兼容性**
  - 检查主板板型（ATX/Micro-ATX/ITX）与机箱支持的板型是否匹配
  - 验证机箱尺寸是否足够容纳主板
  
- **机箱与显卡兼容性**
  - 检查显卡长度与机箱支持的显卡限长是否匹配
  - 验证机箱电源供应是否足够支持显卡功耗
  
- **主板与存储设备兼容性**
  - 检查M.2插槽数量与NVMe固态硬盘数量是否匹配
  - 验证接口类型是否兼容
  
- **PCIe版本兼容性**
  - 检查主板PCIe插槽版本与扩展卡PCIe版本的兼容性
  - 处理向后兼容的情况

### 界面实现

智能筛选功能通过界面上的按钮进行控制：

```html
<!-- 智能筛选按钮 -->
<div class="smart-filter-container">
  <button 
    class="smart-filter-button"
    :class="{ active: smartFilterEnabled }"
    @click="toggleSmartFilter"
  >
    <span class="icon">{{ smartFilterEnabled ? '✓' : '⚙️' }}</span>
    <span class="text">
      {{ smartFilterEnabled ? '智能筛选已开启' : '开启智能筛选' }}
    </span>
  </button>
</div>
```

### 性能优化

1. **缓存机制**
   - 缓存已计算的兼容性结果，避免重复计算
   - 使用LRU缓存策略管理兼容性计算结果

2. **延迟计算**
   - 采用虚拟列表技术，只对可见组件进行兼容性检查
   - 使用requestAnimationFrame优化渲染性能

3. **增量更新**
   - 当用户选择变化时，只重新计算受影响的兼容性关系
   - 避免全量重新计算，提高响应速度

### 测试要点

1. **功能测试**
   - 验证智能筛选按钮能正确开启/关闭功能
   - 测试筛选后是否只显示兼容组件
   - 验证取消选择时筛选结果是否正确更新

2. **边界测试**
   - 测试大量组件（>1000）下的筛选性能
   - 验证不同浏览器环境下的兼容性
   - 测试各种硬件组合的筛选准确性

3. **用户体验测试**
   - 验证筛选过程中的响应速度
   - 测试筛选结果的可视化效果
   - 确保用户能清楚了解筛选状态

4. **兼容性测试用例**

   | 测试场景 | 预期结果 | 测试方法 |
   |---------|---------|----------|
   | CPU与主板接口不匹配 | CPU被过滤掉 | 选择特定接口的主板，验证不兼容CPU不可见 |
   | 主板与内存类型不匹配 | 内存被过滤掉 | 选择支持DDR4的主板，验证DDR5内存在列表中不可见 |
   | 机箱不支持主板板型 | 主板被过滤掉 | 选择仅支持ITX的机箱，验证ATX主板不可见 |
   | 显卡长度超过机箱限制 | 显卡被过滤掉 | 选择小机箱，验证超长显卡不可见 |
   | 无兼容性冲突 | 所有组件可见 | 关闭智能筛选，确认所有组件都显示 |

---

*最后更新: 2024年11月14日*