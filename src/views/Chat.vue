<template>
  <div class="home">
    <mt-header fixed :title="char_name">
      <router-link to="/" slot="left">
        <mt-button icon="back"></mt-button>
      </router-link>
      <mt-button icon="more" slot="right" @click="action_visible = true"></mt-button>
    </mt-header>
    <div class="chat_area" :style="'height:' + chat_area_height + 'px'">
      <div v-for="(item, k) in chat_log_show" :key="k" :class="'message ' + (item.type == 1 ? 'message_c' : 'message_m')">
          <div v-if="item.type==1" class="circle-bot">
            <img :src="avatar">
          </div>
          <div :class="item.type == 1 ? 'text_c' : 'text_m'">
            <div :class="'username ' + (item.type == 1 ? '' : 'username-m')">
              {{item.name}}
            </div>
            <div v-html="item.text" :class="'message-body ' + (item.type == 1 ? 'message-body-c' : 'message-body-m')"></div>
          </div>
        </div>
    </div>
    <div class="function_area">
      <mt-field @keyup.native.enter="replyChat" placeholder="请输入旁白" v-model="action_text" class="reply_text"></mt-field>
      <mt-field @keyup.native.enter="replyChat" placeholder="请输入对话" v-model="talk_text" class="reply_text"></mt-field>
      <div class="btn_area">
        <mt-button @click="resayChat" type="primary" class="function_btn">重新生成</mt-button>
        <mt-button type="primary" class="function_btn">清除上一条</mt-button>
        <mt-button type="primary" class="function_btn">替角色说</mt-button>
      </div>
    </div>
    <mt-actionsheet :actions="actions" v-model="action_visible"></mt-actionsheet>
    <mt-popup class="setting_page" v-model="setting_visible" position="right" :modal="false">
      <div class="setting_form">
        <h3 style="text-align:center; margin-bottom: 16px;">对话设置</h3>
        <mt-field label="最小回复长度（0为不控制）" v-model="min_len"></mt-field>
        <mt-field label="top_p" v-model="top_p"></mt-field>
        <mt-field label="temperature" v-model="temperature"></mt-field>
        <mt-field label="presence penalty" v-model="presence_penalty"></mt-field>
        <mt-field label="frequency penalty" v-model="frequency_penalty"></mt-field>
        <mt-button class="save_setting" @click="saveChatSetting" type="primary">保存设定</mt-button>
      </div>
    </mt-popup>
  </div>
