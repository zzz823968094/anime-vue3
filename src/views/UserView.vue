<template>
  <div class="page">
    <div class="sidebar">
      <div class="profile-card">
        <div class="avatar-big">{{ avatarChar }}</div>
        <div class="profile-name">{{ displayName }}</div>
        <div class="profile-role">{{ roleText }}</div>
        <div class="profile-stats">
          <div class="stat"><strong>{{ favCount === null ? '—' : favCount }}</strong><span>{{ t.favCount }}</span></div>
          <div class="stat"><strong>{{ histCount }}</strong><span>{{ t.watchCount }}</span></div>
        </div>
      </div>
      <div class="side-menu">
        <button class="side-item" :class="{ on: activeTab === 'info' }"      @click="setTab('info')">      <span class="icon">👤</span>{{ t.personalInfo }}</button>
        <button class="side-item" :class="{ on: activeTab === 'favorites' }" @click="setTab('favorites')"> <span class="icon">⭐</span>{{ t.myFav }}</button>
        <button class="side-item" :class="{ on: activeTab === 'history' }"   @click="setTab('history')">   <span class="icon">🕐</span>{{ t.watchHistory }}</button>
        <button class="side-item side-danger" @click="handleLogout">                                        <span class="icon">🚪</span>{{ t.logoutBtn }}</button>
      </div>
    </div>

    <div class="content">
      <!-- 個人資訊 -->
      <div v-show="activeTab === 'info'" class="panel">
        <div class="panel-head"><div class="panel-title">{{ t.personalInfo }}</div></div>
        <div class="info-form">
          <div v-if="infoLoading" style="text-align:center;padding:40px;color:var(--sub)">{{ t.loading }}</div>
          <template v-else-if="userInfo">
            <div class="form-row"><div class="form-label">{{ t.usernameLabel }}</div><div class="form-val">{{ userInfo.username }}</div></div>
            <div class="form-row"><div class="form-label">{{ t.emailLabel }}</div><div class="form-val">{{ userInfo.email || t.emailNotSet }}</div><div class="form-note">{{ t.emailNote }}</div></div>
            <div class="form-row"><div class="form-label">{{ t.roleLabel }}</div><div class="form-val">{{ userInfo.role === 1 ? t.admin : t.normalUser }}</div></div>
            <div class="form-row"><div class="form-label">{{ t.regTimeLabel }}</div><div class="form-val">{{ userInfo.createdAt ? userInfo.createdAt.slice(0, 10) : t.unknownTime }}</div></div>
            <div class="form-row"><div class="form-label">{{ t.lastLoginLabel }}</div><div class="form-val">{{ userInfo.lastLoginAt ? userInfo.lastLoginAt.slice(0, 16).replace('T', ' ') : t.unknownTime }}</div></div>
          </template>
          <template v-else>
            <div class="form-row"><div class="form-label">{{ t.usernameLabel }}</div><div class="form-val">{{ auth.username }}</div></div>
            <div style="color:var(--sub);font-size:13px;margin-top:8px">{{ t.loadInfoFail }}</div>
          </template>
        </div>
      </div>

      <!-- 我的收藏 -->
      <div v-show="activeTab === 'favorites'" class="panel">
        <div class="panel-head">
          <div class="panel-title">{{ t.myFav }}</div>
          <button class="panel-action" @click="clearFavs">{{ t.clearFav }}</button>
        </div>
        <div v-if="favLoading" class="grid">
          <div v-for="i in 6" :key="i" class="sk"><div class="sh sk-cv" /><div class="sh sk-ln" style="width:80%" /></div>
        </div>
        <div v-else-if="!favList.length" class="empty-state">
          <div class="ei">⭐</div><div class="et">{{ t.noFav }}</div>
          <div class="es">{{ t.noFavSub }}</div>
          <RouterLink to="/">{{ t.goHome }}</RouterLink>
        </div>
        <div v-else class="grid">
          <div v-for="item in favList" :key="item.id" class="gcard" @click="$router.push(`/detail/${item.id}`)">
            <div class="cv">
              <img v-if="item.coverImage" :src="item.coverImage" loading="lazy" />
              <div v-else class="nc">🎌</div>
              <div class="ov" /><div class="pi">▶</div>
              <span class="ep-tag">{{ t.epLabel }}{{ item.currentEpisode || '?' }}{{ t.epSuffix }}</span>
              <button class="rm-btn" @click.stop="removeFav(item.id)">✕</button>
            </div>
            <div class="ct" :title="item.title">{{ item.title || t.loadFail }}</div>
            <div class="cs">{{ item.year || '' }}{{ item.status === 1 ? ` · ${t.serializing2}` : ` · ${t.finished2}` }}</div>
          </div>
        </div>
      </div>

      <!-- 觀看歷史 -->
      <div v-show="activeTab === 'history'" class="panel">
        <div class="panel-head">
          <div class="panel-title">{{ t.watchHistory }}</div>
          <button class="panel-action" @click="clearHistory">{{ t.clearHistory }}</button>
        </div>
        <div v-if="!histList.length" class="empty-state">
          <div class="ei">🕐</div><div class="et">{{ t.noHistory }}</div>
          <div class="es">{{ t.noHistorySub }}</div>
          <RouterLink to="/">{{ t.goWatch }}</RouterLink>
        </div>
        <div v-else class="grid">
          <div v-for="item in histList" :key="item.animeId" class="gcard"
            @click="$router.push(`/player?animeId=${item.animeId}&videoId=${item.videoId}&ep=${item.episode}`)">
            <div class="cv">
              <img v-if="item.coverImage" :src="item.coverImage" loading="lazy" />
              <div v-else class="nc">🎌</div>
              <div class="ov" /><div class="pi">▶</div>
              <span class="ep-tag">{{ t.epLabel }}{{ item.episode }}{{ t.epSuffix }}</span>
              <button class="rm-btn" @click.stop="removeHistory(item.animeId)">✕</button>
            </div>
            <div class="ct" :title="item.title">{{ item.title }}</div>
            <div class="cs">{{ t.watchedTo }} {{ item.episode }}</div>
            <div class="prog-bar"><div class="prog-fill" :style="{ width: (item.progress || 0) + '%' }" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { favoriteApi, userApi, animeApi } from '@/api/anime'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const i18n   = useI18nStore()
