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

export function reply(user_name, character_name, prompt, min_len, top_p, temperature, presence_penalty, frequency_penalty) {
  return request({
    url: '/chat/reply',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name,
      prompt: prompt,
      min_len: min_len,
      top_p: top_p,
      temperature: temperature,
      presence_penalty: presence_penalty,
      frequency_penalty: frequency_penalty
    }
  })
}

export function resay(user_name, character_name, min_len, top_p, temperature, presence_penalty, frequency_penalty) {
  return request({
    url: '/chat/resay',
    method: 'post',
    data: {
      user_name: user_name,
      character_name: character_name,
      min_len: min_len,
      top_p: top_p,
      temperature: temperature,
      presence_penalty: presence_penalty,
      frequency_penalty: frequency_penalty
    }
  })
}