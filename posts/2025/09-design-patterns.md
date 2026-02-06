---
title: 设计模式在实际项目中的应用
date: 2025-09-10
category: 技术
tags:
  - 设计模式
  - Java
  - 架构设计
description: 结合实际项目案例，讲解常用设计模式的应用场景和实现方式，提升代码质量和可维护性。
---

# 设计模式在实际项目中的应用

设计模式是软件工程中经过验证的解决方案，本文介绍几种常用设计模式的实际应用。

## 单例模式（Singleton）

确保一个类只有一个实例：

```java
public class ConfigManager {
    private static volatile ConfigManager instance;
    
    private ConfigManager() {}
    
    public static ConfigManager getInstance() {
        if (instance == null) {
            synchronized (ConfigManager.class) {
                if (instance == null) {
                    instance = new ConfigManager();
                }
            }
        }
        return instance;
    }
}
```

**应用场景**：配置管理、数据库连接池、日志管理器

## 工厂模式（Factory）

封装对象创建逻辑：

```java
public interface Payment {
    void pay(BigDecimal amount);
}

public class PaymentFactory {
    public static Payment create(String type) {
        switch (type) {
            case "alipay":
                return new AlipayPayment();
            case "wechat":
                return new WechatPayment();
            default:
                throw new IllegalArgumentException("Unknown payment type");
        }
    }
}
```

**应用场景**：支付方式、消息通知、日志记录器

## 策略模式（Strategy）

定义一系列算法，让它们可以互相替换：

```java
public interface DiscountStrategy {
    BigDecimal calculate(BigDecimal price);
}

public class NormalDiscount implements DiscountStrategy {
    public BigDecimal calculate(BigDecimal price) {
        return price;
    }
}

public class VipDiscount implements DiscountStrategy {
    public BigDecimal calculate(BigDecimal price) {
        return price.multiply(new BigDecimal("0.9"));
    }
}

public class PriceCalculator {
    private DiscountStrategy strategy;
    
    public void setStrategy(DiscountStrategy strategy) {
        this.strategy = strategy;
    }
    
    public BigDecimal calculate(BigDecimal price) {
        return strategy.calculate(price);
    }
}
```

**应用场景**：价格计算、排序算法、压缩算法

## 观察者模式（Observer）

对象间的一对多依赖关系：

```java
public interface Observer {
    void update(String message);
}

public class Subject {
    private List<Observer> observers = new ArrayList<>();
    
    public void attach(Observer observer) {
        observers.add(observer);
    }
    
    public void notifyObservers(String message) {
        for (Observer observer : observers) {
            observer.update(message);
        }
    }
}
```

**应用场景**：事件系统、消息通知、数据绑定

## 装饰器模式（Decorator）

动态地给对象添加职责：

```java
public interface DataSource {
    void writeData(String data);
    String readData();
}

public class FileDataSource implements DataSource {
    // 基础实现
}

public class EncryptionDecorator implements DataSource {
    private DataSource wrapper;
    
    public EncryptionDecorator(DataSource source) {
        this.wrapper = source;
    }
    
    public void writeData(String data) {
        wrapper.writeData(encrypt(data));
    }
    
    public String readData() {
        return decrypt(wrapper.readData());
    }
}
```

**应用场景**：数据加密、日志记录、缓存

## 总结

设计模式不是银弹，关键是理解其思想，在合适的场景下应用。
