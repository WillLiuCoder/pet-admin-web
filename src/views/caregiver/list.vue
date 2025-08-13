<template>
  <div class="caregiver-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="审核中" value="PENDING" />
            <el-option label="已认证" value="APPROVED" />
            <el-option label="已禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="action-card">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增服务人员
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
        <el-table-column prop="caregiverId" label="ID" width="80" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="hourlyRate" label="时薪" width="100">
          <template #default="{ row }">
            ¥{{ row.hourlyRate }}
          </template>
        </el-table-column>
        <el-table-column prop="avgRating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate
              v-model="row.avgRating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isOnline" label="在线状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isOnline ? 'success' : 'info'">
              {{ row.isOnline ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isBusy" label="忙碌状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isBusy ? 'warning' : 'success'">
              {{ row.isBusy ? '忙碌' : '空闲' }}
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
            <el-button size="small" type="primary" @click="handleReview(row)">审核</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="审核服务人员"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="审核状态">
          <el-select v-model="reviewForm.status" placeholder="请选择审核状态">
            <el-option label="通过" value="APPROVED" />
            <el-option label="拒绝" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="reviewForm.reviewNote"
            type="textarea"
            rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReviewSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getCaregiverList,
  deleteCaregiver,
  reviewCaregiver
} from '@/api/caregiver'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  realName: '',
  phone: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 审核对话框
const reviewDialogVisible = ref(false)
const reviewForm = reactive({
  caregiverId: null,
  status: '',
  reviewNote: ''
})

// 获取服务人员列表
const fetchCaregiverList = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      page: pagination.current,
      size: pagination.size
    }

    const response = await getCaregiverList(params)
    tableData.value = response.data.content
    pagination.total = response.data.totalElements
  } catch (error) {
    ElMessage.error('获取服务人员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchCaregiverList()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.current = 1
  fetchCaregiverList()
}

// 新增
const handleCreate = () => {
  router.push('/caregiver/create')
}

// 编辑
const handleEdit = (row) => {
  router.push(`/caregiver/edit/${row.caregiverId}`)
}

// 审核
const handleReview = (row) => {
  reviewForm.caregiverId = row.caregiverId
  reviewForm.status = ''
  reviewForm.reviewNote = ''
  reviewDialogVisible.value = true
}

// 提交审核
const handleReviewSubmit = async () => {
  try {
    await reviewCaregiver(
      reviewForm.caregiverId,
      reviewForm.status,
      reviewForm.reviewNote
    )
    ElMessage.success('审核成功')
    reviewDialogVisible.value = false
    fetchCaregiverList()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该服务人员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCaregiver(row.caregiverId)
    ElMessage.success('删除成功')
    fetchCaregiverList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 刷新
const handleRefresh = () => {
  fetchCaregiverList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchCaregiverList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchCaregiverList()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'DISABLED': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '审核中',
    'APPROVED': '已认证',
    'REJECTED': '已拒绝',
    'DISABLED': '已禁用'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchCaregiverList()
})
</script>

<style scoped>
.caregiver-list {
  min-height: 100%;
}

.search-card {
  margin-bottom: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>