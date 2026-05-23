// 精确语法检查脚本 - 使用Node.js语法检查器
const fs = require('fs');
const path = require('path');

console.log('🔍 开始精确语法检查...\n');

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
    // 使用Node.js的语法检查功能
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 尝试解析JavaScript语法
    try {
      // 使用eval来检查语法（在安全沙箱中）
      const checkSyntax = new Function(content);
      console.log(`  ✅ 语法检查通过`);
    } catch (syntaxError) {
      console.log(`  ❌ 语法错误: ${syntaxError.message}`);
      
      // 提取错误位置信息
      const errorLines = syntaxError.message.match(/\d+:\d+/g);
      if (errorLines) {
        console.log(`     错误位置: ${errorLines[0]}`);
      }
      
      // 显示错误附近的代码
      const lines = content.split('\n');
      const errorLineMatch = syntaxError.message.match(/:(\d+):/);
      if (errorLineMatch) {
        const errorLineNum = parseInt(errorLineMatch[1]);
        const startLine = Math.max(1, errorLineNum - 3);
        const endLine = Math.min(lines.length, errorLineNum + 3);
        
        console.log(`     错误上下文:`);
        for (let i = startLine; i <= endLine; i++) {
          const prefix = i === errorLineNum ? '>>> ' : '    ';
          console.log(`     ${prefix}${i}: ${lines[i-1]}`);
        }
      }
      
      totalErrors++;
    }
    
  } catch (error) {
    console.log(`  ❌ 读取文件时出错: ${error.message}`);
    totalErrors++;
  }
  
  console.log('');
});

console.log(`📊 精确语法检查总结:`);
console.log(`   检查文件数: ${filesToCheck.length}`);
console.log(`   发现错误数: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('✅ 所有文件语法检查通过！');
} else {
  console.log('❌ 存在语法错误，需要修复！');
  process.exit(1);
}