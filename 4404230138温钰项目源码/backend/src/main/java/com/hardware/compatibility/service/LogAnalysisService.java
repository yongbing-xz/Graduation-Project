package com.hardware.compatibility.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 日志分析服务接口
 * 提供日志查询、统计和分析功能
 */
public interface LogAnalysisService {
    
    /**
     * 查询日志
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param level 日志级别
     * @param component 组件
     * @param traceId 追踪ID
     * @param userId 用户ID
     * @param keyword 关键词
     * @param limit 限制数量
     * @param offset 偏移量
     * @return 日志列表
     */
    List<Map<String, Object>> queryLogs(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String level,
        String component,
        String traceId,
        String userId,
        String keyword,
        int limit,
        int offset
    );
    
    /**
     * 获取日志统计
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计信息
     */
    Map<String, Object> getLogStatistics(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取错误趋势
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param interval 时间间隔（hour, day, week, month）
     * @return 趋势数据
     */
    List<Map<String, Object>> getErrorTrend(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String interval
    );
    
    /**
     * 获取热门错误
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param limit 限制数量
     * @return 热门错误列表
     */
    List<Map<String, Object>> getTopErrors(LocalDateTime startTime, LocalDateTime endTime, int limit);
    
    /**
     * 获取用户操作统计
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param limit 限制数量
     * @return 用户操作统计
     */
    List<Map<String, Object>> getUserActionStatistics(
        LocalDateTime startTime,
        LocalDateTime endTime,
        int limit
    );
    
    /**
     * 获取API调用统计
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return API调用统计
     */
    Map<String, Object> getApiCallStatistics(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取性能指标统计
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param metricName 指标名称
     * @return 性能指标统计
     */
    Map<String, Object> getPerformanceMetrics(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String metricName
    );
    
    /**
     * 根据追踪ID查询完整调用链
     * @param traceId 追踪ID
     * @return 调用链日志
     */
    List<Map<String, Object>> getTraceLog(String traceId);
    
    /**
     * 搜索日志内容
     * @param query 查询条件
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param limit 限制数量
     * @return 搜索结果
     */
    List<Map<String, Object>> searchLogs(
        String query,
        LocalDateTime startTime,
        LocalDateTime endTime,
        int limit
    );
    
    /**
     * 获取日志文件列表
     * @return 日志文件列表
     */
    List<Map<String, Object>> getLogFiles();
    
    /**
     * 下载日志文件
     * @param filename 文件名
     * @return 文件内容
     */
    byte[] downloadLogFile(String filename);
    
    /**
     * 获取实时日志流
     * @param level 日志级别过滤
     * @param component 组件过滤
     * @return 日志流
     */
    java.io.InputStream getLogStream(String level, String component);
    
    /**
     * 清理历史日志
     * @param beforeDate 清理指定日期之前的日志
     * @return 清理结果
     */
    Map<String, Object> cleanupLogs(LocalDateTime beforeDate);
}