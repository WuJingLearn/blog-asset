/**
 * article.js - 文章管理模块
 */

const Article = {
    posts: [],
    categories: [],
    tags: [],
    cache: new Map(),
    
    /**
     * 初始化 - 加载文章索引
     */
    async init() {
        try {
            const response = await fetch('data/posts.json');
            if (!response.ok) throw new Error('Failed to load posts');
            
            const data = await response.json();
            this.posts = data.posts || [];
            this.categories = data.categories || [];
            this.tags = data.tags || [];
            
            // 按日期排序（最新在前）
            this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            return true;
        } catch (error) {
            console.error('Error loading posts:', error);
            return false;
        }
    },

    /**
     * 获取所有文章
     */
    getAll() {
        return this.posts;
    },

    /**
     * 根据ID获取文章
     */
    getById(id) {
        return this.posts.find(post => post.id === id);
    },

    /**
     * 根据分类获取文章
     */
    getByCategory(category) {
        return this.posts.filter(post => post.category === category);
    },

    /**
     * 根据标签获取文章
     */
    getByTag(tag) {
        return this.posts.filter(post => post.tags && post.tags.includes(tag));
    },

    /**
     * 搜索文章
     */
    search(keyword) {
        if (!keyword) return [];
        
        const lowerKeyword = keyword.toLowerCase();
        return this.posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(lowerKeyword);
            const descMatch = post.description && post.description.toLowerCase().includes(lowerKeyword);
            const categoryMatch = post.category && post.category.toLowerCase().includes(lowerKeyword);
            const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerKeyword));
            
            return titleMatch || descMatch || categoryMatch || tagMatch;
        });
    },

    /**
     * 加载文章内容
     */
    async loadContent(filename) {
        // 检查缓存
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error('Failed to load article');
            
            const content = await response.text();
            const parsed = Utils.parseFrontMatter(content);
            
            // 缓存结果
            this.cache.set(filename, parsed);
            
            return parsed;
        } catch (error) {
            console.error('Error loading article:', error);
            return null;
        }
    },

    /**
     * 渲染 Markdown 内容
     */
    renderMarkdown(content) {
        // 配置 marked
        marked.setOptions({
            gfm: true,
            breaks: true,
            headerIds: true,
            mangle: false,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error('Highlight error:', e);
                    }
                }
                return hljs.highlightAuto(code).value;
            }
        });

        return marked.parse(content);
    },

    /**
     * 获取相邻文章（上一篇/下一篇）
     */
    getAdjacentPosts(currentId) {
        const index = this.posts.findIndex(post => post.id === currentId);
        
        return {
            prev: index < this.posts.length - 1 ? this.posts[index + 1] : null,
            next: index > 0 ? this.posts[index - 1] : null
        };
    },

    /**
     * 获取分类统计
     */
    getCategoryStats() {
        const stats = {};
        this.posts.forEach(post => {
            if (post.category) {
                stats[post.category] = (stats[post.category] || 0) + 1;
            }
        });
        return stats;
    },

    /**
     * 获取标签统计
     */
    getTagStats() {
        const stats = {};
        this.posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => {
                    stats[tag] = (stats[tag] || 0) + 1;
                });
            }
        });
        return stats;
    },

    /**
     * 渲染文章列表
     */
    renderPostsList(posts) {
        if (posts.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h2 class="empty-state-title">暂无文章</h2>
                    <p>还没有发布任何文章</p>
                </div>
            `;
        }

        return `
            <div class="posts-list">
                ${posts.map(post => this.renderPostCard(post)).join('')}
            </div>
        `;
    },

    /**
     * 渲染单个文章卡片
     */
    renderPostCard(post) {
        const tagsHtml = post.tags 
            ? post.tags.map(tag => `<a href="#/tag/${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')
            : '';

        return `
            <article class="post-card" onclick="Router.navigate('/post/${post.id}')">
                <div class="post-card-meta">
                    <span class="post-card-date">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                            <line x1="16" x2="16" y1="2" y2="6"></line>
                            <line x1="8" x2="8" y1="2" y2="6"></line>
                            <line x1="3" x2="21" y1="10" y2="10"></line>
                        </svg>
                        ${Utils.formatDate(post.date, 'YYYY年MM月DD日')}
                    </span>
                    ${post.category ? `<a href="#/category/${encodeURIComponent(post.category)}" class="post-card-category" onclick="event.stopPropagation()">${post.category}</a>` : ''}
                </div>
                <h2 class="post-card-title">${post.title}</h2>
                ${post.description ? `<p class="post-card-description">${post.description}</p>` : ''}
                <div class="post-card-footer">
                    <div class="post-card-tags" onclick="event.stopPropagation()">
                        ${tagsHtml}
                    </div>
                    ${post.readTime ? `<span class="post-card-read-time">${post.readTime} 分钟阅读</span>` : ''}
                </div>
            </article>
        `;
    },

    /**
     * 渲染文章详情页
     */
    async renderArticle(postId) {
        const post = this.getById(postId);
        
        if (!post) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h2 class="empty-state-title">文章未找到</h2>
                    <p>抱歉，该文章不存在或已被删除</p>
                    <a href="#/" class="tag" style="margin-top: 1rem; display: inline-block;">返回首页</a>
                </div>
            `;
        }

        // 加载文章内容
        const data = await this.loadContent(post.filename);
        
        if (!data) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h2 class="empty-state-title">加载失败</h2>
                    <p>文章内容加载失败，请稍后重试</p>
                    <a href="#/" class="tag" style="margin-top: 1rem; display: inline-block;">返回首页</a>
                </div>
            `;
        }

        // 渲染 Markdown
        const htmlContent = this.renderMarkdown(data.content);
        
        // 获取相邻文章
        const adjacent = this.getAdjacentPosts(postId);
        
        // 标签HTML
        const tagsHtml = post.tags 
            ? post.tags.map(tag => `<a href="#/tag/${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')
            : '';

        // 更新页面标题
        document.title = `${post.title} - My Blog`;

        return `
            <article class="article">
                <header class="article-header">
                    <h1 class="article-title">${post.title}</h1>
                    <div class="article-meta">
                        <span class="article-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" x2="16" y1="2" y2="6"></line>
                                <line x1="8" x2="8" y1="2" y2="6"></line>
                                <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            ${Utils.formatDate(post.date, 'YYYY年MM月DD日')}
                        </span>
                        ${post.category ? `
                            <a href="#/category/${encodeURIComponent(post.category)}" class="article-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                                </svg>
                                ${post.category}
                            </a>
                        ` : ''}
                        ${post.readTime ? `
                            <span class="article-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${post.readTime} 分钟阅读
                            </span>
                        ` : ''}
                    </div>
                    ${tagsHtml ? `<div class="article-tags">${tagsHtml}</div>` : ''}
                </header>
                
                <div class="article-content">
                    ${htmlContent}
                </div>
                
                <nav class="article-nav">
                    ${adjacent.prev ? `
                        <a href="#/post/${adjacent.prev.id}" class="article-nav-item prev">
                            <div class="article-nav-label">← 上一篇</div>
                            <div class="article-nav-title">${adjacent.prev.title}</div>
                        </a>
                    ` : '<div class="article-nav-item prev" style="visibility: hidden;"></div>'}
                    ${adjacent.next ? `
                        <a href="#/post/${adjacent.next.id}" class="article-nav-item next">
                            <div class="article-nav-label">下一篇 →</div>
                            <div class="article-nav-title">${adjacent.next.title}</div>
                        </a>
                    ` : '<div class="article-nav-item next" style="visibility: hidden;"></div>'}
                </nav>
            </article>
        `;
    }
};

// 导出到全局
window.Article = Article;
