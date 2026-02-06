---
title: 代码重构的艺术
date: 2026-10-25
category: 技术
tags:
  - 重构
  - 代码质量
  - 最佳实践
description: 介绍代码重构的原则、方法和实践技巧，提升代码质量和可维护性。
---

# 代码重构的艺术

重构是改善代码质量的重要手段，本文分享重构的原则和实践方法。

## 什么是重构

重构是在不改变代码外部行为的前提下，对代码进行结构调整和优化。

### 重构的目标

- 提高代码可读性
- 降低代码复杂度
- 提升代码可维护性
- 便于添加新功能

### 何时重构

- **添加新功能前**：让代码更容易扩展
- **修复 Bug 后**：消除类似问题的根源
- **代码审查时**：发现坏味道立即重构
- **理解代码时**：重构帮助理解

## 代码坏味道

### 重复代码

```javascript
// Bad - 重复的逻辑
function calculatePriceForVIP(quantity, price) {
  const discount = 0.9
  return quantity * price * discount
}

function calculatePriceForNormal(quantity, price) {
  const discount = 1.0
  return quantity * price * discount
}

// Good - 提取共同逻辑
function calculatePrice(quantity, price, userType) {
  const discounts = {
    vip: 0.9,
    normal: 1.0
  }
  return quantity * price * discounts[userType]
}
```

### 过长函数

```javascript
// Bad - 函数过长
function processOrder(order) {
  // 验证订单
  if (!order.items || order.items.length === 0) {
    throw new Error('Order is empty')
  }
  
  // 计算总价
  let total = 0
  for (const item of order.items) {
    total += item.price * item.quantity
  }
  
  // 应用折扣
  if (order.userType === 'vip') {
    total *= 0.9
  }
  
  // 保存订单
  db.orders.insert(order)
  
  // 发送通知
  sendEmail(order.user.email, 'Order confirmed')
}

// Good - 拆分为多个小函数
function processOrder(order) {
  validateOrder(order)
  const total = calculateTotal(order)
  const finalTotal = applyDiscount(total, order.userType)
  saveOrder({ ...order, total: finalTotal })
  notifyUser(order.user)
}

function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order is empty')
  }
}

function calculateTotal(order) {
  return order.items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
}

function applyDiscount(total, userType) {
  const discounts = { vip: 0.9, normal: 1.0 }
  return total * (discounts[userType] || 1.0)
}
```

### 过大的类

```javascript
// Bad - 类承担太多职责
class User {
  constructor(data) {
    this.name = data.name
    this.email = data.email
  }
  
  // 用户数据验证
  validate() { }
  
  // 数据库操作
  save() { }
  find() { }
  
  // 发送邮件
  sendWelcomeEmail() { }
  sendNotification() { }
  
  // 业务逻辑
  createOrder() { }
  processPayment() { }
}

// Good - 单一职责原则
class User {
  constructor(data) {
    this.name = data.name
    this.email = data.email
  }
  
  validate() {
    return UserValidator.validate(this)
  }
}

class UserRepository {
  save(user) { }
  find(id) { }
}

class EmailService {
  sendWelcomeEmail(user) { }
  sendNotification(user, message) { }
}

class OrderService {
  createOrder(user, items) { }
}
```

### 过长参数列表

```javascript
// Bad - 参数过多
function createUser(
  name,
  email,
  age,
  address,
  city,
  country,
  phone,
  role
) {
  // ...
}

// Good - 使用对象参数
function createUser(userData) {
  const {
    name,
    email,
    age,
    address,
    city,
    country,
    phone,
    role
  } = userData
  // ...
}

// 或使用构建器模式
class UserBuilder {
  constructor() {
    this.user = {}
  }
  
  setName(name) {
    this.user.name = name
    return this
  }
  
  setEmail(email) {
    this.user.email = email
    return this
  }
  
  build() {
    return this.user
  }
}

const user = new UserBuilder()
  .setName('John')
  .setEmail('john@example.com')
  .build()
```

## 重构技巧

### 提取函数

