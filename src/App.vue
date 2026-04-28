<template>
  <LoadingScreen />
  <div class="app-wrapper">
    <NavBar v-if="route.name !== 'Player'" />
    <RouterView />
    <Footer v-if="route.name !== 'Player'" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
import { useThemeStore } from '@/stores/theme'
import LoadingScreen from '@/components/LoadingScreen.vue'

const route = useRoute()
const theme = useThemeStore()
onMounted(() => theme.applyTheme())
</script>

<style>
/* ══════════════════════════════════════════
   DARK MODE (default)
══════════════════════════════════════════ */
:root, [data-theme="dark"] {
  --bg:      #08080f;
  --bg2:     #0e0e1c;
  --bg3:     #181828;
  --card:    #121220;
  --border:  rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.13);

  --accent:  #7c5cfc;
  --accent2: #c471ed;
  --accent3: #12c2e9;
  --glow:    rgba(124,92,252,0.35);
  --glow2:   rgba(196,113,237,0.25);

  --text:    #eeeeff;
  --sub:     #7878a0;
  --muted:   rgba(255,255,255,0.35);
  --gold:    #fbbf24;
  --green:   #34d399;
  --red:     #f87171;

  --nav-bg:  rgba(8,8,15,0.92);
  --footer-bg: #060610;

  color-scheme: dark;
}

/* ══════════════════════════════════════════
   LIGHT MODE
══════════════════════════════════════════ */
[data-theme="light"] {
  //--bg:      #f4f4fb;
  //--bg2:     #ffffff;
  //--bg3:     #eaeaf6;
  //--card:    #f0f0fa;
  --bg:   #f2f2fa;
  --bg2:  #fafaff;
  --bg3:  #ebebf5;
  --card: #f0f0fb;
  --border:  rgba(0,0,0,0.08);
  --border2: rgba(0,0,0,0.15);

  --accent:  #6c47fb;
  --accent2: #b44de8;
  --accent3: #0ea5e9;
  --glow:    rgba(108,71,251,0.12);
  --glow2:   rgba(180,77,232,0.08);

  --text:    #1a1a2e;
  --sub:     #6060a0;
  --muted:   rgba(0,0,0,0.4);
  --gold:    #d97706;
  --green:   #059669;
  --red:     #dc2626;

  --nav-bg:  rgba(244,244,251,0.94);
  --footer-bg: #e8e8f5;

  /* Hero 和详情页顶部强制保持深色 */
  --hero-bg:   #08080f;
  --hero-text: #eeeeff;

  --hero-overlay-side:   rgba(20,10,40,0.75);
  --hero-overlay-top:    rgba(20,10,40,0.15);
  --hero-overlay-mid:    rgba(20,10,40,0.80);
  --hero-overlay-bottom: rgba(242,242,250,1);


  color-scheme: light;
}

/* 加在这里 */
.detail-hero {
  --bg:    #08080f;
  --text:  #eeeeff;
  --sub:   #8888aa;
  --muted: rgba(255,255,255,0.4);
}
/* 新增在这里 */
[data-theme="light"] .nav {
  border-bottom: 1px solid rgba(108,71,251,0.15);
  background: linear-gradient(to bottom, #fafaff, #f4f4fb);
}

[data-theme="light"] .site-footer {
  background: linear-gradient(to bottom, #ebebf5, #e4e4f0);
}

/* ══════════════════════════════════════════
   RESET & BASE
══════════════════════════════════════════ */
* { margin: 0; padding: 0; box-sizing: border-box; }

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: env(safe-area-inset-top);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Noto Sans TC', 'Noto Sans SC', 'Segoe UI', system-ui, sans-serif;
  min-height: 100vh;
  transition: background 0.25s, color 0.25s;
}

/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
.nav {
  position: sticky; top: 0; z-index: 500;
  height: 64px; padding: 0 28px;
  background: var(--nav-bg);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 24px;
  padding-top: env(safe-area-inset-top);
  height: calc(64px + env(safe-area-inset-top));
}
.nav-logo {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none; font-size: 17px; font-weight: 800;
  color: var(--text); flex-shrink: 0; letter-spacing: -0.3px;
}
.nav-logo-icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 16px var(--glow);
}
.nav-links { display: flex; gap: 4px; }
.nav-links a {
  color: var(--sub); text-decoration: none;
  font-size: 14px; font-weight: 600; transition: color .18s;
  padding: 6px 12px; border-radius: 8px; transition: all .18s;
}
.nav-links a:hover { color: var(--text); background: var(--bg3); }
.nav-links a.router-link-active { color: var(--accent2); background: rgba(124,92,252,0.1); }

