# 硬件兼容性检测平台 - 数据集使用指南

## 概述

本平台支持从外部JSON文件导入硬件组件数据，实现数据的分离管理和灵活扩展。您可以根据需要创建自己的组件数据集文件，通过简单的配置即可在应用中使用。

## 📁 数据集文件格式

### 文件位置
- 文件名: `components.json`
- 位置: 项目根目录下（适用于前端版本）或与HTML文件同目录下（适用于简单HTML版本）

### 数据结构
```json
{
  "metadata": {
    "version": "1.3.0",
    "lastUpdated": "2025-07-13",
    "description": "硬件兼容性检测平台扩展组件数据集",
    "componentCount": {
      "cpu": 10,
      "mb": 12,
      "gpu": 12,
      "ram": 11,
      "nvme": 10,
      "case": 11,
      "total": 66
    }
  },
  "brands": {
    "cpu": ["AMD", "Intel", "酷睿", "锐龙"],
    "mb": ["华硕", "技嘉", "微星", "华擎", "映泰", "铭瑄", "七彩虹", "昂达", "精英"],
    "gpu": ["七彩虹", "影驰", "蓝宝石", "华硕", "技嘉", "微星", "索泰", "铭瑄", "映泰", "盈通", "耕升", "迪兰", "讯景", "翔升"],
    "ram": ["金百达", "海盗船", "芝奇", "威刚", "金士顿", "十铨", "光威", "阿斯加特", "科赋", "博帝"],
    "nvme": ["宏碁掠夺者", "三星", "西部数据", "金士顿", "英特尔", "英睿达", "铠侠", "致态", "闪迪", "浦科特"],
    "case": ["航嘉", "先马", "酷冷至尊", "爱国者", "联力", "银欣", "恩杰", "安钛克", "游戏悍将", "乔思伯", " Fractal Design", "追风者", "骨伽"]
  },
  "components": {
    "cpu": [...],
    "mb": [...],
    "gpu": [...],
    "ram": [...],
    "nvme": [...],
    "case": [...]
  }
}
```

## 🔧 数据集字段说明

### 1. metadata 元数据
- `version`: 数据集版本号
- `lastUpdated`: 最后更新日期
- `description`: 数据集描述

### 2. brands 品牌列表
- 按组件类别分组列出所有可用品牌
- 用于品牌筛选和统计

### 3. components 组件数据
每个组件对象包含以下字段：
- `id`: 唯一标识符，格式为 [类别]-[品牌]-[型号]
- `category`: 组件类别 (cpu/mb/gpu/ram/nvme/case)
- `brand`: 品牌名称
- `title`: 显示标题
- `specs`: 详细规格参数对象

#### 组件规格参数示例
```json
{
  "id": "cpu-amd-Ryzen5_9600X",
  "category": "cpu",
  "brand": "AMD",
  "title": "AMD Ryzen5 9600X",
  "specs": {
    "name": "锐龙5 9600X",
    "cores": "6核心",
    "threads": "12线程",
    "series": "Ryzen 5",
    "process": "4纳米",
    "hasFan": "不带风扇",
    "socket": "Socket AM5",
    "hasIGPU": "支持",
    "l2Cache": "6MB",
    "baseFreq": "3.9GHz",
    "boostFreq": "5.4GHz",
    "l3Cache": "32MB",
    "tdp": "65W",
    "price": "1599元",
    "rating": "4.7",
    "stock": "有货"
  }
}
```

### 4. compatibility 兼容性规则
（注意：在实际的`components.json`文件中，兼容性规则可能已经移到后端实现，前端仅保留组件数据）
定义组件间的兼容性检查规则：
- `rules`: 检查规则列表
- `fields`: 字段映射关系

## 📝 如何创建自定义数据集

### 步骤 1: 创建基础结构
创建一个新的JSON文件，复制上述基础结构。

### 步骤 2: 填充品牌列表
在`brands`对象中添加您要支持的品牌列表。

### 步骤 3: 添加组件数据
在`components`对象中添加您的组件数据。每个组件必须包含：
- 唯一的`id`
- 正确的`category`
- `brand`和`title`
- `specs`对象包含详细参数

### 步骤 4: 指定兼容性规则
在`compatibility`对象中定义组件间的兼容性检查规则。

## 🔄 导入数据集

### 使用方法
1. 将您的数据集文件保存为`components.json`
2. 对于Vue前端版本：将文件放在public目录下或直接修改src目录下的数据集
3. 对于简单HTML版本：将文件与HTML文件放在同一目录下
4. 系统将自动加载并应用新数据

### 支持的字段别名
为了兼容多种数据格式，系统支持字段别名：
- CPU插槽: `socket`, `cpuSocket`, `CPU插槽`, `cpu插槽`
- DDR代数: `ddrGen`, `DDR代数`, `内存类型`, `memoryType`, `ramType`
- 主板尺寸: `formFactor`, `尺寸`, `板型`, `mbSize`
- 主板支持: `mbSupport`, `主板支持`, `supportedMbSizes`
- 显卡长度: `length`, `显卡长度`, `gpuLength`
- 显卡限长: `gpuMaxLength`, `显卡限长`, `maxGpuLength`
- CPU散热器高度: `cpuCoolerHeight`, `散热器高度`, `cpu散热限高`
- M.2插槽数量: `m2Slots`, `M2数量`, `m.2Slots`

## 🎯 高级功能

### 扩展字段
您可以在组件的`specs`中添加任意额外字段：
- `price`: 价格信息
- `rating`: 评分
- `stock`: 库存状态
- `image`: 图片URL
- 其他自定义字段

这些字段不会影响兼容性检查，但可以用于展示和筛选。

### 批量导入
您可以使用脚本批量生成组件数据：
```python
# Python 示例脚本
import json

# 读取Excel文件
df = pd.read_excel('components.xlsx')

# 转换为JSON格式
components = {
    "metadata": {...},
    "brands": {...},
    "components": {...},
    "compatibility": {...}
}

# 保存为JSON
with open('components.json', 'w', encoding='utf-8') as f:
    json.dump(components, f, ensure_ascii=False, indent=2)
```

## ⚠️ 注意事项

1. **数据格式**: 必须使用有效的JSON格式
2. **字符编码**: 使用UTF-8编码以支持中文
3. **字段命名**: 使用支持的字段名或别名
4. **ID唯一性**: 确保每个组件ID唯一
5. **数据验证**: 导入前系统会验证数据格式

## 📞 技术支持

如果您在使用自定义数据集时遇到问题：
1. 检查JSON格式是否有效
2. 确认所有必需字段已填写
3. 查看浏览器控制台错误信息
4. 参考示例数据集文件

---

*最后更新: 2025-11-13*