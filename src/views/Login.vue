<template>
  <div class="login">
    <h2>登录</h2>
    <div class="page-part">
      <mt-field placeholder="请输入用户名" v-model="user_name" class="input_text"></mt-field>
      <mt-field placeholder="请输入密码" type="password" v-model="password" class="input_text"></mt-field>
      <mt-field placeholder="请输入api地址" v-model="api_url" type="url" class="input_text"></mt-field>
      <mt-field placeholder="请输入api端口号" v-model="api_port" type="number" class="input_text"></mt-field>
      <mt-button @click="doLogin" type="primary" style="width: 80%">登录</mt-button>
      <mt-button @click="doLoginTmp" type="primary" style="width: 80%; margin-top:16px">游客登录</mt-button>
    </div>
  </div>
</template>

<script>
import { login, loginTmp } from '@/api/login'
import { MessageBox } from 'mint-ui';
export default {
  name: 'Login',
  data() {
    return {
      user_name: '',
      password: '',
      api_url: localStorage.getItem('api_url') ? localStorage.getItem('api_url') : 'http://127.0.0.1',
      api_port: localStorage.getItem('api_port') ? localStorage.getItem('api_port') : '8888'
    }
  },
  methods: {
    doLogin() {
      if(!this.api_url || !this.api_port) {
        MessageBox('错误', '请输入api地址和api端口号');
        return;
      }
      localStorage.setItem('api_url', this.api_url)
      localStorage.setItem('api_port', this.api_port)
      login(this.user_name, this.password).then((res) => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user_name', res.data.user_name)
        this.$router.push({path: '/'})
      })
    },
    doLoginTmp() {
      if(!this.api_url || !this.api_port) {
        MessageBox('错误', '请输入api地址和api端口号');
        return;
      }
      localStorage.setItem('api_url', this.api_url)
      localStorage.setItem('api_port', this.api_port)
      loginTmp(this.user_name, this.password).then((res) => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user_name', res.data.user_name)
        this.$router.push({path: '/'})
      })
    }
  }
}
</script>
<style>
.login {
  margin-top: 100px;
  text-align: center;
}
.page-part {
  margin-top: 32px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}
.input_text {
  margin-bottom: 8px;
}
</style>
