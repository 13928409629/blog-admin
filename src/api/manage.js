import request from '@/utils/request'

const api = {
  insertArticle: '/article/insert', // 插入文章
  deleteArticle: '/article/delete', // 删除文章
  getArticleList: '/article/list', // 查询文章列表
}

export default api

export function insertArticle (params) {
  return request({
    url: api.insertArticle,
    method: 'post',
    data: params
  })
}

export function deleteArticle (params) {
  return request({
    url: api.deleteArticle,
    method: 'post',
    data: params
  })
}
export function getArticleList (params) {
  return request({
    url: api.getArticleList,
    method: 'get',
    params: params
  })
}
