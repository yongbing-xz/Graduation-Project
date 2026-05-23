package com.hardware.compatibility.service.impl;

import com.hardware.compatibility.service.LogAnalysisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 日志分析服务实现类
 * 提供基础版本的日志查询、统计和分析功能
 */
@Service
@Slf4j
public class LogAnalysisServiceImpl implements LogAnalysisService {
    
    private final String logDirectory = "./logs";
    private final DateTimeFormatter logFileFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    @Override
    public List<Map<String, Object>> queryLogs(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String level,
        String component,
        String traceId,
        String userId,
        String keyword,
        int limit,
        int offset
    ) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try {
            // 读取日志文件
            List<String> logFiles = getLogFilesInTimeRange(startTime, endTime);
            
            for (String logFile : logFiles) {
                Path path = Paths.get(logDirectory, logFile);
                if (Files.exists(path)) {
                    results.addAll(parseLogFile(path, startTime, endTime, level, component, traceId, userId, keyword));
                }
            }
            
            // 排序和分页
            results.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
                LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
                return timeB.compareTo(timeA); // 降序排列
            });
            
            // 应用分页
            int fromIndex = Math.min(offset, results.size());
            int toIndex = Math.min(offset + limit, results.size());
            return results.subList(fromIndex, toIndex);
            
        } catch (Exception e) {
            log.error("查询日志时发生错误", e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public Map<String, Object> getLogStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            List<Map<String, Object>> logs = queryLogs(startTime, endTime, null, null, null, null, null, 10000, 0);
            
            // 总日志数
            statistics.put("totalLogs", logs.size());
            
            // 按级别统计
            Map<String, Long> levelCount = logs.stream()
                .collect(Collectors.groupingBy(
                    log -> (String) log.getOrDefault("level", "INFO"),
                    Collectors.counting()
                ));
            statistics.put("levelCount", levelCount);
            
            // 按组件统计
            Map<String, Long> componentCount = logs.stream()
                .collect(Collectors.groupingBy(
                    log -> (String) log.getOrDefault("component", "UNKNOWN"),
                    Collectors.counting()
                ));
            statistics.put("componentCount", componentCount);
            
            // 错误率
            long errorCount = logs.stream()
                .filter(log -> "ERROR".equals(log.get("level")) || "WARN".equals(log.get("level")))
                .count();
            double errorRate = logs.size() > 0 ? (double) errorCount / logs.size() * 100 : 0;
            statistics.put("errorRate", Math.round(errorRate * 100.0) / 100.0);
            
            // 时间范围
            statistics.put("startTime", startTime);
            statistics.put("endTime", endTime);
            
        } catch (Exception e) {
            log.error("获取日志统计时发生错误", e);
        }
        
        return statistics;
    }
    
    @Override
    public List<Map<String, Object>> getErrorTrend(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String interval
    ) {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        try {
            List<Map<String, Object>> logs = queryLogs(startTime, endTime, "ERROR", null, null, null, null, 10000, 0);
            
            // 根据间隔分组
            Map<String, List<Map<String, Object>>> grouped = new HashMap<>();
            
            for (Map<String, Object> log : logs) {
                LocalDateTime time = (LocalDateTime) log.get("timestamp");
                String key = getGroupKey(time, interval);
                grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(log);
            }
            
            // 生成趋势数据
            LocalDateTime current = startTime;
            while (!current.isAfter(endTime)) {
                String key = getGroupKey(current, interval);
                List<Map<String, Object>> groupLogs = grouped.getOrDefault(key, Collections.emptyList());
                
                Map<String, Object> point = new HashMap<>();
                point.put("time", key);
                point.put("count", groupLogs.size());
                point.put("timestamp", current);
                trend.add(point);
                
                // 移动到下一个时间点
                current = getNextTimePoint(current, interval);
            }
            
        } catch (Exception e) {
            log.error("获取错误趋势时发生错误", e);
        }
        
        return trend;
    }
    
    @Override
    public List<Map<String, Object>> getTopErrors(LocalDateTime startTime, LocalDateTime endTime, int limit) {
        List<Map<String, Object>> topErrors = new ArrayList<>();
        
        try {
            List<Map<String, Object>> errorLogs = queryLogs(startTime, endTime, "ERROR", null, null, null, null, 10000, 0);
            
            // 按错误消息分组统计
            Map<String, Long> errorCount = errorLogs.stream()
                .collect(Collectors.groupingBy(
                    log -> (String) log.getOrDefault("message", "Unknown error"),
                    Collectors.counting()
                ));
            
            // 转换为列表并排序
            errorCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .forEach(entry -> {
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", entry.getKey());
                    error.put("count", entry.getValue());
                    error.put("level", "ERROR");
                    topErrors.add(error);
                });
            
        } catch (Exception e) {
            log.error("获取热门错误时发生错误", e);
        }
        
        return topErrors;
    }
    
    @Override
    public List<Map<String, Object>> getUserActionStatistics(
        LocalDateTime startTime,
        LocalDateTime endTime,
        int limit
    ) {
        List<Map<String, Object>> statistics = new ArrayList<>();
        
        try {
            // 搜索用户操作相关的日志
            List<Map<String, Object>> actionLogs = queryLogs(startTime, endTime, null, null, null, null, "用户行为", 10000, 0);
            
            // 按用户分组
            Map<String, Long> userActionCount = actionLogs.stream()
                .collect(Collectors.groupingBy(
                    log -> (String) log.getOrDefault("userId", "unknown"),
                    Collectors.counting()
                ));
            
            // 转换为列表并排序
            userActionCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .forEach(entry -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("userId", entry.getKey());
                    stat.put("actionCount", entry.getValue());
                    statistics.add(stat);
                });
            
        } catch (Exception e) {
            log.error("获取用户操作统计时发生错误", e);
        }
        
        return statistics;
    }
    
    @Override
    public Map<String, Object> getApiCallStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // 搜索API调用相关的日志
            List<Map<String, Object>> apiLogs = queryLogs(startTime, endTime, null, null, null, null, "API调用", 10000, 0);
            
            // 总调用次数
            statistics.put("totalCalls", apiLogs.size());
            
            // 按URL分组
            Map<String, Long> urlCount = apiLogs.stream()
                .collect(Collectors.groupingBy(
                    log -> extractUrlFromMessage((String) log.getOrDefault("message", "")),
                    Collectors.counting()
                ));
            statistics.put("urlCount", urlCount);
            
            // 按状态码分组
            Map<String, Long> statusCodeCount = new HashMap<>();
            apiLogs.stream()
                .filter(log -> log.containsKey("statusCode"))
                .forEach(log -> {
                    String statusCode = String.valueOf(log.get("statusCode"));
                    statusCodeCount.merge(statusCode, 1L, Long::sum);
                });
            statistics.put("statusCodeCount", statusCodeCount);
            
            // 成功率
            long successCount = apiLogs.stream()
                .filter(log -> "200".equals(String.valueOf(log.getOrDefault("statusCode", "500"))))
                .count();
            double successRate = apiLogs.size() > 0 ? (double) successCount / apiLogs.size() * 100 : 0;
            statistics.put("successRate", Math.round(successRate * 100.0) / 100.0);
            
        } catch (Exception e) {
            log.error("获取API调用统计时发生错误", e);
        }
        
        return statistics;
    }
    
    @Override
    public Map<String, Object> getPerformanceMetrics(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String metricName
    ) {
        Map<String, Object> metrics = new HashMap<>();
        
        try {
            // 搜索性能指标相关的日志
            List<Map<String, Object>> performanceLogs = queryLogs(startTime, endTime, null, null, null, null, "性能指标", 10000, 0);
            
            // 如果指定了指标名称，过滤
            if (metricName != null) {
                performanceLogs = performanceLogs.stream()
                    .filter(log -> log.getOrDefault("message", "").toString().contains(metricName))
                    .collect(Collectors.toList());
            }
            
            // 基础统计
            metrics.put("totalMetrics", performanceLogs.size());
            
            // 提取数值指标
            List<Double> values = new ArrayList<>();
            Map<String, Double> namedMetrics = new HashMap<>();
            
            for (Map<String, Object> log : performanceLogs) {
                String message = (String) log.getOrDefault("message", "");
                // 尝试从消息中提取指标值
                Double value = extractMetricValue(message);
                if (value != null) {
                    values.add(value);
                    if (metricName != null) {
                        namedMetrics.put(metricName, value);
                    }
                }
            }
            
            if (!values.isEmpty()) {
                double avg = values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                double max = values.stream().mapToDouble(Double::doubleValue).max().orElse(0);
                double min = values.stream().mapToDouble(Double::doubleValue).min().orElse(0);
                
                metrics.put("average", Math.round(avg * 100.0) / 100.0);
                metrics.put("maximum", Math.round(max * 100.0) / 100.0);
                metrics.put("minimum", Math.round(min * 100.0) / 100.0);
                metrics.put("count", values.size());
            }
            
            if (!namedMetrics.isEmpty()) {
                metrics.put("namedMetrics", namedMetrics);
            }
            
        } catch (Exception e) {
            log.error("获取性能指标时发生错误", e);
        }
        
        return metrics;
    }
    
    @Override
    public List<Map<String, Object>> getTraceLog(String traceId) {
        List<Map<String, Object>> traceLogs = new ArrayList<>();
        
        try {
            traceLogs = queryLogs(null, null, null, null, traceId, null, null, 1000, 0);
            
            // 按时间排序
            traceLogs.sort((a, b) -> {
                LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
                LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
                return timeA.compareTo(timeB);
            });
            
        } catch (Exception e) {
            log.error("获取追踪日志时发生错误", e);
        }
        
        return traceLogs;
    }
    
    @Override
    public List<Map<String, Object>> searchLogs(
        String query,
        LocalDateTime startTime,
        LocalDateTime endTime,
        int limit
    ) {
        List<Map<String, Object>> results = new ArrayList<>();
        
        try {
            List<Map<String, Object>> logs = queryLogs(startTime, endTime, null, null, null, null, null, 10000, 0);
            
            // 简单的文本搜索
            results = logs.stream()
                .filter(log -> {
                    String message = (String) log.getOrDefault("message", "");
                    String level = (String) log.getOrDefault("level", "");
                    String component = (String) log.getOrDefault("component", "");
                    
                    return message.toLowerCase().contains(query.toLowerCase()) ||
                           level.toLowerCase().contains(query.toLowerCase()) ||
                           component.toLowerCase().contains(query.toLowerCase());
                })
                .limit(limit)
                .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("搜索日志时发生错误", e);
        }
        
        return results;
    }
    
    @Override
    public List<Map<String, Object>> getLogFiles() {
        List<Map<String, Object>> logFiles = new ArrayList<>();
        
        try {
            Path logDir = Paths.get(logDirectory);
            if (Files.exists(logDir)) {
                try (Stream<Path> paths = Files.list(logDir)) {
                    paths.filter(Files::isRegularFile)
                         .filter(path -> path.toString().endsWith(".log") || path.toString().endsWith(".gz"))
                         .forEach(path -> {
                             Map<String, Object> fileInfo = new HashMap<>();
                             try {
                                 fileInfo.put("filename", path.getFileName().toString());
                                 fileInfo.put("size", Files.size(path));
                                 fileInfo.put("modifiedTime", Files.getLastModifiedTime(path));
                                 fileInfo.put("path", path.toString());
                             } catch (IOException e) {
                                 log.warn("无法获取文件信息: {}", path, e);
                             }
                             logFiles.add(fileInfo);
                         });
                }
            }
        } catch (Exception e) {
            log.error("获取日志文件列表时发生错误", e);
        }
        
        return logFiles;
    }
    
    @Override
    public byte[] downloadLogFile(String filename) {
        try {
            Path filePath = Paths.get(logDirectory, filename);
            if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
                return Files.readAllBytes(filePath);
            }
        } catch (Exception e) {
            log.error("下载日志文件时发生错误: {}", filename, e);
        }
        return new byte[0];
    }
    
    @Override
    public InputStream getLogStream(String level, String component) {
        // 简化实现，返回空流
        return new InputStream() {
            @Override
            public int read() throws IOException {
                return -1;
            }
        };
    }
    
    @Override
    public Map<String, Object> cleanupLogs(LocalDateTime beforeDate) {
        Map<String, Object> result = new HashMap<>();
        int deletedCount = 0;
        long freedSpace = 0;
        
        try {
            Path logDir = Paths.get(logDirectory);
            if (Files.exists(logDir)) {
                try (Stream<Path> paths = Files.list(logDir)) {
                    List<Path> toDelete = paths
                        .filter(Files::isRegularFile)
                        .filter(path -> {
                            try {
                                return Files.getLastModifiedTime(path).toInstant()
                                    .isBefore(beforeDate.toInstant(java.time.ZoneOffset.UTC));
                            } catch (IOException e) {
                                return false;
                            }
                        })
                        .collect(Collectors.toList());
                    
                    for (Path path : toDelete) {
                        long size = Files.size(path);
                        Files.delete(path);
                        deletedCount++;
                        freedSpace += size;
                    }
                }
            }
            
            result.put("deletedCount", deletedCount);
            result.put("freedSpace", freedSpace);
            result.put("success", true);
            
        } catch (Exception e) {
            log.error("清理日志时发生错误", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    // 辅助方法
    private List<String> getLogFilesInTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        List<String> files = new ArrayList<>();
        files.add("hardware-compatibility.log");
        
        // 可以根据时间范围添加特定的历史日志文件
        return files;
    }
    
    private List<Map<String, Object>> parseLogFile(
        Path filePath,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String level,
        String component,
        String traceId,
        String userId,
        String keyword
    ) {
        List<Map<String, Object>> logs = new ArrayList<>();
        
        try (BufferedReader reader = Files.newBufferedReader(filePath)) {
            String line;
            while ((line = reader.readLine()) != null) {
                try {
                    Map<String, Object> logEntry = parseLogLine(line);
                    if (logEntry != null && matchesFilters(logEntry, startTime, endTime, level, component, traceId, userId, keyword)) {
                        logs.add(logEntry);
                    }
                } catch (Exception e) {
                    // 忽略无法解析的行
                }
            }
        } catch (IOException e) {
            log.warn("无法读取日志文件: {}", filePath, e);
        }
        
        return logs;
    }
    
    private Map<String, Object> parseLogLine(String line) {
        // 简化的日志解析
        Map<String, Object> entry = new HashMap<>();
        entry.put("timestamp", LocalDateTime.now());
        entry.put("level", "INFO");
        entry.put("message", line);
        entry.put("component", "UNKNOWN");
        return entry;
    }
    
    private boolean matchesFilters(
        Map<String, Object> logEntry,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String level,
        String component,
        String traceId,
        String userId,
        String keyword
    ) {
        try {
            LocalDateTime timestamp = (LocalDateTime) logEntry.get("timestamp");
            
            // 时间过滤
            if (startTime != null && timestamp.isBefore(startTime)) return false;
            if (endTime != null && timestamp.isAfter(endTime)) return false;
            
            // 级别过滤
            if (level != null && !level.equals(logEntry.get("level"))) return false;
            
            // 组件过滤
            if (component != null && !component.equals(logEntry.get("component"))) return false;
            
            // 追踪ID过滤
            if (traceId != null && !traceId.equals(logEntry.get("traceId"))) return false;
            
            // 用户ID过滤
            if (userId != null && !userId.equals(logEntry.get("userId"))) return false;
            
            // 关键词过滤
            if (keyword != null) {
                String message = (String) logEntry.getOrDefault("message", "");
                if (!message.toLowerCase().contains(keyword.toLowerCase())) return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    private String getGroupKey(LocalDateTime time, String interval) {
        switch (interval.toLowerCase()) {
            case "hour":
                return time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH"));
            case "day":
                return time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            case "week":
                return time.format(DateTimeFormatter.ofPattern("yyyy-'W'ww"));
            case "month":
                return time.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            default:
                return time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH"));
        }
    }
    
    private LocalDateTime getNextTimePoint(LocalDateTime current, String interval) {
        switch (interval.toLowerCase()) {
            case "hour":
                return current.plusHours(1);
            case "day":
                return current.plusDays(1);
            case "week":
                return current.plusWeeks(1);
            case "month":
                return current.plusMonths(1);
            default:
                return current.plusHours(1);
        }
    }
    
    private String extractUrlFromMessage(String message) {
        // 简化的URL提取
        if (message.contains("GET ")) {
            int start = message.indexOf("GET ") + 4;
            int end = message.indexOf(" ", start);
            if (end > start) {
                return message.substring(start, end);
            }
        }
        return "unknown";
    }
    
    private Double extractMetricValue(String message) {
        // 尝试从消息中提取数值
        try {
            String[] parts = message.split("=");
            if (parts.length >= 2) {
                String valueStr = parts[1].trim().split(" ")[0];
                return Double.parseDouble(valueStr);
            }
        } catch (Exception e) {
            // 忽略解析错误
        }
        return null;
    }
}