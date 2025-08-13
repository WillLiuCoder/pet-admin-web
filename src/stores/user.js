import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: {}
  }),

  actions: {
    async login(loginForm) {
      try {
        const response = await login(loginForm)
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        return response
      } catch (error) {
        throw error
      }
    },

    async getUserInfo() {
      try {
        const response = await getUserInfo()
        this.userInfo = response.data
        return response
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await logout()
        this.token = ''
        this.userInfo = {}
        localStorage.removeItem('token')
      } catch (error) {
        console.error('登出失败:', error)
      }
    }
  }
})