const t      = computed(() => i18n.t)

if (!auth.isLoggedIn) router.push('/login')

const activeTab   = ref('info')
const userInfo    = ref(null)
const infoLoading = ref(true)
const favCount    = ref(null)

const displayName = computed(() => userInfo.value?.username || auth.username || t.value.normalUser)
const avatarChar  = computed(() => (displayName.value.charAt(0) || '👤').toUpperCase())
const roleText    = computed(() => userInfo.value?.role === 1 ? t.value.admin : t.value.normalUser)
const histCount   = computed(() => JSON.parse(localStorage.getItem('watchHistory') || '[]').length)

function setTab(name) {
  activeTab.value = name
  if (name === 'favorites') loadFavs()
  if (name === 'history')   loadHistory()
}

async function loadProfile() {
  infoLoading.value = true
  try { const res = await userApi.me(); if (res.code === 200 && res.data) userInfo.value = res.data }
  catch {} finally { infoLoading.value = false }
  try { const res = await favoriteApi.list(); favCount.value = (res.data || []).length }
  catch { favCount.value = null }
}

const favList    = ref([])
const favLoading = ref(false)

async function loadFavs() {
  favLoading.value = true
  try {
    const res = await favoriteApi.list()
    const ids = res.data || []
    favCount.value = ids.length
    if (!ids.length) { favList.value = []; return }
    const results = await Promise.allSettled(ids.map(id => animeApi.getDetail(id)))
    favList.value = results.map((r, i) => r.status === 'fulfilled' ? { id: ids[i], ...r.value?.data } : { id: ids[i] })
  } catch { favList.value = [] }
  finally { favLoading.value = false }
}

