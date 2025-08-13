<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-content">
            <div class="statistics-icon">
              <el-icon size="40" color="#409EFF"><User /></el-icon>
            </div>
            <div class="statistics-info">
              <div class="statistics-number">{{ statistics.totalCount || 0 }}</div>
              <div class="statistics-label">总服务人员</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-content">
            <div class="statistics-icon">
              <el-icon size="40" color="#67C23A"><Check /></el-icon>
            </div>
            <div class="statistics-info">
              <div class="statistics-number">{{ statistics.statusCounts?.APPROVED || 0 }}</div>
              <div class="statistics-label">已认证人员</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-content">
            <div class="statistics-icon">
              <el-icon size="40" color="#E6A23C"><Clock /></el-icon>
            </div>
            <div class="statistics-info">
              <div class="statistics-number">{{ statistics.onlineCount || 0 }}</div>
              <div class="statistics-label">在线人员</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-content">
            <div class="statistics-icon">
              <el-icon size="40" color="#F56C6C"><Star /></el-icon>
            </div>
            <div class="statistics-info">
              <div class="statistics-number">{{ statistics.averageRating || 0 }}</div>
              <div class="statistics-label">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>服务人员状态分布</span>
          </template>
          <div class="chart-container">
            <div ref="statusChartRef" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近服务人员</span>
          </template>
          <div class="recent-caregivers">
            <div
              v-for="caregiver in recentCaregivers"
              :key="caregiver.caregiverId"
              class="caregiver-item"
            >
              <el-avatar :src="caregiver.avatarUrl" :size="40">
                {{ caregiver.realName?.charAt(0) }}
              </el-avatar>
              <div class="caregiver-info">
                <div class="caregiver-name">{{ caregiver.realName }}</div>
                <div class="caregiver-status">
                  <el-tag :type="getStatusType(caregiver.status)" size="small">
                    {{ getStatusText(caregiver.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="caregiver-time">
                {{ formatDate(caregiver.createTime) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getCaregiverList, getCaregiverStatistics } from '@/api/caregiver'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

// 统计数据
const statistics = ref({})
const recentCaregivers = ref([])
const statusChartRef = ref()

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await getCaregiverStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近服务人员
const fetchRecentCaregivers = async () => {
  try {
    const response = await getCaregiverList({ page: 1, size: 5 })
    recentCaregivers.value = response.data.content
  } catch (error) {
    console.error('获取最近服务人员失败:', error)
  }
}

// 初始化状态分布图表
const initStatusChart = () => {
  if (!statusChartRef.value) return

  const chart = echarts.init(statusChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '服务人员状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statistics.value.statusCounts?.PENDING || 0, name: '审核中' },
          { value: statistics.value.statusCounts?.APPROVED || 0, name: '已认证' },
          { value: statistics.value.statusCounts?.REJECTED || 0, name: '已拒绝' },
          { value: statistics.value.statusCounts?.DISABLED || 0, name: '已禁用' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
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

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

onMounted(async () => {
  await fetchStatistics()
  await fetchRecentCaregivers()

  await nextTick()
  initStatusChart()
})
</script>

<style scoped>
.dashboard {
  min-height: 100%;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistics-card {
  height: 120px;
}

.statistics-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.statistics-icon {
  margin-right: 20px;
}

.statistics-info {
  flex: 1;
}

.statistics-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.statistics-label {
  font-size: 14px;
  color: #909399;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.recent-caregivers {
  max-height: 300px;
  overflow-y: auto;
}

.caregiver-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.caregiver-item:last-child {
  border-bottom: none;
}

.caregiver-info {
  flex: 1;
  margin-left: 15px;
}

.caregiver-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.caregiver-time {
  color: #909399;
  font-size: 12px;
}
</style>