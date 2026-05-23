package com.hardware.compatibility.service;

import com.hardware.compatibility.dto.request.LoginRequest;
import com.hardware.compatibility.dto.request.RegisterRequest;
import com.hardware.compatibility.dto.response.AuthResponse;
import com.hardware.compatibility.entity.User;

/**
 * 用户认证服务接口
 */
public interface AuthService {
    
    /**
     * 用户登录
     */
    AuthResponse login(LoginRequest loginRequest);
    
    /**
     * 用户注册
     */
    AuthResponse register(RegisterRequest registerRequest);
    
    /**
     * 刷新令牌
     */
    AuthResponse refreshToken(String refreshToken);
    
    /**
     * 用户登出
     */
    void logout(String token);
    
    /**
     * 从令牌中获取用户信息
     */
    User getUserFromToken(String token);
    
    /**
     * 验证令牌
     */
    boolean validateToken(String token);
}