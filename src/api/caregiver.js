import request from '@/utils/request'

export function getCaregiverList(params) {
  return request({
    url: '/caregivers/page',
    baseURL: '/pet-admin/api',
    method: 'get',
    params
  })
}

export function getCaregiverById(id) {
  return request({
    url: `/caregivers/${id}`,
    baseURL: '/pet-admin/api',
    method: 'get'
  })
}

export function createCaregiver(data) {
  return request({
    url: '/caregivers',
    baseURL: '/pet-admin/api',
    method: 'post',
    data
  })
}

export function updateCaregiver(data) {
  return request({
    url: '/caregivers',
    baseURL: '/pet-admin/api',
    method: 'put',
    data
  })
}

export function deleteCaregiver(id) {
  return request({
    url: `/caregivers/${id}`,
    baseURL: '/pet-admin/api',
    method: 'delete'
  })
}

export function reviewCaregiver(id, status, reviewNote) {
  return request({
    url: `/caregivers/${id}/review`,
    baseURL: '/pet-admin/api',
    method: 'post',
    params: { status, reviewNote }
  })
}

export function updateCaregiverStatus(id, status) {
  return request({
    url: `/caregivers/${id}/status`,
    baseURL: '/pet-admin/api',
    method: 'put',
    params: { status }
  })
}

export function updateOnlineStatus(id, isOnline) {
  return request({
    url: `/caregivers/${id}/online`,
    baseURL: '/pet-admin/api',
    method: 'put',
    params: { isOnline }
  })
}

export function updateBusyStatus(id, isBusy) {
  return request({
    url: `/caregivers/${id}/busy`,
    baseURL: '/pet-admin/api',
    method: 'put',
    params: { isBusy }
  })
}

export function getCaregiverStatistics() {
  return request({
    url: '/caregivers/statistics',
    baseURL: '/pet-admin/api',
    method: 'get'
  })
}