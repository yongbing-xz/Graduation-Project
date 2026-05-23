const fs = require('fs');

// 读取components.json文件
function loadComponentsData() {
    try {
        const data = fs.readFileSync('./components.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ 读取components.json文件失败:', error.message);
        throw error;
    }
}

// 生成SQL插入语句
function generateSQLInserts(componentsData) {
    let sqlContent = `-- components.json 数据导入SQL脚本
-- 生成时间: ${new Date().toISOString()}
-- 数据版本: ${componentsData.metadata.version}
-- 总组件数: ${componentsData.metadata.componentCount.total}

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 清空现有数据
TRUNCATE TABLE case_specs;
TRUNCATE TABLE nvme_specs;
TRUNCATE TABLE ram_specs;
TRUNCATE TABLE gpu_specs;
TRUNCATE TABLE mb_specs;
TRUNCATE TABLE cpu_specs;
TRUNCATE TABLE components;
TRUNCATE TABLE brands;

-- 导入品牌数据
`;

    // 生成品牌数据
    const brands = new Set();
    Object.keys(componentsData.components).forEach(category => {
        componentsData.components[category].forEach(component => {
            if (component.brand) {
                brands.add(`${category},${component.brand}`);
            }
        });
    });

    brands.forEach(brandInfo => {
        const [category, brandName] = brandInfo.split(',');
        sqlContent += `INSERT INTO brands (category, brand_name) VALUES ('${category}', '${brandName.replace(/'/g, "''")}');\n`;
    });

    sqlContent += '\n-- 导入组件主表数据\n';

    // 生成组件主表数据
    let totalComponents = 0;
    Object.keys(componentsData.components).forEach(category => {
        componentsData.components[category].forEach(component => {
            const specsJson = JSON.stringify(component.specs).replace(/'/g, "''");
            sqlContent += `INSERT INTO components (id, category, brand, title, specs) VALUES ('${component.id}', '${category}', '${component.brand.replace(/'/g, "''")}', '${component.title.replace(/'/g, "''")}', '${specsJson}');\n`;
            totalComponents++;
        });
    });

    sqlContent += '\n-- 导入CPU规格数据\n';
    
    // 生成CPU规格数据
    if (componentsData.components.cpu) {
        componentsData.components.cpu.forEach(component => {
            const specs = component.specs;
            sqlContent += `INSERT INTO cpu_specs (component_id, name, cores, threads, series, process, socket, has_fan, has_igpu, base_freq, boost_freq, cache, tdp, price, rating, stock) VALUES ('${component.id}', '${(specs.name || '').replace(/'/g, "''")}', '${specs.cores || ''}', '${specs.threads || ''}', '${(specs.series || '').replace(/'/g, "''")}', '${(specs.process || '').replace(/'/g, "''")}', '${(specs.socket || '').replace(/'/g, "''")}', '${specs.hasFan || ''}', '${specs.hasIGPU || ''}', '${specs.baseFreq || ''}', '${specs.boostFreq || ''}', '${specs.cache || ''}', '${specs.tdp || ''}', '${specs.price || ''}', '${specs.rating || 0}', '${specs.stock || ''}');\n`;
        });
    }

    sqlContent += '\n-- 导入主板规格数据\n';
    
    // 生成主板规格数据
    if (componentsData.components.mb) {
        componentsData.components.mb.forEach(component => {
            const specs = component.specs;
            const cpuSocket = specs.cpu接口 || specs.cpuSocket || '';
            const ddrGen = specs.ddrGen || specs.ddr代数 || '';
            const formFactor = specs.formFactor || specs.板型 || '';
            const memSlots = specs.memSlots || specs.内存插槽数 || '';
            const m2Slots = specs.m2Slots || specs.m2插槽数 || '';
            const powerPhase = specs.powerPhase || specs.供电相数 || '';
            
            sqlContent += `INSERT INTO mb_specs (component_id, name, cpu_socket, form_factor, ddr_gen, mem_slots, m2_slots, pcie, chipset, wifi, rgb, power_phase, price, rating, stock) VALUES ('${component.id}', '${(specs.name || '').replace(/'/g, "''")}', '${cpuSocket.replace(/'/g, "''")}', '${formFactor.replace(/'/g, "''")}', '${ddrGen.replace(/'/g, "''")}', '${memSlots}', '${m2Slots}', '${(specs.pcie || '').replace(/'/g, "''")}', '${(specs.chipset || '').replace(/'/g, "''")}', '${specs.wifi || ''}', '${specs.rgb || ''}', '${powerPhase}', '${specs.price || ''}', '${specs.rating || 0}', '${specs.stock || ''}');\n`;
        });
    }

    sqlContent += '\n-- 导入显卡规格数据\n';
    
    // 生成显卡规格数据
    if (componentsData.components.gpu) {
        componentsData.components.gpu.forEach(component => {
            const specs = component.specs;
            sqlContent += `INSERT INTO gpu_specs (component_id, vram, vram_type, vram_bit_width, interface, model, chip, fans, rgb, power_connector, series, power_recommendation, length, price, rating, stock) VALUES ('${component.id}', '${specs.vram || ''}', '${(specs.vramType || '').replace(/'/g, "''")}', '${specs.vramBitWidth || ''}', '${(specs.interface || '').replace(/'/g, "''")}', '${(specs.model || '').replace(/'/g, "''")}', '${(specs.chip || '').replace(/'/g, "''")}', '${specs.fans || ''}', '${specs.rgb || ''}', '${(specs.powerConnector || '').replace(/'/g, "''")}', '${(specs.series || '').replace(/'/g, "''")}', '${specs.powerRecommendation || ''}', '${specs.length || ''}', '${specs.price || ''}', '${specs.rating || 0}', '${specs.stock || ''}');\n`;
        });
    }

    sqlContent += '\n-- 导入内存规格数据\n';
    
    // 生成内存规格数据
    if (componentsData.components.ram) {
        componentsData.components.ram.forEach(component => {
            const specs = component.specs;
            const ddrGen = specs.ddrGen || specs.ddr代数 || '';
            const speed = specs.speed || specs.frequency || '';
            
            sqlContent += `INSERT INTO ram_specs (component_id, capacity, speed, ddr_gen, timing, voltage, rgb, price, rating, stock) VALUES ('${component.id}', '${specs.capacity || ''}', '${speed}', '${ddrGen.replace(/'/g, "''")}', '${(specs.timing || specs.timings || '').replace(/'/g, "''")}', '${specs.voltage || ''}', '${specs.rgb || ''}', '${specs.price || ''}', '${specs.rating || 0}', '${specs.stock || ''}');\n`;
        });
    }

    sqlContent += '\n-- 导入NVMe固态硬盘规格数据\n';
    
    // 生成NVMe规格数据
    if (componentsData.components.nvme) {
        componentsData.components.nvme.forEach(component => {
            const specs = component.specs;
            sqlContent += `INSERT INTO nvme_specs (component_id, capacity, interface, read_speed, write_speed, tbw, form_factor, cache, price, rating, stock) VALUES ('${component.id}', '${specs.capacity || ''}', '${(specs.interface || '').replace(/'/g, "''")}', '${specs.readSpeed || ''}', '${specs.writeSpeed || ''}', '${specs.tbw || ''}', '${(specs.formFactor || '').replace(/'/g, "''")}', '${specs.cache || ''}', '${specs.price || ''}', '${specs.rating || 0}', '${specs.stock || ''}');\n`;
        });
    }

    sqlContent += '\n-- 导入机箱规格数据\n';
    
    // 生成机箱规格数据
    if (componentsData.components.case) {
        componentsData.components.case.forEach(component => {
            const specs = component.specs;
            const mbSupport = specs.motherboardSupport || specs.主板支持 || '';
            
            sqlContent += `INSERT INTO case_specs (component_id, form_factor, motherboard_support, gpu_length, cpu_cooler_height, psu_support, fan_slots, rgb, price, rating, stock) VALUES ('${component.id}', '${(specs.formFactor || '').replace(/'/g, "''")}', '${mbSupport.replace(/'/g, "''")}', '${specs.gpuLength || ''}', '${specs.cpuCoolerHeight || ''}', '${(specs.psuSupport || '').replace(/'/g, "''")}', '${specs.fanSlots || ''}', '${specs.rgb || ''}', '${specs.price || ''}', '${specs.rating || 0}', '${specs.stock || ''}');\n`;
        });
    }

    sqlContent += '\n-- 记录导入日志\n';
    const counts = componentsData.metadata.componentCount;
    sqlContent += `INSERT INTO import_logs (import_date, total_components, cpu_count, mb_count, gpu_count, ram_count, nvme_count, case_count, import_status, error_message) VALUES (CURDATE(), ${totalComponents}, ${counts.cpu}, ${counts.mb}, ${counts.gpu}, ${counts.ram}, ${counts.nvme}, ${counts.case}, 'success', NULL);\n`;

    sqlContent += '\n-- 重新启用外键检查\nSET FOREIGN_KEY_CHECKS = 1;\n';

    sqlContent += `\n-- 导入完成统计\n-- 总组件数: ${totalComponents}\n-- CPU: ${counts.cpu}\n-- 主板: ${counts.mb}\n-- 显卡: ${counts.gpu}\n-- 内存: ${counts.ram}\n-- NVMe: ${counts.nvme}\n-- 机箱: ${counts.case}\n`;

    return sqlContent;
}

// 主函数
function main() {
    try {
        console.log('🚀 开始生成MySQL插入脚本...\n');
        
        // 1. 加载数据
        const componentsData = loadComponentsData();
        console.log('📄 数据文件加载成功');
        console.log(`   版本: ${componentsData.metadata.version}`);
        console.log(`   更新时间: ${componentsData.metadata.lastUpdated}`);
        console.log(`   总组件数: ${componentsData.metadata.componentCount.total}\n`);
        
        // 2. 生成SQL插入语句
        const sqlContent = generateSQLInserts(componentsData);
        
        // 3. 写入文件
        const outputFile = './components_mysql_inserts.sql';
        fs.writeFileSync(outputFile, sqlContent, 'utf8');
        
        console.log(`✅ SQL插入脚本已生成: ${outputFile}`);
        console.log('📋 使用方法:');
        console.log('   1. 确保MySQL数据库已创建 (hardware_compatibility_db)');
        console.log('   2. 运行 components_mysql_backup.sql 创建表结构');
        console.log('   3. 运行 components_mysql_inserts.sql 导入数据');
        console.log('   4. 验证数据完整性');
        
    } catch (error) {
        console.error('❌ 生成SQL脚本失败:', error.message);
        process.exit(1);
    }
}

// 执行主函数
if (require.main === module) {
    main();
}

module.exports = { generateSQLInserts };