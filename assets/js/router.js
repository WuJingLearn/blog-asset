/**
 * router.js - Hash路由管理模块
 */

const Router = {
    routes: {},
    currentRoute: null,
    
    /**
     * 初始化路由
     */
    init() {
        // 监听 hash 变化
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // 处理初始路由
        this.handleRoute();
    },

    /**
     * 注册路由
     */
    register(pattern, handler) {
        this.routes[pattern] = handler;
    },

    /**
     * 导航到指定路由
     */
    navigate(path) {
        window.location.hash = path;
    },

    /**
     * 获取当前hash路径
     */
    getPath() {
        const hash = window.location.hash.slice(1) || '/';
        // 分离路径和查询参数
        const [path] = hash.split('?');
        return path || '/';
    },

    /**
     * 解析路由参数
     */
    parseParams(pattern, path) {
        const params = {};
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                params[paramName] = decodeURIComponent(pathParts[i]);
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return params;
    },

    /**
     * 匹配路由
     */
    matchRoute(path) {
        // 精确匹配
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        // 参数匹配
        for (const pattern in this.routes) {
            if (pattern.includes(':')) {
                const params = this.parseParams(pattern, path);
                if (params) {
                    return { handler: this.routes[pattern], params };
                }
            }
        }

        return null;
    },

    /**
     * 处理路由变化
     */
    async handleRoute() {
        const path = this.getPath();
        const query = Utils.getQueryParams();
        
        // 更新导航状态
        this.updateNavigation(path);
        
        // 滚动到顶部
        Utils.scrollToTop();
        
        // 显示加载状态
        this.showLoading();

        // 匹配路由
        const match = this.matchRoute(path);
        
        if (match) {
            this.currentRoute = { path, params: match.params, query };
            try {
                await match.handler(match.params, query);
            } catch (error) {
                console.error('Route handler error:', error);
                this.show404();
            }
        } else {
            this.show404();
        }
    },

    /**
     * 更新导航状态
     */
    updateNavigation(path) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const route = href ? href.replace('#', '') : '';
            
            // 判断是否匹配当前路由
            const isActive = path === route || 
                           (route === '/' && path === '/') ||
                           (route !== '/' && path.startsWith(route));
            
            link.classList.toggle('active', isActive);
        });
    },

    /**
     * 显示加载状态
     */
    showLoading() {
        const main = document.getElementById('main');
        if (main) {
            main.innerHTML = `
                <div class="container">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <p>加载中...</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * 显示404页面
     */
    show404() {
        const main = document.getElementById('main');
        if (main) {
            main.innerHTML = `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h2 class="empty-state-title">页面未找到</h2>
                        <p>抱歉，您访问的页面不存在</p>
                        <a href="#/" class="tag" style="margin-top: 1rem; display: inline-block;">返回首页</a>
                    </div>
                </div>
            `;
        }
    },

    /**
     * 渲染内容到主区域
     */
    render(html) {
        const main = document.getElementById('main');
        if (main) {
            main.innerHTML = `<div class="container">${html}</div>`;
        }
    },

    /**
     * 渲染内容（带内容宽度限制）
     */
    renderContent(html) {
        const main = document.getElementById('main');
        if (main) {
            main.innerHTML = `<div class="container"><div class="content-container">${html}</div></div>`;
        }
    }
};

// 导出到全局
window.Router = Router;
