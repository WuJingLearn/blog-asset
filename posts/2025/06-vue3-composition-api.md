---
title: Vue 3 Composition API 深度解析
date: 2025-06-08
category: 技术
tags:
  - Vue
  - 前端
  - JavaScript
description: 深入理解 Vue 3 Composition API 的设计理念和使用方法，掌握现代 Vue 开发的最佳实践。
---

# Vue 3 Composition API 深度解析

Vue 3 引入的 Composition API 为组件逻辑组织提供了更灵活的方式。

## 为什么需要 Composition API

在 Vue 2 中，Options API 在处理复杂组件时存在一些问题：

- 相关逻辑分散在不同选项中
- 逻辑复用困难
- TypeScript 支持不够友好

## 基本用法

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (newVal, oldVal) => {
  console.log(`count changed from ${oldVal} to ${newVal}`)
})

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## 逻辑复用

使用组合式函数（Composables）复用逻辑：

```javascript
// useCounter.js
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  return { count, increment, decrement, reset }
}

// 在组件中使用
const { count, increment } = useCounter(10)
```

## 响应式原理

Vue 3 使用 Proxy 实现响应式：

```javascript
const state = reactive({
  name: 'Vue',
  version: 3
})

// 自动追踪依赖
watchEffect(() => {
  console.log(state.name)
})
```

## 最佳实践

1. 使用 `<script setup>` 语法糖
2. 合理拆分组合式函数
3. 避免在 setup 中使用 this
4. 善用 computed 和 watch

Composition API 让 Vue 3 开发更加灵活和强大。
