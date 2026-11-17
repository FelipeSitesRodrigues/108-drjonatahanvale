// Lenis: carrega no computador, a rodinha rola com inércia, âncora do menu para no lugar e
// não carrega no celular
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:3418/', { waitUntil: 'networkidle0' })
await new Promise((ok) => setTimeout(ok, 3000))
const r = { lenis: await p.evaluate(() => !!window.lenis && document.documentElement.className) }
await p.mouse.move(700, 450)
await p.mouse.wheel({ deltaY: 600 })
const ys = []
for (let i = 0; i < 8; i++) { await new Promise((ok) => setTimeout(ok, 80)); ys.push(Math.round(await p.evaluate(() => scrollY))) }
r.rodinha = ys.join(' ')
await p.click('.topo__nav a[href="#duvidas"]')
await new Promise((ok) => setTimeout(ok, 2500))
r.ancoraDuvidas = await p.$eval('#duvidas', (s) => Math.round(s.getBoundingClientRect().top))
await p.click('.topo__nav a[href="#areas"]')
await new Promise((ok) => setTimeout(ok, 2500))
r.ancoraAreas = await p.$eval('#areas', (s) => Math.round(s.getBoundingClientRect().top))
const c = await b.newPage()
await c.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await c.goto('http://localhost:3418/', { waitUntil: 'networkidle0' })
await new Promise((ok) => setTimeout(ok, 3000))
r.celular = await c.evaluate(() => !!window.lenis)
console.log(JSON.stringify(r))
await b.close()
