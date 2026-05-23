package com.hardware.compatibility.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hardware.compatibility.entity.HardwareComponent;
import com.hardware.compatibility.entity.CompatibilityRule;
import com.hardware.compatibility.dto.response.CompatibilityResult;
import com.hardware.compatibility.dto.response.RuleCheckResult;
import com.hardware.compatibility.repository.CompatibilityRuleRepository;
import com.hardware.compatibility.service.CompatibilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 兼容性检测服务实现类
 * 基于现有JavaScript兼容性引擎逻辑迁移
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CompatibilityServiceImpl implements CompatibilityService {
    
    private final CompatibilityRuleRepository ruleRepository;
    private final ObjectMapper objectMapper;
    
    // 缓存检测结果，提高性能
    private final Map<String, CompatibilityResult> resultCache = new ConcurrentHashMap<>();
    
    @Override
    public CompatibilityResult checkCompatibility(Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        String cacheKey = generateCacheKey(components);
        
        // 检查缓存
        if (resultCache.containsKey(cacheKey)) {
            System.out.println("从缓存获取兼容性检测结果: " + cacheKey);
            return resultCache.get(cacheKey);
        }
        
        List<RuleCheckResult> results = new ArrayList<>();
        List<CompatibilityRule> rules = getAllRules();
        
        // 执行所有兼容性规则检测
        for (CompatibilityRule rule : rules) {
            RuleCheckResult result = executeRule(rule, components);
            if (result != null) {
                results.add(result);
            }
        }
        
        // 计算总体兼容性
        boolean overallCompatible = calculateOverallCompatibility(results);
        
        CompatibilityResult compatibilityResult = new CompatibilityResult();
        compatibilityResult.setOverallCompatible(overallCompatible);
        compatibilityResult.setRuleResults(results);
        compatibilityResult.setCheckedComponents(new ArrayList<>(components.values()));
        compatibilityResult.setTimestamp(new Date());
        
        // 缓存结果
        resultCache.put(cacheKey, compatibilityResult);
        
        return compatibilityResult;
    }
    
    @Override
    @Cacheable(value = "compatibilityRules")
    public List<CompatibilityRule> getAllRules() {
        List<CompatibilityRule> rules = ruleRepository.findAllByOrderByRuleTypeAsc();
        
        // 如果没有规则，加载默认规则
        if (rules.isEmpty()) {
            rules = loadDefaultRules();
            ruleRepository.saveAll(rules);
        }
        
        return rules;
    }
    
    @Override
    public CompatibilityRule getRuleByName(String ruleName) {
        return ruleRepository.findByRuleName(ruleName)
                .orElseThrow(() -> new IllegalArgumentException("规则不存在: " + ruleName));
    }
    
    @Override
    public CompatibilityRule saveRule(CompatibilityRule rule) {
        // 验证规则条件格式
        validateRuleCondition(rule.getRuleCondition());
        
        return ruleRepository.save(rule);
    }
    
    @Override
    public void deleteRule(Long ruleId) {
        if (!ruleRepository.existsById(ruleId)) {
            throw new IllegalArgumentException("规则不存在: " + ruleId);
        }
        ruleRepository.deleteById(ruleId);
        
        // 清除相关缓存
        resultCache.clear();
    }
    
    /**
     * 执行单个兼容性规则
     */
    private RuleCheckResult executeRule(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        try {
            JsonNode condition = rule.getRuleCondition();
            String ruleType = condition.get("type").asText();
            
            // 根据规则类型执行不同的检测逻辑
            switch (ruleType) {
                case "cpu_mb_socket":
                    return checkCpuMbSocket(rule, components);
                case "ram_mb_ddr":
                    return checkRamMbDdr(rule, components);
                case "case_mb_formfactor":
                    return checkCaseMbFormFactor(rule, components);
                case "gpu_case_length":
                    return checkGpuCaseLength(rule, components);
                case "cpu_case_height":
                    return checkCpuCaseHeight(rule, components);
                case "mb_nvme_slots":
                    return checkMbNvmeSlots(rule, components);
                case "power_supply":
                    return checkPowerSupply(rule, components);
                default:
                    System.err.println("未知的规则类型: " + ruleType);
                    return null;
            }
        } catch (Exception e) {
            System.err.println("执行规则失败: " + rule.getRuleName() + " - " + e.getMessage());
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(false);
            result.setReason("规则执行异常: " + e.getMessage());
            result.setRuleType(rule.getRuleType());
            return result;
        }
    }
    
    /**
     * CPU与主板插槽匹配检测
     */
    private RuleCheckResult checkCpuMbSocket(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        HardwareComponent cpu = components.get(HardwareComponent.ComponentCategory.CPU);
        HardwareComponent mb = components.get(HardwareComponent.ComponentCategory.MOTHERBOARD);
        
        if (cpu == null || mb == null) {
            return null; // 缺少必要组件，跳过检测
        }
        
        String cpuSocket = extractSpecValue(cpu, "接口");
        String mbSocket = extractSpecValue(mb, "cpu接口");
        
        if (cpuSocket == null || mbSocket == null) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(null);
            result.setReason("插槽信息不完整");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        boolean compatible = cpuSocket.equalsIgnoreCase(mbSocket);
        String reason = compatible ? 
                "插槽匹配" : 
                String.format("CPU插槽(%s)与主板插槽(%s)不匹配", cpuSocket, mbSocket);
        
        RuleCheckResult result = new RuleCheckResult();
        result.setRuleName(rule.getRuleName());
        result.setCompatible(compatible);
        result.setReason(reason);
        result.setRuleType(rule.getRuleType());
        return result;
    }
    
    /**
     * 内存与主板DDR代数匹配检测
     */
    private RuleCheckResult checkRamMbDdr(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        HardwareComponent ram = components.get(HardwareComponent.ComponentCategory.RAM);
        HardwareComponent mb = components.get(HardwareComponent.ComponentCategory.MOTHERBOARD);
        
        if (ram == null || mb == null) {
            return null;
        }
        
        String ramDdr = extractSpecValue(ram, "DDR代数");
        String mbDdr = extractSpecValue(mb, "ddr代数");
        
        if (ramDdr == null || mbDdr == null) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(null);
            result.setReason("DDR代数信息不完整");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        boolean compatible = ramDdr.equalsIgnoreCase(mbDdr);
        String reason = compatible ? 
                "DDR代数匹配" : 
                String.format("内存DDR(%s)与主板DDR(%s)不兼容", ramDdr, mbDdr);
        
        return RuleCheckResult.builder()
                .ruleName(rule.getRuleName())
                .compatible(compatible)
                .reason(reason)
                .ruleType(rule.getRuleType())
                .build();
    }
    
    /**
     * 机箱与主板尺寸兼容检测
     */
    private RuleCheckResult checkCaseMbFormFactor(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        HardwareComponent pcCase = components.get(HardwareComponent.ComponentCategory.CASE);
        HardwareComponent mb = components.get(HardwareComponent.ComponentCategory.MOTHERBOARD);
        
        if (pcCase == null || mb == null) {
            return null;
        }
        
        String mbForm = extractSpecValue(mb, "板型");
        String caseSupport = extractSpecValue(pcCase, "主板支持");
        
        if (mbForm == null || caseSupport == null) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(null);
            result.setReason("尺寸信息不完整");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        String[] supportedFormFactors = caseSupport.split(",");
        boolean compatible = Arrays.stream(supportedFormFactors)
                .anyMatch(form -> form.trim().equalsIgnoreCase(mbForm));
        
        String reason = compatible ? 
                "尺寸兼容" : 
                String.format("机箱不支持%s主板", mbForm);
        
        return RuleCheckResult.builder()
                .ruleName(rule.getRuleName())
                .compatible(compatible)
                .reason(reason)
                .ruleType(rule.getRuleType())
                .build();
    }
    
    /**
     * 显卡与机箱长度兼容检测
     */
    private RuleCheckResult checkGpuCaseLength(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        HardwareComponent gpu = components.get(HardwareComponent.ComponentCategory.GPU);
        HardwareComponent pcCase = components.get(HardwareComponent.ComponentCategory.CASE);
        
        if (gpu == null || pcCase == null) {
            return null;
        }
        
        Double gpuLength = extractNumber(extractSpecValue(gpu, "显卡长度"));
        Double caseMaxLength = extractNumber(extractSpecValue(pcCase, "显卡限长"));
        
        if (gpuLength == null || caseMaxLength == null) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(null);
            result.setReason("长度信息不完整");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        boolean compatible = gpuLength <= caseMaxLength;
        String reason = compatible ? 
                "长度兼容" : 
                String.format("显卡长度(%.1fcm)超过机箱限长(%.1fcm)", gpuLength, caseMaxLength);
        
        return RuleCheckResult.builder()
                .ruleName(rule.getRuleName())
                .compatible(compatible)
                .reason(reason)
                .ruleType(rule.getRuleType())
                .build();
    }
    
    /**
     * CPU散热器与机箱高度兼容检测
     */
    private RuleCheckResult checkCpuCaseHeight(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        HardwareComponent cpu = components.get(HardwareComponent.ComponentCategory.CPU);
        HardwareComponent pcCase = components.get(HardwareComponent.ComponentCategory.CASE);
        
        if (cpu == null || pcCase == null) {
            return null;
        }
        
        Double caseHeight = extractNumber(extractSpecValue(pcCase, "cpu散热限高"));
        
        if (caseHeight == null) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(null);
            result.setReason("散热限高信息不完整");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        String hasStockCooler = extractSpecValue(cpu, "是否自带风扇");
        
        // 如果有原装散热器，默认兼容
        if (hasStockCooler != null && !hasStockCooler.contains("不带")) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(true);
            result.setReason("使用原装散热器，高度兼容");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        RuleCheckResult result = new RuleCheckResult();
        result.setRuleName(rule.getRuleName());
        result.setCompatible(null);
        result.setReason("需要选择合适的风冷散热器");
        result.setRuleType(rule.getRuleType());
        return result;
    }
    
    /**
     * 主板M.2插槽数量检查
     */
    private RuleCheckResult checkMbNvmeSlots(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        HardwareComponent mb = components.get(HardwareComponent.ComponentCategory.MOTHERBOARD);
        HardwareComponent nvme = components.get(HardwareComponent.ComponentCategory.NVME);
        
        if (mb == null || nvme == null) {
            return null;
        }
        
        Double m2Slots = extractNumber(extractSpecValue(mb, "M2数量"));
        
        if (m2Slots == null) {
            RuleCheckResult result = new RuleCheckResult();
            result.setRuleName(rule.getRuleName());
            result.setCompatible(null);
            result.setReason("M.2插槽数量未知");
            result.setRuleType(rule.getRuleType());
            return result;
        }
        
        boolean compatible = m2Slots >= 1; // 假设至少需要1个插槽
        String reason = compatible ? 
                "有可用M.2插槽" : 
                "主板无M.2插槽";
        
        return RuleCheckResult.builder()
                .ruleName(rule.getRuleName())
                .compatible(compatible)
                .reason(reason)
                .ruleType(rule.getRuleType())
                .build();
    }
    
    /**
     * 电源功率建议
     */
    private RuleCheckResult checkPowerSupply(CompatibilityRule rule, Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        double estimatedPower = 0;
        
        // CPU功耗估算
        HardwareComponent cpu = components.get(HardwareComponent.ComponentCategory.CPU);
        if (cpu != null) {
            String series = extractSpecValue(cpu, "系列");
            if (series != null) {
                series = series.toLowerCase();
                if (series.contains("i9") || series.contains("ryzen 9")) estimatedPower += 250;
                else if (series.contains("i7") || series.contains("ryzen 7")) estimatedPower += 150;
                else if (series.contains("i5") || series.contains("ryzen 5")) estimatedPower += 100;
                else estimatedPower += 80;
            }
        }
        
        // GPU功耗估算
        HardwareComponent gpu = components.get(HardwareComponent.ComponentCategory.GPU);
        if (gpu != null) {
            String model = extractSpecValue(gpu, "型号");
            if (model != null) {
                model = model.toLowerCase();
                if (model.contains("rtx 4090") || model.contains("rx 7900")) estimatedPower += 450;
                else if (model.contains("rtx 4080") || model.contains("rx 7800")) estimatedPower += 320;
                else if (model.contains("rtx 4070") || model.contains("rx 7700")) estimatedPower += 200;
                else if (model.contains("rtx 4060") || model.contains("rx 7600")) estimatedPower += 160;
                else if (model.contains("rtx 30")) estimatedPower += 220;
                else estimatedPower += 150;
            }
        }
        
        // 基础组件功耗
        estimatedPower += 50; // 主板、内存、存储等
        
        // 安全余量
        estimatedPower = Math.round(estimatedPower * 1.2);
        
        RuleCheckResult result = new RuleCheckResult();
        result.setRuleName(rule.getRuleName());
        result.setCompatible(true);
        result.setReason(String.format("建议电源功率: %.0fW", estimatedPower));
        result.setRecommendation(String.format("推荐使用%.0fW或更高功率的电源", estimatedPower));
        result.setRuleType(rule.getRuleType());
        return result;
    }
    
    /**
     * 从组件规格中提取值
     */
    private String extractSpecValue(HardwareComponent component, String fieldName) {
        if (component.getSpecifications() == null) {
            return null;
        }
        
        JsonNode value = component.getSpecifications().get(fieldName);
        return value != null ? value.asText() : null;
    }
    
    /**
     * 从字符串中提取数字
     */
    private Double extractNumber(String str) {
        if (str == null) return null;
        
        try {
            String numberStr = str.replaceAll("[^\\d.]", "");
            return numberStr.isEmpty() ? null : Double.parseDouble(numberStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * 验证规则条件格式
     */
    private void validateRuleCondition(JsonNode condition) {
        if (condition == null || !condition.has("type")) {
            throw new IllegalArgumentException("规则条件必须包含type字段");
        }
    }
    
    /**
     * 计算总体兼容性
     */
    private boolean calculateOverallCompatibility(List<RuleCheckResult> results) {
        // 如果有关键规则不兼容，则总体不兼容
        return results.stream()
                .filter(result -> result.getRuleType() == CompatibilityRule.RuleType.CRITICAL)
                .allMatch(RuleCheckResult::isCompatible);
    }
    
    /**
     * 生成缓存键
     */
    private String generateCacheKey(Map<HardwareComponent.ComponentCategory, HardwareComponent> components) {
        return components.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue().getId())
                .sorted()
                .reduce((a, b) -> a + "&" + b)
                .orElse("");
    }
    
    /**
     * 加载默认兼容性规则
     */
    private List<CompatibilityRule> loadDefaultRules() {
        List<CompatibilityRule> rules = new ArrayList<>();
        
        try {
            // CPU与主板插槽匹配规则
            rules.add(createRule("cpu_mb_socket", CompatibilityRule.RuleType.CRITICAL, 
                    "CPU与主板插槽匹配", "CPU和主板的物理接口必须匹配"));
            
            // 内存与主板DDR代数匹配规则
            rules.add(createRule("ram_mb_ddr", CompatibilityRule.RuleType.CRITICAL, 
                    "内存与主板DDR代数匹配", "内存的DDR代数必须与主板支持的DDR代数匹配"));
            
            // 机箱与主板尺寸兼容规则
            rules.add(createRule("case_mb_formfactor", CompatibilityRule.RuleType.CRITICAL, 
                    "机箱与主板尺寸兼容", "机箱必须支持主板的物理尺寸"));
            
            // 显卡与机箱长度兼容规则
            rules.add(createRule("gpu_case_length", CompatibilityRule.RuleType.CRITICAL, 
                    "显卡与机箱长度兼容", "显卡长度不能超过机箱的显卡限长"));
            
            // CPU散热器与机箱高度兼容规则
            rules.add(createRule("cpu_case_height", CompatibilityRule.RuleType.WARNING, 
                    "CPU散热器与机箱高度兼容", "CPU散热器高度不能超过机箱的CPU散热限高"));
            
            // 主板M.2插槽数量检查规则
            rules.add(createRule("mb_nvme_slots", CompatibilityRule.RuleType.WARNING, 
                    "主板M.2插槽数量检查", "检查主板是否有足够的M.2插槽"));
            
            // 电源功率建议规则
            rules.add(createRule("power_supply", CompatibilityRule.RuleType.RECOMMENDATION, 
                    "电源功率建议", "根据组件估算所需的电源功率"));
            
        } catch (Exception e) {
            System.err.println("创建默认规则失败: " + e.getMessage());
        }
        
        return rules;
    }
    
    private CompatibilityRule createRule(String ruleName, CompatibilityRule.RuleType ruleType, String name, String description) {
        CompatibilityRule rule = new CompatibilityRule();
        rule.setRuleName(ruleName);
        rule.setRuleType(ruleType);
        rule.setDescription(description);
        
        // 创建规则条件
        Map<String, Object> condition = new HashMap<>();
        condition.put("type", ruleName);
        condition.put("name", name);
        
        try {
            rule.setRuleCondition(objectMapper.valueToTree(condition));
        } catch (Exception e) {
            System.err.println("创建规则条件失败: " + ruleName + " - " + e.getMessage());
        }
        
        return rule;
    }
}