</template>
<script>
import { MessageBox } from 'mint-ui';
import { getCharacterDetail } from '@/api/char'
import { loadCharacters, resetChat, reply, resay } from '@/api/chat'
import defaultImage from '@/assets/default.png';
export default {
  name: 'Home',
  data() {
    return {
      avatar: defaultImage,
      chat_area_height: window.screen.height - 170 - 56,
      char_name: this.$route.query.char_name,
      char_data: {},
      chat_log: [],
      chat_log_show: [],
      action_text: '',
      talk_text: '',
      min_len: 0,
      top_p: localStorage.getItem('top_p') ? localStorage.getItem('top_p') : 0.65,
      temperature: localStorage.getItem('temperature') ? localStorage.getItem('temperature') : 2,
      presence_penalty: localStorage.getItem('presence_penalty') ? localStorage.getItem('presence_penalty') : 0.2,
      frequency_penalty: localStorage.getItem('frequency_penalty') ? localStorage.getItem('frequency_penalty') : 0.2,
      actions: [
        {
          name: '对话设置',
          method: this.chatSetting
        },
        {
          name: '重置对话',
          method: this.resetChat
        },
        {
          name: '调试',
          method: this.debug
        }
      ],
      action_visible: false,
      setting_visible: false
    }
  },
  mounted() {
    console.log(window.screen.height)
    this.init_chat()
  },
  methods: {
    init_chat() {
      getCharacterDetail(localStorage.getItem('user_name'), this.char_name).then((res) => {
        this.char_data = res.data
        this.avatar = this.char_data['avatar'] ? this.char_data['avatar'] : defaultImage
        loadCharacters(localStorage.getItem('user_name'), this.char_name).then((res) => {
          this.formatChat(res.data.chat)
          this.setChatLog()
        })
      })
    },
    formatChat(chat_data) {
      this.chat_log = []
      for(const i in chat_data) {
        for(const j in chat_data[i]) {
          if(chat_data[i][j]) {
            const tmp = {
              type: j,
              text: this.formatText(chat_data[i][j]),
              name: j == 0 ? this.char_data['user'] : this.char_data['bot']
            }
            this.chat_log.push(tmp)
          }
        }
      }
    },
    formatText(text) {
      const start = this.char_data.action_start
      const end = this.char_data.action_end
      let result = text.replaceAll(start, '<p>')
      result = result.replaceAll(end, '</p>')
      return result
    },
    setChatLog(){
      this.chat_log_show = JSON.parse(JSON.stringify(this.chat_log))
      this.chat_log_show.reverse()
    },
    chatSetting() {
      this.setting_visible = true
    },
    saveChatSetting() {
      if(isNaN(parseInt(this.min_len)) || this.min_len < 0 || this.min_len > 500) {
        this.min_len = 0
      }
      localStorage.setItem('min_len', this.min_len)
      if(isNaN(parseFloat(this.top_p)) || this.top_p <= 0 || this.top_p >= 1) {
        this.top_p = 0.65
      }
      localStorage.setItem('top_p', this.top_p)
      if(isNaN(parseFloat(this.temperature)) || this.temperature < 0 || this.temperature > 5) {
        this.temperature = 2
      }
      localStorage.setItem('temperature', this.temperature)
      if(isNaN(parseFloat(this.presence_penalty)) || this.presence_penalty < 0 || this.presence_penalty > 1) {
        this.presence_penalty = 0.2
      }
      localStorage.setItem('presence_penalty', this.presence_penalty)
      if(isNaN(parseFloat(this.frequency_penalty)) || this.frequency_penalty < 0 || this.frequency_penalty > 1) {
        this.frequency_penalty = 0.2
      }
      localStorage.setItem('frequency_penalty', this.frequency_penalty)
      this.setting_visible = false
    },
    resetChat() {
      MessageBox.confirm('确定要重置对话吗？').then(action => {
        if(action) {
          resetChat(localStorage.getItem('user_name'), this.char_name).then((res) => {
            this.formatChat(res.data.chat)
            this.setChatLog()
          })
        }
      }).catch(() =>{})
    },
    debug() {
      console.log(22)
    },
    replyChat() {
      let prompt = ''
      if(this.action_text) {
        prompt += this.char_data.action_start + this.action_text + this.char_data.action_end;
      }
      prompt += this.talk_text
      const tmp = {
        type: 0,
        text: this.formatText(prompt),
        name: this.char_data['user']
      }
      this.chat_log.push(tmp)
      this.setChatLog()
      this.talk_text = ''
      this.action_text = ''
      reply(localStorage.getItem('user_name'), this.char_name, prompt, this.min_len, this.top_p, this.temperature,
      this.presence_penalty, this.frequency_penalty).then((res) => {
        const reply_text = res.data.reply
        const tmp = {
          type: 1,
          text: this.formatText(reply_text),
          name: this.char_data['bot']
        }
        this.chat_log.push(tmp)
        this.setChatLog()
      })
    },
    resayChat() {
      resay(localStorage.getItem('user_name'), this.char_name, this.min_len, this.top_p, this.temperature,
      this.presence_penalty, this.frequency_penalty).then((res) => {
        const reply_text = res.data.reply
        const tmp = {
          type: 1,
          text: this.formatText(reply_text),
          name: this.char_data['bot']
        }
        this.chat_log[this.chat_log.length - 1] = tmp
        this.setChatLog()
      })
    }
  }
}
</script>
<style>
.setting_page {
  position: fixed;
  width: 100%;
  height: 100%;
}
.setting_form {
  width: 80%;
  margin: auto;
  margin-top: 100px;
}
.save_setting {
  margin-top: 16px;
  width: 100%;
}
.chat_area {
  margin-top: 40px;
  overflow-y: auto;
  padding: 8px 8px;
  display: flex;
  flex-direction: column-reverse;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.message {
  display: flex;
  padding-bottom: 25px;
  font-size: 15px;
  font-family: Helvetica, Arial, sans-serif;
  line-height: 1.428571429;
}
.message i {
  color: #999 !important;
}

.message_c {
  justify-content: flex-start;
}

.message_m {
  justify-content: flex-end;
}

.text_c {
  margin-left: 8px; 
}

.message-body {
  padding: 10px;
}
.message-body p {
  color: #666;
  font-style: italic;
}

.message-body-c {
  border-color: #e5e7eb;
  border-radius: 0 22px 22px 22px;
  background-color: #f9fafb;
}
.message-body-m {
  border-color: #fdba74;
  border-radius: 22px 0 22px 22px;
  background-color: #fff7ed;
}
.circle-bot {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  background-color: rgb(238, 78, 59);
  border-radius: 50%;
}
.circle-bot img {
  border-radius: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.username {
  font-weight: bold;
}
.username-m {
  text-align: right;
}
.function_area {
  background-color: #FFF;
}
.btn_area {
  padding: 16px;
  display: flex;
  justify-content: space-between;
}
.function_btn {
  width: 30%;
  font-size: 14px;
}
.reply_text {
  border-bottom: 1px solid #eee;
}
.chat_area {
  overflow-y: scroll;
}
</style>
