---
title: Redis 基本介绍
date: 2026-02-06
category: Redis
tags: [Redis, 数据库, NoSQL, 缓存, 后端]
description: 全面介绍 Redis 的基本概念、核心特性、数据类型和应用场景，帮助你快速了解这个强大的内存数据库。
---

# Redis 基本介绍

## 什么是 Redis

**Redis**（Remote Dictionary Server）是一个开源的、基于内存的高性能键值对（Key-Value）数据库。它不仅仅是一个简单的缓存系统，更是一个功能强大的数据结构服务器。

### 核心特点

- 🚀 **极快的速度**：基于内存存储，读写速度极快
- 💾 **持久化支持**：可以将内存中的数据保存到磁盘
- 🔧 **丰富的数据类型**：支持多种数据结构
- 🌐 **分布式支持**：支持主从复制、哨兵模式、集群模式
- 🔒 **原子性操作**：所有操作都是原子性的

## Redis 的主要特性

### 1. 高性能

```
读取速度：110000 次/秒
写入速度：81000 次/秒
```

Redis 将所有数据存储在内存中，因此访问速度非常快，适合需要快速响应的场景。

### 2. 数据持久化

Redis 提供两种持久化方式：

**RDB（Redis Database）**
- 在指定时间间隔内生成数据快照
- 适合备份和灾难恢复
- 性能影响小

**AOF（Append Only File）**
- 记录每次写操作
- 数据更安全，丢失风险小
- 文件体积较大

### 3. 丰富的数据类型

Redis 支持多种数据结构：

#### String（字符串）
```redis
SET name "Redis"
GET name
```
- 最基本的类型
- 可以存储字符串、整数、浮点数
- 最大 512MB

#### List（列表）
```redis
LPUSH mylist "world"
LPUSH mylist "hello"
LRANGE mylist 0 -1
```
- 有序的字符串列表
- 支持从两端插入和删除
- 适合消息队列、时间线

#### Hash（哈希）
```redis
HSET user:1 name "张三"
HSET user:1 age 25
HGETALL user:1
```
- 键值对集合
- 适合存储对象
- 节省内存

#### Set（集合）
```redis
SADD tags "redis"
SADD tags "database"
SMEMBERS tags
```
- 无序的唯一字符串集合
- 支持交集、并集、差集运算
- 适合标签、好友关系

#### Sorted Set（有序集合）
```redis
ZADD leaderboard 100 "player1"
ZADD leaderboard 200 "player2"
ZRANGE leaderboard 0 -1 WITHSCORES
```
- 带分数的有序集合
- 自动按分数排序
- 适合排行榜、优先级队列

## Redis 的应用场景

### 1. 缓存系统

```java
// 查询用户信息，先从 Redis 获取
String userJson = redis.get("user:" + userId);
if (userJson == null) {
    // 缓存未命中，从数据库查询
    User user = userDao.findById(userId);
    // 写入缓存
    redis.set("user:" + userId, JSON.toJSONString(user));
    return user;
}
return JSON.parseObject(userJson, User.class);
```

**优势：**
- 减轻数据库压力
- 提升响应速度
- 降低成本

### 2. 会话存储（Session）

```java
// 存储用户会话
redis.setex("session:" + sessionId, 3600, userInfo);

// 获取会话
String userInfo = redis.get("session:" + sessionId);
```

**优势：**
- 支持分布式部署
- 自动过期管理
- 高可用性

### 3. 消息队列

```java
// 生产者
redis.lpush("task_queue", taskJson);

// 消费者
String task = redis.brpop(0, "task_queue");
```

**适用场景：**
- 异步任务处理
- 削峰填谷
- 解耦系统

### 4. 计数器和限流

```java
// 文章点赞数
redis.incr("article:123:likes");

// API 限流（每分钟最多 100 次）
String key = "rate_limit:" + userId + ":" + minute;
long count = redis.incr(key);
if (count == 1) {
    redis.expire(key, 60);
}
if (count > 100) {
    throw new RateLimitException();
}
```

### 5. 排行榜

```java
// 添加分数
redis.zadd("game_rank", score, playerId);

// 获取排行榜前 10 名
Set<String> topPlayers = redis.zrevrange("game_rank", 0, 9);
```

### 6. 分布式锁

```java
// 获取锁
String lockKey = "lock:order:" + orderId;
boolean locked = redis.setnx(lockKey, "1");
if (locked) {
    redis.expire(lockKey, 30); // 30秒超时
    try {
        // 执行业务逻辑
        processOrder(orderId);
    } finally {
        redis.del(lockKey); // 释放锁
    }
}
```

## Redis 的优势

✅ **性能卓越**：基于内存，读写速度极快  
✅ **数据结构丰富**：不只是简单的 Key-Value  
✅ **持久化支持**：数据不会因重启而丢失  
✅ **高可用性**：支持主从复制、哨兵、集群  
✅ **原子操作**：保证数据一致性  
✅ **丰富的功能**：发布订阅、事务、Lua 脚本  

## Redis 的局限性

⚠️ **内存限制**：数据量受内存大小限制  
⚠️ **持久化性能**：持久化会影响性能  
⚠️ **单线程模型**：CPU 密集型操作可能成为瓶颈  
⚠️ **数据一致性**：主从复制存在延迟  

## 何时使用 Redis

**适合使用 Redis 的场景：**
- 需要高性能读写
- 数据量不是特别大（能放入内存）
- 需要缓存热点数据
- 需要实时计数、排行榜
- 需要分布式锁
- 需要消息队列（简单场景）

**不适合使用 Redis 的场景：**
- 数据量超大（超过内存容量）
- 需要复杂的查询（如多表关联）
- 对数据持久性要求极高
- 需要事务的强一致性

## 总结

Redis 是一个功能强大、性能卓越的内存数据库，它不仅可以作为缓存使用，还能作为数据库、消息队列等多种用途。掌握 Redis 的基本概念和使用方法，对于提升系统性能和构建高可用架构至关重要。

**关键要点：**
- Redis 是基于内存的高性能键值数据库
- 支持多种数据结构（String、List、Hash、Set、Sorted Set）
- 提供持久化、主从复制、集群等企业级特性
- 适用于缓存、会话、消息队列、计数器等多种场景
- 需要根据实际需求选择合适的使用方式
