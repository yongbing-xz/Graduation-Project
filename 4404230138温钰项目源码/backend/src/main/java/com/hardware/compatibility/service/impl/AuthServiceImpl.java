package com.hardware.compatibility.service.impl;

import com.hardware.compatibility.config.JwtUtil;
import com.hardware.compatibility.dto.request.LoginRequest;
import com.hardware.compatibility.dto.request.RegisterRequest;
import com.hardware.compatibility.dto.response.AuthResponse;
import com.hardware.compatibility.entity.User;
import com.hardware.compatibility.repository.UserRepository;
import com.hardware.compatibility.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



/**
 * 认证服务实现类
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    // 默认管理员账户
    private static final String DEFAULT_ADMIN_USERNAME = "demo";
    private static final String DEFAULT_ADMIN_PASSWORD = "123456";
    
    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        // 检查是否为默认管理员账户
        if (DEFAULT_ADMIN_USERNAME.equals(loginRequest.getUsername()) && 
            DEFAULT_ADMIN_PASSWORD.equals(loginRequest.getPassword())) {
            
            System.out.println("默认管理员登录成功: " + loginRequest.getUsername());
            
            // 创建默认管理员用户信息
            User defaultAdmin = createDefaultAdminUser();
            
            String accessToken = jwtUtil.generateAccessToken(loginRequest.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(loginRequest.getUsername());
            
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtUtil.getAccessTokenExpiration())
                    .user(defaultAdmin)
                    .build();
        }
        
        // 正常用户登录逻辑
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        String accessToken = jwtUtil.generateAccessToken(loginRequest.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(loginRequest.getUsername());
        
        System.out.println("用户登录成功: " + loginRequest.getUsername());
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .user(user)
                .build();
    }
    
    @Override
    public AuthResponse register(RegisterRequest registerRequest) {
        // 检查是否尝试注册管理员账户
        if (DEFAULT_ADMIN_USERNAME.equals(registerRequest.getUsername())) {
            throw new RuntimeException("该用户名已被系统保留");
        }
        
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(User.UserRole.USER);
        
        userRepository.save(user);
        
        System.out.println("用户注册成功: " + registerRequest.getUsername());
        
        return login(LoginRequest.builder()
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .build());
    }
    
    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("刷新令牌无效");
        }
        
        String username = jwtUtil.extractUsername(refreshToken);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        String newAccessToken = jwtUtil.generateAccessToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);
        
        System.out.println("刷新令牌成功: " + username);
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .user(user)
                .build();
    }
    
    @Override
    public void logout(String token) {
        SecurityContextHolder.clearContext();
        System.out.println("用户登出成功");
    }
    
    @Override
    public User getUserFromToken(String token) {
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    @Override
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
    
    /**
     * 创建默认管理员用户信息
     */
    private User createDefaultAdminUser() {
        User user = new User();
        user.setUsername(DEFAULT_ADMIN_USERNAME);
        user.setEmail("admin@example.com");
        user.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        user.setRole(User.UserRole.ADMIN);
        return user;
    }
}