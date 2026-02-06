/**
 * theme.js - 主题切换模块
 */

const Theme = {
    STORAGE_KEY: 'blog-theme',
    
    /**
     * 初始化主题
     */
    init() {
        // 获取保存的主题或系统主题
        const savedTheme = Utils.storage.get(this.STORAGE_KEY);
        const theme = savedTheme || Utils.getSystemTheme();
        
        // 应用主题
        this.apply(theme, false);
        
        // 绑定切换按钮事件
        this.bindEvents();
        
        // 监听系统主题变化
        this.watchSystemTheme();
    },

    /**
     * 应用主题
     */
    apply(theme, animate = true) {
        const html = document.documentElement;
        
        if (animate) {
            html.classList.add('theme-transition');
        }
        
        html.setAttribute('data-theme', theme);
        
        // 更新代码高亮主题
        this.updateCodeTheme(theme);
        
        // 保存设置
        Utils.storage.set(this.STORAGE_KEY, theme);
        
        if (animate) {
            setTimeout(() => {
                html.classList.remove('theme-transition');
            }, 300);
        }
    },

    /**
     * 切换主题
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.apply(newTheme);
    },

    /**
     * 获取当前主题
     */
    getCurrent() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    /**
     * 更新代码高亮主题
     */
    updateCodeTheme(theme) {
        const lightStyle = document.getElementById('hljs-light');
        const darkStyle = document.getElementById('hljs-dark');
        
        if (lightStyle && darkStyle) {
            if (theme === 'dark') {
                lightStyle.disabled = true;
                darkStyle.disabled = false;
            } else {
                lightStyle.disabled = false;
                darkStyle.disabled = true;
            }
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 仅当用户没有手动设置过主题时，跟随系统
                const savedTheme = Utils.storage.get(this.STORAGE_KEY);
                if (!savedTheme) {
                    this.apply(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
};

// 导出到全局
window.Theme = Theme;
