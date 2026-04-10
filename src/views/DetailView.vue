<template>
  <div>
    <div class="detail-hero">
      <div class="hero-blur" :style="bgStyle" />
      <div class="hero-inner">
        <template v-if="loading">
          <div class="cover-card"><div class="sh" style="width:192px;height:270px;border-radius:14px;" /></div>
          <div class="info-wrap">
            <div class="sh" style="width:60px;height:14px;margin-bottom:18px;" />
            <div class="sh" style="width:55%;height:30px;margin-bottom:10px;" />
            <div class="sh" style="width:35%;height:12px;margin-bottom:16px;" />
            <div style="display:flex;gap:7px;margin-bottom:16px">
              <div class="sh" style="width:60px;height:22px;border-radius:10px;" />
              <div class="sh" style="width:60px;height:22px;border-radius:10px;" />
            </div>
            <div class="sh" style="width:88%;height:12px;margin-bottom:7px;" />
            <div class="sh" style="width:58%;height:12px;margin-bottom:22px;" />
            <div style="display:flex;gap:10px">
              <div class="sh" style="width:128px;height:44px;border-radius:22px;" />
              <div class="sh" style="width:96px;height:44px;border-radius:22px;" />
            </div>
          </div>
        </template>

        <template v-else-if="anime">
          <div class="cover-card">
            <img v-if="anime.coverImage && !coverErr" :src="anime.coverImage" :alt="anime.title" @error="coverErr = true" />
            <div v-else class="nc">🎌</div>
            <div class="cover-badge">
              <div v-if="anime.rating > 0" class="badge-item"><strong>★ {{ anime.rating }}</strong>{{ t.rating }}</div>
              <div class="badge-item"><strong>{{ anime.currentEpisode }}</strong>{{ t.episodeCount }}</div>
            </div>
          </div>

          <div class="info-wrap">
            <RouterLink class="back-link" to="/">{{ t.backHome }}</RouterLink>
            <div class="anime-title">{{ anime.title }}</div>
            <div v-if="anime.titleOriginal" class="anime-orig">{{ anime.titleOriginal }}</div>
            <div class="tag-row">
              <span class="tag" :class="statusClass">{{ statusText }}</span>
              <span v-if="anime.year" class="tag gray">📅 {{ anime.year }}</span>
              <span v-for="g in genreList" :key="g" class="tag">{{ g }}</span>
            </div>
            <div class="meta-row">
              <div v-if="anime.type" class="meta">{{ t.type }}<strong>{{ typeText }}</strong></div>
              <div class="meta">{{ t.episodes2 }}<strong>{{ anime.episodeCount || anime.currentEpisode || '?' }} {{ t.episodesUnit }}</strong></div>
            </div>
            <template v-if="anime.synopsis">
              <div class="synopsis" :class="{ collapsed: synCollapsed }">{{ anime.synopsis }}</div>
              <button class="expand-btn" @click="synCollapsed = !synCollapsed">
                {{ synCollapsed ? t.expandSynopsis : t.collapseSynopsis }}
              </button>
            </template>
            <div v-else style="color:var(--sub);font-size:13px;margin-bottom:20px">{{ t.noSynopsis }}</div>
            <div class="action-row">
              <RouterLink
                v-if="videos.length"
                class="btn-play"
                :to="`/player?animeId=${anime.id}&videoId=${videos[0].id}&ep=${videos[0].episode}`"
              >{{ t.playNow }}</RouterLink>
              <button class="btn-fav" :class="{ faved: isFaved }" @click="toggleFav">
                <span v-if="isFaved">★ &nbsp;{{ t.favorites }}</span>
                <span v-else>♡ &nbsp;{{ t.favorites }}</span>
              </button>
            </div>
          </div>
        </template>

        <div v-else style="padding:60px;text-align:center;color:var(--sub)">{{ t.loadFail2 }}</div>
      </div>
    </div>

    <div class="main">
      <div class="sec">
        <div class="sec-head">
          <div class="sec-title">{{ t.epList }}</div>
          <span style="font-size:12px;color:var(--sub)">{{ t.epTotal }} {{ videos.length }} {{ t.episodesUnit }}</span>
        </div>
        <div v-if="!videos.length && !loading" style="color:var(--sub);font-size:14px">{{ t.noVideo }}</div>
        <div v-else class="ep-wrap">
          <div v-if="epGroups.length > 1" class="ep-tabs">
            <button
              v-for="(g, i) in epGroups" :key="i"
              class="ep-tab" :class="{ on: activeGroup === i }"
              @click="activeGroup = i"
            >{{ g.label }}</button>
          </div>
          <div class="ep-page on">
            <button
              v-for="v in currentGroupVideos" :key="v.id"
              class="ep-btn"
              :title="v.title || `${t.epLabel}${v.episode}${t.epSuffix}`"
              @click="$router.push(`/player?animeId=${anime.id}&videoId=${v.id}&ep=${v.episode}`)"
            >{{ t.epLabel }}{{ v.episode }}{{ t.epSuffix }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { animeApi, videoApi, favoriteApi } from '@/api/anime'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const i18n   = useI18nStore()
const t      = computed(() => i18n.t)

const anime        = ref(null)
const videos       = ref([])
const loading      = ref(true)
const coverErr     = ref(false)
const synCollapsed = ref(true)
const isFaved      = ref(false)
const activeGroup  = ref(0)

const TYPE_MAP   = computed(() => ({ '25': t.value.japanAnime, '26': t.value.usAnime, '24': t.value.chinaAnime }))
const STATUS_MAP = computed(() => ({ 0: t.value.offline, 1: t.value.serializing3, 2: t.value.finished3 }))
const STATUS_CLASS = { 0: 'gray', 1: 'green', 2: 'gray' }

const bgStyle    = computed(() => anime.value?.coverImage ? { backgroundImage: `url('${anime.value.coverImage}')` } : {})
const statusText  = computed(() => STATUS_MAP.value[anime.value?.status] || t.value.unknown)
const statusClass = computed(() => STATUS_CLASS[anime.value?.status] || 'gray')
const typeText    = computed(() => TYPE_MAP.value[anime.value?.type] || anime.value?.type || '')
const genreList   = computed(() => anime.value?.genre?.split(',').slice(0, 4).map(g => g.trim()) || [])

const EP_PAGE = 50
const epGroups = computed(() => {
  const total = Math.ceil(videos.value.length / EP_PAGE)
  return Array.from({ length: total }, (_, i) => ({
    label: `${i * EP_PAGE + 1}-${Math.min((i + 1) * EP_PAGE, videos.value.length)}`,
  }))
})
const currentGroupVideos = computed(() =>
  videos.value.slice(activeGroup.value * EP_PAGE, (activeGroup.value + 1) * EP_PAGE)
)

async function load() {
  const id = route.params.id
  if (!id) { router.push('/'); return }
  loading.value = true
  try {
    const [ar, vr] = await Promise.all([animeApi.getDetail(id), videoApi.getByAnime(id)])
    anime.value  = ar.data
    videos.value = vr.data || []
    document.title = `${anime.value?.title} - ${t.value.siteName}`
    if (auth.isLoggedIn) checkFav(id)
  } catch { anime.value = null }
  finally { loading.value = false }
}

async function checkFav(id) {
  try { const res = await favoriteApi.check(id); isFaved.value = res.data === true }
  catch { isFaved.value = false }
}

async function toggleFav() {
  if (!auth.isLoggedIn) { router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`); return }
  try {
    if (isFaved.value) await favoriteApi.remove(anime.value.id)
    else await favoriteApi.add(anime.value.id)
    isFaved.value = !isFaved.value
  } catch {}
}

onMounted(load)
</script>
