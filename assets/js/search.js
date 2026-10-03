/* =============================================================================
   port-droid — search.js
   Tela de busca dedicada (estilo "SearchActivity" de app Android):
   - abre com o campo focado e teclado pronto;
   - buscas recentes persistidas no localStorage;
   - sugestões (categorias + populares) no estado inicial;
   - resultados ao vivo com destaque do termo;
   - Enter abre o primeiro resultado; botão voltar retorna à tela anterior.
   ============================================================================= */
"use strict";

(async () => {
  const { $, getGames, esc, fmtNum, fmtCompact, catLabel, catIcon, ICONS } = window.PD;

  const input = $("#searchInput");
  if (!input) return;

  const clearBtn = $("#searchClear");
  const backBtn = $("#backBtn");
  const homeState = $("#homeState");
  const resultsState = $("#resultsState");
  const resultsList = $("#resultsList");
  const countEl = $("#resultCount");
  const emptyState = $("#emptyState");
  const emptyMsg = $("#emptyMsg");
  const recentsWrap = $("#recentsWrap");
  const recentsList = $("#recentsList");
  const suggestCats = $("#suggestCats");
  const suggestList = $("#suggestList");

  const RECENTS_KEY = "pd_recent_searches_v1";
  let games = [];
  let currentQ = "";

  /* ----------------------------------------------------------- Recentes */
  const getRecents = () => {
    try {
      const list = JSON.parse(localStorage.getItem(RECENTS_KEY));
      return Array.isArray(list) ? list.filter((q) => typeof q === "string") : [];
    } catch (_) {
      return [];
    }
  };

  const setRecents = (list) => {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, 8)));
    } catch (_) { /* storage indisponível */ }
  };

  const pushRecent = (q) => {
    const clean = q.trim();
    if (!clean || clean.length > 60) return;
    setRecents([clean, ...getRecents().filter((x) => x.toLowerCase() !== clean.toLowerCase())]);
  };

  /* ------------------------------------------------------------ Matching */
  function match(q) {
    const needle = q.toLowerCase();
    const scored = [];
    for (const g of games) {
      const title = (g.title || "").toLowerCase();
      const port = (g.port || "").toLowerCase();
      const hay = [g.title, g.port, g.original, ...(g.tags || []), ...(g.categories || []).map(catLabel)]
        .join(" ")
        .toLowerCase();
      let score = 0;
      if (title.startsWith(needle)) score = 5;
      else if (title.includes(needle)) score = 4;
      else if (port.startsWith(needle)) score = 3;
      else if (port.includes(needle)) score = 2;
      else if (hay.includes(needle)) score = 1;
      if (score) scored.push([score, g]);
    }
    scored.sort((a, b) => b[0] - a[0] || (b[1].downloads || 0) - (a[1].downloads || 0));
    return scored.map((s) => s[1]);
  }

  /* ---------------------------------------------------------- Templates */
  /* destaque do termo digitado dentro do título (texto já escapado) */
  function hl(text, q) {
    const t = esc(text);
    const needle = (q || "").trim();
    if (!needle) return t;
    const idx = t.toLowerCase().indexOf(needle.toLowerCase());
    if (idx === -1) return t;
    return `${t.slice(0, idx)}<mark>${t.slice(idx, idx + needle.length)}</mark>${t.slice(idx + needle.length)}`;
  }

  const rowGame = (g, q) => {
    const sub = [g.port, g.categories?.[0] ? catLabel(g.categories[0]) : "", g.downloads ? `${fmtCompact(g.downloads)} downloads` : ""]
      .filter(Boolean)
      .join(" · ");
    return `
    <a class="s-row" href="./game.html?id=${encodeURIComponent(g.id)}">
      <img class="s-thumb" src="${esc(g.cover)}" alt="" width="46" height="60" loading="lazy" decoding="async">
      <span class="s-main">
        <span class="s-label">${hl(g.title, q)}</span>
        <span class="s-sub">${esc(sub)}</span>
      </span>
      <span class="s-end">${ICONS.arrow}</span>
    </a>`;
  };

  const rowRecent = (q) => `
    <div class="s-row">
      <button type="button" class="s-row-main" data-q="${esc(q)}">
        <span class="s-ico">${ICONS.clock}</span>
        <span class="s-main"><span class="s-label">${esc(q)}</span></span>
      </button>
      <button type="button" class="s-del" data-del="${esc(q)}" aria-label="Remover “${esc(q)}” das buscas recentes">${ICONS.close}</button>
    </div>`;

  /* -------------------------------------------------------------- Render */
  function renderRecents() {
    const list = getRecents();
    recentsWrap.hidden = !list.length;
    recentsList.innerHTML = list.map(rowRecent).join("");
  }

  function renderSuggestions() {
    /* chips de categoria com contagem do catálogo */
    const counts = {};
    games.forEach((g) => (g.categories || []).forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
    suggestCats.innerHTML = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([id, n]) =>
          `<a class="chip" href="./catalog.html?cat=${encodeURIComponent(id)}"><span class="chip-ico">${ICONS[catIcon(id)] || ""}</span>${esc(catLabel(id))} (${n})</a>`
      ).join("");

    /* populares: mais baixados primeiro */
    const popular = [...games].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
    suggestList.innerHTML = popular.map((g) => rowGame(g, "")).join("");
  }

  function render() {
    const q = input.value.trim();
    currentQ = q;
    input.parentElement.classList.toggle("has-value", !!q);

    if (!q) {
      homeState.hidden = false;
      resultsState.hidden = true;
      emptyState.classList.remove("show");
      renderRecents();
      history.replaceState(null, "", location.pathname);
      return;
    }

    const list = games.length ? match(q) : [];
    homeState.hidden = true;
    emptyState.classList.toggle("show", !list.length);
    resultsState.hidden = !list.length;

    if (list.length) {
      countEl.innerHTML = `<strong>${fmtNum(list.length)}</strong> ${list.length === 1 ? "resultado encontrado" : "resultados encontrados"} para “${esc(q)}”`;
      resultsList.innerHTML = list.map((g) => rowGame(g, q)).join("");
    } else {
      emptyMsg.textContent = `Não achamos nada com “${q}”. Tente outro nome ou explore o catálogo completo.`;
    }

    history.replaceState(null, "", `?q=${encodeURIComponent(q)}`);
  }

  /* ------------------------------------------------------------- Eventos */
  let deb;
  input.addEventListener("input", () => {
    clearTimeout(deb);
    deb = setTimeout(render, 130);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = resultsList.querySelector("a.s-row");
      if (first && !resultsState.hidden) {
        pushRecent(currentQ);
        location.assign(first.href);
      }
    } else if (e.key === "Escape") {
      input.value = "";
      render();
      input.focus();
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    render();
    input.focus();
  });

  backBtn.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.assign("./index.html");
  });

  /* recents: tocar busca de novo; × remove uma por uma */
  recentsList.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      setRecents(getRecents().filter((x) => x !== del.dataset.del));
      renderRecents();
      return;
    }
    const row = e.target.closest("[data-q]");
    if (row) {
      input.value = row.dataset.q;
      render();
      input.focus({ preventScroll: true });
    }
  });

  $("#clearRecents").addEventListener("click", () => {
    setRecents([]);
    renderRecents();
  });

  /* tocar em um resultado guarda a busca usada */
  resultsList.addEventListener("click", (e) => {
    if (e.target.closest("a.s-row") && currentQ) pushRecent(currentQ);
  });

  /* voltar do jogo para cá (bfcache): re-renderiza com o estado atual */
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) render();
  });

  /* elevação da topbar ao rolar (sombra sutil, cara de app) */
  const topbar = $(".search-topbar");
  window.addEventListener(
    "scroll",
    () => topbar.classList.toggle("scrolled", window.scrollY > 6),
    { passive: true }
  );

  /* ---------------------------------------------------------------- Boot */
  /* foco e buscas recentes primeiro: não dependem da rede (teclado sobe já) */
  input.focus({ preventScroll: true });
  renderRecents();

  try {
    games = await getGames();
    renderSuggestions();
    /* se o usuário digitou enquanto o catálogo carregava, re-renderiza */
    if (input.value.trim()) render();
  } catch (err) {
    suggestCats.innerHTML = "";
    suggestList.innerHTML = `<p class="s-error">${esc(err.message || "Falha ao carregar o catálogo.")} Verifique sua conexão e recarregue a página.</p>`;
  }

  /* deep link ?q=... : só preenche se o campo ainda estiver vazio */
  const q0 = new URLSearchParams(location.search).get("q");
  if (q0 && input.value.trim() !== q0) {
    input.value = q0;
    render();
  }
})();
