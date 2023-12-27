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
      <div>
        <textarea ref="talk_input" @keyup.enter="replyChat" rows="3" placeholder="请输入对话" v-model="talk_text" class="reply_text"></textarea>
      </div>
      <div class="btn_area">
        <mt-button @click="insertAction" type="primary" class="function_btn">插入动作</mt-button>
        <mt-button @click="resayChat" type="primary" class="function_btn">重新生成</mt-button>
        <mt-button @click="back_visible=true" type="primary" class="function_btn">回溯对话</mt-button>
        <!-- <mt-button @click="tamperChat" type="primary" class="function_btn">替角色说</mt-button> -->
        <mt-button @click="getChatbot" type="primary" class="function_btn">替角色说</mt-button>
      </div>
    </div>
    <mt-actionsheet :actions="actions" v-model="action_visible"></mt-actionsheet>
    <mt-popup class="setting_page" v-model="setting_visible" position="right" :modal="false">
      <div class="setting_form">
        <h3 style="text-align:center; margin-bottom: 16px;">对话设置</h3>
        <mt-field label="top_p" v-model="top_p"></mt-field>
        <mt-field label="top_k" v-model="top_k"></mt-field>
        <mt-field label="temperature" v-model="temperature"></mt-field>
        <mt-field label="重复惩罚" v-model="presence_penalty"></mt-field>
        <mt-button class="save_setting" @click="saveChatSetting" type="primary">保存设定</mt-button>
      </div>
    </mt-popup>
    <mt-popup class="debug_page" v-model="debug_visible" position="right" :modal="false">
      <div class="debug_area">
        <div v-html="debug_token"></div>
        <mt-button class="save_setting" @click="debug_visible=false" type="primary">关闭</mt-button>
      </div>
    </mt-popup>
    <mt-popup class="back_page" v-model="back_visible" position="right" :modal="false">
      <div class="chat_area" style="height: 90%; margin-top:0">
        <label v-for="(item, k) in chat_log_show" :key="k" :class="'message ' + (item.type == 1 ? 'message_c' : 'message_m')">
          <input v-model="back_checked" style="width: 20px;margin-right: 8px;" type="radio" name="check" :value="((chat_log_show.length - k - 1) / 2)" v-if="item.type==1">
          <div v-if="item.type==1" class="circle-bot">
            <img :src="avatar">
          </div>
          <div :class="item.type == 1 ? 'text_c' : 'text_m'">
            <div :class="'username ' + (item.type == 1 ? '' : 'username-m')">
              {{item.name}}
            </div>
            <div v-html="item.text" :class="'message-body ' + (item.type == 1 ? 'message-body-c' : 'message-body-m')"></div>
          </div>
        </label>
      </div>
      <mt-button class="back_btn" @click="backChat" type="primary">确定</mt-button>
    </mt-popup>
  </div>
