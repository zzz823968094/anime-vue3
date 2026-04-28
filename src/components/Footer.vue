<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-notice">{{ t.footerNotice }}</p>
      <div class="footer-links">
        <span class="footer-copy">© {{ year }} Anime Paradise All rights reserved.</span>
        <div class="footer-nav">
<!--          <a href="https://t.me/" target="_blank" rel="noopener">{{ t.telegramGroup }}</a>-->
<!--          <a href="mailto:contact@gAnime Paradise">{{ t.contactEmail }}</a>-->
<!--          <RouterLink to="/search">{{ t.siteMap }}</RouterLink>-->
<!--          <a href="#" @click.prevent>{{ t.feedback }}</a>-->
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18nStore } from '@/stores/i18n'
const i18n = useI18nStore()
const t    = computed(() => i18n.t)
const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  background: var(--footer-bg);
  border-top: 1px solid var(--border);
  padding: 28px 0 22px;
  margin-top: auto;
  transition: background 0.25s;
}
.footer-inner { max-width: 1400px; margin: 0 auto; padding: 0 28px; }
.footer-notice {
  font-size: 12px; color: var(--sub); line-height: 1.88;
  text-align: center; margin-bottom: 18px; opacity: 0.75;
}
.footer-links {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 10px;
}
.footer-copy { font-size: 12px; color: var(--sub); opacity: 0.6; font-weight: 500; }
.footer-nav { display: flex; gap: 22px; }
.footer-nav a {
  font-size: 12px; color: var(--sub); text-decoration: none;
  transition: color 0.18s; font-weight: 600; opacity: 0.8;
}
.footer-nav a:hover { color: var(--accent2); opacity: 1; }

@media (max-width: 768px) {
  .site-footer {
    padding: 20px 0 16px;
  }
  
  .footer-inner {
    padding: 0 16px;
  }
  
  .footer-notice {
    font-size: 11px;
    margin-bottom: 14px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 8px;
  }
  
  .footer-copy {
    font-size: 11px;
  }
  
  .footer-nav {
    gap: 16px;
  }
  
  .footer-nav a {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .footer-inner {
    padding: 0 12px;
  }
  
  .footer-notice {
    font-size: 10px;
  }
  
  .footer-copy {
    font-size: 10px;
  }
  
  .footer-nav a {
    font-size: 10px;
  }
}
</style>
