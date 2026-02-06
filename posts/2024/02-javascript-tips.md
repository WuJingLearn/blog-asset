---
title: JavaScript 实用技巧分享
date: 2024-03-20
category: 技术
tags:
  - JavaScript
  - 前端
  - 编程
description: 分享一些日常开发中常用的 JavaScript 技巧，包括数组操作、对象处理、异步编程等实用方法。
---

# JavaScript 实用技巧分享

在日常开发中，我们经常会遇到一些常见的编程场景。今天分享一些我常用的 JavaScript 技巧，希望能帮助你提高开发效率。

## 数组操作

### 数组去重

使用 `Set` 可以轻松实现数组去重：

```javascript
const arr = [1, 2, 2, 3, 3, 3, 4, 5, 5];
const unique = [...new Set(arr)];
console.log(unique); // [1, 2, 3, 4, 5]
```

### 数组扁平化

使用 `flat()` 方法可以将嵌套数组展开：

```javascript
const nested = [1, [2, 3], [4, [5, 6]]];

// 展开一层
console.log(nested.flat()); // [1, 2, 3, 4, [5, 6]]

// 完全展开
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5, 6]
```

### 数组分组

将数组按条件分组：

```javascript
const people = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 25 }
];

const grouped = people.reduce((acc, person) => {
  const key = person.age;
  (acc[key] = acc[key] || []).push(person);
  return acc;
}, {});

console.log(grouped);
// { 25: [{name: 'Alice', age: 25}, {name: 'Charlie', age: 25}], 30: [{name: 'Bob', age: 30}] }
```

## 对象操作

### 对象解构与默认值

```javascript
const config = { theme: 'dark' };

// 带默认值的解构
const { theme = 'light', fontSize = 14 } = config;
console.log(theme);    // 'dark'
console.log(fontSize); // 14
```

### 动态属性名

```javascript
const key = 'name';
const obj = {
  [key]: 'Alice',
  [`${key}Length`]: 5
};
console.log(obj); // { name: 'Alice', nameLength: 5 }
```

### 对象合并

```javascript
const defaults = { a: 1, b: 2 };
const options = { b: 3, c: 4 };

// 使用展开运算符合并（后者覆盖前者）
const merged = { ...defaults, ...options };
console.log(merged); // { a: 1, b: 3, c: 4 }
```

## 异步编程

### Promise.all 并行执行

当多个异步操作互不依赖时，使用 `Promise.all` 可以并行执行：

```javascript
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { users, posts, comments };
}
```

### 异步循环

需要按顺序执行异步操作时：

```javascript
// 错误示例：forEach 不会等待
urls.forEach(async url => {
  await fetch(url); // 这些请求会同时发出
});

// 正确示例：使用 for...of
for (const url of urls) {
  await fetch(url); // 按顺序执行
}
```

## 实用工具函数

### 防抖函数

```javascript
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 使用示例
const handleSearch = debounce((query) => {
  console.log('Searching:', query);
}, 500);
```

### 节流函数

```javascript
function throttle(fn, delay = 100) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 使用示例
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);
```

## 总结

以上是一些我在日常开发中经常使用的 JavaScript 技巧。掌握这些技巧可以帮助你：

- 写出更简洁的代码
- 提高代码的可读性
- 避免常见的坑

希望这些内容对你有所帮助！如果你有其他好用的技巧，欢迎分享交流。
