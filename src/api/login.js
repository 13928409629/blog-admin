import request from '@/utils/request'

const userApi = {
  Login: '/user/login',
  Logout: '/logout',
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (params) {
  return request({
    url: userApi.Login,
    method: 'post',
    data: params
  })
}
export function logout () {
  return request({
    url: userApi.Logout,
    method: 'post',
  })
}
