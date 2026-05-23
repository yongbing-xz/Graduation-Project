package com.hardware.compatibility.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    /**
     * 首页
     */
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    /**
     * 登录页面
     */
    @GetMapping("/login")
    public String login() {
        return "forward:/login.html";
    }

    /**
     * 兼容性检测页面
     */
    @GetMapping("/compatibility")
    public String compatibility() {
        return "forward:/index.html";
    }

    /**
     * 组件管理页面
     */
    @GetMapping("/components")
    public String components() {
        return "forward:/index.html";
    }

    /**
     * 规则管理页面
     */
    @GetMapping("/rules")
    public String rules() {
        return "forward:/index.html";
    }
}