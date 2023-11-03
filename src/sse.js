import axios from 'axios'
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

export default service