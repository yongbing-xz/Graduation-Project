<!--
ComponentManagement.vue - 硬件组件管理页面
功能：
1. 展示系统支持的所有硬件组件列表
2. 支持组件的增删改查操作
3. 提供组件类型筛选和搜索功能
4. 支持批量操作和分页展示
-->
<template>
  <Layout>
    <div class="component-management-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>组件管理</h2>
        <p>管理系统支持的硬件组件品牌和型号信息</p>
      </div>

      <!-- 操作工具栏 -->
      <el-card class="toolbar">
        <div class="toolbar-content">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><plus /></el-icon>
            添加组件
          </el-button>
          
          <el-button @click="refreshData">
            <el-icon><refresh /></el-icon>
            刷新
          </el-button>

          <div class="search-area">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索组件名称或型号"
              clearable
              style="width: 300px"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </el-card>

      <!-- 组件列表 -->
      <el-card class="component-list">
        <template #header>
          <span>组件列表</span>
        </template>

        <el-table
          :data="filteredComponents"
          v-loading="loading"
          style="width: 100%"
          :default-sort="{ prop: 'type', order: 'ascending' }"
        >
          <el-table-column prop="name" label="组件名称" min-width="120" sortable>
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
              <span style="margin-left: 8px">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="brand" label="品牌" min-width="100" sortable />
          
          <el-table-column prop="model" label="型号" min-width="150" sortable />
          
          <el-table-column prop="specifications" label="规格" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.specifications">{{ row.specifications }}</span>
              <span v-else style="color: #999">暂无规格信息</span>
            </template>
          </el-table-column>

          <el-table-column prop="compatibilityRules" label="兼容规则" min-width="120">
            <template #default="{ row }">
              <el-tag v-if="row.compatibilityRules && row.compatibilityRules.length > 0">
                {{ row.compatibilityRules.length }} 条规则
              </el-tag>
              <span v-else style="color: #999">无规则</span>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" min-width="140" sortable>
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column prop="updatedAt" label="更新时间" min-width="140" sortable>
            <template #default="{ row }">
              {{ formatDate(row.updatedAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editComponent(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteComponent(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 添加/编辑组件对话框 -->
      <el-dialog
        v-model="showDialog"
        :title="dialogTitle"
        width="600px"
        :before-close="handleDialogClose"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-form-item label="组件类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择组件类型">
              <el-option
                v-for="type in componentTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="组件名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入组件名称" />
          </el-form-item>

          <el-form-item label="品牌" prop="brand">
            <el-input v-model="formData.brand" placeholder="请输入品牌名称" />
          </el-form-item>

          <el-form-item label="型号" prop="model">
            <el-input v-model="formData.model" placeholder="请输入型号" />
          </el-form-item>

          <el-form-item label="规格信息" prop="specifications">
            <el-input
              v-model="formData.specifications"
              type="textarea"
              :rows="3"
              placeholder="请输入规格信息，如：接口类型、尺寸、功耗等"
            />
          </el-form-item>

          <el-form-item label="兼容规则" prop="compatibilityRules">
            <el-select
              v-model="formData.compatibilityRules"
              multiple
              placeholder="请选择适用的兼容规则"
              style="width: 100%"
            >
              <el-option
                v-for="rule in availableRules"
                :key="rule.id"
                :label="rule.name"
                :value="rule.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio label="ACTIVE">启用</el-radio>
              <el-radio label="INACTIVE">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEditing ? '更新' : '创建' }}
          </el-button>
        </template>
      </el-dialog>

      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="showDeleteDialog"
        title="确认删除"
        width="400px"
      >
        <span>确定要删除组件 "{{ deletingComponent?.name }}" 吗？此操作不可恢复。</span>
        
        <template #footer>
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleting">
            确认删除
          </el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCompatibilityStore } from '@/stores/compatibility'
import Layout from '@/components/Layout.vue'

const compatibilityStore = useCompatibilityStore()

const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const formRef = ref()
const deletingComponent = ref(null)

const componentTypes = [
  { value: 'CPU', label: 'CPU' },
  { value: 'MOTHERBOARD', label: '主板' },
  { value: 'MEMORY', label: '内存' },
  { value: 'GPU', label: '显卡' },
  { value: 'STORAGE', label: '存储' },
  { value: 'POWER_SUPPLY', label: '电源' },
  { value: 'CASE', label: '机箱' }
]

const formData = reactive({
  id: '',
  type: '',
  name: '',
  brand: '',
  model: '',
  specifications: '',
  compatibilityRules: [],
  status: 'ACTIVE'
})

const formRules = {
  type: [{ required: true, message: '请选择组件类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }]
}

// 模拟可用规则数据
const availableRules = ref([
  { id: '1', name: 'CPU插槽兼容性' },
  { id: '2', name: '内存插槽兼容性' },
  { id: '3', name: '电源功率要求' },
  { id: '4', name: '机箱尺寸兼容性' },
  { id: '5', name: '接口兼容性' }
])

// 模拟组件数据
const components = ref([
  {
    id: '1',
    type: 'CPU',
    name: 'Intel Core i9-13900K',
    brand: 'Intel',
    model: 'Core i9-13900K',
    specifications: 'LGA 1700, 24核心32线程, 基础频率3.0GHz',
    compatibilityRules: ['1', '2'],
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:00:00'
  },
  {
    id: '2',
    type: 'MOTHERBOARD',
    name: 'ASUS ROG MAXIMUS Z790 HERO',
    brand: 'ASUS',
    model: 'ROG MAXIMUS Z790 HERO',
    specifications: 'LGA 1700, ATX, Z790芯片组',
    compatibilityRules: ['1', '2', '5'],
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:00:00'
  }
])

const total = computed(() => components.value.length)

const filteredComponents = computed(() => {
  let result = components.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(comp => 
      comp.name.toLowerCase().includes(keyword) ||
      comp.model.toLowerCase().includes(keyword) ||
      comp.brand.toLowerCase().includes(keyword)
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const dialogTitle = computed(() => {
  return isEditing.value ? '编辑组件' : '添加组件'
})

onMounted(() => {
  loadComponents()
})

const loadComponents = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 实际项目中这里会调用API获取数据
  } catch (error) {
    ElMessage.error('加载组件列表失败')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  isEditing.value = false
  resetForm()
  showDialog.value = true
}

const editComponent = (component) => {
  isEditing.value = true
  Object.assign(formData, component)
  showDialog.value = true
}

const deleteComponent = (component) => {
  deletingComponent.value = component
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingComponent.value) return
  
  deleting.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = components.value.findIndex(c => c.id === deletingComponent.value.id)
    if (index !== -1) {
      components.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
    showDeleteDialog.value = false
    deletingComponent.value = null
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (isEditing.value) {
      // 更新组件
      const index = components.value.findIndex(c => c.id === formData.id)
      if (index !== -1) {
        components.value[index] = { ...formData, updatedAt: new Date().toISOString() }
        ElMessage.success('更新成功')
      }
    } else {
      // 添加新组件
      const newComponent = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      components.value.unshift(newComponent)
      ElMessage.success('创建成功')
    }
    
    showDialog.value = false
    resetForm()
  } catch (error) {
    ElMessage.error('表单验证失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  showDialog.value = false
  resetForm()
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    id: '',
    type: '',
    name: '',
    brand: '',
    model: '',
    specifications: '',
    compatibilityRules: [],
    status: 'ACTIVE'
  })
}

const refreshData = () => {
  currentPage.value = 1
  loadComponents()
  ElMessage.success('数据已刷新')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getTypeName = (type) => {
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

const getTypeTagType = (type) => {
  const typeColorMap = {
    'CPU': 'primary',
    'MOTHERBOARD': 'success',
    'MEMORY': 'warning',
    'GPU': 'danger',
    'STORAGE': 'info',
    'POWER_SUPPLY': '',
    'CASE': ''
  }
  return typeColorMap[type] || ''
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.component-management-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 14px;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.component-list {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-table .cell) {
  line-height: 1.6;
}

:deep(.el-table .el-tag) {
  margin-right: 5px;
}
  </Layout>
</style>