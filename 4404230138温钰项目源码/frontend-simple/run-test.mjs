// ES module test runner with improved output handling
import ComponentSelectionTest from './tests/test-cases/core/component-selection.test.js';

async function runTests() {
  try {
    const test = new ComponentSelectionTest();
    const result = await test.run();
    
    console.log('\n🏁 测试完成!');
    console.log('测试名称:', result.name);
    console.log('测试描述:', result.description);
    console.log('测试结果:', result.passed ? '✅ 通过' : '❌ 失败');
    console.log('测试时长:', result.duration + 'ms');
    
    if (!result.passed) {
      console.log('失败原因:', result.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    console.error('错误栈:', error.stack);
    process.exit(1);
  }
}

console.log('正在加载测试...');
runTests();
