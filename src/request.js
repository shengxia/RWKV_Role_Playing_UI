import axios from 'axios'
import { Toast } from 'mint-ui';
import { Indicator } from 'mint-ui';

const service = axios.create({
  timeout: 300000
})

service.interceptors.request.use(
  config => {
    Indicator.open();
    config.baseURL = localStorage.getItem('api_url') + ':' + localStorage.getItem('api_port')
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    config.transformRequest = [function(data) {
      data['token'] = localStorage.getItem('token')
      let ret = ''
      for (const it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      ret = ret.substr(0, ret.length - 1)
      return ret
    }]
    return config
  },
  error => {
    Indicator.close();
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    Indicator.close();
    const res = response.data
    if (res.code !== 200) {
      Toast({
        message: res.message || '请求错误，请稍后再试',
        position: 'bottom',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    Indicator.close();
    Toast({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
