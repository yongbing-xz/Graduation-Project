package com.hardware.compatibility.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 兼容性规则实体类
 * 对应数据库中的compatibility_rules表
 */
@Entity
@Table(name = "compatibility_rules", uniqueConstraints = {
    @UniqueConstraint(columnNames = "rule_name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilityRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "规则名称不能为空")
    @Column(name = "rule_name", nullable = false, unique = true)
    private String ruleName;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "规则类型不能为空")
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Type(com.vladmihalcea.hibernate.type.json.JsonType.class)
    @Column(name = "rule_condition", columnDefinition = "json", nullable = false)
    private JsonNode ruleCondition;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;
    
    public enum RuleType {
        CRITICAL,   // 关键规则 - 必须满足
        WARNING,    // 警告规则 - 建议满足
        RECOMMENDATION // 建议规则 - 优化建议
    }
    
    public CompatibilityRule(String ruleName, RuleType ruleType, String description) {
        this.ruleName = ruleName;
        this.ruleType = ruleType;
        this.description = description;
    }

    // 手动添加getter和setter方法，因为Lombok可能没有正确工作
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public RuleType getRuleType() {
        return ruleType;
    }

    public void setRuleType(RuleType ruleType) {
        this.ruleType = ruleType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public JsonNode getRuleCondition() {
        return ruleCondition;
    }

    public void setRuleCondition(JsonNode ruleCondition) {
        this.ruleCondition = ruleCondition;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}