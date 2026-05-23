<!--
RuleManagement.vue - 硬件兼容规则管理页面
功能：
1. 展示系统所有的硬件兼容规则列表
2. 支持规则的增删改查操作
3. 提供规则搜索和筛选功能
4. 支持规则的导入导出功能
5. 支持查看和编辑规则详情
-->
<template>
  <Layout>
    <div class="rule-management">
      <div class="header">
        <h2>规则管理</h2>
        <p>管理硬件兼容性检测规则</p>
      </div>

      <!-- 搜索和操作区域 -->
      <div class="toolbar">
        <div class="search-area">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索规则名称或描述"
            clearable
            style="width: 300px"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="handleCreate">
            <el-icon><plus /></el-icon>
            新建规则
          </el-button>
          <el-button @click="handleImport">
            <el-icon><upload /></el-icon>
            导入规则
          </el-button>
          <el-button @click="handleExport">
            <el-icon><download /></el-icon>
            导出规则
          </el-button>
        </div>
      </div>

      <!-- 规则列表 -->
      <div class="rule-list">
        <el-table
          :data="filteredRules"
          v-loading="loading"
          style="width: 100%"
          :default-sort="{ prop: 'createdAt', order: 'descending' }"
        >
          <el-table-column prop="name" label="规则名称" min-width="200" sortable>
            <template #default="{ row }">
              <span class="rule-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="type" label="规则类型" min-width="120" sortable>
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="规则描述" min-width="250" show-overflow-tooltip />

          <el-table-column prop="priority" label="优先级" width="100" sortable>
            <template #default="{ row }">
              <el-rate
                v-model="row.priority"
                :max="5"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100" sortable>
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="'ACTIVE'"
                :inactive-value="'INACTIVE'"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="160" sortable>
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">
                <el-icon><edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">
                <el-icon><delete /></el-icon>
                删除
              </el-button>
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
      </div>

      <!-- 规则编辑对话框 -->
      <el-dialog
        v-model="showDialog"
        :title="isEditing ? '编辑规则' : '新建规则'"
        width="800px"
        :before-close="handleDialogClose"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          label-position="left"
        >
          <el-form-item label="规则名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入规则名称" />
          </el-form-item>

          <el-form-item label="规则类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择规则类型">
              <el-option
                v-for="type in ruleTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="优先级" prop="priority">
            <el-rate
              v-model="formData.priority"
              :max="5"
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </el-form-item>

          <el-form-item label="规则描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入规则描述"
            />
          </el-form-item>

          <el-form-item label="规则条件" prop="conditions">
            <el-input
              v-model="formData.conditions"
              type="textarea"
              :rows="4"
              placeholder="请输入规则条件（JSON格式）"
            />
          </el-form-item>

          <el-form-item label="规则动作" prop="actions">
            <el-input
              v-model="formData.actions"
              type="textarea"
              :rows="4"
              placeholder="请输入规则动作（JSON格式）"
            />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="'ACTIVE'"
              :inactive-value="'INACTIVE'"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleDialogClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              {{ isEditing ? '更新' : '创建' }}
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="showDeleteDialog"
        title="确认删除"
        width="400px"
      >
        <p>确定要删除规则 "{{ deletingRule?.name }}" 吗？此操作不可恢复。</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDeleteDialog = false">取消</el-button>
            <el-button type="danger" @click="confirmDelete" :loading="deleting">
              确认删除
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Upload,
  Download,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'

const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const formRef = ref()
const deletingRule = ref(null)

const ruleTypes = [
  { value: 'CPU_COMPATIBILITY', label: 'CPU兼容性' },
  { value: 'MOTHERBOARD_COMPATIBILITY', label: '主板兼容性' },
  { value: 'MEMORY_COMPATIBILITY', label: '内存兼容性' },
  { value: 'GPU_COMPATIBILITY', label: '显卡兼容性' },
  { value: 'STORAGE_COMPATIBILITY', label: '存储兼容性' },
  { value: 'POWER_COMPATIBILITY', label: '电源兼容性' },
  { value: 'CASE_COMPATIBILITY', label: '机箱兼容性' },
  { value: 'CUSTOM', label: '自定义规则' }
]

const formData = reactive({
  id: '',
  name: '',
  type: '',
  description: '',
  conditions: '',
  actions: '',
  priority: 3,
  status: 'ACTIVE'
})

const formRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入规则描述', trigger: 'blur' }]
}

