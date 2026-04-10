<template>
  <div class="player-page">
    <!-- ── 顶部导航 ── -->
    <nav class="nav">
      <RouterLink to="/" class="nav-logo">
        <div class="nav-logo-icon">🎌</div>{{ t.siteName }}
      </RouterLink>
      <span class="nav-sep">|</span>
      <RouterLink class="nav-back" :to="`/detail/${animeId}`">{{ t.backDetail }}</RouterLink>
      <div class="nav-info">
        <span class="nav-title">{{ animeTitle }}</span>
        <span v-if="currentEp" class="nav-ep">{{ t.epLabel }}{{ currentEp }}{{ t.epSuffix }}</span>
      </div>
      <div class="nav-right">
        <template v-if="auth.isLoggedIn">
          <div class="u-wrap" ref="uWrap">
            <div class="u-avatar" :class="{ on: dropOpen }" @click.stop="dropOpen = !dropOpen">👤</div>
            <div class="u-drop" :class="{ on: dropOpen }">
              <RouterLink to="/user">👤 &nbsp;{{ t.profile }}</RouterLink>
              <RouterLink to="/user#history">🕐 &nbsp;{{ t.history }}</RouterLink>
              <RouterLink to="/user#favorites">⭐ &nbsp;{{ t.favorites }}</RouterLink>
              <button @click="auth.logout(); $router.push('/')">🚪 &nbsp;{{ t.logout }}</button>
            </div>
          </div>
        </template>
        <RouterLink v-else to="/login" class="nav-btn">{{ t.loginOnly }}</RouterLink>
      </div>
    </nav>

    <!-- ── 主体布局 ── -->
    <div class="body">
      <!-- 左侧占位（与侧栏等宽，让中间居中） -->
      <div class="spacer" />

      <!-- 中间播放区 -->
      <div class="center">
        <!-- 播放器 -->
        <div class="player-box">
          <iframe v-if="playUrl" :src="playUrl" id="playerFrame" allowfullscreen @load="onPlayerLoad" />
          <div v-else class="player-placeholder">
            <div class="sh" style="width:100%;height:100%;" />
          </div>

          <!-- 弹幕飘动层 -->
          <div class="dm-layer" ref="dmLayer" />

          <!-- 自动下一集提示 -->
          <div class="auto-next-overlay" :class="{ show: showAutoNext }">
            <div class="an-title">{{ t.autoNext }}</div>
            <div class="an-name">第 {{ nextVideo?.episode }} 集</div>
            <div class="an-bar-wrap"><div class="an-bar" ref="anBar" /></div>
            <div class="an-actions">
              <button class="an-btn-go"     @click="confirmNext">{{ t.playNextNow }}</button>
              <button class="an-btn-cancel" @click="cancelNext">{{ t.cancel }}</button>
            </div>
          </div>
        </div>

        <!-- 信息栏 -->
        <div class="info-bar">
          <div class="info-left">
            <h2>{{ animeTitle }}</h2>
            <p>{{ t.epLabel }} {{ currentEp }} {{ t.epSuffix }} · {{ t.episodes }} {{ totalEp }} {{ t.episodesUnit }}</p>
          </div>
          <div class="info-right">
            <label class="auto-toggle" title="{{ t.autoPlayTitle }}">
              <input type="checkbox" v-model="autoPlay" @change="onAutoPlayChange" />
              <div class="toggle-track"><div class="toggle-thumb" /></div>
              <span>{{ t.autoPlay }}</span>
            </label>
            <div class="ep-nav">
              <button :disabled="prevDisabled" @click="goPrev">{{ t.prevEp }}</button>
              <button :disabled="nextDisabled" @click="goNext">{{ t.nextEp }}</button>
            </div>
          </div>
        </div>

        <!-- 弹幕發送区 -->
        <div class="dm-wrap">
          <div class="dm-top">
            <div class="dm-title">{{ t.danmaku }}</div>
            <label class="dm-toggle">
              <input type="checkbox" v-model="dmEnabled" @change="onDmToggle" />
              <div class="tog-track"><div class="tog-thumb" /></div>
              <span>{{ dmEnabled ? t.danmakuOn : t.danmakuOff }}</span>
            </label>
          </div>
          <div class="dm-row">
            <input
              class="dm-input" v-model="dmInput"
              :placeholder="t.danmakuPlaceholder"
              maxlength="100"
              @keydown.enter="sendDm"
            />
            <button class="dm-send" @click="sendDm">{{ t.send }}</button>
          </div>
          <div class="dm-hint" :style="{ color: dmHintColor }">{{ dmHint }}</div>
        </div>
      </div>

      <!-- 侧边栏（选集） -->
      <div class="sidebar">
        <div class="sb-head">
          <h3>{{ t.epListTitle }}</h3>
          <div class="ep-tabs">
            <button
              v-for="(g, i) in epGroups"
              :key="i"
              class="ep-tab"
              :class="{ on: activeGroup === i }"
              @click="activeGroup = i"
            >{{ g.label }}</button>
          </div>
        </div>
        <div class="sb-scroll" ref="sbScroll">
          <div class="ep-page on">
            <div
              v-for="v in currentGroupVideos"
              :key="v.id"
              class="ep-item"
              :class="{ on: v.episode === currentEp }"
              :id="`ep-${v.episode}`"
              @click="go(v)"
            >
              <span>{{ t.epItem }}{{ v.episode }}{{ t.epItemSuffix }}</span>
              <div v-if="v.episode === currentEp" class="ep-dot" />
              <div v-else-if="watchedEps.has(v.episode)" class="ep-watched" />
              <div v-else />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { animeApi, videoApi } from '@/api/anime'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const i18nStore = useI18nStore()
