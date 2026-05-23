# 硬件兼容性检测平台

[![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)](https://github.com/your-repo/hardware-compatibility-checker)
[![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)](LICENSE)
[![浏览器支持](https://img.shields.io/badge/浏览器-Chrome%2C%20Firefox%2C%20Safari%2C%20Edge-brightgreen.svg)](README.md)
[![后端框架](https://img.shields.io/badge/后端-Spring%20Boot%203.5.7-green.svg)](README.md)
[![前端框架](https://img.shields.io/badge/前端-Vue.js%203.x-blue.svg)](README.md)

专业的硬件兼容性检测工具，帮助用户快速验证电脑硬件组件的兼容性。

## ✨ 特性

### 后端功能
- �️ **完整的REST API** - 提供硬件组件管理和兼容性检测接口
- 🔐 **JWT认证系统** - 安全的用户登录和权限管理
- 📊 **数据库支持** - MySQL存储硬件组件和用户数据
- �🔍 **智能兼容性检测引擎** - 基于规则的硬件兼容性验证
- 📝 **组件数据管理** - 支持CRUD操作和批量导入导出
- 📱 **响应式设计** - REST API支持跨平台调用

### 前端功能（Vue.js版本）
- 🔍 **实时兼容性检测** - 实时检测CPU、主板、显卡、内存、硬盘、机箱等组件的兼容性
- 🎯 **智能筛选** - 自动过滤与已选组件不兼容的选项
- 📊 **数据可视化** - 清晰展示兼容性检测结果
-  **响应式界面** - 完美适配桌面端和移动端
- 🛠️ **扩展性强** - 支持自定义规则和组件类别

### 前端功能（简单HTML版本）
- 🚀 **快速启动** - 无需构建，直接使用浏览器打开
- 🔍 **基本兼容性检测** - CPU、主板、内存等核心组件的兼容性检测
- 📊 **简洁界面** - 直观的组件选择和结果展示

## 🚀 快速开始

### 后端启动（推荐使用完整系统）
```bash
# 进入后端目录
cd backend

# 安装依赖
mvn install

# 启动后端服务
mvn spring-boot:run
```

### 前端启动（Vue.js版本）
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 前端启动（简单HTML版本）
```bash
# 进入前端简单版本目录
cd frontend-simple

# 直接用浏览器打开
index.html
```

### 快捷启动脚本（Windows）
```bash
# 双击运行或命令行执行
启动.bat
```

## 📖 使用指南

### 完整系统使用流程
1. **启动后端服务** - 执行后端启动命令
2. **启动前端服务** - 执行前端启动命令
3. **访问应用** - 浏览器打开http://localhost:5173
4. **注册/登录** - 使用账号登录系统
5. **选择组件** - 点击左侧组件卡片选择具体型号
6. **查看结果** - 右侧实时显示兼容性检测结果
7. **智能筛选** - 开启后自动过滤不兼容选项

### 简单版本使用流程
1. **打开页面** - 使用浏览器直接打开index.html
2. **选择组件** - 点击组件卡片选择具体型号
3. **查看结果** - 页面下方显示兼容性检测结果

## 🏗️ 项目结构

```
硬件兼容性检测平台/
├── backend/                          # Spring Boot后端
│   ├── src/                          # 后端源代码
│   │   ├── main/                     # 主代码
│   │   │   ├── java/                 # Java代码
│   │   │   │   └── com/hardware/compatibility/ # 项目包
│   │   │   │       ├── config/       # 配置类
│   │   │   │       ├── controller/   # 控制器
│   │   │   │       ├── dto/          # 数据传输对象
│   │   │   │       ├── entity/       # 实体类
│   │   │   │       ├── repository/   # 仓库接口
│   │   │   │       ├── service/      # 服务接口
│   │   │   │       └── service/impl/ # 服务实现
│   │   │   └── resources/            # 资源文件
│   │   └── test/                     # 测试代码
│   ├── pom.xml                       # Maven配置
│   └── README.md                     # 后端说明
├── frontend/                         # Vue.js前端
│   ├── src/                          # 前端源代码
│   │   ├── App.vue                   # 根组件
│   │   ├── main.js                   # 入口文件
│   │   ├── api/                      # API调用
│   │   ├── components/               # Vue组件
│   │   ├── router/                   # 路由配置
│   │   ├── stores/                   # 状态管理
│   │   ├── utils/                    # 工具函数
│   │   └── views/                    # 页面组件
│   ├── index.html                    # 入口HTML
│   ├── package.json                  # npm配置
│   └── vite.config.js                # Vite配置
├── frontend-simple/                  # 简单HTML前端
│   ├── index.html                    # 主页面
│   ├── login.html                    # 登录页面
│   ├── assets/                       # 静态资源
│   │   ├── js/                      # JavaScript模块
│   │   └── css/                     # 样式文件
│   └── config/                       # 配置文件
├── docs/                             # 项目文档
│   ├── API_REFERENCE.md             # API参考
│   ├── CHANGELOG.md                 # 版本日志
│   ├── DEPLOYMENT.md                # 部署文档
│   ├── DEVELOPMENT.md               # 开发文档
│   ├── FUNCTIONAL_SPECIFICATIONS.md # 功能规格
│   ├── MODULE_ARCHITECTURE.md       # 模块架构
│   ├── TESTING_VALIDATION.md        # 测试验证
│   └── USER_GUIDE.md                # 用户指南
├── .gitignore                       # Git忽略文件
├── LICENSE                          # 许可证
├── CHANGELOG.md                     # 项目版本日志
└── README.md                        # 项目总览
```

## 🔧 技术栈

### 后端技术栈
- **框架**: Spring Boot 3.5.7
- **语言**: Java 17
- **构建工具**: Maven
- **数据库**: MySQL 8.0.33
- **认证**: JWT (JSON Web Tokens)
- **API文档**: Swagger/OpenAPI
- **缓存**: Redis

### 前端技术栈（Vue.js版本）
- **框架**: Vue.js 3.x
- **构建工具**: Vite
- **路由**: Vue Router
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **样式**: CSS3 + SCSS

### 前端技术栈（简单HTML版本）
- **语言**: HTML5 + JavaScript + CSS3
- **库**: Vue.js 3.x (CDN)
- **样式**: 原生CSS + CSS变量

## 📚 文档

- [用户指南](docs/USER_GUIDE.md) - 详细的使用说明
- [API参考](docs/API_REFERENCE.md) - 完整的API文档
- [开发文档](docs/DEVELOPMENT.md) - 开发指南和规范
- [部署文档](docs/DEPLOYMENT.md) - 部署和运行指南
- [功能规格](docs/FUNCTIONAL_SPECIFICATIONS.md) - 系统功能描述
- [模块架构](docs/MODULE_ARCHITECTURE.md) - 系统架构设计

## 🏗️ 核心模块

### 后端核心模块
1. **硬件组件管理模块** - 硬件组件的CRUD操作
2. **兼容性检测模块** - 基于规则的硬件兼容性验证
3. **用户认证模块** - JWT认证和权限管理
4. **数据导入导出模块** - 支持批量导入导出硬件数据

### 前端核心模块
1. **组件选择模块** - 硬件组件的选择和展示
2. **兼容性检测模块** - 实时兼容性检测和结果展示
3. **智能筛选模块** - 自动过滤不兼容选项
4. **数据可视化模块** - 兼容性结果的可视化展示

## 🔍 兼容性检测规则

系统内置以下主要检测规则：

1. **CPU与主板插槽匹配** - Socket AM5 → AM5主板
2. **内存与主板DDR代数匹配** - DDR5 → DDR5主板
3. **机箱与主板尺寸兼容** - ATX主板 → 支持ATX的机箱
4. **机箱与显卡长度兼容** - 显卡长度 ≤ 机箱限长
5. **电源与组件功率兼容** - 电源功率 ≥ 所有组件功率总和

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: support@hardware-checker.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**注意**: 本项目为开源工具，兼容性检测结果仅供参考，实际装机请以官方规格为准。

*最后更新: 2025年11月13日*

## 📚 文档

- [用户指南](docs/USER_GUIDE.md) - 详细的使用说明
- [API参考](docs/API_REFERENCE.md) - 完整的API文档
- [开发文档](docs/DEVELOPMENT.md) - 开发指南和规范

## 🎯 兼容性检测规则

系统内置智能检测规则：

| 检测项目 | 类型 | 说明 |
|---------|------|------|
| CPU与主板插槽 | 关键 | 物理接口必须匹配 |
| 内存与主板DDR | 关键 | DDR代数必须一致 |
| 机箱与主板尺寸 | 关键 | 物理尺寸必须兼容 |
| 显卡与机箱长度 | 关键 | 长度不能超限 |
| 散热器与机箱高度 | 警告 | 高度兼容性检查 |
| 电源功率建议 | 建议 | 估算所需功率 |

## 🌐 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: support@hardware-checker.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**注意**: 本项目为开源工具，兼容性检测结果仅供参考，实际装机请以官方规格为准。

*最后更新: 2024年11月14日*