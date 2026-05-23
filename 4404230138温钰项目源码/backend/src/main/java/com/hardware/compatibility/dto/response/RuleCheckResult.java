package com.hardware.compatibility.dto.response;

import com.hardware.compatibility.entity.CompatibilityRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 规则检测结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleCheckResult {
    /**
     * 规则名称
     */
    private String ruleName;
    
    /**
     * 是否兼容
     */
    private Boolean compatible;
    
    /**
     * 检测原因/说明
     */
    private String reason;
    
    /**
     * 建议
     */
    private String recommendation;
    
    /**
     * 规则类型
     */
    private CompatibilityRule.RuleType ruleType;
    
    /**
     * 检测时间
     */
    private Long timestamp;

    // 手动添加getter和setter方法，因为Lombok可能没有正确工作
    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public Boolean isCompatible() {
        return compatible;
    }

    public void setCompatible(Boolean compatible) {
        this.compatible = compatible;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public CompatibilityRule.RuleType getRuleType() {
        return ruleType;
    }

    public void setRuleType(CompatibilityRule.RuleType ruleType) {
        this.ruleType = ruleType;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}