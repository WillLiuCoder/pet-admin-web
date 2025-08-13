import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      }
    ]
  },
  {
    path: '/caregiver',
    component: Layout,
    redirect: '/caregiver/list',
    meta: { title: '服务人员管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'CaregiverList',
        component: () => import('@/views/caregiver/list.vue'),
        meta: { title: '服务人员列表' }
      },
      {
        path: 'create',
        name: 'CaregiverCreate',
        component: () => import('@/views/caregiver/create.vue'),
        meta: { title: '新增服务人员' }
      },
      {
        path: 'edit/:id',
        name: 'CaregiverEdit',
        component: () => import('@/views/caregiver/edit.vue'),
        meta: { title: '编辑服务人员' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    meta: { title: '订单管理', icon: 'Document' },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单列表' }
      }
    ]
  },
  {
    path: '/service',
    component: Layout,
    redirect: '/service/type',
    meta: { title: '服务管理', icon: 'Service' },
    children: [
      {
        path: 'type',
        name: 'ServiceType',
        component: () => import('@/views/service/type.vue'),
        meta: { title: '服务类型' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user.vue'),
        meta: { title: '用户管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router