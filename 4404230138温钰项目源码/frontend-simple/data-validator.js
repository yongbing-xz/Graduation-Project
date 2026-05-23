// 数据完整性验证脚本（优化版）
const fs = require('fs');

console.log('🔍 开始数据完整性验证...\n');

// 异步读取products-data.js文件（避免阻塞）
let productsData;
try {
  productsData = fs.readFileSync('products-data.js', 'utf8');
} catch (error) {
  console.error('❌ 文件读取失败:', error.message);
  process.exit(1);
}

// 提取PRODUCTS对象
const productsMatch = productsData.match(/const PRODUCTS = ({[\s\S]*?});/);

if (!productsMatch) {
  console.log('❌ 未找到PRODUCTS数据');
  process.exit(1);
}

// 修复JSON格式并解析
const productsStr = productsMatch[1];
const fixedProductsStr = productsStr
  .replace(/(\w+):/g, '"$1":')
  .replace(/'/g, '"')
  .replace(/,\s*}/g, '}');

try {
  const products = JSON.parse(fixedProductsStr);
  
  console.log('=== 数据完整性检查报告 ===\n');
  
  let totalIssues = 0;
  
  // 检查CPU数据
  console.log('📊 CPU数据检查:');
  const cpus = products.cpu || [];
  cpus.forEach((cpu, index) => {
    let cpuIssues = [];
    
    if (!cpu.标题) cpuIssues.push('缺少标题');
    if (!cpu.接口 && !cpu.cpu接口) cpuIssues.push('缺少接口信息');
    if (!cpu.价格) cpuIssues.push('缺少价格');
    
    if (cpuIssues.length > 0) {
      console.log(`  ❌ CPU${index + 1}: ${cpu.标题 || '未知'} - ${cpuIssues.join(', ')}`);
      totalIssues++;
    }
  });
  console.log(`  ✅ CPU检查完成，发现${cpus.filter(cpu => !cpu.接口 && !cpu.cpu接口).length}个接口问题\n`);
  
  // 检查主板数据
  console.log('📊 主板数据检查:');
  const motherboards = products.mb || [];
  motherboards.forEach((mb, index) => {
    let mbIssues = [];
    
    if (!mb.标题) mbIssues.push('缺少标题');
    if (!mb.cpu接口) mbIssues.push('缺少CPU插槽信息');
    if (!mb.ddr代数 && !mb.DDR代数) mbIssues.push('缺少内存支持信息');
    if (!mb.板型) mbIssues.push('缺少板型信息');
    
    if (mbIssues.length > 0) {
      console.log(`  ❌ 主板${index + 1}: ${mb.标题 || '未知'} - ${mbIssues.join(', ')}`);
      totalIssues++;
    }
  });
  console.log(`  ✅ 主板检查完成，发现${motherboards.filter(mb => !mb.cpu接口).length}个CPU插槽问题\n`);
  
  // 检查内存数据
  console.log('📊 内存数据检查:');
  const rams = products.ram || [];
  rams.forEach((ram, index) => {
    let ramIssues = [];
    
    if (!ram.标题) ramIssues.push('缺少标题');
    if (!ram.DDR代数 && !ram.ddr代数) ramIssues.push('缺少DDR代数信息');
    if (!ram.容量) ramIssues.push('缺少容量信息');
    
    if (ramIssues.length > 0) {
      console.log(`  ❌ 内存${index + 1}: ${ram.标题 || '未知'} - ${ramIssues.join(', ')}`);
      totalIssues++;
    }
  });
  console.log(`  ✅ 内存检查完成，发现${rams.filter(ram => !ram.DDR代数 && !ram.ddr代数).length}个DDR代数问题\n`);
  
  // 检查GPU数据
  console.log('📊 GPU数据检查:');
  const gpus = products.gpu || [];
  gpus.forEach((gpu, index) => {
    let gpuIssues = [];
    
    if (!gpu.标题) gpuIssues.push('缺少标题');
    if (!gpu.长度) gpuIssues.push('缺少长度信息');
    if (!gpu.显存) gpuIssues.push('缺少显存信息');
    
    if (gpuIssues.length > 0) {
      console.log(`  ❌ GPU${index + 1}: ${gpu.标题 || '未知'} - ${gpuIssues.join(', ')}`);
      totalIssues++;
    }
  });
  console.log(`  ✅ GPU检查完成，发现${gpus.filter(gpu => !gpu.长度).length}个长度问题\n`);
  
  // 检查机箱数据
  console.log('📊 机箱数据检查:');
  const cases = products.case || [];
  cases.forEach((caseItem, index) => {
    let caseIssues = [];
    
    if (!caseItem.标题) caseIssues.push('缺少标题');
    if (!caseItem.主板支持) caseIssues.push('缺少主板支持信息');
    if (!caseItem.显卡限长) caseIssues.push('缺少显卡限长信息');
    
    if (caseIssues.length > 0) {
      console.log(`  ❌ 机箱${index + 1}: ${caseItem.标题 || '未知'} - ${caseIssues.join(', ')}`);
      totalIssues++;
    }
  });
  console.log(`  ✅ 机箱检查完成，发现${cases.filter(caseItem => !caseItem.主板支持).length}个主板支持问题\n`);
  
  // 兼容性统计
  console.log('=== 兼容性统计 ===\n');
  
  // CPU-主板兼容性（优化大数据集处理）
  let cpuMbCompatible = 0;
  let cpuMbIncompatible = 0;
  
  // 优化：限制测试数量，避免性能问题
  const maxTestPerCategory = 20;
  const testCpus = cpus.slice(0, Math.min(cpus.length, maxTestPerCategory));
  const testMotherboards = motherboards.slice(0, Math.min(motherboards.length, maxTestPerCategory));
  
  testCpus.forEach(cpu => {
    testMotherboards.forEach(mb => {
      const cpuInterface = cpu.接口 || cpu.cpu接口;
      const mbSocket = mb.cpu接口;
      
      if (cpuInterface && mbSocket && cpuInterface === mbSocket) {
        cpuMbCompatible++;
      } else {
        cpuMbIncompatible++;
      }
    });
  });
  
  console.log(`CPU-主板兼容性:`);
  console.log(`  兼容组合: ${cpuMbCompatible}`);
  console.log(`  不兼容组合: ${cpuMbIncompatible}`);
  console.log(`  兼容率: ${((cpuMbCompatible / (cpuMbCompatible + cpuMbIncompatible)) * 100).toFixed(1)}%\n`);
  
  // 内存-主板兼容性（优化大数据集处理）
  let ramMbCompatible = 0;
  let ramMbIncompatible = 0;
  
  // 优化：限制测试数量，避免性能问题
  const testRams = rams.slice(0, Math.min(rams.length, maxTestPerCategory));
  
  testRams.forEach(ram => {
    testMotherboards.forEach(mb => {
      const ramDDR = ram.DDR代数 || ram.ddr代数;
      const mbDDR = mb.ddr代数 || mb.DDR代数;
      
      if (ramDDR && mbDDR && ramDDR === mbDDR) {
        ramMbCompatible++;
      } else {
        ramMbIncompatible++;
      }
    });
  });
  
  console.log(`内存-主板兼容性:`);
  console.log(`  兼容组合: ${ramMbCompatible}`);
  console.log(`  不兼容组合: ${ramMbIncompatible}`);
  console.log(`  兼容率: ${((ramMbCompatible / (ramMbCompatible + ramMbIncompatible)) * 100).toFixed(1)}%\n`);
  
  console.log('=== 总结 ===\n');
  console.log(`📈 数据完整性:`);
  console.log(`  总产品数量: ${cpus.length + motherboards.length + rams.length + gpus.length + cases.length}`);
  console.log(`  发现的问题数量: ${totalIssues}`);
  console.log(`  数据完整度: ${((1 - totalIssues / (cpus.length + motherboards.length + rams.length + gpus.length + cases.length)) * 100).toFixed(1)}%\n`);
  
  console.log(`🔧 建议修复:`);
  if (totalIssues > 0) {
    console.log(`  1. 修复缺失的关键字段（接口、CPU插槽、DDR代数等）`);
    console.log(`  2. 统一字段命名规范`);
    console.log(`  3. 添加数据验证机制`);
  } else {
    console.log(`  ✅ 数据完整性良好，无需修复`);
  }
  
} catch (error) {
  console.error('解析错误:', error.message);
}