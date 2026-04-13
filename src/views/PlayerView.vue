<template>
  <div class="player-page">
    <!-- ── 顶部导航 ── -->
    <nav class="nav">
      <RouterLink to="/" class="nav-logo">
        <img src="@/assets/logo.png" alt="logo" class="nav-logo-img" />{{ t.siteName }}
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
      <div class="spacer" />

      <div class="center">
        <!-- 播放器 -->
        <div class="player-box">
          <!-- 原生 video 标签替换 iframe -->
          <video
              ref="videoEl"
              class="player-video"
              controls
              preload="auto"
              @timeupdate="onTimeUpdate"
              @play="onPlay"
              @pause="onPause"
              @seeked="onSeeked"
          />

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
            <label class="auto-toggle">
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

        <!-- 弹幕发送区 -->
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

      <!-- 侧边栏 -->
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
import Hls from 'hls.js'

const route     = useRoute()
const router    = useRouter()
const auth      = useAuthStore()
const i18nStore = useI18nStore()
const t         = computed(() => i18nStore.t)

const animeId   = computed(() => route.query.animeId)
const videoId   = computed(() => route.query.videoId)
const currentEp = computed(() => parseInt(route.query.ep || '1'))

// ── 数据 ──
const animeTitle = ref('')
const totalEp    = ref(0)
const m3u8Url    = ref('')
const allVideos  = ref([])
const videoEl    = ref(null)   // <video> 元素引用
let   hls        = null

// ── 自动播放 ──
const autoPlay     = ref(localStorage.getItem('autoPlay') !== 'false')
const showAutoNext = ref(false)
const nextVideo    = ref(null)
const anBar        = ref(null)
let   autoNextTimer = null

// ── 弹幕 ──
const dmEnabled   = ref(localStorage.getItem('dmEnabled') !== 'false')
const dmInput     = ref('')
const dmHint      = ref('')
const dmHintColor = ref('')
const dmLayer     = ref(null)
let   ws          = null
const DM_TRACKS   = 8
const trackBusy   = new Array(DM_TRACKS).fill(0)

// 历史弹幕队列（按 timePoint 排序）
let   historyDanmaku = []
let   isPlaying      = false

// ── 下拉菜单 ──
const dropOpen = ref(false)

// ── 分组 ──
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

const curIdx       = computed(() => allVideos.value.findIndex(v => v.episode === currentEp.value))
const prevDisabled = computed(() => curIdx.value <= 0)
const nextDisabled = computed(() => curIdx.value < 0 || curIdx.value >= allVideos.value.length - 1)

// ── 初始化 HLS 播放器 ──
function initPlayer(url) {
  if (!url || !videoEl.value) return
  // 销毁旧实例
  if (hls) { hls.destroy(); hls = null }

  if (Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(url)
    hls.attachMedia(videoEl.value)
  } else if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari 原生支持 HLS
    videoEl.value.src = url
  } else {
    console.error('当前浏览器不支持 HLS 播放')
  }
}

// ── 视频事件 ──
function onTimeUpdate() {
  if (!videoEl.value) return
  const currentTime = videoEl.value.currentTime
  // 检查是否有弹幕需要在此时显示
  checkDanmakuQueue(currentTime)
  // 自动播放检测（视频快结束时触发）
  if (videoEl.value.duration > 0 && !videoEl.value.paused) {
    const remaining = videoEl.value.duration - currentTime
    if (remaining <= 10 && remaining > 0 && nextVideo.value && autoPlay.value && !showAutoNext.value) {
      triggerAutoNext()
    }
  }
}

function onPlay() {
  isPlaying = true
  // 恢复所有弹幕动画
  if (dmLayer.value) {
    dmLayer.value.querySelectorAll('.dm-item').forEach(el => {
      el.style.animationPlayState = 'running'
    })
  }
}

function onPause() {
  isPlaying = false
  // 暂停所有弹幕动画
  if (dmLayer.value) {
    dmLayer.value.querySelectorAll('.dm-item').forEach(el => {
      el.style.animationPlayState = 'paused'
    })
  }
}

function onSeeked() {
  if (!videoEl.value) return
  const currentTime = videoEl.value.currentTime
  // 当前时间之前的标记已显示，之后的重置为未显示
  historyDanmaku.forEach(d => {
    d._shown = d.timePoint < currentTime
  })
  // 只在播放状态下清除飘动中的弹幕，暂停时保留
  if (isPlaying && dmLayer.value) dmLayer.value.innerHTML = ''
}

