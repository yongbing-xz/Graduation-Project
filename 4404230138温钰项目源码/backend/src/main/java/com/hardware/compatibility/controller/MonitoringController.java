package com.hardware.compatibility.controller;

import com.hardware.compatibility.service.MonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 监控管理API控制器
 */
@RestController
@RequestMapping("/api/monitoring")
@Tag(name = "系统监控", description = "系统监控、错误上报和告警相关API")
@Slf4j
@RequiredArgsConstructor
public class MonitoringController {
    
    private final MonitoringService monitoringService;
    
    @PostMapping("/errors/report")
    @Operation(summary = "上报前端错误", description = "接收前端上报的错误信息")
    public ResponseEntity<Map<String, String>> reportError(@RequestBody @Valid Map<String, Object> errorReport) {
        try {
            String errorType = (String) errorReport.get("type");
            String message = (String) errorReport.get("message");
            String level = (String) errorReport.get("level");
            
            log.info("收到前端错误上报: {} - {}", errorType, message);
            
            // 记录错误到监控系统
            monitoringService.recordError(errorType, message, level, errorReport);
            
            Map<String, String> response = Map.of(
                "status", "success",
                "message", "错误上报成功",
                "timestamp", LocalDateTime.now().toString()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("处理错误上报时出现异常", e);
            Map<String, String> response = Map.of(
                "status", "error",
                "message", "错误上报失败: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "获取系统健康状态", description = "获取系统整体健康状态信息")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = monitoringService.getSystemHealth();
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/errors/statistics")
    @Operation(summary = "获取错误统计", description = "获取指定时间范围内的错误统计信息")
    public ResponseEntity<Map<String, Object>> getErrorStatistics(
            @Parameter(description = "开始时间") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        Map<String, Object> statistics = monitoringService.getErrorStatistics(startTime, endTime);
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/metrics/{metricName}")
    @Operation(summary = "获取指标数据", description = "获取指定指标的历史数据")
    public ResponseEntity<List<Map<String, Object>>> getMetrics(
            @Parameter(description = "指标名称") @PathVariable String metricName,
            @Parameter(description = "开始时间") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        List<Map<String, Object>> metrics = monitoringService.getMetrics(metricName, startTime, endTime);
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/resources")
    @Operation(summary = "检查系统资源", description = "获取当前系统资源使用情况")
    public ResponseEntity<Map<String, Object>> checkSystemResources() {
        Map<String, Object> resources = monitoringService.checkSystemResources();
        return ResponseEntity.ok(resources);
    }
    
    @GetMapping("/database/health")
    @Operation(summary = "检查数据库健康状态", description = "检查数据库连接状态")
    public ResponseEntity<Map<String, Object>> checkDatabaseHealth() {
        boolean isHealthy = monitoringService.checkDatabaseHealth();
        Map<String, Object> result = Map.of(
            "database", isHealthy ? "UP" : "DOWN",
            "timestamp", LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/cache/health")
    @Operation(summary = "检查缓存健康状态", description = "检查缓存系统状态")
    public ResponseEntity<Map<String, Object>> checkCacheHealth() {
        boolean isHealthy = monitoringService.checkCacheHealth();
        Map<String, Object> result = Map.of(
            "cache", isHealthy ? "UP" : "DOWN",
            "timestamp", LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/metrics")
    @Operation(summary = "记录指标", description = "记录自定义指标数据")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> recordMetric(
            @Parameter(description = "指标名称") @RequestParam String metricName,
            @Parameter(description = "指标值") @RequestParam double value,
            @RequestBody(required = false) Map<String, String> tags) {
        
        monitoringService.recordMetric(metricName, value, tags != null ? tags : Map.of());
        
        Map<String, String> response = Map.of(
            "status", "success",
            "message", "指标记录成功",
            "timestamp", LocalDateTime.now().toString()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/alerts/send")
    @Operation(summary = "发送告警", description = "手动发送告警通知")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> sendAlert(
            @Parameter(description = "告警级别") @RequestParam String alertLevel,
            @Parameter(description = "告警标题") @RequestParam String title,
            @Parameter(description = "告警消息") @RequestParam String message,
            @RequestBody(required = false) Map<String, Object> metadata) {
        
        monitoringService.sendAlert(alertLevel, title, message, metadata);
        
        Map<String, String> response = Map.of(
            "status", "success",
            "message", "告警发送成功",
            "timestamp", LocalDateTime.now().toString()
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/dashboard")
    @Operation(summary = "获取监控面板数据", description = "获取监控面板所需的综合数据")
    public ResponseEntity<Map<String, Object>> getMonitoringDashboard() {
        Map<String, Object> dashboard = new java.util.HashMap<>();
        
        // 系统健康状态
        dashboard.put("health", monitoringService.getSystemHealth());
        
        // 系统资源
        dashboard.put("resources", monitoringService.checkSystemResources());
        
        // 最近24小时的错误统计
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        dashboard.put("errorStatistics", monitoringService.getErrorStatistics(yesterday, now));
        
        // 数据库状态
        dashboard.put("database", Map.of(
            "status", monitoringService.checkDatabaseHealth() ? "UP" : "DOWN",
            "timestamp", LocalDateTime.now().toString()
        ));
        
        // 缓存状态
        dashboard.put("cache", Map.of(
            "status", monitoringService.checkCacheHealth() ? "UP" : "DOWN",
            "timestamp", LocalDateTime.now().toString()
        ));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @PostMapping("/test/error")
    @Operation(summary = "测试错误上报", description = "测试错误上报功能，用于开发调试")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> testErrorReporting(
            @Parameter(description = "错误类型") @RequestParam(defaultValue = "TEST") String errorType,
            @Parameter(description = "错误级别") @RequestParam(defaultValue = "MEDIUM") String level) {
        
        // 创建测试错误
        Map<String, Object> testError = new java.util.HashMap<>();
        testError.put("type", errorType);
        testError.put("message", "这是一个测试错误消息");
        testError.put("level", level);
        testError.put("url", "http://localhost:8080/api/monitoring/test/error");
        testError.put("timestamp", LocalDateTime.now().toString());
        testError.put("userAgent", "Test-Agent");
        
        monitoringService.recordError(errorType, "这是一个测试错误消息", level, testError);
        
        Map<String, String> response = Map.of(
            "status", "success",
            "message", "测试错误已记录",
            "timestamp", LocalDateTime.now().toString()
        );
        
        return ResponseEntity.ok(response);
    }
}