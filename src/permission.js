import router from './router'

const whiteList = ['/login']

router.beforeEach(async(to, from, next) => {
  const token = localStorage.getItem('token')
  const api_url = localStorage.getItem('api_url')
  const api_port = localStorage.getItem('api_port')
  if (token && api_url && api_port) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login`)
    }
  }
})
