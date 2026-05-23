package com.hardware.compatibility.controller;

import com.hardware.compatibility.dto.request.LoginRequest;
import com.hardware.compatibility.dto.request.RegisterRequest;
import com.hardware.compatibility.dto.response.AuthResponse;
import com.hardware.compatibility.entity.User;
import com.hardware.compatibility.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 用户认证API控制器
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "用户认证", description = "用户登录、注册、认证相关API")
@Slf4j
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录接口，返回JWT令牌")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest loginRequest) {
        
        System.out.println("用户登录: " + loginRequest.getUsername());
        
        AuthResponse authResponse = authService.login(loginRequest);
        
        System.out.println("用户登录成功: " + loginRequest.getUsername());
        
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "新用户注册接口")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest registerRequest) {
        
        System.out.println("用户注册: " + registerRequest.getUsername());
        
        AuthResponse authResponse = authService.register(registerRequest);
        
        System.out.println("用户注册成功: " + registerRequest.getUsername());
        
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新的访问令牌")
    public ResponseEntity<AuthResponse> refreshToken(
            @RequestHeader("Authorization") String refreshToken) {
        
        System.out.println("刷新令牌");
        
        // 移除"Bearer "前缀
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        
        System.out.println("令牌刷新成功");
        
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出接口")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String token) {
        
        System.out.println("用户登出");
        
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        authService.logout(token);
        
        System.out.println("用户登出成功");
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/profile")
    @Operation(summary = "获取用户信息", description = "获取当前登录用户的详细信息")
    public ResponseEntity<User> getProfile(
            @RequestHeader("Authorization") String token) {
        
        System.out.println("获取用户信息");
        
        // 移除"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        User user = authService.getUserFromToken(token);
        
        return ResponseEntity.ok(user);
    }
}