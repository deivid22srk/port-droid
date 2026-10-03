/* =============================================================================
   port-droid — home.js
   Página inicial: estatísticas do hero, destaque, novos ports,
   mais baixados e categorias.
   ============================================================================= */
"use strict";

(async () => {
  const { $, ICONS, getGames, cardHTML, skeletonCards, fmtCompact, fmtNum, catLabel, catIcon, attachReveal } = window.PD;

  const novosGrid = $("#novosGrid");
  const topList = $("#topList");
  const catGrid = $("#catGrid");
  if (!novosGrid) return;

  /* Skeletons imediatos (loading state) */
  novosGrid.innerHTML = skeletonCards(4);

  let games;
  try {
    games = await getGames();
  } catch (err) {
    novosGrid.innerHTML = `<div class="empty-state show"><h3>Não foi possível carregar</h3><p>Verifique sua conexão e recarregue a página.</p></div>`;
    return;
  }

  /* -------------------------------------------------------- Hero: números */
  const totalDl = games.reduce((s, g) => s + (g.downloads || 0), 0);
  const cats = new Set(games.flatMap((g) => g.categories || []));
  $("#statPorts").textContent = fmtNum(games.length);
  $("#statCats").textContent = fmtNum(cats.size);
  $("#statDl").textContent = fmtCompact(totalDl);

  /* ------------------------------------------------------- Hero: destaque */
  const featured = games.find((g) => g.featured) || games[0];
  if (featured) {
    $("#featuredLink").href = `./game.html?id=${encodeURIComponent(featured.id)}`;
    $("#featuredImg").src = featured.banner;
    $("#featuredImg").alt = `Banner do port ${featured.title}`;
    $("#featuredTitle").textContent = featured.title;
    $("#featuredSub").textContent = `${featured.port} · v${featured.version}`;
    $("#featuredBadge").textContent = featured.statusLabel || "Em destaque";
  }

  /* ---------------------------------------------------------- Novos ports */
  /* Android e Web separados: cada tipo tem o próprio trilho na home.
     A busca (search.html) continua retornando os dois tipos juntos. */
  const byType = (t) => games.filter((g) => (g.type === "web" ? "web" : "android") === t);
  const byRecent = (a, b) => String(b.dateAdded || "").localeCompare(String(a.dateAdded || ""));

  const recentAndroid = [...byType("android")].sort(byRecent).slice(0, 4);
  novosGrid.innerHTML = recentAndroid.map(cardHTML).join("");
  attachReveal(novosGrid);

  /* ------------------------------------------------- Ports Web (navegador) */
  const webGrid = $("#webGrid");
  const webSection = $("#webSection");
  const recentWeb = [...byType("web")].sort(byRecent).slice(0, 4);
  if (webGrid && webSection && recentWeb.length) {
    webSection.hidden = false;
    webGrid.innerHTML = recentWeb.map(cardHTML).join("");
    attachReveal(webGrid);
  }

  /* -------------------------------------------------------- Mais baixados */
  const top = [...games].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
  topList.innerHTML = top
    .map(
      (g, i) => `
    <li class="rank-item reveal">
      <span class="rank-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <img class="rank-thumb" src="${PD.esc(g.cover)}" alt="" width="52" height="52" loading="lazy">
      <div class="rank-info">
        <h3><a href="./game.html?id=${encodeURIComponent(g.id)}">${PD.esc(g.title)}</a></h3>
        <p>${g.type === "web" ? `${PD.esc(g.port)} · Web (navegador)` : `${PD.esc(g.port)} · v${PD.esc(g.version || "—")}`}</p>
      </div>
      <div class="rank-dl">
        <div class="n">${fmtCompact(g.downloads || 0)}</div>
        <div class="l">downloads</div>
      </div>
    </li>`
    )
    .join("");
  attachReveal(topList);

  /* ------------------------------------------------------------ Categorias */
  const counts = {};
  games.forEach((g) => (g.categories || []).forEach((c) => (counts[c] = (counts[c] || 0) + 1)));

  const tiles = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([id, n]) => `
    <a class="cat-tile reveal" href="./catalog.html?cat=${encodeURIComponent(id)}">
      <span class="ico-box">${ICONS[catIcon(id)]}</span>
      <span>
        <h3>${PD.esc(catLabel(id))}</h3>
        <span>${n} ${n === 1 ? "port" : "ports"}</span>
      </span>
    </a>`
    );

  catGrid.innerHTML = tiles.join("") || `<p class="footer-note">Nenhuma categoria cadastrada ainda.</p>`;
  attachReveal(catGrid);
})();
