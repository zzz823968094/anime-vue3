import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize theme & i18n on mount
import { useThemeStore } from './stores/theme'
import { useI18nStore }  from './stores/i18n'

app.mount('#app')

// Apply persisted settings after mount
const theme = useThemeStore()
const i18n  = useI18nStore()
theme.applyTheme()