.nav-search {
  flex: 1; max-width: 440px;
  display: flex; align-items: center;
  background: var(--bg3); border: 1.5px solid var(--border);
  border-radius: 26px; padding: 7px 16px; gap: 8px;
  transition: border-color .2s, box-shadow .2s;
}
.nav-search:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--glow);
}
.nav-search input {
  background: none; border: none; outline: none;
  color: var(--text); font-size: 14px; width: 100%; font-family: inherit;
}
.nav-search input::placeholder { color: var(--sub); }
.nav-search button {
  background: none; border: none; color: var(--sub);
  cursor: pointer; font-size: 15px; transition: color .18s; flex-shrink: 0;
}
.nav-search button:hover { color: var(--accent); }
.nav-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.nav-btn {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff; border: none; padding: 7px 18px; border-radius: 18px;
  cursor: pointer; font-size: 13px; font-weight: 700; font-family: inherit;
  box-shadow: 0 2px 12px var(--glow); transition: opacity .18s, transform .15s, box-shadow .18s;
  text-decoration: none; display: inline-flex; align-items: center; white-space: nowrap;
}
.nav-btn:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 4px 20px var(--glow); }
.u-wrap { position: relative; }
.u-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; cursor: pointer; border: 2px solid transparent;
  transition: border-color .18s, box-shadow .18s; user-select: none;
}
.u-avatar.on, .u-avatar:hover { border-color: var(--accent); box-shadow: 0 0 12px var(--glow); }
.u-drop {
  position: absolute; top: calc(100% + 10px); right: 0;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: 14px; padding: 6px; min-width: 160px;
  opacity: 0; pointer-events: none; transform: translateY(-6px) scale(0.97);
  transition: opacity .18s, transform .18s;
  box-shadow: 0 16px 48px rgba(0,0,0,.35); z-index: 600;
}
.u-drop.on { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
.u-drop a, .u-drop button {
  display: flex; align-items: center; gap: 9px; width: 100%;
  padding: 9px 12px; color: var(--text); text-decoration: none;
  font-size: 13px; background: none; border: none; cursor: pointer;
  font-family: inherit; border-radius: 9px; transition: background .13s; text-align: left;
}
.u-drop a:hover, .u-drop button:hover { background: var(--bg3); color: var(--accent2); }

/* ══════════════════════════════════════════
   MAIN CONTAINER
══════════════════════════════════════════ */
.main { max-width: 1400px; margin: 0 auto; padding: 32px 28px 60px; width: 100%; }

/* ══════════════════════════════════════════
   SEARCH HEAD
══════════════════════════════════════════ */
.search-head { margin-bottom: 24px; }
.search-head h2 { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.search-head h2 em { color: var(--accent2); font-style: normal; }
.search-count { font-size: 13px; color: var(--sub); }

/* ══════════════════════════════════════════
   SECTION
══════════════════════════════════════════ */
.sec { margin-bottom: 44px; }
.sec-head {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 18px;
}
.sec-title {
  font-size: 15px; font-weight: 800; color: var(--text);
  display: flex; align-items: center; gap: 9px;
}
.sec-title::before {
  content: ''; width: 4px; height: 16px;
  background: linear-gradient(to bottom, var(--accent), var(--accent2));
  border-radius: 2px; display: block;
}
.sec-more {
  font-size: 13px; color: var(--sub); text-decoration: none; transition: color .18s;
  padding: 4px 10px; border-radius: 8px; border: 1px solid var(--border);
}
.sec-more:hover { color: var(--accent2); border-color: var(--accent); background: rgba(124,92,252,0.08); }

/* ══════════════════════════════════════════
   HOT TAGS
══════════════════════════════════════════ */
.hot-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.hot-tag {
  background: var(--bg3); border: 1.5px solid var(--border);
  color: var(--sub); padding: 6px 16px; border-radius: 20px;
  cursor: pointer; font-size: 13px; font-family: inherit;
  transition: all .18s;
}
.hot-tag:hover {
  border-color: var(--accent); color: var(--accent2);
  background: rgba(124,92,252,0.1);
  box-shadow: 0 0 12px var(--glow);
}

/* ══════════════════════════════════════════
   CARD GRID
══════════════════════════════════════════ */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(152px, 1fr));
  gap: 16px;
}
.gcard { cursor: pointer; transition: transform .22s; }
.gcard:hover { transform: translateY(-5px); }
.gcard .cv {
  width: 100%; aspect-ratio: 3/4; border-radius: 10px;
  overflow: hidden; position: relative;
  background: var(--card); margin-bottom: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.gcard:hover .cv { box-shadow: 0 8px 28px rgba(0,0,0,0.35); }
.gcard .cv img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.gcard:hover .cv img { transform: scale(1.07); }
.gcard .cv .nc {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; background: linear-gradient(135deg, #13132e, #1d1050);
}
.gcard .cv .ov {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, transparent 60%);
  opacity: 0; transition: opacity .22s;
}
.gcard:hover .cv .ov { opacity: 1; }
.gcard .cv .pi {
  position: absolute; bottom: 10px; left: 50%;
  transform: translateX(-50%) translateY(6px);
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: #fff;
  opacity: 0; transition: opacity .22s, transform .22s;
  box-shadow: 0 4px 16px var(--glow);
}
.gcard:hover .cv .pi { opacity: 1; transform: translateX(-50%) translateY(0); }
.gcard .cv .score {
  position: absolute; top: 7px; left: 7px;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  color: var(--gold); font-size: 11px; font-weight: 700;
  padding: 2px 7px; border-radius: 6px;
}
.ep {
  position: absolute; top: 7px; right: 7px;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  color: rgba(255,255,255,.9); font-size: 10px; font-weight: 600;
  padding: 2px 7px; border-radius: 6px;
}
.gcard .ct {
  font-size: 13px; color: var(--text); font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.gcard .cs { font-size: 11px; color: var(--sub); margin-top: 3px; }

/* ══════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════ */
.empty {
  grid-column: 1 / -1; padding: 80px 20px;
  text-align: center; color: var(--sub);
}
.empty .ei { font-size: 52px; margin-bottom: 14px; }
.empty .et { font-size: 16px; color: var(--text); margin-bottom: 6px; font-weight: 600; }
.empty .es { font-size: 13px; }

/* ══════════════════════════════════════════
   PAGER
══════════════════════════════════════════ */
.pager {
  display: flex; justify-content: center;
  align-items: center; gap: 6px; margin-top: 36px;
}
.pg-btn {
  background: var(--bg3); border: 1.5px solid var(--border);
  color: var(--sub); padding: 7px 14px; border-radius: 9px;
  cursor: pointer; font-size: 13px; font-family: inherit; transition: all .18s;
}
.pg-btn:hover { border-color: var(--accent); color: var(--text); background: rgba(124,92,252,0.08); }
.pg-btn.on {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-color: transparent; color: #fff; font-weight: 700;
  box-shadow: 0 2px 10px var(--glow);
}
.pg-btn:disabled { opacity: .3; cursor: not-allowed; }
.pg-info { font-size: 12px; color: var(--sub); padding: 0 8px; }

/* ══════════════════════════════════════════
   SKELETON
══════════════════════════════════════════ */
@keyframes sh {
  0%   { background-position: 200% 0 }
  100% { background-position: -200% 0 }
}
.sh {
  background: linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%);
  background-size: 200% 100%; animation: sh 1.5s infinite;
}
.sk .sk-cv  { width: 100%; aspect-ratio: 3/4; border-radius: 10px; margin-bottom: 8px; }
.sk .sk-ln  { height: 12px; border-radius: 5px; margin-bottom: 5px; }

/* ══════════════════════════════════════════
   GLOBAL RESPONSIVE STYLES
══════════════════════════════════════════ */
@media (max-width: 768px) {
  .main {
    padding: 20px 12px 40px;
  }
  
  .sec {
    margin-bottom: 32px;
  }
  
  .sec-title {
    font-size: 14px;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .main {
    padding: 16px 10px 32px;
  }
  
  .sec {
    margin-bottom: 24px;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
}
</style>

<style>
/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
.hero{position:relative;width:100%;height:370px;overflow:hidden;}
.hero-bg{position:absolute;inset:-24px;background-size:cover;background-position:center 20%;filter:blur(36px) brightness(.32) saturate(1.8);transition:background-image .6s;}
.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to right,var(--hero-overlay-side, rgba(4,4,12,.7)) 0%,transparent 55%),linear-gradient(to bottom,var(--hero-overlay-top, rgba(4,4,12,.1)) 0%,var(--hero-overlay-mid, rgba(4,4,12,.72)) 70%,var(--hero-overlay-bottom, var(--bg)) 100%);}
.hero-content{position:relative;z-index:2;height:100%;max-width:1400px;margin:0 auto;padding:0 36px;display:flex;align-items:center;gap:28px;}
//.hero-slide-area{flex:1;min-width:0;position:relative;height:285px;}
.hero-slide-area{flex:1;min-width:0;position:relative;height:320px;}
.hero-skel{position:absolute;inset:0;display:flex;align-items:center;gap:32px;}
.hero-slide{position:absolute;inset:0;display:flex;align-items:center;gap:32px;opacity:0;pointer-events:none;transition:opacity .5s;}
.hero-slide.on{opacity:1;pointer-events:auto;}
.hero-cover{flex-shrink:0;width:170px;height:240px;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.07),0 0 50px rgba(124,92,252,.2);background:var(--bg3);transform:perspective(600px) rotateY(4deg);transition:transform .3s;}
.hero-cover:hover{transform:perspective(600px) rotateY(0deg) scale(1.02);}
.hero-cover img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
.hero-cover .nc{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:44px;background:linear-gradient(135deg,#141430,#1e1050);}
.hero-info{flex:1;min-width:0;}
.hero-label{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,rgba(124,92,252,.25),rgba(196,113,237,.2));border:1px solid rgba(124,92,252,.45);color:#d9a4ff;font-size:10px;font-weight:800;letter-spacing:2px;padding:4px 14px;border-radius:20px;margin-bottom:14px;text-transform:uppercase;}
.hero-title{font-size:30px;font-weight:900;color:#fff;line-height:1.18;margin-bottom:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 24px rgba(0,0,0,.8);letter-spacing:-.5px;}
.hero-tags{display:flex;gap:7px;margin-bottom:14px;flex-wrap:wrap;}
.hero-tag{font-size:11px;padding:3px 11px;border-radius:20px;font-weight:700;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.65);}
.hero-tag.gold{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.35);color:#fbbf24;}
.hero-tag.green{background:rgba(52,211,153,.12);border-color:rgba(52,211,153,.35);color:#34d399;}
.hero-tag.purple{background:rgba(124,92,252,.15);border-color:rgba(124,92,252,.4);color:#c4a4ff;}
.hero-desc{font-size:13px;color:rgba(255,255,255,.42);line-height:1.8;margin-bottom:24px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:500px;}
.hero-btns{display:flex;gap:11px;align-items:center;}

.btn-watch{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;padding:11px 26px;border-radius:24px;cursor:pointer;font-size:14px;font-weight:800;font-family:inherit;display:flex;align-items:center;gap:7px;text-decoration:none;box-shadow:0 4px 22px var(--glow);transition:transform .18s,box-shadow .18s;}
.btn-watch:hover{transform:translateY(-2px);box-shadow:0 8px 32px var(--glow);}
.btn-detail{background:rgba(255,255,255,.09);color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.14);padding:11px 22px;border-radius:24px;cursor:pointer;font-size:13px;font-family:inherit;text-decoration:none;transition:all .18s;font-weight:600;}
.btn-detail:hover{background:rgba(255,255,255,.16);color:#fff;}
/*.hero-dots{position:absolute;bottom:-26px;left:0;display:flex;gap:6px;align-items:center;}
.hero-dot{width:6px;height:6px;border-radius:3px;background:rgba(255,255,255,.22);transition:width .3s,background .3s;cursor:pointer;}
.hero-dot.on{width:22px;background:var(--accent);}*/


/*.hero-thumbs{flex-shrink:0;display:flex;flex-direction:column;gap:10px;align-self:center;}
.hero-thumb{width:60px;height:84px;border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid transparent;opacity:.28;transition:opacity .25s,border-color .25s,box-shadow .25s;background:var(--bg3);}
.hero-thumb img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
.hero-thumb.on{border-color:var(--accent);opacity:1;box-shadow:0 0 18px var(--glow);}
.hero-thumb:not(.on):hover{opacity:.65;}*/


/*.hero-thumbs{position:absolute;bottom:16px;right:0;display:flex;gap:8px;justify-content:flex-end;padding:0;}
.hero-thumb{flex-shrink:0;width:120px;height:76px;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;opacity:.55;transition:opacity .25s,border-color .25s,transform .25s;background:var(--bg3);position:relative;}*/
.hero-thumbs{position:absolute;top:50%;right:0;transform:translateY(-50%);display:flex;gap:8px;justify-content:flex-end;padding:0;}
.hero-thumb{flex-shrink:0;width:100px;height:140px;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;opacity:.55;transition:opacity .25s,border-color .25s,transform .25s;background:var(--bg3);position:relative;}
.hero-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.hero-thumb-overlay{position:absolute;inset:0;background:rgba(0,0,0,.25);transition:opacity .25s;}
.hero-thumb:hover{opacity:.85;transform:translateY(-3px);}
.hero-thumb:hover .hero-thumb-overlay{opacity:0;}
.hero-thumb.on{border-color:var(--accent);opacity:1;transform:translateY(-4px);box-shadow:0 0 16px var(--glow);}
.hero-thumb.on .hero-thumb-overlay{opacity:0;}

/* ══════════════════════════════════════════
   TABS BAR
══════════════════════════════════════════ */
.tabs-bar{background:var(--nav-bg);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);position:sticky;top:calc(58px + env(safe-area-inset-top));z-index:400;}
.tabs-inner{max-width:1400px;margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:2px;}
.tab{padding:0 18px;height:48px;display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--sub);border:none;background:none;cursor:pointer;font-family:inherit;border-radius:10px;margin:5px 0;transition:color .18s,background .18s;position:relative;white-space:nowrap;}
.tab:hover{color:var(--text);background:var(--bg3);}
.tab.on{color:var(--accent2);background:rgba(124,92,252,0.12);}
.tab-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);display:none;}
.tab.on .tab-dot{display:block;}

