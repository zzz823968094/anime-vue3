<template>
  <div class="gcard" @click="goDetail">
    <div class="cv">
      <img v-if="anime.coverImage && !imgError" :src="anime.coverImage" loading="lazy" @error="imgError = true" />
      <div v-else class="nc">🎌</div>
      <div class="ov" />
      <div class="pi">▶</div>
      <div v-if="anime.rating > 0" class="score">★ {{ anime.rating }}</div>
      <span class="ep">{{ t.epLabel }}{{ anime.currentEpisode }}{{ t.epSuffix }}</span>
    </div>
    <div class="ct" :title="anime.title">{{ anime.title }}</div>
    <div class="cs">{{ typeLabel }}{{ statusLabel }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'

const props   = defineProps({ anime: { type: Object, required: true } })
const router  = useRouter()
const i18n    = useI18nStore()
const t       = computed(() => i18n.t)
const imgError = ref(false)

const TYPE_MAP = computed(() => ({ '25': t.value.japan, '26': t.value.us, '24': t.value.china }))

const typeLabel   = computed(() => TYPE_MAP.value[props.anime.type] || '')
const statusLabel = computed(() => props.anime.status === 1 ? ` · ${t.value.serializing2}` : ` · ${t.value.finished2}`)

function goDetail() { router.push(`/detail/${props.anime.id}`) }
</script>
<style scoped>
.gcard {
  width: 100%;
}
</style>