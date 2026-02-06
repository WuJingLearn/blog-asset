---
title: 前端性能优化实战指南
date: 2026-06-15
category: 技术
tags:
  - 性能优化
  - 前端
  - Web
description: 全面介绍前端性能优化的方法和技巧,从加载优化到运行时优化,提升用户体验。
---

# 前端性能优化实战指南

前端性能直接影响用户体验和业务指标，本文介绍系统的性能优化方法。

## 性能指标

### Core Web Vitals

Google 提出的核心指标：

- **LCP (Largest Contentful Paint)**：最大内容绘制时间，应 < 2.5s
- **FID (First Input Delay)**：首次输入延迟，应 < 100ms
- **CLS (Cumulative Layout Shift)**：累积布局偏移，应 < 0.1

### 其他重要指标

- **FCP (First Contentful Paint)**：首次内容绘制
- **TTI (Time to Interactive)**：可交互时间
- **TBT (Total Blocking Time)**：总阻塞时间

## 加载优化

### 资源优化

```html
<!-- 图片优化 -->
<img src="image.jpg" 
     srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1280w.jpg 1280w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            1280px"
     loading="lazy"
     alt="Description">

<!-- 使用 WebP 格式 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>

<!-- 字体优化 -->
<link rel="preload" 
      href="/fonts/font.woff2" 
      as="font" 
      type="font/woff2" 
      crossorigin>

<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/font.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

### 代码分割

```javascript
// 路由懒加载
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  )
}

// 动态导入
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js')
  module.doSomething()
})
```

### 资源预加载

```html
<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/critical.js" as="script">

<!-- 预获取未来可能需要的资源 -->
<link rel="prefetch" href="/next-page.js">
```

## 渲染优化

### 虚拟列表

处理大量数据：

```javascript
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

### 防抖和节流

```javascript
// 防抖 - 延迟执行
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流 - 限制频率
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

// 使用
input.addEventListener('input', debounce(handleInput, 300))
window.addEventListener('scroll', throttle(handleScroll, 100))
```

### 使用 Web Worker

```javascript
// worker.js
self.addEventListener('message', (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
})

// main.js
const worker = new Worker('worker.js')
worker.postMessage(data)
worker.addEventListener('message', (e) => {
  console.log('Result:', e.data)
})
```

## 缓存策略

### Service Worker

```javascript
// service-worker.js
const CACHE_NAME = 'v1'
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中则返回缓存，否则请求网络
        return response || fetch(event.request)
      })
  )
})
```

### HTTP 缓存

```javascript
// Express 服务器
app.use(express.static('public', {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
  }
}))
```

## 监控和分析

### Performance API

```javascript
// 性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  
  console.log('DNS 查询:', perfData.domainLookupEnd - perfData.domainLookupStart)
  console.log('TCP 连接:', perfData.connectEnd - perfData.connectStart)
  console.log('请求响应:', perfData.responseEnd - perfData.requestStart)
  console.log('DOM 解析:', perfData.domInteractive - perfData.responseEnd)
  console.log('页面加载:', perfData.loadEventEnd - perfData.navigationStart)
})

// Core Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getLCP(console.log)
```

### Lighthouse

```bash
# 使用 Lighthouse CI
npm install -g @lhci/cli

# 运行测试
lhci autorun
```

## CSS 优化

```css
/* 使用 CSS containment */
.card {
  contain: layout style paint;
}

/* 使用 will-change 提示浏览器 */
.animated {
  will-change: transform, opacity;
}

/* 避免强制同步布局 */
/* Bad */
const height = element.clientHeight
element.style.height = height + 100 + 'px'

/* Good */
const height = element.clientHeight
requestAnimationFrame(() => {
  element.style.height = height + 100 + 'px'
})
```

## JavaScript 优化

```javascript
// 使用 requestAnimationFrame
function animate() {
  // 动画逻辑
  element.style.transform = `translateX(${x}px)`
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

// 使用 requestIdleCallback 处理低优先级任务
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift()
    task()
  }
})
```

## 性能优化清单

1. ✅ 压缩和混淆代码
2. ✅ 使用 CDN
3. ✅ 启用 HTTP/2
4. ✅ 开启 Gzip/Brotli 压缩
5. ✅ 图片优化和懒加载
6. ✅ 代码分割和懒加载
7. ✅ 使用缓存策略
8. ✅ 减少重排和重绘
9. ✅ 使用性能监控工具
10. ✅ 持续优化和监控

性能优化是一个持续的过程，需要根据实际情况不断调整和改进。
