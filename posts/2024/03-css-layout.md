---
title: 现代 CSS 布局技术详解
date: 2024-04-10
category: 技术
tags:
  - CSS
  - 前端
  - 布局
description: 深入探讨 Flexbox 和 Grid 布局，以及如何在实际项目中灵活运用这些现代 CSS 布局技术。
---

# 现代 CSS 布局技术详解

CSS 布局一直是前端开发中的重要话题。随着 Flexbox 和 Grid 的普及，我们有了更强大、更灵活的布局工具。本文将详细介绍这两种布局方式的使用方法。

## Flexbox 弹性布局

Flexbox 是一种一维布局模型，非常适合处理行或列方向上的元素排列。

### 基本概念

```css
.container {
  display: flex;
  flex-direction: row; /* 主轴方向：row | row-reverse | column | column-reverse */
  justify-content: center; /* 主轴对齐：flex-start | flex-end | center | space-between | space-around */
  align-items: center; /* 交叉轴对齐：flex-start | flex-end | center | stretch | baseline */
}
```

### 常见布局示例

#### 水平垂直居中

```css
.center-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

#### 导航栏布局

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}
```

#### 卡片列表

```css
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 300px; /* grow shrink basis */
  max-width: 400px;
}
```

### Flex 项目属性

```css
.flex-item {
  flex-grow: 1;   /* 放大比例，默认 0 */
  flex-shrink: 1; /* 缩小比例，默认 1 */
  flex-basis: auto; /* 初始大小 */
  /* 简写：flex: 1 1 auto; */
  
  align-self: center; /* 单独设置交叉轴对齐 */
  order: 0; /* 排列顺序 */
}
```

## Grid 网格布局

Grid 是一种二维布局系统，可以同时处理行和列。

### 基本语法

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 列等宽 */
  grid-template-rows: auto;
  gap: 1rem; /* 行列间距 */
}
```

### 常见布局示例

#### 经典三栏布局

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-column: 1 / -1; }
.sidebar-left { grid-column: 1; }
.main { grid-column: 2; }
.sidebar-right { grid-column: 3; }
.footer { grid-column: 1 / -1; }
```

#### 响应式网格

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

#### 复杂布局

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto auto;
  gap: 1rem;
}

.widget-large {
  grid-column: span 2;
  grid-row: span 2;
}

.widget-wide {
  grid-column: span 2;
}
```

### Grid 区域命名

```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

## Flexbox vs Grid：如何选择？

| 场景 | 推荐方案 |
|------|----------|
| 单行/单列元素排列 | Flexbox |
| 导航栏、工具栏 | Flexbox |
| 二维布局（行和列同时控制） | Grid |
| 复杂页面布局 | Grid |
| 元素大小不固定，需要自适应 | Flexbox |
| 需要精确控制元素位置 | Grid |

## 实用技巧

### 1. 使用 gap 替代 margin

```css
/* 旧方式 */
.old-way > * {
  margin-right: 1rem;
}
.old-way > *:last-child {
  margin-right: 0;
}

/* 新方式 */
.new-way {
  display: flex;
  gap: 1rem;
}
```

### 2. min() / max() / clamp()

```css
.container {
  /* 宽度在 300px 到 1200px 之间，理想值为 90% */
  width: clamp(300px, 90%, 1200px);
  
  /* 至少 200px，最多 50% */
  width: max(200px, 50%);
}
```

### 3. aspect-ratio

```css
.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.square {
  aspect-ratio: 1;
}
```

## 浏览器兼容性

现代浏览器对 Flexbox 和 Grid 的支持已经非常好：

- **Flexbox**: 所有现代浏览器均支持
- **Grid**: 所有现代浏览器均支持
- **gap in Flexbox**: Chrome 84+, Firefox 63+, Safari 14.1+

## 总结

- **Flexbox** 适合一维布局，灵活易用
- **Grid** 适合二维布局，功能强大
- 两者可以结合使用，发挥各自优势
- 优先使用 `gap` 处理间距
- 善用 `minmax()`、`auto-fit`、`auto-fill` 实现响应式

掌握这些布局技术，你就能轻松应对各种复杂的页面布局需求！
