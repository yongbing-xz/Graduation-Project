package com.hardware.compatibility.service.impl;

import com.hardware.compatibility.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * 监控服务实现类
 * 提供系统监控、告警和性能统计功能
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MonitoringServiceImpl implements MonitoringService, HealthIndicator {
    
    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;
    
    // 内存存储最近的数据
    private final Map<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private final Map<String, Double> gauges = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> errorHistory = new ArrayList<>();
    private final List<Map<String, Object>> alertHistory = new ArrayList<>();
    
    // 配置参数
    private static final int MAX_HISTORY_SIZE = 1000;
    private static final double CPU_ALERT_THRESHOLD = 80.0;
    private static final double MEMORY_ALERT_THRESHOLD = 85.0;
    private static final double DISK_ALERT_THRESHOLD = 90.0;
    
    @Override
    public void recordMetric(String metricName, double value, Map<String, String> tags) {
        log.debug("记录指标: {} = {} {}", metricName, value, tags);
        
        // 存储最新值
        gauges.put(metricName, value);
        
        // 如果是计数器类型，累加
        if (counters.containsKey(metricName)) {
            counters.get(metricName).addAndGet((long) value);
        } else {
            counters.put(metricName, new AtomicLong((long) value));
        }
        
        // 检查告警阈值
        checkMetricAlerts(metricName, value, tags);
    }
    
    @Override
    public void recordError(String errorType, String errorMessage, String severity, Map<String, Object> context) {
        log.warn("记录错误: [{}] {} - {}", errorType, severity, errorMessage);
        
        Map<String, Object> errorRecord = new HashMap<>();
        errorRecord.put("timestamp", LocalDateTime.now());
        errorRecord.put("errorType", errorType);
        errorRecord.put("message", errorMessage);
        errorRecord.put("severity", severity);
        errorRecord.put("context", context != null ? context : new HashMap<>());
        
        // 添加到错误历史
        synchronized (errorHistory) {
            errorHistory.add(errorRecord);
            if (errorHistory.size() > MAX_HISTORY_SIZE) {
                errorHistory.remove(0);
            }
        }
        
        // 如果是严重错误，立即发送告警
        if ("HIGH".equalsIgnoreCase(severity) || "CRITICAL".equalsIgnoreCase(severity)) {
            sendAlert("HIGH", "严重错误", errorMessage, errorRecord);
        }
        
        // 增加错误计数
        recordMetric("error_count", 1, Map.of("type", errorType, "severity", severity));
    }
    
    @Override
    @Async
    public void sendAlert(String alertLevel, String title, String message, Map<String, Object> metadata) {
        log.warn("发送告警: [{}] {} - {}", alertLevel, title, message);
        
        Map<String, Object> alertRecord = new HashMap<>();
        alertRecord.put("timestamp", LocalDateTime.now());
        alertRecord.put("level", alertLevel);
        alertRecord.put("title", title);
        alertRecord.put("message", message);
        alertRecord.put("metadata", metadata != null ? metadata : new HashMap<>());
        
        // 添加到告警历史
        synchronized (alertHistory) {
            alertHistory.add(alertRecord);
            if (alertHistory.size() > MAX_HISTORY_SIZE) {
                alertHistory.remove(0);
            }
        }
        
        // 记录告警指标
        recordMetric("alert_count", 1, Map.of("level", alertLevel));
        
        // 这里可以扩展为发送邮件、短信、钉钉等通知
        // sendNotification(alertLevel, title, message, metadata);
    }
    
    @Override
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("timestamp", LocalDateTime.now());
        health.put("status", getHealth().getStatus().getCode());
        health.put("database", checkDatabaseHealth() ? "UP" : "DOWN");
        health.put("cache", checkCacheHealth() ? "UP" : "DOWN");
        
        // 添加系统资源信息
        Map<String, Object> resources = checkSystemResources();
        health.put("resources", resources);
        
        // 添加最近的错误统计
        health.put("recentErrors", getRecentErrorCount(1)); // 最近1小时的错误数
        
        return health;
    }
    
    @Override
    public Map<String, Object> getErrorStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> statistics = new HashMap<>();
        
        synchronized (errorHistory) {
            List<Map<String, Object>> filteredErrors = errorHistory.stream()
                .filter(error -> {
                    LocalDateTime errorTime = (LocalDateTime) error.get("timestamp");
                    return !errorTime.isBefore(startTime) && !errorTime.isAfter(endTime);
                })
                .toList();
            
            // 总错误数
            statistics.put("totalCount", filteredErrors.size());
            
            // 按严重程度统计
            Map<String, Long> severityCount = filteredErrors.stream()
                .collect(Collectors.groupingBy(
                    error -> (String) error.get("severity"),
                    Collectors.counting()
                ));
            statistics.put("severityCount", severityCount);
            
            // 按错误类型统计
            Map<String, Long> typeCount = filteredErrors.stream()
                .collect(Collectors.groupingBy(
                    error -> (String) error.get("errorType"),
                    Collectors.counting()
                ));
            statistics.put("typeCount", typeCount);
            
            // 错误趋势（按小时统计）
            Map<String, Long> hourlyTrend = filteredErrors.stream()
                .collect(Collectors.groupingBy(
                    error -> ((LocalDateTime) error.get("timestamp")).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH")),
                    Collectors.counting()
                ));
            statistics.put("hourlyTrend", hourlyTrend);
        }
        
        return statistics;
    }
    
    @Override
    public List<Map<String, Object>> getMetrics(String metricName, LocalDateTime startTime, LocalDateTime endTime) {
        // 这里简化实现，实际项目中应该使用时序数据库
        List<Map<String, Object>> metrics = new ArrayList<>();
        
        // 返回模拟的指标数据
        for (int i = 0; i < 24; i++) {
            Map<String, Object> metric = new HashMap<>();
            metric.put("metric", metricName);
            metric.put("timestamp", startTime.plusHours(i));
            metric.put("value", Math.random() * 100); // 模拟数据
            metrics.add(metric);
        }
        
        return metrics;
    }
    
    @Override
    public Map<String, Object> checkSystemResources() {
        Map<String, Object> resources = new HashMap<>();
        
        try {
            // CPU使用率
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            double cpuUsage = osBean.getProcessCpuLoad() * 100;
            if (cpuUsage < 0) cpuUsage = 0; // 有时返回-1表示不可用
            resources.put("cpuUsage", Math.round(cpuUsage * 100.0) / 100.0);
            
            // 内存使用情况
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long totalMemory = memoryBean.getHeapMemoryUsage().getMax();
            long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
            double memoryUsage = (double) usedMemory / totalMemory * 100;
            resources.put("memoryUsage", Math.round(memoryUsage * 100.0) / 100.0);
            resources.put("totalMemory", totalMemory / 1024 / 1024); // MB
            resources.put("usedMemory", usedMemory / 1024 / 1024); // MB
            
            // 磁盘使用情况（简化检查）
            File disk = new File(".");
            long totalSpace = disk.getTotalSpace();
            long freeSpace = disk.getFreeSpace();
            double diskUsage = (double) (totalSpace - freeSpace) / totalSpace * 100;
            resources.put("diskUsage", Math.round(diskUsage * 100.0) / 100.0);
            resources.put("totalDisk", totalSpace / 1024 / 1024 / 1024); // GB
            resources.put("freeDisk", freeSpace / 1024 / 1024 / 1024); // GB
            
            // 线程数
            resources.put("threadCount", ManagementFactory.getThreadMXBean().getThreadCount());
            
            // 系统负载
            resources.put("systemLoadAverage", osBean.getSystemLoadAverage());
            
            // 检查告警阈值
            checkResourceAlerts(resources);
            
        } catch (Exception e) {
            log.error("获取系统资源信息失败", e);
            resources.put("error", e.getMessage());
        }
        
        return resources;
    }
    
    @Override
    public boolean checkDatabaseHealth() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return true;
        } catch (Exception e) {
            log.error("数据库健康检查失败", e);
            return false;
        }
    }
    
    @Override
    public boolean checkCacheHealth() {
        // 简单的缓存检查，实际项目中根据使用的缓存类型实现
        return true;
    }
    
    @Override
    public Health health() {
        try {
            Map<String, Object> health = getSystemHealth();
            String status = (String) health.get("status");
            
            boolean isHealthy = "UP".equals(status) &&
                              checkDatabaseHealth() &&
                              checkCacheHealth();
            
            Health.Builder builder = isHealthy ? Health.up() : Health.down();
            builder.withDetails(health);
            
            return builder.build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
    
    /**
     * 检查指标告警
     */
    private void checkMetricAlerts(String metricName, double value, Map<String, String> tags) {
        // 可以根据不同的指标设置不同的告警阈值
        if (metricName.contains("error_rate") && value > 5.0) {
            sendAlert("MEDIUM", "错误率过高", 
                     String.format("指标 %s 的值为 %.2f，超过阈值 5.0", metricName, value), 
                     Map.of("metric", metricName, "value", value, "threshold", 5.0, "tags", tags));
        }
    }
    
    /**
     * 检查资源告警
     */
    private void checkResourceAlerts(Map<String, Object> resources) {
        // CPU告警
        if (resources.containsKey("cpuUsage")) {
            double cpuUsage = (Double) resources.get("cpuUsage");
            if (cpuUsage > CPU_ALERT_THRESHOLD) {
                sendAlert("HIGH", "CPU使用率过高", 
                         String.format("CPU使用率 %.2f%% 超过阈值 %.2f%%", cpuUsage, CPU_ALERT_THRESHOLD), 
                         resources);
            }
        }
        
        // 内存告警
        if (resources.containsKey("memoryUsage")) {
            double memoryUsage = (Double) resources.get("memoryUsage");
            if (memoryUsage > MEMORY_ALERT_THRESHOLD) {
                sendAlert("HIGH", "内存使用率过高", 
                         String.format("内存使用率 %.2f%% 超过阈值 %.2f%%", memoryUsage, MEMORY_ALERT_THRESHOLD), 
                         resources);
            }
        }
        
        // 磁盘告警
        if (resources.containsKey("diskUsage")) {
            double diskUsage = (Double) resources.get("diskUsage");
            if (diskUsage > DISK_ALERT_THRESHOLD) {
                sendAlert("CRITICAL", "磁盘使用率过高", 
                         String.format("磁盘使用率 %.2f%% 超过阈值 %.2f%%", diskUsage, DISK_ALERT_THRESHOLD), 
                         resources);
            }
        }
    }
    
    /**
     * 获取最近N小时的错误数量
     */
    private long getRecentErrorCount(int hours) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(hours);
        
        synchronized (errorHistory) {
            return errorHistory.stream()
                .filter(error -> {
                    LocalDateTime errorTime = (LocalDateTime) error.get("timestamp");
                    return !errorTime.isBefore(cutoff);
                })
                .count();
        }
    }
}