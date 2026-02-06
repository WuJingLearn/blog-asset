---
title: React Hooks 深入浅出
date: 2026-02-14
category: 技术
tags:
  - React
  - Hooks
  - 前端
description: 全面讲解 React Hooks 的使用方法和实现原理，包括常用 Hooks 和自定义 Hooks 的最佳实践。
---

# React Hooks 深入浅出

React Hooks 彻底改变了 React 组件的编写方式，让函数组件拥有了状态和生命周期能力。

## 基础 Hooks

### useState

管理组件状态：

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(prev => prev - 1)}>
        Decrement
      </button>
    </div>
  )
}
```

### useEffect

处理副作用：

```jsx
import { useEffect, useState } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // 获取用户数据
    fetchUser(userId).then(setUser)
    
    // 清理函数
    return () => {
      // 取消请求或清理资源
    }
  }, [userId])  // 依赖数组
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
```

### useContext

访问 Context：

```jsx
import { createContext, useContext } from 'react'

const ThemeContext = createContext('light')

function ThemedButton() {
  const theme = useContext(ThemeContext)
  return <button className={theme}>Click me</button>
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  )
}
```

## 高级 Hooks

### useReducer

管理复杂状态：

```jsx
import { useReducer } from 'react'

const initialState = { count: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return initialState
    default:
      throw new Error()
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  )
}
```

### useMemo 和 useCallback

性能优化：

```jsx
import { useMemo, useCallback, useState } from 'react'

function ExpensiveComponent({ items, filter }) {
  // 缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(filter))
  }, [items, filter])
  
  // 缓存回调函数
  const handleClick = useCallback((id) => {
    console.log('Clicked', id)
  }, [])
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item} onClick={() => handleClick(item)}>
          {item}
        </li>
      ))}
    </ul>
  )
}
```

### useRef

访问 DOM 或保存可变值：

```jsx
import { useRef, useEffect } from 'react'

function TextInput() {
  const inputRef = useRef(null)
  
  useEffect(() => {
    // 自动聚焦
    inputRef.current.focus()
  }, [])
  
  return <input ref={inputRef} />
}

// 保存可变值
function Timer() {
  const intervalRef = useRef(null)
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('Tick')
    }, 1000)
    
    return () => clearInterval(intervalRef.current)
  }, [])
  
  return <div>Timer running...</div>
}
```

## 自定义 Hooks

封装可复用逻辑：

```jsx
// useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }
  
  return [storedValue, setValue]
}

// useFetch
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [url])
  
  return { data, loading, error }
}
```

## Hooks 规则

1. **只在顶层调用 Hooks**：不要在循环、条件或嵌套函数中调用
2. **只在 React 函数中调用 Hooks**：函数组件或自定义 Hooks

## 最佳实践

1. 合理拆分 useEffect
2. 使用 ESLint 插件检查依赖
3. 自定义 Hooks 复用逻辑
4. 避免过度优化 useMemo/useCallback

React Hooks 让函数组件更加强大和灵活。
