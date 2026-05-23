package com.hardware.compatibility.controller;

import com.hardware.compatibility.service.LogAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 日志分析API控制器
 */
@RestController
@RequestMapping("/api/logs")
@Tag(name = "日志分析", description = "日志查询、统计和分析相关API")
@Slf4j
@RequiredArgsConstructor
public class LogAnalysisController {
    
    private final LogAnalysisService logAnalysisService;
    
    @GetMapping("/query")
    @Operation(summary = "查询日志", description = "根据条件查询系统日志")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, Object>> queryLogs(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "日志级别") @RequestParam(required = false) String level,
            @Parameter(description = "组件") @RequestParam(required = false) String component,
            @Parameter(description = "追踪ID") @RequestParam(required = false) String traceId,
            @Parameter(description = "用户ID") @RequestParam(required = false) String userId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "100") int limit,
            @Parameter(description = "偏移量") @RequestParam(defaultValue = "0") int offset) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<Map<String, Object>> logs = logAnalysisService.queryLogs(
            startTime, endTime, level, component, traceId, userId, keyword, limit, offset
        );
        
        Map<String, Object> response = Map.of(
            "logs", logs,
            "startTime", startTime,
            "endTime", endTime,
            "total", logs.size(),
            "limit", limit,
            "offset", offset
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "获取日志统计", description = "获取指定时间范围内的日志统计信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, Object>> getLogStatistics(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(7);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        Map<String, Object> statistics = logAnalysisService.getLogStatistics(startTime, endTime);
        
        Map<String, Object> response = Map.of(
            "statistics", statistics,
            "startTime", startTime,
            "endTime", endTime
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/error-trend")
    @Operation(summary = "获取错误趋势", description = "获取错误发生的时间趋势")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<List<Map<String, Object>>> getErrorTrend(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "时间间隔") @RequestParam(defaultValue = "hour") String interval) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<Map<String, Object>> trend = logAnalysisService.getErrorTrend(startTime, endTime, interval);
        return ResponseEntity.ok(trend);
    }
    
    @GetMapping("/top-errors")
    @Operation(summary = "获取热门错误", description = "获取发生频率最高的错误")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<List<Map<String, Object>>> getTopErrors(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "20") int limit) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(7);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<Map<String, Object>> topErrors = logAnalysisService.getTopErrors(startTime, endTime, limit);
        return ResponseEntity.ok(topErrors);
    }
    
    @GetMapping("/user-actions")
    @Operation(summary = "获取用户操作统计", description = "获取用户操作行为统计")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<List<Map<String, Object>>> getUserActionStatistics(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "50") int limit) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(7);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<Map<String, Object>> statistics = logAnalysisService.getUserActionStatistics(startTime, endTime, limit);
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/api-calls")
    @Operation(summary = "获取API调用统计", description = "获取API接口调用统计")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, Object>> getApiCallStatistics(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        Map<String, Object> statistics = logAnalysisService.getApiCallStatistics(startTime, endTime);
        
        Map<String, Object> response = Map.of(
            "statistics", statistics,
            "startTime", startTime,
            "endTime", endTime
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/performance")
    @Operation(summary = "获取性能指标", description = "获取系统性能指标统计")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "指标名称") @RequestParam(required = false) String metricName) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        Map<String, Object> metrics = logAnalysisService.getPerformanceMetrics(startTime, endTime, metricName);
        
        Map<String, Object> response = Map.of(
            "metrics", metrics,
            "startTime", startTime,
            "endTime", endTime,
            "metricName", metricName
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/trace/{traceId}")
    @Operation(summary = "获取调用链", description = "根据追踪ID获取完整的调用链日志")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<List<Map<String, Object>>> getTraceLog(
            @Parameter(description = "追踪ID") @PathVariable String traceId) {
        
        List<Map<String, Object>> traceLog = logAnalysisService.getTraceLog(traceId);
        return ResponseEntity.ok(traceLog);
    }
    
    @PostMapping("/search")
    @Operation(summary = "搜索日志", description = "使用全文搜索功能搜索日志内容")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<List<Map<String, Object>>> searchLogs(
            @Parameter(description = "查询条件") @RequestBody Map<String, String> searchRequest,
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "限制数量") @RequestParam(defaultValue = "100") int limit) {
        
        String query = searchRequest.get("query");
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        List<Map<String, Object>> results = logAnalysisService.searchLogs(query, startTime, endTime, limit);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/files")
    @Operation(summary = "获取日志文件列表", description = "获取可下载的日志文件列表")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getLogFiles() {
        List<Map<String, Object>> logFiles = logAnalysisService.getLogFiles();
        return ResponseEntity.ok(logFiles);
    }
    
    @GetMapping("/download/{filename:.+}")
    @Operation(summary = "下载日志文件", description = "下载指定的日志文件")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadLogFile(
            @Parameter(description = "文件名") @PathVariable String filename) {
        
        byte[] fileContent = logAnalysisService.downloadLogFile(filename);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(fileContent);
    }
    
    @GetMapping("/stream")
    @Operation(summary = "获取实时日志流", description = "获取系统实时日志流")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<java.io.InputStream> getLogStream(
            @Parameter(description = "日志级别过滤") @RequestParam(required = false) String level,
            @Parameter(description = "组件过滤") @RequestParam(required = false) String component) {
        
        java.io.InputStream logStream = logAnalysisService.getLogStream(level, component);
        
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_PLAIN)
            .body(logStream);
    }
    
    @PostMapping("/cleanup")
    @Operation(summary = "清理历史日志", description = "清理指定日期之前的历史日志")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> cleanupLogs(
            @Parameter(description = "清理日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime beforeDate) {
        
        Map<String, Object> result = logAnalysisService.cleanupLogs(beforeDate);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/dashboard")
    @Operation(summary = "获取日志分析面板", description = "获取日志分析面板的综合数据")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, Object>> getLogDashboard(
            @Parameter(description = "开始时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "结束时间") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        // 设置默认时间范围
        if (startTime == null) {
            startTime = LocalDateTime.now().minusDays(1);
        }
        if (endTime == null) {
            endTime = LocalDateTime.now();
        }
        
        Map<String, Object> dashboard = new java.util.HashMap<>();
        
        // 基础统计
        dashboard.put("statistics", logAnalysisService.getLogStatistics(startTime, endTime));
        
        // 错误趋势
        dashboard.put("errorTrend", logAnalysisService.getErrorTrend(startTime, endTime, "hour"));
        
        // 热门错误
        dashboard.put("topErrors", logAnalysisService.getTopErrors(startTime, endTime, 10));
        
        // API调用统计
        dashboard.put("apiCallStatistics", logAnalysisService.getApiCallStatistics(startTime, endTime));
        
        // 性能指标
        dashboard.put("performanceMetrics", logAnalysisService.getPerformanceMetrics(startTime, endTime, null));
        
        // 时间范围
        dashboard.put("startTime", startTime);
        dashboard.put("endTime", endTime);
        
        return ResponseEntity.ok(dashboard);
    }
}