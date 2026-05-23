package com.hardware.compatibility.utils;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

/**
 * 结构化日志工具类
 * 提供统一的日志记录接口，支持MDC上下文和结构化输出
 */
@Slf4j
public class StructuredLogger {
    
    private static final String TRACE_ID = "traceId";
    private static final String USER_ID = "userId";
    private static final String SESSION_ID = "sessionId";
    private static final String REQUEST_ID = "requestId";
    private static final String OPERATION = "operation";
    private static final String COMPONENT = "component";
    
    /**
     * 开始日志上下文
     */
    public static class LogContext implements AutoCloseable {
        private final String previousTraceId;
        private final String previousUserId;
        private final String previousSessionId;
        private final String previousRequestId;
        private final String previousOperation;
        private final String previousComponent;
        
        public LogContext() {
            // 保存之前的上下文
            this.previousTraceId = MDC.get(TRACE_ID);
            this.previousUserId = MDC.get(USER_ID);
            this.previousSessionId = MDC.get(SESSION_ID);
            this.previousRequestId = MDC.get(REQUEST_ID);
            this.previousOperation = MDC.get(OPERATION);
            this.previousComponent = MDC.get(COMPONENT);
            
            // 设置新的上下文
            MDC.put(TRACE_ID, UUID.randomUUID().toString().replace("-", ""));
            MDC.put(REQUEST_ID, UUID.randomUUID().toString().replace("-", ""));
        }
        
        public LogContext withUserId(String userId) {
            MDC.put(USER_ID, userId);
            return this;
        }
        
        public LogContext withSessionId(String sessionId) {
            MDC.put(SESSION_ID, sessionId);
            return this;
        }
        
        public LogContext withOperation(String operation) {
            MDC.put(OPERATION, operation);
            return this;
        }
        
        public LogContext withComponent(String component) {
            MDC.put(COMPONENT, component);
            return this;
        }
        
        public LogContext withCustom(String key, String value) {
            MDC.put(key, value);
            return this;
        }
        
        @Override
        public void close() {
            // 恢复之前的上下文
            if (previousTraceId != null) {
                MDC.put(TRACE_ID, previousTraceId);
            } else {
                MDC.remove(TRACE_ID);
            }
            
            if (previousUserId != null) {
                MDC.put(USER_ID, previousUserId);
            } else {
                MDC.remove(USER_ID);
            }
            
            if (previousSessionId != null) {
                MDC.put(SESSION_ID, previousSessionId);
            } else {
                MDC.remove(SESSION_ID);
            }
            
            if (previousRequestId != null) {
                MDC.put(REQUEST_ID, previousRequestId);
            } else {
                MDC.remove(REQUEST_ID);
            }
            
            if (previousOperation != null) {
                MDC.put(OPERATION, previousOperation);
            } else {
                MDC.remove(OPERATION);
            }
            
            if (previousComponent != null) {
                MDC.put(COMPONENT, previousComponent);
            } else {
                MDC.remove(COMPONENT);
            }
        }
    }
    
    /**
     * 创建日志上下文
     */
    public static LogContext startContext() {
        return new LogContext();
    }
    
    /**
     * 记录业务操作开始
     */
    public static void logOperationStart(String operation, Map<String, Object> params) {
        log.info("操作开始: {} | 参数: {}", operation, params);
    }
    
    /**
     * 记录业务操作成功
     */
    public static void logOperationSuccess(String operation, long durationMs, Object result) {
        log.info("操作成功: {} | 耗时: {}ms | 结果: {}", operation, durationMs, result);
    }
    
    /**
     * 记录业务操作失败
     */
    public static void logOperationFailure(String operation, long durationMs, Exception error) {
        log.error("操作失败: {} | 耗时: {}ms | 错误: {}", operation, durationMs, error.getMessage(), error);
    }
    
    /**
     * 记录用户行为
     */
    public static void logUserAction(String userId, String action, Map<String, Object> details) {
        try (LogContext context = startContext().withUserId(userId)) {
            log.info("用户行为: {} | 详情: {}", action, details);
        }
    }
    
    /**
     * 记录API调用
     */
    public static void logApiCall(String method, String path, String userId, long durationMs, int statusCode) {
        try (LogContext context = startContext().withUserId(userId).withOperation("API_CALL")) {
            log.info("API调用: {} {} | 状态码: {} | 耗时: {}ms", method, path, statusCode, durationMs);
        }
    }
    
