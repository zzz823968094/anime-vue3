import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token    = ref(localStorage.getItem('ms_token') || '')
  const username = ref(localStorage.getItem('ms_username') || '')

  const isLoggedIn = computed(() => !!token.value)

  function login(newToken, newUsername) {
    token.value    = newToken
    username.value = newUsername
    localStorage.setItem('ms_token', newToken)
    localStorage.setItem('ms_username', newUsername)
  }

  function logout() {
    token.value    = ''
    username.value = ''
    localStorage.removeItem('ms_token')
    localStorage.removeItem('ms_username')
  }

  return { token, username, isLoggedIn, login, logout }
})
