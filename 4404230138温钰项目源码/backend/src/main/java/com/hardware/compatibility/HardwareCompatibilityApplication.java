package com.hardware.compatibility;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 硬件兼容性检测平台 - Spring Boot应用主类
 */
@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
public class HardwareCompatibilityApplication {

    public static void main(String[] args) {
        SpringApplication.run(HardwareCompatibilityApplication.class, args);
    }
}