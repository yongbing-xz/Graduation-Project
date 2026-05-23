/**
 * 前端错误处理系统 - 简单HTML版本
 * 负责捕获、处理和上报前端错误
 */

class SimpleErrorHandler {
    constructor() {
        this.errorHistory = [];
        this.maxHistorySize = 50;
        this.errorReportAPI = '/api/monitoring/errors/report';
        this.init();
    }

    /**
     * 初始化错误处理系统
     */
    init() {
        this.setupGlobalErrorHandler();
        this.setupPromiseErrorHandler();
        this.setupNetworkErrorHandler();
        this.loadSavedErrors();
    }

    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            const error = {
                type: 'javascript',
                level: 'high',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            this.handleError(error);
            this.reportError(error);
        });
    }

    /**
     * 设置Promise错误处理
     */
    setupPromiseErrorHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                type: 'promise',
                level: 'medium',
                message: event.reason?.message || '未处理的Promise rejection',
                stack: event.reason?.stack,
                reason: event.reason,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            this.handleError(error);
            this.reportError(error);
        });
    }

    /**
     * 设置网络错误处理
     */
    setupNetworkErrorHandler() {
        window.addEventListener('offline', () => {
            const error = {
                type: 'network',
                level: 'high',
                message: '网络连接已断开',
                url: window.location.href,
                timestamp: new Date().toISOString()
            };

            this.handleError(error);
            this.showNotification('网络连接断开', '请检查您的网络连接', 'warning');
        });

        window.addEventListener('online', () => {
            this.showNotification('网络连接恢复', '网络连接已恢复正常', 'success');
            this.retryFailedReports();
        });
    }

    /**
     * 处理错误
     */
    handleError(error) {
        // 保存到历史记录
        this.saveToHistory(error);
        
        // 显示错误提示
        this.showErrorMessage(error);
        
        // 开发环境下打印详细信息
        if (this.isDevelopment()) {
            console.group('🚨 错误详情');
            console.error('错误类型:', error.type);
            console.error('错误级别:', error.level);
            console.error('错误信息:', error.message);
            if (error.stack) console.error('错误堆栈:', error.stack);
            console.groupEnd();
        }
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(error) {
        let message = this.getDisplayMessage(error);
        let type = 'error';
        
        switch (error.level) {
            case 'low':
                type = 'info';
                break;
            case 'medium':
                type = 'warning';
                break;
            case 'high':
                type = 'error';
                break;
            case 'critical':
                type = 'error';
                message = '系统出现严重错误，请联系管理员';
                break;
        }

        this.showNotification('错误提示', message, type);
    }

    /**
     * 显示通知消息
     */
    showNotification(title, message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <strong>${title}</strong>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">
                ${message}
            </div>
        `;

        // 添加样式
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: bold;
                }
                .notification-body {
                    padding: 12px 16px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 12px;
                }
                .notification-info { border-left: 4px solid #2196F3; }
                .notification-warning { border-left: 4px solid #FF9800; }
                .notification-error { border-left: 4px solid #F44336; }
                .notification-success { border-left: 4px solid #4CAF50; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // 添加到页面
        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, type === 'error' ? 8000 : 4000);
    }

    /**
     * 获取用户友好的错误消息
     */
    getDisplayMessage(error) {
        const messages = {
            'network': {
                'high': '网络连接出现问题，请检查您的网络设置',
                'critical': '无法连接到服务器，请稍后重试'
            },
            'http': {
                'high': '服务器请求失败，请稍后重试',
                'critical': '服务器内部错误，请联系管理员'
            },
            'javascript': {
                'high': '程序执行出现错误',
                'critical': '程序出现严重错误'
            }
        };

        return messages[error.type]?.[error.level] || error.message || '操作失败，请重试';
    }

    /**
     * 保存错误到历史记录
     */
    saveToHistory(error) {
        this.errorHistory.unshift(error);
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }
        
        // 保存到localStorage
        this.saveToLocalStorage();
    }

    /**
     * 保存到localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('error_history', JSON.stringify(this.errorHistory));
        } catch (e) {
            console.warn('无法保存错误历史到localStorage:', e);
        }
    }

    /**
     * 从localStorage加载错误历史
     */
    loadSavedErrors() {
        try {
            const saved = localStorage.getItem('error_history');
            if (saved) {
                this.errorHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('无法从localStorage加载错误历史:', e);
        }
    }

    /**
     * 上报错误到服务器
     */
    async reportError(error) {
        if (!navigator.onLine) {
            console.warn('网络断开，跳过错误上报');
            this.saveForRetry(error);
            return;
        }

        try {
            // 过滤敏感信息
            const reportData = this.sanitizeErrorData(error);
            
            const response = await fetch(this.errorReportAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (e) {
            console.warn('错误上报失败:', e);
            this.saveForRetry(error);
        }
    }

    /**
     * 清理错误数据中的敏感信息
     */
    sanitizeErrorData(error) {
        const sensitiveKeys = ['password', 'token', 'authorization', 'cookie'];
        const sanitized = { ...error };

        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;
            
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
                    result[key] = '[REDACTED]';
                } else if (typeof value === 'object') {
                    result[key] = sanitizeObject(value);
                } else {
                    result[key] = value;
                }
            }
            return result;
        };

        return sanitizeObject(sanitized);
    }

    /**
     * 保存失败的上报请求
     */
    saveForRetry(error) {
        try {
            const retryQueue = JSON.parse(localStorage.getItem('error_retry_queue') || '[]');
            retryQueue.push({
                error: this.sanitizeErrorData(error),
                timestamp: Date.now()
            });
            
            // 限制队列大小
            if (retryQueue.length > 20) {
                retryQueue.splice(0, retryQueue.length - 20);
            }
            
            localStorage.setItem('error_retry_queue', JSON.stringify(retryQueue));
        } catch (e) {
            console.warn('无法保存重试队列:', e);
        }
    }

    /**
     * 重试失败的上报
     */
    async retryFailedReports() {
        try {
            const retryQueue = JSON.parse(localStorage.getItem('error_retry_queue') || '[]');
            if (retryQueue.length === 0) return;

            const successfulReports = [];
            
            for (const item of retryQueue) {
                try {
                    const response = await fetch(this.errorReportAPI, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(item.error)
                    });

                    if (response.ok) {
                        successfulReports.push(item);
                    }
                } catch (e) {
                    // 跳过失败的，保留在队列中
                }
            }

            // 移除成功上报的
            const remainingQueue = retryQueue.filter(item => !successfulReports.includes(item));
            localStorage.setItem('error_retry_queue', JSON.stringify(remainingQueue));
            
            if (successfulReports.length > 0) {
                this.showNotification('错误恢复', `成功上报 ${successfulReports.length} 个错误`, 'success');
            }
        } catch (e) {
            console.warn('重试失败的上报时出错:', e);
        }
    }

    /**
     * 判断是否为开发环境
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev');
    }

    /**
     * 获取错误历史
     */
    getErrorHistory() {
        return [...this.errorHistory];
    }

    /**
     * 清空错误历史
     */
    clearErrorHistory() {
        this.errorHistory = [];
        localStorage.removeItem('error_history');
        this.showNotification('清理完成', '错误历史已清空', 'success');
    }

    /**
     * 导出错误报告
     */
    exportErrorReport() {
        const report = {
            exportTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errorCount: this.errorHistory.length,
            errors: this.errorHistory
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('导出成功', '错误报告已下载', 'success');
    }

    /**
     * 显示错误历史面板
     */
    showErrorHistoryPanel() {
        // 创建错误历史面板
        const panel = document.createElement('div');
        panel.className = 'error-history-panel';
        panel.innerHTML = `
            <div class="error-history-header">
                <h3>错误历史记录</h3>
                <div>
                    <button onclick="window.errorHandler.exportErrorReport()">导出报告</button>
                    <button onclick="window.errorHandler.clearErrorHistory()">清空历史</button>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
            </div>
            <div class="error-history-body">
                ${this.errorHistory.length === 0 ? 
                    '<p>暂无错误记录</p>' : 
                    this.errorHistory.map((error, index) => `
                        <div class="error-item">
                            <div class="error-header">
                                <span class="error-type">${error.type}</span>
                                <span class="error-level level-${error.level}">${error.level}</span>
                                <span class="error-time">${new Date(error.timestamp).toLocaleString()}</span>
                            </div>
                            <div class="error-message">${error.message}</div>
                            ${error.stack ? `<details><summary>查看堆栈</summary><pre>${error.stack}</pre></details>` : ''}
                        </div>
                    `).join('')
                }
            </div>
        `;

        // 添加样式
        if (!document.getElementById('error-history-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-history-styles';
            styles.textContent = `
                .error-history-panel {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .error-history-panel > div {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 800px;
                    height: 80%;
                    max-height: 600px;
                    display: flex;
                    flex-direction: column;
                }
                .error-history-header {
                    padding: 16px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .error-history-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }
                .error-item {
                    margin-bottom: 16px;
                    padding: 12px;
                    border: 1px solid #eee;
                    border-radius: 4px;
                }
                .error-header {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .error-type {
                    background: #e3f2fd;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: bold;
                }
                .error-level {
                    padding: 2px 8px;
                    border-radius: 12px;
                    color: white;
                    font-weight: bold;
                }
                .level-low { background: #4CAF50; }
                .level-medium { background: #FF9800; }
                .level-high { background: #F44336; }
                .level-critical { background: #B71C1C; }
                .error-time { color: #666; }
                .error-message {
                    margin-bottom: 8px;
                    color: #333;
                }
                details pre {
                    background: #f5f5f5;
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    overflow-x: auto;
                }
                .close-btn {
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 12px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(panel);
    }
}

// 创建全局实例
window.errorHandler = new SimpleErrorHandler();

// 添加全局错误显示函数
window.showError = function(message, type = 'error') {
    window.errorHandler.showNotification('错误提示', message, type);
};

// 添加业务错误处理函数
window.handleBusinessError = function(message, level = 'medium') {
    const error = {
        type: 'business',
        level: level,
        message: message,
        url: window.location.href,
        timestamp: new Date().toISOString()
    };
    window.errorHandler.handleError(error);
};

// 添加快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+E 显示错误历史
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        window.errorHandler.showErrorHistoryPanel();
    }
});