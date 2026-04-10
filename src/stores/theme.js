import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('site_theme') !== 'light')

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('site_theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  // 初始化时立即应用
  applyTheme()

  return { isDark, toggle, applyTheme }
})
