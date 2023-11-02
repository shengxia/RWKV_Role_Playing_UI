<template>
  <div>
    <mt-header fixed title="角色">
      <router-link to="/" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
    </mt-header>
    <div class="page-form">
      <mt-cell class="chat_text" title="角色形象">
        <img @click="change_avatar()" :src="avatar" width="64" height="64" style="margin-bottom:4px">
      </mt-cell>
      <input type="file" ref="iptRef" style="display: none" accept=".png,.jpg" @change="handle_pic" />
      <mt-field label="角色名字" placeholder="角色的名字" v-model="char_data.bot" class="chat_text"></mt-field>
      <mt-field label="你的名字" placeholder="AI怎么称呼你" v-model="char_data.user" class="chat_text"></mt-field>
      <mt-cell class="chat_text" title="用User和Assistant代替你和角色的名字">
        <mt-switch v-model="char_data.use_qa"></mt-switch>
      </mt-cell>
      <mt-field label="开场白" placeholder="开场白" type="textarea" rows="4" v-model="char_data.greeting" class="chat_text"></mt-field>
      <mt-field label="角色性格" placeholder="角色的性格" type="textarea" rows="6" v-model="char_data.bot_persona" class="chat_text"></mt-field>
      <mt-field label="示例对话" placeholder="请输入示例对话" type="textarea" rows="16" v-model="char_data.example_message" class="chat_text"></mt-field>
      <mt-button class="save_btn" @click="save_char" type="primary">保存角色</mt-button>
    </div>
  </div>
</template>
<script>
import { getCharacterDetail, saveCharacter } from '@/api/char'
import { picCompress } from '../picCompress'
import defaultImage from '@/assets/default.png';
import { MessageBox } from 'mint-ui';
export default {
  name: 'Home',
  data() {
    return {
      char_name: this.$route.query.char_name,
      avatar: defaultImage,
      char_data: {
        bot: '',
        user: '',
        greeting: '',
        bot_persona: '',
        example_message: '',
        avatar: '',
        use_qa: false
      }
    }
  },
  mounted() {
    if(this.char_name) {
      this.getCharDetail()
    }
  },
  methods: {
    getCharDetail() {
      getCharacterDetail(localStorage.getItem('user_name'), this.char_name).then((res) => {
        this.char_data = res.data;
        if(res.data.avatar) {
          this.avatar = res.data.avatar
        } else {
          this.avatar = defaultImage
        }
      })
    },
    save_char() {
      saveCharacter(localStorage.getItem('user_name'), this.char_data.bot, this.char_data.user, 
        this.char_data.greeting, this.char_data.bot_persona, this.char_data.example_message, 
        this.char_data.use_qa, this.char_data.avatar
      ).then(() => {
        this.$router.push({path: '/'})
      })
    },
    change_avatar() {
      this.$refs.iptRef.click()
    },
    handle_pic(e) {
      const pic = e.target.files[0]
      if(pic.type !== 'image/png' && pic.type !== 'image/jpeg') {
        MessageBox.alert('请上传格式为png或jpg的图片文件。', '错误');
      }
      picCompress.methods.compressImg(pic).then((res) => {
        this.avatar = res
        this.char_data.avatar = res
      });
    }
  }
}
</script>
<style>
.page-form {
  margin-top: 32px;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  padding: 16px;
}
.chat_text {
  border-bottom: 1px solid #eee;
}
.page-form .mint-field-core {
  font-size: 12px;
}
.save_btn{
  margin-top: 8px;
  width: 100%;
}
</style>