function checkDanmakuQueue(currentTime) {
  if (!dmEnabled.value) return
  if (!isPlaying) return  // 用 isPlaying 标志位判断
  historyDanmaku.forEach(d => {
    if (!d._shown && d.timePoint <= currentTime) {
      renderDanmaku(d.content, d.color || '#FFFFFF')
      d._shown = true
    }
  })
}

// ── 加载数据 ──
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
    m3u8Url.value    = video.m3u8Url
    document.title   = `${anime.title} - ${t.value.siteName}`

    await nextTick()
    initPlayer(video.m3u8Url)
    saveWatchHistory({ animeId: animeId.value, title: anime.title, episode: currentEp.value, videoId: videoId.value, coverImage: anime.coverImage || '' })
    updateNextVideo()
    scrollToCurrentEp()
    connectDm(videoId.value)
  } catch (e) {
    console.error('载入失败', e)
  }
}

async function loadVideo() {
  if (!videoId.value) return
  try {
    ws?.close()
    historyDanmaku = []

    const res = await videoApi.getOne(videoId.value)
    m3u8Url.value = res.data.m3u8Url
    document.title = `${animeTitle.value} - ${t.value.siteName}`

    await nextTick()
    initPlayer(res.data.m3u8Url)
    saveWatchHistory({ animeId: animeId.value, title: animeTitle.value, episode: currentEp.value, videoId: videoId.value, coverImage: '' })
    updateNextVideo()
    scrollToCurrentEp()
    connectDm(videoId.value)
  } catch (e) {
    console.error('切换集数失败', e)
  }
}

function updateNextVideo() {
  const idx = allVideos.value.findIndex(v => v.episode === currentEp.value)
  nextVideo.value = (idx >= 0 && idx < allVideos.value.length - 1)
      ? allVideos.value[idx + 1] : null
  const curGroup = idx >= 0 ? Math.floor(idx / EP_PAGE) : 0
  activeGroup.value = curGroup
}

