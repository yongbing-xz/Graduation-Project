package com.hardware.compatibility.repository;

import com.hardware.compatibility.entity.HardwareComponent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 硬件组件数据访问接口
 */
@Repository
public interface HardwareComponentRepository extends JpaRepository<HardwareComponent, Long> {
    
    /**
     * 根据分类查找硬件组件
     */
    List<HardwareComponent> findByCategory(HardwareComponent.ComponentCategory category);
    
    /**
     * 根据分类分页查找硬件组件
     */
    Page<HardwareComponent> findByCategory(HardwareComponent.ComponentCategory category, Pageable pageable);
    
    /**
     * 根据品牌查找硬件组件
     */
    List<HardwareComponent> findByBrand(String brand);
    
    /**
     * 根据品牌和分类查找硬件组件
     */
    List<HardwareComponent> findByBrandAndCategory(String brand, HardwareComponent.ComponentCategory category);
    
    /**
     * 根据型号查找硬件组件
     */
    Optional<HardwareComponent> findByModel(String model);
    
    /**
     * 搜索硬件组件（按型号、品牌、标题）
     */
    @Query("SELECT h FROM HardwareComponent h WHERE " +
           "LOWER(h.model) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<HardwareComponent> searchByKeyword(@Param("keyword") String keyword);
    
    /**
     * 获取所有品牌列表
     */
    @Query("SELECT DISTINCT h.brand FROM HardwareComponent h ORDER BY h.brand")
    List<String> findAllBrands();
    
    /**
     * 获取指定分类的品牌列表
     */
    @Query("SELECT DISTINCT h.brand FROM HardwareComponent h WHERE h.category = :category ORDER BY h.brand")
    List<String> findBrandsByCategory(@Param("category") HardwareComponent.ComponentCategory category);
    
    /**
     * 检查型号是否存在
     */
    boolean existsByModel(String model);
    
    /**
     * 查找启用的硬件组件
     */
    List<HardwareComponent> findByIsActiveTrue();
    
    /**
     * 根据分类查找启用的硬件组件
     */
    List<HardwareComponent> findByCategoryAndIsActiveTrue(HardwareComponent.ComponentCategory category);
}