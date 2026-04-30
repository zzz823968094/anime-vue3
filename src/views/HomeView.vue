<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg" :style="heroBgStyle"/>
      <div class="hero-content">
        <div class="hero-slide-area">
          <div v-if="heroLoading" class="hero-skel">
            <div class="sh" style="flex-shrink:0;width:170px;height:240px;border-radius:14px;"/>
            <div style="flex:1">
              <div class="sh" style="width:80px;height:16px;border-radius:20px;margin-bottom:14px;"/>
              <div class="sh" style="width:55%;height:28px;border-radius:6px;margin-bottom:11px;"/>
              <div style="display:flex;gap:7px;margin-bottom:14px">
                <div class="sh" style="width:60px;height:22px;border-radius:20px;"/>
                <div class="sh" style="width:60px;height:22px;border-radius:20px;"/>
              </div>
              <div class="sh" style="width:90%;height:11px;border-radius:3px;margin-bottom:7px;"/>
              <div class="sh" style="width:68%;height:11px;border-radius:3px;margin-bottom:24px;"/>
              <div style="display:flex;gap:10px">
                <div class="sh" style="width:118px;height:40px;border-radius:24px;"/>
                <div class="sh" style="width:88px;height:40px;border-radius:24px;"/>
              </div>
            </div>
          </div>

          <div v-for="(item, i) in heroList" :key="item.id" class="hero-slide" :class="{ on: i === heroIdx }">
            <div class="hero-cover">
              <img v-if="item.vodPic" :src="item.vodPic" alt=""
                   @error="e => e.target.parentElement.innerHTML = '<div class=\'nc\'>📺</div>'"/>
              <div v-else class="nc">📺</div>
            </div>
            <div class="hero-info">
              <div class="hero-label">{{ t.hotRecommend }}</div>
              <div class="hero-title" :title="item.vodName">{{ item.vodName }}</div>
              <div class="hero-tags">
                <span v-if="item.rating > 0" class="hero-tag gold">★ {{ item.rating }}</span>
                <span class="hero-tag" :class="item.vodIsend === 1 ? 'green' : ''">
                  {{ item.vodIsend === 1 ? t.serializing : t.finished }}
                </span>
                <span v-if="item.vodTotal > 0" class="hero-tag">{{ t.episodes }} {{
                    item.vodTotal
                  }} {{ t.episodesUnit }}</span>
                <span v-if="TYPE_MAP[item.typeId]" class="hero-tag purple">{{ TYPE_MAP[item.typeId] }}</span>
              </div>
              <div class="hero-desc">{{ item.vodBlurb || t.noSynopsis }}</div>
              <div class="hero-btns">
                <RouterLink class="btn-watch" :to="`/detail/${item.id}`">{{ t.watchNow }}</RouterLink>
                <RouterLink class="btn-detail" :to="`/detail/${item.id}`">{{ t.viewDetail }}</RouterLink>
              </div>
            </div>
          </div>

          <div class="hero-dots">
            <div v-for="(_, i) in heroList" :key="i" class="hero-dot" :class="{ on: i === heroIdx }"
                 @click="goHero(i)"/>
          </div>
        </div>

        <div class="hero-thumbs">
          <div
              v-for="(item, i) in heroList"
              :key="item.id"
              class="hero-thumb"
              :class="{ on: i === heroIdx }"
              @click="goHero(i)"
          >
            <img :src="item.vodPic" alt=""/>
            <div class="hero-thumb-overlay"/>
          </div>
        </div>
      </div>
    </section>

    <!-- Tab Bar -->
    <div class="tabs-bar">
      <div class="tabs-inner">
        <button v-for="tab in tabs" :key="tab.value" class="tab" :class="{ on: activeTab === tab.value }"
                @click="setTab(tab.value)">
          <div class="tab-dot"/>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main">
      <!-- Hot Strip -->
      <div class="sec">
        <div class="sec-head">
          <div class="sec-title">{{ t.hotRecommend }}</div>
          <RouterLink class="sec-more" to="/search?sort=hot">{{ t.viewMore }}</RouterLink>
        </div>
        <div class="hstrip">
          <template v-if="hotLoading">
            <div v-for="i in 10" :key="i" style="flex-shrink:0;width:132px">
              <div class="sh" style="width:132px;height:186px;border-radius:11px;margin-bottom:8px"/>
              <div class="sh" style="height:11px;border-radius:3px;width:76%;margin-bottom:4px"/>
            </div>
          </template>
          <div v-else v-for="a in hotList" :key="a.id" class="hcard" @click="$router.push(`/detail/${a.id}`)">
            <div class="cv">
              <img v-if="a.vodPic" :src="a.vodPic" loading="lazy"
                   @error="e => e.target.parentElement.innerHTML = '<div style=\'width:100%;height:100%;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:28px\'>📺</div>'"/>
              <div v-else
                   style="width:100%;height:100%;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:28px">
                📺
              </div>
              <div class="ov"/>
              <div class="pi">▶</div>
              <span class="ep">{{ t.episodes }} {{ a.vodTotal }} {{ t.episodesUnit }}</span>
            </div>
            <div class="ct" :title="a.vodName">{{ a.vodName }}</div>
            <div class="cs">{{
                a.vodScore > 0 ? '★' + a.vodScore + ' · ' : ''
              }}{{ a.vodIsend === 0 ? t.serializing2 : t.finished2 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Latest Grid -->
      <div class="sec">
        <div class="sec-head">
          <div class="sec-title">{{ t.latestUpdate }}</div>
        </div>
        <div class="grid" v-if="listLoading">
          <div v-for="i in 24" :key="i">
            <div class="sh sk-cv"/>
            <div class="sh sk-ln" style="width:80%"/>
            <div class="sh sk-ln" style="width:50%"/>
          </div>
        </div>
        <div v-else class="grid">
          <div v-if="!animeList.length" class="empty">{{ t.noAnime }}</div>
          <div v-else v-for="a in animeList" :key="a.id" class="gcard" @click="$router.push(`/detail/${a.id}`)">
            <div class="cv">
              <img v-if="a.vodPic" :src="a.vodPic" loading="lazy"/>
              <div v-else
                   style="width:100%;height:100%;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:32px">
                📺
              </div>
              <div class="ov"/>
              <div class="pi">▶</div>
              <div v-if="a.vodScore > 0" class="score">★ {{ a.vodScore }}</div>
              <span class="ep">{{ t.episodes }} {{ a.vodTotal }} {{ t.episodesUnit }}</span>
              <span class="status-badge" :class="a.vodIsend === 1 ? 'status-on' : 'status-end'">
                {{ a.vodIsend === 0 ? t.serializing2 : t.finished2 }}
              </span>
            </div>
            <div class="ct" :title="a.vodName">{{ a.vodName }}</div>
            <div class="cs">{{ TYPE_MAP[a.typeId] || '' }}{{
                a.typeId ? ' · ' : ''
              }}{{ a.vodIsend === 0 ? t.serializing2 : t.finished2 }}
            </div>
          </div>
        </div>
        <div v-if="listPage < listPages" class="more">
          <button @click="loadMore" :disabled="listLoading">{{ t.loadMore }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {animeApi} from '@/api/anime'
import {useI18nStore} from '@/stores/i18n'

const i18n = useI18nStore()
const t = computed(() => i18n.t)

const TYPE_MAP = computed(() => ({
  '25': t.value.japan, '26': t.value.us, '24': t.value.china
}))

const tabs = computed(() => [
  {value: '', label: t.value.allType},
  {value: '25', label: t.value.japanAnime},
  {value: '26', label: t.value.usAnime},
  {value: '24', label: t.value.chinaAnime},
])

const heroList = ref([])
const heroIdx = ref(0)
const heroLoading = ref(true)
let heroTimer = null

const heroBgStyle = computed(() => {
  const img = heroList.value[heroIdx.value]?.coverImage
  return img ? {backgroundImage: `url('${img}')`} : {}
})

function goHero(i) {
  heroIdx.value = i;
  restartTimer()
}

function restartTimer() {
  clearInterval(heroTimer)
  heroTimer = setInterval(() => {
    heroIdx.value = (heroIdx.value + 1) % heroList.value.length
  }, 5000)
}

async function loadHero() {
  try {
    const res = await animeApi.getCarousel()
    heroList.value = (res.data || []).filter(a => a.vodPic).slice(0, 5)
    if (heroList.value.length) restartTimer()
  } finally {
    heroLoading.value = false
  }
}

const hotList = ref([])
const hotLoading = ref(true)

async function loadHot() {
  try {
    const res = await animeApi.getHot(16);
    hotList.value = res.data || []
  } finally {
    hotLoading.value = false
  }
}

const animeList = ref([])
const listLoading = ref(true)
const listPage = ref(1)
const listPages = ref(1)
const activeTab = ref('')

function setTab(type) {
  activeTab.value = type;
  listPage.value = 1;
  animeList.value = [];
  loadList(1, false)
}

async function loadList(page = 1, append = false) {
  listLoading.value = true
  try {
    const params = {page, size: 24, sort: 'latest', sign: 'web'}
    if (activeTab.value) params.type = activeTab.value
    const res = await animeApi.getList(params)
    const records = res.data?.records || []
    listPage.value = page
    listPages.value = res.data?.pages || 1
    if (append) animeList.value.push(...records)
    else animeList.value = records
  } finally {
    listLoading.value = false
  }
}

function loadMore() {
  if (listPage.value < listPages.value) loadList(listPage.value + 1, true)
}

onMounted(() => {
  loadHero();
  loadHot();
  loadList()
})
onUnmounted(() => clearInterval(heroTimer))
</script>
<style scoped>
/* ── 手机端适配（加到 HomeView.vue 的 style 里） ── */

@media (max-width: 768px) {
  /* Hero */
  .hero {
    height: auto;
    min-height: 280px;
  }

  .hero-content {
    flex-direction: column;
    padding: 16px;
    gap: 0;
  }

  .hero-slide-area {
    height: auto;
  }

  .hero-slide {
    flex-direction: column;
    gap: 16px;
    padding-bottom: 32px;
  }

  .hero-cover {
    width: 120px;
    height: 168px;
    transform: none !important;
    margin: 0 auto;
  }

  .hero-info {
    text-align: center;
  }

  .hero-title {
    font-size: 18px;
    white-space: normal;
  }

  .hero-tags {
    justify-content: center;
  }

  .hero-desc {
    display: none;
  }

  .hero-btns {
    justify-content: center;
  }

  .btn-watch {
    padding: 8px 18px;
    font-size: 13px;
  }

  .btn-detail {
    padding: 8px 14px;
    font-size: 13px;
  }

  /* 隐藏右侧缩略图 */
  .hero-thumbs {
    display: none;
  }

  /* Tabs - 添加顶部安全区域 */
  .tabs-bar {
    padding-top: env(safe-area-inset-top);
  }

  .tabs-inner {
    gap: 0;
    overflow-x: auto;
    padding: 0 12px;
  }

  .tab {
    padding: 0 12px;
    font-size: 12px;
    flex-shrink: 0;
  }

  /* Main */
  .main {
    padding: 16px 12px 40px;
  }

  /* Grid */
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  /* Hot strip */
  .hcard {
    width: 110px;
  }

  .hcard .cv {
    width: 110px;
    height: 154px;
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 240px;
  }

  .hero-cover {
    width: 100px;
    height: 140px;
  }

  .hero-title {
    font-size: 16px;
  }

  .btn-watch, .btn-detail {
    padding: 7px 14px;
    font-size: 12px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  .hcard {
    width: 95px;
  }

  .hcard .cv {
    width: 95px;
    height: 133px;
  }
}
</style>