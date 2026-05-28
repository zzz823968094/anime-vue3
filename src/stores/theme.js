import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('site_theme') !== 'light')
  let isAnimating = false

  function toggle() {
    if (isAnimating) return
    isAnimating = true

    const targetIsDark = !isDark.value
    const root = document.documentElement

    // 设置扩散圆心 CSS 变量：浅→深 右上角，深→浅 左下角
    root.style.setProperty('--theme-clip-x', targetIsDark ? '100%' : '0%')
    root.style.setProperty('--theme-clip-y', targetIsDark ? '0%' : '100%')

    const doSwitch = () => {
      isDark.value = targetIsDark
      localStorage.setItem('site_theme', targetIsDark ? 'dark' : 'light')
      applyTheme()
    }

    // 使用浏览器原生 View Transitions API
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => doSwitch())
      transition.finished.then(() => {
        isAnimating = false
      })
    } else {
      // 降级：不支持时直接切换
      doSwitch()
      isAnimating = false
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  // 初始化时立即应用
  applyTheme()

  return { isDark, toggle, applyTheme }
})
