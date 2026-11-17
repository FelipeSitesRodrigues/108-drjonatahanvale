/**
 * A/B da primeira pintura: abre a página com CPU 4x mais lenta, como celular, várias vezes,
 * trocando trechos do HTML no caminho (interceptação), e mede FCP e LCP de cada versão.
 * Uso: node scripts/ab-pintura.mjs [rodadas]
 */
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:3418/'
const RODADAS = Number(process.argv[2] || 3)
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const VARIANTES = {
  base: (h) => h,
  'sem-brilho': (h) => h.replace(/<span class="brilho"[\s\S]*?<span class="brilho-fio" aria-hidden="true"><span class="brilho__ponto"><\/span><\/span>/g, ''),
  'sem-filtros': (h) => h.replace('</head>', '<style>*{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}</style></head>'),
  'sem-mascara': (h) => h.replace('</head>', '<style>*{-webkit-mask-image:none!important;mask-image:none!important}</style></head>'),
  'sem-animacao': (h) => h.replace("document.documentElement.classList.add('js')", '').replace('</head>', '<style>*,*::before,*::after{animation:none!important}</style></head>'),
}

const nav = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-first-run'] })
const res = {}
for (let r = 0; r < RODADAS; r++) {
  for (const [nome, troca] of Object.entries(VARIANTES)) {
    const pg = await nav.newPage()
    await pg.setViewport({ width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true })
    const cdp = await pg.target().createCDPSession()
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await pg.setCacheEnabled(false)
    await pg.setRequestInterception(true)
    pg.on('request', async (req) => {
      if (req.url() === BASE) {
        const html = await (await fetch(BASE)).text()
        return req.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: troca(html) })
      }
      req.continue()
    })
    await pg.evaluateOnNewDocument(() => {
      window.__lcp = 0
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
    })
    await pg.goto(BASE, { waitUntil: 'load' })
    await new Promise((ok) => setTimeout(ok, 3500))
    const m = await pg.evaluate(() => ({ fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0, lcp: window.__lcp }))
    ;(res[nome] ||= []).push(m)
    await pg.close()
  }
}
await nav.close()
const med = (a) => Math.round(a.sort((x, y) => x - y)[Math.floor(a.length / 2)])
for (const [nome, ms] of Object.entries(res)) console.log(nome.padEnd(14), 'FCP', med(ms.map((m) => m.fcp)), 'LCP', med(ms.map((m) => m.lcp)))
