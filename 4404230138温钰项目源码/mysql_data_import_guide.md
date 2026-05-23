# MySQL数据导入指南

## 概述

本指南将帮助您将components.json中的所有组件数据导入到MySQL数据库中，实现完整的数据备份。

## 文件说明

1. **components_mysql_backup.sql** - 数据库表结构创建脚本
2. **components_mysql_inserts.sql** - 数据插入脚本（包含所有75个组件）
3. **generate_mysql_inserts.js** - 数据生成脚本（可重新生成插入脚本）

## 导入步骤

### 步骤1：准备MySQL环境

1. 确保MySQL服务器已安装并运行
2. 创建数据库：
   ```sql
   CREATE DATABASE hardware_compatibility_db;
   USE hardware_compatibility_db;
   ```

### 步骤2：创建表结构

1. 运行表结构创建脚本：
   ```bash
   mysql -u root -p hardware_compatibility_db < components_mysql_backup.sql
   ```

### 步骤3：导入数据

1. 运行数据插入脚本：
   ```bash
   mysql -u root -p hardware_compatibility_db < components_mysql_inserts.sql
   ```

### 步骤4：验证导入结果

1. 连接到MySQL数据库：
   ```bash
   mysql -u root -p hardware_compatibility_db
   ```

2. 检查各表数据量：
   ```sql
   SELECT 'components' as table_name, COUNT(*) as count FROM components
   UNION ALL
   SELECT 'cpu_specs', COUNT(*) FROM cpu_specs
   UNION ALL
   SELECT 'mb_specs', COUNT(*) FROM mb_specs
   UNION ALL
   SELECT 'gpu_specs', COUNT(*) FROM gpu_specs
   UNION ALL
   SELECT 'ram_specs', COUNT(*) FROM ram_specs
   UNION ALL
   SELECT 'nvme_specs', COUNT(*) FROM nvme_specs
   UNION ALL
   SELECT 'case_specs', COUNT(*) FROM case_specs
   UNION ALL
   SELECT 'brands', COUNT(*) FROM brands;
   ```

3. 查看组件统计视图：
   ```sql
   SELECT * FROM component_stats;
   ```

## 数据统计

根据components.json文件，本次导入包含：

- **总组件数**: 75个
- **CPU**: 10个
- **主板**: 12个  
- **显卡**: 15个
- **内存**: 13个
- **NVMe固态硬盘**: 12个
- **机箱**: 13个

## 数据库结构

### 主要表结构

1. **components** - 组件主表
2. **brands** - 品牌信息表
3. **cpu_specs** - CPU详细规格
4. **mb_specs** - 主板详细规格
5. **gpu_specs** - 显卡详细规格
6. **ram_specs** - 内存详细规格
7. **nvme_specs** - NVMe固态硬盘详细规格
8. **case_specs** - 机箱详细规格
9. **import_logs** - 导入日志表

### 视图

- **component_stats** - 组件统计视图
- **compatibility_view** - 兼容性视图

## 重新生成数据脚本

如果需要重新生成插入脚本：

```bash
cd frontend-simple
node ../generate_mysql_inserts.js
```

## 故障排除

### 常见问题

1. **字符集问题**：确保使用utf8mb4字符集
2. **外键约束**：导入前禁用外键检查
3. **数据重复**：脚本会自动清空现有数据

### 错误处理

- 如果导入失败，检查MySQL错误日志
- 确保components.json文件格式正确
- 验证数据库连接参数

## 备份策略

建议定期：

1. 导出数据库备份
2. 更新components.json文件
3. 重新生成并执行插入脚本

## 联系方式

如有问题，请参考生成的SQL脚本中的注释信息。