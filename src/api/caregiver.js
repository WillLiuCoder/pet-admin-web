import request from '@/utils/request'

export function getCaregiverList(params) {
  return request({
    url: '/caregivers/page',
    method: 'get',
    params
  })
}

export function getCaregiverById(id) {
  return request({
    url: `/caregivers/${id}`,
    method: 'get'
  })
}

export function createCaregiver(data) {
  return request({
    url: '/caregivers',
    method: 'post',
    data
  })
}

export function updateCaregiver(data) {
  return request({
    url: '/caregivers',
    method: 'put',
    data
  })
}

export function deleteCaregiver(id) {
  return request({
    url: `/caregivers/${id}`,
    method: 'delete'
  })
}

export function reviewCaregiver(id, status, reviewNote) {
  return request({
    url: `/caregivers/${id}/review`,
    method: 'post',
    params: { status, reviewNote }
  })
}

export function updateCaregiverStatus(id, status) {
  return request({
    url: `/caregivers/${id}/status`,
    method: 'put',
    params: { status }
  })
}

export function updateOnlineStatus(id, isOnline) {
  return request({
    url: `/caregivers/${id}/online`,
    method: 'put',
    params: { isOnline }
  })
}

export function updateBusyStatus(id, isBusy) {
  return request({
    url: `/caregivers/${id}/busy`,
    method: 'put',
    params: { isBusy }
  })
}

export function getCaregiverStatistics() {
  return request({
    url: '/caregivers/statistics',
    method: 'get'
  })
}