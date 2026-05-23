# 硬件兼容性检测平台 - 更改日志

## 项目概述
本项目是一个硬件兼容性检测平台，包含后端服务和前端应用两个主要部分。后端采用Spring Boot框架提供REST API服务，前端提供Vue.js版本和简单HTML版本两种选择。项目允许用户选择各种硬件组件并检测它们之间的兼容性，提供智能筛选、数据管理、用户认证等功能。

## 目录结构
```
硬件兼容性检测平台/
├── backend/                          # Spring Boot后端服务
├── frontend/                         # Vue.js前端应用（主版本）
├── frontend-simple/                  # 简单HTML前端应用（快速使用版本）
└── docs/                             # 项目文档
```

---

---

## 2025-11-13 - 初始版本与功能完善

### 1. 初始代码结构
- **文件**: 未命名.html
- **更改内容**: 创建了基础的硬件兼容性检测平台
- **技术栈**: Vue 3 + HTML + CSS
- **功能**: 
  - 六种硬件组件选择（CPU、主板、显卡、内存、NVMe硬盘、机箱）
  - 模态弹窗选择组件
  - 基础兼容性检测
  - 配置导出功能

---

## 2025-11-13 - 数据结构扩展与优化

### 1. 产品数据扩展
- **更改原因**: 用户反馈"选择cpu之后只有amd可以选？其他组件也是这样，品牌不全"
- **更改内容**: 扩展了每个组件类别的产品数据，增加多个品牌和型号
- **具体变更**:
  - **CPU**: 新增Intel Core i5-13600K和i7-13700K
  - **主板**: 新增技嘉B650M和微星Z790 TOMAHAWK
  - **显卡**: 新增影驰RTX4070、蓝宝石RX7700 XT、华硕RTX4060
  - **内存**: 新增海盗船复仇者RGB、芝奇焰光戟、威刚龙耀D50
  - **NVMe**: 新增三星980 PRO、西部数据SN770、金士顿KC3000
  - **机箱**: 新增先马朱雀air、酷冷至尊TD500 Mesh、爱国者星璨岚

---

## 2025-11-13 - 品牌筛选功能修复

### 1. 品牌筛选逻辑修复
- **问题**: 品牌筛选功能无法正确工作
- **原因**: 筛选逻辑使用精确匹配而非包含匹配

#### 原始代码:
```javascript
filteredListForModal() {
  const q = this.modalFilters.query.trim().toLowerCase();
  const brand = (this.modalFilters.brand || '').toLowerCase();

  return this.listByCategory.filter(p => {
    const title = String(p.标题 || '').toLowerCase();
    const pBrand = String(p.品牌 || '').toLowerCase();

    const hitQuery =
      !q ||
      title.includes(q) ||
      pBrand.includes(q) ||
      String(p.型号 || '').toLowerCase().includes(q) ||
      String(p.系列 || '').toLowerCase().includes(q) ||
      String(p.cpu接口 || p['CPU插槽'] || p.接口 || p.接口类型 || '').toLowerCase().includes(q) ||
      String(p.核心 || p.核心数量 || '').toLowerCase().includes(q) ||
      String(p.频率 || '').toLowerCase().includes(q) ||
      String(p.容量 || '').toLowerCase().includes(q);

    const hitBrand = !brand || pBrand === brand;
    return hitQuery && hitBrand;
  });
},
```

