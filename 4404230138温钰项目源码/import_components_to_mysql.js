const fs = require('fs');
const mysql = require('mysql2/promise');

// 配置MySQL连接
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password', // 请根据实际情况修改
    database: 'hardware_compatibility_db'
};

// 读取components.json文件
async function loadComponentsData() {
    try {
        const data = fs.readFileSync('./frontend-simple/components.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ 读取components.json文件失败:', error.message);
        throw error;
    }
}

// 创建数据库连接
async function createConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ MySQL数据库连接成功');
        return connection;
    } catch (error) {
        console.error('❌ MySQL数据库连接失败:', error.message);
        throw error;
    }
}

// 清空现有数据（可选）
async function clearExistingData(connection) {
    try {
        console.log('🗑️  清空现有数据...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = ['case_specs', 'nvme_specs', 'ram_specs', 'gpu_specs', 'mb_specs', 'cpu_specs', 'components', 'brands'];
        
        for (const table of tables) {
            await connection.execute(`TRUNCATE TABLE ${table}`);
            console.log(`  已清空表: ${table}`);
        }
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ 数据清空完成');
    } catch (error) {
        console.error('❌ 清空数据失败:', error.message);
        throw error;
    }
}

// 导入品牌数据
async function importBrands(connection, componentsData) {
    try {
        console.log('🏷️  导入品牌数据...');
        
        const brands = new Set();
        
        // 收集所有品牌
        Object.keys(componentsData.components).forEach(category => {
            componentsData.components[category].forEach(component => {
                if (component.brand) {
                    brands.add(`${category},${component.brand}`);
                }
            });
        });
        
        // 插入品牌数据
        for (const brandInfo of brands) {
            const [category, brandName] = brandInfo.split(',');
            await connection.execute(
                'INSERT INTO brands (category, brand_name) VALUES (?, ?)',
                [category, brandName]
            );
        }
        
        console.log(`✅ 品牌数据导入完成，共导入 ${brands.size} 个品牌`);
    } catch (error) {
        console.error('❌ 品牌数据导入失败:', error.message);
        throw error;
    }
}

// 导入组件主表数据
async function importComponents(connection, componentsData) {
    try {
        console.log('📦 导入组件主表数据...');
        
        let totalComponents = 0;
        
        for (const category of Object.keys(componentsData.components)) {
            const components = componentsData.components[category];
            
            for (const component of components) {
                await connection.execute(
                    'INSERT INTO components (id, category, brand, title, specs) VALUES (?, ?, ?, ?, ?)',
                    [component.id, category, component.brand, component.title, JSON.stringify(component.specs)]
                );
                
                // 根据类别导入详细规格
                await importComponentSpecs(connection, category, component);
            }
            
            console.log(`  ${category.toUpperCase()}: ${components.length} 个组件`);
            totalComponents += components.length;
        }
        
        console.log(`✅ 组件数据导入完成，共导入 ${totalComponents} 个组件`);
        return totalComponents;
    } catch (error) {
        console.error('❌ 组件数据导入失败:', error.message);
        throw error;
    }
}

// 导入组件详细规格
async function importComponentSpecs(connection, category, component) {
    try {
        const specs = component.specs;
        
        switch (category) {
            case 'cpu':
                await connection.execute(`
                    INSERT INTO cpu_specs (
                        component_id, name, cores, threads, series, process, socket, 
                        has_fan, has_igpu, base_freq, boost_freq, cache, tdp, price, rating, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    component.id,
                    specs.name || '',
                    specs.cores || '',
                    specs.threads || '',
                    specs.series || '',
                    specs.process || '',
                    specs.socket || '',
                    specs.hasFan || '',
                    specs.hasIGPU || '',
                    specs.baseFreq || '',
                    specs.boostFreq || '',
                    specs.cache || '',
                    specs.tdp || '',
                    specs.price || '',
                    specs.rating || 0,
                    specs.stock || ''
                ]);
                break;
                
            case 'mb':
                await connection.execute(`
                    INSERT INTO mb_specs (
                        component_id, name, cpu_socket, form_factor, ddr_gen, mem_slots, 
                        m2_slots, pcie, chipset, wifi, rgb, power_phase, price, rating, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    component.id,
                    specs.name || '',
                    specs.cpu接口 || specs.cpuSocket || '',
                    specs.formFactor || specs.板型 || '',
                    specs.ddrGen || specs.ddr代数 || '',
                    specs.memSlots || specs.内存插槽数 || '',
                    specs.m2Slots || specs.m2插槽数 || '',
                    specs.pcie || '',
                    specs.chipset || '',
                    specs.wifi || '',
                    specs.rgb || '',
                    specs.powerPhase || specs.供电相数 || '',
                    specs.price || '',
                    specs.rating || 0,
                    specs.stock || ''
                ]);
                break;
                
            case 'gpu':
                await connection.execute(`
                    INSERT INTO gpu_specs (
                        component_id, vram, vram_type, vram_bit_width, interface, model, chip, 
                        fans, rgb, power_connector, series, power_recommendation, length, price, rating, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    component.id,
                    specs.vram || '',
                    specs.vramType || '',
                    specs.vramBitWidth || '',
                    specs.interface || '',
                    specs.model || '',
                    specs.chip || '',
                    specs.fans || '',
                    specs.rgb || '',
                    specs.powerConnector || '',
                    specs.series || '',
                    specs.powerRecommendation || '',
                    specs.length || '',
                    specs.price || '',
                    specs.rating || 0,
                    specs.stock || ''
                ]);
                break;
                
            case 'ram':
                await connection.execute(`
                    INSERT INTO ram_specs (
                        component_id, capacity, speed, ddr_gen, timing, voltage, rgb, price, rating, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    component.id,
                    specs.capacity || '',
                    specs.speed || specs.frequency || '',
                    specs.ddrGen || specs.ddr代数 || '',
                    specs.timing || specs.timings || '',
                    specs.voltage || '',
                    specs.rgb || '',
                    specs.price || '',
                    specs.rating || 0,
                    specs.stock || ''
                ]);
                break;
                
            case 'nvme':
                await connection.execute(`
                    INSERT INTO nvme_specs (
                        component_id, capacity, interface, read_speed, write_speed, tbw, 
                        form_factor, cache, price, rating, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    component.id,
                    specs.capacity || '',
                    specs.interface || '',
                    specs.readSpeed || '',
                    specs.writeSpeed || '',
                    specs.tbw || '',
                    specs.formFactor || '',
                    specs.cache || '',
                    specs.price || '',
                    specs.rating || 0,
                    specs.stock || ''
                ]);
                break;
                
            case 'case':
                await connection.execute(`
                    INSERT INTO case_specs (
                        component_id, form_factor, motherboard_support, gpu_length, cpu_cooler_height, 
                        psu_support, fan_slots, rgb, price, rating, stock
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    component.id,
                    specs.formFactor || '',
                    specs.motherboardSupport || specs.主板支持 || '',
                    specs.gpuLength || '',
                    specs.cpuCoolerHeight || '',
                    specs.psuSupport || '',
                    specs.fanSlots || '',
                    specs.rgb || '',
                    specs.price || '',
                    specs.rating || 0,
                    specs.stock || ''
                ]);
                break;
        }
    } catch (error) {
        console.error(`❌ ${category}规格数据导入失败 (${component.id}):`, error.message);
        throw error;
    }
}

// 记录导入日志
async function logImport(connection, totalComponents, status = 'success', errorMessage = null) {
    try {
        const componentsData = await loadComponentsData();
        const counts = componentsData.metadata.componentCount;
        
        await connection.execute(`
            INSERT INTO import_logs (
                import_date, total_components, cpu_count, mb_count, gpu_count, 
                ram_count, nvme_count, case_count, import_status, error_message
            ) VALUES (CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            totalComponents,
            counts.cpu,
            counts.mb,
            counts.gpu,
            counts.ram,
            counts.nvme,
            counts.case,
            status,
            errorMessage
        ]);
        
        console.log('📊 导入日志记录完成');
    } catch (error) {
        console.error('❌ 导入日志记录失败:', error.message);
    }
}

// 验证导入结果
async function verifyImport(connection) {
    try {
        console.log('🔍 验证导入结果...');
        
        // 检查各表数据量
        const tables = ['components', 'cpu_specs', 'mb_specs', 'gpu_specs', 'ram_specs', 'nvme_specs', 'case_specs'];
        
        for (const table of tables) {
            const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`  ${table}: ${rows[0].count} 条记录`);
        }
        
        // 检查视图数据
        const [stats] = await connection.execute('SELECT * FROM component_stats');
        console.log('\n📈 组件统计视图:');
        stats.forEach(row => {
            console.log(`  ${row.category}: ${row.count} 个组件，平均价格 ${row.avg_price || 0}元，平均评分 ${row.avg_rating || 0}`);
        });
        
        console.log('✅ 数据验证完成');
    } catch (error) {
        console.error('❌ 数据验证失败:', error.message);
        throw error;
    }
}

// 主函数
async function main() {
    let connection;
    
    try {
        console.log('🚀 开始导入components.json数据到MySQL数据库...\n');
        
        // 1. 加载数据
        const componentsData = await loadComponentsData();
        console.log('📄 数据文件加载成功');
        console.log(`   版本: ${componentsData.metadata.version}`);
        console.log(`   更新时间: ${componentsData.metadata.lastUpdated}`);
        console.log(`   总组件数: ${componentsData.metadata.componentCount.total}\n`);
        
        // 2. 连接数据库
        connection = await createConnection();
        
        // 3. 清空现有数据（可选，注释掉以下行可保留现有数据）
        // await clearExistingData(connection);
        
        // 4. 导入品牌数据
        await importBrands(connection, componentsData);
        
        // 5. 导入组件数据
        const totalComponents = await importComponents(connection, componentsData);
        
        // 6. 记录导入日志
        await logImport(connection, totalComponents, 'success');
        
        // 7. 验证导入结果
        await verifyImport(connection);
        
        console.log('\n🎉 数据导入完成！所有组件数据已成功备份到MySQL数据库。');
        
    } catch (error) {
        console.error('\n❌ 数据导入失败:', error.message);
        
        if (connection) {
            await logImport(connection, 0, 'failed', error.message);
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 数据库连接已关闭');
        }
    }
}

// 执行主函数
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };