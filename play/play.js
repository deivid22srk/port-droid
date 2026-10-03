/* =============================================================================
   port-droid — play/play.js
   Player de ports web: interface nossa ao redor do runner (mesma origem).

   Fluxo: carrega o games.json -> valida o port (type: "web") -> garante o
   isolamento cross-origin da página (play/coi.js, para SharedArrayBuffer) ->
   testa o navegador -> embute o runner (links.play) num iframe e oferece o
   atalho "Selecionar ISO", que aciona o input de arquivo do runner via DOM
   (mesma origem). Quando o jogo começa (body.playing no runner), o atalho
   sai de cena e o jogo ocupa a tela; o botão de tela cheia fica no topbar.
   ============================================================================= */
"use strict";

(async () => {
  const { $, getGames, esc, ICONS } = window.PD;

  const backBtn = $("#playBack");
  const fsBtn = $("#playFullscreen");
  const stage = $("#playStage");
  const intro = $("#playIntro");
  const run = $("#playRun");
  const frame = $("#runnerFrame");
  const startBtn = $("#startBtn");
  const pickIsoBtn = $("#pickIsoBtn");
  const tools = $("#playTools");
  const checksEl = $("#supportChecks");
  const hintEl = $("#supportHint");

  const id = new URLSearchParams(location.search).get("id");
  let game = null;

  /* --------------------------------------------------- Dados do port web */
  try {
    const games = await getGames();
    game = games.find((g) => g.id === id);
  } catch (_) {
    game = null;
  }

  if (!game || game.type !== "web" || !game.links?.play) {
    // só faz sentido existir por cima de um port web
    location.replace(game ? `../game.html?id=${encodeURIComponent(game.id)}` : "../catalog.html");
    return;
  }

  document.title = `${game.title} (jogar) — port-droid`;
  /* links.play é relativo à página do player (/play/), ex.: "./halo-ce/index.html"
     (URLs absolutas também valem). O runner mora DENTRO de play/ para o escopo
     do play/coi.js cobrir o primeiro load do frame. */
  const runnerUrl = game.links.play;
  /* caminhos do games.json são relativos à raiz do site — resolve para <img> */
  const rootUrl = new URL("../", location.href).href;
  const asset = (p) => (/^[a-z]+:/i.test(p || "") ? p : new URL(p || "", rootUrl).href);
  $("#playTitle").textContent = game.title;
  $("#playSub").textContent = game.port;
  $("#playTitleBig").textContent = game.title;
  $("#playSubBig").textContent = `Port: ${game.port} · Original: ${game.original || "—"}`;
  $("#playCover").src = asset(game.cover);
  $("#playCoverBig").src = asset(game.cover);
  $("#playCoverBig").alt = `Capa de ${game.title}`;
  $("#playGameLink").href = `../game.html?id=${encodeURIComponent(game.id)}`;

  /* ------------------------------------------------ Isolamento (COI/COEP) */
  async function ensureIsolation() {
    if (!("serviceWorker" in navigator)) return false;
    let reg = null;
    try {
      reg = await navigator.serviceWorker.register("./coi.js", { scope: "./" });
    } catch (_) {
      return window.crossOriginIsolated;
    }
    // espera o worker DESTE escopo ficar ativo (serviceWorker.ready pode
    // resolver no worker do site inteiro, que não serve os cabeçalhos)
    if (!reg.active) {
      await new Promise((resolve) => {
        const t = setInterval(() => {
          if (reg.active) {
            clearInterval(t);
            resolve();
          }
        }, 80);
        setTimeout(() => {
          clearInterval(t);
          resolve();
        }, 4000);
      });
    }
    if (window.crossOriginIsolated) return true;
    let reloaded = false;
    try {
      reloaded = sessionStorage.getItem("pd-play-isolated") === "1";
    } catch (_) {}
    if (!reloaded) {
      try {
        sessionStorage.setItem("pd-play-isolated", "1");
      } catch (_) {}
      location.reload();
      await new Promise(() => {}); // a página recarrega aqui
    }
    return window.crossOriginIsolated;
  }

  const isolated = await ensureIsolation();

  /* ---------------------------------------------------- Testes do navegador */
  const checks = [
    { label: "WebAssembly", ok: typeof WebAssembly === "object", hard: true },
    { label: "WebGL 2", ok: !!document.createElement("canvas").getContext("webgl2"), hard: true },
    { label: "Armazenamento privado (OPFS)", ok: !!(navigator.storage && navigator.storage.getDirectory), hard: true },
    { label: "Threads (SharedArrayBuffer)", ok: !!isolated && typeof SharedArrayBuffer !== "undefined", hard: true },
    { label: "Toque", ok: "ontouchstart" in window || navigator.maxTouchPoints > 0, hard: false },
    { label: "Controle (Gamepad API)", ok: "getGamepads" in navigator, hard: false },
  ];

  checksEl.innerHTML = checks
    .map(
      (c) => `
    <li class="${c.ok ? "ok" : c.hard ? "fail" : "info"}">
      ${ICONS[c.ok ? "check" : c.hard ? "alert" : "info"]}
      <span>${esc(c.label)}</span>
      <em>${c.ok ? "pronto" : c.hard ? "indisponível" : "opcional"}</em>
    </li>`
    )
    .join("");

  const hardFail = checks.some((c) => c.hard && !c.ok);
  if (hardFail) {
    hintEl.textContent = "Este navegador não tem tudo o que o jogo precisa. Use um Chrome, Edge ou Firefox atualizado (ou Safari 17+ no iPhone/iPad).";
    startBtn.disabled = true;
  } else if (!isolated) {
    hintEl.textContent = "Sem isolamento cross-origin o jogo pode não iniciar; recarregue a página se o problema persistir.";
  }

  /* ------------------------------------------------------------- Iniciar */
  startBtn.addEventListener("click", () => {
    /* pula a tela de boas-vindas do runner: o usuário já está no nosso app
       (mesma origem = mesmo localStorage do runner) */
    try {
      if (!localStorage.getItem("halo-web-welcomed")) localStorage.setItem("halo-web-welcomed", "1");
    } catch (_) {}

    intro.hidden = true;
    run.hidden = false;
    fsBtn.classList.remove("hidden");
    frame.src = runnerUrl; // ex.: ./halo-ce/index.html
    watchRunner();
  });

  /* ------------------------------------------------------- Atalho da ISO */
  pickIsoBtn.addEventListener("click", () => {
    try {
      const doc = frame.contentDocument;
      const input = doc && doc.getElementById("iso-file");
      if (input && !input.disabled) input.click();
    } catch (_) {
      /* sem acesso ao runner: o usuário usa o botão dentro dele */
    }
  });

  /* observa o runner: enquanto o launcher está na tela, mostra o atalho;
     quando o jogo começa (body.playing), esconde e para de observar */
  function watchRunner() {
    const t = setInterval(() => {
      try {
        const doc = frame.contentDocument;
        if (!doc || !doc.body) return;
        const playing = doc.body.classList.contains("playing");
        tools.classList.toggle("hidden", playing);
        if (playing) clearInterval(t);
      } catch (_) {
        clearInterval(t);
      }
    }, 1200);
  }

  /* --------------------------------------------------------- Navegação */
  backBtn.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.assign(`../game.html?id=${encodeURIComponent(game.id)}`);
  });

  fsBtn.addEventListener("click", () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stage.requestFullscreen) stage.requestFullscreen({ navigationUI: "hide" });
      else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
    } catch (_) {}
  });

  document.addEventListener("fullscreenchange", () => {
    fsBtn.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia");
  });
})();
