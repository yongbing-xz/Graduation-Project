package com.hardware.compatibility.controller;

import com.hardware.compatibility.dto.response.CompatibilityResult;
import com.hardware.compatibility.entity.CompatibilityRule;
import com.hardware.compatibility.entity.HardwareComponent;
import com.hardware.compatibility.service.CompatibilityService;
import com.hardware.compatibility.utils.TimeoutUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeoutException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 兼容性检测API控制器
 */
@RestController
@RequestMapping("/api/compatibility")
@Tag(name = "兼容性检测", description = "硬件兼容性检测相关API")
@Slf4j
@RequiredArgsConstructor
public class CompatibilityController {
    
    private final CompatibilityService compatibilityService;
    
    @PostMapping("/check")
    @Operation(summary = "检测硬件兼容性", description = "根据选择的硬件组件检测兼容性")
    public ResponseEntity<CompatibilityResult> checkCompatibility(
            @Parameter(description = "硬件组件映射，key为组件分类，value为组件ID")
            @RequestBody Map<String, Long> componentIds) {
        
        System.out.println("开始兼容性检测，组件数量: " + componentIds.size());
        
        try {
            // 创建一个Callable来执行兼容性检测任务
            Callable<CompatibilityResult> compatibilityTask = () -> {
                // 转换组件ID映射为组件分类映射
                Map<HardwareComponent.ComponentCategory, HardwareComponent> components = 
                        convertComponentIds(componentIds);
                
                CompatibilityResult result = compatibilityService.checkCompatibility(components);
                
                System.out.println("兼容性检测完成，总体兼容性: " + result.getOverallCompatible());
                
                return result;
            };
            
            // 执行任务，超时时间为6秒
            CompatibilityResult result = TimeoutUtils.executeWithTimeout(compatibilityTask);
            
            return ResponseEntity.ok(result);
            
        } catch (TimeoutException e) {
            System.err.println("兼容性检测超时: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        } catch (Exception e) {
            System.err.println("兼容性检测失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/rules")
    @Operation(summary = "获取所有兼容性规则", description = "获取系统中定义的所有兼容性检测规则")
    public ResponseEntity<List<CompatibilityRule>> getAllRules() {
        System.out.println("获取所有兼容性规则");
        
        List<CompatibilityRule> rules = compatibilityService.getAllRules();
        
        System.out.println("获取到兼容性规则数量: " + rules.size());
        
        return ResponseEntity.ok(rules);
    }
    
    @GetMapping("/rules/{ruleName}")
    @Operation(summary = "根据名称获取规则", description = "根据规则名称获取特定的兼容性规则")
    public ResponseEntity<CompatibilityRule> getRuleByName(
            @Parameter(description = "规则名称")
            @PathVariable String ruleName) {
        
        System.out.println("根据名称获取规则: " + ruleName);
        
        CompatibilityRule rule = compatibilityService.getRuleByName(ruleName);
        
        return ResponseEntity.ok(rule);
    }
    
    @PostMapping("/rules")
    @Operation(summary = "创建兼容性规则", description = "创建新的兼容性检测规则")
    public ResponseEntity<CompatibilityRule> createRule(
            @Parameter(description = "兼容性规则信息")
            @RequestBody CompatibilityRule rule) {
        
        System.out.println("创建兼容性规则: " + rule.getRuleName());
        
        CompatibilityRule savedRule = compatibilityService.saveRule(rule);
        
        System.out.println("兼容性规则创建成功: " + savedRule.getId());
        
        return ResponseEntity.ok(savedRule);
    }
    
    @PutMapping("/rules/{id}")
    @Operation(summary = "更新兼容性规则", description = "更新现有的兼容性检测规则")
    public ResponseEntity<CompatibilityRule> updateRule(
            @Parameter(description = "规则ID")
            @PathVariable Long id,
            @Parameter(description = "更新后的规则信息")
            @RequestBody CompatibilityRule rule) {
        
        System.out.println("更新兼容性规则: " + id);
        
        // 确保ID一致
        rule.setId(id);
        CompatibilityRule updatedRule = compatibilityService.saveRule(rule);
        
        System.out.println("兼容性规则更新成功: " + id);
        
        return ResponseEntity.ok(updatedRule);
    }
    
    @DeleteMapping("/rules/{id}")
    @Operation(summary = "删除兼容性规则", description = "删除指定的兼容性检测规则")
    public ResponseEntity<Void> deleteRule(
            @Parameter(description = "规则ID")
            @PathVariable Long id) {
        
        System.out.println("删除兼容性规则: " + id);
        
        compatibilityService.deleteRule(id);
        
        System.out.println("兼容性规则删除成功: " + id);
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/health")
    @Operation(summary = "健康检查", description = "检查兼容性检测服务是否正常运行")
    public ResponseEntity<Map<String, String>> healthCheck() {
        System.out.println("兼容性检测服务健康检查");
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "compatibility-service");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 转换组件ID映射为组件分类映射
     */
    private Map<HardwareComponent.ComponentCategory, HardwareComponent> convertComponentIds(
            Map<String, Long> componentIds) {
        
        Map<HardwareComponent.ComponentCategory, HardwareComponent> components = new HashMap<>();
        
        // 这里需要实现从ID获取组件的逻辑
        // 由于这是一个示例，我们暂时返回空映射
        // 实际实现需要调用HardwareComponentService来获取组件信息
        
        return components;
    }
}