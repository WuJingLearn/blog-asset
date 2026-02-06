/**
 * app.js - 应用入口和初始化
 */

const App = {
    /**
     * 初始化应用
     */
    async init() {
        // 初始化主题
        Theme.init();
        
        // 加载文章数据
        await Article.init();
        
        // 初始化搜索
        Search.init();
        
        // 注册路由
        this.registerRoutes();
        
        // 初始化路由
        Router.init();
        
        // 绑定全局事件
        this.bindGlobalEvents();
        
        // 设置年份
        this.setCurrentYear();
    },

    /**
     * 注册路由
     */
    registerRoutes() {
        // 首页 - 文章列表
        Router.register('/', () => {
            document.title = 'My Blog - 首页';
            const posts = Article.getAll();
            const html = `
                <div class="page-header">
                    <h1 class="page-title">最新文章</h1>
                    <p class="page-description">记录生活与技术的点滴</p>
                </div>
                ${Article.renderPostsList(posts)}
            `;
            Router.render(html);
        });

        // 时间轴
        Router.register('/timeline', () => {
            document.title = '时间轴 - My Blog';
            const html = Timeline.render();
            Router.render(html);
            // 初始化动画
            setTimeout(() => Timeline.initAnimations(), 100);
        });

        // 分类列表
        Router.register('/categories', () => {
            document.title = '分类 - My Blog';
            const stats = Article.getCategoryStats();
            const html = this.renderCategoriesPage(stats);
            Router.render(html);
        });

        // 单个分类
        Router.register('/category/:name', (params) => {
            const category = params.name;
            document.title = `${category} - My Blog`;
            const posts = Article.getByCategory(category);
            const html = `
                <div class="filter-header">
                    <h1 class="filter-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                        </svg>
                        ${category}
                        <span class="filter-count">(${posts.length} 篇)</span>
                    </h1>
                </div>
                ${Article.renderPostsList(posts)}
            `;
            Router.render(html);
        });

        // 标签列表
        Router.register('/tags', () => {
            document.title = '标签 - My Blog';
            const stats = Article.getTagStats();
            const html = this.renderTagsPage(stats);
            Router.render(html);
        });

        // 单个标签
        Router.register('/tag/:name', (params) => {
            const tag = params.name;
            document.title = `${tag} - My Blog`;
            const posts = Article.getByTag(tag);
            const html = `
                <div class="filter-header">
                    <h1 class="filter-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path>
                            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
                        </svg>
                        ${tag}
                        <span class="filter-count">(${posts.length} 篇)</span>
                    </h1>
                </div>
                ${Article.renderPostsList(posts)}
            `;
            Router.render(html);
        });

        // 文章详情
        Router.register('/post/:id', async (params) => {
            const html = await Article.renderArticle(params.id);
            Router.renderContent(html);
            // 重新高亮代码块
            setTimeout(() => {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 100);
        });

        // 关于页面
        Router.register('/about', () => {
            document.title = '关于 - My Blog';
            const html = this.renderAboutPage();
            Router.render(html);
        });

        // 搜索结果页
        Router.register('/search', (params, query) => {
            const keyword = query.q || '';
            document.title = `搜索: ${keyword} - My Blog`;
            const posts = keyword ? Article.search(keyword) : [];
            const html = `
                <div class="filter-header">
                    <h1 class="filter-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        搜索: ${Utils.escapeHtml(keyword)}
                        <span class="filter-count">(${posts.length} 篇)</span>
                    </h1>
                </div>
                ${Article.renderPostsList(posts)}
            `;
            Router.render(html);
        });
    },

    /**
     * 渲染分类页面
     */
    renderCategoriesPage(stats) {
        const categories = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        
        if (categories.length === 0) {
            return `
                <div class="page-header">
                    <h1 class="page-title">分类</h1>
                    <p class="page-description">文章分类管理</p>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <h2 class="empty-state-title">暂无分类</h2>
                </div>
            `;
        }

        const categoriesHtml = categories.map(([name, count]) => `
            <a href="#/category/${encodeURIComponent(name)}" class="category-item">
                <span>${name}</span>
                <span class="category-count">${count}</span>
            </a>
        `).join('');

        return `
            <div class="page-header">
                <h1 class="page-title">分类</h1>
                <p class="page-description">共 ${categories.length} 个分类</p>
            </div>
            <div class="category-list">
                ${categoriesHtml}
            </div>
        `;
    },

    /**
     * 渲染标签页面
     */
    renderTagsPage(stats) {
        const tags = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        
        if (tags.length === 0) {
            return `
                <div class="page-header">
                    <h1 class="page-title">标签</h1>
                    <p class="page-description">文章标签云</p>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">🏷️</div>
                    <h2 class="empty-state-title">暂无标签</h2>
                </div>
            `;
        }

        const tagsHtml = tags.map(([name, count]) => `
            <a href="#/tag/${encodeURIComponent(name)}" class="tag-item">
                <span>${name}</span>
                <span class="tag-count">${count}</span>
            </a>
        `).join('');

        return `
            <div class="page-header">
                <h1 class="page-title">标签</h1>
                <p class="page-description">共 ${tags.length} 个标签</p>
            </div>
            <div class="tag-list">
                ${tagsHtml}
            </div>
        `;
    },

    /**
     * 渲染关于页面
     */
    renderAboutPage() {
        return `
            <div class="about-content">
                <div class="about-bio">
                    <div class="about-avatar">
                        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                            👤
                        </div>
                    </div>
                    <h1 class="about-name">关于我</h1>
                    <p class="about-description">一个热爱技术与生活的人</p>
                    <div class="about-social">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                <path d="M9 18c-4.51 2-5-2-7-2"></path>
                            </svg>
                        </a>
                        <a href="mailto:example@email.com" aria-label="Email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div class="article-content">
                    <h2>欢迎来到我的博客</h2>
                    <p>这是一个使用纯 HTML/CSS/JavaScript 构建的个人博客，托管在 GitHub Pages 上。</p>
                    
                    <h3>博客特性</h3>
                    <ul>
                        <li>响应式设计，适配各种设备</li>
                        <li>支持深色/浅色主题切换</li>
                        <li>时间轴视图展示文章历史</li>
                        <li>文章分类和标签系统</li>
                        <li>全文搜索功能</li>
                        <li>Markdown 文章支持</li>
                        <li>代码语法高亮</li>
                    </ul>
                    
                    <h3>技术栈</h3>
                    <ul>
                        <li>HTML5 / CSS3 / JavaScript (ES6+)</li>
                        <li>marked.js - Markdown 解析</li>
                        <li>highlight.js - 代码高亮</li>
                        <li>Fuse.js - 模糊搜索</li>
                    </ul>
                    
                    <p>感谢您的访问！</p>
                </div>
            </div>
        `;
    },

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 返回顶部按钮
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            // 显示/隐藏按钮
            window.addEventListener('scroll', Utils.throttle(() => {
                const show = window.scrollY > 300;
                backToTop.classList.toggle('visible', show);
            }, 100));

            // 点击返回顶部
            backToTop.addEventListener('click', () => {
                Utils.scrollToTop();
            });
        }

        // 阅读进度条
        const progressBar = document.getElementById('reading-progress');
        if (progressBar) {
            window.addEventListener('scroll', Utils.throttle(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                progressBar.style.width = `${progress}%`;
            }, 50));
        }

        // 移动端菜单
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const nav = document.getElementById('nav');
        if (mobileMenuToggle && nav) {
            mobileMenuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });

            // 点击导航链接后关闭菜单
            nav.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                });
            });
        }
    },

    /**
     * 设置当前年份
     */
    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
};

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
