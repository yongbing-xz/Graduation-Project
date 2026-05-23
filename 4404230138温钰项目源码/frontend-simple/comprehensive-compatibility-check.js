#!/usr/bin/env node

/**
 * 全面的终端兼容性检查脚本
 * 检查所有脚本文件在Windows PowerShell环境下的兼容性
 */

const fs = require('fs');
const path = require('path');

// 检查的文件列表
const filesToCheck = [
    'index.html',
    'products-data.js',
    'compatibility-test.js',
    'data-validator.js',
    'compatibility-debug.js',
    'detailed-verify.js',
    'quick-verify.js',
    'convert-components-data.js',
    'test-runner.js',
    'assets/js/error-handler.js',
    'assets/js/utils.js',
    'assets/js/compatibility-engine.js',
    'assets/js/component-validator.js',
    'assets/js/data-manager.js',
    'tests/main.js',
    'tests/test-manager.js',
    'tests/test-runner.js',
    'tests/index.js',
    'tests/scheduler.js',
    'tests/stability-metrics.js',
    'tests/environment-validator.js',
    'tests/alert-system.js'
];

console.log('🔍 开始全面的终端兼容性检查...\n');

// 检查结果汇总
const results = {
    passed: [],
    failed: [],
    warnings: []
};

// 检查语法错误
function checkSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查常见的兼容性问题
        const issues = [];
        
        // 1. 检查Windows路径分隔符
        if (content.includes('\\') && !content.includes('\\\\')) {
            issues.push('⚠️ 可能包含Windows路径分隔符问题');
        }
        
        // 2. 检查PowerShell特殊字符
        const powershellSpecialChars = ['`', '$', '@', '&', '|', ';', '>', '<'];
        powershellSpecialChars.forEach(char => {
            if (content.includes(char) && !content.includes(`\\${char}`)) {
                issues.push(`⚠️ 可能包含PowerShell特殊字符: ${char}`);
            }
        });
        
        // 3. 检查Node.js语法错误
        try {
            // 尝试解析JavaScript语法
            if (filePath.endsWith('.js')) {
                // 简单的语法检查 - 检查括号匹配
                const openBraces = (content.match(/\{/g) || []).length;
                const closeBraces = (content.match(/\}/g) || []).length;
                if (openBraces !== closeBraces) {
                    issues.push('❌ 大括号不匹配');
                }
                
                const openParens = (content.match(/\(/g) || []).length;
                const closeParens = (content.match(/\)/g) || []).length;
                if (openParens !== closeParens) {
                    issues.push('❌ 小括号不匹配');
                }
            }
        } catch (e) {
            issues.push(`❌ 语法解析错误: ${e.message}`);
        }
        
        // 4. 检查可能导致卡住的代码模式
        const problematicPatterns = [
            { pattern: /while\s*\(true\)/, description: '无限循环' },
            { pattern: /setInterval\([^)]*,\s*0\)/, description: '零延迟定时器' },
            { pattern: /setTimeout\([^)]*,\s*0\)/, description: '零延迟超时' },
            { pattern: /process\.exit\([^)]*\)/, description: '进程退出' },
            { pattern: /throw\s+new\s+Error/, description: '错误抛出' }
        ];
        
        problematicPatterns.forEach(({ pattern, description }) => {
            if (pattern.test(content)) {
                issues.push(`⚠️ 检测到${description}`);
            }
        });
        
        return issues;
    } catch (error) {
        return [`❌ 文件读取错误: ${error.message}`];
    }
}

// 检查文件是否存在
function checkFileExistence(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch {
        return false;
    }
}

// 执行检查
filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    console.log(`📄 检查文件: ${filePath}`);
    
    if (!checkFileExistence(fullPath)) {
        console.log('   ❌ 文件不存在\n');
        results.failed.push({ file: filePath, issues: ['文件不存在'] });
        return;
    }
    
    const issues = checkSyntax(fullPath);
    
    if (issues.length === 0) {
        console.log('   ✅ 通过检查\n');
        results.passed.push(filePath);
    } else {
        console.log('   ⚠️ 发现问题:');
        issues.forEach(issue => console.log(`     ${issue}`));
        console.log('');
        
        if (issues.some(issue => issue.startsWith('❌'))) {
            results.failed.push({ file: filePath, issues });
        } else {
            results.warnings.push({ file: filePath, issues });
        }
    }
});

// 生成报告
console.log('📊 兼容性检查报告');
console.log('==================\n');

console.log(`✅ 通过检查: ${results.passed.length} 个文件`);
if (results.passed.length > 0) {
    results.passed.forEach(file => console.log(`   - ${file}`));
}

console.log(`\n⚠️ 警告文件: ${results.warnings.length} 个文件`);
if (results.warnings.length > 0) {
    results.warnings.forEach(({ file, issues }) => {
        console.log(`   - ${file}`);
        issues.forEach(issue => console.log(`     ${issue}`));
    });
}

console.log(`\n❌ 失败文件: ${results.failed.length} 个文件`);
if (results.failed.length > 0) {
    results.failed.forEach(({ file, issues }) => {
        console.log(`   - ${file}`);
        issues.forEach(issue => console.log(`     ${issue}`));
    });
}

// 检查批处理文件
console.log('\n🔧 检查批处理文件...');
const batFiles = [
    '../check-system-status.bat',
    '../quick-start.bat',
    '../start-full-system.bat',
    '../启动.bat'
];

batFiles.forEach(batFile => {
    const fullPath = path.join(__dirname, batFile);
    
    if (checkFileExistence(fullPath)) {
        console.log(`   ✅ ${batFile} 存在`);
    } else {
        console.log(`   ❌ ${batFile} 不存在`);
    }
});

// 检查Python文件
console.log('\n🐍 检查Python文件...');
const pyFiles = [
    'check_brands.py'
];

pyFiles.forEach(pyFile => {
    const fullPath = path.join(__dirname, pyFile);
    
    if (checkFileExistence(fullPath)) {
        console.log(`   ✅ ${pyFile} 存在`);
        
        // 简单的Python语法检查
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // 检查常见的Python问题
            if (content.includes('print ') && !content.includes('print(')) {
                console.log('     ⚠️ 可能使用Python 2的print语法');
            }
            
            if (content.includes('#!/usr/bin/env python') && !content.includes('python3')) {
                console.log('     ⚠️ 可能使用Python 2而非Python 3');
            }
            
        } catch (error) {
            console.log(`     ❌ 读取错误: ${error.message}`);
        }
    } else {
        console.log(`   ❌ ${pyFile} 不存在`);
    }
});

console.log('\n🔍 兼容性检查完成！');

// 提供修复建议
if (results.failed.length > 0 || results.warnings.length > 0) {
    console.log('\n💡 修复建议:');
    
    if (results.failed.length > 0) {
        console.log('1. 优先修复标记为❌的文件');
    }
    
    if (results.warnings.length > 0) {
        console.log('2. 检查标记为⚠️的文件，确保兼容性');
    }
    
    console.log('3. 在Windows PowerShell环境中测试所有脚本');
    console.log('4. 确保路径分隔符使用正斜杠(/)或双反斜杠(\\\\\\)');
    console.log('5. 避免在脚本中使用PowerShell特殊字符');
}

// 退出码
const exitCode = results.failed.length > 0 ? 1 : 0;
process.exit(exitCode);