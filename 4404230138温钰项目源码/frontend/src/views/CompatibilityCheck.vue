<!--
  兼容性检测组件
  - 用于检测硬件组件之间的兼容性
  - 包含组件选择区域和检测结果展示
-->
<template>
  <Layout>
    <div class="compatibility-check-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>硬件兼容性检测</h2>
        <p>选择硬件组件进行兼容性检测，系统将自动分析组件间的兼容性</p>
      </div>

      <!-- 组件选择区域 -->
      <el-card class="component-selection">
        <template #header>
          <div class="card-header">
            <span>选择硬件组件</span>
            <el-button type="primary" @click="addComponent">
              <el-icon><plus /></el-icon>
              添加组件
            </el-button>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="8" v-for="(component, index) in selectedComponents" :key="index">
            <el-card class="component-card">
              <template #header>
                <div class="component-header">
                  <span>{{ getComponentTypeName(component.type) }}</span>
                  <el-button type="danger" text size="small" @click="removeComponent(index)">
                    <el-icon><close /></el-icon>
                  </el-button>
                </div>
              </template>

              <el-form :model="component" label-width="80px">
                <el-form-item label="品牌">
                  <el-select
                    v-model="component.brand"
                    placeholder="选择品牌"
                    filterable
                    @change="handleBrandChange(component)"
                  >
                    <el-option
                      v-for="brand in getBrandsByType(component.type)"
                      :key="brand"
                      :label="brand"
                      :value="brand"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="型号">
                  <el-select
                    v-model="component.model"
                    placeholder="选择型号"
                    filterable
                    :disabled="!component.brand"
                  >
                    <el-option
                      v-for="model in getModelsByBrand(component.type, component.brand)"
                      :key="model"
                      :label="model"
                      :value="model"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="规格" v-if="component.specifications">
                  <el-input v-model="component.specifications" placeholder="规格信息" />
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>

        <div class="selection-actions">
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!canCheckCompatibility"
            @click="checkCompatibility"
          >
            <el-icon><search /></el-icon>
            开始检测
          </el-button>
          
          <el-button @click="clearSelection">
            <el-icon><refresh /></el-icon>
            清空选择
          </el-button>
        </div>
      </el-card>

      <!-- 检测结果区域 -->
      <el-card v-if="compatibilityResult" class="result-section">
        <template #header>
          <div class="result-header">
            <span>检测结果</span>
            <el-tag :type="compatibilityResult.isCompatible ? 'success' : 'danger'">
              {{ compatibilityResult.isCompatible ? '兼容' : '不兼容' }}
            </el-tag>
          </div>
        </template>

        <!-- 总体结果 -->
        <div class="overall-result">
          <el-alert
            :title="compatibilityResult.isCompatible ? '所有组件兼容性良好' : '发现兼容性问题'"
            :type="compatibilityResult.isCompatible ? 'success' : 'error'"
            :description="compatibilityResult.message"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 详细规则检测结果 -->
        <div class="detailed-results">
          <h3>详细检测结果</h3>
          <el-collapse v-model="activeRules">
            <el-collapse-item
              v-for="rule in compatibilityResult.ruleResults"
              :key="rule.ruleName"
              :name="rule.ruleName"
            >
              <template #title>
                <div class="rule-title">
                  <el-tag :type="rule.isCompatible ? 'success' : 'danger'" size="small">
                    {{ rule.isCompatible ? '通过' : '失败' }}
                  </el-tag>
                  <span>{{ rule.ruleName }}</span>
                </div>
              </template>
              
              <div class="rule-details">
                <p><strong>原因:</strong> {{ rule.reason }}</p>
                <p><strong>建议:</strong> {{ rule.suggestion }}</p>
                <p><strong>检测时间:</strong> {{ formatDate(rule.checkTime) }}</p>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 检测信息 -->
        <div class="check-info">
          <el-descriptions title="检测信息" :column="2" border>
            <el-descriptions-item label="检测ID">{{ compatibilityResult.checkId }}</el-descriptions-item>
            <el-descriptions-item label="检测时间">{{ formatDate(compatibilityResult.checkTime) }}</el-descriptions-item>
            <el-descriptions-item label="检测耗时">{{ compatibilityResult.duration }}ms</el-descriptions-item>
            <el-descriptions-item label="检测组件数">{{ compatibilityResult.components.length }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 添加组件对话框 -->
      <el-dialog
        v-model="showAddComponent"
        title="添加硬件组件"
        width="500px"
      >
        <el-form :model="newComponent" label-width="100px">
          <el-form-item label="组件类型" required>
            <el-select v-model="newComponent.type" placeholder="选择组件类型">
              <el-option
                v-for="type in componentTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showAddComponent = false">取消</el-button>
          <el-button type="primary" @click="confirmAddComponent" :disabled="!newComponent.type">
            确认添加
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useCompatibilityStore } from '@/stores/compatibility'
import Layout from '@/components/Layout.vue'

