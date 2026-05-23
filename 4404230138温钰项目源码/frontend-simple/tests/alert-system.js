import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AlertSystem {
  constructor(config) {
    this.config = config || {};
    this.alertHistory = [];
    this.maxHistorySize = 100;
  }

  async sendAlert(alertData) {
    const {
      level = 'warning',
      title,
      message,
      testName,
      testResult,
      timestamp = new Date().toISOString()
    } = alertData;

    const alert = {
      id: this.generateAlertId(),
      level,
      title,
      message,
      testName,
      testResult,
      timestamp,
      acknowledged: false
    };

    // 添加到历史记录
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.maxHistorySize);
    }

    // 根据级别决定通知方式
    await this.handleAlertNotification(alert);

    // 保存到文件
    await this.saveAlertHistory();

    return alert;
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async handleAlertNotification(alert) {
    const { level, title, message, testName } = alert;

    // 控制台输出
    this.consoleNotification(alert);

    // 邮件通知
    if (this.config.email?.enabled && level === 'critical') {
      await this.sendEmailNotification(alert);
    }

    // Slack通知
    if (this.config.slack?.enabled && (level === 'critical' || level === 'warning')) {
      await this.sendSlackNotification(alert);
    }

    // 文件日志
    await this.logToFile(alert);
  }

  consoleNotification(alert) {
    const { level, title, message, testName, timestamp } = alert;
    
    const colors = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵'
    };

    const icon = colors[level] || '⚪';
    
    console.log(`\n${icon} 警报通知 [${level.toUpperCase()}]`);
    console.log(`标题: ${title}`);
    console.log(`测试: ${testName || 'N/A'}`);
    console.log(`消息: ${message}`);
    console.log(`时间: ${new Date(timestamp).toLocaleString('zh-CN')}`);
    console.log('─'.repeat(60));
  }

  async sendEmailNotification(alert) {
    const { email } = this.config;
    
    if (!email?.recipients?.length) {
      console.warn('⚠️ 邮件通知已启用但未配置收件人');
      return;
    }

    try {
      // 这里可以集成实际的邮件发送服务
      // 例如使用 nodemailer、sendgrid 等
      console.log(`📧 发送邮件通知给: ${email.recipients.join(', ')}`);
      
      // 模拟邮件发送
      const emailContent = this.generateEmailContent(alert);
      console.log('邮件内容预览:');
      console.log(emailContent);
      
    } catch (error) {
      console.error('❌ 邮件通知发送失败:', error.message);
    }
  }

  async sendSlackNotification(alert) {
    const { slack } = this.config;
    
    if (!slack?.webhookUrl) {
      console.warn('⚠️ Slack通知已启用但未配置Webhook URL');
      return;
    }

    try {
      // 这里可以集成实际的Slack Webhook
      console.log(`💬 发送Slack通知到Webhook`);
      
      // 模拟Slack消息
      const slackMessage = this.generateSlackMessage(alert);
      console.log('Slack消息预览:');
      console.log(slackMessage);
      
    } catch (error) {
      console.error('❌ Slack通知发送失败:', error.message);
    }
  }

  async logToFile(alert) {
    try {
      const logsDir = path.join(__dirname, 'logs');
      await fs.ensureDir(logsDir);
      
      const logFile = path.join(logsDir, 'alerts.log');
      const logEntry = `${alert.timestamp} [${alert.level.toUpperCase()}] ${alert.title} - ${alert.message}\n`;
      
      await fs.appendFile(logFile, logEntry);
      
    } catch (error) {
      console.error('❌ 警报日志写入失败:', error.message);
    }
  }

  generateEmailContent(alert) {
    return `
项目稳定性测试警报

警报级别: ${alert.level.toUpperCase()}
测试名称: ${alert.testName || 'N/A'}
标题: ${alert.title}
消息: ${alert.message}
时间: ${new Date(alert.timestamp).toLocaleString('zh-CN')}

测试结果详情:
${JSON.stringify(alert.testResult, null, 2)}

请及时处理此问题。

--
自动化测试系统
    `;
  }

  generateSlackMessage(alert) {
    const colors = {
      critical: '#FF0000',
      warning: '#FFA500',
      info: '#008000'
    };

    return {
      attachments: [
        {
          color: colors[alert.level] || '#808080',
          title: `🚨 ${alert.title}`,
          text: alert.message,
          fields: [
            {
              title: '测试名称',
              value: alert.testName || 'N/A',
              short: true
            },
            {
              title: '警报级别',
              value: alert.level.toUpperCase(),
              short: true
            },
            {
              title: '时间',
              value: new Date(alert.timestamp).toLocaleString('zh-CN'),
              short: false
            }
          ]
        }
      ]
    };
  }

  async saveAlertHistory() {
    try {
      const historyFile = path.join(__dirname, 'data', 'alert-history.json');
      await fs.ensureDir(path.dirname(historyFile));
      
      const historyData = {
        lastUpdated: new Date().toISOString(),
        alerts: this.alertHistory
      };
      
      await fs.writeJson(historyFile, historyData, { spaces: 2 });
      
    } catch (error) {
      console.error('❌ 警报历史保存失败:', error.message);
    }
  }

  async loadAlertHistory() {
    try {
      const historyFile = path.join(__dirname, 'data', 'alert-history.json');
      
      if (await fs.pathExists(historyFile)) {
        const historyData = await fs.readJson(historyFile);
        this.alertHistory = historyData.alerts || [];
      }
      
    } catch (error) {
      console.warn('⚠️ 警报历史加载失败，将使用空历史记录');
      this.alertHistory = [];
    }
  }

  getRecentAlerts(limit = 10) {
    return this.alertHistory.slice(0, limit);
  }

  getAlertsByLevel(level, limit = 10) {
    return this.alertHistory
      .filter(alert => alert.level === level)
      .slice(0, limit);
  }

  acknowledgeAlert(alertId) {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      this.saveAlertHistory();
    }
  }

  // 测试结果分析器
  analyzeTestResults(testResults) {
    const analysis = {
      totalTests: testResults.length,
      passedTests: testResults.filter(r => r.passed).length,
      failedTests: testResults.filter(r => !r.passed).length,
      passRate: 0,
      criticalIssues: [],
      warnings: [],
      suggestions: []
    };

    analysis.passRate = analysis.totalTests > 0 
      ? (analysis.passedTests / analysis.totalTests * 100).toFixed(2)
      : 0;

    // 分析失败原因
    testResults.forEach(result => {
      if (!result.passed) {
        const issue = {
          testName: result.name,
          error: result.error,
          duration: result.duration,
          level: this.determineIssueLevel(result)
        };

        if (issue.level === 'critical') {
          analysis.criticalIssues.push(issue);
        } else if (issue.level === 'warning') {
          analysis.warnings.push(issue);
        }
      }
    });

    // 生成建议
    if (analysis.passRate < 95) {
      analysis.suggestions.push('测试通过率较低，建议优先修复关键问题');
    }

    if (analysis.criticalIssues.length > 0) {
      analysis.suggestions.push(`发现 ${analysis.criticalIssues.length} 个关键问题，需要立即处理`);
    }

    return analysis;
  }

  determineIssueLevel(testResult) {
    const { error, duration, performanceMetrics } = testResult;

    // 性能问题通常是警告级别
    if (performanceMetrics) {
      const thresholds = {
        pageLoad: 3000,
        componentSelection: 500,
        compatibilityCheck: 1000
      };

      for (const [metric, value] of Object.entries(performanceMetrics)) {
        if (typeof value === 'object') {
          for (const [subMetric, subValue] of Object.entries(value)) {
            const threshold = thresholds[subMetric] || 1000;
            if (subValue > threshold * 2) {
              return 'critical';
            } else if (subValue > threshold) {
              return 'warning';
            }
          }
        }
      }
    }

    // 功能性问题根据错误类型判断
    if (error) {
      const criticalErrors = [
        '未定义',
        '语法错误',
        '引用错误',
        '类型错误',
        '无法读取属性',
        '无法调用方法'
      ];

      if (criticalErrors.some(criticalError => error.includes(criticalError))) {
        return 'critical';
      }

      return 'warning';
    }

    // 超时问题
    if (duration > 30000) { // 30秒超时
      return 'critical';
    } else if (duration > 10000) { // 10秒警告
      return 'warning';
    }

    return 'info';
  }

  // 批量发送警报
  async sendBatchAlerts(testResults) {
    const analysis = this.analyzeTestResults(testResults);

    // 发送总体结果警报
    await this.sendAlert({
      level: analysis.passRate >= 99.5 ? 'info' : 'warning',
      title: `测试执行完成 - 通过率 ${analysis.passRate}%`,
      message: `总测试数: ${analysis.totalTests}, 通过: ${analysis.passedTests}, 失败: ${analysis.failedTests}`,
      testName: '测试套件汇总'
    });

    // 发送关键问题警报
    for (const issue of analysis.criticalIssues) {
      await this.sendAlert({
        level: 'critical',
        title: `关键问题: ${issue.testName}`,
        message: issue.error || '测试执行失败',
        testName: issue.testName,
        testResult: issue
      });
    }

    // 发送警告信息
    for (const warning of analysis.warnings) {
      await this.sendAlert({
        level: 'warning',
        title: `警告: ${warning.testName}`,
        message: warning.error || '测试执行异常',
        testName: warning.testName,
        testResult: warning
      });
    }

    // 发送建议
    for (const suggestion of analysis.suggestions) {
      await this.sendAlert({
        level: 'info',
        title: '优化建议',
        message: suggestion,
        testName: '系统建议'
      });
    }

    return analysis;
  }
}

export default AlertSystem;