function scrollToCurrentEp() {
  nextTick(() => {
    const el = document.getElementById(`ep-${currentEp.value}`)
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

watch(
    () => route.query.videoId,
    (newId, oldId) => {
      if (!newId || oldId === undefined) return
      loadVideo()
    }
)

// ── 自动播放 ──
function triggerAutoNext() {
  if (!nextVideo.value || !autoPlay.value || showAutoNext.value) return
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

function go(v) {
  router.push({ path: '/player', query: { animeId: animeId.value, videoId: v.id, ep: v.episode } })
}
function goPrev() { if (!prevDisabled.value) go(allVideos.value[curIdx.value - 1]) }
function goNext() { if (!nextDisabled.value) go(allVideos.value[curIdx.value + 1]) }

// ── 历史记录 ──
function saveWatchHistory(item) {
  try {
    let h = JSON.parse(localStorage.getItem('watchHistory') || '[]')
    h = h.filter(i => i.animeId !== item.animeId)
    h.unshift({ ...item, ts: Date.now(), progress: 0 })
    if (h.length > 100) h = h.slice(0, 100)
    localStorage.setItem('watchHistory', JSON.stringify(h))
  } catch {}
}

// ── 弹幕渲染 ──
function getFreeTrack() {
  const now = Date.now()
  let best = 0
  for (let i = 0; i < DM_TRACKS; i++) {
    if (trackBusy[i] <= now) return i
    if (trackBusy[i] < trackBusy[best]) best = i
  }
  return best
}

function renderDanmaku(content, color = '#FFFFFF') {
  if (!dmEnabled.value || !dmLayer.value) return
  const track = getFreeTrack()
  const speed = 8 + Math.random() * 4
  const el    = document.createElement('div')
  el.className = 'dm-item'
  el.textContent = content
  el.style.cssText = `color:${color};top:${track * (100 / DM_TRACKS) + 2}%;left:100%;animation-duration:${speed}s;animation-play-state:${isPlaying ? 'running' : 'paused'}`
  dmLayer.value.appendChild(el)
  trackBusy[track] = Date.now() + speed * 1000
  el.addEventListener('animationend', () => el.remove())
}

function onDmToggle() {
  localStorage.setItem('dmEnabled', dmEnabled.value)
  if (!dmEnabled.value && dmLayer.value) dmLayer.value.innerHTML = ''
}

// ── WebSocket 弹幕 ──
function connectDm(vid) {
  ws?.close()
  historyDanmaku = []
  try {
    // 使用相对路径，通过代理连接 WebSocket
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/danmaku/${vid}`
    ws = new WebSocket(wsUrl)
    ws.onopen = () => { dmHint.value = ''; dmHintColor.value = '' }
    ws.onmessage = e => {
      try {
        const m = JSON.parse(e.data)
        if (m.type === 'history') {
          // 历史弹幕存入队列，按 timePoint 排序，等播放到对应时间再显示
          historyDanmaku = (m.data || [])
              .map(d => ({ ...d, _shown: false }))
              .sort((a, b) => a.timePoint - b.timePoint)
          return
        }
        if (m.type === 'danmaku') {
          // 实时弹幕直接显示
          renderDanmaku(m.content, m.color || '#FFFFFF')
          if (m.self) {
            dmHint.value = '✓ 弹幕已发送'
            dmHintColor.value = '#4ade80'
            setTimeout(() => { dmHint.value = ''; dmHintColor.value = '' }, 2000)
          }
        }
      } catch {}
    }
    ws.onclose = () => { dmHint.value = '弹幕连接已断开'; dmHintColor.value = 'var(--sub)' }
    ws.onerror = () => { dmHint.value = '弹幕连接失败'; dmHintColor.value = '#f87171' }
    setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }))
    }, 25000)
  } catch { dmHint.value = '弹幕初始化失败' }
}

function sendDm() {
  const content = dmInput.value.trim()
  if (!content) return
  if (!auth.isLoggedIn) {
    if (confirm('发送弹幕需要登录，是否前往登录？')) router.push('/login')
    return
  }
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    dmHint.value = '弹幕服务未连接'
    dmHintColor.value = '#f87171'
    return
  }
  // 读取当前播放时间作为 timePoint
  const timePoint = videoEl.value ? Math.floor(videoEl.value.currentTime) : 0
  ws.send(JSON.stringify({
    type: 'danmaku', content,
    timePoint,
    color: '#FFFFFF', dmType: 0,
    username: auth.username || '匿名'
  }))
  dmInput.value = ''
}

// ── 生命周期 ──
const handleGlobalClick = () => { dropOpen.value = false }

onMounted(() => {
  loadFull()
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  clearInterval(autoNextTimer)
  ws?.close()
  if (hls) { hls.destroy(); hls = null }
})
</script>

<style scoped>
.nav-logo-img { width: 32px; height: 32px; object-fit: contain; }
.player-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.nav { flex-shrink:0; height:52px; padding:0 24px; background:var(--nav-bg); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:16px; z-index:500; }
.nav-logo { display:flex; align-items:center; gap:7px; text-decoration:none; font-size:16px; font-weight:700; color:var(--text); flex-shrink:0; }
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
.player-video { width:100%; aspect-ratio:16/9; display:block; background:#000; }
.auto-next-overlay { position:absolute; bottom:16px; right:16px; background:rgba(10,10,18,.88); backdrop-filter:blur(8px); border:1px solid var(--border); border-radius:12px; padding:14px 18px; min-width:220px; display:none; flex-direction:column; gap:10px; z-index:10; }
.auto-next-overlay.show { display:flex; }
.an-title { font-size:13px; color:var(--sub); }
.an-name { font-size:14px; font-weight:600; color:#fff; }
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
.dm-item { position:absolute; white-space:nowrap; font-size:22px; font-weight:600; text-shadow:1px 1px 2px rgba(0,0,0,.8),-1px -1px 2px rgba(0,0,0,.8); animation:dm-fly linear forwards; pointer-events:none; }
@keyframes dm-fly { from{transform:translateX(0)} to{transform:translateX(calc(-100% - 100vw))} }
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
.sb-head h3 { font-size:14px; font-weight:700; color:var(--text); margin-bottom:8px; }
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
@media (max-width: 768px) {
  .player-page { height: auto; overflow: auto; }
  .body { flex-direction: column; overflow: visible; }
  .spacer { display: none; }
  .center { overflow: visible; }
  .sidebar { width: 100%; border-left: none; border-top: 1px solid var(--border); height: auto; max-height: 300px; }
  .sb-scroll { max-height: 240px; }
  .ep-page.on { flex-direction: row; flex-wrap: wrap; gap: 6px; padding: 8px; }
  .ep-item { width: auto; padding: 6px 12px; }
  .nav { gap: 8px; padding: 0 12px; }
  .nav-info { display: none; }
  .nav-back { font-size: 12px; }
}
</style>