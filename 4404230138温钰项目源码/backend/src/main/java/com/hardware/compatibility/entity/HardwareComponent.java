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
 * 硬件组件实体类
 * 对应数据库中的hardware_components表
 */
@Entity
@Table(name = "hardware_components", indexes = {
    @Index(name = "idx_category_brand", columnList = "category, brand"),
    @Index(name = "idx_category_model", columnList = "category, model")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HardwareComponent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "组件类别不能为空")
    @Column(nullable = false)
    private ComponentCategory category;
    
    @NotBlank(message = "品牌不能为空")
    @Column(nullable = false)
    private String brand;
    
    @NotBlank(message = "型号不能为空")
    @Column(nullable = false)
    private String model;
    
    @NotBlank(message = "标题不能为空")
    @Column(nullable = false)
    private String title;
    
    @Type(com.vladmihalcea.hibernate.type.json.JsonType.class)
    @Column(columnDefinition = "json")
    private JsonNode specifications;
    
    @Type(com.vladmihalcea.hibernate.type.json.JsonType.class)
    @Column(name = "compatibility_rules", columnDefinition = "json")
    private JsonNode compatibilityRules;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum ComponentCategory {
        CPU, MOTHERBOARD, GPU, RAM, NVME, CASE
    }
    
    public HardwareComponent(ComponentCategory category, String brand, String model, String title) {
        this.category = category;
        this.brand = brand;
        this.model = model;
        this.title = title;
    }

    // 手动添加getter和setter方法，因为Lombok可能没有正确工作
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComponentCategory getCategory() {
        return category;
    }

    public void setCategory(ComponentCategory category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public JsonNode getSpecifications() {
        return specifications;
    }

    public void setSpecifications(JsonNode specifications) {
        this.specifications = specifications;
    }

    public JsonNode getCompatibilityRules() {
        return compatibilityRules;
    }

    public void setCompatibilityRules(JsonNode compatibilityRules) {
        this.compatibilityRules = compatibilityRules;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    // 添加缺失的方法
    public String getDescription() {
        return null; // 这个方法在原始代码中不存在，返回null
    }

    public void setDescription(String description) {
        // 这个方法在原始代码中不存在，不做任何操作
    }

    public Boolean getEnabled() {
        return isActive; // 将enabled映射到isActive字段
    }

    public void setEnabled(Boolean enabled) {
        this.isActive = enabled; // 将enabled映射到isActive字段
    }
}