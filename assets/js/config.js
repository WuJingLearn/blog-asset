/**
 * config.js - 配置文件
 */

(function() {
    'use strict';
    
    const Config = {
        // GitHub Pages 部署时的基础路径
        // 本地开发时为空字符串，部署到 GitHub Pages 时为 '/blog-asset'
        basePath: window.location.hostname === 'wujinglearn.github.io' ? '/blog-asset' : '',
        
        /**
         * 获取完整的资源路径
         */
        getPath(path) {
            // 移除开头的斜杠（如果有）
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            // 如果有 basePath，添加斜杠分隔
            return this.basePath ? `${this.basePath}/${cleanPath}` : cleanPath;
        }
    };

    // 导出到全局
    window.Config = Config;
})();