#### 修改后代码:
```javascript
filteredListForModal() {
  const q = this.modalFilters.query.trim().toLowerCase();
  const brand = (this.modalFilters.brand || '').toLowerCase();

  return this.listByCategory.filter(p => {
    const title = String(p.标题 || '').toLowerCase();
    const pBrand = String(p.品牌 || '').toLowerCase();

    const hitQuery =
      !q ||
      title.includes(q) ||
      pBrand.includes(q) ||
      String(p.型号 || '').toLowerCase().includes(q) ||
      String(p.系列 || '').toLowerCase().includes(q) ||
      String(p.cpu接口 || p['CPU插槽'] || p.接口 || p.接口类型 || '').toLowerCase().includes(q) ||
      String(p.核心 || p.核心数量 || '').toLowerCase().includes(q) ||
      String(p.频率 || '').toLowerCase().includes(q) ||
      String(p.容量 || '').toLowerCase().includes(q);

    // 修复品牌筛选问题 - 改为包含匹配而不是精确匹配
    const hitBrand = !brand || pBrand.includes(brand);
    return hitQuery && hitBrand;
  });
},
```

- **结果**: 品牌下拉菜单现在可以正确筛选对应品牌的产品

---

## 2025-11-13 - 智能筛选功能实现

### 1. 智能筛选开关
- **用户需求**: "添加一个功能按钮，作用在选择一个组件之后去除其余种类的组件中不兼容的部分"
- **实现**: 
  - 添加"开启智能筛选"按钮
  - 添加智能筛选状态变量 `smartFilterEnabled`
  - 添加视觉提示显示组件兼容状态

#### 原始代码（组件选择区域）:
```html
<div class="section-title">组件选择</div>
<div class="grid">
  <div class="card">
    <h3>CPU</h3>
    <div class="status">{{ selected.cpu ? selected.cpu.标题 : '未选择' }}</div>
    <button class="btn" @click="openPicker('cpu')">选择</button>
  </div>
  <!-- 其他组件卡片 -->
</div>
```

#### 修改后代码（添加智能筛选功能）:
```html
<div class="section-title">组件选择</div>
<div class="stack" style="margin-bottom:10px;">
  <button class="btn" @click="enableSmartFilter" :class="{ 'btn': !smartFilterEnabled, 'secondary': smartFilterEnabled }">
    {{ smartFilterEnabled ? '智能筛选已开启' : '开启智能筛选' }}
  </button>
  <button class="btn secondary" @click="clearAll">清空所有选择</button>
</div>
<div class="grid">
  <div class="card" :class="{ 'disabled': smartFilterEnabled && selected.mb && !isComponentCompatible('cpu', selected.cpu, selected.mb) }">
    <h3>CPU</h3>
    <div class="status">{{ selected.cpu ? selected.cpu.标题 : '未选择' }}</div>
    <button class="btn" @click="openPicker('cpu')">选择</button>
    <div v-if="smartFilterEnabled && selected.mb && !isComponentCompatible('cpu', selected.cpu, selected.mb)" class="incompatible">
      与当前主板不兼容
    </div>
  </div>
  <!-- 其他组件卡片也添加了类似的兼容性检查 -->
</div>
```

### 2. 兼容性检测逻辑
- **CPU与主板**: 插槽类型匹配检查
  - Socket AM5 对应 AM5 主板
  - LGA 1700 对应 LGA 1700 主板
- **内存与主板**: DDR代数匹配检查
  - DDR4 对应 DDR4 主板
  - DDR5 对应 DDR5 主板
- **机箱与主板**: 主板尺寸支持检查
  - ATX/MATX/ITX 主板与机箱支持性
- **机箱与显卡**: 显卡长度限制检查
  - 显卡长度不超过机箱限长

### 3. 自动清理功能
- **触发时机**: 智能筛选开启且选择新组件时
- **清理逻辑**:
  - 选择CPU → 清理不兼容主板
  - 选择主板 → 清理不兼容CPU和内存
  - 选择内存 → 清理不兼容主板
  - 选择机箱 → 清理不兼容主板和显卡
  - 选择显卡 → 清理不兼容机箱

### 4. 视觉反馈
- **不兼容状态**: 组件卡片显示虚线红色边框
- **提示信息**: 显示"与XX组件不兼容"具体提示
- **列表过滤**: 模态窗口自动过滤不兼容的组件选项

