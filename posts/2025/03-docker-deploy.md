---
title: Docker 容器化部署实战
date: 2025-03-05
category: 技术
tags:
  - Docker
  - DevOps
  - 部署
description: 从零开始学习 Docker 容器化部署，包括镜像构建、容器编排和实际部署案例。
---

# Docker 容器化部署实战

Docker 已经成为现代应用部署的标准方式，本文介绍如何使用 Docker 部署应用。

## Docker 基础概念

- **镜像（Image）**：应用的打包文件
- **容器（Container）**：镜像的运行实例
- **仓库（Registry）**：镜像的存储中心

## Dockerfile 示例

```dockerfile
FROM openjdk:11-jre-slim
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Docker Compose

使用 Docker Compose 管理多容器应用：

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "8080:8080"
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
```

## 部署命令

```bash
# 构建镜像
docker build -t myapp:latest .

# 运行容器
docker run -d -p 8080:8080 myapp:latest

# 使用 Docker Compose
docker-compose up -d
```

## 总结

Docker 简化了应用部署流程，是现代开发必备技能。