const t = computed(() => i18nStore.t)

// ── 从路由 query 派生，完全响应式 ──
const animeId   = computed(() => route.query.animeId)
const videoId   = computed(() => route.query.videoId)
const currentEp = computed(() => parseInt(route.query.ep || '1'))

// ── 数据 ──
const animeTitle = ref('')
const totalEp    = ref(0)
const playUrl    = ref('')
const allVideos  = ref([])

// ── 自動播放 ──
const autoPlay     = ref(localStorage.getItem('autoPlay') !== 'false')
const showAutoNext = ref(false)
const nextVideo    = ref(null)
const anBar        = ref(null)
let autoNextTimer  = null
let playTickTimer  = null
let playedSeconds  = 0
const DEFAULT_DURATION = 24 * 60

// ── 弹幕 ──
const dmEnabled   = ref(localStorage.getItem('dmEnabled') !== 'false')
const dmInput     = ref('')
const dmHint      = ref('')
const dmHintColor = ref('')
const dmLayer     = ref(null)
let ws = null
const DM_TRACKS   = 8
const trackBusy   = new Array(DM_TRACKS).fill(0)

// ── 下拉菜单 ──
const dropOpen = ref(false)

// ── 分组（50集/组） ──
const EP_PAGE     = 50
const activeGroup = ref(0)
const epGroups    = computed(() => {
  const total = Math.ceil(allVideos.value.length / EP_PAGE)
  return Array.from({ length: total }, (_, i) => ({
    label: `${i * EP_PAGE + 1}-${Math.min((i + 1) * EP_PAGE, allVideos.value.length)}`,
  }))
})
const currentGroupVideos = computed(() =>
  allVideos.value.slice(activeGroup.value * EP_PAGE, (activeGroup.value + 1) * EP_PAGE)
)

// ── 已观看 ──
const watchedEps = computed(() => {
  const h = JSON.parse(localStorage.getItem('watchHistory') || '[]')
  return new Set(h.filter(i => i.animeId === animeId.value).map(i => i.episode))
})

// ── 上/下集按钮，依赖 currentEp computed ──
const curIdx       = computed(() => allVideos.value.findIndex(v => v.episode === currentEp.value))
const prevDisabled = computed(() => curIdx.value <= 0)
const nextDisabled = computed(() => curIdx.value < 0 || curIdx.value >= allVideos.value.length - 1)

