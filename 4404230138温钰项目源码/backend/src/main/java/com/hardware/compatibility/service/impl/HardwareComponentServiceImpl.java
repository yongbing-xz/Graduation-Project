package com.hardware.compatibility.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.hardware.compatibility.entity.HardwareComponent;
import com.hardware.compatibility.repository.HardwareComponentRepository;
import com.hardware.compatibility.service.HardwareComponentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;


/**
 * 硬件组件服务实现类
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class HardwareComponentServiceImpl implements HardwareComponentService {
    
    private final HardwareComponentRepository componentRepository;
    
    @Override
    @Cacheable(value = "hardwareComponents")
    public List<HardwareComponent> getAllComponents() {
        System.out.println("获取所有硬件组件");
        return componentRepository.findByIsActiveTrue();
    }
    
    @Override
    public Page<HardwareComponent> getComponents(Pageable pageable) {
        System.out.println("分页获取硬件组件，页码: " + pageable.getPageNumber() + ", 大小: " + pageable.getPageSize());
        return componentRepository.findAll(pageable);
    }
    
    @Override
    @Cacheable(value = "hardwareComponent", key = "#id")
    public HardwareComponent getComponentById(Long id) {
        System.out.println("根据ID获取硬件组件: " + id);
        return componentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("硬件组件不存在: " + id));
    }
    
    @Override
    @Cacheable(value = "componentsByCategory", key = "#category")
    public List<HardwareComponent> getComponentsByCategory(HardwareComponent.ComponentCategory category) {
        System.out.println("根据分类获取硬件组件: " + category);
        return componentRepository.findByCategoryAndIsActiveTrue(category);
    }
    
    @Override
    public Page<HardwareComponent> getComponentsByCategory(HardwareComponent.ComponentCategory category, Pageable pageable) {
        System.out.println("根据分类分页获取硬件组件: " + category + ", 页码: " + pageable.getPageNumber());
        return componentRepository.findByCategory(category, pageable);
    }
    
    @Override
    @Cacheable(value = "componentsByBrand", key = "#brand")
    public List<HardwareComponent> getComponentsByBrand(String brand) {
        System.out.println("根据品牌获取硬件组件: " + brand);
        return componentRepository.findByBrand(brand);
    }
    
    @Override
    public List<HardwareComponent> searchComponents(String keyword) {
        System.out.println("搜索硬件组件: " + keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllComponents();
        }
        return componentRepository.searchByKeyword(keyword.trim());
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"hardwareComponents", "componentsByCategory", "componentsByBrand", "brands"}, allEntries = true)
    public HardwareComponent createComponent(HardwareComponent component) {
        System.out.println("创建硬件组件: " + component.getModel());
        
        // 验证型号是否已存在
        if (componentRepository.existsByModel(component.getModel())) {
            throw new IllegalArgumentException("硬件组件型号已存在: " + component.getModel());
        }
        
        // 验证规格数据格式
        validateSpecifications(component.getSpecifications());
        
        // 设置默认值
        component.setId(null); // 确保ID为null，由数据库生成
        component.setIsActive(true);
        
        return componentRepository.save(component);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"hardwareComponents", "hardwareComponent", "componentsByCategory", "componentsByBrand", "brands"}, allEntries = true)
    public HardwareComponent updateComponent(Long id, HardwareComponent component) {
        System.out.println("更新硬件组件: " + id);
        
        HardwareComponent existingComponent = getComponentById(id);
        
        // 验证型号是否冲突（如果修改了型号）
        if (!existingComponent.getModel().equals(component.getModel()) && 
            componentRepository.existsByModel(component.getModel())) {
            throw new IllegalArgumentException("硬件组件型号已存在: " + component.getModel());
        }
        
        // 验证规格数据格式
        validateSpecifications(component.getSpecifications());
        
        // 更新字段
        existingComponent.setCategory(component.getCategory());
        existingComponent.setBrand(component.getBrand());
        existingComponent.setModel(component.getModel());
        existingComponent.setSpecifications(component.getSpecifications());
        existingComponent.setCompatibilityRules(component.getCompatibilityRules());
        existingComponent.setIsActive(component.getIsActive());
        
        return componentRepository.save(existingComponent);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"hardwareComponents", "hardwareComponent", "componentsByCategory", "componentsByBrand", "brands"}, allEntries = true)
    public void deleteComponent(Long id) {
        System.out.println("删除硬件组件: " + id);
        
        HardwareComponent component = getComponentById(id);
        
        // 软删除：禁用组件而不是物理删除
        component.setIsActive(false);
        componentRepository.save(component);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"hardwareComponents", "hardwareComponent", "componentsByCategory", "componentsByBrand", "brands"}, allEntries = true)
    public void enableComponent(Long id) {
        System.out.println("启用硬件组件: " + id);
        
        HardwareComponent component = getComponentById(id);
        component.setIsActive(true);
        componentRepository.save(component);
    }
    
    @Override
    @Cacheable(value = "brands")
    public List<String> getAllBrands() {
        System.out.println("获取所有品牌列表");
        return componentRepository.findAllBrands();
    }
    
    @Override
    @Cacheable(value = "brandsByCategory", key = "#category")
    public List<String> getBrandsByCategory(HardwareComponent.ComponentCategory category) {
        System.out.println("获取指定分类的品牌列表: " + category);
        return componentRepository.findBrandsByCategory(category);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = {"hardwareComponents", "componentsByCategory", "componentsByBrand", "brands"}, allEntries = true)
    public List<HardwareComponent> importComponents(List<HardwareComponent> components) {
        System.out.println("批量导入硬件组件，数量: " + components.size());
        
        List<HardwareComponent> importedComponents = new ArrayList<>();
        
        for (HardwareComponent component : components) {
            try {
                // 跳过已存在的组件
                if (componentRepository.existsByModel(component.getModel())) {
                    System.err.println("跳过已存在的组件: " + component.getModel());
                    continue;
                }
                
                // 验证规格数据格式
                validateSpecifications(component.getSpecifications());
                
                // 设置默认值
                component.setId(null);
                component.setIsActive(true);
                
                HardwareComponent savedComponent = componentRepository.save(component);
                importedComponents.add(savedComponent);
                
            } catch (Exception e) {
                System.err.println("导入组件失败: " + component.getModel() + " - " + e.getMessage());
            }
        }
        
        System.out.println("成功导入硬件组件数量: " + importedComponents.size());
        return importedComponents;
    }
    
    @Override
    public List<HardwareComponent> exportComponents() {
        System.out.println("导出硬件组件数据");
        return getAllComponents();
    }
    
    /**
     * 验证规格数据格式
     */
    private void validateSpecifications(JsonNode specifications) {
        if (specifications == null) {
            throw new IllegalArgumentException("规格数据不能为空");
        }
        
        // 验证是否为有效的JSON对象
        if (!specifications.isObject()) {
            throw new IllegalArgumentException("规格数据必须是JSON对象格式");
        }
        
        // 验证关键字段是否存在
        if (!specifications.has("型号") || specifications.get("型号").asText().trim().isEmpty()) {
            throw new IllegalArgumentException("规格数据必须包含型号字段");
        }
    }
}