package com.hardware.compatibility.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 监控服务接口
 * 负责系统监控、告警和性能统计
 */
public interface MonitoringService {
    
    /**
     * 记录系统指标
     * @param metricName 指标名称
     * @param value 指标值
     * @param tags 标签
     */
    void recordMetric(String metricName, double value, Map<String, String> tags);
    
    /**
     * 记录错误事件
     * @param errorType 错误类型
     * @param errorMessage 错误消息
     * @param severity 严重程度
     * @param context 上下文信息
     */
    void recordError(String errorType, String errorMessage, String severity, Map<String, Object> context);
    
    /**
     * 发送告警
     * @param alertLevel 告警级别
     * @param title 告警标题
     * @param message 告警消息
     * @param metadata 元数据
     */
    void sendAlert(String alertLevel, String title, String message, Map<String, Object> metadata);
    
    /**
     * 获取系统健康状态
     * @return 健康状态信息
     */
    Map<String, Object> getSystemHealth();
    
    /**
     * 获取错误统计
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 错误统计信息
     */
    Map<String, Object> getErrorStatistics(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取性能指标
     * @param metricName 指标名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 性能指标数据
     */
    List<Map<String, Object>> getMetrics(String metricName, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 检查系统资源使用情况
     * @return 资源使用情况
     */
    Map<String, Object> checkSystemResources();
    
    /**
     * 检查数据库连接状态
     * @return 数据库状态
     */
    boolean checkDatabaseHealth();
    
    /**
     * 检查缓存状态
     * @return 缓存状态
     */
    boolean checkCacheHealth();
}