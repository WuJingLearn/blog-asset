---
title: 单元测试最佳实践
date: 2025-10-18
category: 技术
tags:
  - 测试
  - JUnit
  - 代码质量
description: 介绍单元测试的编写方法和最佳实践，使用 JUnit 5 和 Mockito 提升代码质量和可维护性。
---

# 单元测试最佳实践

单元测试是保证代码质量的重要手段，本文介绍如何编写高质量的单元测试。

## 为什么要写单元测试

- **保证代码质量**：及早发现 bug
- **重构保障**：敢于重构代码
- **文档作用**：测试即文档
- **设计改进**：促进更好的代码设计

## JUnit 5 基础

### 基本注解

```java
@Test
void testAddition() {
    Calculator calc = new Calculator();
    assertEquals(5, calc.add(2, 3));
}

@BeforeEach
void setUp() {
    // 每个测试前执行
}

@AfterEach
void tearDown() {
    // 每个测试后执行
}

@BeforeAll
static void initAll() {
    // 所有测试前执行一次
}

@AfterAll
static void tearDownAll() {
    // 所有测试后执行一次
}
```

### 断言

```java
// 基本断言
assertEquals(expected, actual);
assertTrue(condition);
assertFalse(condition);
assertNull(object);
assertNotNull(object);

// 异常断言
assertThrows(IllegalArgumentException.class, () -> {
    service.process(null);
});

// 超时断言
assertTimeout(Duration.ofSeconds(2), () -> {
    service.longRunningTask();
});
```

## 使用 Mockito

### Mock 对象

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void testGetUser() {
        // 设置 mock 行为
        User mockUser = new User(1L, "John");
        when(userRepository.findById(1L))
            .thenReturn(Optional.of(mockUser));
        
        // 执行测试
        User user = userService.getUser(1L);
        
        // 验证结果
        assertEquals("John", user.getName());
        verify(userRepository).findById(1L);
    }
}
```

### 参数匹配

```java
// 任意参数
when(userRepository.findById(anyLong()))
    .thenReturn(Optional.of(user));

// 特定参数
when(userRepository.save(argThat(u -> u.getAge() > 18)))
    .thenReturn(user);
```

## 测试最佳实践

### 测试命名

```java
// 使用 Given-When-Then 模式
@Test
void givenValidUser_whenSave_thenSuccess() {
    // given
    User user = new User("John", 25);
    
    // when
    userService.save(user);
    
    // then
    verify(userRepository).save(user);
}
```

### 测试覆盖

- **单元测试**：测试单个方法/类
- **集成测试**：测试多个组件协作
- **端到端测试**：测试完整业务流程

### AAA 模式

```java
@Test
void testCalculation() {
    // Arrange - 准备测试数据
    Calculator calc = new Calculator();
    
    // Act - 执行测试
    int result = calc.multiply(3, 4);
    
    // Assert - 验证结果
    assertEquals(12, result);
}
```

## Spring Boot 测试

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetUser() throws Exception {
        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("John"));
    }
}
```

## 总结

编写测试需要投入时间，但长期来看能够节省大量调试时间，提升代码质量。

**记住**：好的测试应该是：
- **Fast** - 快速
- **Independent** - 独立
- **Repeatable** - 可重复
- **Self-Validating** - 自我验证
- **Timely** - 及时编写
