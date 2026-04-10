<template>
  <div v-if="pages > 1" class="pager">
    <button class="pg-btn" :disabled="current <= 1" @click="emit('change', current - 1)">‹</button>
    <template v-for="item in pageItems" :key="item">
      <span v-if="item === '...'" class="pg-info">…</span>
      <button v-else class="pg-btn" :class="{ on: item === current }" @click="emit('change', item)">{{ item }}</button>
    </template>
    <button class="pg-btn" :disabled="current >= pages" @click="emit('change', current + 1)">›</button>
    <span class="pg-info">{{ current }} / {{ pages }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ current: { type: Number, required: true }, pages: { type: Number, required: true } })
const emit = defineEmits(['change'])
const pageItems = computed(() => {
  const { current: cur, pages } = props
  const items = []
  const start = Math.max(1, cur - 2)
  const end   = Math.min(pages, cur + 2)
  if (start > 1) { items.push(1); if (start > 2) items.push('...') }
  for (let i = start; i <= end; i++) items.push(i)
  if (end < pages) { if (end < pages - 1) items.push('...'); items.push(pages) }
  return items
})
</script>
