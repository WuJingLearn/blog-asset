---
title: GraphQL API 设计与实践
date: 2026-04-12
category: 技术
tags:
  - GraphQL
  - API
  - 后端
description: 介绍 GraphQL 的核心概念和 API 设计实践，对比 RESTful API 的优劣势。
---

# GraphQL API 设计与实践

GraphQL 是一种用于 API 的查询语言，提供了比 REST 更灵活的数据查询方式。

## GraphQL 基础

### Schema 定义

使用 SDL（Schema Definition Language）定义数据结构：

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: String!
}

type Query {
  user(id: ID!): User
  users: [User!]!
  post(id: ID!): Post
  posts(limit: Int, offset: Int): [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String, email: String): User!
  deleteUser(id: ID!): Boolean!
  createPost(title: String!, content: String!, authorId: ID!): Post!
}

type Subscription {
  postAdded: Post!
}
```

### 查询（Query）

客户端可以精确指定需要的字段：

```graphql
# 基本查询
query {
  user(id: "1") {
    id
    name
    email
  }
}

# 嵌套查询
query {
  user(id: "1") {
    id
    name
    posts {
      id
      title
      createdAt
    }
  }
}

# 查询多个资源
query {
  users {
    id
    name
  }
  posts(limit: 10) {
    id
    title
  }
}

# 使用变量
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

### 变更（Mutation）

修改服务器数据：

```graphql
mutation {
  createUser(name: "John", email: "john@example.com") {
    id
    name
    email
  }
}

mutation UpdateUser($id: ID!, $name: String!) {
  updateUser(id: $id, name: $name) {
    id
    name
  }
}
```

## Node.js 实现

使用 Apollo Server：

```javascript
const { ApolloServer, gql } = require('apollo-server')

// 类型定义
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
  }
`

// 解析器
const resolvers = {
  Query: {
    users: () => {
      return userService.findAll()
    },
    user: (parent, { id }) => {
      return userService.findById(id)
    }
  },
  Mutation: {
    createUser: (parent, { name, email }) => {
      return userService.create({ name, email })
    }
  },
  User: {
    // 自定义字段解析
    email: (parent, args, context) => {
      // 权限控制
      if (context.user.id !== parent.id) {
        return null
      }
      return parent.email
    }
  }
}

// 创建服务器
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // 认证逻辑
    const token = req.headers.authorization || ''
    const user = getUserFromToken(token)
    return { user }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
```

## 高级特性

### DataLoader

解决 N+1 查询问题：

```javascript
const DataLoader = require('dataloader')

const userLoader = new DataLoader(async (userIds) => {
  const users = await userService.findByIds(userIds)
  return userIds.map(id => users.find(u => u.id === id))
})

const resolvers = {
  Post: {
    author: (post) => {
      return userLoader.load(post.authorId)
    }
  }
}
```

### 分页

```graphql
type Query {
  posts(
    first: Int
    after: String
    last: Int
    before: String
  ): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 订阅（Subscription）

实时数据推送：

```javascript
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const typeDefs = gql`
  type Subscription {
    postAdded: Post!
  }
`

const resolvers = {
  Mutation: {
    createPost: async (parent, args) => {
      const post = await postService.create(args)
      pubsub.publish('POST_ADDED', { postAdded: post })
      return post
    }
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator(['POST_ADDED'])
    }
  }
}
```

## GraphQL vs REST

### GraphQL 优势

- **按需获取**：客户端精确指定需要的数据
- **单一端点**：所有请求通过一个 URL
- **强类型系统**：自动生成文档和校验
- **避免过度获取**：减少网络传输

### REST 优势

- **简单直观**：易于理解和实现
- **缓存友好**：HTTP 缓存机制
- **成熟生态**：工具和实践丰富

## 最佳实践

1. **合理设计 Schema**：遵循领域模型
2. **使用 DataLoader**：避免 N+1 问题
3. **实现分页**：处理大数据集
4. **错误处理**：统一错误格式
5. **权限控制**：字段级别的访问控制
6. **查询复杂度限制**：防止恶意查询

GraphQL 为前后端提供了更灵活的数据交互方式。
