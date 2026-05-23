// 将components.json中的数据转换为原始HTML界面使用的格式
const fs = require('fs');

// 读取components.json文件
const componentsData = JSON.parse(fs.readFileSync('./components.json', 'utf8'));

// 转换函数
function convertComponentsData(data) {
  const converted = {};
  
  // 转换CPU数据
  converted.cpu = data.components.cpu.map(item => ({
    标题: item.title,
    品牌: item.brand,
    类别: 'cpu',
    接口: item.specs.socket || '',
    核心: item.specs.cores || '',
    线程: item.specs.threads || '',
    频率: `${item.specs.baseFreq || ''}-${item.specs.boostFreq || ''}`,
    功耗: item.specs.tdp || '',
    工艺制程: item.specs.process || '',
    缓存: item.specs.cache || '',
    价格: item.specs.price || '',
    评分: item.specs.rating || '',
    库存: item.specs.stock || '',
    是否带风扇: item.specs.hasFan || '',
    是否集成显卡: item.specs.hasIGPU || '',
    系列: item.specs.series || '',
    specs: {
      name: item.title,
      cores: parseInt(item.specs.cores) || 0,
      threads: parseInt(item.specs.threads) || 0,
      baseFreq: item.specs.baseFreq || '',
      boostFreq: item.specs.boostFreq || '',
      tdp: item.specs.tdp || '',
      socket: item.specs.socket || '',
      process: item.specs.process || '',
      cache: item.specs.cache || '',
      price: item.specs.price || '',
      rating: item.specs.rating || '',
      stock: item.specs.stock || '',
      hasFan: item.specs.hasFan || '',
      hasIGPU: item.specs.hasIGPU || '',
      series: item.specs.series || ''
    }
  }));
  
  // 转换主板数据
  converted.mb = data.components.mb.map(item => ({
    标题: item.title,
    品牌: item.brand,
    类别: 'mb',
    cpu接口: item.specs.cpuSocket || '',
    ddr代数: item.specs.ddrGen || '',
    板型: item.specs.formFactor || '',
    芯片组: item.specs.chipset || '',
    M2插槽: item.specs.m2Slots || '',
    SATA接口: item.specs.sataPorts || '',
    内存插槽: item.specs.memSlots || '',
    最大内存: item.specs.maxMem || '',
    PCIe支持: item.specs.pcie || '',
    WiFi: item.specs.wifi || '',
    RGB支持: item.specs.rgb || '',
    供电相数: item.specs.powerPhase || '',
    价格: item.specs.price || '',
    评分: item.specs.rating || '',
    库存: item.specs.stock || '',
    specs: {
      name: item.title,
      cpuSocket: item.specs.cpuSocket || '',
      ddrGen: item.specs.ddrGen || '',
      formFactor: item.specs.formFactor || '',
      chipset: item.specs.chipset || '',
      m2Slots: item.specs.m2Slots || '',
      sataPorts: item.specs.sataPorts || '',
      memSlots: item.specs.memSlots || '',
      maxMem: item.specs.maxMem || '',
      pcie: item.specs.pcie || '',
      wifi: item.specs.wifi || '',
      rgb: item.specs.rgb || '',
      powerPhase: item.specs.powerPhase || '',
      price: item.specs.price || '',
      rating: item.specs.rating || '',
      stock: item.specs.stock || ''
    }
  }));
  
  // 转换显卡数据
  converted.gpu = data.components.gpu.map(item => ({
    标题: item.title,
    品牌: item.brand,
    类别: 'gpu',
    显存: item.specs.vram || '',
    显存类型: item.specs.vramType || '',
    显存位宽: item.specs.vramBitWidth || '',
    接口: item.specs.interface || '',
    芯片型号: item.specs.model || '',
    芯片厂商: item.specs.chip || '',
    风扇数量: item.specs.fans || '',
    RGB支持: item.specs.rgb || '',
    供电接口: item.specs.powerConnector || '',
    系列: item.specs.series || '',
    电源建议: item.specs.powerRecommendation || '',
    长度: item.specs.length || '',
    价格: item.specs.price || '',
    评分: item.specs.rating || '',
    库存: item.specs.stock || '',
    specs: {
      name: item.title,
      vram: item.specs.vram || '',
      vramType: item.specs.vramType || '',
      vramBitWidth: item.specs.vramBitWidth || '',
      interface: item.specs.interface || '',
      model: item.specs.model || '',
      chip: item.specs.chip || '',
      fans: item.specs.fans || '',
      rgb: item.specs.rgb || '',
      powerConnector: item.specs.powerConnector || '',
      series: item.specs.series || '',
      powerRecommendation: item.specs.powerRecommendation || '',
      length: item.specs.length || '',
      price: item.specs.price || '',
      rating: item.specs.rating || '',
      stock: item.specs.stock || ''
    }
  }));
  
  // 转换内存数据
  converted.ram = data.components.ram.map(item => ({
    标题: item.title,
    品牌: item.brand,
    类别: 'ram',
    ddr代数: item.specs.ddrGen || '',
    外观: item.specs.appearance || '',
    容量: item.specs.capacity || '',
    频率: item.specs.frequency || '',
    数量: item.specs.quantity || '',
    时序: item.specs.timings || '',
    价格: item.specs.price || '',
    评分: item.specs.rating || '',
    库存: item.specs.stock || '',
    specs: {
      name: item.title,
      ddrGen: item.specs.ddrGen || '',
      appearance: item.specs.appearance || '',
      capacity: item.specs.capacity || '',
      frequency: item.specs.frequency || '',
      quantity: item.specs.quantity || '',
      timings: item.specs.timings || '',
      price: item.specs.price || '',
      rating: item.specs.rating || '',
      stock: item.specs.stock || ''
    }
  }));
  
  // 转换NVMe硬盘数据
  converted.nvme = data.components.nvme.map(item => ({
    标题: item.title,
    品牌: item.brand,
    类别: 'nvme',
    容量: item.specs.capacity || '',
    接口: item.specs.interface || '',
    板型: item.specs.formFactor || '',
    顺序读取: item.specs.seqRead || '',
    顺序写入: item.specs.seqWrite || '',
    随机读取: item.specs.randomRead || '',
    随机写入: item.specs.randomWrite || '',
    闪存类型: item.specs.nandType || '',
    缓存: item.specs.cache || '',
    耐用性: item.specs.endurance || '',
    系列: item.specs.series || '',
    价格: item.specs.price || '',
    评分: item.specs.rating || '',
    库存: item.specs.stock || '',
    specs: {
      name: item.title,
      capacity: item.specs.capacity || '',
      interface: item.specs.interface || '',
      formFactor: item.specs.formFactor || '',
      seqRead: item.specs.seqRead || '',
      seqWrite: item.specs.seqWrite || '',
      randomRead: item.specs.randomRead || '',
      randomWrite: item.specs.randomWrite || '',
      nandType: item.specs.nandType || '',
      cache: item.specs.cache || '',
      endurance: item.specs.endurance || '',
      series: item.specs.series || '',
      price: item.specs.price || '',
      rating: item.specs.rating || '',
      stock: item.specs.stock || ''
    }
  }));
  
  // 转换机箱数据
  converted.case = data.components.case.map(item => ({
    标题: item.title,
    品牌: item.brand,
    类别: 'case',
    水冷支持: item.specs.waterCooling || '',
    尺寸: item.specs.size || '',
    类型: item.specs.type || '',
    重量: item.specs.weight || '',
    RGB支持: item.specs.rgb || '',
    主板支持: item.specs.mbSupport || '',
    颜色: item.specs.color || '',
    显卡限长: item.specs.gpuMaxLength || '',
    CPU散热器高度: item.specs.cpuCoolerHeight || '',
    前置接口: item.specs.frontPorts || '',
    风扇位: item.specs.fanSlots || '',
    价格: item.specs.price || '',
    评分: item.specs.rating || '',
    库存: item.specs.stock || '',
    specs: {
      name: item.title,
      waterCooling: item.specs.waterCooling || '',
      size: item.specs.size || '',
      type: item.specs.type || '',
      weight: item.specs.weight || '',
      rgb: item.specs.rgb || '',
      mbSupport: item.specs.mbSupport || '',
      color: item.specs.color || '',
      gpuMaxLength: item.specs.gpuMaxLength || '',
      cpuCoolerHeight: item.specs.cpuCoolerHeight || '',
      frontPorts: item.specs.frontPorts || '',
      fanSlots: item.specs.fanSlots || '',
      price: item.specs.price || '',
      rating: item.specs.rating || '',
      stock: item.specs.stock || ''
    }
  }));
  
  return converted;
}

// 执行转换
const convertedData = convertComponentsData(componentsData);

// 输出转换后的数据
console.log('转换后的数据格式:');
console.log(JSON.stringify(convertedData, null, 2));

// 保存到文件
fs.writeFileSync('./converted-components.json', JSON.stringify(convertedData, null, 2));
console.log('数据已保存到 converted-components.json');

// 生成可以直接插入到HTML中的JavaScript代码
const jsCode = `const PRODUCTS = ${JSON.stringify(convertedData, null, 2)};`;
fs.writeFileSync('./products-data.js', jsCode);
console.log('JavaScript数据代码已保存到 products-data.js');