async function removeFav(id) { try { await favoriteApi.remove(id); loadFavs() } catch {} }
async function clearFavs() {
  if (!confirm(t.value.clearFav + '?')) return
  try { const res = await favoriteApi.list(); await Promise.all((res.data || []).map(id => favoriteApi.remove(id))); loadFavs() }
  catch {}
}

const histList = ref([])
function loadHistory() {
  const h = JSON.parse(localStorage.getItem('watchHistory') || '[]')
  histList.value = [...h].sort((a, b) => (b.ts || 0) - (a.ts || 0))
}
function removeHistory(animeId) {
  let h = JSON.parse(localStorage.getItem('watchHistory') || '[]')
  localStorage.setItem('watchHistory', JSON.stringify(h.filter(i => i.animeId !== animeId)))
  loadHistory()
}
function clearHistory() {
  if (!confirm(t.value.clearHistory + '?')) return
  localStorage.setItem('watchHistory', '[]'); loadHistory()
}
function handleLogout() { auth.logout(); router.push('/login') }

onMounted(() => {
  loadProfile()
  const hash = route.hash.replace('#', '')
  if (hash === 'favorites') setTab('favorites')
  else if (hash === 'history') setTab('history')
  else loadHistory()
})
</script>

<style scoped>
.page { max-width:1200px; margin:0; padding:32px 28px 60px; display:flex; gap:28px; align-items:flex-start; }
.sidebar { width:260px; flex-shrink:0; }
.profile-card { background:var(--bg2); border:1px solid var(--border2); border-radius:16px; padding:26px 20px; text-align:center; margin-bottom:12px; }
.avatar-big { width:72px; height:72px; border-radius:50%; margin:0 auto 12px; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:30px; box-shadow:0 0 24px var(--glow); }
.profile-name { font-size:16px; font-weight:800; color:var(--text); margin-bottom:4px; }
.profile-role { font-size:11px; color:var(--sub); background:var(--bg3); padding:3px 10px; border-radius:12px; display:inline-block; font-weight:600; }
.profile-stats { display:flex; margin-top:18px; border-top:1px solid var(--border); padding-top:16px; }
.stat { flex:1; text-align:center; }
.stat strong { display:block; font-size:20px; font-weight:800; color:var(--text); }
.stat span { font-size:10px; color:var(--sub); font-weight:600; }
.stat + .stat { border-left:1px solid var(--border); }
.side-menu { background:var(--bg2); border:1px solid var(--border2); border-radius:16px; overflow:hidden; }
.side-item { display:flex; align-items:center; gap:10px; padding:13px 16px; font-size:14px; color:var(--sub); cursor:pointer; transition:all .18s; border:none; background:none; width:100%; font-family:inherit; text-align:left; border-left:3px solid transparent; font-weight:600; }
.side-item:hover { color:var(--text); background:var(--bg3); }
.side-item.on { color:var(--accent2); background:rgba(124,92,252,.1); border-left-color:var(--accent); }
.side-item .icon { font-size:16px; flex-shrink:0; }
.side-item + .side-item { border-top:1px solid var(--border); }
.side-danger { color:var(--red) !important; }
.side-danger:hover { background:rgba(248,113,113,.08) !important; }
.content { flex:1; min-width:0; }
.panel { display:block; }
.panel-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; padding-bottom:16px; border-bottom:1px solid var(--border); }
.panel-title { font-size:18px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:9px; }
.panel-title::before { content:''; width:4px; height:18px; background:linear-gradient(to bottom,var(--accent),var(--accent2)); border-radius:2px; }
.panel-action { font-size:12px; color:var(--sub); cursor:pointer; padding:5px 13px; border-radius:8px; border:1.5px solid var(--border); background:none; font-family:inherit; transition:all .18s; font-weight:600; }
.panel-action:hover { border-color:var(--accent); color:var(--accent2); background:rgba(124,92,252,.08); }
.info-form { max-width: 480px; background:var(--bg2); border:1px solid var(--border2); border-radius:14px; padding:26px; }
.form-row { margin-bottom:20px; }
.form-label { font-size:12px; color:var(--sub); margin-bottom:7px; font-weight:700; letter-spacing:.4px; }
.form-val { font-size:14px; color:var(--text); background:var(--bg3); border:1.5px solid var(--border); border-radius:10px; padding:11px 15px; font-weight:500; }
.form-note { font-size:11px; color:var(--sub); margin-top:5px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:14px; }
.gcard { cursor:pointer; transition:transform .2s; }
.gcard:hover { transform:translateY(-4px); }
.gcard .cv { width:100%; aspect-ratio:3/4; border-radius:10px; overflow:hidden; position:relative; background:var(--card); margin-bottom:7px; }
.gcard .cv img { width:100%; height:100%; object-fit:cover; transition:transform .3s; }
.gcard:hover .cv img { transform:scale(1.07); }
.gcard .cv .nc { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:32px; background:linear-gradient(135deg,#13132e,#1d1050); }
.gcard .cv .ov { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 58%); opacity:0; transition:opacity .22s; }
.gcard:hover .cv .ov { opacity:1; }
.gcard .cv .pi { position:absolute; bottom:9px; left:50%; transform:translateX(-50%) translateY(6px); width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff; opacity:0; transition:opacity .22s,transform .22s; }
.gcard:hover .cv .pi { opacity:1; transform:translateX(-50%) translateY(0); }
.ep-tag { position:absolute; top:6px; right:6px; background:rgba(0,0,0,.7); backdrop-filter:blur(4px); color:rgba(255,255,255,.92); font-size:10px; padding:2px 6px; border-radius:5px; font-weight:600; }
.rm-btn { position:absolute; top:6px; left:6px; width:24px; height:24px; border-radius:50%; background:rgba(0,0,0,.7); color:var(--red); border:none; display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer; opacity:0; transition:opacity .2s; line-height:1; }
.gcard:hover .rm-btn { opacity:1; }
.gcard .ct { font-size:12px; color:var(--text); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gcard .cs { font-size:11px; color:var(--sub); margin-top:3px; }
.prog-bar { height:2px; background:var(--bg3); border-radius:2px; margin-top:6px; overflow:hidden; }
.prog-fill { height:100%; background:linear-gradient(to right,var(--accent),var(--accent2)); border-radius:2px; transition:width .3s; }
.empty-state { padding:64px 20px; text-align:center; color:var(--sub); background:var(--bg2); border:1px solid var(--border2); border-radius:16px; }
.empty-state .ei { font-size:52px; margin-bottom:14px; }
.empty-state .et { font-size:16px; color:var(--text); margin-bottom:6px; font-weight:700; }
.empty-state .es { font-size:13px; margin-bottom:22px; }
.empty-state a { display:inline-block; background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff; text-decoration:none; padding:9px 22px; border-radius:18px; font-size:13px; font-weight:700; box-shadow:0 4px 14px var(--glow); }
.sk .sk-cv { width:100%; aspect-ratio:3/4; border-radius:10px; margin-bottom:7px; }
.sk .sk-ln { height:11px; border-radius:4px; margin-bottom:4px; }
@media (max-width: 768px) {
  .page { flex-direction: column; padding: 16px 12px 40px; gap: 16px; }
  .sidebar { width: 100%; }
  .profile-card { padding: 20px 16px; }
  .side-menu {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-radius: 12px;
    overflow: hidden;
  }
  .side-item {
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    font-size: 11px;
    border-left: none !important;
    border-top: none !important;
    border-bottom: 3px solid transparent;
    width: 100%;
    justify-content: center;
  }
  .side-item.on {
    border-bottom-color: var(--accent);
  }
  .side-item .icon { font-size: 20px; }
  .content { width: 100%; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
  .info-form { max-width: 100%; padding: 16px; }
}
</style>
