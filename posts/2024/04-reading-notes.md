---
title: 《代码整洁之道》读书笔记
date: 2024-05-01
category: 读书
tags:
  - 读书笔记
  - 编程
  - 代码质量
description: 记录阅读 Robert C. Martin 的《代码整洁之道》一书的心得体会，以及对代码质量的思考。
---

# 《代码整洁之道》读书笔记

《代码整洁之道》（Clean Code）是 Robert C. Martin（人称 Uncle Bob）的经典著作。这本书教导我们如何编写可读、可维护的代码。以下是我的读书笔记和心得体会。

## 核心理念

> "代码是写给人看的，顺便给机器执行。"

整洁的代码应该具备以下特点：
- **可读性强**：其他开发者能够轻松理解
- **意图明确**：代码能清晰表达其目的
- **易于修改**：方便后续维护和扩展
- **没有重复**：遵循 DRY 原则（Don't Repeat Yourself）

## 命名的艺术

### 使用有意义的名称

```javascript
// 不好的命名
const d = 86400; // 一天的秒数
const list = getUsers();
const temp = calculateTotal();

// 好的命名
const SECONDS_PER_DAY = 86400;
const activeUsers = getActiveUsers();
const orderTotal = calculateOrderTotal();
```

### 名称应该体现意图

```javascript
// 不好：需要注释才能理解
const d = new Date() - startDate; // 经过的天数

// 好：名称本身就说明了意图
const elapsedDays = calculateElapsedDays(startDate);
```

### 避免误导

```javascript
// 不好：accountList 实际上不是 List 类型
const accountList = {}; // 这是一个对象

// 好：使用准确的名称
const accountMap = {};
const accounts = [];
```

## 函数设计原则

### 保持函数短小

函数应该只做一件事，做好这件事，只做这一件事。

```javascript
// 不好：函数做了太多事
function processUserData(user) {
  // 验证数据
  if (!user.email) throw new Error('Email required');
  // 格式化数据
  user.name = user.name.trim();
  // 保存数据
  database.save(user);
  // 发送邮件
  sendWelcomeEmail(user);
  // 记录日志
  logger.info('User created');
}

// 好：拆分成多个单一职责的函数
function createUser(user) {
  validateUser(user);
  const formattedUser = formatUserData(user);
  saveUser(formattedUser);
  notifyUserCreation(formattedUser);
}
```

### 函数参数

- 理想情况：0 个参数
- 可接受：1-2 个参数
- 需要谨慎：3 个参数
- 应该避免：超过 3 个参数

```javascript
// 不好：参数过多
function createUser(name, email, age, address, phone, role) { }

// 好：使用对象参数
function createUser({ name, email, age, address, phone, role }) { }
```

### 避免副作用

```javascript
// 不好：有隐藏的副作用
function checkPassword(userName, password) {
  const user = findUser(userName);
  if (user.password === encrypt(password)) {
    Session.initialize(); // 隐藏的副作用！
    return true;
  }
  return false;
}

// 好：函数名称体现了所有行为
function checkPasswordAndInitSession(userName, password) { }
```

## 注释的使用

### 好的注释

```javascript
// 正则表达式匹配格式：kk:mm:ss EEE, MMM dd, yyyy
const timePattern = /\d{2}:\d{2}:\d{2} \w{3}, \w{3} \d{2}, \d{4}/;

// TODO: 后续需要优化性能
// FIXME: 这里存在边界情况的 bug
```

### 坏的注释

```javascript
// 不好：注释只是重复了代码
// 增加 count
count++;

// 不好：注释已经过时，与代码不符
// 返回用户名
function getUser() { } // 实际上返回的是用户对象

// 不好：注释掉的代码
// function oldMethod() { }
// 直接删除，版本控制会记录历史
```

## 错误处理

### 使用异常而非返回码

```javascript
// 不好：使用返回码
function withdraw(amount) {
  if (balance < amount) return -1;
  balance -= amount;
  return 0;
}

// 好：使用异常
function withdraw(amount) {
  if (balance < amount) {
    throw new InsufficientBalanceError(balance, amount);
  }
  balance -= amount;
}
```

### 提供有意义的错误信息

```javascript
// 不好
throw new Error('Invalid input');

// 好
throw new Error(`Invalid email format: "${email}". Expected format: user@domain.com`);
```

## 类的设计

### 单一职责原则（SRP）

每个类应该只有一个改变的理由。

```javascript
// 不好：类承担了太多职责
class User {
  save() { /* 保存到数据库 */ }
  sendEmail() { /* 发送邮件 */ }
  generateReport() { /* 生成报告 */ }
}

// 好：分离职责
class User { /* 只包含用户数据和基本行为 */ }
class UserRepository { save(user) { } }
class EmailService { sendTo(user) { } }
class UserReportGenerator { generate(user) { } }
```

### 保持类的内聚性

类的方法和属性应该紧密相关。

## 我的实践心得

读完这本书后，我在日常开发中的一些改变：

1. **命名上花更多时间**：好的命名能大大减少注释的需要
2. **写更短的函数**：每个函数控制在 20 行以内
3. **定期重构**：留出时间清理代码
4. **代码审查**：互相学习，提高代码质量
5. **测试驱动**：先写测试，再写实现

## 推荐阅读

- 《重构：改善既有代码的设计》- Martin Fowler
- 《程序员修炼之道》- Andrew Hunt
- 《设计模式》- GoF

## 总结

代码整洁不是一蹴而就的，而是需要持续练习和改进的。每次写代码时，都问问自己：

- 这个名字能准确表达意图吗？
- 这个函数是否只做一件事？
- 别人能轻松理解这段代码吗？

记住：**写代码容易，写好代码难；读代码的时间远多于写代码的时间。**

让我们一起努力，写出更整洁、更专业的代码！
