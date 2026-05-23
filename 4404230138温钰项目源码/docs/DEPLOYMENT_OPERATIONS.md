# 部署与运维指南

## 概述

本文档提供硬件兼容性检测平台的完整部署和运维指南，涵盖从开发环境搭建到生产环境部署的全流程。

## 1. 环境要求

### 1.1 开发环境要求

#### 硬件要求
- **内存**: 最低 4GB，推荐 8GB+
- **存储**: 最低 1GB 可用空间
- **处理器**: 双核以上处理器

#### 软件要求
- **操作系统**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Node.js**: 版本 14.x 或更高
- **npm**: 版本 6.x 或更高
- **Git**: 版本 2.x 或更高
- **浏览器**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

### 1.2 生产环境要求

#### 服务器要求
- **Web服务器**: Nginx, Apache, 或任何支持静态文件的服务器
- **内存**: 最低 2GB，推荐 4GB+
- **存储**: 最低 500MB 可用空间
- **带宽**: 根据用户量确定，推荐 10Mbps+

#### 网络要求
- **HTTPS**: 推荐启用 HTTPS
- **CDN**: 可选，用于加速静态资源加载
- **域名**: 推荐使用自定义域名

## 2. 开发环境搭建

### 2.1 环境准备

#### 安装 Node.js 和 npm
```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本  
npm --version

# 如果未安装，请从官网下载安装
# https://nodejs.org/
```

#### 获取项目代码
```bash
# 克隆项目（如果使用 Git）
git clone <repository-url>

# 或者直接下载项目文件
# 解压到目标目录
```

### 2.2 本地开发服务器

#### 使用 Python 简单服务器
```bash
# 进入项目目录
cd "c:\Users\admin\Desktop\copliot (2)"

# 启动 Python HTTP 服务器
python -m http.server 8000

# 或者使用 Python 3
python3 -m http.server 8000

# 访问 http://localhost:8000
```

#### 使用 Node.js 服务器（推荐）
```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000 -c-1

# 访问 http://localhost:8000
```

### 2.3 开发工具配置

#### 代码编辑器推荐
- **Visual Studio Code**（推荐）
- **WebStorm**
- **Sublime Text**

#### VS Code 扩展推荐
```json
{
  "推荐扩展": [
    "es6-string-html",
    "HTML CSS Support", 
    "Live Server",
    "Prettier - Code formatter",
    "Vue Language Features (Volar)"
  ]
}
```

## 3. 构建与打包

### 3.1 构建流程

#### 手动构建步骤
```bash
# 1. 代码检查
# 检查 HTML、CSS、JavaScript 语法

# 2. 资源优化
# 压缩 CSS 和 JavaScript 文件
# 优化图片资源

# 3. 版本管理
# 添加版本号到静态资源 URL
```

#### 构建脚本示例
```javascript
// build.js - 简单的构建脚本
const fs = require('fs');
const path = require('path');

// 复制文件到构建目录
function copyFiles() {
  const filesToCopy = [
    'index.html',
    'login.html', 
    '未命名.html',
    '未命名 - 副本.html',
    'style.css',
    'script.js'
  ];
  
  filesToCopy.forEach(file => {
    const source = path.join(__dirname, file);
    const dest = path.join(__dirname, 'dist', file);
    
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
      console.log(`已复制: ${file}`);
    }
  });
}

// 执行构建
copyFiles();
```

### 3.2 打包优化

#### 资源压缩
- **HTML**: 移除空白字符和注释
- **CSS**: 使用 CSS 压缩工具
- **JavaScript**: 使用 UglifyJS 或 Terser
- **图片**: 使用 imagemin 优化

#### 缓存策略
```html
<!-- 添加版本号到资源 URL -->
<link rel="stylesheet" href="style.css?v=1.0.0">
<script src="script.js?v=1.0.0"></script>
```

## 4. 生产环境部署

### 4.1 静态文件部署

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/hardware-compatibility;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 缓存设置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache 配置示例
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/hardware-compatibility
    
    # 启用压缩
    SetOutputFilter DEFLATE
    
    # 缓存设置
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public"
    </FilesMatch>
    
    # HTML 文件不缓存
    <FilesMatch "\.html$">
        ExpiresActive On
        ExpiresDefault "access plus 0 seconds"
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </FilesMatch>
    
    # SPA 路由重写
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