// ── 首次完整加载（番剧信息 + 全集列表 + 当前视频） ──
async function loadFull() {
  if (!animeId.value || !videoId.value) { router.push('/'); return }
  try {
    const [ar, vr, vidR] = await Promise.all([
      animeApi.getDetail(animeId.value),
      videoApi.getByAnime(animeId.value),
      videoApi.getOne(videoId.value),
    ])
    const anime = ar.data
    allVideos.value  = vr.data || []
    const video = vidR.data

    animeTitle.value = anime.title
    totalEp.value    = anime.currentEpisode
    playUrl.value    = video.playUrl
    document.title   = `${anime.title} - ${t.value.siteName}`

    saveWatchHistory({ animeId: animeId.value, title: anime.title, episode: currentEp.value, videoId: videoId.value, coverImage: anime.coverImage || '' })
    updateNextVideo()
    scrollToCurrentEp()
    connectDm(videoId.value)
  } catch (e) {
    console.error('載入失敗', e)
  }
}

// ── 切集时只重新拉视频 URL（不重复请求番剧信息和列表） ──
async function loadVideo() {
  if (!videoId.value) return
  try {
    clearTimers()
    ws?.close()
    playUrl.value = ''   // 触发 iframe 重置

    const res = await videoApi.getOne(videoId.value)
    playUrl.value    = res.data.playUrl
    document.title   = `${animeTitle.value} - ${t.value.siteName}`

    saveWatchHistory({ animeId: animeId.value, title: animeTitle.value, episode: currentEp.value, videoId: videoId.value, coverImage: '' })
    updateNextVideo()
    scrollToCurrentEp()
    connectDm(videoId.value)
  } catch (e) {
    console.error('切換集數失敗', e)
  }
}

function updateNextVideo() {
  const idx = allVideos.value.findIndex(v => v.episode === currentEp.value)
  nextVideo.value = (idx >= 0 && idx < allVideos.value.length - 1)
    ? allVideos.value[idx + 1] : null

  // 定位侧栏分组
  const curGroup = idx >= 0 ? Math.floor(idx / EP_PAGE) : 0
  activeGroup.value = curGroup
}

