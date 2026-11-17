// confere estouro lateral (scrollWidth > largura) e elementos que passam da borda, em várias larguras
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
for (const w of [320, 390, 768, 1024, 1280, 1440, 1920]) {
  await p.setViewport({ width: w, height: w < 600 ? 844 : 900, isMobile: w < 600, hasTouch: w < 600 })
  await p.goto('http://localhost:3415/', { waitUntil: 'networkidle2' })
  const r = await p.evaluate(() => {
    const W = document.documentElement.clientWidth
    const fora = []
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.cartoes, .filtros, .hero__midia, .cta__barras, [aria-hidden=true]')) continue
      const q = el.getBoundingClientRect()
      if (q.width && (q.right > W + 1 || q.left < -1)) fora.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${Math.round(q.left)}-${Math.round(q.right)}`)
    }
    return { sw: document.documentElement.scrollWidth, W, fora: fora.slice(0, 6), h1: [...document.querySelectorAll('h1')].length, altura: document.documentElement.scrollHeight }
  })
  console.log(w, JSON.stringify(r))
}
await b.close()
