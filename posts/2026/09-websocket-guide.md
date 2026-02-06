---
title: WebSocket 实时通信开发
date: 2026-09-18
category: 技术
tags:
  - WebSocket
  - 实时通信
  - 网络编程
description: 介绍 WebSocket 协议的原理和应用，实现实时聊天、消息推送等功能。
---

# WebSocket 实时通信开发

WebSocket 提供了浏览器和服务器之间的全双工通信，适合实时应用场景。

## WebSocket 基础

### 协议特点

- **全双工通信**：客户端和服务器可以同时发送消息
- **持久连接**：建立连接后保持开启状态
- **低延迟**：没有 HTTP 的请求头开销
- **实时性**：消息即时推送

### 连接过程

```
客户端                     服务器
  |                          |
  |--- HTTP 握手请求 -------->|
  |                          |
  |<-- HTTP 101 切换协议 -----|
  |                          |
  |<====== WebSocket =======>|
```

## 客户端实现

### 原生 JavaScript

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080')

// 连接打开
ws.addEventListener('open', (event) => {
  console.log('Connected to server')
  ws.send('Hello Server!')
})

// 接收消息
ws.addEventListener('message', (event) => {
  console.log('Message from server:', event.data)
  
  // 如果是 JSON 数据
  try {
    const data = JSON.parse(event.data)
    handleMessage(data)
  } catch (e) {
    console.log('Text message:', event.data)
  }
})

// 连接关闭
ws.addEventListener('close', (event) => {
  console.log('Disconnected from server')
  console.log('Code:', event.code, 'Reason:', event.reason)
  
  // 重连逻辑
  setTimeout(() => {
    connectWebSocket()
  }, 3000)
})

// 连接错误
ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error)
})

// 发送消息
function sendMessage(message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  } else {
    console.error('WebSocket is not connected')
  }
}

// 关闭连接
function disconnect() {
  ws.close(1000, 'User disconnected')
}
```

### 封装 WebSocket 类

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.listeners = {}
  }
  
  connect() {
    this.ws = new WebSocket(this.url)
    
    this.ws.onopen = () => {
      console.log('Connected')
      this.reconnectAttempts = 0
      this.emit('open')
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit('message', data)
      } catch (e) {
        this.emit('message', event.data)
      }
    }
    
    this.ws.onclose = (event) => {
      console.log('Disconnected')
      this.emit('close', event)
      this.reconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('Error:', error)
      this.emit('error', error)
    }
  }
  
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(), this.reconnectDelay)
    } else {
      console.error('Max reconnect attempts reached')
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }
  
  close() {
    this.reconnectAttempts = this.maxReconnectAttempts
    if (this.ws) {
      this.ws.close()
    }
  }
}

// 使用
const client = new WebSocketClient('ws://localhost:8080')
client.connect()

client.on('open', () => {
  console.log('Connected!')
})

client.on('message', (data) => {
  console.log('Received:', data)
})

client.send({ type: 'chat', message: 'Hello!' })
```

## 服务器实现

### Node.js (ws 库)

```javascript
const WebSocket = require('ws')
const http = require('http')

// 创建 HTTP 服务器
const server = http.createServer()

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ server })

// 存储所有连接的客户端
const clients = new Set()

wss.on('connection', (ws, req) => {
  console.log('New client connected')
  clients.add(ws)
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Welcome to the server!'
  }))
  
  // 接收消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data)
      console.log('Received:', message)
      
      // 处理不同类型的消息
      handleMessage(ws, message)
    } catch (e) {
      console.error('Invalid message:', e)
    }
  })
  
  // 连接关闭
  ws.on('close', (code, reason) => {
    console.log('Client disconnected')
    clients.delete(ws)
  })
  
  // 错误处理
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
  
  // 心跳检测
  ws.isAlive = true
  ws.on('pong', () => {
    ws.isAlive = true
  })
})

// 处理消息
function handleMessage(ws, message) {
  switch (message.type) {
    case 'chat':
      // 广播消息给所有客户端
      broadcast({
        type: 'chat',
        user: message.user,
        text: message.text,
        timestamp: Date.now()
      })
      break
      
    case 'private':
      // 发送私信
      sendToUser(message.to, {
        type: 'private',
        from: message.from,
        text: message.text
      })
      break
      
    default:
      console.log('Unknown message type:', message.type)
  }
}

// 广播消息
function broadcast(data) {
  const message = JSON.stringify(data)
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

// 心跳检测
const interval = setInterval(() => {
  clients.forEach(ws => {
    if (!ws.isAlive) {
      clients.delete(ws)
      return ws.terminate()
    }
    
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

wss.on('close', () => {
  clearInterval(interval)
})

// 启动服务器
const PORT = 8080
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})
```

