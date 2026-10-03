/* =============================================================================
   port-droid — main.js
   Código compartilhado entre as páginas: injeção do header/footer,
   navigation bar inferior (estilo aplicativo), splash screen, pill de
   instalação PWA, camada de dados (games.json + cache) e animações.
   ============================================================================= */
"use strict";

/* ------------------------------------------------------------- Utilidades */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

const SITE = {
  name: "port-droid",
  youtube: "https://www.youtube.com/@Hail-Games1",
  telegram: "https://t.me/hailgames2",
  github: "https://github.com/deivid22srk/port-droid",
};

/* Icones SVG inline (estilo feather — stroke currentColor) */
const I = (paths, fill = false) =>
  `<svg class="ico" viewBox="0 0 24 24" ${fill ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${paths}</svg>`;

const ICONS = {
  search: I('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  home: I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>'),
  menu: I('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),
  close: I('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  download: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
  external: I('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
  arrow: I('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
  play: I('<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>'),
  cpu: I('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'),
  pad: I('<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="6"/>'),
  info: I('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
  alert: I('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  layers: I('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
  target: I('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  compass: I('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'),
  stairs: I('<path d="M4 20h4v-4h4v-4h4V8h4V4"/>'),
  flag: I('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
  ball: I('<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>'),
  sword: I('<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/>'),
  box: I('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
  users: I('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  zap: I('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
  shield: I('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  message: I('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
  heart: I('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>', true),
  youtube: I('<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>'),
  telegram: I('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
  github: I('<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>'),
};

/* Registro de categorias (ids usados no games.json) */
const CATEGORIES = [
  { id: "plataforma", label: "Plataforma", icon: "stairs" },
  { id: "acao", label: "Ação", icon: "target" },
  { id: "aventura", label: "Aventura", icon: "compass" },
  { id: "esporte", label: "Esporte", icon: "ball" },
  { id: "corrida", label: "Corrida", icon: "flag" },
  { id: "rpg", label: "RPG", icon: "sword" },
  { id: "luta", label: "Luta", icon: "zap" },
  { id: "emulacao", label: "Emulação", icon: "cpu" },
  { id: "outros", label: "Outros", icon: "box" },
];

const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || { label: id }).label;
const catIcon = (id) => (CATEGORIES.find((c) => c.id === id) || { icon: "box" }).icon;

const PERF_LABEL = { leve: "Leve", medio: "Médio", pesado: "Pesado" };

/* --------------------------------------------------------------- Helpers */
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

const fmtNum = (n) => new Intl.NumberFormat("pt-BR").format(n);

const fmtCompact = (n) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

/* ----------------------------------------------------- Camada de dados */
const GAMES_CACHE_KEY = "pd_games_cache_v1";

async function getGames() {
  // Rede primeiro: o catálogo precisa refletir o games.json publicado imediatamente.
  // O cache local (localStorage) fica apenas como fallback para uso offline.
  try {
    const res = await fetch("./data/games.json", { cache: "no-cache" });
    if (res.ok) {
      const data = await res.json();
      const games = data.games || [];
      if (!games.length) throw new Error("games.json vazio");
      try {
        localStorage.setItem(GAMES_CACHE_KEY, JSON.stringify({ t: Date.now(), games }));
      } catch (_) { /* storage cheio/indisponível */ }
      return games;
    }
    throw new Error(`HTTP ${res.status} em data/games.json`);
  } catch (err) {
    // offline ou falha de rede: usa o cache local mais recente que existir
    try {
      const raw = localStorage.getItem(GAMES_CACHE_KEY);
      if (raw) {
        const { games } = JSON.parse(raw);
        if (Array.isArray(games) && games.length) return games;
      }
    } catch (_) { /* cache corrompido */ }
    throw err;
  }
}

/* ------------------------------------------------------------- Templates */
function cardHTML(g) {
  const perf = PERF_LABEL[g.performance] || "";
  return `
  <article class="card reveal">
    <a class="card-link" href="./game.html?id=${encodeURIComponent(g.id)}" aria-label="Ver página do port ${esc(g.title)}">
      <figure class="card-cover">
        <img src="${esc(g.cover)}" alt="Capa do jogo ${esc(g.title)}" width="600" height="800" loading="lazy" decoding="async">
        <span class="badge-status">${esc(g.statusLabel || g.status || "Port")}</span>
      </figure>
      <div class="card-body">
        <h3 class="card-title">${esc(g.title)}</h3>
        <p class="card-sub">${esc(g.port)}</p>
        <div class="card-tags">
          ${(g.chipsets || []).slice(0, 2).map((c) => `<span class="chip">${esc(c)}</span>`).join("")}
          ${perf ? `<span class="chip chip-accent">${esc(perf)}</span>` : ""}
        </div>
        <div class="card-meta">
          <span>${esc(g.apkSize || g.storage || "—")} · v${esc(g.version || "—")}</span>
          ${g.downloads ? `<span class="dl">${ICONS.download}${fmtCompact(g.downloads)}</span>` : ""}
        </div>
      </div>
    </a>
  </article>`;
}

function skeletonCards(n = 8) {
  return Array.from({ length: n }, () => `
  <article class="card skeleton" aria-hidden="true">
    <div class="sk sk-cover"></div>
    <div class="sk sk-line w60"></div>
    <div class="sk sk-line w35"></div>
  </article>`).join("");
}

/* --------------------------------------------------------- Header / Footer */
const NAV = [
  { href: "./index.html", label: "Início", page: "home" },
  { href: "./catalog.html", label: "Catálogo", page: "catalog" },
  { href: "./about.html", label: "Sobre", page: "about" },
  { href: "./legal.html", label: "Aviso legal", page: "legal" },
];

function renderHeader() {
  const host = $("#siteHeader");
  if (!host) return;
  const page = document.body.dataset.page || "";
  const navLinks = NAV.map(
    (n) => `<a href="${n.href}" ${n.page === page ? 'class="active" aria-current="page"' : ""}>${n.label}</a>`
  ).join("");

  host.innerHTML = `
  <div class="container header-inner">
    <a class="brand" href="./index.html" aria-label="port-droid — página inicial">
      <img src="./assets/img/logo.svg" alt="" width="30" height="30">
      <span>port<span class="b2">-droid</span></span>
    </a>
    <nav class="nav" aria-label="Navegação principal">${navLinks}</nav>
    <form class="header-search" action="./catalog.html" method="get" role="search">
      ${ICONS.search}
      <input type="search" name="q" placeholder="Buscar jogos…" aria-label="Buscar jogos no catálogo" autocomplete="off">
    </form>
    <!-- No mobile a busca fica no app bar; no desktop usa o campo de texto -->
    <a class="icon-btn header-search-btn" href="./catalog.html#buscar" aria-label="Buscar jogos">${ICONS.search}</a>
  </div>`;
}

/* ------------------------------------------------- Navigation bar (app) */
/* Abas fixas no rodapé, como em aplicativos nativos. No desktop (≥900px)
   a barra some e volta a navegação superior tradicional. */
const TABS = [
  { id: "home", href: "./index.html", label: "Início", icon: "home" },
  { id: "catalog", href: "./catalog.html", label: "Jogos", icon: "pad" },
  { id: "buscar", href: "./catalog.html#buscar", label: "Buscar", icon: "search" },
  { id: "about", href: "./about.html", label: "Canal", icon: "youtube" },
];

function activeTab() {
  const page = document.body.dataset.page || "";
  if (page === "home") return "home";
  if (page === "about") return "about";
  if (page === "game") return "catalog";
  if (page === "catalog") return location.hash === "#buscar" ? "buscar" : "catalog";
  return "";
}

function renderBottomNav() {
  if ($("#bottomNav")) return;
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.id = "bottomNav";
  nav.setAttribute("aria-label", "Navegação principal");
  const act = activeTab();
  nav.innerHTML = TABS.map(
    (t) => `
    <a href="${t.href}" data-tab="${t.id}" ${t.id === act ? 'class="active" aria-current="page"' : ""}>
      ${ICONS[t.icon]}<span>${t.label}</span>
    </a>`
  ).join("");
  document.body.appendChild(nav);
}

/* mantém a aba ativa correta quando o hash muda (ex.: entrar em #buscar) */
window.addEventListener("hashchange", () => {
  const act = activeTab();
  $$("#bottomNav a").forEach((a) => {
    const on = a.dataset.tab === act;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
});

function renderFooter() {
  const host = $("#siteFooter");
  if (!host) return;
  const year = new Date().getFullYear();
  host.innerHTML = `
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="./index.html">
          <img src="./assets/img/logo.svg" alt="" width="30" height="30">
          <span>port<span class="b2">-droid</span></span>
        </a>
        <p>Vitrine de ports da comunidade organizados pelo canal Hail Games. Nenhum arquivo de jogo é hospedado aqui — todos os downloads apontam para os repositórios oficiais dos desenvolvedores.</p>
        <div class="social-row">
          <a class="icon-btn" href="${SITE.youtube}" target="_blank" rel="noopener noreferrer" aria-label="Canal no YouTube" title="YouTube">${ICONS.youtube}</a>
          <a class="icon-btn" href="${SITE.telegram}" target="_blank" rel="noopener noreferrer" aria-label="Grupo no Telegram" title="Telegram">${ICONS.telegram}</a>
          <a class="icon-btn" href="${SITE.github}" target="_blank" rel="noopener noreferrer" aria-label="Repositório no GitHub" title="GitHub">${ICONS.github}</a>
        </div>
      </div>
      <div class="footer-col">
        <h3>Navegação</h3>
        <ul>
          <li><a href="./index.html">Início</a></li>
          <li><a href="./catalog.html">Catálogo</a></li>
          <li><a href="./about.html">Sobre o canal</a></li>
          <li><a href="./legal.html">Aviso legal</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Links úteis</h3>
        <ul>
          <li><a href="${SITE.youtube}" target="_blank" rel="noopener noreferrer">Canal Hail Games</a></li>
          <li><a href="${SITE.telegram}" target="_blank" rel="noopener noreferrer">Grupo no Telegram</a></li>
          <li><a href="https://github.com/SansNope/UnleashedRecomp-Android" target="_blank" rel="noopener noreferrer">UnleashedRecomp Android</a></li>
          <li><a href="https://github.com/Buku313/Skate3-Mobile" target="_blank" rel="noopener noreferrer">Skate 3 Mobile</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Aviso</h3>
        <p class="footer-note">Site de vitrine sem fins lucrativos. Não temos afiliação com SEGA, EA, Microsoft ou qualquer desenvolvedora. Os ports pertencem aos seus respectivos autores.</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${year} port-droid · Hail Games</span>
      <span>Feito com <span class="heart">♥</span> para a comunidade Android</span>
    </div>
  </div>`;
}

/* ------------------------------------------------------------ Splash screen */
/* Abertura rápida estilo aplicativo — apenas na primeira visita da sessão */
(() => {
  try {
    if (sessionStorage.getItem("pd_splash")) return;
    sessionStorage.setItem("pd_splash", "1");
  } catch (_) {
    return; // storage indisponível: pula o splash
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const el = document.createElement("div");
  el.className = "splash";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `
    <img src="./assets/img/logo.svg" alt="" width="72" height="72">
    <p class="splash-brand">port<span>-droid</span></p>
    <div class="splash-bar"><span></span></div>`;
  document.body.prepend(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 450);
  }, 950);
})();

/* ------------------------------------------------- Pill de instalação PWA */
let installEvt = null;

function setupInstallPill() {
  if (matchMedia("(display-mode: standalone)").matches) return; // já é app instalado
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvt = e;
    try {
      if (localStorage.getItem("pd_install_hide")) return;
    } catch (_) { /* segue */ }

    const pill = document.createElement("div");
    pill.className = "install-pill";
    pill.setAttribute("role", "dialog");
    pill.setAttribute("aria-label", "Instalar aplicativo");
    pill.innerHTML = `
      <span class="ico-box">${ICONS.download}</span>
      <p>Instale o <strong>port-droid</strong> na sua tela inicial</p>
      <button class="btn btn-primary btn-sm" type="button">Instalar</button>
      <button class="pill-close" type="button" aria-label="Dispensar">${ICONS.close}</button>`;
    document.body.appendChild(pill);
    requestAnimationFrame(() => pill.classList.add("show"));

    pill.querySelector(".btn").addEventListener("click", async () => {
      if (!installEvt) return;
      pill.classList.remove("show");
      installEvt.prompt();
      await installEvt.userChoice;
      installEvt = null;
      setTimeout(() => pill.remove(), 350);
    });
    pill.querySelector(".pill-close").addEventListener("click", () => {
      try { localStorage.setItem("pd_install_hide", "1"); } catch (_) { /* segue */ }
      pill.classList.remove("show");
      setTimeout(() => pill.remove(), 350);
    });
  });
}

/* ------------------------------------------------------ Reveal on scroll */
let revealObserver = null;

function attachReveal(root = document) {
  const els = $$(".reveal:not(.visible)", root);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduced) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
  }
  els.forEach((el) => revealObserver.observe(el));
}

/* --------------------------------------------------------- Service worker */
function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/* ------------------------------------------------------------------ Boot */
document.addEventListener("DOMContentLoaded", () => {
  /* substitui placeholders estáticos <span data-ico="nome"></span> por SVGs;
     elementos com outras classes (ex.: .ico-box) recebem o SVG por dentro */
  $$("[data-ico]").forEach((el) => {
    const icon = ICONS[el.dataset.ico];
    if (!icon) return;
    if (el.classList.length > 1) el.innerHTML = icon;
    else el.outerHTML = icon;
  });

  renderHeader();
  renderFooter();
  renderBottomNav();
  setupInstallPill();
  attachReveal();
  registerSW();
});

/* API pública para os scripts de página */
window.PD = {
  $, $$, SITE, ICONS, CATEGORIES, catLabel, catIcon, PERF_LABEL,
  esc, fmtNum, fmtCompact, fmtDate, getGames, cardHTML, skeletonCards, attachReveal,
};