const compatibilityStore = useCompatibilityStore()

const loading = ref(false)
const showAddComponent = ref(false)
const activeRules = ref([])

const componentTypes = [
  { value: 'CPU', label: 'CPU' },
  { value: 'MOTHERBOARD', label: '主板' },
  { value: 'MEMORY', label: '内存' },
  { value: 'GPU', label: '显卡' },
  { value: 'STORAGE', label: '存储' },
  { value: 'POWER_SUPPLY', label: '电源' },
  { value: 'CASE', label: '机箱' }
]

const newComponent = reactive({
  type: ''
})

const selectedComponents = computed(() => compatibilityStore.selectedComponents)
const compatibilityResult = computed(() => compatibilityStore.compatibilityResult)

const canCheckCompatibility = computed(() => {
  return selectedComponents.value.length >= 2 && 
         selectedComponents.value.every(comp => comp.brand && comp.model)
})

onMounted(() => {
  // 初始化示例数据
  if (selectedComponents.value.length === 0) {
    compatibilityStore.selectedComponents = [
      { type: 'CPU', brand: '', model: '', specifications: '' },
      { type: 'MOTHERBOARD', brand: '', model: '', specifications: '' }
    ]
  }
})

const addComponent = () => {
  showAddComponent.value = true
  newComponent.type = ''
}

const confirmAddComponent = () => {
  if (newComponent.type) {
    compatibilityStore.selectedComponents.push({
      type: newComponent.type,
      brand: '',
      model: '',
      specifications: ''
    })
    showAddComponent.value = false
    ElMessage.success('组件添加成功')
  }
}

const removeComponent = (index) => {
  compatibilityStore.selectedComponents.splice(index, 1)
  if (compatibilityResult.value) {
    compatibilityStore.clearResult()
  }
}

const handleBrandChange = (component) => {
  component.model = ''
  component.specifications = ''
}

const checkCompatibility = async () => {
  if (!canCheckCompatibility.value) {
    ElMessage.warning('请至少选择两个完整的组件信息')
    return
  }

  loading.value = true
  try {
    await compatibilityStore.checkCompatibility(selectedComponents.value)
    ElMessage.success('兼容性检测完成')
  } catch (error) {
    ElMessage.error(error.message || '检测失败')
  } finally {
    loading.value = false
  }
}

const clearSelection = () => {
  compatibilityStore.selectedComponents = []
  compatibilityStore.clearResult()
  ElMessage.info('已清空选择')
}

const getComponentTypeName = (type) => {
  const typeMap = {
    'CPU': 'CPU',
    'MOTHERBOARD': '主板',
    'MEMORY': '内存',
    'GPU': '显卡',
    'STORAGE': '存储',
    'POWER_SUPPLY': '电源',
    'CASE': '机箱'
  }
  return typeMap[type] || type
}

const getBrandsByType = (type) => {
  // 模拟品牌数据
  const brands = {
    'CPU': ['Intel', 'AMD'],
    'MOTHERBOARD': ['ASUS', 'GIGABYTE', 'MSI', 'ASRock'],
    'MEMORY': ['Kingston', 'Corsair', 'G.Skill', 'Samsung'],
    'GPU': ['NVIDIA', 'AMD', 'ASUS', 'GIGABYTE'],
    'STORAGE': ['Samsung', 'WD', 'Seagate', 'Kingston'],
    'POWER_SUPPLY': ['Corsair', 'Seasonic', 'Cooler Master', 'EVGA'],
    'CASE': ['NZXT', 'Corsair', 'Fractal Design', 'Lian Li']
  }
  return brands[type] || []
}

const getModelsByBrand = (type, brand) => {
  // 模拟型号数据
  const models = {
    'CPU': {
      'Intel': ['Core i9-13900K', 'Core i7-13700K', 'Core i5-13600K'],
      'AMD': ['Ryzen 9 7950X', 'Ryzen 7 7700X', 'Ryzen 5 7600X']
    },
    'MOTHERBOARD': {
      'ASUS': ['ROG MAXIMUS Z790 HERO', 'TUF GAMING Z790-PLUS'],
      'GIGABYTE': ['Z790 AORUS MASTER', 'B760 GAMING X']
    }
    // 其他类型和品牌的型号数据...
  }
  return models[type]?.[brand] || []
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.compatibility-check-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.component-card {
  margin-bottom: 20px;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-actions {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;
}

.result-section {
  margin-top: 30px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-result {
  margin-bottom: 20px;
}

.detailed-results {
  margin-bottom: 20px;
}

.detailed-results h3 {
  margin-bottom: 15px;
  color: #333;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-details p {
  margin: 5px 0;
  line-height: 1.6;
}

.check-info {
  margin-top: 20px;
}
</style>