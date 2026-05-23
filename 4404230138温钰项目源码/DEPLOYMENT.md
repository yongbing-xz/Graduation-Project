# 项目部署指南

## 🚀 部署方式

### 方式一：本地部署（推荐）
1. 双击运行 `启动.bat` 文件
2. 浏览器会自动打开应用
3. 使用默认账号登录：demo / 123456

### 方式二：开发服务器部署
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或使用任意静态文件服务器
npx serve -s . -p 3000
```

### 方式三：静态文件部署
- 直接将整个项目文件夹上传到Web服务器
- 确保服务器支持HTML、CSS、JavaScript文件
- 支持任何静态文件托管服务（GitHub Pages、Netlify、Vercel等）

## 🔧 技术要求

### 前端环境
- 现代浏览器（Chrome 60+、Firefox 55+、Safari 12+、Edge 79+）
- 支持localStorage
- 支持ES6+语法
- 支持Vue 3.x

### 后端要求
- 无需后端服务器
- 纯静态文件部署
- 支持HTTPS（推荐）

## 📁 文件结构

```
硬件兼容性检测平台/
├── index.html              # 主应用页面
├── login.html              # 登录页面
├── 启动.bat                 # Windows启动脚本
├── DEPLOYMENT.md           # 部署指南（当前文件）
├── package.json            # 项目配置
├── config/                 # 配置文件
│   └── app-config.json    # 应用配置
├── assets/                 # 静态资源
│   ├── js/                # JavaScript模块
│   └── css/               # 样式文件
├── docs/                   # 文档
└── components.json        # 组件数据
```

## 🌐 部署到云平台

### GitHub Pages
1. 创建GitHub仓库
2. 将项目文件推送到仓库
3. 在仓库设置中启用GitHub Pages
4. 选择main分支作为源

### Netlify
1. 将项目推送到Git仓库
2. 在Netlify中连接Git仓库
3. 设置构建命令为：`npm run build`（本项目无需构建）
4. 发布目录设置为：`/`

### Vercel
1. 将项目推送到Git仓库
2. 在Vercel中导入项目
3. 框架预设选择：`Other`
4. 构建命令留空

## 🔒 安全考虑

### 数据安全
- 所有数据存储在浏览器localStorage中
- 敏感数据（如密码）使用Base64编码
- 建议在生产环境使用HTTPS

### 权限控制
- 用户认证基于前端验证
- 无服务器端会话管理
- 敏感操作需要用户确认

## 📊 性能优化

### 前端优化
- 使用CDN加载Vue.js
- 压缩CSS和JavaScript文件
- 启用浏览器缓存

### 数据优化
- 组件数据使用JSON格式存储
- 支持数据懒加载
- 实现搜索优化

## 🔄 更新维护

### 版本更新
1. 更新 `package.json` 中的版本号
2. 更新 `CHANGELOG.md` 记录变更
3. 重新部署到服务器

### 数据更新
1. 编辑 `components.json` 文件
2. 更新硬件组件数据
3. 重新部署应用

## 🐛 故障排除

### 常见问题

**问题1：页面无法正常显示**
- 检查浏览器控制台是否有错误
- 确认Vue.js CDN链接是否有效
- 检查网络连接

**问题2：登录功能异常**
- 检查浏览器是否启用了localStorage
- 确认浏览器支持ES6语法
- 清除浏览器缓存后重试

**问题3：兼容性检测不准确**
- 检查组件数据格式是否正确
- 确认使用了最新的组件数据
- 检查浏览器兼容性

### 日志检查
- 查看浏览器开发者工具Console
- 检查Network面板中的请求状态
- 确认所有资源正确加载

## 📞 支持联系

如遇部署问题，请联系：
- 项目维护者：hardware@example.com
- 文档支持：docs@example.com

---

*最后更新：2024年11月14日*