/**
 * config.js - 配置文件
 */

(function() {
    'use strict';
    
    const Config = {
        // GitHub Pages 部署时的基础路径
        // 本地开发时为空字符串，部署到 GitHub Pages 时为空（因为相对于当前页面路径）
        basePath: '',
        
        /**
         * 获取完整的资源路径
         */
        getPath(path) {
            // 移除开头的斜杠（如果有）
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            // 直接返回相对路径，因为 HTML 页面已经在正确的目录下
            return this.basePath ? `${this.basePath}/${cleanPath}` : cleanPath;
        }
    };

    // 导出到全局
    window.Config = Config;
})();
