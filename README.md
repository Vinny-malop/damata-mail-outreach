# Damata — Mail Outreach

Landing page de prospecção da Damata Coffee, hospedada no GitHub Pages.
Uma única página (`index.html`) que se personaliza pelo nome que vem na URL,
+ um gerador que produz os **links únicos** e os **QR codes** de cada prospect.

🔗 **Site:** https://vinny-malop.github.io/damata-mail-outreach/

---

## Como funciona

Cada prospect recebe um link com o nome dele no parâmetro `?c=`:

```
https://vinny-malop.github.io/damata-mail-outreach/?c=Acme%20Rentals
```

A página lê esse parâmetro e mostra **"Hi Acme Rentals,"** no topo. Esse mesmo
link vira o QR code impresso na caixa. Como o nome viaja só na URL, **a sua lista
de prospects não fica no repositório** — não há o que alguém enumerar.

---

## Fluxo de trabalho

### 1. Preencher os IDs de rastreamento (uma vez só)
Abra `index.html` e edite o bloco `DAMATA_CONFIG` no topo:

```js
window.DAMATA_CONFIG = {
  META_PIXEL_ID: 'YOUR_META_PIXEL_ID',  // Meta (Facebook/Instagram) Pixel
  GA4_ID:        'YOUR_GA4_ID',          // Google Analytics 4 (G-XXXXXXXXXX)
  CLARITY_ID:    'YOUR_CLARITY_ID'       // Microsoft Clarity
};
```

> Enquanto começar com `YOUR_`, o rastreamento fica desligado. Troque pelos IDs reais
> e dê `git push` para ativar.

### 2. Gerar links + QR codes
```bash
npm install          # só na primeira vez
# edite prospects.csv (uma empresa por linha)
npm run links
```

Saída (na pasta `output/`, que **não** vai pro GitHub):
- `output/links.csv` — empresa → link
- `output/qr/<nome>.svg` — QR vetorial (**use este para impressão**)
- `output/qr/<nome>.png` — QR em imagem (1024px)

### 3. Publicar alterações no site
```bash
git add -A
git commit -m "atualiza página"
git push
```
O GitHub Pages republica em ~1 minuto.

---

## Como saber quem abriu o QR

Cada prospect tem um link único, então o nome aparece direto nas ferramentas:

- **GA4 / Microsoft Clarity:** filtre pela URL contendo `?c=Acme Rentals`. O Clarity
  ainda te dá a gravação da sessão (você vê o prospect rolando a página).
- **Meta Pixel:** dispara `PageView` + o evento customizado **`QROpen`** com o nome do
  prospect — use para montar públicos de **remarketing** e **lookalike** no
  Instagram/Facebook.

---

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | A página (personaliza pelo `?c=`) |
| `assets/` | Imagens compartilhadas |
| `generate-links.mjs` | Gera os links únicos + QR codes |
| `prospects.csv` | **SUA lista real** (local, fora do git — faça backup!) |
| `prospects.example.csv` | Exemplo de formato |

> ⚠️ O `prospects.csv` e a pasta `output/` ficam **só no seu computador**.
> Eles são o único lugar com o mapa completo de prospects → faça backup.
