# 错误发现系统和日志留存系统使用指南

## 📋 系统概述

本项目已完整实现企业级错误发现系统和日志留存系统，包含前端错误捕获、后端监控、结构化日志、实时告警等功能。

---

## 🛠️ 后端系统

### 1. 专业的日志配置

**文件**: `backend/src/main/resources/logback-spring.xml`

**功能特点**:
- 📁 **分类日志**: 自动分为所有日志、错误日志、业务日志、安全日志
- 🔄 **日志轮转**: 按时间和大小自动轮转，支持gzip压缩
- 📊 **结构化输出**: JSON格式，便于日志分析
- ⚡ **异步输出**: 提高性能，不阻塞业务线程

**日志文件**:
```
logs/
├── hardware-compatibility.log          # 所有日志
├── hardware-compatibility-error.log    # 错误日志
├── hardware-compatibility-business.log  # 业务日志
└── hardware-compatibility-security.log  # 安全日志
```

### 2. 全局异常处理

**文件**: `backend/src/main/java/com/hardware/compatibility/config/GlobalExceptionHandler.java`

**处理的异常类型**:
- ✅ 认证异常 (AuthenticationException)
- ✅ 权限异常 (AccessDeniedException)  
- ✅ 实体不存在 (EntityNotFoundException)
- ✅ 参数验证异常 (MethodArgumentNotValidException)
- ✅ 运行时异常 (RuntimeException)
- ✅ HTTP方法不支持异常
- ✅ 媒体类型异常
- ✅ 缺失参数异常
- ✅ 类型不匹配异常

**监控集成**: 所有异常都会自动记录到监控系统

### 3. 系统监控服务

**接口**: `MonitoringService`
**实现**: `MonitoringServiceImpl`

**监控指标**:
- 🔥 **CPU使用率**: 实时监控，超过80%告警
- 💾 **内存使用率**: 超过85%告警  
- 💿 **磁盘使用率**: 超过90%告警
- 📊 **业务指标**: 自定义业务指标统计
- 🚨 **错误统计**: 按类型、级别、时间统计

**健康检查**:
- 数据库连接状态
- 缓存系统状态  
- 系统资源使用情况
- 应用整体健康状态

### 4. 错误上报API

**接口**: `POST /api/monitoring/errors/report`

**前端错误上报格式**:
```json
{
  "type": "javascript",
  "level": "high", 
  "message": "错误消息",
  "stack": "错误堆栈",
  "filename": "文件名",
  "lineno": 123,
  "url": "当前页面",
  "userAgent": "浏览器信息",
  "timestamp": "时间戳"
}
```

### 5. 日志分析API

**主要接口**:
- `GET /api/logs/query` - 查询日志
- `GET /api/logs/statistics` - 获取日志统计
- `GET /api/logs/error-trend` - 错误趋势分析
- `GET /api/logs/top-errors` - 热门错误
- `GET /api/logs/trace/{traceId}` - 调用链追踪
- `GET /api/logs/dashboard` - 分析面板

---

## 🌐 前端系统

### 1. Vue.js版本错误处理

**文件**: `frontend/src/utils/errorHandler.js`

**错误捕获类型**:
- 🌐 **JavaScript错误**: window.onerror
- 🔄 **Promise错误**: unhandledrejection
- 📡 **网络错误**: online/offline事件
- ⚡ **Vue错误**: errorHandler
- 🌐 **HTTP错误**: Axios拦截器

**功能特点**:
- 📝 **错误历史**: 本地存储最多100条记录
- 🔄 **自动重试**: 网络恢复后重试失败的上报
- 🔒 **敏感信息过滤**: 自动过滤密码、token等
- 📊 **错误分级**: low/medium/high/critical
- 🎨 **友好提示**: 根据错误类型显示友好消息

### 2. 简单HTML版本错误处理

**文件**: `frontend-simple/assets/js/error-handler.js`

**功能特点**:
- 📱 **轻量级实现**: 无依赖，纯JavaScript
- 🔔 **可视化通知**: 优雅的错误通知弹窗
- 📊 **错误历史面板**: Ctrl+Shift+E 查看历史
- 💾 **本地存储**: 错误历史持久化
- 📥 **报告导出**: JSON格式错误报告

---

## 🎯 使用方法

### 后端启动

```bash
# 进入后端目录
cd backend

# 启动应用
mvn spring-boot:run
```

访问监控端点:
- 🏥 **健康检查**: http://localhost:8080/api/monitoring/health
- 📊 **监控面板**: http://localhost:8080/api/monitoring/dashboard  
- 📋 **日志面板**: http://localhost:8080/api/logs/dashboard
- 📈 **Prometheus指标**: http://localhost:8080/actuator/prometheus

### 前端集成

