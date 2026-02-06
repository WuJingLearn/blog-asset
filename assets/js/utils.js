/**
 * utils.js - 工具函数模块
 */

const Utils = {
    /**
     * 防抖函数
     */
    debounce(fn, delay = 300) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * 节流函数
     */
    throttle(fn, delay = 100) {
        let lastTime = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastTime >= delay) {
                lastTime = now;
                fn.apply(this, args);
            }
        };
    },

    /**
     * 格式化日期
     */
    formatDate(dateStr, format = 'YYYY-MM-DD') {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];

        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'YYYY年MM月DD日':
                return `${year}年${month}月${day}日`;
            case 'MM月DD日':
                return `${month}月${day}日`;
            case 'YYYY':
                return String(year);
            case 'MM':
                return month;
            case 'month-name':
                return monthNames[date.getMonth()];
            default:
                return `${year}-${month}-${day}`;
        }
    },

    /**
     * 计算阅读时间（分钟）
     */
    calculateReadTime(content) {
        const wordsPerMinute = 300; // 中文阅读速度
        const wordCount = content.replace(/\s+/g, '').length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    },

    /**
     * 平滑滚动到顶部
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    /**
     * 平滑滚动到元素
     */
    scrollToElement(element, offset = 80) {
        if (!element) return;
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    },

    /**
     * 获取URL参数
     */
    getQueryParams(search = window.location.hash) {
        const params = {};
        const queryIndex = search.indexOf('?');
        if (queryIndex === -1) return params;

        const queryString = search.slice(queryIndex + 1);
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        return params;
    },

    /**
     * 本地存储封装
     */
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch {
                return false;
            }
        }
    },

    /**
     * 解析 Markdown Front Matter
     */
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);

        if (!match) {
            return { metadata: {}, content };
        }

        try {
            const metadata = jsyaml.load(match[1]) || {};
            return { metadata, content: match[2].trim() };
        } catch (e) {
            console.error('Error parsing front matter:', e);
            return { metadata: {}, content };
        }
    },

    /**
     * 生成唯一ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 9);
    },

    /**
     * 转义HTML
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * 高亮搜索关键词
     */
    highlightText(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * 截断文本
     */
    truncateText(text, maxLength = 150) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength).trim() + '...';
    },

    /**
     * 检测是否为移动设备
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * 检测系统主题偏好
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * 复制文本到剪贴板
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    },

    /**
     * 按年月分组文章
     */
    groupPostsByDate(posts) {
        const grouped = {};
        
        posts.forEach(post => {
            const year = Utils.formatDate(post.date, 'YYYY');
            const month = Utils.formatDate(post.date, 'MM');
            
            if (!grouped[year]) {
                grouped[year] = {};
            }
            if (!grouped[year][month]) {
                grouped[year][month] = [];
            }
            grouped[year][month].push(post);
        });

        // Sort by year (descending) and month (descending)
        const sortedYears = Object.keys(grouped).sort((a, b) => b - a);
        const result = {};
        
        sortedYears.forEach(year => {
            result[year] = {};
            const sortedMonths = Object.keys(grouped[year]).sort((a, b) => b - a);
            sortedMonths.forEach(month => {
                result[year][month] = grouped[year][month].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
            });
        });

        return result;
    },

    /**
     * 统计文章数据
     */
    getPostsStats(posts) {
        const categories = new Set();
        const tags = new Set();
        const years = new Set();

        posts.forEach(post => {
            if (post.category) categories.add(post.category);
            if (post.tags) post.tags.forEach(tag => tags.add(tag));
            years.add(Utils.formatDate(post.date, 'YYYY'));
        });

        return {
            totalPosts: posts.length,
            totalCategories: categories.size,
            totalTags: tags.size,
            years: Array.from(years).sort((a, b) => b - a)
        };
    }
};

// 导出到全局
window.Utils = Utils;
