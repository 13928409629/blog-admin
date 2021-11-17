import request from '@/utils/request'

const api = {
  insertArticle: '/article/insert', // 插入文章
  deleteArticle: '/article/delete', // 删除文章
  getArticleList: '/article/list', // 查询文章列表
  updateArticle: '/article/update', // 查询文章列表

  insertTag: '/tag/insert', // 插入标签
  deleteTag: '/tag/delete', // 删除标签
  getTagList: '/tag/list', // 查询标签列表
  updateTag: '/tag/update', // 查询标签列表

  insertComment: '/comment/insert', // 插入评论
  deleteComment: '/comment/delete', // 删除评论
  getCommentList: '/comment/list', // 查询评论列表
  updateComment: '/comment/update', // 查询评论列表

  insertMessage: '/message/insert', // 插入留言
  deleteMessage: '/message/delete', // 删除留言
  getMessageList: '/message/list', // 查询留言列表
  updateMessage: '/message/update', // 查询留言列表

  getUserList: '/user/list', // 获取用户列表
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
export function updateArticle (params) {
  return request({
    url: api.updateArticle,
    method: 'post',
    data: params
  })
}

// 标签
export function insertTag (params) {
  return request({
    url: api.insertTag,
    method: 'post',
    data: params
  })
}
export function deleteTag (params) {
  return request({
    url: api.deleteTag,
    method: 'post',
    data: params
  })
}
export function getTagList (params) {
  return request({
    url: api.getTagList,
    method: 'get',
    params: params
  })
}
export function updateTag (params) {
  return request({
    url: api.updateTag,
    method: 'post',
    data: params
  })
}

// 评论
export function insertComment (params) {
  return request({
    url: api.insertComment,
    method: 'post',
    data: params
  })
}
export function deleteComment (params) {
  return request({
    url: api.deleteComment,
    method: 'post',
    data: params
  })
}
export function getCommentList (params) {
  return request({
    url: api.getCommentList,
    method: 'get',
    params: params
  })
}
export function updateComment (params) {
  return request({
    url: api.updateComment,
    method: 'post',
    data: params
  })
}

// 留言
export function insertMessage (params) {
  return request({
    url: api.insertMessage,
    method: 'post',
    data: params
  })
}
export function deleteMessage (params) {
  return request({
    url: api.deleteMessage,
    method: 'post',
    data: params
  })
}
export function getMessageList (params) {
  return request({
    url: api.getMessageList,
    method: 'get',
    params: params
  })
}
export function updateMessage (params) {
  return request({
    url: api.updateMessage,
    method: 'post',
    data: params
  })
}
export function getUserList (params) {
  return request({
    url: api.getUserList,
    method: 'get',
    params: params
  })
}