**Vue.js版本**:
```javascript
// main.js 已自动集成
import { globalErrorHandler } from '@/utils/errorHandler'

// 业务错误处理
import { handleBusinessError } from '@/utils/errorHandler'
handleBusinessError('用户操作失败', 'medium')
```

**HTML版本**:
```html
<!-- 在页面中引入 -->
<script src="assets/js/error-handler.js"></script>

<!-- 手动触发错误 -->
<script>
window.showError('这是一个错误', 'error');
window.handleBusinessError('业务逻辑错误', 'high');
</script>
```

---

## 🔧 配置说明

### 日志级别配置

```yaml
# application.yml
logging:
  level:
    root: info                    # 全局级别
    com.hardware.compatibility: debug  # 应用级别
    org.springframework.security: debug # 安全级别
```

### 监控阈值配置

```java
// MonitoringServiceImpl.java
private static final double CPU_ALERT_THRESHOLD = 80.0;      // CPU告警阈值
private static final double MEMORY_ALERT_THRESHOLD = 85.0;   // 内存告警阈值  
private static final double DISK_ALERT_THRESHOLD = 90.0;     // 磁盘告警阈值
```

### 日志保留策略

```xml
<!-- logback-spring.xml -->
<maxHistory>30</maxHistory>        <!-- 保留30天 -->
<totalSizeCap>1GB</totalSizeCap>    <!-- 总大小1GB -->
<maxFileSize>50MB</maxFileSize>     <!-- 单文件50MB -->
```

---

## 📊 监控面板功能

### 1. 系统健康监控
- 🟢 **状态概览**: 系统整体健康状态
- 💻 **资源监控**: CPU、内存、磁盘使用率
- 🗄️ **数据源监控**: 数据库、缓存连接状态
- 📈 **实时指标**: 错误数、告警数统计

### 2. 错误分析
- 📊 **错误趋势**: 按时间维度的错误趋势图
- 🔥 **热门错误**: 频率最高的错误列表
- 📋 **错误分类**: 按类型、级别统计
- 🔍 **错误搜索**: 全文搜索错误内容

### 3. 调用链追踪
- 🏷️ **Trace ID**: 完整的请求调用链
- ⏱️ **性能分析**: 各环节耗时统计
- 📍 **错误定位**: 快速定位错误发生位置

---

## 🚨 告警机制

### 自动告警触发条件
- 🖥️ **资源告警**: CPU > 80%, 内存 > 85%, 磁盘 > 90%
- ❌ **错误率告警**: 错误率超过阈值
- 🚫 **服务不可用**: 数据库、缓存连接失败
- 🆘 **严重异常**: 系统级别异常

### 告警级别
- 🔵 **INFO**: 信息提示
- 🟡 **WARNING**: 警告信息
- 🔴 **HIGH**: 高风险错误
- 🟣 **CRITICAL**: 严重错误

---

## 🔍 故障排查指南

### 1. 查看实时日志
```bash
# 查看所有日志
tail -f logs/hardware-compatibility.log

# 查看错误日志
tail -f logs/hardware-compatibility-error.log
```

### 2. 查看系统状态
```bash
# 健康检查
curl http://localhost:8080/api/monitoring/health

# 系统资源
curl http://localhost:8080/api/monitoring/resources
```

### 3. 错误排查步骤
1. 📋 **查看错误历史**: 前端按 `Ctrl+Shift+E`
2. 🔍 **搜索日志**: 使用关键词搜索相关错误
3. 📊 **分析趋势**: 查看错误发生的时间模式
4. 🔗 **调用链追踪**: 通过Trace ID分析完整调用过程
5. 🛠️ **定位根因**: 根据错误堆栈和上下文定位问题

---

## 📈 性能优化建议

### 1. 日志优化
- 🎯 **合理设置日志级别**: 生产环境使用INFO或WARN
- ⚡ **异步日志**: 已配置，提高性能
- 💾 **定期清理**: 设置合适的日志保留策略

### 2. 监控优化
- 📊 **指标采样**: 避免过高频率的指标采集
- 🎯 **告警聚合**: 避免告警风暴
- 💾 **数据压缩**: 历史数据压缩存储

---

## 🔗 相关链接

- 📖 **Spring Boot Actuator**: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- 📊 **Logback配置**: http://logback.qos.ch/manual/index.html  
- 🔍 **Prometheus**: https://prometheus.io/
- 📈 **Grafana**: https://grafana.com/

---

## 🎉 总结

错误发现系统和日志留存系统已完全集成到项目中，提供：

✅ **完整的错误捕获** - 前后端全覆盖  
✅ **结构化日志** - 便于分析和检索  
✅ **实时监控** - 系统状态实时感知  
✅ **智能告警** - 及时发现和通知问题  
✅ **可视化面板** - 直观的监控和分析界面  
✅ **调用链追踪** - 快速定位问题根因  
✅ **性能指标** - 全面的性能监控  

系统现在具备了企业级的可观测性和故障处理能力！ 🚀