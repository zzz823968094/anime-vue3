<template>
  <div class="gcard" @click="goDetail">
    <div class="cv">
      <img v-if="anime.vodPic && !imgError" :src="anime.vodPic" loading="lazy" @error="imgError = true" />
      <div v-else class="nc">📺</div>
      <div class="ov" />
      <div class="pi">▶</div>
      <div v-if="anime.vodScore > 0" class="score">★ {{ anime.vodScore }}</div>
      <span class="ep">{{ t.epLabel }}{{ anime.vodTotal }}{{ t.epSuffix }}</span>
    </div>
    <div class="ct" :title="anime.vodName">{{ anime.vodName }}</div>
    <div class="cs">{{ typeLabel }}</div>
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

const TYPE_MAP = computed(() => ({ '67': t.value.japan, '68': t.value.us, '66': t.value.china }))

const typeLabel   = computed(() => TYPE_MAP.value[props.anime.typeId] || '')

function goDetail() { router.push(`/detail/${props.anime.id}`) }
</script>
<style scoped>
.gcard {
  width: 100%;
}
</style>