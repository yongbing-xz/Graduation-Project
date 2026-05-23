package com.hardware.compatibility.dto.response;

import com.hardware.compatibility.entity.HardwareComponent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

/**
 * 兼容性检测结果DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilityResult {
    /**
     * 总体兼容性
     */
    private Boolean overallCompatible;
    
    /**
     * 各规则检测结果
     */
    private List<RuleCheckResult> ruleResults;
    
    /**
     * 检测的组件列表
     */
    private List<HardwareComponent> checkedComponents;
    
    /**
     * 检测时间
     */
    private Date timestamp;
    
    /**
     * 检测耗时（毫秒）
     */
    private Long durationMs;
    
    /**
     * 检测ID（用于追踪）
     */
    private String checkId;

    // 手动添加getter和setter方法，因为Lombok可能没有正确工作
    public Boolean getOverallCompatible() {
        return overallCompatible;
    }

    public void setOverallCompatible(Boolean overallCompatible) {
        this.overallCompatible = overallCompatible;
    }

    public List<RuleCheckResult> getRuleResults() {
        return ruleResults;
    }

    public void setRuleResults(List<RuleCheckResult> ruleResults) {
        this.ruleResults = ruleResults;
    }

    public List<HardwareComponent> getCheckedComponents() {
        return checkedComponents;
    }

    public void setCheckedComponents(List<HardwareComponent> checkedComponents) {
        this.checkedComponents = checkedComponents;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getCheckId() {
        return checkId;
    }

    public void setCheckId(String checkId) {
        this.checkId = checkId;
    }
}