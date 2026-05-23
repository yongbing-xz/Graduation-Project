// 语法检查脚本 - 检查所有JavaScript文件的语法错误
const fs = require('fs');
const path = require('path');

console.log('🔍 开始语法检查...\n');

// 要检查的文件列表
const filesToCheck = [
  'compatibility-test.js',
  'data-validator.js', 
  'detailed-verify.js',
  'products-data.js'
];

let totalErrors = 0;

filesToCheck.forEach(fileName => {
  const filePath = path.join(__dirname, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${fileName}`);
    return;
  }
  
  console.log(`📄 检查文件: ${fileName}`);
  
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查常见语法问题
    const errors = [];
    
    // 1. 检查大括号匹配
    const braceCount = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length;
    if (braceCount !== 0) {
      errors.push(`大括号不匹配: 缺少 ${Math.abs(braceCount)} 个 ${braceCount > 0 ? '}' : '{'}`);
    }
    
    // 2. 检查小括号匹配
    const parenCount = (content.match(/\(/g) || []).length - (content.match(/\)/g) || []).length;
    if (parenCount !== 0) {
      errors.push(`小括号不匹配: 缺少 ${Math.abs(parenCount)} 个 ${parenCount > 0 ? ')' : '('}`);
    }
    
    // 3. 检查方括号匹配
    const bracketCount = (content.match(/\[/g) || []).length - (content.match(/\]/g) || []).length;
    if (bracketCount !== 0) {
      errors.push(`方括号不匹配: 缺少 ${Math.abs(bracketCount)} 个 ${bracketCount > 0 ? ']' : '['}`);
    }
    
    // 4. 检查引号匹配
    const singleQuoteCount = (content.match(/'/g) || []).length;
    const doubleQuoteCount = (content.match(/"/g) || []).length;
    if (singleQuoteCount % 2 !== 0) {
      errors.push(`单引号不匹配: 奇数个单引号`);
    }
    if (doubleQuoteCount % 2 !== 0) {
      errors.push(`双引号不匹配: 奇数个双引号`);
    }
    
    // 5. 检查未闭合的注释
    const openComments = content.match(/\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g);
    const commentLines = content.split('\n');
    let inComment = false;
    commentLines.forEach((line, index) => {
      if (line.includes('/*') && !line.includes('*/')) {
        inComment = true;
      }
      if (line.includes('*/') && inComment) {
        inComment = false;
      }
    });
    if (inComment) {
      errors.push(`存在未闭合的多行注释`);
    }
    
    // 6. 检查常见的语法错误模式
    const errorPatterns = [
      { pattern: /,\s*\}/g, description: '尾随逗号' },
      { pattern: /\{\s*\}/g, description: '空对象字面量' },
      { pattern: /\[\s*\]/g, description: '空数组字面量' },
      { pattern: /;\s*;/g, description: '连续分号' },
      { pattern: /\bconst\s+\w+\s*=\s*const\b/g, description: '重复const声明' },
      { pattern: /\blet\s+\w+\s*=\s*let\b/g, description: '重复let声明' },
      { pattern: /\bvar\s+\w+\s*=\s*var\b/g, description: '重复var声明' }
    ];
    
    errorPatterns.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        errors.push(`发现${description}: ${matches.length} 处`);
      }
    });
    
    // 7. 检查未定义的变量引用
    const variableReferences = content.match(/\b[A-Z_][A-Z0-9_]*\b/g) || [];
    const declaredVariables = [
      ...(content.match(/const\s+(\w+)/g) || []).map(m => m.replace('const ', '')),
      ...(content.match(/let\s+(\w+)/g) || []).map(m => m.replace('let ', '')),
      ...(content.match(/var\s+(\w+)/g) || []).map(m => m.replace('var ', '')),
      ...(content.match(/function\s+(\w+)/g) || []).map(m => m.replace('function ', ''))
    ];
    
    const globalVariables = ['console', 'process', 'require', 'module', 'exports', '__dirname', '__filename'];
    const undeclaredVariables = variableReferences.filter(v => 
      !declaredVariables.includes(v) && 
      !globalVariables.includes(v) && 
      /^[A-Z_]/.test(v) && // 只检查大写开头的变量（通常是常量）
      v.length > 2 // 忽略短变量名
    );
    
    if (undeclaredVariables.length > 0) {
      const uniqueUndeclared = [...new Set(undeclaredVariables)];
      errors.push(`可能未定义的变量: ${uniqueUndeclared.join(', ')}`);
    }
    
    if (errors.length === 0) {
      console.log(`  ✅ 语法检查通过`);
    } else {
      console.log(`  ❌ 发现 ${errors.length} 个语法问题:`);
      errors.forEach(error => console.log(`     - ${error}`));
      totalErrors += errors.length;
    }
    
  } catch (error) {
    console.log(`  ❌ 读取文件时出错: ${error.message}`);
    totalErrors++;
  }
  
  console.log('');
});

console.log(`📊 语法检查总结:`);
console.log(`   检查文件数: ${filesToCheck.length}`);
console.log(`   发现错误数: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('✅ 所有文件语法检查通过！');
} else {
  console.log('❌ 存在语法错误，需要修复！');
  process.exit(1);
}