/* ══════════════════════════════════════════
   HOT STRIP
══════════════════════════════════════════ */
.hstrip{display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;}
.hstrip::-webkit-scrollbar{display:none;}
.hcard{flex-shrink:0;width:132px;cursor:pointer;transition:transform .22s;}
.hcard:hover{transform:translateY(-5px);}
.hcard .cv{width:132px;height:186px;border-radius:11px;overflow:hidden;position:relative;background:var(--card);margin-bottom:8px;box-shadow:0 4px 18px rgba(0,0,0,.3);transition:box-shadow .22s;}
.hcard:hover .cv{box-shadow:0 14px 36px rgba(0,0,0,.5),0 0 24px rgba(124,92,252,.15);}
.hcard .cv img{width:100%;height:100%;object-fit:cover;transition:transform .3s;}
.hcard:hover .cv img{transform:scale(1.09);}
.hcard .cv .ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78) 0%,transparent 58%);opacity:0;transition:opacity .22s;}
.hcard:hover .cv .ov{opacity:1;}
.hcard .cv .pi{position:absolute;bottom:11px;left:50%;transform:translateX(-50%) translateY(7px);width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;opacity:0;transition:opacity .22s,transform .22s;box-shadow:0 4px 14px var(--glow);}
.hcard:hover .cv .pi{opacity:1;transform:translateX(-50%) translateY(0);}
.hcard .ct{font-size:12px;color:var(--text);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hcard .cs{font-size:11px;color:var(--sub);margin-top:3px;}

/* status badges */
.status-badge{position:absolute;bottom:7px;left:7px;font-size:9px;font-weight:800;padding:2px 7px;border-radius:5px;opacity:0;transition:opacity .22s;}
.gcard:hover .status-badge{opacity:1;}
.status-on{background:rgba(52,211,153,.2);color:var(--green);border:1px solid rgba(52,211,153,.4);}
.status-end{background:rgba(96,165,250,.2);color:#60a5fa;border:1px solid rgba(96,165,250,.4);}

/* load more */
.more{text-align:center;margin-top:32px;}
.more button{background:var(--bg3);color:var(--sub);border:1.5px solid var(--border);padding:10px 44px;border-radius:24px;cursor:pointer;font-size:13px;font-family:inherit;transition:all .2s;font-weight:600;}
.more button:hover{border-color:var(--accent);color:var(--accent2);background:rgba(124,92,252,.1);box-shadow:0 0 16px var(--glow);}

/* ══════════════════════════════════════════
   DETAIL
══════════════════════════════════════════ */
.detail-hero{position:relative;overflow:hidden;padding:44px 0 0;}

.hero-blur{position:absolute;inset:0;background-size:cover;background-position:center top;filter:blur(44px) brightness(.28) saturate(1.4);transform:scale(1.12);}
[data-theme="light"] .hero-blur {
  filter: blur(44px) brightness(0.85) saturate(1.2);
}
[data-theme="light"] .hero-bg {
  filter: blur(36px) brightness(0.85) saturate(1.2);
}
.hero-blur::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 0%,var(--bg) 100%);}
.hero-inner{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:0 32px 38px;display:flex;gap:38px;align-items:flex-start;}
.cover-card{flex-shrink:0;width:192px;}
.cover-card img,.cover-card .nc{width:192px;height:270px;border-radius:14px;object-fit:cover;object-position:center top;display:block;box-shadow:0 14px 48px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.07);}
.cover-card .nc{background:linear-gradient(135deg,#141430,#1e1050);display:flex;align-items:center;justify-content:center;font-size:56px;}
.cover-badge{margin-top:12px;display:flex;flex-direction:column;gap:6px;}
.badge-item{background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--sub);text-align:center;}
.badge-item strong{color:var(--text);font-weight:700;font-size:14px;display:block;}
.info-wrap{flex:1;min-width:0;padding-top:4px;}
.back-link{display:inline-flex;align-items:center;gap:5px;color:var(--sub);text-decoration:none;font-size:13px;margin-bottom:18px;transition:color .18s;font-weight:600;}
.back-link:hover{color:var(--accent2);}
.anime-title{font-size:30px;font-weight:800;color:#fff;line-height:1.25;margin-bottom:7px;}
.anime-orig{font-size:13px;color:rgba(255,255,255,.45);margin-bottom:16px;}
.tag-row{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px;}
.tag{background:rgba(124,92,252,.14);border:1px solid rgba(124,92,252,.3);color:#c4a4ff;padding:3px 11px;border-radius:10px;font-size:11px;font-weight:600;}
.tag.green{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.3);color:var(--green);}
.tag.gray{background:var(--bg3);border-color:var(--border);color:var(--sub);}
.meta-row{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:18px;}
.meta{font-size:13px;color:var(--sub);}
.meta strong{color:var(--text);font-weight:600;}
.synopsis{font-size:13.5px;color:var(--muted);line-height:1.85;margin-bottom:8px;transition:max-height .3s;}
.synopsis.collapsed{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.expand-btn{background:none;border:none;color:var(--accent);font-size:13px;cursor:pointer;font-family:inherit;padding:0;margin-bottom:22px;font-weight:600;}
.action-row{display:flex;gap:11px;flex-wrap:wrap;margin-top:4px;}
.btn-play{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;padding:11px 28px;border-radius:22px;cursor:pointer;font-size:14px;font-weight:800;font-family:inherit;display:flex;align-items:center;gap:8px;text-decoration:none;box-shadow:0 4px 18px var(--glow);transition:transform .18s,box-shadow .18s;}
.btn-play:hover{transform:translateY(-2px);box-shadow:0 8px 28px var(--glow);}
.btn-fav{background:var(--bg3);color:var(--sub);border:1.5px solid var(--border);padding:11px 22px;border-radius:22px;cursor:pointer;font-size:14px;font-family:inherit;display:flex;align-items:center;gap:7px;transition:all .18s;font-weight:600;}
.btn-fav:hover{border-color:var(--accent2);color:var(--accent2);background:rgba(124,92,252,.08);}
.btn-fav.faved{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.4);color:var(--gold);}
.ep-wrap{}
.ep-tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
.ep-tab{background:var(--bg3);border:1.5px solid var(--border);color:var(--sub);padding:4px 14px;border-radius:8px;font-size:12px;cursor:pointer;transition:all .15s;font-weight:600;}
.ep-tab:hover{border-color:var(--accent);color:var(--text);}
.ep-tab.on{background:rgba(124,92,252,.15);border-color:var(--accent);color:var(--accent2);}
.ep-page.on{display:flex;flex-wrap:wrap;gap:8px;}
.ep-btn{background:var(--bg3);color:var(--text);border:1.5px solid var(--border);padding:7px 0;border-radius:8px;cursor:pointer;font-size:13px;transition:all .18s;width:74px;text-align:center;font-family:inherit;font-weight:600;}
.ep-btn:hover{background:rgba(124,92,252,.15);border-color:var(--accent);color:var(--accent2);}

/* ══════════════════════════════════════════
   DANMAKU
══════════════════════════════════════════ */
.dm-item{position:absolute;white-space:nowrap;font-size:22px;font-weight:700;text-shadow:1px 1px 3px rgba(0,0,0,.9),-1px -1px 3px rgba(0,0,0,.9);animation:dm-fly linear forwards;pointer-events:none;}
@keyframes dm-fly{from{transform:translateX(0)}to{transform:translateX(calc(-100% - 100vw))}}
@media (max-width: 768px) {
  .hero { display: none; }
  .tabs-bar {
    top: calc(56px + env(safe-area-inset-top)) !important;
  }
  .hero-inner { flex-direction: column; padding: 16px; gap: 20px; }
  .cover-card { width: 100%; display: flex; flex-direction: column; align-items: center; }
  .cover-card img, .cover-card .nc { width: 160px; height: 224px; }
  .info-wrap { width: 100%; padding-top: 0; }
  .anime-title { font-size: 20px; }
  .action-row { flex-wrap: wrap; }
  .btn-play, .btn-fav { width: 100%; justify-content: center; }
  
  .detail-hero {
    padding: 24px 0 0;
  }
  
  .ep-page.on {
    gap: 6px;
  }
  
  .ep-btn {
    width: 65px;
    font-size: 12px;
    padding: 6px 0;
  }
}

@media (max-width: 480px) {
  .cover-card img, .cover-card .nc { 
    width: 140px; 
    height: 196px; 
  }
  
  .anime-title { 
    font-size: 18px; 
  }
  
  .tag {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .meta {
    font-size: 12px;
  }
  
  .synopsis {
    font-size: 12px;
  }
  
  .ep-btn {
    width: 60px;
    font-size: 11px;
  }
}
</style>
