package com.hardware.compatibility.controller;

import com.hardware.compatibility.entity.HardwareComponent;
import com.hardware.compatibility.service.HardwareComponentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 硬件组件管理API控制器
 */
@RestController
@RequestMapping("/api/components")
@Tag(name = "硬件组件管理", description = "硬件组件数据管理相关API")
@Slf4j
@RequiredArgsConstructor
public class HardwareComponentController {
    
    private final HardwareComponentService componentService;
    
    @GetMapping
    @Operation(summary = "获取所有硬件组件", description = "获取系统中所有的硬件组件数据")
    public ResponseEntity<List<HardwareComponent>> getAllComponents() {
        System.out.println("获取所有硬件组件");
        
        List<HardwareComponent> components = componentService.getAllComponents();
        
        System.out.println("获取到硬件组件数量: " + components.size());
        
        return ResponseEntity.ok(components);
    }
    
    @GetMapping("/page")
    @Operation(summary = "分页获取硬件组件", description = "分页获取硬件组件数据")
    public ResponseEntity<Page<HardwareComponent>> getComponents(
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "asc") String direction) {
        
        System.out.println("分页获取硬件组件，页码: " + page + ", 大小: " + size);
        
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<HardwareComponent> components = componentService.getComponents(pageable);
        
        System.out.println("分页获取硬件组件完成，总页数: " + components.getTotalPages() + ", 总数量: " + components.getTotalElements());
        
        return ResponseEntity.ok(components);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取硬件组件", description = "根据组件ID获取具体的硬件组件信息")
    public ResponseEntity<HardwareComponent> getComponentById(
            @Parameter(description = "组件ID")
            @PathVariable Long id) {
        
        System.out.println("根据ID获取硬件组件: " + id);
        
        HardwareComponent component = componentService.getComponentById(id);
        
        return ResponseEntity.ok(component);
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "根据分类获取硬件组件", description = "根据组件分类获取硬件组件列表")
    public ResponseEntity<List<HardwareComponent>> getComponentsByCategory(
            @Parameter(description = "组件分类")
            @PathVariable HardwareComponent.ComponentCategory category) {
        
        System.out.println("根据分类获取硬件组件: " + category);
        
        List<HardwareComponent> components = componentService.getComponentsByCategory(category);
        
        System.out.println("获取到分类 " + category + " 的硬件组件数量: " + components.size());
        
        return ResponseEntity.ok(components);
    }
    
    @GetMapping("/category/{category}/page")
    @Operation(summary = "根据分类分页获取硬件组件", description = "根据组件分类分页获取硬件组件")
    public ResponseEntity<Page<HardwareComponent>> getComponentsByCategoryPage(
            @Parameter(description = "组件分类") @PathVariable HardwareComponent.ComponentCategory category,
            @Parameter(description = "页码") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        System.out.println("根据分类分页获取硬件组件: " + category + ", 页码: " + page);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HardwareComponent> components = componentService.getComponentsByCategory(category, pageable);
        
        return ResponseEntity.ok(components);
    }
    
    @GetMapping("/brand/{brand}")
    @Operation(summary = "根据品牌获取硬件组件", description = "根据品牌名称获取硬件组件列表")
    public ResponseEntity<List<HardwareComponent>> getComponentsByBrand(
            @Parameter(description = "品牌名称")
            @PathVariable String brand) {
        
        System.out.println("根据品牌获取硬件组件: " + brand);
        
        List<HardwareComponent> components = componentService.getComponentsByBrand(brand);
        
        System.out.println("获取到品牌 " + brand + " 的硬件组件数量: " + components.size());
        
        return ResponseEntity.ok(components);
    }
    
    @GetMapping("/search")
    @Operation(summary = "搜索硬件组件", description = "根据关键词搜索硬件组件")
    public ResponseEntity<List<HardwareComponent>> searchComponents(
            @Parameter(description = "搜索关键词")
            @RequestParam String keyword) {
        
        System.out.println("搜索硬件组件: " + keyword);
        
        List<HardwareComponent> components = componentService.searchComponents(keyword);
        
        System.out.println("搜索到硬件组件数量: " + components.size());
        
        return ResponseEntity.ok(components);
    }
    
    @PostMapping
    @Operation(summary = "创建硬件组件", description = "创建新的硬件组件")
    public ResponseEntity<HardwareComponent> createComponent(
            @Parameter(description = "硬件组件信息")
            @RequestBody HardwareComponent component) {
        
        System.out.println("创建硬件组件: " + component.getModel());
        
        HardwareComponent savedComponent = componentService.createComponent(component);
        
        System.out.println("硬件组件创建成功: " + savedComponent.getId());
        
        return ResponseEntity.ok(savedComponent);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新硬件组件", description = "更新现有的硬件组件信息")
    public ResponseEntity<HardwareComponent> updateComponent(
            @Parameter(description = "组件ID")
            @PathVariable Long id,
            @Parameter(description = "更新后的组件信息")
            @RequestBody HardwareComponent component) {
        
        System.out.println("更新硬件组件: " + id);
        
        HardwareComponent updatedComponent = componentService.updateComponent(id, component);
        
        System.out.println("硬件组件更新成功: " + id);
        
        return ResponseEntity.ok(updatedComponent);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除硬件组件", description = "删除指定的硬件组件")
    public ResponseEntity<Void> deleteComponent(
            @Parameter(description = "组件ID")
            @PathVariable Long id) {
        
        System.out.println("删除硬件组件: " + id);
        
        componentService.deleteComponent(id);
        
        System.out.println("硬件组件删除成功: " + id);
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/brands")
    @Operation(summary = "获取所有品牌列表", description = "获取系统中所有硬件组件的品牌列表")
    public ResponseEntity<List<String>> getAllBrands() {
        System.out.println("获取所有品牌列表");
        
        List<String> brands = componentService.getAllBrands();
        
        System.out.println("获取到品牌数量: " + brands.size());
        
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/brands/{category}")
    @Operation(summary = "获取指定分类的品牌列表", description = "获取指定分类下的品牌列表")
    public ResponseEntity<List<String>> getBrandsByCategory(
            @Parameter(description = "组件分类")
            @PathVariable HardwareComponent.ComponentCategory category) {
        
        System.out.println("获取分类 " + category + " 的品牌列表");
        
        List<String> brands = componentService.getBrandsByCategory(category);
        
        System.out.println("获取到分类 " + category + " 的品牌数量: " + brands.size());
        
        return ResponseEntity.ok(brands);
    }
    
    @PostMapping("/import")
    @Operation(summary = "批量导入硬件组件", description = "批量导入硬件组件数据")
    public ResponseEntity<List<HardwareComponent>> importComponents(
            @Parameter(description = "硬件组件列表")
            @RequestBody List<HardwareComponent> components) {
        
        System.out.println("批量导入硬件组件，数量: " + components.size());
        
        List<HardwareComponent> importedComponents = componentService.importComponents(components);
        
        System.out.println("批量导入完成，成功导入数量: " + importedComponents.size());
        
        return ResponseEntity.ok(importedComponents);
    }
    
    @GetMapping("/export")
    @Operation(summary = "导出硬件组件数据", description = "导出所有硬件组件数据")
    public ResponseEntity<List<HardwareComponent>> exportComponents() {
        System.out.println("导出硬件组件数据");
        
        List<HardwareComponent> components = componentService.getAllComponents();
        
        System.out.println("导出硬件组件数据完成，数量: " + components.size());
        
        return ResponseEntity.ok(components);
    }
}