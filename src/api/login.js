import request from '@/request'

export function login(user_name, password) {
  return request({
    url: '/login',
    method: 'post',
    data: {
      user_name: user_name,
      password: password
    }
  })
}

export function loginTmp() {
  return request({
    url: '/login/tmp',
    method: 'post',
    data: {}
  })
}
