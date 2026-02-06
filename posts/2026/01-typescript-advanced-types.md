---
title: TypeScript 高级类型系统详解
date: 2026-01-10
category: 技术
tags:
  - TypeScript
  - 前端
  - 类型系统
description: 深入探讨 TypeScript 高级类型特性，包括泛型、条件类型、映射类型等，掌握类型编程技巧。
---

# TypeScript 高级类型系统详解

TypeScript 的类型系统非常强大，掌握高级类型可以让你的代码更加健壮和优雅。

## 泛型（Generics）

泛型让类型可以参数化：

```typescript
// 基础泛型
function identity<T>(arg: T): T {
  return arg
}

// 泛型约束
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}
```

## 条件类型（Conditional Types）

根据条件选择类型：

```typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false

// 实用的条件类型
type NonNullable<T> = T extends null | undefined ? never : T
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any
```

## 映射类型（Mapped Types）

基于已有类型创建新类型：

```typescript
// Partial - 所有属性可选
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Readonly - 所有属性只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// Pick - 选择部分属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// Record - 创建键值对类型
type Record<K extends keyof any, T> = {
  [P in K]: T
}
```

## 工具类型（Utility Types）

TypeScript 内置的实用类型：

```typescript
interface User {
  id: number
  name: string
  email: string
  age: number
}

// Partial - 所有属性可选
type PartialUser = Partial<User>

// Required - 所有属性必填
type RequiredUser = Required<PartialUser>

// Pick - 选取部分属性
type UserBasic = Pick<User, 'id' | 'name'>

// Omit - 排除部分属性
type UserWithoutAge = Omit<User, 'age'>

// Exclude - 从联合类型中排除
type T1 = Exclude<'a' | 'b' | 'c', 'a'>  // 'b' | 'c'

// Extract - 从联合类型中提取
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>  // 'a'
```

## 模板字面量类型

```typescript
type EventName = 'click' | 'scroll' | 'mousemove'
type EventHandler = `on${Capitalize<EventName>}`
// 'onClick' | 'onScroll' | 'onMousemove'

// 实际应用
type PropEventSource<T> = {
  on<K extends string & keyof T>(
    eventName: `${K}Changed`,
    callback: (newValue: T[K]) => void
  ): void
}
```

## 实战示例

```typescript
// API 响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 用户 API
type UserResponse = ApiResponse<User>
type UserListResponse = ApiResponse<User[]>

// 类型守卫
function isUser(obj: any): obj is User {
  return typeof obj.id === 'number' && typeof obj.name === 'string'
}

// 函数重载
function format(value: string): string
function format(value: number): string
function format(value: Date): string
function format(value: string | number | Date): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return value.toISOString()
}
```

## 最佳实践

1. 优先使用类型推断
2. 合理使用泛型约束
3. 善用内置工具类型
4. 避免类型断言（as）
5. 使用严格模式

掌握 TypeScript 高级类型，让你的代码类型安全且易于维护。
