<template>
  <div class="login-body">
    <div class="container">
      <div class="left">
        <div class="left-logo">
          <div class="left-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" opacity="0.95"/>
              <path d="M2 17l10 5 10-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.75"/>
              <path d="M2 12l10 5 10-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            </svg>
          </div>
          <div class="left-logo-text">{{ t.siteName }}</div>
        </div>
        <div class="left-tagline" v-html="t.tagline.replace('\n', '<br>')"></div>
        <div class="left-features">
          <div class="feat"><div class="feat-ic">📺</div><div class="feat-text">{{ t.feat1 }}</div></div>
          <div class="feat"><div class="feat-ic">💬</div><div class="feat-text">{{ t.feat2 }}</div></div>
          <div class="feat"><div class="feat-ic">⭐</div><div class="feat-text">{{ t.feat3 }}</div></div>
          <div class="feat"><div class="feat-ic">🔍</div><div class="feat-text">{{ t.feat4 }}</div></div>
        </div>
      </div>
      <div class="right">
        <div class="tabs">
          <button class="tab" :class="{ on: mode === 'login' }"    @click="switchMode('login')">{{ t.loginTab }}</button>
          <button class="tab" :class="{ on: mode === 'register' }" @click="switchMode('register')">{{ t.registerTab }}</button>
        </div>

        <template v-if="mode === 'login'">
          <div class="form-title">{{ t.loginTitle }}</div>
          <div class="form-sub">{{ t.loginSub }}</div>
          <div class="fg">
            <label>{{ t.username }}</label>
            <div class="input-wrap">
              <span class="input-ic">👤</span>
              <input v-model="lUser" type="text" :placeholder="t.usernamePlaceholder" :class="{ err: errs.lUser }" @keydown.enter="doLogin" />
            </div>
            <div class="ferr">{{ errs.lUser }}</div>
          </div>
          <div class="fg">
            <label>{{ t.password }}</label>
            <div class="input-wrap">
              <span class="input-ic">🔒</span>
              <input v-model="lPass" type="password" :placeholder="t.passwordPlaceholder" :class="{ err: errs.lPass }" @keydown.enter="doLogin" />
            </div>
            <div class="ferr">{{ errs.lPass }}</div>
          </div>
          <button class="submit" :disabled="submitting" @click="doLogin">
            {{ submitting ? t.loginBtnLoading : t.loginBtn }}
          </button>
          <div v-if="msg.text" class="msg" :class="msg.type">{{ msg.text }}</div>
        </template>

        <template v-else>
          <div class="form-title">{{ t.registerTitle }}</div>
          <div class="form-sub">{{ t.registerSub }}</div>
          <div class="fg">
            <label>{{ t.username }}</label>
            <div class="input-wrap">
              <span class="input-ic">👤</span>
              <input v-model="rUser" type="text" :placeholder="t.registerUsernamePlaceholder" :class="{ err: errs.rUser }" @keydown.enter="doRegister" />
            </div>
            <div class="ferr">{{ errs.rUser }}</div>
          </div>
          <div class="fg">
            <label>{{ t.password }}</label>
            <div class="input-wrap">
              <span class="input-ic">🔒</span>
              <input v-model="rPass" type="password" :placeholder="t.registerPasswordPlaceholder" :class="{ err: errs.rPass }" @keydown.enter="doRegister" />
            </div>
            <div class="ferr">{{ errs.rPass }}</div>
          </div>
          <div class="fg">
            <label>{{ t.confirmPassword }}</label>
            <div class="input-wrap">
              <span class="input-ic">🔒</span>
              <input v-model="rConfirm" type="password" :placeholder="t.confirmPlaceholder" :class="{ err: errs.rConfirm }" @keydown.enter="doRegister" />
            </div>
            <div class="ferr">{{ errs.rConfirm }}</div>
          </div>
          <button class="submit" :disabled="submitting" @click="doRegister">
            {{ submitting ? t.registerBtnLoading : t.registerBtn }}
          </button>
          <div v-if="msg.text" class="msg" :class="msg.type">{{ msg.text }}</div>
        </template>

        <div class="back"><RouterLink to="/">{{ t.backToHome }}</RouterLink></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api/anime'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()
const i18n   = useI18nStore()
const t      = computed(() => i18n.t)

const mode       = ref('login')
const submitting = ref(false)
const lUser = ref(''), lPass = ref('')
const rUser = ref(''), rPass = ref(''), rConfirm = ref('')
const errs  = reactive({})
const msg   = reactive({ text: '', type: '' })

function switchMode(m) {
  mode.value = m
  Object.keys(errs).forEach(k => delete errs[k])
  msg.text = ''
  lUser.value = lPass.value = ''
  rUser.value = rPass.value = rConfirm.value = ''
}

function showMsg(text, type) { msg.text = text; msg.type = type }

async function doLogin() {
  Object.keys(errs).forEach(k => delete errs[k]); msg.text = ''
  let ok = true
  if (!lUser.value.trim()) { errs.lUser = t.value.usernamePlaceholder; ok = false }
  if (!lPass.value)         { errs.lPass = t.value.passwordPlaceholder; ok = false }
  if (!ok) return
  submitting.value = true
  try {
    const res = await authApi.login(lUser.value.trim(), lPass.value)
    if (res.code === 200) {
      auth.login(res.data.access_token, lUser.value.trim())
      showMsg('✓ ' + t.value.loginBtnLoading, 'ok')
      setTimeout(() => router.push(route.query.redirect || '/'), 900)
    } else {
      showMsg(res.message || 'Error', 'err')
    }
  } catch { showMsg('Network error', 'err') }
  finally { submitting.value = false }
}

