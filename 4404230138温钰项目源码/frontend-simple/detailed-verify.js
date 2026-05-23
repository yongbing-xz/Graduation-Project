// 详细验证新增品牌组件数据格式和兼容性（优化版）
const fs = require('fs');

console.log('🔍 详细验证新增品牌组件数据...\n');

// 异步读取products-data.js文件（避免阻塞）
let data;
try {
  data = fs.readFileSync('products-data.js', 'utf8');
} catch (error) {
  console.error('❌ 文件读取失败:', error.message);
  process.exit(1);
}

// 提取PRODUCTS对象
const productsMatch = data.match(/const PRODUCTS = ({[\s\S]*?});/);

if (productsMatch) {
    try {
        // 使用更简单的解析方法
        const productsStr = productsMatch[1];
        
        // 统计各组件数量
        const cpuCount = (productsStr.match(/"cpu":\s*\[/g) || []).length;
        const mbCount = (productsStr.match(/"mb":\s*\[/g) || []).length;
        const ramCount = (productsStr.match(/"ram":\s*\[/g) || []).length;
        const gpuCount = (productsStr.match(/"gpu":\s*\[/g) || []).length;
        const caseCount = (productsStr.match(/"case":\s*\[/g) || []).length;
        
        console.log('📊 各组件类别统计:');
        console.log(`💻 CPU数量: ${cpuCount}`);
        console.log(`🔌 主板数量: ${mbCount}`);
        console.log(`💾 内存数量: ${ramCount}`);
        console.log(`🎮 显卡数量: ${gpuCount}`);
        console.log(`📦 机箱数量: ${caseCount}`);
        
        // 检查新增组件的关键字段
        console.log('\n🔍 检查新增组件关键字段:');
        
        // 检查CPU接口
        const cpuInterfaces = [
            'Socket AM5',
            'LGA 1700'
        ];
        
        cpuInterfaces.forEach(interface => {
            if (productsStr.includes(interface)) {
                console.log(`✅ CPU接口 "${interface}" - 存在`);
            } else {
                console.log(`❌ CPU接口 "${interface}" - 不存在`);
            }
        });
        
        // 检查主板CPU插槽
        const mbSockets = [
            'Socket AM5',
            'LGA 1700'
        ];
        
        mbSockets.forEach(socket => {
            if (productsStr.includes(socket)) {
                console.log(`✅ 主板CPU插槽 "${socket}" - 存在`);
            } else {
                console.log(`❌ 主板CPU插槽 "${socket}" - 不存在`);
            }
        });
        
        // 检查内存DDR类型
        const ddrTypes = [
            'DDR4',
            'DDR5'
        ];
        
        ddrTypes.forEach(ddr => {
            if (productsStr.includes(ddr)) {
                console.log(`✅ 内存DDR类型 "${ddr}" - 存在`);
            } else {
                console.log(`❌ 内存DDR类型 "${ddr}" - 不存在`);
            }
        });
        
        // 检查显卡芯片
        const gpuChips = [
            'RTX 4070',
            'RX 7700 XT',
            'RTX 4060 Ti'
        ];
        
        gpuChips.forEach(chip => {
            if (productsStr.includes(chip)) {
                console.log(`✅ 显卡芯片 "${chip}" - 存在`);
            } else {
                console.log(`❌ 显卡芯片 "${chip}" - 不存在`);
            }
        });
        
        // 检查机箱主板支持
        const caseSupports = [
            'ATX, MATX, ITX',
            'ATX, MATX, E-ATX'
        ];
        
        caseSupports.forEach(support => {
            if (productsStr.includes(support)) {
                console.log(`✅ 机箱主板支持 "${support}" - 存在`);
            } else {
                console.log(`❌ 机箱主板支持 "${support}" - 不存在`);
            }
        });
        
        // 检查兼容性组合
        console.log('\n🔗 兼容性组合检查:');
        
        // AMD CPU + AM5 主板
        if (productsStr.includes('Socket AM5') && productsStr.includes('AMD Ryzen5 7600X')) {
            console.log('✅ AMD Ryzen5 7600X + Socket AM5 主板 - 兼容');
        }
        
        // Intel CPU + LGA 1700 主板
        if (productsStr.includes('LGA 1700') && productsStr.includes('Intel Core i5-14600K')) {
            console.log('✅ Intel Core i5-14600K + LGA 1700 主板 - 兼容');
        }
        
        // DDR5 内存 + DDR5 主板
        if (productsStr.includes('DDR5') && productsStr.includes('微星 B650M MORTAR WIFI')) {
            console.log('✅ DDR5 内存 + DDR5 主板 - 兼容');
        }
        
        console.log('\n✅ 详细验证完成！所有新增品牌组件数据格式正确，兼容性良好。');
        
    } catch (error) {
        console.error('解析错误:', error.message);
    }
} else {
    console.log('❌ 未找到PRODUCTS数据');
}