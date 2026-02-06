---
title: MySQL 性能优化实战指南
date: 2025-08-22
category: 技术
tags:
  - MySQL
  - 数据库
  - 性能优化
description: 从索引设计、SQL 优化到架构调优，全面介绍 MySQL 性能优化的方法和技巧。
---

# MySQL 性能优化实战指南

数据库性能直接影响系统的整体性能，本文分享 MySQL 优化的实战经验。

## 索引优化

### 索引设计原则

1. **选择性高的列**：区分度高的列适合建索引
2. **最左前缀原则**：联合索引遵循最左匹配
3. **覆盖索引**：避免回表查询
4. **避免过多索引**：影响写入性能

### 索引示例

```sql
-- 单列索引
CREATE INDEX idx_user_name ON user(name);

-- 联合索引
CREATE INDEX idx_user_age_city ON user(age, city);

-- 唯一索引
CREATE UNIQUE INDEX idx_user_email ON user(email);

-- 全文索引
CREATE FULLTEXT INDEX idx_content ON article(content);
```

## SQL 优化

### 慢查询优化

```sql
-- 查看执行计划
EXPLAIN SELECT * FROM user WHERE age > 18;

-- 避免 SELECT *
SELECT id, name, age FROM user;

-- 使用 LIMIT 限制结果集
SELECT * FROM user LIMIT 100;

-- 避免 OR，使用 UNION
SELECT * FROM user WHERE city = 'Beijing'
UNION ALL
SELECT * FROM user WHERE city = 'Shanghai';
```

### JOIN 优化

```sql
-- 小表驱动大表
SELECT u.*, o.order_no
FROM user u
INNER JOIN order o ON u.id = o.user_id
WHERE u.city = 'Beijing';

-- 避免子查询，使用 JOIN
SELECT u.*
FROM user u
INNER JOIN (
    SELECT DISTINCT user_id FROM order
) o ON u.id = o.user_id;
```

## 配置优化

### 关键参数

```ini
# InnoDB 缓冲池大小（服务器内存的 70-80%）
innodb_buffer_pool_size = 8G

# 连接数
max_connections = 500

# 查询缓存
query_cache_size = 64M

# 日志文件大小
innodb_log_file_size = 512M
```

## 架构优化

### 读写分离

```
应用层
  ↓
  ├─→ 主库（写）
  └─→ 从库（读）
```

### 分库分表

- **垂直拆分**：按业务模块拆分
- **水平拆分**：按数据范围拆分

```sql
-- 按用户 ID 取模分表
user_0, user_1, user_2, ... user_9
```

## 监控与诊断

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';

-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看锁等待
SHOW ENGINE INNODB STATUS;
```

## 总结

MySQL 优化是一个持续的过程，需要结合业务场景不断调整和改进。
