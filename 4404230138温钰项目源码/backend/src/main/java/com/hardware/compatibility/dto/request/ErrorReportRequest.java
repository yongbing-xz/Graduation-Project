package com.hardware.compatibility.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

/**
 * 错误上报请求DTO
 */
@Data
@Schema(description = "错误上报请求")
public class ErrorReportRequest {
    
    @NotBlank(message = "错误类型不能为空")
    @Schema(description = "错误类型", example = "javascript", allowableValues = {"javascript", "network", "http", "vue", "promise", "business"})
    private String type;
    
    @NotBlank(message = "错误消息不能为空")
    @Schema(description = "错误消息", example = "Uncaught TypeError: Cannot read property of undefined")
    private String message;
    
    @NotBlank(message = "错误级别不能为空")
    @Schema(description = "错误级别", example = "high", allowableValues = {"low", "medium", "high", "critical"})
    private String level;
    
    @Schema(description = "错误堆栈信息", example = "TypeError: Cannot read property 'test' of undefined\\n    at main (index.js:15:10)")
    private String stack;
    
    @Schema(description = "发生错误的文件名", example = "http://localhost:5173/src/components/UserList.vue")
    private String filename;
    
    @Schema(description = "错误发生的行号", example = "123")
    private Integer lineno;
    
    @Schema(description = "错误发生的列号", example = "45")
    private Integer colno;
    
    @Schema(description = "当前页面URL", example = "http://localhost:5173/dashboard")
    private String url;
    
    @Schema(description = "用户代理字符串", example = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    private String userAgent;
    
    @Schema(description = "用户ID")
    private String userId;
    
    @Schema(description = "会话ID")
    private String sessionId;
    
    @Schema(description = "组件名称（Vue错误）", example = "UserList")
    private String componentName;
    
    @Schema(description = "组件信息（Vue错误）", example = "render function")
    private String componentInfo;
    
    @Schema(description = "HTTP状态码（HTTP错误）", example = "500")
    private Integer status;
    
    @Schema(description = "HTTP状态文本", example = "Internal Server Error")
    private String statusText;
    
    @Schema(description = "请求URL（HTTP错误）", example = "/api/users")
    private String requestUrl;
    
    @Schema(description = "请求方法（HTTP错误）", example = "GET")
    private String requestMethod;
    
    @Schema(description = "请求头")
    private Map<String, Object> requestHeaders;
    
    @Schema(description = "请求体")
    private Object requestBody;
    
    @Schema(description = "响应体")
    private Object responseBody;
    
    @Schema(description = "Promise拒绝原因", example = "Network timeout")
    private String reason;
    
    @Schema(description = "时间戳", example = "2024-01-15T10:30:00.000Z")
    private String timestamp;
    
    @Schema(description = "额外的上下文信息")
    private Map<String, Object> context;
    
    @Schema(description = "自定义标签")
    private Map<String, String> tags;
}