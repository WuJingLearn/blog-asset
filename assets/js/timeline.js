/**
 * timeline.js - 时间轴视图模块
 */

const Timeline = {
    observer: null,

    /**
     * 渲染时间轴页面
     */
    render() {
        const posts = Article.getAll();
        
        if (posts.length === 0) {
            return `
                <div class="page-header">
                    <h1 class="page-title">时间轴</h1>
                    <p class="page-description">记录时光的足迹</p>
                </div>
                <div class="timeline-empty">
                    <p>暂无文章</p>
                </div>
            `;
        }

        // 获取统计数据
        const stats = Utils.getPostsStats(posts);
        
        // 按年月分组
        const grouped = Utils.groupPostsByDate(posts);
        
        // 渲染时间轴
        let timelineHtml = '';
        
        // 获取排序后的年份数组（倒序）
        const years = Object.keys(grouped).sort((a, b) => b - a);
        console.log('Timeline years (sorted):', years);
        
        years.forEach(year => {
            timelineHtml += `
                <div class="timeline-year" data-year="${year}">
                    <div class="timeline-year-label">
                        <span>${year}</span>
                    </div>
            `;
            
            // 获取排序后的月份数组（倒序）
            const months = Object.keys(grouped[year]).sort((a, b) => b - a);
            
            months.forEach(month => {
                const monthName = Utils.formatDate(`${year}-${month}-01`, 'month-name');
                
                timelineHtml += `
                    <div class="timeline-month">
                        <div class="timeline-month-label">
                            <span>${monthName}</span>
                        </div>
                        <div class="timeline-items">
                `;
                
                grouped[year][month].forEach(post => {
                    timelineHtml += this.renderTimelineItem(post);
                });
                
                timelineHtml += `
                        </div>
                    </div>
                `;
            });
            
            timelineHtml += `</div>`;
        });

        // 年份快速导航
        const navHtml = stats.years.map(year => `
            <a href="#timeline-${year}" class="timeline-nav-item" data-year="${year}">${year}</a>
        `).join('');

        return `
            <div class="page-header">
                <h1 class="page-title">时间轴</h1>
                <p class="page-description">记录时光的足迹</p>
            </div>
            
            <div class="timeline-stats">
                <div class="timeline-stat">
                    <div class="timeline-stat-value">${stats.totalPosts}</div>
                    <div class="timeline-stat-label">篇文章</div>
                </div>
                <div class="timeline-stat">
                    <div class="timeline-stat-value">${stats.totalCategories}</div>
                    <div class="timeline-stat-label">个分类</div>
                </div>
                <div class="timeline-stat">
                    <div class="timeline-stat-value">${stats.totalTags}</div>
                    <div class="timeline-stat-label">个标签</div>
                </div>
            </div>
            
            <div class="timeline">
                ${timelineHtml}
            </div>
            
            <nav class="timeline-nav">
                ${navHtml}
            </nav>
        `;
    },

    /**
     * 渲染单个时间轴项目
     */
    renderTimelineItem(post) {
        return `
            <div class="timeline-item" onclick="Router.navigate('/post/${post.id}')">
                <div class="timeline-item-date">${Utils.formatDate(post.date, 'MM月DD日')}</div>
                <div class="timeline-item-title">${post.title}</div>
                ${post.category ? `<div class="timeline-item-category">${post.category}</div>` : ''}
            </div>
        `;
    },

    /**
     * 初始化时间轴动画
     */
    initAnimations() {
        // 清除之前的观察器
        if (this.observer) {
            this.observer.disconnect();
        }

        // 创建 Intersection Observer
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // 观察所有时间轴项目
        const items = document.querySelectorAll('.timeline-item');
        items.forEach(item => {
            this.observer.observe(item);
        });

        // 绑定年份导航点击事件
        this.bindNavigation();
    },

    /**
     * 绑定导航事件
     */
    bindNavigation() {
        const navItems = document.querySelectorAll('.timeline-nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const year = item.getAttribute('data-year');
                const yearElement = document.querySelector(`.timeline-year[data-year="${year}"]`);
                
                if (yearElement) {
                    Utils.scrollToElement(yearElement);
                }
            });
        });

        // 滚动时更新导航状态
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateNavigation();
        }, 100));
    },

    /**
     * 更新导航状态
     */
    updateNavigation() {
        const yearElements = document.querySelectorAll('.timeline-year');
        const navItems = document.querySelectorAll('.timeline-nav-item');
        
        let activeYear = null;
        
        yearElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 150) {
                activeYear = el.getAttribute('data-year');
            }
        });

        navItems.forEach(item => {
            const year = item.getAttribute('data-year');
            item.classList.toggle('active', year === activeYear);
        });
    },

    /**
     * 销毁时间轴（清理事件监听器）
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
};

// 导出到全局
window.Timeline = Timeline;