// 模拟规则数据
const rules = ref([
  {
    id: '1',
    name: 'CPU插槽兼容性检查',
    type: 'CPU_COMPATIBILITY',
    description: '检查CPU插槽与主板的兼容性',
    conditions: '{"cpuSocket": "required", "mbSocket": "required"}',
    actions: '{"action": "compare", "fields": ["cpuSocket", "mbSocket"]}',
    priority: 5,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    name: '内存代数兼容性检查',
    type: 'MEMORY_COMPATIBILITY',
    description: '检查内存代数与主板的兼容性',
    conditions: '{"ramType": "required", "mbRamType": "required"}',
    actions: '{"action": "compare", "fields": ["ramType", "mbRamType"]}',
    priority: 4,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-16').toISOString()
  },
  {
    id: '3',
    name: '显卡尺寸兼容性检查',
    type: 'CASE_COMPATIBILITY',
    description: '检查显卡尺寸与机箱的兼容性',
    conditions: '{"gpuLength": "required", "caseMaxGpuLength": "required"}',
    actions: '{"action": "compareSize", "fields": ["gpuLength", "caseMaxGpuLength"]}',
    priority: 3,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-17').toISOString()
  }
])

const filteredRules = computed(() => {
  let filtered = rules.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(rule => 
      rule.name.toLowerCase().includes(keyword) ||
      rule.description.toLowerCase().includes(keyword)
    )
  }
  
  total.value = filtered.length
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  return filtered.slice(start, end)
})

const getTypeTagType = (type) => {
  const typeMap = {
    'CPU_COMPATIBILITY': 'primary',
    'MOTHERBOARD_COMPATIBILITY': 'success',
    'MEMORY_COMPATIBILITY': 'warning',
    'GPU_COMPATIBILITY': 'danger',
    'STORAGE_COMPATIBILITY': 'info',
    'POWER_COMPATIBILITY': 'primary',
    'CASE_COMPATIBILITY': 'success',
    'CUSTOM': 'warning'
  }
  return typeMap[type] || 'info'
}

const getTypeName = (type) => {
  const typeMap = {
    'CPU_COMPATIBILITY': 'CPU兼容性',
    'MOTHERBOARD_COMPATIBILITY': '主板兼容性',
    'MEMORY_COMPATIBILITY': '内存兼容性',
    'GPU_COMPATIBILITY': '显卡兼容性',
    'STORAGE_COMPATIBILITY': '存储兼容性',
    'POWER_COMPATIBILITY': '电源兼容性',
    'CASE_COMPATIBILITY': '机箱兼容性',
    'CUSTOM': '自定义规则'
  }
  return typeMap[type] || type
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleCreate = () => {
  isEditing.value = false
  Object.assign(formData, {
    id: '',
    name: '',
    type: '',
    description: '',
    conditions: '',
    actions: '',
    priority: 3,
    status: 'ACTIVE'
  })
  showDialog.value = true
}

const handleEdit = (rule) => {
  isEditing.value = true
  Object.assign(formData, { ...rule })
  showDialog.value = true
}

const handleDelete = (rule) => {
  deletingRule.value = rule
  showDeleteDialog.value = true
}

const handleStatusChange = async (rule) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success(`规则 ${rule.name} 状态已${rule.status === 'ACTIVE' ? '启用' : '禁用'}`)
  } catch (error) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    rule.status = rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEditing.value) {
      // 更新规则
      const index = rules.value.findIndex(r => r.id === formData.id)
      if (index !== -1) {
        rules.value[index] = { ...formData }
      }
      ElMessage.success('规则更新成功')
    } else {
      // 创建新规则
      const newRule = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      rules.value.unshift(newRule)
      ElMessage.success('规则创建成功')
    }
    
    showDialog.value = false
  } catch (error) {
    ElMessage.error('表单验证失败')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async () => {
  if (!deletingRule.value) return
  
  try {
    deleting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    rules.value = rules.value.filter(r => r.id !== deletingRule.value.id)
    ElMessage.success('规则删除成功')
    showDeleteDialog.value = false
    deletingRule.value = null
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const handleDialogClose = () => {
  showDialog.value = false
  formRef.value?.resetFields()
}

const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  total.value = rules.value.length
})
</script>

<style scoped>
.rule-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.search-area {
  flex: 1;
  max-width: 400px;
}

.actions {
  display: flex;
  gap: 10px;
}

.rule-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rule-name {
  font-weight: 600;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .search-area {
    max-width: none;
  }
  
  .actions {
    justify-content: flex-start;
  }
}
</style>