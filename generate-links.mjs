// ============================================================================
//  Damata — gerador de links únicos + QR codes por prospect
// ----------------------------------------------------------------------------
//  Como usar:
//    1) npm install            (só na primeira vez)
//    2) edite prospects.csv    (um prospect por linha)
//    3) npm run links          (ou: node generate-links.mjs)
//
//  Saída (pasta output/, NÃO vai pro GitHub):
//    - output/links.csv        empresa  ->  link único
//    - output/qr/<slug>.svg    QR vetorial (melhor p/ impressão)
//    - output/qr/<slug>.png    QR em imagem (1024px)
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import QRCode from 'qrcode';

// ===== CONFIG ===============================================================
const BASE_URL = 'https://vinny-malop.github.io/damata-mail-outreach';
// ============================================================================

const __dir   = dirname(fileURLToPath(import.meta.url));
const inFile  = join(__dir, 'prospects.csv');
const outDir  = join(__dir, 'output');
const qrDir   = join(outDir, 'qr');

if (!existsSync(inFile)) {
  console.error('\n❌ Não encontrei prospects.csv.');
  console.error('   Crie o arquivo (1 empresa por linha) ou copie de prospects.example.csv.\n');
  process.exit(1);
}

// --- parser de CSV simples, com suporte a aspas (nomes com vírgula) ---------
function parseCSVLine(line) {
  const out = [];
  let field = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { out.push(field); field = ''; }
      else field += ch;
    }
  }
  out.push(field);
  return out;
}

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'prospect';
}

function csvCell(value) {
  return /[",\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
}

// --- lê e limpa a lista ------------------------------------------------------
const raw = readFileSync(inFile, 'utf8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const companies = [];
for (const line of lines) {
  const company = parseCSVLine(line)[0].trim();
  if (!company) continue;
  if (companies.length === 0 && company.toLowerCase() === 'company') continue; // pula cabeçalho
  companies.push(company);
}

if (companies.length === 0) {
  console.error('\n❌ prospects.csv está vazio (nenhuma empresa encontrada).\n');
  process.exit(1);
}

// --- gera links + QR ---------------------------------------------------------
mkdirSync(qrDir, { recursive: true });

const usedSlugs = new Set();
const rows = [['company', 'url', 'qr_file']];

console.log(`\n🔗 Gerando links e QR codes para ${companies.length} prospect(s)...\n`);

for (const company of companies) {
  let slug = slugify(company);
  let unique = slug, n = 2;
  while (usedSlugs.has(unique)) unique = `${slug}-${n++}`;
  slug = unique;
  usedSlugs.add(slug);

  const url = `${BASE_URL}/?c=${encodeURIComponent(company)}`;

  const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 });
  writeFileSync(join(qrDir, `${slug}.svg`), svg);
  await QRCode.toFile(join(qrDir, `${slug}.png`), url, { errorCorrectionLevel: 'M', margin: 2, width: 1024 });

  rows.push([company, url, `qr/${slug}.svg`]);
  console.log(`  ✓ ${company}`);
  console.log(`      ${url}`);
}

writeFileSync(join(outDir, 'links.csv'), rows.map(r => r.map(csvCell).join(',')).join('\n') + '\n');

console.log(`\n✅ Pronto!`);
console.log(`   • Lista de links:  output/links.csv`);
console.log(`   • QR codes:        output/qr/  (use os .svg para impressão)\n`);