```javascript
// Before
function printOwing(invoice) {
  console.log('***********************')
  console.log('**** Customer Owes ****')
  console.log('***********************')
  
  let outstanding = 0
  for (const o of invoice.orders) {
    outstanding += o.amount
  }
  
  console.log(`name: ${invoice.customer}`)
  console.log(`amount: ${outstanding}`)
}

// After
function printOwing(invoice) {
  printBanner()
  const outstanding = calculateOutstanding(invoice)
  printDetails(invoice, outstanding)
}

function printBanner() {
  console.log('***********************')
  console.log('**** Customer Owes ****')
  console.log('***********************')
}

function calculateOutstanding(invoice) {
  return invoice.orders.reduce((sum, o) => sum + o.amount, 0)
}

function printDetails(invoice, outstanding) {
  console.log(`name: ${invoice.customer}`)
  console.log(`amount: ${outstanding}`)
}
```

### 内联函数

```javascript
// Before - 函数过于简单
function getRating(driver) {
  return moreThanFiveLateDeliveries(driver) ? 2 : 1
}

function moreThanFiveLateDeliveries(driver) {
  return driver.numberOfLateDeliveries > 5
}

// After
function getRating(driver) {
  return driver.numberOfLateDeliveries > 5 ? 2 : 1
}
```

### 引入参数对象

```javascript
// Before
function amountInvoiced(startDate, endDate) { }
function amountReceived(startDate, endDate) { }
function amountOverdue(startDate, endDate) { }

// After
class DateRange {
  constructor(startDate, endDate) {
    this.startDate = startDate
    this.endDate = endDate
  }
}

function amountInvoiced(dateRange) { }
function amountReceived(dateRange) { }
function amountOverdue(dateRange) { }
```

### 以多态取代条件表达式

```javascript
// Before
function getSpeed(bird) {
  switch (bird.type) {
    case 'european':
      return getBaseSpeed(bird)
    case 'african':
      return getBaseSpeed(bird) - getLoadFactor(bird)
    case 'norwegian':
      return bird.isNailed ? 0 : getBaseSpeed(bird)
  }
}

// After
class Bird {
  getSpeed() {
    return this.getBaseSpeed()
  }
}

class EuropeanBird extends Bird {
  // 使用默认实现
}

class AfricanBird extends Bird {
  getSpeed() {
    return this.getBaseSpeed() - this.getLoadFactor()
  }
}

class NorwegianBird extends Bird {
  getSpeed() {
    return this.isNailed ? 0 : this.getBaseSpeed()
  }
}
```

## 重构步骤

1. **确保测试覆盖**：重构前先写测试
2. **小步前进**：每次只做一个小改动
3. **频繁测试**：每次改动后运行测试
4. **提交代码**：每完成一个重构就提交

```bash
# 重构流程
git checkout -b refactor/extract-user-service

# 1. 添加测试
npm test

# 2. 小步重构
# 提取函数
# 运行测试
npm test

# 3. 提交
git commit -m "refactor: extract calculatePrice function"

# 4. 继续重构...

# 5. 完成后合并
git checkout main
git merge refactor/extract-user-service
```

## 重构工具

### ESLint 规则

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'max-lines-per-function': ['error', 50],
    'max-depth': ['error', 3],
    'complexity': ['error', 10],
    'max-params': ['error', 3]
  }
}
```

### SonarQube

代码质量分析工具，检测：
- 代码重复
- 圈复杂度
- 技术债务
- 安全漏洞

## 最佳实践

1. **重构前测试**：确保有充分的测试覆盖
2. **小步快跑**：每次只做一个小改动
3. **持续重构**：不要等到代码腐烂
4. **代码审查**：团队共同参与重构
5. **记录决策**：说明为什么要这样重构

## 重构清单

- [ ] 消除重复代码
- [ ] 拆分过长函数（> 50 行）
- [ ] 简化复杂条件
- [ ] 使用有意义的命名
- [ ] 减少嵌套层级（< 3 层）
- [ ] 降低圈复杂度（< 10）
- [ ] 遵循单一职责原则
- [ ] 提高测试覆盖率（> 80%）

重构是一个持续的过程，需要团队形成重构文化，时刻保持代码整洁。