function scrollToCurrentEp() {
  nextTick(() => {
    const el = document.getElementById(`ep-${currentEp.value}`)
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

// ── 监听 videoId 变化，切集时重新加载视频 ──
watch(
  () => route.query.videoId,
  (newId, oldId) => {
    if (!newId) return
    if (oldId === undefined) return  // 首次由 onMounted 处理
    loadVideo()
  }
)

function onPlayerLoad() { scheduleAutoNext() }

function clearTimers() {
  clearInterval(playTickTimer)
  clearInterval(autoNextTimer)
  playedSeconds = 0
}

function scheduleAutoNext() {
  if (!nextVideo.value) return
  clearInterval(playTickTimer)
  playedSeconds = 0
  playTickTimer = setInterval(() => {
    playedSeconds++
    if (playedSeconds % 30 === 0) updateHistoryProgress(Math.round((playedSeconds / DEFAULT_DURATION) * 100))
    if (playedSeconds >= DEFAULT_DURATION) {
      clearInterval(playTickTimer)
      if (autoPlay.value) triggerAutoNext()
    }
  }, 1000)
}

function triggerAutoNext() {
  if (!nextVideo.value || !autoPlay.value) return
  showAutoNext.value = true
  let count = 10
  if (anBar.value) {
    anBar.value.style.transition = 'none'
    anBar.value.style.width = '100%'
    anBar.value.offsetWidth
    anBar.value.style.transition = 'width 10s linear'
    anBar.value.style.width = '0%'
  }
  autoNextTimer = setInterval(() => {
    count--
    if (count <= 0) { clearInterval(autoNextTimer); confirmNext() }
  }, 1000)
}

function confirmNext() {
  clearInterval(autoNextTimer)
  showAutoNext.value = false
  if (nextVideo.value) go(nextVideo.value)
}
function cancelNext() {
  clearInterval(autoNextTimer)
  showAutoNext.value = false
}
function onAutoPlayChange() {
  localStorage.setItem('autoPlay', autoPlay.value)
  if (!autoPlay.value) cancelNext()
}

// ── 切集跳转：只改 query，不重建页面 ──
function go(v) {
  clearTimers()
  router.push({ path: '/player', query: { animeId: animeId.value, videoId: v.id, ep: v.episode } })
}
function goPrev() { if (!prevDisabled.value) go(allVideos.value[curIdx.value - 1]) }
function goNext() { if (!nextDisabled.value) go(allVideos.value[curIdx.value + 1]) }

// ── 历史 ──
function saveWatchHistory(item) {
  try {
    let h = JSON.parse(localStorage.getItem('watchHistory') || '[]')
    h = h.filter(i => i.animeId !== item.animeId)
    h.unshift({ ...item, ts: Date.now(), progress: 0 })
    if (h.length > 100) h = h.slice(0, 100)
    localStorage.setItem('watchHistory', JSON.stringify(h))
  } catch {}
}
function updateHistoryProgress(progress) {
  try {
    let h = JSON.parse(localStorage.getItem('watchHistory') || '[]')
    const idx = h.findIndex(i => i.animeId === animeId.value)
    if (idx >= 0) {
      h[idx].progress = Math.min(progress, 100)
      h[idx].episode  = currentEp.value
      h[idx].videoId  = videoId.value
      h[idx].ts       = Date.now()
      localStorage.setItem('watchHistory', JSON.stringify(h))
    }
  } catch {}
}

// ── 弹幕 ──
function getFreeTrack() {
  const now = Date.now()
  let best = 0
  for (let i = 0; i < DM_TRACKS; i++) { if (trackBusy[i] <= now) return i; if (trackBusy[i] < trackBusy[best]) best = i }
  return best
}
function renderDanmaku(content, color = '#FFFFFF') {
  if (!dmEnabled.value || !dmLayer.value) return
  const track = getFreeTrack()
  const speed = 8 + Math.random() * 4
  const el    = document.createElement('div')
  el.className = 'dm-item'
  el.textContent = content
  el.style.cssText = `color:${color};top:${track * (100 / DM_TRACKS) + 2}%;left:100%;animation-duration:${speed}s`
  dmLayer.value.appendChild(el)
  trackBusy[track] = Date.now() + speed * 1000
  el.addEventListener('animationend', () => el.remove())
}
function onDmToggle() {
  localStorage.setItem('dmEnabled', dmEnabled.value)
  if (!dmEnabled.value && dmLayer.value) dmLayer.value.innerHTML = ''
}
function connectDm(vid) {
  ws?.close()
  try {
    ws = new WebSocket(`ws://159.223.81.85:8080/ws/danmaku/${vid}`)
    ws.onopen  = () => { dmHint.value = ''; dmHintColor.value = '' }
    ws.onmessage = e => {
      try {
        const m = JSON.parse(e.data)
        if (m.type === 'danmaku') {
          renderDanmaku(m.content, m.color || '#FFFFFF')
          if (m.self) { dmHint.value = '✓ 彈幕已發送'; dmHintColor.value = '#4ade80'; setTimeout(() => { dmHint.value = ''; dmHintColor.value = '' }, 2000) }
        }
      } catch {}
    }
    ws.onclose = () => { dmHint.value = '彈幕連線已斷開'; dmHintColor.value = 'var(--sub)' }
    ws.onerror = () => { dmHint.value = '彈幕連線失敗'; dmHintColor.value = '#f87171' }
    setInterval(() => { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' })) }, 25000)
  } catch { dmHint.value = '彈幕初始化失敗' }
}
function sendDm() {
  const content = dmInput.value.trim()
  if (!content) return
  if (!auth.isLoggedIn) { if (confirm('發送彈幕需要登入，是否前往登入？')) router.push('/login'); return }
  if (!ws || ws.readyState !== WebSocket.OPEN) { dmHint.value = '彈幕服務未連接'; dmHintColor.value = '#f87171'; return }
  ws.send(JSON.stringify({ type: 'danmaku', content, timePoint: 0, color: '#FFFFFF', dmType: 0, username: auth.username || '匿名' }))
  dmInput.value = ''
}

// ── 生命周期 ──
const handleGlobalClick = () => { dropOpen.value = false }
onMounted(() => {
  loadFull()
  document.addEventListener('click', handleGlobalClick)
  window.addEventListener('beforeunload', () => {
    if (playedSeconds > 10) updateHistoryProgress(Math.round((playedSeconds / DEFAULT_DURATION) * 100))
  })
})
onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  clearTimers()
  ws?.close()
})
</script>

<style scoped>
.player-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.nav { flex-shrink:0; height:52px; padding:0 24px; background:rgba(10,10,18,.95); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:16px; z-index:500; }
.nav-logo { display:flex; align-items:center; gap:7px; text-decoration:none; font-size:16px; font-weight:700; color:#fff; flex-shrink:0; }
.nav-logo-icon { width:26px; height:26px; border-radius:6px; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:13px; }
.nav-sep { color:var(--border); font-size:18px; flex-shrink:0; }
.nav-back { color:var(--sub); text-decoration:none; font-size:13px; display:flex; align-items:center; gap:4px; transition:color .18s; flex-shrink:0; }
.nav-back:hover { color:var(--accent2); }
.nav-info { display:flex; align-items:center; gap:8px; overflow:hidden; }
.nav-title { font-size:14px; color:var(--text); font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nav-ep { font-size:12px; color:var(--sub); flex-shrink:0; background:var(--bg3); padding:2px 8px; border-radius:4px; }
.nav-right { margin-left:auto; display:flex; align-items:center; gap:10px; flex-shrink:0; }
.nav-btn { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff; border:none; padding:5px 14px; border-radius:14px; cursor:pointer; font-size:12px; font-weight:500; font-family:inherit; text-decoration:none; }
.u-wrap { position:relative; }
.u-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer; border:2px solid transparent; transition:border-color .18s; user-select:none; }
.u-avatar.on { border-color:var(--accent); }
.u-drop { position:absolute; top:calc(100% + 8px); right:0; background:var(--bg3); border:1px solid var(--border); border-radius:11px; padding:6px; min-width:148px; opacity:0; pointer-events:none; transform:translateY(-5px); transition:opacity .16s,transform .16s; box-shadow:0 14px 36px rgba(0,0,0,.6); z-index:600; }
.u-drop.on { opacity:1; pointer-events:auto; transform:translateY(0); }
.u-drop a, .u-drop button { display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px; color:var(--text); text-decoration:none; font-size:13px; background:none; border:none; cursor:pointer; font-family:inherit; border-radius:7px; transition:background .13s; text-align:left; }
.u-drop a:hover, .u-drop button:hover { background:rgba(255,255,255,.05); }
.body { flex:1; display:flex; overflow:hidden; min-height:0; }
.spacer { width:260px; flex-shrink:0; }
.center { flex:1; min-width:0; display:flex; flex-direction:column; overflow-y:auto; }
.center::-webkit-scrollbar { width:0; }
.player-box { flex-shrink:0; background:#000; width:100%; position:relative; }
.player-box iframe { width:100%; aspect-ratio:16/9; border:none; display:block; }
.player-placeholder { width:100%; aspect-ratio:16/9; }
.auto-next-overlay { position:absolute; bottom:16px; right:16px; background:rgba(10,10,18,.88); backdrop-filter:blur(8px); border:1px solid var(--border); border-radius:12px; padding:14px 18px; min-width:220px; display:none; flex-direction:column; gap:10px; z-index:10; }
.auto-next-overlay.show { display:flex; }
.an-title { font-size:13px; color:var(--sub); }
.an-name { font-size:14px; font-weight:600; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.an-bar-wrap { height:3px; background:rgba(255,255,255,.1); border-radius:2px; overflow:hidden; }
.an-bar { height:100%; background:var(--accent); border-radius:2px; width:100%; transition:width 10s linear; }
.an-actions { display:flex; gap:8px; }
.an-btn-go { flex:1; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff; border:none; padding:7px; border-radius:7px; cursor:pointer; font-size:12px; font-weight:600; font-family:inherit; }
.an-btn-cancel { background:rgba(255,255,255,.07); color:var(--sub); border:1px solid var(--border); padding:7px 12px; border-radius:7px; cursor:pointer; font-size:12px; font-family:inherit; }
.info-bar { flex-shrink:0; padding:12px 20px; border-bottom:1px solid var(--border); border-top:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:space-between; gap:16px; }
.info-left h2 { font-size:15px; font-weight:700; color:#fff; margin-bottom:2px; }
.info-left p { font-size:12px; color:var(--sub); }
.info-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.ep-nav { display:flex; gap:8px; }
.ep-nav button { background:var(--bg3); border:1px solid var(--border); color:var(--text); padding:6px 16px; border-radius:8px; cursor:pointer; font-size:12px; font-family:inherit; transition:all .18s; }
.ep-nav button:hover { border-color:var(--accent); color:var(--accent2); }
.ep-nav button:disabled { opacity:.3; cursor:not-allowed; }
.auto-toggle { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--sub); cursor:pointer; user-select:none; }
.auto-toggle input { display:none; }
.toggle-track { width:32px; height:18px; border-radius:9px; background:var(--bg3); border:1px solid var(--border); position:relative; transition:background .2s; }
.toggle-thumb { width:12px; height:12px; border-radius:50%; background:var(--sub); position:absolute; top:2px; left:2px; transition:transform .2s,background .2s; }
.auto-toggle input:checked + .toggle-track { background:var(--accent); border-color:var(--accent); }
.auto-toggle input:checked + .toggle-track .toggle-thumb { transform:translateX(14px); background:#fff; }
.dm-layer { position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:5; }
.dm-wrap { flex-shrink:0; padding:12px 20px 14px; background:var(--bg2); }
.dm-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.dm-title { font-size:12px; font-weight:600; color:var(--sub); }
.dm-toggle { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--sub); cursor:pointer; user-select:none; }
.dm-toggle input { display:none; }
.tog-track { width:28px; height:16px; border-radius:8px; background:var(--bg3); border:1px solid var(--border); position:relative; transition:background .2s; }
.tog-thumb { width:10px; height:10px; border-radius:50%; background:var(--sub); position:absolute; top:2px; left:2px; transition:transform .2s,background .2s; }
.dm-toggle input:checked + .tog-track { background:var(--accent); border-color:var(--accent); }
.dm-toggle input:checked + .tog-track .tog-thumb { transform:translateX(12px); background:#fff; }
.dm-row { display:flex; gap:8px; }
.dm-input { flex:1; background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:9px 14px; color:var(--text); font-size:13px; outline:none; font-family:inherit; transition:border-color .2s; }
.dm-input:focus { border-color:var(--accent); }
.dm-input::placeholder { color:var(--sub); }
.dm-send { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff; border:none; padding:9px 20px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; font-family:inherit; white-space:nowrap; transition:opacity .18s; flex-shrink:0; }
.dm-send:hover { opacity:.85; }
.dm-hint { font-size:11px; color:var(--sub); margin-top:6px; min-height:16px; transition:color .2s; }
.sidebar { width:260px; flex-shrink:0; border-left:1px solid var(--border); background:var(--bg2); display:flex; flex-direction:column; overflow:hidden; }
.sb-head { flex-shrink:0; padding:14px 16px 10px; border-bottom:1px solid var(--border); }
.sb-head h3 { font-size:14px; font-weight:700; color:#fff; margin-bottom:8px; }
.ep-tabs { display:flex; gap:5px; flex-wrap:wrap; }
.ep-tab { background:var(--bg3); border:1px solid var(--border); color:var(--sub); padding:3px 10px; border-radius:5px; font-size:11px; cursor:pointer; transition:all .15s; }
.ep-tab:hover { border-color:var(--accent); color:var(--text); }
.ep-tab.on { background:rgba(124,106,247,.15); border-color:var(--accent); color:var(--accent2); }
.sb-scroll { flex:1; overflow-y:auto; padding:6px 8px; }
.sb-scroll::-webkit-scrollbar { width:3px; }
.sb-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }
.ep-page.on { display:flex; flex-direction:column; gap:2px; }
.ep-item { padding:9px 12px; border-radius:7px; cursor:pointer; font-size:13px; color:var(--sub); display:flex; align-items:center; justify-content:space-between; transition:background .14s,color .14s; }
.ep-item:hover { background:rgba(255,255,255,.04); color:var(--text); }
.ep-item.on { background:rgba(124,106,247,.14); color:var(--accent2); font-weight:600; }
.ep-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); flex-shrink:0; }
.ep-watched { width:5px; height:5px; border-radius:50%; background:var(--sub); opacity:.5; flex-shrink:0; }
</style>
