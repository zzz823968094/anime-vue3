<template>
  <div class="download-page">
    <div class="hero">
      <div class="hero-icon">📱</div>
      <h1 class="hero-title">动漫天堂 App</h1>
      <p class="hero-sub">随时随地，畅享番剧</p>
    </div>

    <div class="cards">
      <!-- Android -->
      <div class="card">
        <div class="card-header">
          <span class="platform-icon android-icon">🤖</span>
          <div>
            <div class="platform-name">Android</div>
            <div v-if="android" class="version-info">
              v{{ android.versionName }}
              <span v-if="android.fileSize" class="file-size">· {{ formatSize(android.fileSize) }}</span>
            </div>
            <div v-else-if="loadingAndroid" class="version-info">加载中...</div>
            <div v-else class="version-info muted">暂无版本</div>
          </div>
        </div>
        <div v-if="android" class="release-notes">{{ android.releaseNotes }}</div>
        <a
          v-if="android"
          :href="android.downloadUrl"
          class="download-btn android-btn"
          target="_blank"
          rel="noopener"
        >
          下载 APK
        </a>
        <button v-else class="download-btn disabled-btn" disabled>暂无下载</button>
      </div>

      <!-- iOS -->
      <div class="card">
        <div class="card-header">
          <span class="platform-icon ios-icon">🍎</span>
          <div>
            <div class="platform-name">iOS</div>
            <div v-if="ios" class="version-info">
              v{{ ios.versionName }}
              <span v-if="ios.fileSize" class="file-size">· {{ formatSize(ios.fileSize) }}</span>
            </div>
            <div v-else-if="loadingIos" class="version-info">加载中...</div>
            <div v-else class="version-info muted">暂无版本</div>
          </div>
        </div>
        <div v-if="ios" class="release-notes">{{ ios.releaseNotes }}</div>
        <a
          v-if="ios"
          :href="ios.downloadUrl"
          class="download-btn ios-btn"
          target="_blank"
          rel="noopener"
        >
          前往 App Store
        </a>
        <button v-else class="download-btn disabled-btn" disabled>即将上线</button>
      </div>
    </div>

    <p class="tip">如遇安装问题，请在系统设置中允许「未知来源」应用安装</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { appVersionApi } from '@/api/anime.js'

const android = ref(null)
const ios = ref(null)
const loadingAndroid = ref(true)
const loadingIos = ref(true)

async function fetchVersions() {
  const [aRes, iRes] = await Promise.allSettled([
    appVersionApi.getLatest('android'),
    appVersionApi.getLatest('ios'),
  ])
  loadingAndroid.value = false
  loadingIos.value = false
  if (aRes.status === 'fulfilled' && aRes.value?.code === 200) android.value = aRes.value.data
  if (iRes.status === 'fulfilled' && iRes.value?.code === 200) ios.value = iRes.value.data
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

onMounted(fetchVersions)
</script>

<style scoped>
.download-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 40px;
  background: var(--bg, #0f0f1a);
  color: var(--text, #e2e8f0);
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.hero-icon { font-size: 56px; margin-bottom: 16px; }
.hero-title { font-size: 32px; font-weight: 800; margin: 0 0 8px; color: #fff; }
.hero-sub { font-size: 16px; color: #94a3b8; margin: 0; }

.cards {
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 720px;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  flex: 1;
  min-width: 280px;
  max-width: 340px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.platform-icon { font-size: 40px; }
.platform-name { font-size: 20px; font-weight: 700; color: #fff; }
.version-info { font-size: 13px; color: #94a3b8; margin-top: 4px; }
.file-size { color: #64748b; }
.muted { color: #475569; }

.release-notes {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
  white-space: pre-wrap;
  flex: 1;
}

.download-btn {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.download-btn:hover { opacity: 0.85; }

.android-btn { background: linear-gradient(135deg, #3ddc84, #00b85c); color: #fff; }
.ios-btn { background: linear-gradient(135deg, #60a5fa, #2563eb); color: #fff; }
.disabled-btn { background: rgba(255,255,255,0.08); color: #475569; cursor: not-allowed; }

.tip {
  margin-top: 32px;
  font-size: 13px;
  color: #475569;
  text-align: center;
}

@media (max-width: 768px) {
  .download-page {
    padding: 40px 16px 32px;
  }
  
  .hero-icon {
    font-size: 48px;
  }
  
  .hero-title {
    font-size: 26px;
  }
  
  .hero-sub {
    font-size: 14px;
  }
  
  .cards {
    flex-direction: column;
    gap: 16px;
  }
  
  .card {
    min-width: auto;
    max-width: none;
    padding: 24px 20px;
  }
  
  .platform-icon {
    font-size: 36px;
  }
  
  .platform-name {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .download-page {
    padding: 32px 12px 24px;
  }
  
  .hero-icon {
    font-size: 40px;
  }
  
  .hero-title {
    font-size: 22px;
  }
  
  .hero-sub {
    font-size: 13px;
  }
  
  .card {
    padding: 20px 16px;
  }
  
  .platform-icon {
    font-size: 32px;
  }
  
  .platform-name {
    font-size: 16px;
  }
  
  .release-notes {
    font-size: 12px;
  }
  
  .download-btn {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