#### 原始CSS样式:
```css
.modal-detail {
  max-height: 400px;
  overflow-y: auto;
  padding-left: 8px;
}
```

#### 修改后CSS样式（添加智能筛选相关样式）:
```css
.modal-detail {
  max-height: 400px;
  overflow-y: auto;
  padding-left: 8px;
}
.disabled {
  opacity: 0.6;
  border: 1px dashed var(--err) !important;
}
.incompatible {
  color: var(--err);
  font-size: 11px;
  margin-top: 6px;
  font-weight: bold;
}
```

---

## 2025-11-13 - UI/UX 改进

### 1. 组件卡片增强
- **更改内容**: 在组件选择卡片上添加兼容性状态显示
- **实现**: 
  - 添加不兼容状态样式类 `.disabled`
  - 添加不兼容提示文本样式类 `.incompatible`
  - 使用条件渲染显示兼容性提示

### 2. 新增功能按钮
- **智能筛选开关**: 位于组件选择区域顶部
- **清空所有选择**: 新增清空按钮，方便用户重置配置
- **按钮状态切换**: 智能筛选开启后按钮变为次要样式

---

## 2025-11-13 - 代码结构优化

### 1. 计算属性增强

#### 原始filteredListForModal()计算属性:
```javascript
filteredListForModal() {
  const q = this.modalFilters.query.trim().toLowerCase();
  const brand = (this.modalFilters.brand || '').toLowerCase();

  return this.listByCategory.filter(p => {
    const title = String(p.标题 || '').toLowerCase();
    const pBrand = String(p.品牌 || '').toLowerCase();

    const hitQuery =
      !q ||
      title.includes(q) ||
      pBrand.includes(q) ||
      String(p.型号 || '').toLowerCase().includes(q) ||
      String(p.系列 || '').toLowerCase().includes(q) ||
      String(p.cpu接口 || p['CPU插槽'] || p.接口 || p.接口类型 || '').toLowerCase().includes(q) ||
      String(p.核心 || p.核心数量 || '').toLowerCase().includes(q) ||
      String(p.频率 || '').toLowerCase().includes(q) ||
      String(p.容量 || '').toLowerCase().includes(q);

    // 修复品牌筛选问题 - 改为包含匹配而不是精确匹配
    const hitBrand = !brand || pBrand.includes(brand);
    return hitQuery && hitBrand;
  });
},
```

#### 修改后filteredListForModal()计算属性（增加智能筛选逻辑）:
```javascript
filteredListForModal() {
  const q = this.modalFilters.query.trim().toLowerCase();
  const brand = (this.modalFilters.brand || '').toLowerCase();
  const category = this.modalFilters.category;

  return this.listByCategory.filter(p => {
    const title = String(p.标题 || '').toLowerCase();
    const pBrand = String(p.品牌 || '').toLowerCase();

    const hitQuery =
      !q ||
      title.includes(q) ||
      pBrand.includes(q) ||
      String(p.型号 || '').toLowerCase().includes(q) ||
      String(p.系列 || '').toLowerCase().includes(q) ||
      String(p.cpu接口 || p['CPU插槽'] || p.接口 || p.接口类型 || '').toLowerCase().includes(q) ||
      String(p.核心 || p.核心数量 || '').toLowerCase().includes(q) ||
      String(p.频率 || '').toLowerCase().includes(q) ||
      String(p.容量 || '').toLowerCase().includes(q);

    // 修复品牌筛选问题 - 改为包含匹配而不是精确匹配
    const hitBrand = !brand || pBrand.includes(brand);
    
    // 智能筛选：检查组件是否与已选组件兼容
    let hitSmart = true;
    if (this.smartFilterEnabled && category) {
      switch(category) {
        case 'cpu':
          hitSmart = !this.selected.mb || this.isComponentCompatible('cpu', p, this.selected.mb);
          break;
        case 'mb':
          hitSmart = !this.selected.cpu || this.isComponentCompatible('mb', p, this.selected.cpu);
          break;
        case 'ram':
          hitSmart = !this.selected.mb || this.isComponentCompatible('ram', p, this.selected.mb);
          break;
        case 'case':
          hitSmart = this.isComponentCompatible('case', p, { mb: this.selected.mb, gpu: this.selected.gpu });
          break;
        // GPU和NVMe暂时不做特殊兼容性检查
      }
    }
    
    return hitQuery && hitBrand && hitSmart;
  });
},
```

