/**
 * Imagens do site em src/assets/img (AVIF e WebP em várias larguras, com manifesto.json pro
 * width/height do <img>) e ícones em src/raiz. Base da 0105 Ston.
 *
 * Origem: ../0108 - Jonathan Vale/Recursos Site (fundos e doutor gerados no ChatGPT em
 * 2026-11-16, em camadas separadas) e insumos/ (recorte do doutor e monograma, feitos por
 * scripts/recortar-doutor.py e scripts/preparar-logo.py).
 * Uso: node scripts/processar-imagens.mjs   (depois: node build.mjs)
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import path from 'node:path'

const REC = '../0108 - Jonathan Vale/Recursos Site'
const OUT = 'src/assets/img'
const RAIZ = 'src/raiz'
mkdirSync(OUT, { recursive: true })
mkdirSync(RAIZ, { recursive: true })
for (const f of readdirSync(OUT)) rmSync(path.join(OUT, f), { recursive: true, force: true })
const manifesto = {}

async function gravar(pipeline, nome) {
  const info = await pipeline.toFile(path.join(OUT, nome))
  manifesto[nome] = { w: info.width, h: info.height, kb: Math.round(info.size / 1024) }
}

// uma imagem em várias larguras, AVIF e WebP. corte = [x, y, largura, altura] em fração
async function variantes(nome, origem, larguras, { corte, alfa = false, qualidade = 52 } = {}) {
  let buf = await sharp(origem).toBuffer()
  if (corte) {
    const m = await sharp(buf).metadata()
    buf = await sharp(buf).extract({
      left: Math.round(m.width * corte[0]), top: Math.round(m.height * corte[1]),
      width: Math.round(m.width * corte[2]), height: Math.round(m.height * corte[3]),
    }).toBuffer()
  }
  const { width } = await sharp(buf).metadata()
  for (const w of larguras) {
    if (w > width * 1.02) continue
    for (const f of ['avif', 'webp']) {
      let p = sharp(buf).resize({ width: w, kernel: 'lanczos3' })
      p = f === 'avif'
        ? p.avif({ quality: alfa ? 60 : qualidade, effort: 7, chromaSubsampling: alfa ? '4:4:4' : '4:2:0' })
        : p.webp({ quality: alfa ? 84 : 74, alphaQuality: 90, effort: 6, smartSubsample: true })
      await gravar(p, `${nome}-${w}.${f}`)
    }
  }
  console.log(nome.padEnd(20), larguras.join(', '))
}

// ---------------------------------------------------------------- hero (camadas)
// o fundo é todo desfocado: qualidade baixa não aparece e o LCP agradece
await variantes('hero-fundo', `${REC}/fundo-hero-desktop.png`, [960, 1280, 1672], { qualidade: 44 })
await variantes('hero-fundo-celular', `${REC}/fundo-hero-mobile.png`, [480, 720, 941], { qualidade: 44 })
// doutor recortado: caixa do recorte 105..905 x 119..1536 de 1024x1536
await variantes('doutor', 'insumos/doutor-recorte.png', [360, 560, 800], { alfa: true, corte: [96 / 1024, 110 / 1536, 820 / 1024, 1426 / 1536] })
// celular: só da cabeça à cintura, que é o que a moldura de 330x360 mostra (o inteiro pesava 53 KB)
await variantes('doutor-cel', 'insumos/doutor-recorte.png', [400, 560, 760], { alfa: true, corte: [96 / 1024, 110 / 1536, 820 / 1024, 880 / 1536] })

// ---------------------------------------------------------------- sobre (foto real no escritório, 4:5)
await variantes('sobre', `${REC}/FOTOS DOUTOR/WhatsApp Image 2026-11-16 at 13.48.48.jpeg`, [420, 640, 900], { corte: [0, 0.07, 1, 0.703], qualidade: 56 })

// ---------------------------------------------------------------- marca
await gravar(sharp('insumos/monograma.png').resize({ height: 132 }).webp({ quality: 90, alphaQuality: 95 }), 'monograma-132.webp')
await gravar(sharp('insumos/monograma.png').webp({ quality: 80, alphaQuality: 80 }), 'monograma-marca.webp')
// abertura: a logo inteira (621x564), mostrada a ~260 px. O ouro 3D tem muita textura: WebP de
// qualidade alta dava 104 KB; AVIF 48 fica em ~33 KB sem perda visível nesse tamanho
await gravar(sharp('insumos/logo-inteira.png').resize({ width: 520 }).avif({ quality: 48, effort: 7 }), 'logo-abertura-520.avif')
await gravar(sharp('insumos/logo-inteira.png').resize({ width: 520 }).webp({ quality: 72, alphaQuality: 60, effort: 6 }), 'logo-abertura-520.webp')

// imagem de compartilhamento: fundo + doutor à direita
{
  const fundo = await sharp(`${REC}/fundo-hero-desktop.png`).resize(1200, 630, { fit: 'cover', position: 'right' }).toBuffer()
  const dr = await sharp('insumos/doutor-recorte.png').extract({ left: 96, top: 110, width: 820, height: 1000 }).resize({ height: 600 }).toBuffer()
  const mono = await sharp('insumos/monograma.png').resize({ height: 230 }).toBuffer()
  await gravar(sharp(fundo).composite([{ input: dr, left: 640, top: 30 }, { input: mono, left: 180, top: 200 }]).jpeg({ quality: 82, mozjpeg: true }), 'og.jpg')
}

// favicons: monograma dourado sobre o marinho, cantos arredondados
async function icone(lado, saida) {
  const s = Math.round(lado * 0.78)
  const simbolo = await sharp('insumos/monograma.png').resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  const r = Math.round(lado * 0.2)
  const fundo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}"><rect width="${lado}" height="${lado}" rx="${r}" fill="#0A1424"/></svg>`)
  await sharp(fundo).composite([{ input: simbolo, gravity: 'center' }]).png().toFile(path.join(RAIZ, saida))
}
await icone(32, 'favicon-32.png')
await icone(180, 'apple-touch-icon.png')
await icone(192, 'icon-192.png')
await icone(512, 'icon-512.png')

writeFileSync(path.join(OUT, 'manifesto.json'), JSON.stringify(manifesto, null, 1))
const total = Object.values(manifesto).reduce((a, m) => a + m.kb, 0)
console.log(`ok ${Object.keys(manifesto).length} arquivos, ${total} KB`)
