# components.json 文件分析报告

## 一、文件结构概述
components.json 文件采用模块化结构设计，主要包含以下四个核心部分：

### 1. metadata（元数据）
```json
{ "version": "1.3.0", "lastUpdated": "2025-07-13", "description": "硬件兼容性检测平台扩展组件数据集", "componentCount": { "cpu": 10, "mb": 12, "gpu": 12, "ram": 11, "nvme": 10, "case": 11, "total": 66 } }
```
- 记录文件版本、更新时间和组件数量统计

### 2. brands（品牌列表）
```json
{ "cpu": ["AMD", "Intel", "酷睿", "锐龙"], "mb": ["华硕", "技嘉", "微星", "华擎", ...], ... }
```
- 按组件类别分类存储品牌名称
- 便于前端下拉选择等功能实现

### 3. components（组件数据）
```json
{ "cpu": [ { "id": "cpu-amd-Ryzen5_9600X", "category": "cpu", "brand": "AMD", "title": "AMD Ryzen5 9600X", "specs": { ... } } ], ... }
```
- 核心数据区域，包含所有硬件组件信息
- 按组件类别（cpu、mb、gpu、ram、nvme、case）分组

### 4. compatibility（兼容性规则）
```json
{ "cpu-mb": { "rules": ["socket"], "fields": { "cpu": ["socket", "interface"], "mb": ["cpuSocket", "cpu插槽"] } }, ... }
```
- 定义不同组件之间的兼容性匹配规则
- 确保硬件搭配的合理性

## 二、数据格式分析

### 组件数据通用格式
```json
{ "id": "唯一标识符", "category": "组件类别", "brand": "品牌名称", "title": "完整型号", "specs": { "字段1": "值1", "字段2": "值2", ... } }
```

### 字段定义
- **id**: 唯一标识符，格式为 `[category]-[brand]-[model]`（使用下划线分隔）
- **category**: 组件类别（cpu/mb/gpu/ram/nvme/case）
- **brand**: 品牌名称（与 brands 列表一致）
- **title**: 组件完整型号（用于前端显示）
- **specs**: 组件详细参数（根据类别不同有所差异）

## 三、兼容性分析

### 1. 支持添加新品牌
- **现有规则**: brands 列表按类别存储品牌名称
- **添加方法**: 在对应类别的 brands 数组中新增品牌名称
- **示例**: 在 cpu 品牌中添加 "Apple"
```json
{ "cpu": ["AMD", "Intel", "Apple", ...] }
```

### 2. 支持添加新型号
- **现有规则**: components 列表按类别存储组件信息
- **添加方法**: 在对应类别的 components 数组中新增组件对象
- **示例**: 添加 Apple M3 Pro CPU
```json
{ "id": "cpu-apple-M3_Pro", "category": "cpu", "brand": "Apple", "title": "Apple M3 Pro", "specs": { "name": "Apple M3 Pro", "cores": "12核心", "threads": "18线程", "series": "M3 Pro", "process": "3纳米", "socket": "Apple Silicon", "hasIGPU": "集成显卡", "baseFreq": "3.5GHz", "boostFreq": "4.6GHz", "cache": "24MB", "tdp": "45W", "price": "2599元", "rating": "4.8", "stock": "有货" } }
```

## 四、注意事项

1. **唯一标识符**: id 必须唯一，格式为 `[category]-[brand]-[model]`，使用下划线代替空格
2. **品牌一致性**: 新添加的品牌必须先在对应类别的 brands 列表中注册
3. **规格完整性**: 根据组件类别添加必要的参数（参考同类组件的现有参数）
4. **兼容性字段**: 确保添加的参数包含兼容性规则所需的字段（如 CPU 需要 socket，主板需要 cpuSocket）
5. **元数据更新**: 新增组件后，需要更新 metadata.componentCount 中的对应类别计数和总计数

### 元数据更新示例
```json
{ "componentCount": { "cpu": 11, "mb": 12, "gpu": 12, "ram": 11, "nvme": 10, "case": 11, "total": 67 } }
```

## 五、示例添加操作

### 1. 添加新品牌 "Apple" 到 CPU 类别
```json
// brands 部分
{ "cpu": ["AMD", "Intel", "Apple", "酷睿", "锐龙"], ... }
```

### 2. 添加 Apple M3 Pro CPU
```json
// components.cpu 部分
[ ..., { "id": "cpu-apple-M3_Pro", "category": "cpu", "brand": "Apple", "title": "Apple M3 Pro", "specs": { "name": "Apple M3 Pro", "cores": "12核心", "threads": "18线程", "series": "M3 Pro", "process": "3纳米", "socket": "Apple Silicon", "hasIGPU": "集成显卡", "baseFreq": "3.5GHz", "boostFreq": "4.6GHz", "cache": "24MB", "tdp": "45W", "price": "2599元", "rating": "4.8", "stock": "有货" } } ]
```

## 六、结论

components.json 文件结构清晰、设计合理，完全支持添加更多品牌和型号数据。只要遵循以下原则：
1. 保持与现有数据格式一致
2. 确保 id 唯一
3. 维护品牌列表与组件数据的一致性
4. 包含必要的兼容性参数

即可顺利扩展数据集，支持更多硬件品牌和型号。