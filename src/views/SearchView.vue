<template>
  <div class="main">
    <div v-if="keyword" class="search-head">
      <h2>{{ t.searchResult }} 「<em>{{ keyword }}</em>」{{ t.searchResultSuffix }}</h2>
      <div class="search-count">{{ countText }}</div>
    </div>

    <template v-if="!keyword">
      <div class="sec">
        <div class="sec-head"><div class="sec-title">{{ t.hotSearch }}</div></div>
        <div class="hot-tags">
          <button v-for="tag in hotTags" :key="tag" class="hot-tag" @click="quickSearch(tag)">{{ tag }}</button>
        </div>
      </div>
      <div class="sec">
        <div class="sec-head"><div class="sec-title">{{ t.latestUpdate }}</div></div>
        <div class="grid">
          <template v-if="defaultLoading">
            <div v-for="i in 12" :key="i" class="sk">
              <div class="sh sk-cv" /><div class="sh sk-ln" style="width:82%" /><div class="sh sk-ln" style="width:50%" />
            </div>
          </template>
          <div v-else-if="defaultError" class="empty"><div class="et">{{ t.loadFail }}</div></div>
          <AnimeCard v-else v-for="a in defaultList" :key="a.id" :anime="a" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="grid">
        <template v-if="searchLoading">
          <div v-for="i in 24" :key="i" class="sk">
            <div class="sh sk-cv" /><div class="sh sk-ln" style="width:82%" /><div class="sh sk-ln" style="width:50%" />
          </div>
        </template>
        <div v-else-if="searchError" class="empty">
          <div class="ei">😵</div><div class="et">{{ t.searchFail }}</div>
        </div>
        <div v-else-if="!resultList.length" class="empty">
          <div class="ei">🔍</div>
          <div class="et">{{ t.noResult1 }}{{ keyword }}{{ t.noResult2 }}</div>
          <div class="es">{{ t.tryOther }}</div>
        </div>
        <AnimeCard v-else v-for="a in resultList" :key="a.id" :anime="a" />
      </div>
      <Pager :current="curPage" :pages="totalPages" @change="onPageChange" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { animeApi } from '@/api/anime'
import AnimeCard from '@/components/AnimeCard.vue'
import Pager from '@/components/Pager.vue'
import { useI18nStore } from '@/stores/i18n'

const route  = useRoute()
const router = useRouter()
const i18n   = useI18nStore()
const t      = computed(() => i18n.t)

const hotTags = ['進擊的巨人','鬼滅之刃','咒術回戰','海賊王','火影忍者','我的英雄學院','間諜過家家','異世界','魔法少女','鋼彈','名偵探柯南']

const keyword = computed(() => route.query.keyword?.trim() || '')

const defaultList    = ref([])
const defaultLoading = ref(false)
const defaultError   = ref(false)

const resultList    = ref([])
const totalCount    = ref(0)
const totalPages    = ref(1)
const curPage       = ref(1)
const searchLoading = ref(false)
const searchError   = ref(false)

const countText = computed(() =>
  totalCount.value > 0 ? `${t.value.foundTotal} ${totalCount.value} ${t.value.foundUnit}` : ''
)

async function loadDefault() {
  defaultLoading.value = true; defaultError.value = false
  try { const res = await animeApi.getLatest(1, 24); defaultList.value = res.data?.records || [] }
  catch { defaultError.value = true }
  finally { defaultLoading.value = false }
}

async function doSearch(page = 1) {
  curPage.value = page; searchLoading.value = true; searchError.value = false
  try {
    const res = await animeApi.search(keyword.value, page, 24)
    resultList.value = res.data?.records || []
    totalCount.value = res.data?.total   || 0
    totalPages.value = res.data?.pages   || 1
  } catch { searchError.value = true }
  finally { searchLoading.value = false }
}

function quickSearch(word) { router.push({ path: '/search', query: { keyword: word } }) }
function onPageChange(page) { router.push({ path: '/search', query: { keyword: keyword.value, page } }) }

watch(
  () => [route.query.keyword, route.query.page],
  () => {
    if (keyword.value) doSearch(parseInt(route.query.page) || 1)
    else loadDefault()
  },
  { immediate: true }
)
</script>
