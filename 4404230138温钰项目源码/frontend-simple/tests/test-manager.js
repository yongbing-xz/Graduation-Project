import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestManager {
  constructor(config) {
    this.config = config || {};
    this.testCases = new Map();
    this.testSuites = new Map();
    this.maintenanceLog = [];
  }

  async initialize() {
    console.log('📚 初始化测试管理器...');
    
    // 扫描测试目录结构
    await this.scanTestDirectory();
    
    // 加载测试用例
    await this.loadTestCases();
    
    // 组织测试套件
    await this.organizeTestSuites();
    
    console.log('✅ 测试管理器初始化完成');
    console.log(`   发现测试用例: ${this.testCases.size}`);
    console.log(`   组织测试套件: ${this.testSuites.size}`);
  }

  async scanTestDirectory() {
    const testDir = path.join(__dirname, 'test-cases');
    
    if (!await fs.pathExists(testDir)) {
      console.warn('⚠️ 测试目录不存在，将创建基础结构');
      await this.createDefaultTestStructure();
      return;
    }

    console.log(`🔍 扫描测试目录: ${testDir}`);
    
    // 扫描子目录
    const categories = await fs.readdir(testDir);
    
    for (const category of categories) {
      const categoryPath = path.join(testDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        console.log(`   发现测试类别: ${category}`);
        await this.scanTestCategory(category, categoryPath);
      }
    }
  }

  async scanTestCategory(category, categoryPath) {
    const files = await fs.readdir(categoryPath);
    
    for (const file of files) {
      if (file.endsWith('.test.js') || file.endsWith('.spec.js')) {
        const filePath = path.join(categoryPath, file);
        
        // 安全验证：确保测试文件路径在项目目录内
        const safeFilePath = path.resolve(filePath);
        if (!safeFilePath.startsWith(__dirname)) {
          console.error(`❌ 测试文件路径不安全，跳过: ${file}`);
          continue;
        }
        
        // 验证文件扩展名
        if (!safeFilePath.endsWith('.js')) {
          console.error(`❌ 测试文件必须是JavaScript文件，跳过: ${file}`);
          continue;
        }
        
        const testCaseId = this.generateTestCaseId(category, file);
        
        this.testCases.set(testCaseId, {
          id: testCaseId,
          category,
          fileName: file,
          filePath: safeFilePath,
          lastModified: (await fs.stat(safeFilePath)).mtime,
          status: 'pending'
        });
      }
    }
  }

  async loadTestCases() {
    console.log('📖 加载测试用例...');
    
    for (const [testCaseId, testCase] of this.testCases) {
      try {
        // 检查文件大小，防止DoS攻击（限制为1MB）
        const stats = await fs.stat(testCase.filePath);
        if (stats.size > 1024 * 1024) { // 1MB
          throw new Error(`测试文件过大: ${stats.size}字节，超过1MB限制`);
        }
        
        const testContent = await fs.readFile(testCase.filePath, 'utf8');
        
        // 解析测试用例信息
        const testInfo = this.parseTestCaseInfo(testContent, testCase);
        this.testCases.set(testCaseId, { ...testCase, ...testInfo });
        
      } catch (error) {
        console.error(`❌ 加载测试用例失败 ${testCaseId}:`, error.message);
        this.testCases.set(testCaseId, { 
          ...testCase, 
          status: 'error',
          error: error.message 
        });
      }
    }
  }

  parseTestCaseInfo(content, testCase) {
    const info = {
      className: this.extractClassName(content),
      testMethods: this.extractTestMethods(content),
      dependencies: this.extractDependencies(content),
      complexity: this.assessComplexity(content),
      estimatedDuration: this.estimateDuration(content),
      tags: this.extractTags(content)
    };

    return info;
  }

  extractClassName(content) {
    const classMatch = content.match(/class\s+(\w+)/);
    return classMatch ? classMatch[1] : 'UnknownClass';
  }

  extractTestMethods(content) {
    const methodMatches = content.matchAll(/\s+(\w+)\s*\([^)]*\)\s*\{/g);
    const methods = [];
    
    for (const match of methodMatches) {
      const methodName = match[1];
      if (methodName.startsWith('test') || methodName.includes('Test')) {
        methods.push(methodName);
      }
    }
    
    return methods;
  }

  extractDependencies(content) {
    const dependencies = [];
    
    // 检查导入语句
    const importMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);
    for (const match of importMatches) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }

  assessComplexity(content) {
    let complexity = 'low';
    
    // 简单的复杂度评估
    const lines = content.split('\n').length;
    const methodCount = this.extractTestMethods(content).length;
    
    if (lines > 200 || methodCount > 10) {
      complexity = 'high';
    } else if (lines > 100 || methodCount > 5) {
      complexity = 'medium';
    }
    
    return complexity;
  }

  estimateDuration(content) {
    // 基于代码行数和复杂度估算执行时间
    const lines = content.split('\n').length;
    const methodCount = this.extractTestMethods(content).length;
    
    // 简单的估算公式
    return Math.max(1000, lines * 10 + methodCount * 200); // 毫秒
  }

  extractTags(content) {
    const tags = [];
    
    // 从注释中提取标签
    const commentMatches = content.matchAll(/\/\/\s*@(\w+)/g);
    for (const match of commentMatches) {
      tags.push(match[1]);
    }
    
    // 自动添加基于类名的标签
    const className = this.extractClassName(content);
    if (className.includes('Performance')) tags.push('performance');
    if (className.includes('Integration')) tags.push('integration');
    if (className.includes('Compatibility')) tags.push('compatibility');
    if (className.includes('Core')) tags.push('core');
    
    return [...new Set(tags)]; // 去重
  }

  async organizeTestSuites() {
    console.log('🗂️ 组织测试套件...');
    
    // 按类别组织
    const suitesByCategory = {};
    
    for (const testCase of this.testCases.values()) {
      const category = testCase.category;
      
      if (!suitesByCategory[category]) {
        suitesByCategory[category] = [];
      }
      
      suitesByCategory[category].push(testCase);
    }
    
    // 创建测试套件
    for (const [category, testCases] of Object.entries(suitesByCategory)) {
      const suiteId = `suite_${category}`;
      
      this.testSuites.set(suiteId, {
        id: suiteId,
        name: `${category}测试套件`,
        category,
        testCases: testCases.map(tc => tc.id),
        totalDuration: testCases.reduce((sum, tc) => sum + tc.estimatedDuration, 0),
        complexity: this.calculateSuiteComplexity(testCases)
      });
    }
    
    // 创建基于标签的套件
    await this.createTagBasedSuites();
  }

  calculateSuiteComplexity(testCases) {
    const complexities = testCases.map(tc => tc.complexity);
    const highCount = complexities.filter(c => c === 'high').length;
    const mediumCount = complexities.filter(c => c === 'medium').length;
    
    if (highCount > 0) return 'high';
    if (mediumCount > 0) return 'medium';
    return 'low';
  }

  async createTagBasedSuites() {
    const tagsMap = {};
    
    // 收集所有标签
    for (const testCase of this.testCases.values()) {
      for (const tag of testCase.tags) {
        if (!tagsMap[tag]) {
          tagsMap[tag] = [];
        }
        tagsMap[tag].push(testCase.id);
      }
    }
    
    // 为每个标签创建套件
    for (const [tag, testCaseIds] of Object.entries(tagsMap)) {
      const suiteId = `suite_tag_${tag}`;
      const testCases = testCaseIds.map(id => this.testCases.get(id));
      
      this.testSuites.set(suiteId, {
        id: suiteId,
        name: `${tag}标签测试套件`,
        tag,
        testCases: testCaseIds,
        totalDuration: testCases.reduce((sum, tc) => sum + tc.estimatedDuration, 0),
        complexity: this.calculateSuiteComplexity(testCases)
      });
    }
  }

  async createDefaultTestStructure() {
    console.log('🏗️ 创建默认测试目录结构...');
    
    const baseDir = path.join(__dirname, 'test-cases');
    const categories = ['core', 'performance', 'integration', 'compatibility'];
    
    for (const category of categories) {
      const categoryDir = path.join(baseDir, category);
      await fs.ensureDir(categoryDir);
      console.log(`   创建目录: ${category}`);
    }
    
    // 创建示例测试文件
    await this.createExampleTestFiles();
  }

  async createExampleTestFiles() {
    const exampleContent = `/**
 * 示例测试用例
 * @example
 * @core
 */

class ExampleTest {
  constructor() {
    this.testData = {};
  }

  async testBasicFunctionality() {
    // 基础功能测试示例
    console.log('执行基础功能测试');
    return { passed: true, message: '基础功能测试通过' };
  }

  async testErrorHandling() {
    // 错误处理测试示例
    try {
      // 模拟错误场景
      throw new Error('测试错误');
    } catch (error) {
      return { passed: true, message: '错误处理正常' };
    }
  }

  async testPerformance() {
    // 性能测试示例
    const startTime = Date.now();
    
    // 模拟性能测试
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const duration = Date.now() - startTime;
    return { 
      passed: duration < 200, 
      message: '性能测试完成，耗时: ' + duration + 'ms',
      performanceMetrics: { duration }
    };
  }
}

module.exports = ExampleTest;`;

    const examplePath = path.join(__dirname, 'test-cases', 'core', 'example.test.js');
    await fs.writeFile(examplePath, exampleContent);
    
    console.log('   创建示例测试文件: core/example.test.js');
  }

  generateTestCaseId(category, fileName) {
    const baseName = fileName.replace('.test.js', '').replace('.spec.js', '');
    return `${category}_${baseName}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }

  // 测试用例管理方法
  getTestCase(testCaseId) {
    return this.testCases.get(testCaseId);
  }

  getTestCasesByCategory(category) {
    return Array.from(this.testCases.values())
      .filter(tc => tc.category === category);
  }

  getTestCasesByTag(tag) {
    return Array.from(this.testCases.values())
      .filter(tc => tc.tags.includes(tag));
  }

  getTestSuite(suiteId) {
    const suite = this.testSuites.get(suiteId);
    if (!suite) return null;
    
    return {
      ...suite,
      testCases: suite.testCases.map(id => this.getTestCase(id))
    };
  }

  // 测试用例维护方法
  async updateTestCase(testCaseId, updates) {
    const testCase = this.testCases.get(testCaseId);
    if (!testCase) {
      throw new Error(`测试用例 ${testCaseId} 不存在`);
    }
    
    const updatedTestCase = { ...testCase, ...updates };
    this.testCases.set(testCaseId, updatedTestCase);
    
    // 记录维护日志
    this.logMaintenance('update', testCaseId, updates);
    
    return updatedTestCase;
  }

  async createTestCase(testCaseData) {
    const testCaseId = this.generateTestCaseId(
      testCaseData.category, 
      testCaseData.fileName
    );
    
    if (this.testCases.has(testCaseId)) {
      throw new Error(`测试用例 ${testCaseId} 已存在`);
    }
    
    const testCase = {
      id: testCaseId,
      ...testCaseData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    this.testCases.set(testCaseId, testCase);
    
    // 记录维护日志
    this.logMaintenance('create', testCaseId, testCaseData);
    
    return testCase;
  }

  async deleteTestCase(testCaseId) {
    const testCase = this.testCases.get(testCaseId);
    if (!testCase) {
      throw new Error(`测试用例 ${testCaseId} 不存在`);
    }
    
    this.testCases.delete(testCaseId);
    
    // 从所有套件中移除
    for (const suite of this.testSuites.values()) {
      suite.testCases = suite.testCases.filter(id => id !== testCaseId);
    }
    
    // 记录维护日志
    this.logMaintenance('delete', testCaseId, testCase);
    
    return testCase;
  }

  logMaintenance(action, testCaseId, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      testCaseId,
      data,
      user: 'system' // 实际应用中可以从上下文获取用户信息
    };
    
    this.maintenanceLog.unshift(logEntry);
    
    // 限制日志大小
    if (this.maintenanceLog.length > 1000) {
      this.maintenanceLog = this.maintenanceLog.slice(0, 1000);
    }
  }

  // 测试用例分析
  analyzeTestCoverage() {
    const analysis = {
      totalTestCases: this.testCases.size,
      byCategory: {},
      byComplexity: { low: 0, medium: 0, high: 0 },
      byTag: {},
      estimatedTotalDuration: 0
    };
    
    for (const testCase of this.testCases.values()) {
      // 按类别统计
      if (!analysis.byCategory[testCase.category]) {
        analysis.byCategory[testCase.category] = 0;
      }
      analysis.byCategory[testCase.category]++;
      
      // 按复杂度统计
      analysis.byComplexity[testCase.complexity]++;
      
      // 按标签统计
      for (const tag of testCase.tags) {
        if (!analysis.byTag[tag]) {
          analysis.byTag[tag] = 0;
        }
        analysis.byTag[tag]++;
      }
      
      // 累计预估时间
      analysis.estimatedTotalDuration += testCase.estimatedDuration;
    }
    
    return analysis;
  }

  generateMaintenanceReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTestCases: this.testCases.size,
        totalTestSuites: this.testSuites.size,
        recentMaintenance: this.maintenanceLog.slice(0, 10).length
      },
      coverageAnalysis: this.analyzeTestCoverage(),
      maintenanceRecommendations: this.generateMaintenanceRecommendations(),
      recentActivities: this.maintenanceLog.slice(0, 10)
    };
    
    return report;
  }

  generateMaintenanceRecommendations() {
    const recommendations = [];
    const coverage = this.analyzeTestCoverage();
    
    // 检查测试覆盖均衡性
    const categoryCounts = Object.values(coverage.byCategory);
    const avgCount = categoryCounts.reduce((sum, count) => sum + count, 0) / categoryCounts.length;
    
    for (const [category, count] of Object.entries(coverage.byCategory)) {
      if (count < avgCount * 0.5) {
        recommendations.push({
          type: 'coverage_balance',
          priority: 'medium',
          message: `类别 ${category} 的测试用例数量较少，建议增加覆盖`
        });
      }
    }
    
    // 检查高复杂度测试
    if (coverage.byComplexity.high > coverage.totalTestCases * 0.3) {
      recommendations.push({
        type: 'complexity_management',
        priority: 'high',
        message: '高复杂度测试用例比例较高，建议进行重构和拆分'
      });
    }
    
    // 检查长时间运行的测试
    if (coverage.estimatedTotalDuration > 300000) { // 5分钟
      recommendations.push({
        type: 'execution_time',
        priority: 'medium',
        message: '测试总执行时间较长，建议优化测试性能'
      });
    }
    
    return recommendations;
  }

  // 导出和导入功能
  async exportTestCases(exportPath) {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      testCases: Array.from(this.testCases.values()),
      testSuites: Array.from(this.testSuites.values())
    };
    
    await fs.writeJson(exportPath, exportData, { spaces: 2 });
    console.log(`✅ 测试用例已导出到: ${exportPath}`);
  }

  async importTestCases(importPath) {
    if (!await fs.pathExists(importPath)) {
      throw new Error(`导入文件不存在: ${importPath}`);
    }
    
    const importData = await fs.readJson(importPath);
    
    // 验证导入数据格式
    if (!importData.testCases || !importData.testSuites) {
      throw new Error('导入文件格式不正确');
    }
    
    // 清空现有数据
    this.testCases.clear();
    this.testSuites.clear();
    
    // 导入测试用例
    for (const testCase of importData.testCases) {
      this.testCases.set(testCase.id, testCase);
    }
    
    // 导入测试套件
    for (const testSuite of importData.testSuites) {
      this.testSuites.set(testSuite.id, testSuite);
    }
    
    console.log(`✅ 从 ${importPath} 成功导入测试用例`);
    console.log(`   导入测试用例: ${this.testCases.size}`);
    console.log(`   导入测试套件: ${this.testSuites.size}`);
  }
}

export default TestManager;