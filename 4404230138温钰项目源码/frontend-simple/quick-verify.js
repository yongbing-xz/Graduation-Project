// 快速验证新增品牌组件数据
const fs = require('fs');

console.log('🔍 快速验证新增品牌组件数据...\n');

// 读取products-data.js文件
const data = fs.readFileSync('products-data.js', 'utf8');

// 检查新增的组件ID是否存在
const checkIds = [
    'cpu-amd-ryzen5-7600x',
    'cpu-intel-core-i5-14600k', 
    'cpu-amd-ryzen7-7700x',
    'mb-msi-b650m-mortar-wifi',
    'mb-asus-rog-strix-b760-f-gaming',
    'mb-gigabyte-z790-aorus-elite-ax',
    'ram-kingston-fury-beast-32gb',
    'ram-corsair-vengeance-16gb',
    'ram-gskill-trident-z5-64gb',
    'gpu-asus-tuf-rtx4070-12gb',
    'gpu-sapphire-pulse-rx7700xt-12gb',
    'gpu-gigabyte-gaming-oc-rtx4060ti-8gb',
    'case-nzxt-h5-flow',
    'case-lian-li-lancool-216',
    'case-corsair-4000d-airflow'
];

console.log('📋 检查新增组件ID:');
let foundCount = 0;
checkIds.forEach(id => {
    if (data.includes(id)) {
        console.log(`✅ ${id} - 存在`);
        foundCount++;
    } else {
        console.log(`❌ ${id} - 不存在`);
    }
});

console.log(`\n📊 统计结果: ${foundCount}/${checkIds.length} 个新增组件已成功添加`);

// 检查ADDITIONAL_PRODUCTS常量是否存在
if (data.includes('ADDITIONAL_PRODUCTS')) {
    console.log('✅ ADDITIONAL_PRODUCTS 常量已定义');
} else {
    console.log('❌ ADDITIONAL_PRODUCTS 常量未定义');
}

// 检查合并逻辑是否存在
if (data.includes('Object.keys(ADDITIONAL_PRODUCTS).forEach')) {
    console.log('✅ 数据合并逻辑已添加');
} else {
    console.log('❌ 数据合并逻辑未添加');
}

console.log('\n✅ 快速验证完成！');