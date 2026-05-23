/**
 * 硬件兼容性检测平台 - Vue应用入口文件
 * 此文件作为Vue应用的JavaScript模块入口
 */

console.log('🔧 硬件兼容性检测平台应用已加载');

// 导出应用配置信息
export const appConfig = {
  name: '硬件兼容性检测平台',
  version: '1.0.0',
  description: '专业的硬件兼容性检测工具',
  author: '系统开发团队'
};

// 导出应用初始化函数
export function initializeApp() {
  console.log('🚀 初始化硬件兼容性检测平台...');
  
  // 检查必要的全局变量
  if (typeof Vue === 'undefined') {
    console.error('❌ Vue.js未加载，请检查CDN链接');
    return false;
  }
  
  if (typeof PRODUCTS === 'undefined') {
    console.error('❌ 产品数据未加载，请检查products-data.js');
    return false;
  }
  
  console.log('✅ 应用初始化完成');
  return true;
}

// 导出兼容性检查函数
export function checkCompatibility(selectedComponents) {
  if (!selectedComponents || Object.keys(selectedComponents).length === 0) {
    return {
      passed: false,
      message: '未选择任何组件',
      details: []
    };
  }
  
  const results = [];
  
  // CPU与主板兼容性检查
  if (selectedComponents.cpu && selectedComponents.mb) {
    const cpuSocket = selectedComponents.cpu.接口;
    const mbSocket = selectedComponents.mb.cpu接口;
    
    if (cpuSocket && mbSocket && cpuSocket === mbSocket) {
      results.push({
        level: 'ok',
        title: 'CPU与主板兼容',
        detail: '接口匹配良好'
      });
    } else {
      results.push({
        level: 'err',
        title: 'CPU与主板不兼容',
        detail: `CPU接口(${cpuSocket})与主板CPU插槽(${mbSocket})不匹配`
      });
    }
  }
  
  // 内存与主板兼容性检查
  if (selectedComponents.ram && selectedComponents.mb) {
    const ramDDR = selectedComponents.ram.DDR代数 || selectedComponents.ram.ddr代数;
    const mbDDR = selectedComponents.mb.ddr代数 || selectedComponents.mb.DDR代数;
    
    if (ramDDR && mbDDR && ramDDR === mbDDR) {
      results.push({
        level: 'ok',
        title: '内存与主板兼容',
        detail: '内存类型匹配'
      });
    } else {
      results.push({
        level: 'err',
        title: '内存与主板不兼容',
        detail: `内存类型(${ramDDR})与主板支持的内存类型(${mbDDR})不匹配`
      });
    }
  }
  
  return {
    passed: results.every(r => r.level === 'ok'),
    message: results.length > 0 ? '兼容性检查完成' : '无兼容性检查结果',
    details: results
  };
}

// 默认导出
export default {
  appConfig,
  initializeApp,
  checkCompatibility
};

console.log('✅ app.js模块加载完成');