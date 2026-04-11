<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-wrap">
      <div class="loading-bg1" />
      <div class="loading-bg2" />

      <img src="@/assets/logo.png" alt="logo" class="loading-img" />

      <div class="loading-title">動漫<span>天堂</span></div>
      <div class="loading-sub">海量動漫資源，流暢線上觀看</div>

      <div class="loading-bar-wrap">
        <div class="loading-bar" :style="{ width: pct + '%' }" />
      </div>
      <div class="loading-pct">{{ pct < 100 ? `載入中… ${pct}%` : '載入完成！' }}</div>

      <div class="loading-dots">
        <div v-for="i in 3" :key="i" class="loading-dot" :class="{ on: dotIdx === i - 1 }" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(true)
const pct     = ref(0)
const dotIdx  = ref(0)

onMounted(() => {
  const bar = setInterval(() => {
    pct.value += Math.floor(Math.random() * 8 + 1)
    if (pct.value >= 100) {
      pct.value = 100
      clearInterval(bar)
      setTimeout(() => { visible.value = false }, 600)
    }
  }, 60)

  setInterval(() => {
    dotIdx.value = (dotIdx.value + 1) % 3
  }, 400)
})
</script>

<style scoped>
.loading-wrap {
  position: fixed; inset: 0; z-index: 9999;
  background: #08080f;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 20px;
  overflow: hidden;
}
.loading-bg1 {
  position: absolute; top: -80px; left: -80px;
  width: 400px; height: 400px; border-radius: 50%;
  background: rgba(124,92,252,0.08); pointer-events: none;
}
.loading-bg2 {
  position: absolute; bottom: -100px; right: -100px;
  width: 480px; height: 480px; border-radius: 50%;
  background: rgba(196,113,237,0.06); pointer-events: none;
}
.loading-img {
  width: 160px; height: 160px; object-fit: contain;
  filter: drop-shadow(0 0 24px rgba(196,113,237,0.4));
  position: relative; z-index: 1;
}
.loading-title {
  font-size: 32px; font-weight: 800; color: #fff;
  font-family: 'Noto Sans TC', sans-serif;
  position: relative; z-index: 1;
}
.loading-title span {
  background: linear-gradient(135deg, #7c5cfc, #c471ed);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.loading-sub {
  font-size: 13px; color: rgba(255,255,255,0.35);
  font-family: 'Noto Sans TC', sans-serif;
  position: relative; z-index: 1;
}
.loading-bar-wrap {
  width: 220px; height: 3px;
  background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;
  position: relative; z-index: 1;
}
.loading-bar {
  height: 100%;
  background: linear-gradient(90deg, #7c5cfc, #c471ed);
  border-radius: 2px; transition: width 0.1s linear;
}
.loading-pct {
  font-size: 12px; color: rgba(255,255,255,0.35);
  font-family: sans-serif; position: relative; z-index: 1;
}
.loading-dots {
  display: flex; gap: 8px; position: relative; z-index: 1;
}
.loading-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #7c5cfc; opacity: 0.3; transition: opacity 0.3s;
}
.loading-dot.on { opacity: 1; background: #c471ed; }

.fade-leave-active { transition: opacity 0.5s ease; }
.fade-leave-to { opacity: 0; }
</style>