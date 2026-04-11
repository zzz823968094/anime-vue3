<template>
  <nav class="nav">
    <!-- Logo -->
    <RouterLink to="/" class="nav-logo">
      <img src="@/assets/logo.png" alt="logo" class="nav-logo-img" />
      {{ t.siteName }}
    </RouterLink>

    <!-- 導航鏈結 -->
    <div class="nav-links">
      <RouterLink to="/">{{ t.home }}</RouterLink>
      <RouterLink to="/search">{{ t.library }}</RouterLink>
    </div>

    <!-- 搜尋框 -->
    <div class="nav-search">
      <button @click="handleSearch">🔍</button>
      <input
        v-model="inputVal"
        :placeholder="t.searchPlaceholder"
        @keydown.enter="handleSearch"
      />
    </div>

    <!-- 右側工具區 -->
    <div class="nav-right">

      <!-- 日夜模式 -->
      <button class="icon-btn theme-btn" @click="themeStore.toggle()" :title="themeStore.isDark ? 'Light Mode' : 'Dark Mode'">
        <span v-if="themeStore.isDark">☀️</span>
        <span v-else>🌙</span>
      </button>

      <!-- 語言切換 -->
      <div class="lang-wrap" ref="langWrap">
        <button class="icon-btn lang-btn" @click.stop="langOpen = !langOpen">
          <span class="lang-flag">{{ currentLangFlag }}</span>
          <span class="lang-label">{{ currentLangLabel }}</span>
          <span class="lang-arrow" :class="{ open: langOpen }">▾</span>
        </button>
        <div class="lang-drop" :class="{ on: langOpen }">
          <button
            v-for="opt in langOptions"
            :key="opt.value"
            class="lang-item"
            :class="{ active: i18n.lang === opt.value }"
            @click="selectLang(opt.value)"
          >
            <span>{{ opt.flag }}</span>
            <span>{{ opt.label }}</span>
            <span v-if="i18n.lang === opt.value" class="lang-check">✓</span>
          </button>
        </div>
      </div>

      <!-- 已登入 -->
      <div v-if="auth.isLoggedIn" class="u-wrap" ref="uWrap">
        <div class="u-avatar" :class="{ on: dropOpen }" @click.stop="dropOpen = !dropOpen">
          👤
        </div>
        <div class="u-drop" :class="{ on: dropOpen }">
          <RouterLink to="/user">👤 &nbsp;{{ t.profile }}</RouterLink>
          <RouterLink to="/user#history">🕐 &nbsp;{{ t.history }}</RouterLink>
          <RouterLink to="/user#favorites">⭐ &nbsp;{{ t.favorites }}</RouterLink>
          <button @click="handleLogout">🚪 &nbsp;{{ t.logout }}</button>
        </div>
      </div>
      <!-- 未登入 -->
      <RouterLink v-else to="/login" class="nav-btn">{{ t.login }}</RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'
import { useThemeStore } from '@/stores/theme'
import { onMounted, onUnmounted } from 'vue'

const router     = useRouter()
const route      = useRoute()
const auth       = useAuthStore()
const i18n       = useI18nStore()
const themeStore = useThemeStore()

const t = computed(() => i18n.t)

const langOptions = [
  { value: 'zh_tw', label: '繁體中文', flag: '🇹🇼' },
  { value: 'zh_cn', label: '简体中文', flag: '🇨🇳' },
  { value: 'en',    label: 'English',  flag: '🇺🇸' },
]

const currentLangFlag  = computed(() => langOptions.find(o => o.value === i18n.lang)?.flag  || '🌐')
const currentLangLabel = computed(() => langOptions.find(o => o.value === i18n.lang)?.label || '')

const inputVal = ref(route.query.keyword || '')
watch(() => route.query.keyword, val => { inputVal.value = val || '' })

const dropOpen = ref(false)
const langOpen = ref(false)
const uWrap    = ref(null)
const langWrap = ref(null)

function handleGlobalClick(e) {
  dropOpen.value = false
  if (langWrap.value && !langWrap.value.contains(e.target)) langOpen.value = false
}
onMounted(()  => document.addEventListener('click', handleGlobalClick))
onUnmounted(() => document.removeEventListener('click', handleGlobalClick))

function handleSearch() {
  const kw = inputVal.value.trim()
  router.push(kw ? { path: '/search', query: { keyword: kw } } : '/search')
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

function selectLang(val) {
  i18n.setLang(val)
  langOpen.value = false
}
</script>

<style scoped>
/* 通用图标按钮 */
.icon-btn {
  background: var(--bg3);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: all .18s;
  display: flex; align-items: center;
  color: var(--text);
}
.icon-btn:hover {
  border-color: var(--accent);
  background: rgba(124,92,252,0.1);
}

/* 日夜切换 */
.theme-btn {
  width: 36px; height: 36px;
  justify-content: center;
  font-size: 16px;
}

/* 语言切换 */
.lang-wrap { position: relative; }
.lang-btn {
  height: 36px; padding: 0 11px; gap: 6px; font-size: 13px; font-weight: 600;
}
.lang-flag { font-size: 16px; }
.lang-label { font-size: 12px; color: var(--sub); }
.lang-arrow { font-size: 10px; color: var(--sub); transition: transform .2s; }
.lang-arrow.open { transform: rotate(180deg); }

.lang-drop {
  position: absolute; top: calc(100% + 10px); right: 0;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: 14px; padding: 6px; min-width: 160px;
  opacity: 0; pointer-events: none; transform: translateY(-6px) scale(0.97);
  transition: opacity .18s, transform .18s;
  box-shadow: 0 16px 48px rgba(0,0,0,.3); z-index: 700;
}
.lang-drop.on { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }

.lang-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 12px; background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; color: var(--text);
  border-radius: 9px; transition: background .13s; text-align: left;
}
.lang-item:hover { background: var(--bg3); color: var(--accent2); }
.lang-item.active { color: var(--accent2); font-weight: 700; }
.lang-check { margin-left: auto; color: var(--accent); font-weight: 900; font-size: 14px; }

.nav-logo-img { width: 64px; height: 64px; object-fit: contain; filter: brightness(1.2) drop-shadow(0 0 8px rgba(196,113,237,0.6)); }
</style>
