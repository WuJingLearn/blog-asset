---
title: Webpack 5 模块打包原理与优化
date: 2026-03-08
category: 技术
tags:
  - Webpack
  - 前端工程化
  - 构建工具
description: 深入理解 Webpack 5 的模块打包机制和性能优化策略，提升前端项目构建效率。
---

# Webpack 5 模块打包原理与优化

Webpack 是前端最流行的模块打包工具，本文介绍 Webpack 5 的核心特性和优化技巧。

## 核心概念

### Entry（入口）

应用程序的起点：

```javascript
module.exports = {
  entry: './src/index.js',
  // 或多入口
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  }
}
```

### Output（输出）

打包后文件的输出位置：

```javascript
const path = require('path')

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true  // 清理旧文件
  }
}
```

### Loader

转换非 JavaScript 文件：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  }
}
```

### Plugin

扩展 Webpack 功能：

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
}
```

## Webpack 5 新特性

### 持久化缓存

```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
}
```

### 模块联邦

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      remotes: {
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: ['react', 'react-dom']
    })
  ]
}
```

## 性能优化

### 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```

### Tree Shaking

```javascript
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true
  }
}
```

### 压缩优化

```javascript
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
}
```

### DLL 预编译

```javascript
// webpack.dll.config.js
const webpack = require('webpack')

module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'lodash']
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dll'),
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_library',
      path: path.resolve(__dirname, 'dll/[name].manifest.json')
    })
  ]
}
```

## 开发体验优化

### DevServer 配置

```javascript
module.exports = {
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: { '^/api': '' }
      }
    }
  }
}
```

### Source Map

```javascript
module.exports = {
  devtool: process.env.NODE_ENV === 'production'
    ? 'source-map'
    : 'eval-cheap-module-source-map'
}
```

## 分析工具

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
}
```

## 完整配置示例

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  cache: {
    type: 'filesystem'
  }
}
```

合理配置 Webpack 可以大幅提升构建速度和应用性能。
