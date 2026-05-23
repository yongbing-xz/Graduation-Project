package com.hardware.compatibility.repository;

import com.hardware.compatibility.entity.CompatibilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 兼容性规则数据访问接口
 */
@Repository
public interface CompatibilityRuleRepository extends JpaRepository<CompatibilityRule, Long> {
    
    /**
     * 根据规则名称查找规则
     */
    Optional<CompatibilityRule> findByRuleName(String ruleName);
    
    /**
     * 根据规则类型查找规则
     */
    List<CompatibilityRule> findByRuleType(CompatibilityRule.RuleType ruleType);
    
    /**
     * 按规则类型排序查找所有规则
     */
    List<CompatibilityRule> findAllByOrderByRuleTypeAsc();
    
    /**
     * 检查规则名称是否存在
     */
    boolean existsByRuleName(String ruleName);
    
    /**
     * 查找启用的规则
     */
    @Query("SELECT r FROM CompatibilityRule r WHERE r.enabled = true ORDER BY r.ruleType ASC")
    List<CompatibilityRule> findEnabledRules();
}