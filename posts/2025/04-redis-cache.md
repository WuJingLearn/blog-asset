---
title: Redis 缓存应用实践
date: 2025-04-20
category: 技术
tags:
  - Redis
  - 缓存
  - 性能优化
description: 深入探讨 Redis 在实际项目中的缓存应用，包括缓存策略、数据结构选择和常见问题解决。
---

# Redis 缓存应用实践

Redis 是最流行的内存数据库，广泛应用于缓存、会话管理、消息队列等场景。

## Redis 数据结构

Redis 支持多种数据结构：

- **String**：简单的键值对
- **Hash**：哈希表，适合存储对象
- **List**：列表，支持队列操作
- **Set**：集合，自动去重
- **ZSet**：有序集合，支持排序

## 缓存策略

### 缓存更新策略

1. **Cache Aside**：先更新数据库，再删除缓存
2. **Read/Write Through**：缓存作为主要存储
3. **Write Behind**：异步写入数据库

### 代码示例

```java
@Service
public class UserService {
    @Autowired
    private RedisTemplate<String, User> redisTemplate;
    
    public User getUser(Long id) {
        String key = "user:" + id;
        User user = redisTemplate.opsForValue().get(key);
        if (user == null) {
            user = userMapper.findById(id);
            redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
        }
        return user;
    }
}
```

## 常见问题

- **缓存穿透**：查询不存在的数据
- **缓存击穿**：热点数据过期
- **缓存雪崩**：大量缓存同时失效

## 解决方案

- 使用布隆过滤器
- 设置热点数据永不过期
- 设置随机过期时间

合理使用 Redis 可以大幅提升系统性能。
