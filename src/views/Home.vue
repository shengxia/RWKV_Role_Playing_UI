<template>
  <div class="home">
    <mt-header fixed title="rwkv角色扮演">
      <mt-button @click="logout" slot="right">退出</mt-button>
    </mt-header>
    <div class="page_part">
      <mt-cell class="chat_item" @click.native="chat(item.char_name)" v-for="(item, k) in char_list" :key="k" :title="item.char_name + '（' + item.file_name + '）'">
        <img style="border-radius:50%" slot="icon" :src="item.avatar" width="48" height="48">
        <mt-button @click.stop="edit_char(item.char_name)" size="small" type="default" style="margin-right:8px;">修改</mt-button>
        <mt-button @click.stop="del_char(item.char_name)" size="small" type="danger">删除</mt-button>
      </mt-cell>
    </div>
    <mt-button class="add_char" @click="add_char" type="primary">新增角色</mt-button>
  </div>
</template>
<script>
import { getCharacters, deleteCharacter } from '@/api/char'
import { MessageBox } from 'mint-ui';
import defaultImage from '@/assets/default.png';
export default {
  name: 'Home',
  data() {
    return {
      char_list: []
    }
  },
  mounted() {
    this.getCharList()
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user_name')
      this.$router.push({path: '/login'})
    },
    getCharList() {
      getCharacters(localStorage.getItem('user_name')).then((res) => {
        const list = res.data.list
        for(const i in list) {
          if(!list[i]['avatar']) {
            list[i]['avatar'] = defaultImage
          }
        }
        this.char_list = list
      })
    },
    add_char() {
      this.$router.push({path: '/char'})
    },
    edit_char(character_name) {
      this.$router.push({path: '/char', query: {char_name: character_name}})
    },
    del_char(character_name) {
      MessageBox.confirm('确定要删除吗？').then(action => {
        if(action) {
          deleteCharacter(localStorage.getItem('user_name'), character_name).then(() => {
            this.getCharList()
          })
        }
      }).catch(() =>{})
    },
    chat(character_name) {
      this.$router.push({path: '/chat', query: {char_name: character_name}})
    }
  }
}
</script>
<style>
.page_part {
  margin-top: 40px;
}
.add_char {
  width: 80%;
  position: fixed;
  bottom: 5px;
  left: 10%;
}
.chat_item {
  padding: 8px 0;
}
</style>
