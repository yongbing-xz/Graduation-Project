package com.hardware.compatibility.service;

import com.hardware.compatibility.entity.HardwareComponent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 硬件组件服务接口
 */
public interface HardwareComponentService {
    
    /**
     * 获取所有硬件组件
     */
    List<HardwareComponent> getAllComponents();
    
    /**
     * 分页获取硬件组件
     */
    Page<HardwareComponent> getComponents(Pageable pageable);
    
    /**
     * 根据ID获取硬件组件
     */
    HardwareComponent getComponentById(Long id);
    
    /**
     * 根据分类获取硬件组件
     */
    List<HardwareComponent> getComponentsByCategory(HardwareComponent.ComponentCategory category);
    
    /**
     * 根据分类分页获取硬件组件
     */
    Page<HardwareComponent> getComponentsByCategory(HardwareComponent.ComponentCategory category, Pageable pageable);
    
    /**
     * 根据品牌获取硬件组件
     */
    List<HardwareComponent> getComponentsByBrand(String brand);
    
    /**
     * 搜索硬件组件
     */
    List<HardwareComponent> searchComponents(String keyword);
    
    /**
     * 创建硬件组件
     */
    HardwareComponent createComponent(HardwareComponent component);
    
    /**
     * 更新硬件组件
     */
    HardwareComponent updateComponent(Long id, HardwareComponent component);
    
    /**
     * 删除硬件组件
     */
    void deleteComponent(Long id);
    
    /**
     * 获取所有品牌列表
     */
    List<String> getAllBrands();
    
    /**
     * 获取指定分类的品牌列表
     */
    List<String> getBrandsByCategory(HardwareComponent.ComponentCategory category);
    
    /**
     * 批量导入硬件组件
     */
    List<HardwareComponent> importComponents(List<HardwareComponent> components);
    
    /**
     * 导出硬件组件数据
     */
    List<HardwareComponent> exportComponents();
    
    /**
     * 启用硬件组件
     */
    void enableComponent(Long id);
}