### Socket.IO

功能更强大的实时通信库：

```javascript
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// 连接处理
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // 加入房间
  socket.on('join-room', (room) => {
    socket.join(room)
    console.log(`User ${socket.id} joined room ${room}`)
    
    // 通知房间内其他用户
    socket.to(room).emit('user-joined', {
      userId: socket.id
    })
  })
  
  // 聊天消息
  socket.on('chat-message', (data) => {
    // 发送给房间内所有用户
    io.to(data.room).emit('chat-message', {
      userId: socket.id,
      message: data.message,
      timestamp: Date.now()
    })
  })
  
  // 私聊
  socket.on('private-message', (data) => {
    // 发送给特定用户
    io.to(data.to).emit('private-message', {
      from: socket.id,
      message: data.message
    })
  })
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

server.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### 客户端使用 Socket.IO

```javascript
import { io } from 'socket.io-client'

// 连接服务器
const socket = io('http://localhost:3000')

// 监听连接
socket.on('connect', () => {
  console.log('Connected:', socket.id)
  
  // 加入房间
  socket.emit('join-room', 'general')
})

// 接收消息
socket.on('chat-message', (data) => {
  console.log('Message:', data)
  displayMessage(data)
})

// 发送消息
function sendMessage(message) {
  socket.emit('chat-message', {
    room: 'general',
    message: message
  })
}

// 断开连接
socket.on('disconnect', () => {
  console.log('Disconnected')
})
```

## 实际应用场景

### 实时聊天

```javascript
// 聊天应用示例
class ChatApp {
  constructor() {
    this.socket = new WebSocketClient('ws://localhost:8080')
    this.socket.connect()
    this.setupListeners()
  }
  
  setupListeners() {
    this.socket.on('message', (data) => {
      if (data.type === 'chat') {
        this.displayMessage(data)
      }
    })
    
    document.getElementById('send-btn').addEventListener('click', () => {
      this.sendMessage()
    })
  }
  
  sendMessage() {
    const input = document.getElementById('message-input')
    const message = input.value.trim()
    
    if (message) {
      this.socket.send({
        type: 'chat',
        user: this.username,
        text: message
      })
      input.value = ''
    }
  }
  
  displayMessage(data) {
    const messageEl = document.createElement('div')
    messageEl.className = 'message'
    messageEl.innerHTML = `
      <strong>${data.user}</strong>: ${data.text}
      <span class="time">${new Date(data.timestamp).toLocaleTimeString()}</span>
    `
    document.getElementById('messages').appendChild(messageEl)
  }
}

// 初始化
const chat = new ChatApp()
```

### 实时通知

```javascript
// 通知系统
socket.on('notification', (data) => {
  showNotification(data.title, data.message)
  updateNotificationBadge()
})

function showNotification(title, message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon.png'
    })
  }
}
```

## 最佳实践

1. **心跳检测**：定期 ping/pong 检测连接状态
2. **重连机制**：实现自动重连逻辑
3. **消息确认**：确保消息可靠传递
4. **限流控制**：防止消息洪泛
5. **安全认证**：验证客户端身份

WebSocket 为实时应用提供了强大的通信能力，是现代 Web 应用的重要技术。
