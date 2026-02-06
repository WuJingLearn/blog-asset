---
title: CI/CD 持续集成与部署实践
date: 2026-08-30
category: 技术
tags:
  - CI/CD
  - DevOps
  - 自动化
description: 介绍 CI/CD 的核心概念和实践方法，使用 GitHub Actions 和 GitLab CI 实现自动化流水线。
---

# CI/CD 持续集成与部署实践

CI/CD 是现代软件开发的基础设施，本文介绍如何构建自动化流水线。

## CI/CD 概念

### CI (Continuous Integration)

持续集成：

- 频繁将代码集成到主分支
- 自动运行测试和代码检查
- 快速发现和修复问题

### CD (Continuous Delivery/Deployment)

持续交付/部署：

- **Continuous Delivery**：自动化构建和测试，手动部署
- **Continuous Deployment**：自动化部署到生产环境

## GitHub Actions

### 基本工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
```

### 构建和部署

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install and build
      run: |
        npm ci
        npm run build
    
    - name: Deploy to server
      uses: easingthemes/ssh-deploy@v2
      with:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        SOURCE: "dist/"
        TARGET: "/var/www/app"
```

### Docker 构建

```yaml
name: Docker Build and Push

on:
  push:
    tags:
      - 'v*'

jobs:
  docker:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: myapp/web
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

## GitLab CI/CD

### 基本配置

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

# 缓存依赖
cache:
  paths:
    - node_modules/

# 测试阶段
test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run lint
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# 构建阶段
build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  only:
    - main
    - develop

# 部署到开发环境
deploy:dev:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - scp -r dist/* user@dev-server:/var/www/app
  environment:
    name: development
    url: https://dev.example.com
  only:
    - develop

# 部署到生产环境
deploy:prod:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - scp -r dist/* user@prod-server:/var/www/app
  environment:
    name: production
    url: https://example.com
  when: manual
  only:
    - main
```

### Docker 构建

```yaml
docker:build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
```

## Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'myapp/web'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/username/repo.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm run lint'
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-credentials') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
                sh 'kubectl set image deployment/web web=${DOCKER_IMAGE}:${DOCKER_TAG}'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

## 最佳实践

### 流水线设计

1. **快速反馈**：优先运行快速测试
2. **并行执行**：独立任务并行运行
3. **缓存依赖**：加速构建过程
4. **环境隔离**：使用容器保证环境一致性

### 部署策略

#### 蓝绿部署

```yaml
# 部署新版本（绿）
kubectl apply -f deployment-green.yaml

# 切换流量
kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'

# 清理旧版本（蓝）
kubectl delete deployment app-blue
```

#### 金丝雀部署

```yaml
# 部署金丝雀版本（10% 流量）
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: myapp
  ports:
  - port: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: myapp
      version: stable
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
      version: canary
```

### 安全实践

1. **密钥管理**：使用 Secrets 管理敏感信息
2. **最小权限**：授予最小必要权限
3. **扫描漏洞**：集成安全扫描工具
4. **审计日志**：记录所有部署操作

```yaml
# 安全扫描示例
security:scan:
  stage: test
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:latest
```

## 监控和告警

```yaml
# 部署后验证
post_deploy:
  stage: verify
  script:
    - curl -f https://example.com/health || exit 1
    - ./scripts/smoke-tests.sh
  when: on_success
```

CI/CD 能够显著提升开发效率和软件质量，是现代软件工程的核心实践。
