# Spring Boot 迁移架构设计文档

## 项目概述

将现有的硬件兼容性检测平台从纯前端架构迁移到Spring Boot前后端分离架构。

## 技术栈选择

### 后端技术栈
- **框架**: Spring Boot 3.x
- **安全**: Spring Security + JWT
- **数据访问**: Spring Data JPA + MySQL
- **缓存**: Redis
- **API文档**: Swagger/OpenAPI 3.0
- **构建工具**: Maven

### 前端技术栈（保持）
- **框架**: Vue 3
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **构建工具**: Vite

### 数据库设计
- **主数据库**: MySQL 8.0
- **缓存数据库**: Redis 7.0

## 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端Vue应用    │    │  Spring Boot后端 │    │     数据库层     │
│                 │    │                 │    │                 │
│ • 用户界面      │◄──►│ • 认证授权      │◄──►│ • MySQL主库     │
│ • 组件选择      │    │ • 组件管理      │    │ • Redis缓存     │
│ • 兼容性检测    │    │ • 兼容性引擎    │    │                 │
│ • 数据可视化    │    │ • API接口       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 包结构设计

```
src/main/java/com/hardware/compatibility/
├── config/                 # 配置类
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── RedisConfig.java
├── controller/            # 控制器层
│   ├── AuthController.java
│   ├── ComponentController.java
│   ├── CompatibilityController.java
│   └── UserConfigController.java
├── service/              # 业务逻辑层
│   ├── impl/
│   │   ├── UserServiceImpl.java
│   │   ├── ComponentServiceImpl.java
│   │   └── CompatibilityServiceImpl.java
│   ├── UserService.java
│   ├── ComponentService.java
│   └── CompatibilityService.java
├── repository/           # 数据访问层
│   ├── UserRepository.java
│   ├── ComponentRepository.java
│   └── CompatibilityRuleRepository.java
├── entity/               # 实体类
│   ├── User.java
│   ├── Component.java
│   ├── ComponentCategory.java
│   └── CompatibilityRule.java
├── dto/                  # 数据传输对象
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── ComponentRequest.java
│   │   └── CompatibilityCheckRequest.java
│   └── response/
│       ├── ApiResponse.java
│       ├── LoginResponse.java
│       └── CompatibilityResult.java
└── util/                 # 工具类
    ├── JwtUtil.java
    ├── DataValidator.java
    └── CacheUtil.java
```

## 数据库设计

### 核心表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### 硬件组件表 (hardware_components)
```sql
CREATE TABLE hardware_components (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('CPU', 'MOTHERBOARD', 'GPU', 'RAM', 'NVME', 'CASE') NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    specifications JSON NOT NULL,
    compatibility_rules JSON,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 用户配置表 (user_configurations)
```sql
CREATE TABLE user_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    configuration_name VARCHAR(100) NOT NULL,
    components JSON NOT NULL,
    compatibility_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 兼容性规则表 (compatibility_rules)
```sql
CREATE TABLE compatibility_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(100) UNIQUE NOT NULL,
    rule_type ENUM('CRITICAL', 'WARNING', 'RECOMMENDATION') NOT NULL,
    description TEXT,
    rule_condition JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API接口设计

### 认证相关接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户信息

### 组件管理接口
- `GET /api/components` - 获取组件列表
- `GET /api/components/{id}` - 获取组件详情
- `POST /api/components` - 创建组件
- `PUT /api/components/{id}` - 更新组件
- `DELETE /api/components/{id}` - 删除组件
- `GET /api/components/categories/{category}` - 按类别获取组件

### 兼容性检测接口
- `POST /api/compatibility/check` - 检测组件兼容性
- `GET /api/compatibility/rules` - 获取兼容性规则
- `POST /api/compatibility/rules` - 创建兼容性规则

### 用户配置接口
- `GET /api/configurations` - 获取用户配置列表
- `POST /api/configurations` - 创建用户配置
- `GET /api/configurations/{id}` - 获取配置详情
- `PUT /api/configurations/{id}` - 更新配置
- `DELETE /api/configurations/{id}` - 删除配置

## 安全设计

### 认证机制
- JWT Token认证
- 密码加密存储（BCrypt）
- Token刷新机制
- 登录失败限制

### 授权控制
- 基于角色的访问控制（RBAC）
- 接口权限验证
- 数据权限隔离

### 数据安全
- SQL注入防护
- XSS攻击防护
- CSRF防护
- 敏感数据加密

## 性能优化策略

### 缓存策略
- Redis缓存热点数据
- 组件数据缓存
- 兼容性结果缓存
- 查询结果缓存

### 数据库优化
- 合理索引设计
- 查询优化
- 分页查询支持
- 连接池配置

### 前端优化
- 组件懒加载
- 图片压缩
- CDN加速
- 浏览器缓存

## 迁移策略

### 阶段一：后端基础架构（2周）
1. Spring Boot项目初始化
2. 数据库设计和实体类创建
3. 基础认证授权实现
4. 核心API接口开发

### 阶段二：业务逻辑迁移（3周）
1. 组件管理功能迁移
2. 兼容性检测引擎迁移
3. 数据导入导出功能
4. 用户配置管理

### 阶段三：前端改造（2周）
1. API接口集成
2. 状态管理重构
3. 用户界面优化
4. 错误处理完善

### 阶段四：测试部署（1周）
1. 单元测试和集成测试
2. 性能测试
3. 生产环境部署
4. 监控和日志

## 风险评估和应对

### 技术风险
1. **数据迁移风险** - 制定详细的数据迁移方案
2. **性能问题** - 充分的性能测试和优化
3. **兼容性问题** - 保持API兼容性

### 业务风险
1. **用户迁移难度** - 提供平滑的迁移工具
2. **功能差异** - 确保核心功能一致性
3. **部署复杂性** - 自动化部署流程

## 监控和运维

### 应用监控
- 应用健康检查
- 性能指标监控
- 错误日志收集
- 用户行为分析

### 数据库监控
- 连接池监控
- 慢查询监控
- 数据库性能监控
- 备份恢复机制

### 日志管理
- 结构化日志
- 日志分级
- 日志聚合
- 异常告警

## 扩展性设计

### 水平扩展
- 无状态设计支持水平扩展
- 负载均衡配置
- 数据库读写分离

### 功能扩展
- 插件化架构设计
- API版本管理
- 微服务化准备

## 总结

本架构设计提供了从现有前端应用到Spring Boot前后端分离架构的完整迁移方案。通过合理的模块划分、安全设计、性能优化和分阶段迁移策略，确保迁移过程的平稳可控。