/* =============================================================================
   port-droid — game.js
   Página do jogo: preenche tudo a partir do games.json (?id=slug),
   galeria com lightbox, vídeo do YouTube e ports relacionados.
   ============================================================================= */
"use strict";

(async () => {
  const {
    $, $$, ICONS, getGames, esc, fmtNum, fmtDate, catLabel, PERF_LABEL,
    cardHTML, attachReveal,
  } = window.PD;

  const root = $("#gamePage");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");

  let games;
  try {
    games = await getGames();
  } catch (err) {
    root.innerHTML = `<div class="container"><div class="empty-state show"><h3>Não foi possível carregar</h3><p>Verifique sua conexão e recarregue a página.</p></div></div>`;
    return;
  }

  const g = games.find((x) => x.id === id);

  /* Jogo inexistente ou sem id → mensagem + link para o catálogo */
  if (!g) {
    document.title = "Port não encontrado — port-droid";
    root.innerHTML = `
    <div class="container">
      <div class="empty-state show" style="margin-top:60px">
        ${ICONS.alert.replace('class="ico"', 'class="ico" style="width:46px;height:46px;color:var(--text-dim);margin:0 auto 16px"')}
        <h3>Port não encontrado</h3>
        <p>O jogo que você procura não está no catálogo (ou o link está incompleto). Confira o catálogo completo para ver o que já está disponível.</p>
        <a class="btn btn-primary" href="./catalog.html">Ir para o catálogo</a>
      </div>
    </div>`;
    return;
  }

  /* -------------------------------------------------------------- Título */
  document.title = `${g.title} (${g.port}) — port-droid`;
  const desc = g.shortDescription || "";
  const metaEl = document.querySelector('meta[name="description"]');
  if (metaEl && desc) metaEl.setAttribute("content", desc);

  /* --------------------------------------------------------- Banner/head */
  $("#bannerImg").src = g.banner;
  $("#bannerImg").alt = `Banner do port ${g.title}`;
  $("#gameCover").src = g.cover;
  $("#gameCover").alt = `Capa do jogo ${g.title}`;
  $("#gameTitle").textContent = g.title;
  $("#gamePort").innerHTML = `Port: <strong>${esc(g.port)}</strong> · Original: ${esc(g.original || "—")}`;
  $("#gameCrumb").textContent = g.title;

  $("#gameTags").innerHTML = [
    ...(g.categories || []).map((c) => `<span class="chip chip-accent">${esc(catLabel(c))}</span>`),
    ...(g.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`),
  ].join("");

  /* Ações (botões principais e da sidebar apontam para os mesmos destinos).
     Ports web (type: "web") trocam "Baixar APK" por "Jogar no navegador" -> play/ */
  const isWeb = g.type === "web";
  const setAction = (sel, { label, icon }) => {
    const a = $(sel);
    if (!a) return;
    const svg = a.querySelector("svg.ico");
    if (svg && ICONS[icon]) svg.outerHTML = ICONS[icon];
    const lbl = a.querySelector(".btn-label");
    if (lbl) lbl.textContent = label;
  };

  if (isWeb) {
    const playUrl = `./play/?id=${encodeURIComponent(g.id)}`;
    ["#btnDownload", "#btnDownloadSide"].forEach((sel) => {
      const a = $(sel);
      if (!a) return;
      a.href = playUrl;
      a.removeAttribute("target");
    });
    setAction("#btnDownload", { label: "Jogar no navegador", icon: "play" });
    setAction("#btnDownloadSide", { label: "Jogar agora", icon: "play" });
  } else {
    const dlUrl = g.links?.download || g.links?.releases || g.links?.github || "#";
    ["#btnDownload", "#btnDownloadSide"].forEach((sel) => {
      const a = $(sel);
      if (!a) return;
      a.href = dlUrl;
      a.target = "_blank"; // download externo (GitHub/MediaFire) abre em nova aba
    });
  }
  ["#btnGithub", "#btnGithubSide"].forEach((sel) => {
    const a = $(sel);
    if (a) {
      a.href = g.links?.github || "#";
      a.classList.toggle("hidden", !g.links?.github); // ports sem repositório ficam sem o botão
    }
  });
  if (g.links?.site) {
    const b = $("#btnSite");
    b.href = g.links.site;
    b.classList.remove("hidden");
  }
  $("#btnTutorial").href = g.links?.tutorial || PD.SITE.youtube;

  $("#gameCredit").innerHTML = `
    Port por <a href="${esc(g.credit?.portUrl || g.links?.github || "#")}" target="_blank" rel="noopener noreferrer">${esc(g.credit?.port || "—")}</a>
    · Projeto original: <a href="${esc(g.credit?.originalUrl || "#")}" target="_blank" rel="noopener noreferrer">${esc(g.credit?.original || "—")}</a>
    ${g.credit?.game ? `· ${esc(g.credit.game)}` : ""}`;

  /* ----------------------------------------------------------- Descrição */
  $("#gameDesc").innerHTML = (g.description || [])
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");

  /* ---------------------------------------------------------- Requisitos */
  const reqRows = (obj) =>
    Object.entries(obj || {})
      .map(
        ([k, v]) =>
          `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`
      )
      .join("");
  $("#reqMin").innerHTML = reqRows(g.requirements?.minimo);
  $("#reqRec").innerHTML = reqRows(g.requirements?.recomendado);

  /* --------------------------------------------------- Controles + instalação */
  $("#ctrlList").innerHTML = (g.controls || []).map((c) => `<li>${esc(c)}</li>`).join("");
  $("#installSteps").innerHTML = (g.install || []).map((s) => `<li>${esc(s)}</li>`).join("");

  const notesEl = $("#gameNotes");
  if (g.notes) {
    notesEl.querySelector("span:last-child").textContent = g.notes;
    notesEl.classList.remove("hidden");
  }

  /* ------------------------------------------------------------- Sidebar */
  const isWebPage = g.type === "web";
  $("#infoList").innerHTML = `
    <div><dt>Versão</dt><dd class="accent">${g.version ? `v${esc(g.version)}` : isWebPage ? "Web" : "Em breve"}</dd></div>
    <div><dt>${isWebPage ? "Onde roda" : "APK"}</dt><dd>${isWebPage ? "Navegador (sem APK)" : esc(g.apkSize || "—")}</dd></div>
    <div><dt>Armazenamento</dt><dd>${esc(g.storage || "—")}</dd></div>
    <div><dt>Chipset recomendado</dt><dd>${esc(g.chipsetRecommended || (isWebPage ? "Não se aplica" : "—"))}</dd></div>
    <div><dt>Desempenho</dt><dd>${esc(PERF_LABEL[g.performance] || "—")}</dd></div>
    <div><dt>Downloads</dt><dd class="accent">${fmtNum(g.downloads || 0)}</dd></div>
    <div><dt>Atualizado em</dt><dd>${fmtDate(g.updated)}</dd></div>
    <div><dt>Licença do port</dt><dd>${esc(g.license || "—")}</dd></div>`;

  const extraLink = $("#sideSiteLink");
  if (g.links?.site) {
    extraLink.href = g.links.site;
    extraLink.classList.remove("hidden");
  }
  $("#sideTg").href = PD.SITE.telegram;
  $("#sideYt").href = PD.SITE.youtube;

  /* -------------------------------------------------------------- Galeria */
  const shots = g.screenshots || [];
  const gallery = $("#gallery");
  gallery.innerHTML = shots
    .map(
      (src, i) =>
        `<img src="${esc(src)}" alt="Screenshot ${i + 1} do port ${esc(g.title)}" loading="lazy" decoding="async" data-index="${i}" width="1280" height="720">`
    )
    .join("");

  /* Lightbox com <dialog> */
  const lb = $("#lightbox");
  const lbImg = $("#lightboxImg");
  gallery.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-index]");
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    if (typeof lb.showModal === "function") lb.showModal();
    else window.open(img.src, "_blank");
  });
  $("#lightboxClose").addEventListener("click", () => lb.close());
  lb.addEventListener("click", (e) => {
    if (e.target === lb) lb.close(); // fecha ao clicar fora
  });

  /* ------------------------------------------------------------------ Vídeo */
  const videoBox = $("#videoBox");
  if (g.videoId) {
    videoBox.innerHTML = `<iframe src="https://www.youtube.com/embed/${esc(g.videoId)}" title="Vídeo do port ${esc(g.title)} no YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    videoBox.innerHTML = `
    <div class="video-soon">
      ${ICONS.play.replace('class="ico"', 'class="ico" style="width:44px;height:44px;color:var(--accent)"')}
      <p><strong>Gameplay e tutorial em breve</strong><br>Enquanto isso, confira os vídeos do canal:</p>
      <a href="${PD.SITE.youtube}" target="_blank" rel="noopener noreferrer">Assistir no YouTube →</a>
    </div>`;
  }

  /* ------------------------------------------------------ Ports relacionados */
  const related = games
    .filter((x) => x.id !== g.id && (x.categories || []).some((c) => (g.categories || []).includes(c)))
    .slice(0, 4);
  const fallback = games.filter((x) => x.id !== g.id).slice(0, 4);
  const list = related.length ? related : fallback;
  $("#relatedGrid").innerHTML = list.map(cardHTML).join("");
  $("#relatedWrap").classList.remove("hidden");
  attachReveal($("#relatedGrid"));

  /* -------------------------------------------------- JSON-LD (VideoGame) */
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: g.title,
    description: desc,
    gamePlatform: g.type === "web" ? "Web browser" : "Android",
    applicationCategory: "Game",
    operatingSystem: g.type === "web" ? "Web browser" : "Android",
    image: new URL(g.cover, location.href).href,
    author: { "@type": "Person", name: g.credit?.port || "", url: g.credit?.portUrl || "" },
    url: location.href,
  });
  document.head.appendChild(ld);
})();