</template>
<script>
import { MessageBox } from 'mint-ui';
import { getCharacterDetail } from '@/api/char'
import { loadCharacters, resetChat, debug, tamper, back } from '@/api/chat'
import defaultImage from '@/assets/default.png';
import sse from '@/sse'
import { Indicator } from 'mint-ui';
export default {
  name: 'Home',
  data() {
    return {
      avatar: defaultImage,
      chat_area_height: window.screen.height - 137 - 56,
      char_name: this.$route.query.char_name,
      char_data: {},
      chat_log: [],
      chat_log_show: [],
      talk_text: '',
      top_p: localStorage.getItem('top_p') ? localStorage.getItem('top_p') : 0.65,
      top_k: localStorage.getItem('top_k') ? localStorage.getItem('top_k') : 0,
      temperature: localStorage.getItem('temperature') ? localStorage.getItem('temperature') : 2,
      presence_penalty: localStorage.getItem('presence_penalty') ? localStorage.getItem('presence_penalty') : 0.2,
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
          method: this.debugChat
        }
      ],
      action_visible: false,
      setting_visible: false,
      debug_token: '',
      debug_visible: false,
      back_visible: false,
      back_checked: ''
    }
  },
  mounted() {
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
      const start = '（'
      const end = '）'
      let result = text.replaceAll(start, '<p>')
      result = result.replaceAll(end, '</p>')
      return result
    },
    setChatLog(){
      this.chat_log_show = JSON.parse(JSON.stringify(this.chat_log))
      this.chat_log_show.reverse()
    },
    getChatbot() {
      console.log(this.chat_log)
    },
    chatSetting() {
      this.setting_visible = true
    },
    saveChatSetting() {
      if(isNaN(parseFloat(this.top_p)) || this.top_p <= 0 || this.top_p >= 1) {
        this.top_p = 0.65
      }
      localStorage.setItem('top_p', this.top_p)
      if(isNaN(parseFloat(this.top_k)) || this.top_k <= 0) {
        this.top_k = 0
      }
      localStorage.setItem('top_k', this.top_k)
      if(isNaN(parseFloat(this.temperature)) || this.temperature < 0 || this.temperature > 5) {
        this.temperature = 2
      }
      localStorage.setItem('temperature', this.temperature)
      if(isNaN(parseFloat(this.presence_penalty)) || this.presence_penalty < 0 || this.presence_penalty > 1) {
        this.presence_penalty = 0.2
      }
      localStorage.setItem('presence_penalty', this.presence_penalty)
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
    debugChat() {
      this.debug_token = ''
      this.debug_visible = true
      debug(localStorage.getItem('user_name'), this.char_name).then((res) => {
        this.debug_token = '总共' + res.data.token_count + '个token<br><br>' + res.data.token_state.replaceAll('\n', '<br>')
      })
    },
    replyChat() {
      if(!this.talk_text) {
        return
      }
      let prompt = this.talk_text
      const tmp = {
        type: 0,
        text: this.formatText(prompt),
        name: this.char_data['user']
      }
      this.chat_log.push(tmp)
      this.setChatLog()
      this.talk_text = ''
      const tmp2 = {
        type: 1,
        text: '',
        name: this.char_data['bot']
      }
      this.chat_log.push(tmp2)
      sse({
        url: '/chat/reply',
        method: 'post',
        data: {
          user_name: localStorage.getItem('user_name'),
          character_name: this.char_name,
          prompt: prompt,
          top_p: this.top_p,
          top_k: this.top_k,
          temperature: this.temperature,
          presence_penalty: this.presence_penalty
        },
        onDownloadProgress: progressEvent => {
          Indicator.close();
          const xhr = progressEvent.event.target
          const { responseText } = xhr
          const res = responseText.split("\n\ndata:")
          this.chat_log[this.chat_log.length - 1].text = this.formatText(res[res.length-1])
          this.setChatLog()
        }
      }).then(({ data }) => Promise.resolve(data));
    },
    resayChat() {
      sse({
        url: '/chat/resay',
        method: 'post',
        data: {
          user_name: localStorage.getItem('user_name'),
          character_name: this.char_name,
          top_p: this.top_p,
          top_k: this.top_k,
          temperature: this.temperature,
          presence_penalty: this.presence_penalty
        },
        onDownloadProgress: progressEvent => {
          Indicator.close();
          const xhr = progressEvent.event.target
          const { responseText } = xhr
          const res = responseText.split("\n\ndata:")
          this.chat_log[this.chat_log.length - 1].text = this.formatText(res[res.length-1])
          this.setChatLog()
        }
      }).then(({ data }) => Promise.resolve(data));
    },
    tamperChat() {
      if(!this.talk_text) {
        return
      }
      let message = this.talk_text
      const tmp = {
        type: 1,
        text: this.formatText(message),
        name: this.char_data['bot']
      }
      this.talk_text = ''
      tamper(localStorage.getItem('user_name'), this.char_name, message).then(() => {
        this.chat_log[this.chat_log.length - 1] = tmp
        this.setChatLog()
      })
    },
    backChat() {
      if(this.back_checked === '' || (this.back_checked * 2 + 1) == this.chat_log.length) {
        this.back_visible = false
        this.back_checked = ''
        return
      }
      back(localStorage.getItem('user_name'), this.char_name, this.back_checked).then(() => {
        this.chat_log = this.chat_log.splice(0, this.back_checked * 2 + 1)
        this.setChatLog()
        this.back_visible = false
        this.back_checked = ''
      })
    },
    insertAction() {
      const talk_input = this.$refs.talk_input
      if (talk_input) {
        if (talk_input.value.length == 0) {
          talk_input.value += "（）"
        } else{
          talk_input.value += "\n（）"
        }
        talk_input.selectionStart = talk_input.value.length - 1
        talk_input.selectionEnd = talk_input.value.length - 1
        talk_input.focus()
      }
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
.debug_page {
  position: fixed;
  width: 100%;
  height: 100%;
}
.debug_area {
  width: 80%;
  height: 100%;
  margin: auto;
  margin-top: 16px;
}
.debug_area div {
  height: 80%;
  padding: 16px;
  overflow-y: scroll;
  border: 1px dashed #999
}
.back_page {
  position: fixed;
  width: 100%;
  height: 100%;
}
.back_btn {
  width: 80%;
  margin-left: 10%;
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
  width: 24%;
  font-size: 14px;
}
.reply_text {
  width: calc(100% - 12px);
  border: none;
  border-bottom: 1px solid #ddd;
  outline: none;
  padding: 6px;
}
.chat_area {
  overflow-y: scroll;
}
</style>
