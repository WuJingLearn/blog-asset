/**
 * search.js - 搜索功能模块
 */

const Search = {
    fuse: null,
    modal: null,
    input: null,
    results: null,
    isOpen: false,

    /**
     * 初始化搜索
     */
    init() {
        this.modal = document.getElementById('search-modal');
        this.input = document.getElementById('search-input');
        this.results = document.getElementById('search-results');

        // 初始化 Fuse.js
        this.initFuse();

        // 绑定事件
        this.bindEvents();
    },

    /**
     * 初始化 Fuse.js 搜索引擎
     */
    initFuse() {
        const posts = Article.getAll();
        
        const options = {
            keys: [
                { name: 'title', weight: 0.4 },
                { name: 'description', weight: 0.3 },
                { name: 'category', weight: 0.15 },
                { name: 'tags', weight: 0.15 }
            ],
            threshold: 0.3,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2
        };

        this.fuse = new Fuse(posts, options);
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索按钮点击
        const searchToggle = document.getElementById('search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', () => this.open());
        }

        // 点击遮罩关闭
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // 输入搜索
        if (this.input) {
            this.input.addEventListener('input', Utils.debounce((e) => {
                this.search(e.target.value);
            }, 200));
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            
            // ESC 关闭搜索
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * 打开搜索
     */
    open() {
        if (!this.modal) return;
        
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // 聚焦输入框
        setTimeout(() => {
            if (this.input) {
                this.input.focus();
            }
        }, 100);
    },

    /**
     * 关闭搜索
     */
    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        // 清空输入和结果
        if (this.input) {
            this.input.value = '';
        }
        this.showHint();
    },

    /**
     * 切换搜索
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * 执行搜索
     */
    search(keyword) {
        if (!this.results) return;

        const trimmedKeyword = keyword.trim();

        if (!trimmedKeyword) {
            this.showHint();
            return;
        }

        // 使用 Fuse.js 搜索
        const results = this.fuse.search(trimmedKeyword);

        if (results.length === 0) {
            this.showNoResults(trimmedKeyword);
            return;
        }

        this.renderResults(results, trimmedKeyword);
    },

    /**
     * 显示提示
     */
    showHint() {
        if (this.results) {
            this.results.innerHTML = `
                <div class="search-hint">输入关键词开始搜索</div>
            `;
        }
    },

    /**
     * 显示无结果
     */
    showNoResults(keyword) {
        if (this.results) {
            this.results.innerHTML = `
                <div class="search-no-results">
                    <p>未找到与 "<strong>${Utils.escapeHtml(keyword)}</strong>" 相关的文章</p>
                </div>
            `;
        }
    },

    /**
     * 渲染搜索结果
     */
    renderResults(results, keyword) {
        if (!this.results) return;

        const html = results.map(result => {
            const post = result.item;
            const highlightedTitle = Utils.highlightText(post.title, keyword);
            
            return `
                <div class="search-result-item" onclick="Search.goToPost('${post.id}')">
                    <div class="search-result-title">${highlightedTitle}</div>
                    <div class="search-result-meta">
                        ${Utils.formatDate(post.date, 'YYYY年MM月DD日')}
                        ${post.category ? ` · ${post.category}` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.results.innerHTML = html;
    },

    /**
     * 跳转到文章
     */
    goToPost(postId) {
        this.close();
        Router.navigate(`/post/${postId}`);
    }
};

// 导出到全局
window.Search = Search;
