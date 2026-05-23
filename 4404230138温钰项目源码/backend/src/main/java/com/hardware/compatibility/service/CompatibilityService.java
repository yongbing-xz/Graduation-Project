package com.hardware.compatibility.service;

import com.hardware.compatibility.entity.HardwareComponent;
import com.hardware.compatibility.entity.CompatibilityRule;
import com.hardware.compatibility.dto.response.CompatibilityResult;

import java.util.List;
import java.util.Map;

/**
 * 兼容性检测服务接口
 * 负责执行硬件组件兼容性检测
 */
public interface CompatibilityService {
    
    /**
     * 检测组件兼容性
     * 
     * @param components 组件映射（类别 -> 组件）
     * @return 兼容性检测结果
     */
    CompatibilityResult checkCompatibility(Map<HardwareComponent.ComponentCategory, HardwareComponent> components);
    
    /**
     * 获取所有兼容性规则
     * 
     * @return 规则列表
     */
    List<CompatibilityRule> getAllRules();
    
    /**
     * 根据规则名称获取规则
     * 
     * @param ruleName 规则名称
     * @return 规则对象
     */
    CompatibilityRule getRuleByName(String ruleName);
    
    /**
     * 创建或更新兼容性规则
     * 
     * @param rule 规则对象
     * @return 保存后的规则
     */
    CompatibilityRule saveRule(CompatibilityRule rule);
    
    /**
     * 删除兼容性规则
     * 
     * @param ruleId 规则ID
     */
    void deleteRule(Long ruleId);
}