<!--
  首页组件
  - 展示硬件兼容性检测系统的主要功能
  - 包含欢迎区域、功能卡片、统计信息和检测历史
-->
<template>
  <Layout>
    <div class="home-container">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h1>欢迎使用硬件兼容性检测系统</h1>
            <p>专业的硬件兼容性检测平台，帮助您快速验证电脑硬件组件的兼容性</p>
            <el-button type="primary" size="large" @click="$router.push('/compatibility-check')">
              开始检测
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 功能卡片区域 -->
      <div class="features-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-card class="feature-card" shadow="hover">
              <div class="feature-icon">
                <el-icon size="48" color="#409EFF"><search /></el-icon>
              </div>
              <h3>兼容性检测</h3>
              <p>快速检测CPU、主板、内存、显卡等硬件组件的兼容性，避免硬件冲突</p>
              <el-button type="primary" text @click="$router.push('/compatibility-check')">
                开始检测
              </el-button>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-card class="feature-card" shadow="hover">
              <div class="feature-icon">
                <el-icon size="48" color="#67C23A"><cpu /></el-icon>
              </div>
              <h3>组件管理</h3>
              <p>管理硬件组件数据库，支持添加、编辑、删除各种硬件组件信息</p>
              <el-button type="success" text @click="$router.push('/component-management')">
                管理组件
              </el-button>
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-card class="feature-card" shadow="hover">
              <div class="feature-icon">
                <el-icon size="48" color="#E6A23C"><document /></el-icon>
              </div>
              <h3>检测历史</h3>
              <p>查看历史检测记录，分析兼容性问题，优化硬件配置方案</p>
              <el-button type="warning" text @click="showHistory = true">
                查看历史
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <el-statistic title="总检测次数" :value="stats.totalChecks" />
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-statistic title="兼容组件数" :value="stats.compatibleComponents" />
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-statistic title="检测规则数" :value="stats.rulesCount" />
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-statistic title="用户数量" :value="stats.userCount" />
          </el-col>
        </el-row>
      </div>

      <!-- 历史记录对话框 -->
      <el-dialog
        v-model="showHistory"
        title="检测历史"
        width="800px"
      >
        <el-table :data="history" v-loading="loadingHistory">
          <el-table-column prop="timestamp" label="检测时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="components" label="检测组件" min-width="200">
            <template #default="{ row }">
              <el-tag
                v-for="component in row.components"
                :key="component.id"
                size="small"
                class="component-tag"
              >
                {{ component.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result.isCompatible" label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.result.isCompatible ? 'success' : 'danger'">
                {{ row.result.isCompatible ? '兼容' : '不兼容' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" @click="viewResult(row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <template #footer>
          <el-button @click="showHistory = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
// 导入Vue核心API
import { ref, reactive, onMounted, watch } from 'vue'
// 导入Element Plus组件
import { ElMessage } from 'element-plus'
// 导入兼容性检测状态管理
import { useCompatibilityStore } from '@/stores/compatibility'
// 导入布局组件
import Layout from '@/components/Layout.vue'

// 初始化兼容性检测状态管理
const compatibilityStore = useCompatibilityStore()

// 控制检测历史对话框显示
const showHistory = ref(false)
// 检测历史数据加载状态
const loadingHistory = ref(false)

// 统计信息数据
const stats = reactive({
  totalChecks: 0, // 总检测次数
  compatibleComponents: 0, // 兼容组件数
  rulesCount: 0, // 检测规则数
  userCount: 0 // 用户数量
})

// 检测历史记录数据
const history = ref([])

// 组件挂载时加载统计信息
onMounted(() => {
  loadStats()
})

// 加载统计信息
const loadStats = async () => {
  // 模拟统计数据
  stats.totalChecks = 1250
  stats.compatibleComponents = 856
  stats.rulesCount = 42
  stats.userCount = 89
}

// 加载检测历史记录
const loadHistory = async () => {
  loadingHistory.value = true
  try {
    history.value = compatibilityStore.history
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    loadingHistory.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 查看检测结果详情
const viewResult = (record) => {
  compatibilityStore.compatibilityResult = record.result
  showHistory.value = false
  // 跳转到兼容性检测页面
  setTimeout(() => {
    window.location.href = '/compatibility-check'
  }, 100)
}

// 监听检测历史对话框显示状态，显示时加载数据
watch(showHistory, (newVal) => {
  if (newVal) {
    loadHistory()
  }
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.welcome-content h1 {
  margin-bottom: 15px;
  font-size: 28px;
}

.welcome-content p {
  margin-bottom: 25px;
  font-size: 16px;
  opacity: 0.9;
}

.features-section {
  margin-bottom: 40px;
}

.feature-card {
  height: 280px;
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-card h3 {
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.stats-section {
  margin-bottom: 30px;
}

.component-tag {
  margin: 2px;
}
</style>