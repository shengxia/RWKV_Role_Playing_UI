import request from '@/request'

export function loadCharacters(user_name, character_name) {
  return request({
    url: '/characters/load',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name
    }
  })
}

export function resetChat(user_name, character_name) {
  return request({
    url: '/chat/reset',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name
    }
  })
}

export function debug(user_name, character_name) {
  return request({
    url: '/debug/token',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name
    }
  })
}

export function tamper(user_name, character_name, message) {
  return request({
    url: '/chat/tamper',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name,
      message: message
    }
  })
}

export function back(user_name, character_name, log_index) {
  return request({
    url: '/chat/back',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name,
      log_index: log_index
    }
  })
}