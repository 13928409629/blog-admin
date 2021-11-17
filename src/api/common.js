
import request from '@/utils/request'

const api = {
  uploadFile: '/upload',
  deleteFile: '/deleteFile'
}
export default api


export function uploadFile (params) {
  return request({
    url: api.uploadFile,
    method: 'post',
    data: params
  })
}
export function deleteFile (params) {
  return request({
    url: api.deleteFile,
    method: 'post',
    data: params
  })
}