- **新增**: `filteredListForModal()` 增加智能筛选逻辑
- **优化**: 品牌筛选从精确匹配改为包含匹配

### 2. 方法扩展

#### 原始choose()方法:
```javascript
choose(p) {
  if (p) this.selected[p.类别] = p;
},
```

#### 修改后choose()方法（增加智能筛选逻辑）:
```javascript
choose(p) {
  if (p) {
    const category = p.类别;
    this.selected[category] = p;
    
    // 如果开启智能筛选，自动清理不兼容的已选组件
    if (this.smartFilterEnabled) {
      this.cleanupIncompatibleComponents(category, p);
    }
  }
},
```

#### 原始data()方法:
```javascript
data() {
  return {
    products: PRODUCTS,
    activePicker: '',
    showModal: false,
    previewItem: null,
    selected: { cpu: null, mb: null, gpu: null, ram: null, nvme: null, case: null },

    // 新增：模态筛选状态
    modalFilters: {
      category: '', // 默认显示当前 activePicker，如果为空则所有类别
      brand: '',
      query: ''
    }
  };
},
```

#### 修改后data()方法（增加智能筛选状态）:
```javascript
data() {
  return {
    products: PRODUCTS,
    activePicker: '',
    showModal: false,
    previewItem: null,
    selected: { cpu: null, mb: null, gpu: null, ram: null, nvme: null, case: null },
    smartFilterEnabled: false, // 智能筛选开关

    // 新增：模态筛选状态
    modalFilters: {
      category: '', // 默认显示当前 activePicker，如果为空则所有类别
      brand: '',
      query: ''
    }
  };
},
```