async function doRegister() {
  Object.keys(errs).forEach(k => delete errs[k]); msg.text = ''
  let ok = true
  if (!rUser.value.trim() || rUser.value.length < 4 || rUser.value.length > 16) { errs.rUser = t.value.registerUsernamePlaceholder; ok = false }
  if (!rPass.value || rPass.value.length < 6) { errs.rPass = t.value.registerPasswordPlaceholder; ok = false }
  if (rPass.value !== rConfirm.value) { errs.rConfirm = ''; ok = false }
  if (!ok) return
  submitting.value = true
  try {
    const res = await authApi.register(rUser.value.trim(), rPass.value)
    if (res.code === 200) {
      auth.login(res.data.access_token, rUser.value.trim())
      showMsg('✓ ' + t.value.registerBtnLoading, 'ok')
      setTimeout(() => router.push('/'), 900)
    } else {
      showMsg(res.message || 'Error', 'err')
    }
  } catch { showMsg('Network error', 'err') }
  finally { submitting.value = false }
}
</script>

<style scoped>
.login-body {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative; background: var(--bg);
}
.login-body::before {
  content: ''; position: fixed; top: -20%; left: -10%;
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,92,252,.14) 0%, transparent 70%);
  pointer-events: none;
}
.login-body::after {
  content: ''; position: fixed; bottom: -20%; right: -10%;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(196,113,237,.1) 0%, transparent 70%);
  pointer-events: none;
}
.container {
  display: flex; width: 900px; min-height: 560px;
  border-radius: 22px; overflow: hidden;
  box-shadow: 0 28px 72px rgba(0,0,0,.55), 0 0 0 1px var(--border2);
  position: relative; z-index: 1;
}
.left {
  width: 360px; flex-shrink: 0;
  background: linear-gradient(150deg, #1a1040 0%, #0e0828 50%, #160d38 100%);
  padding: 50px 40px; display: flex; flex-direction: column;
  justify-content: center; position: relative; overflow: hidden;
}
.left::before {
  content: ''; position: absolute; top: -80px; right: -80px;
  width: 260px; height: 260px; border-radius: 50%;
  background: rgba(124,92,252,.12);
}
.left::after {
  content: ''; position: absolute; bottom: -60px; left: -60px;
  width: 220px; height: 220px; border-radius: 50%;
  background: rgba(196,113,237,.08);
}
.left-logo { display: flex; align-items: center; gap: 11px; margin-bottom: 18px; position: relative; z-index: 1; }
.left-logo-icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 24px var(--glow);
}
.left-logo-text { font-size: 23px; font-weight: 800; color: #fff; }
.left-tagline { font-size: 13px; color: rgba(255,255,255,.48); line-height: 1.7; margin-bottom: 40px; position: relative; z-index: 1; }
.left-features { position: relative; z-index: 1; }
.feat { display: flex; align-items: center; gap: 13px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
.feat:last-child { border-bottom: none; }
.feat-ic { width: 36px; height: 36px; border-radius: 9px; background: rgba(124,92,252,.18); border: 1px solid rgba(124,92,252,.25); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.feat-text { font-size: 13px; color: rgba(255,255,255,.62); }
.right { flex: 1; background: var(--bg2); padding: 50px 46px; display: flex; flex-direction: column; }
.tabs { display: flex; margin-bottom: 32px; background: var(--bg3); border-radius: 12px; padding: 4px; border: 1px solid var(--border); }
.tab { flex: 1; text-align: center; padding: 10px; cursor: pointer; font-size: 14px; font-weight: 700; color: var(--sub); border-radius: 9px; transition: all .2s; font-family: inherit; border: none; background: none; }
.tab.on { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 2px 12px var(--glow); }
.form-title { font-size: 23px; font-weight: 800; color: var(--text); margin-bottom: 4px; }
.form-sub { font-size: 13px; color: var(--sub); margin-bottom: 26px; }
.fg { margin-bottom: 16px; }
.fg label { display: block; font-size: 11px; font-weight: 700; color: var(--sub); margin-bottom: 6px; letter-spacing: .6px; text-transform: uppercase; }
.input-wrap { position: relative; }
.input-ic { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--sub); pointer-events: none; }
.fg input { width: 100%; background: var(--bg3); border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px 12px 40px; color: var(--text); font-size: 14px; outline: none; font-family: inherit; transition: all .2s; }
.fg input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); background: rgba(124,92,252,.04); }
.fg input.err { border-color: var(--red); }
.ferr { font-size: 11px; color: var(--red); margin-top: 4px; min-height: 15px; }
.submit { width: 100%; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; border: none; padding: 14px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 800; font-family: inherit; box-shadow: 0 4px 18px var(--glow); transition: transform .18s, box-shadow .18s, opacity .18s; margin-top: 4px; }
.submit:hover { transform: translateY(-1px); box-shadow: 0 8px 28px var(--glow); }
.submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.msg { text-align: center; font-size: 13px; margin-top: 12px; min-height: 18px; padding: 8px 12px; border-radius: 8px; }
.msg.err { color: var(--red); background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.18); }
.msg.ok  { color: var(--green); background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.18); }
.back { text-align: center; margin-top: 18px; font-size: 13px; color: var(--sub); }
.back a { color: var(--accent2); text-decoration: none; transition: color .18s; font-weight: 600; }
.back a:hover { color: var(--text); }
</style>
