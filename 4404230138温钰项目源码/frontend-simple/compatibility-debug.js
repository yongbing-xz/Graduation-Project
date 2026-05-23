// 深度兼容性检查调试脚本
console.log('🔍 开始深度兼容性检查分析...');

// 获取所有产品数据
const products = window.PRODUCTS;

// 分析CPU和主板兼容性
console.log('\n=== CPU与主板兼容性分析 ===');
const cpus = products.cpu;
const motherboards = products.mb;

console.log(`CPU数量: ${cpus.length}`);
console.log(`主板数量: ${motherboards.length}`);

// 检查CPU接口类型
const cpuSockets = [...new Set(cpus.map(cpu => cpu.接口))];
console.log('CPU接口类型:', cpuSockets);

// 检查主板CPU插槽类型
const mbSockets = [...new Set(motherboards.map(mb => mb.cpu接口))];
console.log('主板CPU插槽类型:', mbSockets);

// 检查兼容性匹配
console.log('\n=== 接口兼容性匹配检查 ===');
cpuSockets.forEach(socket => {
    const compatibleMBs = motherboards.filter(mb => mb.cpu接口 === socket);
    console.log(`CPU接口 ${socket}: 兼容主板数量 ${compatibleMBs.length}`);
    if (compatibleMBs.length === 0) {
        console.log(`  ⚠️ 警告: 没有主板支持 ${socket} 接口`);
    }
});

// 检查内存兼容性
console.log('\n=== 内存与主板兼容性分析 ===');
const rams = products.ram;
console.log(`内存数量: ${rams.length}`);

// 检查内存DDR类型
const ramDDRTypes = [...new Set(rams.map(ram => ram.DDR代数 || ram.ddr代数))];
console.log('内存DDR类型:', ramDDRTypes);

// 检查主板支持的内存类型
const mbDDRTypes = [...new Set(motherboards.map(mb => mb.ddr代数 || mb.DDR代数))];
console.log('主板支持的内存类型:', mbDDRTypes);

// 检查DDR兼容性匹配
console.log('\n=== DDR兼容性匹配检查 ===');
ramDDRTypes.forEach(ddrType => {
    const compatibleMBs = motherboards.filter(mb => {
        const mbDDR = mb.ddr代数 || mb.DDR代数;
        return mbDDR === ddrType;
    });
    console.log(`内存DDR ${ddrType}: 兼容主板数量 ${compatibleMBs.length}`);
    if (compatibleMBs.length === 0) {
        console.log(`  ⚠️ 警告: 没有主板支持 ${ddrType} 内存`);
    }
});

// 检查数据完整性
console.log('\n=== 数据完整性检查 ===');

// 检查CPU数据完整性
cpus.forEach((cpu, index) => {
    if (!cpu.接口) {
        console.log(`⚠️ CPU ${index}: ${cpu.标题} - 缺少接口信息`);
    }
});

// 检查主板数据完整性
motherboards.forEach((mb, index) => {
    if (!mb.cpu接口) {
        console.log(`⚠️ 主板 ${index}: ${mb.标题} - 缺少CPU插槽信息`);
    }
    if (!mb.ddr代数 && !mb.DDR代数) {
        console.log(`⚠️ 主板 ${index}: ${mb.标题} - 缺少内存支持信息`);
    }
});

// 检查内存数据完整性
rams.forEach((ram, index) => {
    if (!ram.DDR代数 && !ram.ddr代数) {
        console.log(`⚠️ 内存 ${index}: ${ram.标题} - 缺少DDR代数信息`);
    }
});

// 测试具体兼容性检查逻辑
console.log('\n=== 具体兼容性测试 ===');

// 测试一个具体的CPU和主板组合
const testCPU = cpus[0]; // AMD Ryzen5 9600X (Socket AM5)
const testMB = motherboards.find(mb => mb.cpu接口 === 'Socket AM5');

if (testCPU && testMB) {
    console.log(`测试组合: ${testCPU.标题} + ${testMB.标题}`);
    console.log(`CPU接口: ${testCPU.接口}`);
    console.log(`主板插槽: ${testMB.cpu接口}`);
    console.log(`兼容性: ${testCPU.接口 === testMB.cpu接口 ? '✅ 兼容' : '❌ 不兼容'}`);
} else {
    console.log('⚠️ 无法找到合适的测试组合');
}

// 检查所有可能的组合
console.log('\n=== 所有CPU-主板组合兼容性统计 ===');
let compatibleCount = 0;
let incompatibleCount = 0;

cpus.forEach(cpu => {
    motherboards.forEach(mb => {
        if (cpu.接口 === mb.cpu接口) {
            compatibleCount++;
        } else {
            incompatibleCount++;
        }
    });
});

console.log(`兼容组合: ${compatibleCount}`);
console.log(`不兼容组合: ${incompatibleCount}`);
console.log(`兼容率: ${((compatibleCount / (compatibleCount + incompatibleCount)) * 100).toFixed(2)}%`);

console.log('\n🔍 兼容性分析完成！');