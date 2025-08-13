import request from '@/utils/request'

export function login(data) {
  return request({
    baseURL: '/pet-auth/api',
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    baseURL: '/pet-auth/api',
    url: '/auth/register',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    baseURL: '/pet-auth/api',
    url: '/auth/userinfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    baseURL: '/pet-auth/api',
    url: '/auth/logout',
    method: 'post'
  })
}