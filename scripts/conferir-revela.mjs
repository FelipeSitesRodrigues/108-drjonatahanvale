// rola a página inteira com movimento ligado e confere se tudo que entra animado terminou visível
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
const erros = []
p.on('pageerror', (e) => erros.push(e.message))
p.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await p.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 })
  await p.goto('http://localhost:3418/', { waitUntil: 'networkidle2' })
  const alt = await p.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < alt; y += h * 0.6) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await new Promise((r) => setTimeout(r, 120)) }
  await new Promise((r) => setTimeout(r, 2500))
  const r = await p.evaluate(() => {
    const faltam = [...document.querySelectorAll('[data-revela]:not(.visivel)')].map((e) => e.className || e.tagName)
    const borrados = [...document.querySelectorAll('[data-revela]')].filter((e) => getComputedStyle(e).filter !== 'none').length
    const transp = [...document.querySelectorAll('[data-revela], [data-palavras] .pc')].filter((e) => +getComputedStyle(e).opacity < 0.99).length
    return { total: document.querySelectorAll('[data-revela]').length, faltam, borrados, transp, topo: document.getElementById('topo').className, flutuante: document.querySelector('.flutuante').className }
  })
  console.log(w, JSON.stringify(r))
}
console.log('erros:', erros)
await b.close()
