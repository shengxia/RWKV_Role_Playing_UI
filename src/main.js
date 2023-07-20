import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Mint from 'mint-ui';
import 'mint-ui/lib/style.css'
import './permission'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
Vue.use(Mint);