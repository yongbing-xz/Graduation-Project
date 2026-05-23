# 项目稳定性查验系统

## 📋 概述

项目稳定性查验系统是一个全面的自动化测试框架，用于持续监控和验证项目的功能稳定性。系统采用模块化设计，支持多环境测试、定期调度、错误预警和详细报告生成。

## 🎯 核心特性

- ✅ **自动化测试框架** - 覆盖核心功能、兼容性、性能和集成测试
- ⏰ **定期执行机制** - 支持每日、每周、每月自动测试调度
- 🚨 **错误预警机制** - 多渠道通知（控制台、邮件、Slack）
- 📊 **详细报告生成** - JSON和HTML格式的测试报告
- 🔧 **环境一致性验证** - 多环境配置检查和验证
- 📈 **稳定性指标监控** - 测试通过率、性能指标、错误率等
- 🔄 **可维护性和扩展性** - 模块化设计，易于维护和扩展

## 📁 系统架构

```
tests/
├── main.js                    # 主控制脚本
├── test-runner.js            # 测试运行器
├── alert-system.js           # 警报系统
├── environment-validator.js   # 环境验证器
├── scheduler.js              # 调度器
├── stability-metrics.js      # 稳定性指标
├── test-manager.js           # 测试管理器
├── config/
│   └── test-config.json      # 配置文件
├── test-cases/               # 测试用例目录
│   ├── core/                 # 核心功能测试
│   ├── compatibility/        # 兼容性测试
│   ├── performance/          # 性能测试
│   └── integration/          # 集成测试
└── reports/                  # 测试报告目录
```

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 2. 安装依赖

```bash
cd tests
npm install
```

### 3. 初始化系统

```bash
npm run init
```

### 4. 执行测试

```bash
# 执行完整测试套件
npm run full-test

# 执行快速测试
npm run quick-test

# 验证特定环境
npm run validate-env production
```

## 📖 详细使用指南

### 命令行接口

系统提供丰富的命令行接口，支持多种操作模式：

```bash
# 初始化系统
node main.js init

# 执行完整测试套件
node main.js full-test

# 执行快速测试（仅核心功能）
node main.js quick-test

# 验证环境配置
node main.js validate-env [environment]

# 启动测试调度器
node main.js start-scheduler

# 停止测试调度器
node main.js stop-scheduler

# 生成综合报告
node main.js generate-report

# 查看系统状态
node main.js status
```

### 配置说明

系统配置文件位于 `config/test-config.json`，主要配置项包括：

```json
{
  "stability": {
    "testPassRate": 99.5,
    "maxResponseTime": 3000,
    "errorThreshold": 1
  },
  "environments": {
    "development": { "baseUrl": "http://localhost:8000", "timeout": 30000 },
    "testing": { "baseUrl": "http://localhost:8000", "timeout": 30000 },
    "production": { "baseUrl": "http://localhost:8000", "timeout": 30000 }
  },
  "notifications": {
    "email": { "enabled": false },
    "slack": { "enabled": false }
  },
  "reports": {
    "generateHtml": true,
    "generateJson": true,
    "saveScreenshots": false
  }
}
```

### 测试用例管理

系统支持测试用例的自动发现和管理：

- **测试用例目录结构**：按功能模块组织测试用例
- **自动加载机制**：系统自动扫描并加载测试用例
- **覆盖率分析**：提供测试覆盖率统计和分析
- **维护报告**：生成测试用例维护建议报告

## 🔧 部署指南

### 开发环境部署

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd project-stability-checker
   ```

2. **安装依赖**
   ```bash
   cd tests
   npm install
   ```

3. **配置环境**
   ```bash
   # 编辑配置文件
   cp config/test-config.json config/test-config.local.json
   # 修改配置参数
   ```

4. **启动系统**
   ```bash
   npm run init
   npm run full-test
   ```

### 生产环境部署

1. **环境准备**
   ```bash
   # 确保Node.js环境
   node --version
   
   # 创建专用用户
   sudo useradd -r -s /bin/false stability-checker
   ```

2. **部署代码**
   ```bash
   # 创建部署目录
   sudo mkdir -p /opt/stability-checker
   sudo chown stability-checker:stability-checker /opt/stability-checker
   
   # 部署代码
   sudo -u stability-checker git clone <repository-url> /opt/stability-checker
   ```

3. **配置服务**
   ```bash
   # 创建systemd服务文件
   sudo nano /etc/systemd/system/stability-checker.service
   ```

   ```ini
   [Unit]
   Description=Project Stability Checker
   After=network.target
   
   [Service]
   Type=simple
   User=stability-checker
   WorkingDirectory=/opt/stability-checker/tests
   ExecStart=/usr/bin/node main.js start-scheduler
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **启动服务**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable stability-checker
   sudo systemctl start stability-checker
   sudo systemctl status stability-checker
   ```

### CI/CD集成

系统支持与常见CI/CD工具集成：

**GitHub Actions 示例**
```yaml
name: Stability Check
on: [push, pull_request]

jobs:
  stability-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd tests
        npm install
    
    - name: Run stability tests
      run: |
        cd tests
        npm run full-test
    
    - name: Upload test reports
      uses: actions/upload-artifact@v3
      with:
        name: stability-reports
        path: tests/reports/
```

## 📊 监控和报告

### 稳定性指标

系统监控以下关键指标：

- **测试通过率**：目标 ≥ 99.5%
- **平均响应时间**：目标 < 3000ms
- **错误率**：目标 < 1%
- **测试覆盖率**：目标 ≥ 80%

### 报告格式

系统生成两种格式的报告：

1. **JSON报告**：包含详细的测试数据和指标
2. **HTML报告**：可视化展示测试结果和趋势

### 警报通知

支持多种通知渠道：

- **控制台输出**：实时显示测试进度和结果
- **邮件通知**：配置SMTP服务器发送邮件
- **Slack通知**：集成Slack Webhook发送消息

## 🔄 维护和扩展

### 添加新测试用例

1. **创建测试文件**
   ```javascript
   // tests/test-cases/core/new-feature.test.js
   class NewFeatureTest {
     async testNewFunctionality() {
       // 测试逻辑
     }
   }
   
   module.exports = NewFeatureTest;
   ```

2. **测试用例会自动被系统发现和加载**

### 自定义配置

1. **环境特定配置**
   ```bash
   # 创建环境特定配置文件
   cp config/test-config.json config/test-config.production.json
   ```

2. **运行时指定配置**
   ```bash
   node main.js full-test --config config/test-config.production.json
   ```

### 扩展通知渠道

在 `alert-system.js` 中添加新的通知渠道：

```javascript
class CustomNotificationChannel {
  async sendAlert(alert) {
    // 自定义通知逻辑
  }
}
```

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **测试执行超时**
   ```bash
   # 增加超时时间
   node main.js full-test --timeout 60000
   ```

3. **环境验证失败**
   ```bash
   # 检查环境配置
   node main.js validate-env --verbose
   ```

### 日志文件

系统日志位于 `logs/` 目录：

- `execution.log` - 执行日志
- `error.log` - 错误日志
- `notification.log` - 通知日志

## 📞 技术支持

如有问题或建议，请联系：

- **项目维护者**：Project Stability Team
- **文档更新**：请提交Pull Request
- **问题报告**：创建GitHub Issue

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。