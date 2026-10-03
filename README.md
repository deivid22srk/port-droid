# port-droid

**Loja de ports de jogos para Android — Hail Games**

Vitrine estática, rápida e responsiva que reúne ports de jogos da comunidade para
Android, organizados pelo canal [Hail Games (@Hail-Games1)](https://www.youtube.com/@Hail-Games1).

- 🌐 **Site:** https://deivid22srk.github.io/port-droid/
- 📢 **Canal no YouTube:** https://www.youtube.com/@Hail-Games1
- 💬 **Grupo no Telegram:** https://t.me/hailgames2

> ⚠️ **Aviso legal:** o port-droid é apenas uma vitrine. Nenhum jogo, ROM, ISO ou APK
> é hospedado neste repositório — todos os downloads apontam para os repositórios
> oficiais dos autores de cada port. Sem afiliação com SEGA, EA, Microsoft ou
> qualquer outra empresa. Veja a página [Aviso legal](https://deivid22srk.github.io/port-droid/legal.html).

---

## ✨ Recursos

- **Home** com hero, destaque, *Novos ports*, *Mais baixados* e *Categorias* (tudo dinâmico a partir do `games.json`)
- **Experiência estilo aplicativo**: navigation bar inferior fixa com 4 abas (Início · Jogos · Buscar · Canal), app bar compacta com busca, splash screen na abertura, transição suave entre telas e pill de "Instalar app" — no desktop (≥900px) volta à navegação superior tradicional
- **Catálogo** com busca em tempo real (a aba *Buscar* já abre com o campo focado), filtros (categoria, chipset, desempenho), ordenação e estado sincronizado na URL
- **Página do jogo** com banner, galeria + lightbox, requisitos mínimos/recomendados, instruções de instalação, créditos dos autores e botões "Baixar APK" / "Ver no GitHub"
- **Sobre o canal** com links do YouTube e do Telegram
- **Aviso legal** completo (sem afiliação, sem hospedagem de arquivos, contato para remoção)
- **PWA** instalável (manifest + service worker com estratégia network-first para páginas e cache para assets)
- **SEO básico**: title/description por página, Open Graph, Twitter Card, JSON-LD, `robots.txt` e `sitemap.xml`
- **UX**: mobile first com cara de app nativo, skeleton loading, lazy loading de imagens, animações suaves com `prefers-reduced-motion`, respeito a safe-areas (notch/barra de gestos), foco visível, HTML semântico e contraste alto
- Tema escuro gamer com destaque em **amarelo-limão** (`#DFFF00`), tipografia **Rajdhani + Inter**

## 🗂️ Estrutura do projeto

```
port-droid/
├── .github/workflows/deploy.yml   # Deploy automático para o GitHub Pages
├── .nojekyll                      # Evita processamento Jekyll no Pages
├── index.html                     # Home
├── catalog.html                   # Catálogo (busca/filtros/ordenação)
├── game.html                      # Página do jogo (?id=slug)
├── about.html                     # Sobre o canal
├── legal.html                     # Aviso legal
├── 404.html                       # Página de erro
├── manifest.json                  # PWA
├── sw.js                          # Service worker
├── robots.txt / sitemap.xml       # SEO
├── data/
│   └── games.json                 # ★ Cadastro dos ports (edite aqui!)
└── assets/
    ├── css/style.css              # Design system (tokens, header, cards…)
    ├── css/pages.css              # Estilos por página
    ├── js/main.js                 # Código compartilhado (app bar, nav bar, splash, dados)
    ├── js/home.js                 # Lógica da home
    ├── js/catalog.js              # Lógica do catálogo
    ├── js/game.js                 # Lógica da página do jogo
    └── img/                       # Logo, ícones PWA, OG image e capas dos jogos
```

## 🚀 Rodar localmente

O site é 100% estático — basta um servidor de arquivos:

```bash
# Python (já vem no sistema)
python3 -m http.server 8080
# acesse http://localhost:8080

# ou com Node
npx serve .
```

> 💡 Abra pelo servidor (`http://localhost:8080`), não pelo arquivo direto
> (`file://`), para que o `fetch` do `games.json` funcione.

## ➕ Como adicionar um novo jogo

1. Abra **`data/games.json`** e adicione um objeto novo ao array `games`
   (copie um existente como modelo — os campos são autoexplicativos):

   | Campo | Descrição |
   |---|---|
   | `id` | Slug único, usado na URL (`game.html?id=…`) |
   | `title` / `port` / `original` | Nome do jogo, nome do projeto do port e plataforma original |
   | `categories` | Lista de ids: `plataforma`, `acao`, `aventura`, `esporte`, `corrida`, `rpg`, `luta`, `emulacao`, `outros` |
   | `tags` | Tags livres exibidas na página (ex.: `Snapdragon`, `Controle`, `Mali`) |
   | `chipsets` | Usado pelo filtro de chipset do catálogo |
   | `performance` | `leve`, `medio` ou `pesado` (filtro de desempenho) |
   | `version` / `apkSize` / `storage` | Versão do port, tamanho do APK e armazenamento necessário |
   | `updated` / `dateAdded` / `downloads` | Data da atualização, data de inclusão e contador de downloads (edite manualmente) |
   | `cover` / `banner` / `screenshots` | Caminhos das imagens — **resoluções na seção 📐 "Resolução ideal das imagens"** |
   | `videoId` | ID de vídeo do YouTube para embed (ou `null` → mostra "Em breve" com link do canal) |
   | `shortDescription` / `description` | Textos de vitrine e parágrafos completos |
   | `requirements.minimo` / `requirements.recomendado` | Tabelas de requisitos (`"Chave": "valor"`) |
   | `install` / `controls` | Passos de instalação e observações de controle |
   | `links.download` / `links.github` | **Obrigatórios:** release/APK oficial e repositório do autor |
   | `credit` | Autor do port, projeto original e copyright do jogo |
   | `status` / `statusLabel` | `ativo`, `em-breve`, `removido` + rótulo exibido no card |

2. Crie a pasta de imagens do jogo e referencie no JSON:

   ```
   assets/img/games/<id>/cover.jpg      # capa 3:4   → 600x800 (ou 720x960)
   assets/img/games/<id>/banner.jpg     # banner 16:9 → 1280x720
   assets/img/games/<id>/shot-1.jpg     # screenshot 16:9 → 1280x720
   ```

   Para usar imagens reais (JPG/PNG/WebP), basta salvar os arquivos na pasta e
   atualizar os caminhos no `games.json` (ex.: `cover.jpg`). Não é preciso mexer em
   nenhum outro arquivo: home, catálogo e página do jogo se atualizam sozinhos.

3. Commit + push → o GitHub Actions publica automaticamente.

> ℹ️ Os contadores de `downloads` deste repositório foram capturados da soma
> pública de downloads das releases do GitHub em 03/10/2026. Atualize o número
> quando quiser — é um campo editável, não automático.

## 🖼️ Resolução ideal das imagens

Todas as capas, banners e screenshots são renderizadas com `object-fit: cover`:
se a proporção do arquivo não bater com a da layout, a imagem é **recortada no
centro** automaticamente. Para evitar recortes indesejados, borrão em telas
grandes e carregamento lento no 4G, siga esta especificação:

| Imagem | Onde aparece | Proporção | Resolução ideal | Formato | Peso máx. |
|---|---|---|---|---|---|
| **Capa** (`cover`) | Cards da home, catálogo e busca | **3:4** retrato | **600×800** (mín.) · **720×960** (ideal) | WebP/JPG | ~250 KB |
| **Banner** (`banner`) | Topo da página do jogo | **16:9** paisagem | **1280×720** | WebP/JPG | ~400 KB |
| **Screenshot** (`shot-1`…`shot-3`) | Galeria + lightbox da página do jogo | **16:9** paisagem | **1280×720** (igual ao banner) | WebP/JPG | ~300 KB cada |
| Ícones do PWA | Instalação do app / atalho | 1:1 | 192×192 e 512×512 (`maskable-512` com área segura de 80%) | PNG | — |
| **OG image** (compartilhamento) | Preview no WhatsApp, Telegram, X etc. | 1,91:1 | **1200×630** | PNG/JPG | < 1 MB |
| Logo / favicon | Header, splash, aba do navegador | 1:1 vetorial | SVG escalável | SVG | — |

**Regras rápidas**

1. **Capas são retrato 3:4** — exemplo: 600×800, 720×960 ou 900×1200. Nunca envie
   capa quadrada ou 16:9; ela será recortada nas laterais.
2. **Banner e screenshots são paisagem 16:9** — exemplo: 1280×720 ou 1920×1080
   (o dobro serve, só pese mais; 1280×720 já atende todas as telas do site).
3. **Prefira WebP** (ou JPG com qualidade 80–85) para carregar rápido no mobile.
4. **Não use arquivos menores que o mínimo** — capas abaixo de 600×800 e banners
   abaixo de 1280×720 ficam esticados/borrados em telas grandes.
5. **Nomeie os arquivos** `cover.*`, `banner.*`, `shot-1.*`, `shot-2.*`, `shot-3.*`
   dentro de `assets/img/games/<id>/` e atualize os caminhos no `games.json`.
6. **Trocou imagens?** Aumente a `VERSION` no `sw.js` para o cache do PWA baixar
   a versão nova (o site em produção usa service worker).

### Trocando logo, ícones e placeholders

- **Logo/favicon:** substitua `assets/img/logo.svg` e `assets/img/favicon.svg`
- **Ícones do PWA:** gere PNGs 192/512 (e `maskable-512`) e troque os arquivos em
  `assets/img/icons/`; atualize a `VERSION` no `sw.js` ao trocar assets
- **Imagem de compartilhamento (Open Graph):** `assets/img/og-image.png` (1200x630)
- **Capas/banners/screenshots dos jogos:** veja a tabela de resoluções acima

## 📦 Publicação (GitHub Pages)

O deploy é automático via **GitHub Actions** (`.github/workflows/deploy.yml`):

1. Faça push na branch `main`
2. A action *Deploy to GitHub Pages* publica o site em:
   **https://deivid22srk.github.io/port-droid/**
3. O Pages usa o modo *GitHub Actions* (Settings → Pages → Source: GitHub Actions)

Para publicar manualmente sem Actions, bastaria ativar em *Settings → Pages →
Deploy from a branch → `main` / root* — o site já usa caminhos relativos, então
funciona nos dois modos sem alterar nada.

## 🙌 Créditos dos ports listados

- **Sonic Unleashed** — [UnleashedRecomp Android](https://github.com/SansNope/UnleashedRecomp-Android),
  port de [SansNope](https://github.com/SansNope) sobre o projeto
  [Unleashed Recompiled](https://github.com/hedge-dev/UnleashedRecomp) (hedge-dev & contributors) · GPL-3.0
- **Skate 3** — [Skate 3 Mobile](https://github.com/Buku313/Skate3-Mobile),
  fork Android de [Buku313](https://github.com/Buku313) sobre o
  [Skate3Recomp](https://github.com/mchughalex/skate3recomp) de Alex McHugh
- **Counter-Strike: Global Offensive** — CS:GO Mobile, port não oficial da
  comunidade ([referência no Bilibili](https://b23.tv/w9TVFoS)), distribuído
  como APK pelo canal · Counter-Strike © Valve

## 📄 Licença

Código do site sob [MIT](LICENSE). Cada port listado mantém a licença do seu
próprio repositório. Nenhum asset de jogo original está incluído aqui.
