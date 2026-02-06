---
title: MongoDB 文档数据库实战
date: 2026-07-25
category: 技术
tags:
  - MongoDB
  - NoSQL
  - 数据库
description: 介绍 MongoDB 的核心概念和使用方法，包括数据建模、查询优化和索引设计。
---

# MongoDB 文档数据库实战

MongoDB 是最流行的 NoSQL 文档数据库，适合存储非结构化和半结构化数据。

## 基础概念

### 数据模型

MongoDB 使用 JSON 风格的文档：

```javascript
// 用户文档
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York",
    country: "USA"
  },
  hobbies: ["reading", "coding", "gaming"],
  createdAt: ISODate("2026-01-01T00:00:00Z")
}
```

## CRUD 操作

### 插入文档

```javascript
// 插入单个文档
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30
})

// 插入多个文档
db.users.insertMany([
  { name: "Alice", age: 25 },
  { name: "Bob", age: 35 }
])
```

### 查询文档

```javascript
// 查询所有
db.users.find()

// 条件查询
db.users.find({ age: { $gte: 18 } })

// 投影 - 只返回特定字段
db.users.find(
  { age: { $gte: 18 } },
  { name: 1, email: 1, _id: 0 }
)

// 排序和分页
db.users.find()
  .sort({ age: -1 })
  .skip(10)
  .limit(5)

// 复杂查询
db.users.find({
  $and: [
    { age: { $gte: 18 } },
    { city: "New York" }
  ]
})

// 正则表达式
db.users.find({ name: /^John/ })

// 数组查询
db.users.find({ hobbies: "coding" })
db.users.find({ hobbies: { $all: ["coding", "reading"] } })
```

### 更新文档

```javascript
// 更新单个
db.users.updateOne(
  { name: "John" },
  { $set: { age: 31 } }
)

// 更新多个
db.users.updateMany(
  { age: { $lt: 18 } },
  { $set: { status: "minor" } }
)

// 更新操作符
db.users.updateOne(
  { name: "John" },
  {
    $set: { email: "new@example.com" },
    $inc: { loginCount: 1 },
    $push: { hobbies: "swimming" },
    $pull: { hobbies: "gaming" },
    $currentDate: { lastModified: true }
  }
)

// Upsert - 不存在则插入
db.users.updateOne(
  { email: "new@example.com" },
  { $set: { name: "New User" } },
  { upsert: true }
)
```

### 删除文档

```javascript
// 删除单个
db.users.deleteOne({ name: "John" })

// 删除多个
db.users.deleteMany({ age: { $lt: 18 } })

// 删除所有
db.users.deleteMany({})
```

## 聚合框架

强大的数据处理管道：

```javascript
db.orders.aggregate([
  // 匹配阶段
  { $match: { status: "completed" } },
  
  // 分组聚合
  {
    $group: {
      _id: "$userId",
      totalAmount: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgAmount: { $avg: "$amount" }
    }
  },
  
  // 排序
  { $sort: { totalAmount: -1 } },
  
  // 限制结果
  { $limit: 10 },
  
  // 关联查询
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "userInfo"
    }
  },
  
  // 展开数组
  { $unwind: "$userInfo" },
  
  // 投影
  {
    $project: {
      userId: "$_id",
      userName: "$userInfo.name",
      totalAmount: 1,
      orderCount: 1
    }
  }
])
```

## 索引

### 创建索引

```javascript
// 单字段索引
db.users.createIndex({ email: 1 })

// 复合索引
db.users.createIndex({ city: 1, age: -1 })

// 唯一索引
db.users.createIndex({ email: 1 }, { unique: true })

// 部分索引
db.users.createIndex(
  { age: 1 },
  { partialFilterExpression: { age: { $gte: 18 } } }
)

// 文本索引
db.posts.createIndex({ title: "text", content: "text" })

// TTL 索引 - 自动过期
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)
```

### 查看索引

```javascript
// 查看所有索引
db.users.getIndexes()

// 查看执行计划
db.users.find({ email: "john@example.com" }).explain("executionStats")

// 删除索引
db.users.dropIndex("email_1")
```

## Node.js 驱动

```javascript
const { MongoClient } = require('mongodb')

// 连接数据库
const client = new MongoClient('mongodb://localhost:27017')

async function run() {
  try {
    await client.connect()
    const db = client.db('mydb')
    const users = db.collection('users')
    
    // 查询
    const user = await users.findOne({ email: 'john@example.com' })
    
    // 插入
    await users.insertOne({ name: 'John', age: 30 })
    
    // 更新
    await users.updateOne(
      { name: 'John' },
      { $set: { age: 31 } }
    )
    
    // 聚合
    const results = await users.aggregate([
      { $match: { age: { $gte: 18 } } },
      { $group: { _id: null, avgAge: { $avg: '$age' } } }
    ]).toArray()
    
    console.log(results)
  } finally {
    await client.close()
  }
}

run()
```

## 数据建模

### 嵌入式文档

适合一对一和一对少：

```javascript
{
  _id: ObjectId("..."),
  name: "John",
  address: {
    street: "123 Main St",
    city: "New York"
  }
}
```

### 引用

适合一对多和多对多：

```javascript
// 用户文档
{
  _id: ObjectId("user1"),
  name: "John"
}

// 订单文档
{
  _id: ObjectId("order1"),
  userId: ObjectId("user1"),
  amount: 100
}
```

## 性能优化

1. **合理使用索引**：根据查询模式创建索引
2. **避免大文档**：单个文档不超过 16MB
3. **使用投影**：只查询需要的字段
4. **批量操作**：使用 bulkWrite
5. **连接池**：复用数据库连接

```javascript
// 批量写入
db.users.bulkWrite([
  { insertOne: { document: { name: "John" } } },
  { updateOne: { filter: { name: "Alice" }, update: { $set: { age: 26 } } } },
  { deleteOne: { filter: { name: "Bob" } } }
])
```

## 事务

```javascript
const session = client.startSession()

try {
  await session.withTransaction(async () => {
    await accounts.updateOne(
      { _id: "account1" },
      { $inc: { balance: -100 } },
      { session }
    )
    
    await accounts.updateOne(
      { _id: "account2" },
      { $inc: { balance: 100 } },
      { session }
    )
  })
} finally {
  await session.endSession()
}
```

MongoDB 灵活的文档模型和强大的查询能力，使其成为现代应用的理想选择。
