---
title: Git 工作流最佳实践
date: 2025-07-15
category: 技术
tags:
  - Git
  - 版本控制
  - 团队协作
description: 介绍主流的 Git 工作流模式和团队协作规范，提升代码管理效率和质量。
---

# Git 工作流最佳实践

Git 是现代软件开发必备的版本控制工具，选择合适的工作流模式对团队协作至关重要。

## 常见工作流模式

### Git Flow

适合版本发布明确的项目：

- **master**：生产环境代码
- **develop**：开发主分支
- **feature**：功能开发分支
- **release**：版本发布分支
- **hotfix**：紧急修复分支

```bash
# 创建功能分支
git checkout -b feature/user-login develop

# 完成功能后合并
git checkout develop
git merge --no-ff feature/user-login
git branch -d feature/user-login
```

### GitHub Flow

适合持续部署的项目：

1. 从 main 创建分支
2. 提交代码更改
3. 创建 Pull Request
4. 代码审查
5. 合并到 main
6. 部署

### Trunk-Based Development

主干开发模式，适合高频发布：

```bash
# 小功能直接在主干开发
git checkout main
git pull
# 开发...
git commit -m "feat: add new feature"
git push

# 大功能使用短期分支
git checkout -b feature-x
# 快速开发，1-2天内合并
git checkout main
git merge feature-x
```

## 提交规范

使用 Conventional Commits：

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建配置等

示例：
feat(auth): add user login feature
fix(api): resolve null pointer exception
docs(readme): update installation guide
```

## 常用命令

```bash
# 查看状态
git status

# 暂存更改
git stash

# 交互式 rebase
git rebase -i HEAD~3

# 修改最后一次提交
git commit --amend

# 查看历史
git log --oneline --graph
```

## 最佳实践

1. **频繁提交**：小步快跑，每个提交只做一件事
2. **清晰的提交信息**：遵循规范，便于追溯
3. **定期同步**：及时拉取最新代码，减少冲突
4. **代码审查**：通过 PR 进行 Code Review
5. **保护主分支**：设置分支保护规则

掌握 Git 工作流，让团队协作更加高效。