### 4.2 HTTPS 配置

#### 使用 Let's Encrypt
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期设置
sudo certbot renew --dry-run
```

#### Nginx HTTPS 配置
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 安全头设置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 其他配置同 HTTP 版本
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 5. 监控与维护

### 5.1 性能监控

#### 基础监控指标
- **页面加载时间**: 目标 < 3秒
- **API 响应时间**: 目标 < 500ms
- **错误率**: 目标 < 1%
- **用户活跃度**: 日活跃用户统计

#### 监控工具推荐
- **Google Analytics**: 用户行为分析
- **GTmetrix**: 页面性能测试
- **Pingdom**: 可用性监控
- **New Relic**: 应用性能监控

### 5.2 日志管理

#### 应用日志
```javascript
// 日志记录函数
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // 发送到日志服务（可选）
    // 或记录到 localStorage 供调试
    console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`);
}
```

#### 错误日志收集
```javascript
// 全局错误处理
window.addEventListener('error', function(event) {
    log(`JavaScript Error: ${event.message} at ${event.filename}:${event.lineno}`, 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    log(`Unhandled Promise Rejection: ${event.reason}`, 'error');
});
```

### 5.3 备份策略

#### 数据备份
```javascript
// 自动备份用户数据
function autoBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
            selectedComponents: loadData('selected_components'),
            userConfig: loadData('user_configuration'),
            searchHistory: loadData('search_history')
        }
    };
    
    // 保存备份
    saveData('backup_' + Date.now(), backupData);
    
    // 清理旧备份（保留最近5个）
    cleanupOldBackups(5);
}

// 每小时执行一次备份
setInterval(autoBackup, 60 * 60 * 1000);
```

## 6. 故障排除

### 6.1 常见问题

#### 页面无法加载
- **检查**: 服务器是否运行，端口是否被占用
- **解决**: 重启服务器，更换端口

#### 数据导入失败
- **检查**: 文件格式是否正确，网络连接是否正常
- **解决**: 验证文件格式，检查网络连接

#### 兼容性检测异常
- **检查**: 组件数据格式是否正确
- **解决**: 验证数据完整性，重新导入数据

### 6.2 调试技巧

#### 浏览器开发者工具
```javascript
// 启用详细日志
localStorage.setItem('debug', 'true');

// 检查 localStorage 数据
console.log('Current data:', {
    components: localStorage.getItem('hardware_component_data'),
    config: localStorage.getItem('user_configuration')
});
```

#### 性能分析
```javascript
// 性能测量
console.time('compatibilityCheck');
// 执行兼容性检测
console.timeEnd('compatibilityCheck');
```

## 7. 更新与升级

### 7.1 版本管理

#### 版本号规范
- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

#### 更新流程
1. **测试**: 在测试环境验证新版本
2. **备份**: 备份当前生产环境数据
3. **部署**: 部署新版本文件
4. **验证**: 验证功能正常
5. **回滚**: 准备回滚方案

### 7.2 数据迁移

#### 迁移脚本示例
```javascript
function migrateData(fromVersion, toVersion) {
    // 检查当前数据版本
    const currentVersion = getDataVersion();
    
    if (currentVersion === fromVersion) {
        // 执行迁移逻辑
        migrateComponentsData();
        migrateUserPreferences();
        
        // 更新版本号
        setDataVersion(toVersion);
        
        log(`数据从 ${fromVersion} 迁移到 ${toVersion} 完成`);
    }
}
```

## 8. 安全最佳实践

### 8.1 前端安全

#### XSS 防护
```javascript
// 输入验证和转义
function sanitizeInput(input) {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
```

#### CSP 策略
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### 8.2 数据安全

#### 敏感数据处理
```javascript
// 不存储敏感信息
function cleanSensitiveData(data) {
    const { password, apiKey, ...cleanData } = data;
    return cleanData;
}
```

---

## 附录

### A. 常用命令速查

```bash
# 开发服务器
python -m http.server 8000
http-server -p 8000 -c-1

# 构建检查
node build.js

# 文件检查
find . -name "*.html" -exec wc -l {} +
```

### B. 联系支持

- **项目文档**: 查看 docs/ 目录
- **问题反馈**: 创建 GitHub Issue
- **紧急支持**: 联系项目维护者

---

*最后更新: 2024年11月14日*
*文档版本: v1.0.0*