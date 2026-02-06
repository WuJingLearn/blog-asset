---
title: Kubernetes 容器编排入门
date: 2026-05-20
category: 技术
tags:
  - Kubernetes
  - 容器
  - DevOps
description: 介绍 Kubernetes 的核心概念和基本使用方法，掌握容器编排的基础知识。
---

# Kubernetes 容器编排入门

Kubernetes（K8s）是目前最流行的容器编排平台，本文介绍其核心概念和基本使用。

## 核心概念

### Pod

最小部署单元，包含一个或多个容器：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
```

### Deployment

管理 Pod 的副本和更新：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

### Service

服务发现和负载均衡：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

### ConfigMap

配置管理：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "mysql://localhost:3306/mydb"
  log_level: "info"
```

```yaml
# 在 Pod 中使用
spec:
  containers:
  - name: app
    image: myapp:latest
    envFrom:
    - configMapRef:
        name: app-config
```

### Secret

敏感信息管理：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64 编码
  password: cGFzc3dvcmQ=
```

## 常用命令

### 查看资源

```bash
# 查看 Pod
kubectl get pods
kubectl describe pod nginx-pod
kubectl logs nginx-pod

# 查看 Deployment
kubectl get deployments
kubectl describe deployment nginx-deployment

# 查看 Service
kubectl get services
kubectl get svc

# 查看所有资源
kubectl get all
```

### 创建和更新

```bash
# 应用配置文件
kubectl apply -f deployment.yaml

# 创建资源
kubectl create deployment nginx --image=nginx:1.21

# 更新镜像
kubectl set image deployment/nginx nginx=nginx:1.22

# 扩缩容
kubectl scale deployment nginx --replicas=5
```

### 调试

```bash
# 进入容器
kubectl exec -it nginx-pod -- /bin/bash

# 端口转发
kubectl port-forward pod/nginx-pod 8080:80

# 查看事件
kubectl get events

# 查看资源使用
kubectl top nodes
kubectl top pods
```

## 高级特性

### Ingress

HTTP/HTTPS 路由：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

### StatefulSet

有状态应用：

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### HorizontalPodAutoscaler

自动扩缩容：

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 滚动更新

```bash
# 更新镜像
kubectl set image deployment/nginx nginx=nginx:1.22

# 查看更新状态
kubectl rollout status deployment/nginx

# 查看历史
kubectl rollout history deployment/nginx

# 回滚
kubectl rollout undo deployment/nginx

# 回滚到特定版本
kubectl rollout undo deployment/nginx --to-revision=2
```

## 健康检查

```yaml
spec:
  containers:
  - name: app
    image: myapp:latest
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

## 最佳实践

1. **资源限制**：设置 requests 和 limits
2. **健康检查**：配置 liveness 和 readiness 探针
3. **标签管理**：合理使用标签组织资源
4. **命名空间**：使用 namespace 隔离环境
5. **配置外部化**：使用 ConfigMap 和 Secret
6. **日志管理**：集中收集和分析日志

Kubernetes 是云原生应用的基础设施，掌握它能够更好地管理容器化应用。
