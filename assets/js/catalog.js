/* =============================================================================
   port-droid — catalog.js
   Catálogo: busca em tempo real, filtros (categoria, chipset, desempenho),
   ordenação e sincronização com a URL (?q=&cat=&chip=&perf=&sort=).
   ============================================================================= */
"use strict";

(async () => {
  const { $, getGames, cardHTML, skeletonCards, esc, fmtNum, catLabel, attachReveal } = window.PD;

  const grid = $("#catalogGrid");
  if (!grid) return;

  const params = new URLSearchParams(location.search);

  const state = {
    q: (params.get("q") || "").trim(),
    cat: params.get("cat") || "",
    type: params.get("type") === "web" || params.get("type") === "android" ? params.get("type") : "",
    chip: params.get("chip") || "",
    perf: params.get("perf") || "",
    sort: params.get("sort") || "recentes",
  };

  const gameType = (g) => (g.type === "web" ? "web" : "android"); // ausente = Android (compat com entradas antigas)

  let games = [];

  /* ------------------------------------------------------------ Elementos */
  const searchInput = $("#searchInput");
  const clearBtn = $("#searchClear");
  const catChips = $("#catChips");
  const typeTabs = $("#typeTabs");
  const chipSelect = $("#chipSelect");
  const perfSelect = $("#perfSelect");
  const sortSelect = $("#sortSelect");
  const countEl = $("#resultCount");
  const emptyEl = $("#emptyState");

  /* -------------------------------------------------------------- Filtros */
  function buildTypeTabs() {
    const n = { android: 0, web: 0 };
    games.forEach((g) => n[gameType(g)]++);
    const tabs = [
      ["", "Todos", games.length],
      ["android", "Android", n.android],
      ["web", "Web", n.web],
    ];
    typeTabs.innerHTML = tabs
      .map(
        ([id, label, count]) =>
          `<button type="button" class="type-tab ${state.type === id ? "active" : ""}" data-type="${id}" ${state.type === id ? 'aria-pressed="true"' : 'aria-pressed="false"'}>${label} <span class="tt-n">${count}</span></button>`
      )
      .join("");
  }

  function buildFilters() {
    /* chips de categoria (com contagem) */
    const counts = {};
    games.forEach((g) => (g.categories || []).forEach((c) => (counts[c] = (counts[c] || 0) + 1)));

    const chips = [
      `<button type="button" class="chip ${state.cat ? "" : "chip-accent"}" data-cat="">Todos (${games.length})</button>`,
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(
          ([id, n]) =>
            `<button type="button" class="chip ${state.cat === id ? "chip-accent" : ""}" data-cat="${esc(id)}">${esc(catLabel(id))} (${n})</button>`
        ),
    ];
    catChips.innerHTML = chips.join("");

    /* chips de categoria são botões — delegação de clique */
    catChips.onclick = (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.cat = btn.dataset.cat;
      buildFilters();
      apply();
    };

    /* seletor de chipsets presentes no catálogo */
    const chipsSet = new Set();
    games.forEach((g) => (g.chipsets || []).forEach((c) => chipsSet.add(c)));
    chipSelect.innerHTML =
      `<option value="">Chipset: todos</option>` +
      [...chipsSet].sort().map((c) => `<option value="${esc(c)}" ${state.chip === c ? "selected" : ""}>${esc(c)}</option>`).join("");

    perfSelect.value = state.perf;
    sortSelect.value = state.sort;
  }

  function filtered() {
    const q = state.q.toLowerCase();
    let list = games.filter((g) => {
      if (state.type && gameType(g) !== state.type) return false;
      if (state.cat && !(g.categories || []).includes(state.cat)) return false;
      if (state.chip && !(g.chipsets || []).includes(state.chip)) return false;
      if (state.perf && g.performance !== state.perf) return false;
      if (q) {
        const hay = [g.title, g.port, g.original, ...(g.tags || []), ...(g.categories || []).map(catLabel)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (state.sort) {
      case "populares":
        list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
        break;
      case "recentes":
      default:
        list.sort((a, b) =>
          String(b.dateAdded || "").localeCompare(String(a.dateAdded || "")) ||
          String(b.updated || "").localeCompare(String(a.updated || ""))
        );
    }
    return list;
  }

  /* --------------------------------------------------------------- Render */
  function apply(updateUrl = true) {
    const list = filtered();

    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : "";
    attachReveal(grid);

    countEl.innerHTML = list.length
      ? `<strong>${fmtNum(list.length)}</strong> ${list.length === 1 ? "port encontrado" : "ports encontrados"}`
      : "";

    emptyEl.classList.toggle("show", !list.length);

    /* chipset/desempenho são conceitos de APK — sem sentido nos ports web */
    const webMode = state.type === "web";
    chipSelect.hidden = webMode;
    perfSelect.hidden = webMode;

    if (updateUrl) {
      const p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.type) p.set("type", state.type);
      if (state.cat) p.set("cat", state.cat);
      if (state.chip) p.set("chip", state.chip);
      if (state.perf) p.set("perf", state.perf);
      if (state.sort && state.sort !== "recentes") p.set("sort", state.sort);
      history.replaceState(null, "", p.toString() ? `?${p}` : location.pathname);
    }
  }

  /* -------------------------------------------------------------- Eventos */
  let deb;
  searchInput.addEventListener("input", () => {
    state.q = searchInput.value.trim();
    searchInput.parentElement.classList.toggle("has-value", !!state.q);
    clearTimeout(deb);
    deb = setTimeout(() => apply(), 140); // busca em tempo real com debounce
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.q = "";
    searchInput.parentElement.classList.remove("has-value");
    searchInput.focus();
    apply();
  });

  /* abas Todos / Android / Web (delegação de clique) */
  typeTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-type]");
    if (!btn || btn.dataset.type === state.type) return;
    state.type = btn.dataset.type;
    buildTypeTabs();
    apply();
  });

  chipSelect.addEventListener("change", () => {
    state.chip = chipSelect.value;
    apply();
  });

  perfSelect.addEventListener("change", () => {
    state.perf = perfSelect.value;
    apply();
  });

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    apply();
  });

  $("#resetFilters").addEventListener("click", () => {
    Object.assign(state, { q: "", cat: "", type: "", chip: "", perf: "", sort: "recentes" });
    searchInput.value = "";
    searchInput.parentElement.classList.remove("has-value");
    buildTypeTabs();
    buildFilters();
    apply();
  });

  /* ---------------------------------------------------------------- Boot */
  grid.innerHTML = skeletonCards(8); // skeleton enquanto carrega o JSON
  try {
    games = await getGames();
  } catch (err) {
    grid.innerHTML = "";
    emptyEl.classList.add("show");
    emptyEl.querySelector("h3").textContent = "Não foi possível carregar o catálogo";
    emptyEl.querySelector("p").textContent = "Verifique sua conexão e recarregue a página.";
    return;
  }

  searchInput.value = state.q;
  searchInput.parentElement.classList.toggle("has-value", !!state.q);
  buildTypeTabs();
  buildFilters();
  apply(false);

  /* Aba "Buscar" da navigation bar (#buscar): abre o catálogo com o campo
     de busca já focado — comportamento de aplicativo nativo */
  if (location.hash === "#buscar") searchInput.focus({ preventScroll: true });

  /* e também quando o hash muda sem recarregar a página
     (ex.: usuário já estava no catálogo e toca na aba Buscar) */
  window.addEventListener("hashchange", () => {
    if (location.hash === "#buscar") searchInput.focus({ preventScroll: true });
  });
})();