#### 新增方法:
```javascript
// 智能筛选功能
enableSmartFilter() {
  this.smartFilterEnabled = !this.smartFilterEnabled;
},

// 检查组件是否与已选组件兼容
isComponentCompatible(category, component, reference) {
  if (!component || !reference) return true;
  
  switch(category) {
    case 'cpu':
      // CPU与主板插槽兼容性检查
      const cpuSocket = component.接口 || component.接口类型;
      const mbSocket = reference['cpu接口'] || reference['CPU插槽'];
      return cpuSocket && mbSocket && cpuSocket.trim().toUpperCase() === mbSocket.trim().toUpperCase();
      
    case 'mb':
      // 主板与CPU插槽兼容性检查
      const mbSocketForCPU = component['cpu接口'] || component['CPU插槽'];
      const cpuSocketRef = reference.接口 || reference.接口类型;
      return mbSocketForCPU && cpuSocketRef && mbSocketForCPU.trim().toUpperCase() === cpuSocketRef.trim().toUpperCase();
      
    case 'ram':
      // 内存与主板DDR代数兼容性检查
      const ramDDR = (component['DDR代数'] || '').toUpperCase();
      const mbDDR = (reference['ddr代数'] || reference['内存类型'] || '').toUpperCase();
      return !ramDDR || !mbDDR || ramDDR === mbDDR;
      
    case 'case':
      // 机箱兼容性检查（主板尺寸和显卡长度）
      let compatible = true;
      
      // 主板兼容性
      if (reference.mb) {
        const mbForm = (reference.mb['板型'] || reference.mb['尺寸'] || '').toUpperCase();
        const support = (component['主板支持'] || '').toUpperCase();
        if (mbForm && support && !support.split(',').map(s=>s.trim()).includes(mbForm)) {
          compatible = false;
        }
      }
      
      // 显卡长度兼容性
      if (reference.gpu && compatible) {
        const gpuLen = this.toNumber(reference.gpu['显卡长度']);
        const caseMax = this.toNumber(component['显卡限长']);
        if (gpuLen && caseMax && gpuLen > caseMax) {
          compatible = false;
        }
      }
      
      return compatible;
      
    default:
      return true;
  }
},

// 数值提取工具函数
toNumber(val) {
  if (!val) return null;
  const num = parseFloat(String(val).replace(/[^\d.]/g,''));
  return isNaN(num) ? null : num;
},

// 清理不兼容的组件
cleanupIncompatibleComponents(changedCategory, newComponent) {
  switch(changedCategory) {
    case 'cpu':
      // 选择CPU后，检查已选主板是否兼容
      if (this.selected.mb && !this.isComponentCompatible('cpu', newComponent, this.selected.mb)) {
        this.selected.mb = null;
      }
      break;
      
    case 'mb':
      // 选择主板后，检查CPU和内存是否兼容
      if (this.selected.cpu && !this.isComponentCompatible('mb', newComponent, this.selected.cpu)) {
        this.selected.cpu = null;
      }
      if (this.selected.ram && !this.isComponentCompatible('ram', this.selected.ram, newComponent)) {
        this.selected.ram = null;
      }
      break;
      
    case 'ram':
      // 选择内存后，检查主板是否兼容
      if (this.selected.mb && !this.isComponentCompatible('ram', newComponent, this.selected.mb)) {
        this.selected.mb = null;
      }
      break;
      
    case 'case':
      // 选择机箱后，检查主板和显卡是否兼容
      if (this.selected.mb && !this.isComponentCompatible('case', newComponent, { mb: this.selected.mb, gpu: this.selected.gpu })) {
        this.selected.mb = null;
      }
      if (this.selected.gpu && !this.isComponentCompatible('case', newComponent, { mb: this.selected.mb, gpu: this.selected.gpu })) {
        this.selected.gpu = null;
      }
      break;
      
    case 'gpu':
      // 选择显卡后，检查机箱是否兼容
      if (this.selected.case && !this.isComponentCompatible('case', this.selected.case, { mb: this.selected.mb, gpu: newComponent })) {
        this.selected.case = null;
      }
      break;
  }
},
```

- **新增**: `enableSmartFilter()` - 切换智能筛选状态
- **新增**: `isComponentCompatible()` - 检查组件兼容性
- **新增**: `cleanupIncompatibleComponents()` - 清理不兼容组件
- **新增**: `toNumber()` - 数值提取工具函数
- **优化**: `choose()` 方法增加智能筛选逻辑

### 3. 数据结构扩展
- **新增**: `smartFilterEnabled` 状态变量
- **保持**: 原有数据结构和功能完整性

---

## 待办事项

1. **数据结构重构**: 
   - 按照用户提出的可扩展数据格式方案重构
   - 使用统一ID命名规范：[类别]-[品牌]-[型号]
   - 实现参数嵌套结构，支持字段扩展

2. **功能扩展**:
   - 添加更多兼容性检测规则
   - 实现批量导入/导出组件数据
   - 添加组件评分和价格比较功能

3. **性能优化**:
   - 考虑虚拟滚动优化长列表显示
   - 添加组件数据懒加载

---

## 技术栈总结

- **前端框架**: Vue 3 (CDN版本)
- **样式**: 原生CSS + CSS变量
- **数据存储**: 前端JavaScript对象
- **兼容性检测**: 自定义逻辑算法
- **响应式设计**: CSS Grid + Flexbox

---

## 版本信息

- **当前版本**: v1.2.0
- **最后更新**: 2025-11-13
- **主要功能**: 智能筛选 + 兼容性检测
- **代码行数**: ~800行HTML/JS/CSS

---

*此日志记录了项目从初始版本到当前版本的所有重要更改和决策过程。*