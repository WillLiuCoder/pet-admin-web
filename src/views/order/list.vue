<template>
  <div class="order-list">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择订单状态" clearable>
            <el-option label="待支付" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="已派单" value="ASSIGNED" />
            <el-option label="服务中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="已退款" value="REFUNDED" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="searchForm.serviceType" placeholder="请选择服务类型" clearable>
            <el-option label="喂养服务" value="FEEDING" />
            <el-option label="遛狗服务" value="WALKING" />
            <el-option label="宠物护理" value="GROOMING" />
            <el-option label="紧急服务" value="EMERGENCY" />
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
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出订单
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
        <el-table-column prop="orderId" label="订单号" width="120" />
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="petName" label="宠物名称" width="100" />
        <el-table-column prop="serviceType" label="服务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getServiceTypeTag(row.serviceType)">
              {{ getServiceTypeText(row.serviceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="caregiverName" label="服务人员" width="100" />
        <el-table-column prop="scheduledTime" label="预约时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.scheduledTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
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
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'PAID'"
              size="small"
              type="primary"
              @click="handleAssign(row)"
            >
              派单
            </el-button>
            <el-button
              v-if="row.status === 'IN_PROGRESS'"
              size="small"
              type="success"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
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

    <!-- 派单对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="派单给服务人员"
      width="600px"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择服务人员">
          <el-select
            v-model="assignForm.caregiverId"
            placeholder="请选择服务人员"
            filterable
          >
            <el-option
              v-for="caregiver in availableCaregivers"
              :key="caregiver.caregiverId"
              :label="`${caregiver.realName} (${caregiver.phone})`"
              :value="caregiver.caregiverId"
            >
              <div class="caregiver-option">
                <span>{{ caregiver.realName }}</span>
                <span class="caregiver-phone">{{ caregiver.phone }}</span>
                <el-tag size="small" :type="caregiver.isOnline ? 'success' : 'info'">
                  {{ caregiver.isOnline ? '在线' : '离线' }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignSubmit">确定派单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// 搜索表单
const searchForm = reactive({
  orderId: '',
  customerName: '',
  status: '',
  serviceType: ''
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

// 派单对话框
const assignDialogVisible = ref(false)
const assignForm = reactive({
  orderId: null,
  caregiverId: null
})

// 可用服务人员
const availableCaregivers = ref([])

// 模拟获取订单列表数据
const fetchOrderList = async () => {
  try {
    loading.value = true
    // TODO: 调用实际的订单API
    // const response = await getOrderList(params)

    // 模拟数据
    tableData.value = [
      {
        orderId: 'ORD001',
        customerName: '张三',
        petName: '小白',
        serviceType: 'FEEDING',
        caregiverName: '李四',
        scheduledTime: '2024-01-15 14:00:00',
        totalAmount: 50.00,
        status: 'PAID',
        createTime: '2024-01-14 10:00:00'
      }
    ]
    pagination.total = 1
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchOrderList()
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.current = 1
  fetchOrderList()
}

// 查看订单详情
const handleView = (row) => {
  // TODO: 实现查看订单详情
  ElMessage.info('查看订单详情功能待实现')
}

// 派单
const handleAssign = (row) => {
  assignForm.orderId = row.orderId
  assignForm.caregiverId = null
  assignDialogVisible.value = true

  // 获取可用服务人员
  fetchAvailableCaregivers()
}

// 获取可用服务人员
const fetchAvailableCaregivers = async () => {
  try {
    // TODO: 调用实际的API获取可用服务人员
    availableCaregivers.value = [
      {
        caregiverId: 1,
        realName: '李四',
        phone: '13800138001',
        isOnline: true
      }
    ]
  } catch (error) {
    ElMessage.error('获取可用服务人员失败')
  }
}

// 提交派单
const handleAssignSubmit = async () => {
  if (!assignForm.caregiverId) {
    ElMessage.warning('请选择服务人员')
    return
  }

  try {
    // TODO: 调用实际的派单API
    ElMessage.success('派单成功')
    assignDialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    ElMessage.error('派单失败')
  }
}

// 完成订单
const handleComplete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要完成该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用实际的完成订单API
    ElMessage.success('订单已完成')
    fetchOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 刷新
const handleRefresh = () => {
  fetchOrderList()
}

// 导出订单
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchOrderList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchOrderList()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 获取服务类型标签类型
const getServiceTypeTag = (type) => {
  const tagMap = {
    'FEEDING': 'primary',
    'WALKING': 'success',
    'GROOMING': 'warning',
    'EMERGENCY': 'danger'
  }
  return tagMap[type] || 'info'
}

// 获取服务类型文本
const getServiceTypeText = (type) => {
  const textMap = {
    'FEEDING': '喂养服务',
    'WALKING': '遛狗服务',
    'GROOMING': '宠物护理',
    'EMERGENCY': '紧急服务'
  }
  return textMap[type] || type
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'PENDING': 'warning',
    'PAID': 'primary',
    'ASSIGNED': 'info',
    'IN_PROGRESS': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'danger',
    'REFUNDED': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '待支付',
    'PAID': '已支付',
    'ASSIGNED': '已派单',
    'IN_PROGRESS': '服务中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'REFUNDED': '已退款'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.order-list {
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

.caregiver-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.caregiver-phone {
  color: #909399;
  font-size: 12px;
}
</style>