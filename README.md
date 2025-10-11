# Exhibition Curator

Small web app to browse artworks from the Art Institute of Chicago (AIC) and Harvard Art Museums, and build a quick exhibition that lives for the browser session.

Live: https://dmrexhibitioncuratorproject.netlify.app/

---

## Features (EN)

- **Search artworks** from AIC and Harvard.
- **Artist filter** to narrow results to a specific creator.
- **Sort by title** (A–Z or Z–A).
- **Full-card navigation**: the entire card is clickable; add/remove buttons do not trigger navigation.
- **My Exhibition**: add or remove artworks and view your selection in a separate page.
- **Session persistence**: your exhibition is saved in the current browser tab (sessionStorage).
- **Detail page** with image, key metadata, add/remove button, and **“Where to see it”** (official page + address for AIC/Harvard).

## Funcionalidades (PT-BR)

- **Busca de obras** no AIC e no Harvard Art Museums.
- **Filtro por artista** para focar em um criador específico.
- **Ordenação por título** (A–Z ou Z–A).
- **Card inteiro clicável**: o card todo leva ao detalhe; os botões de adicionar/remover não navegam.
- **My Exhibition**: adicione ou remova obras e veja sua seleção em uma página própria.
- **Persistência na sessão**: sua exposição fica salva na aba atual do navegador (sessionStorage).
- **Página de detalhe** com imagem, metadados principais, botão de adicionar/remover e **“Where to see it”** (página oficial + endereço para AIC/Harvard).

---

## Tech

- React + React Router
- Context API + `sessionStorage`
- CSS
- Public APIs: Art Institute of Chicago (AIC) and Harvard Art Museums

---

## Run locally (EN)

```bash
npm install
npm run dev
# open the URL that Vite prints (usually http://localhost:5173)
