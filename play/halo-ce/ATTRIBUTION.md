# Halo CE Mobile — build empacotado (runner web)

Este diretório (`play/halo-ce/`) contém o build publicado do **Halo CE Mobile**
(https://fucktrevor.github.io/HCE-Mobile/), o port web de **Halo: Combat Evolved**
que roda no navegador via WebAssembly. Ele fica dentro de `play/` para o service
worker `play/coi.js` cobrir o primeiro load do runner embutido.

- Fonte: https://github.com/fucktrevor/HCE-Mobile
- Build: `12d9e05d1ec4b7e5` (version.json, baixado em 03/10/2026)
- Licença: **CC0-1.0** (domínio público) — https://github.com/fucktrevor/HCE-Mobile (arquivo LICENSE)
- Alterações: **uma única** — `sw.js` ganhou um patch (marcado com "PATCH port-droid")
  que não envia `Cross-Origin-Opener-Policy` para iframes (`destination === 'iframe'`).
  Motivo: COOP em um iframe move o frame para outro agent cluster e o pai perde o acesso
  ao DOM do runner, usado pelo atalho "Selecionar ISO" do player. A isolação de threads
  continua garantida (COOP do topo em `play/` + COEP em todos os documentos). Todo o resto
  é cópia integral do build publicado.

## Créditos da cadeia do projeto

- **Halo CE Mobile (web)** — fucktrevor (CC0-1.0)
- Fork de **halo-ce-universal** — cybersecurity (ports Linux/Windows/Android)
- Decompilação de **Halo: Combat Evolved** (Xbox build 2342) — punpckhdq/halo e bnunu/halo-1
- Jogo original: © Microsoft/343 Industries/Bungie. Projeto de fã sem afiliação;
  usa os Game Content Usage Rules da Microsoft; **nenhum dado do jogo é distribuído aqui** —
  o jogador usa a própria imagem de disco (.iso/.xiso).

## Atualizando o runner

1. Baixe os arquivos listados em `SHELL` dentro do `sw.js` do build publicado
   (https://fucktrevor.github.io/HCE-Mobile/sw.js), incluindo `halo.js`, `halo.wasm`,
   `version.json` e o novo `sw.js`.
2. Substitua os arquivos deste diretório e confira o `version.json`.
3. Reaplique o patch do COOP no `sw.js` (bloco marcado com "PATCH port-droid" acima).
4. Nada mais precisa mudar: o player embute `index.html` desta pasta e o atalho
   "Selecionar ISO" continua funcionando.
