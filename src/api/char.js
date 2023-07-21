import request from '@/request'

export function getCharacters(user_name) {
  return request({
    url: '/characters/list',
    method: 'post',
    data: {
      user_name: user_name,
    }
  })
}

export function getCharacterDetail(user_name, character_name) {
  return request({
    url: '/characters/get',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name
    }
  })
}

export function saveCharacter(user_name, bot, user, action_start, action_end, greeting, bot_persona, 
  example_message, use_qa, avatar) {
  return request({
    url: '/characters/save',
    method: 'post',
    data: {
      user_name: user_name,
      bot: bot,
      user: user,
      action_start: action_start,
      action_end: action_end,
      greeting: greeting,
      bot_persona: bot_persona,
      example_message: example_message,
      use_qa: use_qa ? 1 : '',
      avatar: avatar
    }
  })
}

export function deleteCharacter(user_name, character_name) {
  return request({
    url: '/characters/del',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name
    }
  })
}
