<template>
  <div class="caregiver-create">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新增服务人员</span>
          <el-button @click="$router.go(-1)">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时薪" prop="hourlyRate">
              <el-input-number
                v-model="form.hourlyRate"
                :min="0"
                :precision="2"
                :step="0.5"
                placeholder="请输入时薪"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像" prop="avatarUrl">
              <el-input v-model="form.avatarUrl" placeholder="请输入头像URL" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="服务区域" prop="serviceZones">
          <el-select
            v-model="form.serviceZones"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入服务区域"
          >
            <el-option
              v-for="zone in commonZones"
              :key="zone"
              :label="zone"
              :value="zone"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="证书信息" prop="certifications">
          <el-select
            v-model="form.certifications"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入证书信息"
          >
            <el-option
              v-for="cert in commonCerts"
              :key="cert"
              :label="cert"
              :value="cert"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="个人介绍" prop="introduction">
          <el-input
            v-model="form.introduction"
            type="textarea"
            rows="4"
            placeholder="请输入个人介绍"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            提交
          </el-button>
          <el-button @click="$router.go(-1)">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createCaregiver } from '@/api/caregiver'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

// 表单数据
const form = reactive({
  realName: '',
  idCard: '',
  phone: '',
  email: '',
  hourlyRate: 0,
  avatarUrl: '',
  serviceZones: [],
  certifications: [],
  introduction: ''
})

// 表单验证规则
const rules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  hourlyRate: [
    { required: true, message: '请输入时薪', trigger: 'blur' }
  ],
  serviceZones: [
    { required: true, message: '请选择服务区域', trigger: 'change' }
  ]
}

// 常用服务区域
const commonZones = [
  '朝阳区', '海淀区', '西城区', '东城区', '丰台区', '石景山区',
  '通州区', '昌平区', '大兴区', '房山区', '顺义区', '门头沟区'
]

// 常用证书
const commonCerts = [
  '宠物护理师证书', '宠物急救证书', '宠物美容师证书',
  '动物医学相关证书', '宠物训练师证书'
]

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await createCaregiver(form)
    ElMessage.success('创建成功')
    router.push('/caregiver/list')
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.caregiver-create {
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>