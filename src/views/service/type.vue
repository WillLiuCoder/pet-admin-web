<template>
  <div class="service-type">
    <!-- 操作按钮 -->
    <el-card class="action-card">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增服务类型
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="serviceId" label="ID" width="80" />
        <el-table-column prop="kind" label="宠物类别" width="150" />
        <el-table-column prop="name" label="服务名称" width="150" />
        <el-table-column prop="description" label="服务描述" min-width="200" />
        <el-table-column prop="basePrice" label="基础价格" width="120">
          <template #default="{ row }">
            ¥{{ row.basePrice }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="预计时长" width="120">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ENABLED' ? 'success' : 'danger'">
              {{ row.status === 'ENABLED' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 'ENABLED' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'ENABLED' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服务名称" />
        </el-form-item>

        <el-form-item label="服务描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入服务描述"
          />
        </el-form-item>

        <el-form-item label="基础价格" prop="basePrice">
          <el-input-number
            v-model="form.basePrice"
            :min="0"
            :precision="2"
            :step="0.5"
            placeholder="请输入基础价格"
          />
        </el-form-item>

        <el-form-item label="预计时长" prop="duration">
          <el-input-number
            v-model="form.duration"
            :min="1"
            :precision="0"
            :step="5"
            placeholder="请输入预计时长(分钟)"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="ENABLED">启用</el-radio>
            <el-radio value="DISABLED">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单
const formRef = ref()
const form = reactive({
  serviceId: '',
  name: '',
  description: '',
  basePrice: 0,
  duration: 30,
  status: 'ENABLED'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入服务描述', trigger: 'blur' }
  ],
  basePrice: [
    { required: true, message: '请输入基础价格', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入预计时长', trigger: 'blur' }
  ]
}

// 提交状态
const submitting = ref(false)

// 获取服务类型列表
const fetchServiceTypeList = async () => {
  try {
    loading.value = true
    // TODO: 调用实际的API
    // const response = await getServiceTypeList()

    // 模拟数据
    tableData.value = [
      {
        serviceId: 1,
        kind: '猫类',
        name: '宠物喂养服务',
        description: '为宠物提供定时喂养服务，包括食物准备、投喂、清理等',
        basePrice: 30.00,
        duration: 30,
        status: 'ENABLED',
        createTime: '2024-01-01 10:00:00'
      },
      {
        serviceId: 2,
        kind: '犬类',
        name: '遛狗服务',
        description: '为狗狗提供户外遛弯服务，包括运动、排泄、社交等',
        basePrice: 50.00,
        duration: 60,
        status: 'ENABLED',
        createTime: '2024-01-01 10:00:00'
      }
    ]
  } catch (error) {
    ElMessage.error('获取服务类型列表失败')
  } finally {
    loading.value = false
  }
}

// 新增
const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增服务类型'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑服务类型'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      // TODO: 调用更新API
      // await updateServiceType(form)
      ElMessage.success('更新成功')
    } else {
      // TODO: 调用创建API
      // await createServiceType(form)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchServiceTypeList()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    const action = row.status === 'ENABLED' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}该服务类型吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用切换状态API
    ElMessage.success(`${action}成功`)
    fetchServiceTypeList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该服务类型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用删除API
    ElMessage.success('删除成功')
    fetchServiceTypeList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 刷新
const handleRefresh = () => {
  fetchServiceTypeList()
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    serviceId: '',
    name: '',
    description: '',
    basePrice: 0,
    duration: 30,
    status: 'ENABLED'
  })
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchServiceTypeList()
})
</script>

<style scoped>
.service-type {
  min-height: 100%;
}

.action-card {
  margin-bottom: 20px;
}
</style>