    /**
     * 记录数据库操作
     */
    public static void logDatabaseOperation(String operation, String table, long durationMs, int affectedRows) {
        try (LogContext context = startContext().withOperation("DB_" + operation).withComponent("DATABASE")) {
            log.info("数据库操作: {} | 表: {} | 耗时: {}ms | 影响行数: {}", operation, table, durationMs, affectedRows);
        }
    }
    
    /**
     * 记录安全事件
     */
    public static void logSecurityEvent(String eventType, String userId, String details) {
        try (LogContext context = startContext().withUserId(userId).withOperation("SECURITY_EVENT")) {
            log.warn("安全事件: {} | 用户: {} | 详情: {}", eventType, userId, details);
        }
    }
    
    /**
     * 记录性能指标
     */
    public static void logPerformanceMetric(String metricName, double value, Map<String, String> tags) {
        try (LogContext context = startContext().withOperation("PERFORMANCE_METRIC")) {
            log.info("性能指标: {} = {} | 标签: {}", metricName, value, tags);
        }
    }
    
    /**
     * 记录业务指标
     */
    public static void logBusinessMetric(String metricName, double value, Map<String, String> tags) {
        try (LogContext context = startContext().withOperation("BUSINESS_METRIC")) {
            log.info("业务指标: {} = {} | 标签: {}", metricName, value, tags);
        }
    }
    
    /**
     * 记录系统事件
     */
    public static void logSystemEvent(String eventType, String component, Map<String, Object> details) {
        try (LogContext context = startContext().withComponent(component)) {
            log.info("系统事件: {} | 组件: {} | 详情: {}", eventType, component, details);
        }
    }
    
    /**
     * 记录调试信息
     */
    public static void logDebug(String message, Object... params) {
        log.debug(message, params);
    }
    
    /**
     * 记录信息
     */
    public static void logInfo(String message, Object... params) {
        log.info(message, params);
    }
    
    /**
     * 记录警告
     */
    public static void logWarn(String message, Object... params) {
        log.warn(message, params);
    }
    
    /**
     * 记录错误
     */
    public static void logError(String message, Throwable throwable) {
        log.error(message, throwable);
    }
    
    /**
     * 记录错误（无异常对象）
     */
    public static void logError(String message, Object... params) {
        log.error(message, params);
    }
    
    /**
     * 创建性能监控的装饰器
     */
    public static <T> T withPerformanceLogging(String operation, T target, Class<T> targetClass) {
        return java.lang.reflect.Proxy.newProxyInstance(
            targetClass.getClassLoader(),
            new Class<?>[]{targetClass},
            (proxy, method, args) -> {
                long startTime = System.currentTimeMillis();
                String methodName = operation + "." + method.getName();
                
                try {
                    logOperationStart(methodName, Map.of("args", args));
                    
                    Object result = method.invoke(target, args);
                    
                    long duration = System.currentTimeMillis() - startTime;
                    logOperationSuccess(methodName, duration, result);
                    
                    return result;
                } catch (Exception e) {
                    long duration = System.currentTimeMillis() - startTime;
                    logOperationFailure(methodName, duration, e);
                    throw e;
                }
            }
        );
    }
    
    /**
     * 执行带性能监控的操作
     */
    public static <T> T executeWithLogging(String operation, java.util.function.Supplier<T> supplier) {
        long startTime = System.currentTimeMillis();
        
        try {
            logOperationStart(operation, Map.of());
            
            T result = supplier.get();
            
            long duration = System.currentTimeMillis() - startTime;
            logOperationSuccess(operation, duration, result);
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            logOperationFailure(operation, duration, e);
            throw e;
        }
    }
    
    /**
     * 执行带性能监控的无返回值操作
     */
    public static void executeWithLogging(String operation, java.util.function.Runnable runnable) {
        long startTime = System.currentTimeMillis();
        
        try {
            logOperationStart(operation, Map.of());
            
            runnable.run();
            
            long duration = System.currentTimeMillis() - startTime;
            logOperationSuccess(operation, duration, "SUCCESS");
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            logOperationFailure(operation, duration, e);
            throw e;
        }
    }
}